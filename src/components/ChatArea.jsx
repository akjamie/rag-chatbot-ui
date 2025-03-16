import {useEffect, useRef, useState} from 'react';
import {Alert, Avatar, Box, Button, IconButton, Paper, Snackbar, TextField, Typography, Link} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {getChatHistory, sendChatQuery, updateMessageLike} from '../services/api';
import {keyframes, styled} from '@mui/material/styles';
import UserAvatar from './UserAvatar';
import RefreshIcon from '@mui/icons-material/Refresh';

const typingAnimation = keyframes`
  0% { opacity: .2; }
  20% { opacity: 1; }
  100% { opacity: .2; }
`;

// Create a styled wrapper component instead
const StyledChatArea = styled(Box)(({ theme }) => ({
  '& .typing-dot': {
    animation: `${typingAnimation} 1.4s infinite`,
    '&:nth-of-type(2)': {
      animationDelay: '.2s',
    },
    '&:nth-of-type(3)': {
      animationDelay: '.4s',
    }
  }
}));

function ChatArea({ selectedChat, onNewSession, user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [currentSession, setCurrentSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'error'
  });

  // Debug log for selectedChat
  useEffect(() => {
    console.log('Selected chat changed:', selectedChat);
  }, [selectedChat]);

  // Debug current session changes
  useEffect(() => {
    console.log('Current session updated:', currentSession);
  }, [currentSession]);

  // Watch for selectedChat changes or deletion
  useEffect(() => {
    if (selectedChat === null) {
      // Clear messages when no chat is selected or chat is deleted
      setMessages([]);
      setInput('');
      setCurrentSession(null);
    } else if (selectedChat?.session_id?.trim()) {
      setMessages([]);  // Clear previous messages
      setInput('');
      setCurrentSession({
        session_id: selectedChat.session_id,
        user_id: user.id
      });
      loadChatHistory(selectedChat.session_id);
    }
  }, [selectedChat, user.id]);

  const loadChatHistory = async (chatSessionId) => {
    if (!chatSessionId?.trim()) return;
    
    try {
      setIsLoading(true);
      const history = await getChatHistory(chatSessionId);
      
      if (history?.messages) {
        const formattedMessages = history.messages.map(msg => {
          try {
            let parsed;
            if (typeof msg.response === 'string') {
              // Clean up the string before parsing
              const cleanedString = msg.response
                .replace(/\\n/g, '\n')  // Convert escaped newlines to actual newlines
                .replace(/\\'/g, "'")   // Convert escaped single quotes
                .replace(/'/g, '"');    // Convert single quotes to double quotes for JSON parsing

              try {
                parsed = JSON.parse(cleanedString);
              } catch (parseError) {
                console.error('Error parsing cleaned response:', parseError);
                // If parsing fails, try to evaluate as a JavaScript object
                try {
                  // Using Function to safely evaluate the string as a JavaScript object
                  parsed = Function(`'use strict'; return (${msg.response})`)();
                } catch (evalError) {
                  console.error('Error evaluating response:', evalError);
                  parsed = {
                    answer: msg.response,
                    suggested_questions: [],
                    citations: []
                  };
                }
              }
            } else {
              // Response is already an object
              parsed = msg.response;
            }
            
            return {
              user_input: msg.user_input,
              response: parsed.answer,
              request_id: msg.request_id,
              session_id: chatSessionId,
              liked: msg.liked,
              suggested_questions: parsed.suggested_questions || [],
              citations: parsed.citations || [],
              output_format: parsed.metadata?.output_format || 'text'
            };
          } catch (e) {
            console.error('Error processing message:', e);
            return {
              user_input: msg.user_input,
              response: "Error parsing message. Please try refreshing the page.",
              request_id: msg.request_id,
              session_id: chatSessionId,
              liked: msg.liked,
              suggested_questions: [],
              citations: [],
              output_format: 'text'
            };
          }
        });

        setMessages(formattedMessages);
        setCurrentSession({
          session_id: chatSessionId,
          user_id: user.id
        });
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      setToast({
        open: true,
        message: 'Failed to load chat history: ' + (error.response?.data?.detail?.[0]?.msg || error.message),
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (retryMessage) => {
    if (!retryMessage && !input.trim()) return;

    const userMessage = retryMessage || input;
    if (!retryMessage) {
      setInput('');
    }

    // Generate a temporary request ID for the new message
    const tempRequestId = `temp_${Date.now()}`;

    // For retry, update existing error message, otherwise add new one
    if (retryMessage) {
      setMessages(prev => prev.map(msg => 
        msg.user_input === userMessage && msg.error // Match error message for retry
          ? { 
              ...msg, 
              response: null, 
              httpStatus: null, 
              error: false,
              request_id: tempRequestId // Add temporary request ID
            }
          : msg
      ));
    } else {
      setMessages(prev => [...prev, {
        user_input: userMessage,
        response: null,
        request_id: tempRequestId,
        session_id: currentSession?.session_id,
        error: false
      }]);
    }

    setIsLoading(true);

    try {
      const headers = {
        'X-User-Id': user.id,
        'X-Session-Id': currentSession?.session_id || ''
      };

      const response = await sendChatQuery(userMessage, headers);
      
      // Extract session ID from response if this is a new chat
      const sessionId = response.customHeaders?.['X-Session-Id'] || currentSession?.session_id;
      const responseRequestId = response.customHeaders?.['X-Request-Id'];
      
      // If this is a new chat (no current session), set up the new session
      if (!currentSession?.session_id && sessionId) {
        const newSession = {
          session_id: sessionId,
          user_id: user.id
        };
        setCurrentSession(newSession);
        if (onNewSession) {
          onNewSession(newSession);
        }
      }

      // Update message with success response
      setMessages(prev => prev.map(msg => 
        msg.request_id === tempRequestId
          ? {
              ...msg,
              response: response.data.data.answer,
              request_id: responseRequestId,
              session_id: sessionId,
              suggested_questions: response.data.data.suggested_questions || [],
              citations: response.data.data.citations || [],
              error: false,
              httpStatus: response.status || 200
            }
          : msg
      ));

    } catch (error) {
      const httpStatus = error.response?.status || 500;
      const errorMessage = error.response?.data?.detail || error.message || 'Request failed';

      // Only update the message with matching temporary request ID
      setMessages(prev => prev.map(msg =>
        msg.request_id === tempRequestId
          ? {
              ...msg,
              response: errorMessage,
              httpStatus: httpStatus,
              error: true,
              suggested_questions: [],
              citations: []
            }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question) => {
    // Add the question as a user message first
    setMessages(prev => [...prev, {
      user_input: question,
      response: null,
      request_id: null,
      session_id: currentSession?.session_id,
      error: false
    }]);
    
    // Then handle it like a new query
    handleSend(question);
  };

  const handleLike = async (messageId, liked) => {
    try {
      if (!messageId) {
        console.error('No message ID provided');
        return;
      }

      // Find the message in our messages array
      const message = messages.find(msg => msg.request_id === messageId);
      if (!message) {
        console.error('Message not found');
        return;
      }

      // Get the session ID from multiple possible sources
      const messageSessionId = message.session_id || currentSession?.session_id;
      
      if (!messageSessionId) {
        console.error('No session ID found for message');
        setToast({
          open: true,
          message: 'Unable to update like status: No session ID found',
          severity: 'error'
        });
        return;
      }

      console.log('Updating like status:', {
        sessionId: messageSessionId,
        messageId: messageId,
        liked: liked
      });

      // Call the API to update the like status
      await updateMessageLike(messageSessionId, messageId, liked);

      // Update the message in our local state
      setMessages(prev => prev.map(msg => 
        msg.request_id === messageId
          ? { ...msg, liked }
          : msg
      ));

      // Show success toast
      setToast({
        open: true,
        message: `Message ${liked ? 'liked' : 'disliked'} successfully`,
        severity: 'success'
      });

    } catch (error) {
      console.error('Error updating like status:', error);
      setToast({
        open: true,
        message: 'Failed to update like status: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    }
  };

  const renderResponse = (message) => {
    console.log('renderResponse called with:', message);
    if (!message.response) return null;

    const isError = message.error || message.httpStatus >= 400;
    console.log('Message status:', { isError, httpStatus: message.httpStatus });

    return (
      <Box sx={{ display: 'flex', mb: 2 }}>
        <Box sx={{ 
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          maxWidth: '80%'
        }}>
          <Avatar 
            sx={{ 
              bgcolor: isError ? 'error.main' : theme => theme.palette.mode === 'dark' ? '#2d2d2d' : '#f8fafc',
              color: isError ? '#fff' : theme => theme.palette.mode === 'dark' ? '#fff' : '#64748b',
              width: 32,
              height: 32,
              border: 1,
              borderColor: isError ? 'error.main' : theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
            }}
          >
            {isError ? '!' : 'AI'}
          </Avatar>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: isError
                ? theme => theme.palette.mode === 'dark' 
                  ? 'rgba(255, 0, 0, 0.1)' 
                  : 'rgba(255, 0, 0, 0.05)'
                : theme => theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.03)' 
                  : '#f8fafc',
              borderRadius: 2
            }}
          >
            {isError ? (
              <Box>
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1
                }}>
                  <Typography 
                    variant="body1" 
                    color="error.main"
                    sx={{ flex: 1, paddingTop: 0 }}
                  >
                    {message.response}
                  </Typography>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => handleSend(message.user_input)}
                    startIcon={<RefreshIcon fontSize="small" />}
                    sx={{
                      color: 'error.main',
                      minWidth: 'auto',
                      p: 0.5,
                      '&:hover': {
                        bgcolor: 'error.main',
                        color: '#fff',
                      }
                    }}
                  >
                    Retry
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.response}
                </ReactMarkdown>

                {message.citations?.length > 0 && (
                  <Box 
                    sx={{ 
                      mt: 2,
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: theme => theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.05)' 
                        : 'rgba(0, 0, 0, 0.03)',
                    }}
                  >
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block',
                        mb: 1,
                        color: 'text.secondary',
                        fontWeight: 500
                      }}
                    >
                      Citations:
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: 0.5 
                    }}>
                      {message.citations.map((citation, index) => (
                        <Link
                          key={index}
                          href={citation}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            color: 'primary.main',
                            fontSize: '0.8125rem',
                            textDecoration: 'none',
                            '&:hover': {
                              textDecoration: 'underline'
                            },
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                          }}
                        >
                          {citation}
                        </Link>
                      ))}
                    </Box>
                  </Box>
                )}

                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  <IconButton 
                    size="small"
                    onClick={() => handleLike(message.request_id, true)}
                    color={message.liked === true ? 'primary' : 'default'}
                    sx={{ 
                      padding: '4px',  // Make button smaller
                      '& .MuiSvgIcon-root': { 
                        fontSize: '0.9rem'  // Make icon smaller
                      }
                    }}
                  >
                    <ThumbUpAltIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small"
                    onClick={() => handleLike(message.request_id, false)}
                    color={message.liked === false ? 'primary' : 'default'}
                    sx={{ 
                      padding: '4px',  // Make button smaller
                      '& .MuiSvgIcon-root': { 
                        fontSize: '0.9rem'  // Make icon smaller
                      }
                    }}
                  >
                    <ThumbDownAltIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    );
  };

  const handleCloseToast = (event, reason) => {
    if (reason === 'clickaway') return;
    setToast(prev => ({ ...prev, open: false }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      handleSend();
    }
  };

  // Improved scroll to bottom function
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  };

  // Scroll on new messages or loading state changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();  // Prevent default to avoid new line
      if (input.trim()) {
        handleSend();
      }
    }
  };

  // Add logging when messages state updates
  useEffect(() => {
    console.log('Messages updated:', messages);
  }, [messages]);

  return (
    <StyledChatArea sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100%',
      bgcolor: 'background.chat',
      position: 'relative'
    }}>
      <Box 
        ref={messagesContainerRef}
        sx={{ 
          flexGrow: 1, 
          overflow: 'auto',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme => theme.palette.mode === 'dark' ? '#4b5563' : '#cbd5e1',
            borderRadius: '3px',
          }
        }}
      >
        {messages.map((message, index) => (
          <Box key={index}>
            {/* User Message */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                mb: 2,
                ml: '40px'  // Add left margin to align with AI response
              }}
            >
              <Box sx={{ 
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
                maxWidth: '80%'
              }}>
                <UserAvatar 
                  name={user?.name || 'User'} 
                  sx={{ 
                    width: 32,
                    height: 32,
                    marginLeft: '-40px'  // Pull avatar back to maintain alignment
                  }} 
                />
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: theme => theme.palette.mode === 'dark' 
                      ? 'rgba(37, 99, 235, 0.1)'
                      : 'rgba(37, 99, 235, 0.05)',
                    color: 'text.primary',
                    borderRadius: 2
                  }}
                >
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      px: 1,  // Add horizontal padding
                      pl: 0
                    }}
                  >
                    {message.user_input}
                  </Typography>
                </Paper>
              </Box>
            </Box>

            {/* AI Response */}
            {message.response && renderResponse(message)}

            {/* Suggested Questions */}
            {message.suggested_questions?.length > 0 && (
              <Box sx={{ 
                display: 'flex', 
                gap: 1, 
                flexWrap: 'wrap', 
                ml: 7,
                mb: 2,
                maxWidth: '80%'
              }}>
                {message.suggested_questions.map((question, idx) => (
                  <Button 
                    key={idx}
                    variant="outlined"
                    size="small"
                    onClick={() => handleSuggestedQuestion(question)}
                    sx={{
                      borderRadius: '12px',
                      borderColor: theme => theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.08)' 
                        : 'rgba(0, 0, 0, 0.08)',
                      color: 'text.secondary',
                      bgcolor: theme => theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.02)' 
                        : 'rgba(0, 0, 0, 0.01)',
                      '&:hover': {
                        bgcolor: theme => theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.05)' 
                          : 'rgba(0, 0, 0, 0.03)',
                        borderColor: 'primary.main'
                      },
                      textTransform: 'none',
                      fontSize: '0.8125rem',
                      py: 0.25,
                      px: 1,
                      minHeight: '24px',
                      lineHeight: 1.2
                    }}
                  >
                    {question}
                  </Button>
                ))}
              </Box>
            )}
          </Box>
        ))}

        {/* Show loading indicator after the last message */}
        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: theme => theme.palette.mode === 'dark' ? '#2d2d2d' : '#f8fafc',
                color: theme => theme.palette.mode === 'dark' ? '#fff' : '#64748b',
                width: 32,
                height: 32,
                border: 1,
                borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
              }}
            >
              AI
            </Avatar>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: theme => theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.03)' 
                  : '#f8fafc',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Typography color="text.secondary">AI is thinking</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <span className="typing-dot">.</span>
                <span className="typing-dot">.</span>
                <span className="typing-dot">.</span>
              </Box>
            </Paper>
          </Box>
        )}

        <div ref={messagesEndRef} style={{ height: 1 }} />
      </Box>

      <Box 
        component="form" 
        onSubmit={handleSubmit}
        sx={{ 
          p: 2, 
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '16px',
              bgcolor: theme => theme.palette.mode === 'dark' ? 'background.paper' : '#ffffff',
              '& fieldset': {
                borderColor: theme => theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.12)' 
                  : 'rgba(0, 0, 0, 0.12)',
              },
              '&:hover fieldset': {
                borderColor: 'primary.main'
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main'
              }
            },
            '& .MuiInputBase-input': {
              px: 2,
              py: 1.5
            }
          }}
          InputProps={{
            endAdornment: (
              <Box sx={{ display: 'flex', gap: 1, mr: 1 }}>
                <IconButton 
                  type="submit" 
                  disabled={!input.trim() || isLoading}
                  sx={{ 
                    bgcolor: 'primary.main',
                    color: '#ffffff',
                    '&:hover': {
                      bgcolor: 'primary.dark'
                    },
                    '&.Mui-disabled': {
                      bgcolor: theme => theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.12)' 
                        : 'rgba(0, 0, 0, 0.12)',
                      color: theme => theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.3)' 
                        : 'rgba(0, 0, 0, 0.3)'
                    }
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            )
          }}
        />
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          position: 'absolute',
          top: '24px !important',
          left: '50% !important',
          transform: 'translateX(-50%)',
          width: 'auto',
          maxWidth: '80%'
        }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          variant="filled"
          elevation={6}
          sx={{
            width: '100%',
            minWidth: '300px',
            borderRadius: '8px',
            boxShadow: theme => theme.palette.mode === 'dark'
              ? '0 4px 12px rgba(0, 0, 0, 0.5)'
              : '0 4px 12px rgba(0, 0, 0, 0.15)',
            '& .MuiAlert-icon': {
              fontSize: '20px'
            },
            '& .MuiAlert-message': {
              fontSize: '0.9375rem',
              padding: '2px 0'
            },
            '& .MuiAlert-action': {
              padding: '0 0px'
            }
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </StyledChatArea>
  );
}

export default ChatArea; 