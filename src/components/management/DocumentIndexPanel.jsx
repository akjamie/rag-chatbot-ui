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
  IconButton,
  Collapse,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  IconButton as MuiIconButton,
  styled,
  Backdrop,
  CircularProgress,
  Snackbar,
  Alert as MuiAlert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import InfoIcon from '@mui/icons-material/Info';
import { getDocumentIndexLogs, deleteDocumentIndexLog, uploadDocument } from '../../services/api';
import FilterPanel from './FilterPanel';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Styled components
const InfoIconButton = styled(MuiIconButton)({
  padding: 4,
  marginLeft: 4,
  '& .MuiSvgIcon-root': {
    fontSize: '1rem'
  }
});

function FilterLabel({ label, tooltip }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {label}
      <Tooltip title={tooltip} arrow placement="top">
        <InfoIconButton size="small" color="info">
          <InfoIcon />
        </InfoIconButton>
      </Tooltip>
    </Box>
  );
}

function Row({ row, onDelete }) {
  const [open, setOpen] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return '#ffa726'; // Orange
      case 'IN_PROGRESS':
        return '#2196f3'; // Blue
      case 'FAILED':
        return '#f44336'; // Red
      case 'COMPLETED':
        return '#4caf50'; // Green
      default:
        return 'inherit';
    }
  };

  return (
    <>
      <TableRow hover>
        <TableCell padding="checkbox">
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{row.source}</TableCell>
        <TableCell>{row.source_type}</TableCell>
        <TableCell>
          <Box
            sx={{
              display: 'inline-block',
              bgcolor: `${getStatusColor(row.status)}20`,
              color: getStatusColor(row.status),
              border: 1,
              borderColor: getStatusColor(row.status),
              borderRadius: 1,
              px: 1,
              py: 0.5,
              fontSize: '0.875rem'
            }}
          >
            {row.status === 'IN_PROGRESS' ? 'In Progress' : 
             row.status.charAt(0) + row.status.slice(1).toLowerCase()}
          </Box>
        </TableCell>
        <TableCell>{row.created_at}</TableCell>
        <TableCell>{row.created_by}</TableCell>
        <TableCell>{row.modified_at}</TableCell>
        <TableCell>{row.modified_by}</TableCell>
        <TableCell>
          <IconButton 
            size="small" 
            onClick={() => onDelete(row.id)}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Additional Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ID: {row.id}
              </Typography>
              {row.checksum && (
                <Typography variant="body2" color="text.secondary">
                  Checksum: {row.checksum}
                </Typography>
              )}
              {row.error_message && (
                <Typography variant="body2" color="error">
                  Error: {row.error_message}
                </Typography>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

const hasValidFilters = (filters) => {
  return Boolean(
    filters.source?.trim() ||
    (filters.sourceType && filters.sourceType !== 'all') ||
    (filters.status && filters.status !== 'all') ||
    filters.createdBy?.trim() ||
    filters.dateRange?.start ||
    filters.dateRange?.end
  );
};

function DocumentIndexPanel({ user }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [documents, setDocuments] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedSourceType, setSelectedSourceType] = useState('pdf');
  const [filters, setFilters] = useState({
    source: '',
    sourceType: 'all',
    status: 'all',
    createdBy: '',
    dateRange: {
      start: null,
      end: null
    }
  });
  const [uploadType, setUploadType] = useState('file');
  const [urlInput, setUrlInput] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    documentId: null
  });
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [uploadCategory, setUploadCategory] = useState('file');
  const [uploading, setUploading] = useState(false);

  const loadDocuments = async () => {
    try {
      if (!user) {
        setError('Please log in to view documents');
        setDocuments([]);
        setTotal(0);
        return;
      }

      if (!hasValidFilters(filters)) {
        setError('Please specify at least one filter criteria');
        setDocuments([]);
        setTotal(0);
        return;
      }

      setIsLoading(true);
      setError(null);

      console.log('Filters being sent:', filters);

      const response = await getDocumentIndexLogs(page + 1, rowsPerPage, {
        source: filters.source,
        sourceType: filters.sourceType,
        status: filters.status,
        createdBy: filters.createdBy,
        dateRange: filters.dateRange
      });

      if (Array.isArray(response)) {
        setDocuments(response);
        setTotal(response.length);
      } else if (response.items) {
        setDocuments(response.items);
        setTotal(response.total);
      } else {
        setDocuments([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      setError('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteDialog({
      open: true,
      documentId: id
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteDocumentIndexLog(deleteDialog.documentId);
      setToast({
        open: true,
        message: 'Document deleted successfully',
        severity: 'success'
      });
      loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      setToast({
        open: true,
        message: 'Failed to delete document',
        severity: 'error'
      });
    } finally {
      setDeleteDialog({
        open: false,
        documentId: null
      });
    }
  };

  const handleCloseToast = (event, reason) => {
    if (reason === 'clickaway') return;
    setToast(prev => ({ ...prev, open: false }));
  };

  const handleUpload = async () => {
    try {
      setUploading(true);
      
      const response = await uploadDocument(
        selectedFile,
        uploadCategory,
        selectedSourceType,
        urlInput,
        user.id
      );

      setUploadDialog(false);
      setSelectedFile(null);
      setUrlInput('');
      setToast({
        open: true,
        message: 'Document uploaded successfully',
        severity: 'success'
      });
      loadDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      setToast({
        open: true,
        message: 'Failed to upload document: ' + (error.response?.data?.detail || error.message),
        severity: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSearch = () => {
    setError(null);
    
    if (!hasValidFilters(filters)) {
      setError('Please specify at least one filter criteria');
      setDocuments([]);
      setTotal(0);
      return;
    }
    
    setPage(0);
    loadDocuments();
  };

  useEffect(() => {
    if (hasValidFilters(filters)) {
      loadDocuments();
    }
  }, [page, rowsPerPage]);

  return (
    <Box>
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
        <Typography variant="h6" color="inherit">
          Loading Documents...
        </Typography>
      </Backdrop>

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <FilterPanel 
          filters={filters}
          onFilterChange={setFilters}
          onSearch={handleSearch}
          disabled={isLoading}
          filterConfig={[
            {
              field: 'source',
              label: 'Source',
              width: 3
            },
            {
              field: 'sourceType',
              label: 'Source Type',
              type: 'select',
              width: 2,
              options: [
                { value: 'all', label: 'All Types' },
                { value: 'csv', label: 'CSV' },
                { value: 'pdf', label: 'PDF' },
                { value: 'text', label: 'Text' },
                { value: 'json', label: 'JSON' },
                { value: 'docx', label: 'DOCX' },
                { value: 'web_page', label: 'Web Page' },
                { value: 'confluence', label: 'Confluence' }
              ]
            },
            {
              field: 'status',
              label: 'Status',
              type: 'select',
              width: 2,
              options: [
                { value: 'all', label: 'All Status' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'IN_PROGRESS', label: 'In Progress' },
                { value: 'FAILED', label: 'Failed' },
                { value: 'COMPLETED', label: 'Completed' }
              ]
            },
            {
              field: 'createdBy',
              label: 'Uploaded by',
              placeholder: 'Uploaded by',
              width: 2
            },
            {
              field: 'dateRange',
              label: 'Created Date Range',
              type: 'daterange',
              width: 4,
              startLabel: 'From Date',
              endLabel: 'To Date'
            }
          ]}
        />
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={() => setUploadDialog(true)}
          disabled={isLoading || !user}
          sx={{ 
            backgroundColor: '#ff1e1e !important',
            '&:hover': {
              backgroundColor: '#e01919 !important'
            }
          }}
        >
          Upload Document
        </Button>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" />
                <TableCell>Source</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Modified At</TableCell>
                <TableCell>Modified By</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No documents found
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((row) => (
                  <Row key={row.id} row={row} onDelete={handleDeleteClick} />
                ))
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

      <Dialog 
        open={uploadDialog} 
        onClose={() => {
          setUploadDialog(false);
          setSelectedFile(null);
          setUrlInput('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={uploadCategory}
                onChange={(e) => {
                  setUploadCategory(e.target.value);
                  setSelectedFile(null);
                  setUrlInput('');
                }}
                label="Category"
              >
                <MenuItem value="file">File Upload</MenuItem>
                <MenuItem value="web_page">Web Page</MenuItem>
                <MenuItem value="confluence">Confluence</MenuItem>
              </Select>
            </FormControl>

            {uploadCategory === 'file' && (
              <>
                <FormControl fullWidth>
                  <InputLabel>Source Type</InputLabel>
                  <Select
                    value={selectedSourceType}
                    onChange={(e) => setSelectedSourceType(e.target.value)}
                    label="Source Type"
                  >
                    <MenuItem value="csv">CSV</MenuItem>
                    <MenuItem value="pdf">PDF</MenuItem>
                    <MenuItem value="text">Text</MenuItem>
                    <MenuItem value="json">JSON</MenuItem>
                    <MenuItem value="docx">DOCX</MenuItem>
                  </Select>
                </FormControl>

                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  accept={
                    selectedSourceType === 'pdf' ? '.pdf' :
                    selectedSourceType === 'csv' ? '.csv' :
                    selectedSourceType === 'text' ? '.txt' :
                    selectedSourceType === 'json' ? '.json' :
                    selectedSourceType === 'docx' ? '.docx' :
                    undefined
                  }
                />
              </>
            )}

            {(uploadCategory === 'web_page' || uploadCategory === 'confluence') && (
              <TextField
                fullWidth
                label={uploadCategory === 'web_page' ? "URL" : "Confluence URL"}
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder={`Enter ${uploadCategory === 'web_page' ? 'webpage' : 'confluence'} URL`}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={
              uploading || (
                uploadCategory === 'file' ? !selectedFile :
                !urlInput
              )
            }
            sx={{ 
              backgroundColor: '#ff1e1e !important',
              '&:hover': {
                backgroundColor: '#e01919 !important'
              }
            }}
          >
            {uploading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                <span>Uploading...</span>
              </Box>
            ) : (
              'Upload'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Backdrop
        sx={{ 
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          position: 'absolute'
        }}
        open={uploading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, documentId: null })}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this document? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ open: false, documentId: null })}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert 
          onClose={handleCloseToast} 
          severity={toast.severity}
          elevation={6} 
          variant="filled"
        >
          {toast.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}

export default DocumentIndexPanel; 