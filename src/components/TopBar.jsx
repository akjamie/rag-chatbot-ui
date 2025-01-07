import { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Box,
  Tooltip,
  Menu,
  MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsIcon from '@mui/icons-material/Settings';
import UserAvatar from './UserAvatar';

function TopBar({ user }) {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, [window.location.pathname]);

  const handleSettingsClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleManagementClick = () => {
    handleClose();
    navigate('/management');
  };

  const handleChatClick = () => {
    handleClose();
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.reload();
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
              onClick={handleSettingsClick}
              sx={{ 
                color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#666666',
              }}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            {currentPath === '/' ? (
              <MenuItem onClick={handleManagementClick}>Management Console</MenuItem>
            ) : (
              <MenuItem onClick={handleChatClick}>Chat Interface</MenuItem>
            )}
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>

          <UserAvatar name={user?.name || 'User'} />
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar; 