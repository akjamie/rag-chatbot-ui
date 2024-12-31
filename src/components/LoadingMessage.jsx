import { Box, CircularProgress, Typography } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';

function LoadingMessage() {
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 2,
      color: 'text.secondary',
      p: 2
    }}>
      <SmartToyIcon sx={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
      <Typography variant="body2">AI is thinking...</Typography>
      <CircularProgress size={16} thickness={4} sx={{ color: 'primary.main' }} />
    </Box>
  );
}

export default LoadingMessage; 