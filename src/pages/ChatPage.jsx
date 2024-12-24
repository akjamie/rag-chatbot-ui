import { useState, useEffect } from 'react';
import { Box, Grid } from '@mui/material';
import ChatHistory from '../components/ChatHistory';
import ChatArea from '../components/ChatArea';
import { getChatHistories } from '../services/api';

function ChatPage({ user }) {
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

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex' }}>
      <Grid container sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <Grid item xs={3}>
          <ChatHistory 
            histories={chatHistories}
            onSelectChat={setSelectedChat}
            onDeleteHistory={loadChatHistories}
            currentSession={currentSession}
          />
        </Grid>
        <Grid item xs={9}>
          <ChatArea 
            selectedChat={selectedChat}
            user={user}
            onNewSession={setCurrentSession}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default ChatPage; 