import { 
  Paper,
  Box,
  TextField,
  Button,
  Grid,
  MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

function FilterPanel({ filters, onFilterChange, onSearch, filterConfig }) {
  const handleChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2} alignItems="center">
        {filterConfig.map((config) => (
          <Grid item xs={12} md={config.width || 3} key={config.field}>
            {config.type === 'select' ? (
              <TextField
                select
                fullWidth
                label={config.label}
                value={filters[config.field]}
                onChange={(e) => handleChange(config.field, e.target.value)}
                size="small"
              >
                {config.options.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                fullWidth
                label={config.label}
                value={filters[config.field]}
                onChange={(e) => handleChange(config.field, e.target.value)}
                size="small"
                type={config.type || 'text'}
              />
            )}
          </Grid>
        ))}
        <Grid item xs={12} md={2}>
          <Button
            fullWidth
            variant="contained"
            onClick={onSearch}
            startIcon={<SearchIcon />}
          >
            Search
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default FilterPanel; 