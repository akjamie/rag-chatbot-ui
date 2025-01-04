import { useState, useEffect } from 'react';
import { Box, Grid, IconButton } from '@mui/material';
import ChatHistory from '../components/ChatHistory';
import ChatArea from '../components/ChatArea';
import { getChatHistories } from '../services/api';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

function ChatPage({ user }) {
  const [chatHistories, setChatHistories] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const loadChatHistories = async () => {
    try {
      const response = await getChatHistories(user.id);
      setChatHistories(response.sessions || []);
    } catch (error) {
      console.error('Error loading chat histories:', error);
      setChatHistories([]);
    }
  };

  useEffect(() => {
    loadChatHistories();
  }, [user.id]);

  const handleNewChat = () => {
    setSelectedChat(null);
    setCurrentSession(null);
  };

  return (
    <Box sx={{ 
      height: 'calc(100vh - 64px)', 
      display: 'flex',
      overflow: 'hidden',
      position: 'relative',
      bgcolor: theme => theme.palette.background.default
    }}>
      <Box
        sx={{
          width: sidebarOpen ? '280px' : '0px',
          transition: 'all 0.3s ease',
          borderRight: '1px solid',
          borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
          height: '100%',
          overflow: 'hidden',
          flexShrink: 0,
          position: 'relative',
          bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(45, 45, 45, 0.8)' : '#ffffff',
          backdropFilter: 'blur(8px)',
          boxShadow: theme => theme.palette.mode === 'dark' 
            ? 'inset -1px 0 0 0 rgba(255, 255, 255, 0.1)'
            : 'inset -1px 0 0 0 rgba(0, 0, 0, 0.1)',
        }}
      >
        <Box sx={{ 
          width: '280px',
          height: '100%',
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme => theme.palette.mode === 'dark' ? '#4b5563' : '#cbd5e1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: theme => theme.palette.mode === 'dark' ? '#6b7280' : '#94a3b8',
          },
        }}>
          <ChatHistory 
            histories={chatHistories}
            onSelectChat={setSelectedChat}
            onDeleteHistory={loadChatHistories}
            currentSession={currentSession}
            onNewChat={handleNewChat}
          />
        </Box>
      </Box>

      <IconButton
        onClick={() => setSidebarOpen(!sidebarOpen)}
        sx={{
          position: 'absolute',
          left: sidebarOpen ? '260px' : '0px',
          top: '50%',
          transform: 'translateY(-50%)',
          bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(45, 45, 45, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          border: '1px solid',
          borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
          transition: 'all 0.3s ease',
          zIndex: 1,
          width: '24px',
          height: '24px',
          '&:hover': {
            bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(55, 55, 55, 0.9)' : 'rgba(245, 245, 245, 0.9)',
          },
          boxShadow: theme => theme.palette.mode === 'dark' 
            ? '0 0 10px rgba(0, 0, 0, 0.3)'
            : '0 0 10px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {sidebarOpen ? <ChevronLeftIcon sx={{ fontSize: 18 }} /> : <ChevronRightIcon sx={{ fontSize: 18 }} />}
      </IconButton>

      <Box 
        sx={{ 
          flexGrow: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          bgcolor: theme => theme.palette.mode === 'dark' ? '#1a1a1a' : '#f8fafc',
          transition: 'all 0.3s ease',
        }}
      >
        <ChatArea 
          selectedChat={selectedChat}
          user={user}
          onNewSession={setCurrentSession}
        />
      </Box>
    </Box>
  );
}

export default ChatPage; 