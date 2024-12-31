import React, { useEffect, useState } from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Box, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Snackbar,
  Alert,
  Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { deleteChatHistory } from '../services/api.js';

function ChatHistory({ histories, onSelectChat, onDeleteHistory, currentSession, onNewChat }) {
  const [deleteDialog, setDeleteDialog] = useState({ open: false, sessionId: null });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const interval = setInterval(() => {
      onDeleteHistory();
    }, 15000);

    return () => clearInterval(interval);
  }, [onDeleteHistory]);

  const handleDeleteClick = (e, sessionId) => {
    e.stopPropagation();
    setDeleteDialog({ open: true, sessionId });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteChatHistory(deleteDialog.sessionId);
      setDeleteDialog({ open: false, sessionId: null });
      setToast({ 
        open: true, 
        message: 'Chat session deleted successfully', 
        severity: 'success' 
      });
      onDeleteHistory();
    } catch (error) {
      console.error('Error deleting chat history:', error);
      setToast({ 
        open: true, 
        message: 'Failed to delete chat session', 
        severity: 'error' 
      });
    }
  };

  const handleCloseDialog = () => {
    setDeleteDialog({ open: false, sessionId: null });
  };

  const handleCloseToast = (event, reason) => {
    if (reason === 'clickaway') return;
    setToast({ ...toast, open: false });
  };

  const handleSelectChat = (history) => {
    console.log('Selecting chat:', history);
    if (history?.session_id?.trim()) {
      onSelectChat(history);
    } else {
      console.error('Invalid session_id:', history);
    }
  };

  return (
    <Box 
      sx={{ 
        height: '100%', 
        width: '250px', 
        display: 'flex',
        flexDirection: 'column',
        bgcolor: theme => theme.palette.mode === 'dark' ? '#1a1a1a' : '#f8f8f8',
        borderRight: 1,
        borderColor: 'divider'
      }}
    >
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onNewChat}
        sx={{
          m: 2,
          bgcolor: 'primary.main',
          '&:hover': {
            bgcolor: 'primary.dark',
          }
        }}
      >
        New Chat
      </Button>
      <List sx={{ overflow: 'auto', flexGrow: 1 }}>
        {histories.map((history) => (
          <ListItem 
            key={history.session_id}
            component="div"
            onClick={() => {
              console.log('ListItem clicked:', history);
              handleSelectChat(history);
            }}
            selected={currentSession?.session_id === history.session_id}
            sx={{ 
              cursor: 'pointer',
              bgcolor: currentSession?.session_id === history.session_id 
                ? theme => theme.palette.mode === 'dark' 
                  ? 'rgba(255, 65, 65, 0.1)' 
                  : 'rgba(255, 65, 65, 0.05)'
                : 'inherit',
              '&:hover': {
                bgcolor: theme => theme.palette.mode === 'dark'
                  ? 'rgba(255, 65, 65, 0.05)'
                  : 'rgba(255, 65, 65, 0.02)',
              },
              position: 'relative',
              '& .MuiIconButton-root': {
                display: 'none'
              },
              '&:hover .MuiIconButton-root': {
                display: 'inline-flex'
              }
            }}
            secondaryAction={
              <IconButton 
                edge="end" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(e, history.session_id);
                }}
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main'
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
                sx: { 
                  fontSize: '0.9rem',
                  color: 'text.primary'
                }
              }}
            />
          </ListItem>
        ))}
      </List>

      {/* Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleCloseDialog}
        aria-labelledby="delete-dialog-title"
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            color: 'text.primary'
          }
        }}
      >
        <DialogTitle 
          id="delete-dialog-title"
          sx={{ color: 'text.primary' }}
        >
          Delete Chat Session
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'text.primary' }}>
            Are you sure you want to delete this chat session? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog} 
            sx={{ color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar 
        open={toast.open} 
        autoHideDuration={6000} 
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseToast} 
          severity={toast.severity}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ChatHistory; 