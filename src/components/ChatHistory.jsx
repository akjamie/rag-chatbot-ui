import React from 'react';
import { List, ListItem, ListItemText, IconButton, Box, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { deleteChatHistory } from '../services/api.js';

function ChatHistory({ histories, onSelectChat, onDeleteHistory, currentSession, onNewChat }) {
  const handleDelete = async (userId, sessionId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat history?')) {
      try {
        await deleteChatHistory(userId, sessionId);
        onDeleteHistory();
      } catch (error) {
        console.error('Error deleting chat history:', error);
      }
    }
  };

  return (
    <Box 
      sx={{ 
        height: '100%', 
        width: '250px', 
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#1a1a1a'
      }}
    >
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onNewChat}
        sx={{
          m: 2,
          bgcolor: '#ff4141',
          '&:hover': {
            bgcolor: '#ff6060',
          }
        }}
      >
        New Chat
      </Button>
      <List sx={{ overflow: 'auto', flexGrow: 1 }}>
        {histories.map((history) => (
          <ListItem 
            key={history.session_id}
            onClick={() => onSelectChat(history)}
            sx={{ 
              cursor: 'pointer',
              bgcolor: currentSession?.session_id === history.session_id ? 'rgba(255, 65, 65, 0.1)' : 'inherit',
              '&:hover': {
                bgcolor: 'rgba(255, 65, 65, 0.05)',
              }
            }}
            secondaryAction={
              <IconButton 
                edge="end" 
                onClick={(e) => handleDelete(history.user_id, history.session_id, e)}
                sx={{ 
                  color: 'grey.500',
                  '&:hover': {
                    color: '#ff4141'
                  }
                }}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText 
              primary={history.title}
              primaryTypographyProps={{
                noWrap: true,
                sx: { fontSize: '0.9rem' }
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default ChatHistory; 