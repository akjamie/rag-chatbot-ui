import { useState, useEffect, useRef } from 'react';
import { Box, TextField, IconButton, Paper, Avatar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import { getChatHistory, sendChatQuery } from '../services/api';
import { v4 as uuidv4 } from 'uuid';

function ChatArea({ selectedChat, user, onNewSession }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedChat) {
      loadChatHistory(selectedChat.user_id, selectedChat.session_id);
      setSessionId(selectedChat.session_id);
    }
  }, [selectedChat]);

  const loadChatHistory = async (userId, sessionId) => {
    try {
      const history = await getChatHistory(userId, sessionId);
      setMessages(history.messages);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const currentSessionId = sessionId || uuidv4();
    const requestId = uuidv4();

    if (!sessionId) {
      setSessionId(currentSessionId);
      onNewSession({ session_id: currentSessionId, title: input });
    }

    const newMessage = {
      request_id: requestId,
      user_input: input,
      response: null
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');

    try {
      const response = await sendChatQuery({
        headers: {
          'user-id': user.id,
          'session-id': currentSessionId,
          'request-id': requestId
        },
        user_input: input
      });

      setMessages(prev => 
        prev.map(msg => 
          msg.request_id === requestId 
            ? { ...msg, response: response.response }
            : msg
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      p: 2,
      bgcolor: '#1a1a1a'
    }}>
      <Paper 
        sx={{ 
          flexGrow: 1, 
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#ffffff',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ 
          flexGrow: 1, 
          overflow: 'auto',
          p: 2,
        }}>
          {messages.map((message, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 2,
                mb: 2
              }}>
                <Avatar 
                  src={user?.imageUrl} 
                  sx={{ 
                    width: 28, 
                    height: 28
                  }}
                />
                <Box sx={{ 
                  bgcolor: '#f5f7f9',
                  p: 2, 
                  borderRadius: '16px',
                  borderTopLeftRadius: '4px',
                  maxWidth: '80%',
                  color: '#1a1a1a',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                  fontSize: '0.95rem'
                }}>
                  {message.user_input}
                </Box>
              </Box>

              {message.response && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 2,
                  flexDirection: 'row-reverse'
                }}>
                  <Avatar 
                    sx={{ 
                      width: 28,
                      height: 28,
                      bgcolor: '#ff4141'
                    }}
                  >
                    AI
                  </Avatar>
                  <Box sx={{ 
                    bgcolor: '#fff8f8',
                    p: 2, 
                    borderRadius: '16px',
                    borderTopRight: '4px',
                    maxWidth: '80%',
                    color: '#1a1a1a',
                    border: '1px solid #ffe6e6',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                    fontSize: '0.95rem'
                  }}>
                    {message.response}
                  </Box>
                </Box>
              )}
            </Box>
          ))}
        </Box>

        <Box sx={{ 
          p: 2, 
          bgcolor: '#ffffff',
          display: 'flex',
          gap: 1
        }}>
          <TextField
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="How can I help you? Type your message here..."
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#ffffff',
                color: '#000000',
                borderRadius: 2,
                padding: '5px 12px',
                '& fieldset': {
                  borderColor: '#e0e0e0',
                  borderWidth: '1px',
                },
                '&:hover fieldset': {
                  borderColor: '#d0d0d0',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#ff4141',
                  borderWidth: '1px',
                }
              },
              '& .MuiOutlinedInput-input::placeholder': {
                color: 'rgba(0, 0, 0, 0.6)'
              }
            }}
          />
          <IconButton>
            <MicIcon sx={{ color: '#666666' }} />
          </IconButton>
          <IconButton 
            onClick={handleSend} 
            sx={{ 
              bgcolor: '#ff4141',
              color: '#ffffff',
              '&:hover': {
                bgcolor: '#ff6060',
              }
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
}

export default ChatArea; 