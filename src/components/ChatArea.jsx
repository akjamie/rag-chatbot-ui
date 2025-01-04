import { useState, useEffect, useRef } from 'react';
import { 
  Box, TextField, IconButton, Paper, Avatar, Typography,
  Button, Snackbar, Alert, TableContainer, Table, TableHead, TableBody, TableRow, TableCell
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ImageIcon from '@mui/icons-material/Image';
import ClearIcon from '@mui/icons-material/Clear';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  getChatHistory, 
  sendChatQuery, 
  updateMessageLike
} from '../services/api';
import LoadingMessage from './LoadingMessage';
import { alpha } from '@mui/material/styles';
import UserAvatar from './UserAvatar';

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

  // Handle chat selection or new chat
  useEffect(() => {
    if (selectedChat === null) {
      console.log('Selected chat is null, clearing messages and input');
      // For new chat, only clear messages and input
      setMessages([]);
      setInput('');
      setCurrentSession(null);
      // Do NOT reset currentSession here
    } else if (selectedChat?.session_id?.trim()) {
      // For existing chat, set everything
      setMessages([]);
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
            if (typeof msg.response === 'string') {
              // First evaluate the string as a JavaScript object literal
              // This handles the single-quoted string format safely
              const parsed = eval(`(${msg.response})`);
              
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
            }
            
            // Handle case where response is already an object
            return {
              user_input: msg.user_input,
              response: msg.response.answer || msg.response,
              request_id: msg.request_id,
              session_id: chatSessionId,
              liked: msg.liked,
              suggested_questions: msg.response.suggested_questions || [],
              citations: msg.response.citations || [],
              output_format: msg.response.metadata?.output_format || 'text'
            };
          } catch (e) {
            console.error('Error parsing message:', e);
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

  const handleSend = async (questionText = input.trim()) => {
    if (!questionText || !user?.id || isLoading) return;

    setInput('');
    setIsLoading(true);

    try {
      const headers = {
        'X-User-Id': user.id
      };

      if (currentSession?.session_id) {
        headers['X-Session-Id'] = currentSession.session_id;
      }

      const response = await sendChatQuery(questionText, headers);
      
      // Try to get session ID from multiple sources
      const responseSessionId = 
        response.headers?.['x-session-id'] || 
        response.headers?.['X-Session-Id'] ||
        response.config?.headers?.['x-session-id'] ||
        response.request?.getResponseHeader?.('X-Session-Id');

      console.log('Response details:', {
        headers: response.headers,
        configHeaders: response.config.headers,
        customHeaders: response.customHeaders,
        sessionId: responseSessionId
      });

      if (!currentSession?.session_id && responseSessionId) {
        const newSession = {
          session_id: responseSessionId,
          user_id: user.id
        };
        setCurrentSession(newSession);
        
        onNewSession({
          session_id: responseSessionId,
          user_id: user.id,
          title: questionText
        });
      }

      // Add message to UI immediately
      const newMessage = {
        user_input: questionText,
        response: null,
        request_id: null,
        session_id: currentSession?.session_id
      };
      setMessages(prev => [...prev, newMessage]);

      // Update message with response
      setMessages(prev => prev.map(msg => 
        msg.user_input === questionText && !msg.response
          ? {
              ...msg,
              response: response.data.data?.answer || response.data.answer,
              request_id: response.headers['X-Request-Id'],
              session_id: currentSession?.session_id || responseSessionId,
              suggested_questions: response.data.data?.suggested_questions || response.data.suggested_questions || [],
              citations: response.data.data?.citations || response.data.citations || [],
              output_format: response.data.data?.metadata?.output_format || response.data.metadata?.output_format || 'text'
            }
          : msg
      ));

    } catch (error) {
      console.error('Error sending chat query:', error);
      setMessages(prev => prev.filter(msg => msg.user_input !== questionText));
      setToast({
        open: true,
        message: 'Failed to send message: ' + (error.response?.data?.detail?.[0]?.msg || error.message),
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question) => {
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
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'flex-end',
        mt: 2
      }}>
        <Box sx={{ 
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          width: '100%',
          justifyContent: 'flex-end'
        }}>
          <Box sx={{ 
            bgcolor: 'background.message.ai',
            p: 2.5,
            borderRadius: 2,
            maxWidth: '80%'
          }}>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                // Basic text elements
                p: ({node, ...props}) => <Typography {...props} paragraph />,
                h1: ({node, ...props}) => <Typography variant="h4" {...props} gutterBottom />,
                h2: ({node, ...props}) => <Typography variant="h5" {...props} gutterBottom />,
                h3: ({node, ...props}) => <Typography variant="h6" {...props} gutterBottom />,
                
                // Code blocks
                pre: ({node, ...props}) => (
                  <Box sx={{ 
                    bgcolor: theme => theme.palette.mode === 'dark' ? alpha('#ffffff', 0.05) : '#f5f5f5',
                    p: 2,
                    borderRadius: 1,
                    overflow: 'auto',
                    my: 2
                  }}>
                    <pre style={{ margin: 0 }} {...props} />
                  </Box>
                ),
                code: ({node, inline, ...props}) => (
                  inline ? 
                    <Typography 
                      component="code"
                      sx={{ 
                        bgcolor: theme => theme.palette.mode === 'dark' ? alpha('#ffffff', 0.1) : '#f5f5f5',
                        px: 0.5,
                        py: 0.25,
                        borderRadius: 0.5,
                        fontFamily: 'monospace'
                      }}
                      {...props} 
                    /> :
                    <code style={{ fontFamily: 'monospace' }} {...props} />
                ),

                // Lists
                ul: ({node, ...props}) => (
                  <Box component="ul" sx={{ pl: 2, my: 1 }} {...props} />
                ),
                ol: ({node, ...props}) => (
                  <Box component="ol" sx={{ pl: 2, my: 1 }} {...props} />
                ),
                li: ({node, ...props}) => (
                  <Box component="li" sx={{ my: 0.5 }} {...props} />
                ),

                // Tables
                table: ({node, ...props}) => (
                  <TableContainer component={Paper} sx={{ my: 2 }}>
                    <Table size="small" {...props} />
                  </TableContainer>
                ),
                thead: ({node, ...props}) => <TableHead {...props} />,
                tbody: ({node, ...props}) => <TableBody {...props} />,
                tr: ({node, ...props}) => <TableRow {...props} />,
                td: ({node, ...props}) => (
                  <TableCell 
                    {...props}
                    sx={{ 
                      borderBottom: '1px solid',
                      borderColor: 'divider'
                    }} 
                  />
                ),
                th: ({node, ...props}) => (
                  <TableCell 
                    component="th"
                    {...props}
                    sx={{ 
                      fontWeight: 'bold',
                      borderBottom: '2px solid',
                      borderColor: 'divider',
                      bgcolor: theme => theme.palette.mode === 'dark' ? alpha('#ffffff', 0.05) : '#f5f5f5'
                    }} 
                  />
                ),
              }}
            >
              {message.response}
            </ReactMarkdown>

            {/* Citations */}
            {message.citations?.length > 0 && (
              <Typography 
                variant="caption"
                sx={{ 
                  mt: 2,
                  display: 'block',
                  color: 'text.secondary'
                }}
              >
                Citations: {message.citations.join(', ')}
              </Typography>
            )}

            {/* Like/Unlike buttons */}
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              <IconButton 
                size="small"
                onClick={() => handleLike(message.request_id, true)}
                color={message.liked === true ? 'primary' : 'default'}
              >
                <ThumbUpAltIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small"
                onClick={() => handleLike(message.request_id, false)}
                color={message.liked === false ? 'primary' : 'default'}
              >
                <ThumbDownAltIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
            AI
          </Avatar>
        </Box>

        {/* Suggested questions */}
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

  return (
    <Box sx={{ 
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
                mb: 2
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
                    width: 32,  // Match AI avatar size
                    height: 32  // Match AI avatar size
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
                      px: 1  // Add horizontal padding
                    }}
                  >
                    {message.user_input}
                  </Typography>
                </Paper>
              </Box>
            </Box>

            {/* AI Response */}
            {message.response && (
              <Box sx={{ 
                display: 'flex',
                mb: 2
              }}>
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  maxWidth: '80%'
                }}>
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
                      borderRadius: 2
                    }}
                  >
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({node, ...props}) => (
                          <Typography 
                            variant="body1" 
                            sx={{                               
                              my: 1,
                              px: 1,  // Add horizontal padding
                              '&:first-of-type': { mt: 0 },
                              '&:last-child': { mb: 0 }
                            }} 
                            {...props} 
                          />
                        ),
                        ul: ({node, ...props}) => (
                          <Box 
                            component="ul" 
                            sx={{ 
                              pl: 4,  // Increase left padding for lists
                              my: 1,
                              '& li': {
                                pl: 1  // Add padding for list items
                              }
                            }} 
                            {...props} 
                          />
                        ),
                        ol: ({node, ...props}) => (
                          <Box 
                            component="ol" 
                            sx={{ 
                              pl: 4,  // Increase left padding for lists
                              my: 1,
                              '& li': {
                                pl: 1  // Add padding for list items
                              }
                            }} 
                            {...props} 
                          />
                        ),
                        // ... other markdown components remain the same ...
                      }}
                    >
                      {message.response}
                    </ReactMarkdown>

                    {/* Citations */}
                    {message.citations?.length > 0 && (
                      <Typography 
                        variant="caption"
                        sx={{ 
                          mt: 2,
                          display: 'block',
                          color: 'text.secondary'
                        }}
                      >
                        Citations: {message.citations.join(', ')}
                      </Typography>
                    )}

                    {/* Like/Unlike buttons */}
                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                      <IconButton 
                        size="small"
                        onClick={() => handleLike(message.request_id, true)}
                        color={message.liked === true ? 'primary' : 'default'}
                      >
                        <ThumbUpAltIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small"
                        onClick={() => handleLike(message.request_id, false)}
                        color={message.liked === false ? 'primary' : 'default'}
                      >
                        <ThumbDownAltIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Paper>
                </Box>
              </Box>
            )}

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
        {isLoading && (
          <Box sx={{ 
            display: 'flex',
            mb: 2
          }}>
            <LoadingMessage />
          </Box>
        )}
        <div ref={messagesEndRef} style={{ height: 1 }} /> {/* Invisible element for scrolling */}
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
              padding: '4px 0'
            },
            '& .MuiAlert-action': {
              padding: '0 8px'
            }
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ChatArea; 