import { Box, Button, Typography } from '@mui/material';

function Login({ setIsAuthenticated, setUser }) {
  const handleMockLogin = () => {
    // Mock user data with consistent user_id
    const mockUser = {
      id: '005',  // Changed from user_id to id to be consistent
      name: 'Test User',
      email: 'test@example.com',
      imageUrl: 'https://ui-avatars.com/api/?name=Test+User'
    };
    
    // Store mock auth data
    localStorage.setItem('token', `mock-token-${mockUser.id}`);
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    setUser(mockUser);
    setIsAuthenticated(true);
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2
      }}
    >
      <Typography variant="h4" gutterBottom>
        Welcome to AI Chatbot
      </Typography>
      <Button 
        variant="contained" 
        color="primary"
        onClick={handleMockLogin}
      >
        Mock Login (Test User)
      </Button>
    </Box>
  );
}

export default Login; 