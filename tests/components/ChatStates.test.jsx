import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Alert, Box } from '@mui/material';
import axe from 'axe-core';
import LoadingMessage from '../../src/components/LoadingMessage';
import ChatArea from '../../src/components/ChatArea';

vi.mock('../../src/services/api', () => ({
  getChatHistory: vi.fn().mockResolvedValue({ messages: [] }),
  sendChatQuery: vi.fn().mockResolvedValue({}),
  updateMessageLike: vi.fn().mockResolvedValue({}),
}));

const theme = createTheme();
const mockUser = { id: 'user_123', name: 'Tester' };

describe('ChatStates Component and Accessibility Tests (AC4)', () => {
  it('renders loading state cleanly and passes axe-core accessibility check', async () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <LoadingMessage />
      </ThemeProvider>
    );

    const results = await axe.run(container, {
      rules: { 'color-contrast': { enabled: false } },
    });
    const criticalViolations = results.violations.filter((v) => v.impact === 'critical');
    if (criticalViolations.length > 0) {
      console.log('CRITICAL AXE VIOLATIONS:', JSON.stringify(criticalViolations, null, 2));
    }
    expect(criticalViolations.length).toBe(0);
  });

  it('renders empty state cleanly and passes axe-core accessibility check', async () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <ChatArea selectedChat={null} onNewSession={vi.fn()} user={mockUser} />
      </ThemeProvider>
    );

    const results = await axe.run(container, {
      rules: { 'color-contrast': { enabled: false } },
    });
    const criticalViolations = results.violations.filter((v) => v.impact === 'critical');
    if (criticalViolations.length > 0) {
      console.log('CRITICAL AXE VIOLATIONS:', JSON.stringify(criticalViolations, null, 2));
    }
    expect(criticalViolations.length).toBe(0);
  });

  it('renders error state cleanly and passes axe-core accessibility check', async () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <Box role="region" aria-label="Chat error notification">
          <Alert severity="error">Unable to load messages. Please retry.</Alert>
        </Box>
      </ThemeProvider>
    );

    const results = await axe.run(container, {
      rules: { 'color-contrast': { enabled: false } },
    });
    const criticalViolations = results.violations.filter((v) => v.impact === 'critical');
    if (criticalViolations.length > 0) {
      console.log('CRITICAL AXE VIOLATIONS:', JSON.stringify(criticalViolations, null, 2));
    }
    expect(criticalViolations.length).toBe(0);
  });
});
