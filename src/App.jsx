import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import Settings from './components/Settings';
import Login from './components/Login';
import { ThemeProvider, createTheme } from '@mui/material';

// Create dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff4141',
    },
    background: {
      default: '#1a1a1a',
      paper: '#1a1a1a',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          boxShadow: 'none',
        },
      },
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (token) {
        setIsAuthenticated(true);
        // Get user info from token or API
        setUser(JSON.parse(localStorage.getItem('user')));
      }
    };
    checkAuth();
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
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
                <ChatInterface user={user} /> : 
                <Navigate to="/login" />
            } 
          />
          <Route 
            path="/settings" 
            element={
              isAuthenticated ? 
                <Settings user={user} /> : 
                <Navigate to="/login" />
            } 
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 