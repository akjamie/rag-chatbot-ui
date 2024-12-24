import { useState, useEffect } from 'react';
import { Box, Grid } from '@mui/material';
import ChatHistory from './ChatHistory';
import ChatArea from './ChatArea';
import TopBar from './TopBar';
import { getChatHistories } from '../services/api';

function ChatInterface({ user }) {
  const [chatHistories, setChatHistories] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);

  useEffect(() => {
    loadChatHistories();
  }, []);

  const loadChatHistories = async () => {
    try {
      const histories = await getChatHistories(user.id);
      setChatHistories(histories);
    } catch (error) {
      console.error('Error loading chat histories:', error);
    }
  };

  const handleNewChat = () => {
    setSelectedChat(null);
    setCurrentSession(null);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <TopBar user={user} />
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        <ChatHistory 
          histories={chatHistories}
          onSelectChat={setSelectedChat}
          onDeleteHistory={loadChatHistories}
          currentSession={currentSession}
          onNewChat={handleNewChat}
        />
        <Box sx={{ flexGrow: 1 }}>
          <ChatArea 
            selectedChat={selectedChat}
            user={user}
            onNewSession={setCurrentSession}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default ChatInterface; 