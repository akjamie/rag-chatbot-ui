import { useState, useEffect, useCallback } from 'react';
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
  Alert as MuiAlert,
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import InfoIcon from '@mui/icons-material/Info';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
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

const Row = ({ row, onDelete }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow hover>
        <TableCell padding="checkbox">
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Tooltip title={`${row.source_type}: ${row.source}`} placement="top">
            <Typography
              sx={{
                maxWidth: '400px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'block'
              }}
            >
              {row.source}
            </Typography>
          </Tooltip>
        </TableCell>
        <TableCell>{row.source_type}</TableCell>
        <TableCell>
          <Chip 
            label={row.status} 
            color={row.status === 'completed' ? 'success' : 'warning'}
            size="small"
          />
        </TableCell>
        <TableCell>{row.created_at}</TableCell>
        <TableCell>{row.created_by}</TableCell>
        <TableCell>{row.modified_at}</TableCell>
        <TableCell>{row.modified_by}</TableCell>
        <TableCell align="right">
          <IconButton onClick={() => onDelete(row.id)}>
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
                Document ID: {row.id}
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
};

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

const FileDropZone = ({ onFileDrop, selectedFile, disabled, accept }) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragActive(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileDrop(e.dataTransfer.files[0]);
    }
  }, [onFileDrop, disabled]);

  return (
    <Box
      sx={{
        border: '2px dashed',
        borderColor: isDragActive ? 'primary.main' : 'grey.300',
        borderRadius: 1,
        p: 3,
        backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
        textAlign: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.6 : 1,
        '&:hover': {
          borderColor: !disabled && 'primary.main',
          backgroundColor: !disabled && 'action.hover'
        }
      }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {selectedFile ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <InsertDriveFileIcon color="primary" />
          <Typography>{selectedFile.name}</Typography>
        </Box>
      ) : (
        <>
          <input
            type="file"
            onChange={(e) => e.target.files?.[0] && onFileDrop(e.target.files[0])}
            style={{ display: 'none' }}
            id="file-input"
            accept={accept}
            disabled={disabled}
          />
          <label htmlFor="file-input" style={{ width: '100%', cursor: disabled ? 'not-allowed' : 'pointer' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="body1" gutterBottom>
                Drag and drop a file here, or click to select
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Supported formats: {accept?.split(',').join(', ')}
              </Typography>
            </Box>
          </label>
        </>
      )}
    </Box>
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
      start: (() => {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        date.setHours(0, 0, 0, 0);
        return date;
      })(),
      end: (() => {
        const date = new Date();
        date.setHours(23, 59, 59, 999);
        return date;
      })()
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [snippetTitle, setSnippetTitle] = useState('');
  const [snippetContent, setSnippetContent] = useState('');

  const VALID_CATEGORIES = {
    file: 'file',
    web_page: 'web_page',
    confluence: 'confluence',
    knowledge_snippet: 'knowledge_snippet'
  };

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

      const response = await getDocumentIndexLogs(page + 1, rowsPerPage, {
        source: filters.source,
        sourceType: filters.sourceType !== 'all' ? filters.sourceType : null,
        status: filters.status !== 'all' ? filters.status : null,
        createdBy: filters.createdBy,
        fromDate: filters.dateRange?.start,
        toDate: filters.dateRange?.end
      });

      if (response && Array.isArray(response.items)) {
        setDocuments(response.items);
        setTotal(response.total || 0);
      } else if (Array.isArray(response)) {
        // Handle legacy response format for backward compatibility
        setDocuments(response);
        setTotal(response.length);
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
      setUploading(true);
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
      setUploading(false);
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
      
      const formData = new FormData();

      // For file uploads
      if (uploadCategory === VALID_CATEGORIES.file) {
        if (!selectedFile) {
          throw new Error('Please select a file');
        }
        formData.append('file', selectedFile);
        formData.append('category', 'file');
        formData.append('source_type', selectedSourceType);
      } 
      // For web pages and confluence
      else if (uploadCategory === VALID_CATEGORIES.web_page || uploadCategory === VALID_CATEGORIES.confluence) {
        const url = urlInput.trim();
        if (!url) {
          throw new Error('Please enter a valid URL');
        }
        formData.append('url', url);
        formData.append('category', uploadCategory);
        formData.append('source_type', uploadCategory);
      } 
      // For knowledge snippets
      else if (uploadCategory === VALID_CATEGORIES.knowledge_snippet) {
        const content = snippetContent.trim();
        if (!content) {
          throw new Error('Please enter snippet content');
        }
        if (content.length > 2000) {
          throw new Error('Content exceeds 2000 character limit');
        }
        formData.append('content', content);
        formData.append('category', 'knowledge_snippet');
        formData.append('source_type', 'knowledge_snippet');
        
        const title = snippetTitle.trim();
        if (title) {
          formData.append('title', title);
        }
      }

      // Debug log
      console.log('Uploading document with category:', uploadCategory);
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${typeof pair[1] === 'object' ? 'File/Blob' : pair[1]}`);
      }
      
      const response = await uploadDocument(formData, user.id);

      setUploadDialog(false);
      resetUploadForm();
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
        message: error.message || 'Failed to upload document',
        severity: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setSelectedFile(null);
    setUrlInput('');
    setSnippetTitle('');
    setSnippetContent('');
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

  const handleCloseDialog = () => {
    if (!uploading) {
      setDeleteDialog({ 
        open: false, 
        documentId: null 
      });
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
        open={uploading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

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
          resetUploadForm();
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
                  setSnippetTitle('');
                  setSnippetContent('');
                }}
                label="Category"
                disabled={uploading}
              >
                <MenuItem value={VALID_CATEGORIES.file}>File Upload</MenuItem>
                <MenuItem value={VALID_CATEGORIES.web_page}>Web Page</MenuItem>
                <MenuItem value={VALID_CATEGORIES.confluence}>Confluence</MenuItem>
                <MenuItem value={VALID_CATEGORIES.knowledge_snippet}>Knowledge Snippet</MenuItem>
              </Select>
            </FormControl>

            {uploadCategory === VALID_CATEGORIES.file && (
              <>
                <FormControl fullWidth>
                  <InputLabel>Source Type</InputLabel>
                  <Select
                    value={selectedSourceType}
                    onChange={(e) => {
                      setSelectedSourceType(e.target.value);
                      setSelectedFile(null);
                    }}
                    label="Source Type"
                    disabled={uploading}
                  >
                    <MenuItem value="csv">CSV</MenuItem>
                    <MenuItem value="pdf">PDF</MenuItem>
                    <MenuItem value="text">Text</MenuItem>
                    <MenuItem value="json">JSON</MenuItem>
                    <MenuItem value="docx">DOCX</MenuItem>
                  </Select>
                </FormControl>

                <FileDropZone
                  onFileDrop={setSelectedFile}
                  selectedFile={selectedFile}
                  disabled={uploading}
                  accept={
                    selectedSourceType === 'pdf' ? '.pdf' :
                    selectedSourceType === 'csv' ? '.csv' :
                    selectedSourceType === 'text' ? '.txt' :
                    selectedSourceType === 'json' ? '.json' :
                    selectedSourceType === 'docx' ? '.docx' :
                    undefined
                  }
                />
                
                {selectedFile && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      size="small"
                      onClick={() => setSelectedFile(null)}
                      disabled={uploading}
                    >
                      Remove file
                    </Button>
                  </Box>
                )}
              </>
            )}

            {(uploadCategory === VALID_CATEGORIES.web_page || uploadCategory === VALID_CATEGORIES.confluence) && (
              <TextField
                fullWidth
                label={uploadCategory === VALID_CATEGORIES.web_page ? "URL" : "Confluence URL"}
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder={`Enter ${uploadCategory === VALID_CATEGORIES.web_page ? 'webpage' : 'confluence'} URL`}
                disabled={uploading}
              />
            )}

            {uploadCategory === VALID_CATEGORIES.knowledge_snippet && (
              <>
                <TextField
                  fullWidth
                  label="Title (Optional)"
                  value={snippetTitle}
                  onChange={(e) => setSnippetTitle(e.target.value)}
                  placeholder="Enter a title for your knowledge snippet"
                  disabled={uploading}
                />
                <Box sx={{ position: 'relative' }}>
                  <TextField
                    fullWidth
                    required
                    label="Content"
                    multiline
                    rows={6}
                    value={snippetContent}
                    onChange={(e) => {
                      const newContent = e.target.value;
                      if (newContent.length <= 2000) {
                        setSnippetContent(newContent);
                      }
                    }}
                    placeholder="Enter your knowledge snippet content"
                    error={snippetContent.length > 2000 || !snippetContent.trim()}
                    helperText={
                      !snippetContent.trim() ? 'Content is required' :
                      snippetContent.length > 2000 ? `${snippetContent.length}/2000 characters (exceeds limit)` :
                      `${snippetContent.length}/2000 characters`
                    }
                    disabled={uploading}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 14,
                      color: snippetContent.length > 2000 ? 'error.main' : 'text.secondary'
                    }}
                  >
                    {2000 - snippetContent.length} characters remaining
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setUploadDialog(false);
              resetUploadForm();
            }} 
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={
              uploading || (
                uploadCategory === VALID_CATEGORIES.file ? !selectedFile :
                uploadCategory === VALID_CATEGORIES.knowledge_snippet ? (!snippetContent || snippetContent.length > 2000) :
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

      <Dialog
        open={deleteDialog.open}
        onClose={handleCloseDialog}
        aria-labelledby="delete-dialog-title"
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            color: 'text.primary'
          }
        }}
      >
        <DialogTitle 
          id="delete-dialog-title"
          sx={{ color: 'text.primary' }}
        >
          Delete Document
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'text.primary' }}>
            Are you sure you want to delete this document? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog}
            disabled={uploading}
            sx={{ color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            color="error" 
            variant="contained"
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : null}
            autoFocus
          >
            {uploading ? 'Deleting Document...' : 'Delete'}
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