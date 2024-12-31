import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import Settings from './components/Settings';
import Login from './components/Login';
import { ThemeProvider as MuiThemeProvider, createTheme, alpha, CssBaseline } from '@mui/material';
import { useTheme } from './contexts/ThemeContext';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const { isDarkMode } = useTheme();

  // Create theme based on dark/light mode
  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#ff4141',
        light: alpha('#ff4141', 0.8),
        dark: alpha('#ff4141', 0.9),
      },
      background: {
        default: isDarkMode ? '#1a1a1a' : '#f5f5f5',
        paper: isDarkMode ? '#1a1a1a' : '#ffffff',
        chat: isDarkMode ? '#242424' : '#ffffff',
        message: {
          user: isDarkMode ? '#2b2b2b' : '#f0f0f0',
          ai: isDarkMode ? '#302828' : '#fff8f8'
        }
      },
      text: {
        primary: isDarkMode ? '#ffffff' : '#000000',
        secondary: alpha(isDarkMode ? '#ffffff' : '#000000', 0.7),
      },
      divider: alpha(isDarkMode ? '#ffffff' : '#000000', 0.12),
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      body1: {
        fontSize: '0.95rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.43,
      },
      caption: {
        fontSize: '0.75rem',
        lineHeight: 1.66,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: alpha('#ffffff', 0.05),
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: '#242424',
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          '*::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '*::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '*::-webkit-scrollbar-thumb': {
            background: alpha('#ffffff', 0.15),
            borderRadius: '4px',
          },
          '*::-webkit-scrollbar-thumb:hover': {
            background: alpha('#ffffff', 0.25),
          },
          '@keyframes pulse': {
            '0%': {
              opacity: 0.6,
            },
            '50%': {
              opacity: 1,
            },
            '100%': {
              opacity: 0.6,
            },
          },
        },
      },
    },
  });

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (token) {
        setIsAuthenticated(true);
        const userStr = localStorage.getItem('user');
        if (userStr) {
          setUser(JSON.parse(userStr));
        }
      }
    };
    checkAuth();
  }, []);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                <Navigate to="/" /> : 
                <Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
            } 
          />
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
                <ChatInterface /> : 
                <Navigate to="/login" />
            } 
          />
          <Route 
            path="/settings" 
            element={
              isAuthenticated ? 
                <Settings /> : 
                <Navigate to="/login" />
            } 
          />
        </Routes>
      </Router>
    </MuiThemeProvider>
  );
}

export default App; 