import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton,
  Button,
  Tab,
  Tabs,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import { getDocumentIndexLogs, uploadDocument, deleteDocumentIndexLog } from '../services/api';

function Settings({ user }) {
  const [tab, setTab] = useState(0);
  const [indexLogs, setIndexLogs] = useState([]);
  const [sourceType, setSourceType] = useState('pdf');
  const [file, setFile] = useState(null);

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

  const handleUpload = async () => {
    if (!file) return;
    try {
      await uploadDocument(file, sourceType, user.id);
      loadIndexLogs();
      setFile(null);
    } catch (error) {
      console.error('Error uploading document:', error);
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
      <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
        <Tab label="Document Index" />
        <Tab label="Chat History" />
      </Tabs>

      {tab === 0 && (
        <>
          <Box sx={{ mt: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Upload New Document
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value)}
                  label="Type"
                >
                  <MenuItem value="pdf">PDF</MenuItem>
                  <MenuItem value="docx">DOCX</MenuItem>
                  <MenuItem value="text">Text</MenuItem>
                  <MenuItem value="csv">CSV</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                component="label"
                startIcon={<UploadIcon />}
              >
                Choose File
                <input
                  type="file"
                  hidden
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </Button>
              <Button 
                variant="contained" 
                onClick={handleUpload}
                disabled={!file}
              >
                Upload
              </Button>
            </Box>
          </Box>

          <Typography variant="h6" gutterBottom>
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
                  primary={log.source}
                  secondary={`Status: ${log.status} | Type: ${log.source_type}`}
                />
              </ListItem>
            ))}
          </List>
        </>
      )}

      {tab === 1 && (
        <Typography variant="h6" sx={{ mt: 3 }}>
          Chat History Management (Coming Soon)
        </Typography>
      )}
    </Box>
  );
}

export default Settings; 