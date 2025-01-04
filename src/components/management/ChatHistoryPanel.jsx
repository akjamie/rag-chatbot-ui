import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { getChatHistories, deleteChatHistory } from '../../services/api';

function ChatHistoryPanel() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [chatSessions, setChatSessions] = useState([]);
  const [total, setTotal] = useState(0);
  const [userId, setUserId] = useState('');
  const [searchedUserId, setSearchedUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadChatHistories = async (uid) => {
    if (!uid?.trim()) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await getChatHistories(uid);
      setChatSessions(response.sessions || []);
      setTotal(response.sessions?.length || 0);
      setSearchedUserId(uid);
    } catch (error) {
      console.error('Error loading chat histories:', error);
      setError(error.message || 'Failed to load chat histories');
      setChatSessions([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    loadChatHistories(userId);
  };

  const handleDelete = async (sessionId) => {
    if (!searchedUserId || !sessionId) return;
    
    try {
      await deleteChatHistory(sessionId);
      // Reload the list after deletion
      loadChatHistories(searchedUserId);
    } catch (error) {
      console.error('Error deleting chat session:', error);
      setError(error.message || 'Failed to delete chat session');
    }
  };

  return (
    <Box>
      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID to search"
              size="small"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              onClick={handleSearch}
              startIcon={<SearchIcon />}
              disabled={!userId.trim() || isLoading}
              fullWidth
            >
              Search
            </Button>
          </Grid>
        </Grid>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </Paper>

      {/* Results Table */}
      {searchedUserId && (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Session ID</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(rowsPerPage > 0
                  ? chatSessions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  : chatSessions
                ).map((session) => (
                  <TableRow key={session.session_id} hover>
                    <TableCell>{session.session_id}</TableCell>
                    <TableCell>{session.title}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Delete Session">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(session.session_id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {chatSessions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      {isLoading ? 'Loading...' : 'No chat sessions found'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        </Paper>
      )}
    </Box>
  );
}

export default ChatHistoryPanel; 