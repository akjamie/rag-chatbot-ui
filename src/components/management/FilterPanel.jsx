import { 
  Paper,
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState } from 'react';

function FilterPanel({ filters, onFilterChange, onSearch, filterConfig, disabled }) {
  const handleFilterChange = (field, value) => {
    onFilterChange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderFilterInput = (filter) => {
    switch (filter.type) {
      case 'select':
        return (
          <FormControl fullWidth size="small">
            <InputLabel>{filter.label}</InputLabel>
            <Select
              value={filters[filter.field]}
              label={filter.label}
              onChange={(e) => handleFilterChange(filter.field, e.target.value)}
              disabled={disabled}
            >
              {filter.options.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case 'daterange':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <DatePicker
                label={filter.startLabel}
                value={filters[filter.field]?.start}
                onChange={(date) => handleFilterChange(filter.field, {
                  ...filters[filter.field],
                  start: date
                })}
                disabled={disabled}
                slotProps={{ textField: { size: 'small' } }}
              />
              <DatePicker
                label={filter.endLabel}
                value={filters[filter.field]?.end}
                onChange={(date) => handleFilterChange(filter.field, {
                  ...filters[filter.field],
                  end: date
                })}
                disabled={disabled}
                slotProps={{ textField: { size: 'small' } }}
              />
            </Box>
          </LocalizationProvider>
        );
      default:
        return (
          <TextField
            fullWidth
            size="small"
            label={filter.label}
            value={filters[filter.field]}
            onChange={(e) => handleFilterChange(filter.field, e.target.value)}
            placeholder={filter.placeholder}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <Paper sx={{ p: 2, width: '100%', mr: 2 }}>
      <Grid container spacing={2} alignItems="center">
        {filterConfig.map((filter) => (
          <Grid item xs={12} md={filter.width} key={filter.field}>
            {renderFilterInput(filter)}
          </Grid>
        ))}
        <Grid item xs={12} md={2}>
          <Button
            fullWidth
            variant="contained"
            onClick={onSearch}
            startIcon={<SearchIcon />}
            disabled={disabled}
            sx={{
              backgroundColor: '#ff1e1e !important',
              '&:hover': {
                backgroundColor: '#e01919 !important'
              }
            }}
          >
            Search
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default FilterPanel; 