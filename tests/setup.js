import '@testing-library/jest-dom/vitest';

// Mock matchMedia for responsive layout testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock scrollIntoView for jsdom
window.HTMLElement.prototype.scrollIntoView = () => {};
window.Element.prototype.scrollIntoView = () => {};

