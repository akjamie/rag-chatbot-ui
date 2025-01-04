import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ChatPage from './pages/ChatPage';
import ManagementPage from './pages/ManagementPage';
import TopBar from './components/TopBar';
import { ThemeProvider } from './contexts/ThemeContext';
import { Box } from '@mui/material';

function App() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          {user && <TopBar user={user} />}
          <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
            <Routes>
              <Route path="/" element={<ChatPage user={user} />} />
              <Route path="/management" element={<ManagementPage />} />
            </Routes>
          </Box>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App; 