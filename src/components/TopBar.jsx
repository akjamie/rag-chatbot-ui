import { AppBar, Toolbar, Typography, IconButton, Avatar, Button } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from 'react-router-dom';

function TopBar({ user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        backgroundColor: '#1a1a1a'
      }}
    >
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          AI Chatbot
        </Typography>
        <IconButton 
          color="inherit" 
          onClick={() => navigate('/settings')}
          sx={{ mr: 2 }}
        >
          <SettingsIcon />
        </IconButton>
        <Avatar 
          src={user?.imageUrl} 
          alt={user?.name}
          sx={{ width: 32, height: 32, mr: 1 }}
        />
        <Typography variant="body1" sx={{ mr: 2 }}>
          {user?.name}
        </Typography>
        <Button 
          color="inherit" 
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar; 