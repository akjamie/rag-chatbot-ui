import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Avatar, 
  Button,
  Switch,
  Box,
  Tooltip
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SettingsIcon from '@mui/icons-material/Settings';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

function TopBar({ user }) {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

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
        backgroundColor: theme => theme.palette.mode === 'dark' ? '#1a1a1a' : '#ffffff',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
            fontWeight: 500
          }}
        >
          AI Chatbot
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}>
            <IconButton 
              color="inherit" 
              onClick={toggleTheme}
              sx={{ 
                color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#666666',
              }}
            >
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Settings">
            <IconButton 
              color="inherit" 
              onClick={() => navigate('/settings')}
              sx={{ 
                color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#666666',
              }}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>

          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              ml: 2,
              pl: 2,
              borderLeft: 1,
              borderColor: 'divider'
            }}
          >
            <Avatar 
              src={user?.imageUrl} 
              alt={user?.name}
              sx={{ 
                width: 32, 
                height: 32,
                border: 1,
                borderColor: 'divider'
              }}
            />
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                fontWeight: 500
              }}
            >
              {user?.name}
            </Typography>
            <Button 
              variant="outlined"
              size="small"
              onClick={handleLogout}
              sx={{
                ml: 1,
                borderColor: theme => theme.palette.mode === 'dark' ? alpha('#ffffff', 0.2) : alpha('#000000', 0.2),
                color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                '&:hover': {
                  borderColor: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                  backgroundColor: theme => alpha(theme.palette.mode === 'dark' ? '#ffffff' : '#000000', 0.05)
                }
              }}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar; 