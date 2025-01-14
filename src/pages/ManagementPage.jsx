import { useState, useEffect } from 'react';
import { 
  Box, 
  Drawer,
  Divider,
  Typography,
  useTheme,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DescriptionIcon from '@mui/icons-material/Description';
import ChatIcon from '@mui/icons-material/Chat';
import DocumentIndexPanel from '../components/management/DocumentIndexPanel';
import ChatHistoryPanel from '../components/management/ChatHistoryPanel';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const DRAWER_WIDTH = 280;

const menuItems = [
  {
    id: 'documents',
    label: 'Document Management',
    icon: <DescriptionIcon />,
    children: [
      { id: 'doc-index', label: 'Document Index', panel: 'DocumentIndexPanel' },
      { id: 'doc-chunks', label: 'Embedding Chunks', panel: 'EmbeddingChunksPanel' }
    ]
  },
  {
    id: 'chats',
    label: 'Chat Management',
    icon: <ChatIcon />,
    children: [
      { id: 'chat-history', label: 'Chat History', panel: 'ChatHistoryPanel' }
    ]
  }
];

// Add styles for menu items
const menuStyles = {
  parentItem: {
    '&:hover': {
      bgcolor: 'action.hover',
    },
    '& .MuiListItemIcon-root': {
      minWidth: 40,
    }
  },
  childItem: {
    pl: 4,
    '&.Mui-selected': {
      bgcolor: 'primary.main',
      color: 'primary.contrastText',
      '&:hover': {
        bgcolor: 'primary.dark',
      }
    },
    '&:hover': {
      bgcolor: 'action.hover',
    }
  }
};

function ManagementPage() {
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState('');
  const [expanded, setExpanded] = useState(['documents']);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();
  const user = JSON.parse(localStorage.getItem('user'));
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!user) {
      console.log('No user found, redirecting to home');
      navigate('/');
    }
  }, [user, navigate]);

  const handleNodeSelect = (nodeId) => {
    setSelectedNode(nodeId);
    setError(null);
  };

  const toggleExpand = (itemId) => {
    setExpanded(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const renderPanel = () => {
    if (isLoading) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%' 
        }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Typography variant="body1">
            Please check your connection and try again.
          </Typography>
        </Box>
      );
    }

    switch (selectedNode) {
      case 'doc-index':
        return <DocumentIndexPanel user={user} />;
      case 'chat-history':
        return <ChatHistoryPanel user={user} />;
      default:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Welcome to Management Console
            </Typography>
            <Typography color="text.secondary">
              Select an item from the menu to view details
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: sidebarOpen ? DRAWER_WIDTH : '0px',
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: sidebarOpen ? DRAWER_WIDTH : '0px',
            boxSizing: 'border-box',
            bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : '#f8f8f8',
            borderRight: 1,
            borderColor: 'divider',
            transition: 'width 0.3s ease',
            overflow: 'hidden'
          },
        }}
      >
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: theme.palette.mode === 'dark' ? 'background.default' : '#fff',
        }}>
          <Typography variant="h6">Management Console</Typography>
        </Box>
        <List sx={{ pt: 1 }}>
          {menuItems.map((item) => (
            <Box key={item.id}>
              <ListItem 
                button 
                onClick={() => toggleExpand(item.id)}
                sx={menuStyles.parentItem}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: 500
                  }}
                />
                {expanded.includes(item.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItem>
              <Collapse in={expanded.includes(item.id)} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children.map((child) => (
                    <ListItem
                      key={child.id}
                      button
                      selected={selectedNode === child.id}
                      onClick={() => handleNodeSelect(child.id)}
                      sx={menuStyles.childItem}
                    >
                      <ListItemText 
                        primary={child.label}
                        primaryTypographyProps={{
                          fontSize: '0.875rem'
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </Box>
          ))}
        </List>
      </Drawer>

      <IconButton
        onClick={() => setSidebarOpen(!sidebarOpen)}
        sx={{
          position: 'fixed',
          left: sidebarOpen ? DRAWER_WIDTH - 12 : -12,
          top: '50%',
          transform: 'translateY(-50%)',
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          transition: 'left 0.3s ease',
          '&:hover': {
            bgcolor: 'action.hover'
          },
          zIndex: theme.zIndex.drawer + 1,
          padding: '4px',
          width: '24px',
          height: '24px',
          '& .MuiSvgIcon-root': {
            fontSize: '18px'
          }
        }}
      >
        {sidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </IconButton>

      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3,
          bgcolor: theme.palette.mode === 'dark' ? 'background.default' : '#fff',
          overflow: 'auto'
        }}
      >
        {renderPanel()}
      </Box>
    </Box>
  );
}

export default ManagementPage; 