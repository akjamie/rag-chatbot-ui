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
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'error'
  });

  // Debug log for selectedChat
  useEffect(() => {
    console.log('Selected chat changed:', selectedChat);
  }, [selectedChat]);

  useEffect(() => {
    if (selectedChat?.session_id?.trim()) {
      console.log('Loading chat history for session:', selectedChat.session_id);
      setSessionId(selectedChat.session_id);
      loadChatHistory(selectedChat.session_id);
    } else {
      // Clear for new chat
      setMessages([]);
      setSessionId(null);
    }
  }, [selectedChat]);

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
        setSessionId(chatSessionId);
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
    if (!questionText || !user?.id) return;

    setInput('');
    setIsLoading(true);

    try {
      console.log('Current sessionId before sending:', sessionId);

      // Add user message immediately with current sessionId
      const newMessage = {
        user_input: questionText,
        response: null,
        request_id: null,
        session_id: sessionId
      };
      setMessages(prev => [...prev, newMessage]);

      // Prepare headers with correct header names
      const headers = {
        'X-User-Id': user.id
      };

      // Only add session-id if we have one
      if (sessionId) {
        headers['X-Session-Id'] = sessionId;
        console.log('Sending with session ID:', sessionId);
      }

      // Send query to backend with proper headers
      const response = await sendChatQuery(questionText, headers);

      // Get session ID from response headers for new chats
      const responseSessionId = sessionId || response.headers['X-Session-Id'];
      console.log('Response session ID:', responseSessionId);
      
      if (!sessionId && responseSessionId) {
        console.log('Setting new session ID:', responseSessionId);
        setSessionId(responseSessionId);
        onNewSession({
          session_id: responseSessionId,
          user_id: user.id,
          title: questionText
        });
      }

      // Update message with response - use existing sessionId if available
      setMessages(prev => prev.map(msg => 
        msg.user_input === questionText && !msg.response
          ? {
              ...msg,
              response: response.data.data?.answer || response.data.answer,
              request_id: response.headers['X-Request-Id'],
              session_id: sessionId || responseSessionId,
              suggested_questions: response.data.data?.suggested_questions || response.data.suggested_questions || [],
              citations: response.data.data?.citations || response.data.citations || [],
              output_format: response.data.data?.metadata?.output_format || response.data.metadata?.output_format || 'text'
            }
          : msg
      ));

    } catch (error) {
      console.error('Error sending chat query:', error);
      setToast({
        open: true,
        message: 'Failed to send message: ' + (error.response?.data?.detail?.[0]?.msg || error.message),
        severity: 'error'
      });
      // Remove the failed message
      setMessages(prev => prev.filter(msg => msg.user_input !== questionText));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question) => {
    handleSend(question);
  };

  const handleLike = async (messageId, liked) => {
    try {
      const message = messages.find(msg => msg.request_id === messageId);
      if (!message) {
        console.error('Message not found');
        return;
      }

      const messageSessionId = message.session_id || sessionId;
      if (!messageSessionId || !messageId) {
        console.error('Missing session_id or request_id for message', { messageSessionId, messageId });
        return;
      }

      await updateMessageLike(messageSessionId, messageId, liked);
      setMessages(prev => prev.map(msg => 
        msg.request_id === messageId
          ? { ...msg, liked }
          : msg
      ));
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
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', maxWidth: '80%' }}>
            {message.suggested_questions.map((question, idx) => (
              <Button 
                key={idx}
                variant="outlined"
                size="small"
                onClick={() => handleSuggestedQuestion(question)}
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

  const handleSendClick = () => {
    if (input.trim()) {
      handleSend();
    }
  };

  // Add a scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Add useEffect to scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
      <Paper 
        sx={{ 
          flexGrow: 1, 
          overflow: 'auto',
          bgcolor: 'background.chat',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {messages.map((message, index) => (
            <Box key={index}>
              {/* User Message */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'flex-start',
                gap: 2,
                mb: 2
              }}>
                <UserAvatar 
                  name={user?.name || 'User'}
                  sx={{ width: 32, height: 32 }}
                />
                <Box sx={{ 
                  bgcolor: 'background.message.user',
                  p: 2,
                  borderRadius: 2,
                  maxWidth: '80%'
                }}>
                  <Typography>{message.user_input}</Typography>
                </Box>
              </Box>

              {/* AI Response */}
              {message.response && renderResponse(message)}
            </Box>
          ))}
          {isLoading && <LoadingMessage />}
          {/* Add div for scrolling reference */}
          <div ref={messagesEndRef} />
        </Box>
      </Paper>

      {/* Input area */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        gap: 1,
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: theme => theme.palette.mode === 'dark' ? 'background.paper' : '#ffffff'
      }}>
        <IconButton>
          <ClearIcon sx={{ color: 'text.secondary' }} />
        </IconButton>
        <IconButton>
          <MicIcon sx={{ color: 'text.secondary' }} />
        </IconButton>
        <IconButton>
          <AttachFileIcon sx={{ color: 'text.secondary' }} />
        </IconButton>
        <IconButton>
          <ImageIcon sx={{ color: 'text.secondary' }} />
        </IconButton>
        <TextField
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="How can I help you? Type your message here..."
          variant="outlined"
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: theme => theme.palette.mode === 'dark' ? alpha('#ffffff', 0.05) : '#ffffff',
              color: 'text.primary',
              borderRadius: 2,
              padding: '5px 12px',
              '& fieldset': {
                borderColor: theme => theme.palette.mode === 'dark' ? alpha('#ffffff', 0.1) : '#e0e0e0',
                borderWidth: '1px',
              },
              '&:hover fieldset': {
                borderColor: theme => theme.palette.mode === 'dark' ? alpha('#ffffff', 0.2) : '#d0d0d0',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
                borderWidth: '1px',
              }
            },
            '& .MuiOutlinedInput-input::placeholder': {
              color: 'text.secondary',
              opacity: theme => theme.palette.mode === 'dark' ? 0.5 : 0.6
            }
          }}
        />
        <IconButton 
          onClick={handleSendClick}
          disabled={!input.trim()}
          sx={{
            '&.Mui-disabled': {
              color: 'text.disabled'
            }
          }}
        >
          <SendIcon sx={{ color: input.trim() ? 'primary.main' : 'inherit' }} />
        </IconButton>
      </Box>

      <Snackbar 
        open={toast.open} 
        autoHideDuration={6000} 
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseToast} 
          severity={toast.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            '& .MuiAlert-message': {
              display: 'block',
              wordBreak: 'break-word'
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