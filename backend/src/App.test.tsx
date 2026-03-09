import {render, screen, waitFor} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import App from './App';
import * as api from './lib/api';

// Mock the API module
vi.mock('./lib/api', () => ({
  fetchProducts: vi.fn(),
  updateProduct: vi.fn(),
  sendInvite: vi.fn(),
}));

describe('Wishlist App Root', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear URL parameters
    window.history.pushState({}, '', '/');
  });

  it('renders error message if auth key is missing', async () => {
    render(<App />);
    expect(
      screen.getByText(/Invalid or missing authentication key/i),
    ).toBeInTheDocument();
  });

  it('renders error message if auth key is not 32 characters', async () => {
    window.history.pushState({}, '', '?key=short-key');
    render(<App />);
    expect(
      screen.getByText(/Invalid or missing authentication key/i),
    ).toBeInTheDocument();
  });

  it('accepts the placeholder 34-character key and sets admin mode', async () => {
    const mockKey = 'REPLACE_WITH_YOUR_32_CHAR_KEY_HERE';
    window.history.pushState({}, '', `?key=${mockKey}&admin=true`);

    const mockProducts = [
      {
        id: '1',
        name: 'Test Item',
        link: '',
        imageUrl: '',
        priority: 'High' as const,
        tags: [],
        purchased: false,
      },
    ];

    vi.mocked(api.fetchProducts).mockResolvedValue(mockProducts);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('My Wishlist')).toBeInTheDocument();
      expect(screen.getByText('Test Item')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });
  });

  it('loads and displays data when a valid 32-character key is provided', async () => {
    const mockKey = '12345678901234567890123456789012';
    window.history.pushState({}, '', `?key=${mockKey}`);

    const mockProducts = [
      {
        id: '1',
        name: 'Test Item',
        link: '',
        imageUrl: '',
        priority: 'High' as const,
        tags: [],
        purchased: false,
      },
    ];

    vi.mocked(api.fetchProducts).mockResolvedValue(mockProducts);

    render(<App />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('My Wishlist')).toBeInTheDocument();
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });
  });
});
