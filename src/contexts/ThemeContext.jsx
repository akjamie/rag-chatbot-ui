import { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const theme = createTheme({
    typography: {
      fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
      h6: {
        fontWeight: 600,
        letterSpacing: '-0.025em'
      },
      body1: {
        fontSize: '0.9375rem',
        lineHeight: 1.6
      },
      body2: {
        fontSize: '0.875rem'
      },
      button: {
        textTransform: 'none',
        fontWeight: 500
      }
    },
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#2563eb',
        dark: '#1d4ed8',
        light: '#60a5fa'
      },
      background: {
        default: isDarkMode ? '#1a1a1a' : '#f5f5f5',
        paper: isDarkMode ? '#2d2d2d' : '#ffffff',
        chat: isDarkMode ? '#242424' : '#ffffff',
        message: {
          user: isDarkMode ? '#2563eb' : '#2563eb',
          ai: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f3f4f6'
        }
      },
      text: {
        primary: isDarkMode ? '#f3f4f6' : '#111827',
        secondary: isDarkMode ? '#9ca3af' : '#6b7280'
      }
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '0.9375rem'
          }
        },
        variants: [
          {
            props: { variant: 'newChat' },
            style: {
              backgroundColor: '#ff1e1e',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: '#e01919'
              }
            }
          }
        ]
      },
      MuiCssBaseline: {
        styleOverrides: {
          '@font-face': {
            fontFamily: 'Inter',
            fontDisplay: 'swap'
          },
          body: {
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              width: '6px',
              height: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent'
            },
            '&::-webkit-scrollbar-thumb': {
              background: isDarkMode ? '#4b5563' : '#cbd5e1',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: isDarkMode ? '#6b7280' : '#94a3b8',
            }
          }
        }
      }
    }
  });

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme: () => setIsDarkMode(!isDarkMode) }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 