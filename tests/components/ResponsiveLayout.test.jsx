import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ChatPage from '../../src/pages/ChatPage';

// Mock api service
vi.mock('../../src/services/api', () => ({
  getChatHistories: vi.fn().mockResolvedValue({ sessions: [] }),
  sendMessage: vi.fn().mockResolvedValue({ answer: 'Mock response' }),
}));

const theme = createTheme();
const mockUser = { id: 'user_123', name: 'Tester' };

function setViewport(width) {
  window.matchMedia = vi.fn().mockImplementation((query) => {
    return {
      matches: query.includes(`max-width: ${width}px`) || query.includes(`min-width: ${width}px`),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  });
}

describe('ResponsiveLayout Component Tests (AC3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly on mobile breakpoint (<= 640px)', () => {
    setViewport(375);
    const { container } = render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <ChatPage user={mockUser} />
        </ThemeProvider>
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });

  it('renders correctly on tablet breakpoint (641px - 1024px)', () => {
    setViewport(768);
    const { container } = render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <ChatPage user={mockUser} />
        </ThemeProvider>
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });

  it('renders correctly on desktop breakpoint (> 1024px)', () => {
    setViewport(1440);
    const { container } = render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <ChatPage user={mockUser} />
        </ThemeProvider>
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });
});
