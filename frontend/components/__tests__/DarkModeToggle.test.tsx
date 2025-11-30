import { render, screen, fireEvent } from '@testing-library/react';
import DarkModeToggle from '../DarkModeToggle';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('DarkModeToggle', () => {
  beforeEach(() => {
    localStorageMock.clear();
    document.documentElement.classList.remove('dark');
  });

  it('should render the toggle button', () => {
    render(<DarkModeToggle />);
    const button = screen.getByRole('button', { name: /switch to/i });
    expect(button).toBeInTheDocument();
  });

  it('should toggle dark mode on click', () => {
    render(<DarkModeToggle />);
    const button = screen.getByRole('button');

    // Initially light mode
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Click to toggle to dark
    fireEvent.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorageMock.getItem('darkMode')).toBe('true');

    // Click again to toggle to light
    fireEvent.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorageMock.getItem('darkMode')).toBe('false');
  });

  it('should load dark mode preference from localStorage', () => {
    localStorageMock.setItem('darkMode', 'true');
    render(<DarkModeToggle />);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});

