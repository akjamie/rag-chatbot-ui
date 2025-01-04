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

function ChatHistory({ histories = [], onSelectChat, onDeleteHistory, currentSession, onNewChat }) {
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

  const handleNewChat = () => {
    onSelectChat(null);
    if (onNewChat) {
      onNewChat();
    }
  };

  if (!Array.isArray(histories)) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="text.secondary">No chat history available</Typography>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        height: '100%', 
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      <Button
        variant="newChat"
        startIcon={<AddIcon />}
        onClick={handleNewChat}
        sx={{
          m: 2,
          bgcolor: '#ff1e1e !important',
          '&:hover': {
            bgcolor: '#e01919 !important'
          }
        }}
      >
        New Chat
      </Button>
      <List sx={{ overflow: 'auto', flexGrow: 1 }}>
        {histories.length === 0 ? (
          <ListItem>
            <ListItemText 
              primary="No chat history"
              primaryTypographyProps={{ color: 'text.secondary' }}
            />
          </ListItem>
        ) : (
          histories.map((history) => (
            <ListItem 
              key={history.session_id}
              component="div"
              onClick={() => handleSelectChat(history)}
              selected={currentSession?.session_id === history.session_id}
              sx={{ 
                cursor: 'pointer',
                '&.Mui-selected': {
                  bgcolor: theme => theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.04)',
                },
                '&:hover': {
                  bgcolor: theme => theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.04)'
                    : 'rgba(0, 0, 0, 0.02)',
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
                  sx={{ color: 'text.secondary' }}
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
          ))
        )}
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

      {/* Updated Toast Notification */}
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
          maxWidth: '80%',
          zIndex: 1400
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

export default ChatHistory; 