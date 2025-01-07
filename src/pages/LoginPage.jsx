import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert
} from '@mui/material';

function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Dummy login - in real app this would call an API
    const dummyUser = {
      id: '123',
      name: 'Test User',
      email: 'test@example.com'
    };

    try {
      localStorage.setItem('user', JSON.stringify(dummyUser));
      // Refresh the page to trigger App's user check
      window.location.reload();
    } catch (error) {
      setError('Failed to log in');
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5'
      }}
    >
      <Paper
        component="form"
        onSubmit={handleLogin}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Login
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          label="Email"
          defaultValue="test@example.com"
          disabled
          fullWidth
        />

        <TextField
          label="Password"
          type="password"
          defaultValue="password"
          disabled
          fullWidth
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            mt: 2,
            backgroundColor: '#ff1e1e !important',
            '&:hover': {
              backgroundColor: '#e01919 !important'
            }
          }}
        >
          Login
        </Button>

        <Typography variant="body2" color="text.secondary" align="center">
          This is a demo login page. Click Login to continue.
        </Typography>
      </Paper>
    </Box>
  );
}

export default LoginPage; 