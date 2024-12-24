import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { getDocumentIndexLogs, deleteDocumentIndexLog } from '../services/api';

function Settings() {
  const [indexLogs, setIndexLogs] = useState([]);

  useEffect(() => {
    loadIndexLogs();
  }, []);

  const loadIndexLogs = async () => {
    try {
      const logs = await getDocumentIndexLogs();
      setIndexLogs(logs);
    } catch (error) {
      console.error('Error loading index logs:', error);
    }
  };

  const handleDelete = async (logId) => {
    if (window.confirm('Are you sure? This will delete the document from the vector database.')) {
      try {
        await deleteDocumentIndexLog(logId);
        loadIndexLogs();
      } catch (error) {
        console.error('Error deleting index log:', error);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Document Index Logs
      </Typography>
      <List>
        {indexLogs.map((log) => (
          <ListItem
            key={log.id}
            secondaryAction={
              <IconButton edge="end" onClick={() => handleDelete(log.id)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText 
              primary={log.filename}
              secondary={`Status: ${log.status}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default Settings; 