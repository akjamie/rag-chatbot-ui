import { Box, CircularProgress, Avatar, Paper } from '@mui/material';

function LoadingMessage() {
  return (
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
          borderColor: theme => theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.12)' 
            : 'rgba(0, 0, 0, 0.12)'
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
          borderRadius: 2,
          minWidth: 60,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <CircularProgress size={20} />
      </Paper>
    </Box>
  );
}

export default LoadingMessage; 