import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ChatPage from './pages/ChatPage';
import ManagementPage from './pages/ManagementPage';
import LoginPage from './pages/LoginPage';
import TopBar from './components/TopBar';
import { ThemeProvider } from './contexts/ThemeContext';
import { Box } from '@mui/material';
import { useState, useEffect } from 'react';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return null;
  }

  // If no user, show login page
  if (!user) {
    return (
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <TopBar user={user} />
          <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
            <Routes>
              <Route path="/" element={<ChatPage user={user} />} />
              <Route path="/management" element={<ManagementPage user={user} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App; 