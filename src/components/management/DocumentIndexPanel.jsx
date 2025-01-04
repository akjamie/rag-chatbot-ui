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
  TextField,
  MenuItem,
  Grid
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { getDocumentIndexLogs } from '../../services/api';
import FilterPanel from './FilterPanel';

function Row({ row }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow hover>
        <TableCell padding="checkbox">
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{row.filename}</TableCell>
        <TableCell>{row.source_type}</TableCell>
        <TableCell>{row.status}</TableCell>
        <TableCell>{new Date(row.created_at).toLocaleString()}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Embedding Chunks
              </Typography>
              <Typography variant="body2" color="text.secondary">
                API for embedding chunks not yet available
              </Typography>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

function DocumentIndexPanel({ user }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [documents, setDocuments] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    sourceType: 'all',
    dateRange: 'all'
  });

  const filterConfig = [
    {
      field: 'search',
      label: 'Search Filename',
      width: 3
    },
    {
      field: 'status',
      label: 'Status',
      type: 'select',
      width: 2,
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'completed', label: 'Completed' },
        { value: 'processing', label: 'Processing' },
        { value: 'failed', label: 'Failed' }
      ]
    },
    {
      field: 'sourceType',
      label: 'Source Type',
      type: 'select',
      width: 2,
      options: [
        { value: 'all', label: 'All Types' },
        { value: 'pdf', label: 'PDF' },
        { value: 'doc', label: 'DOC' },
        { value: 'txt', label: 'TXT' }
      ]
    }
  ];

  useEffect(() => {
    console.log('DocumentIndexPanel mounted');
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    console.log('Loading documents with:', { page, rowsPerPage, filters });
    try {
      setIsLoading(true);
      const response = await getDocumentIndexLogs(page + 1, rowsPerPage, {
        search: filters.search,
        status: filters.status !== 'all' ? filters.status : undefined,
        sourceType: filters.sourceType !== 'all' ? filters.sourceType : undefined
      });
      console.log('API Response:', response);
      setDocuments(response.items || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    loadDocuments();
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    loadDocuments();
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    loadDocuments();
  };

  console.log('Render state:', { documents, isLoading, filters });

  return (
    <Box>
      <FilterPanel 
        filters={filters}
        onFilterChange={setFilters}
        onSearch={handleSearch}
        filterConfig={filterConfig}
      />

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" />
                <TableCell>Filename</TableCell>
                <TableCell>Source Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No documents found
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((row) => (
                  <Row key={row.id} row={row} />
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
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Paper>
    </Box>
  );
}

export default DocumentIndexPanel; 