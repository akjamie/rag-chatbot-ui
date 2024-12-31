import { useState, useEffect } from 'react';
import { Box, Grid } from '@mui/material';
import ChatHistory from './ChatHistory';
import ChatArea from './ChatArea';
import TopBar from './TopBar';
import { getChatHistories } from '../services/api';

function ChatInterface() {
  const [chatHistories, setChatHistories] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  useEffect(() => {
    if (user) {  // Only load histories if we have a user
      loadChatHistories();
    }
  }, [user]);

  const loadChatHistories = async () => {
    try {
      const histories = await getChatHistories();
      setChatHistories(histories);
    } catch (error) {
      console.error('Error loading chat histories:', error);
    }
  };

  const handleSelectChat = (history) => {
    setSelectedChat(history);
    setCurrentSession(history); // Update current session when selecting a chat
  };

  const handleNewChat = () => {
    setSelectedChat(null);  // Clear selected chat
    setCurrentSession(null); // Clear current session
  };

  const handleNewSession = (session) => {
    // Update current session and selected chat with the new session
    setCurrentSession(session);
    setSelectedChat(session);
    // Also update chat histories when a new session is created
    loadChatHistories();
  };

  const handleDeleteHistory = async () => {
    try {
      const histories = await getChatHistories();
      setChatHistories(histories);
      
      // If the deleted session was the current session, clear it
      if (selectedChat && !histories.find(h => h.session_id === selectedChat.session_id)) {
        setSelectedChat(null);
        setCurrentSession(null);
      }
    } catch (error) {
      console.error('Error loading chat histories:', error);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <TopBar user={user} />
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        <ChatHistory 
          histories={chatHistories}
          onSelectChat={handleSelectChat}
          onDeleteHistory={handleDeleteHistory}
          currentSession={currentSession}
          onNewChat={handleNewChat}
        />
        <Box sx={{ flexGrow: 1 }}>
          <ChatArea 
            selectedChat={selectedChat}
            user={user}
            onNewSession={handleNewSession}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default ChatInterface; 