import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import ShareDialog from './ShareDialog';
import * as api from '../lib/api';

vi.mock('../lib/api', () => ({
  sendInvite: vi.fn(),
}));

describe('ShareDialog', () => {
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    authKey: '12345678901234567890123456789012',
  };

  it('shows validation error for invalid email', async () => {
    render(<ShareDialog {...mockProps} />);

    const input = screen.getByLabelText(/Email Address/i);
    const sendButton = screen.getByText('Send Invite');

    fireEvent.change(input, {target: {value: 'not-an-email'}});
    fireEvent.click(sendButton);

    expect(
      screen.getByText(/Please enter a valid email address/i),
    ).toBeInTheDocument();
  });

  it('calls sendInvite API on valid submission', async () => {
    vi.mocked(api.sendInvite).mockResolvedValue(true);
    render(<ShareDialog {...mockProps} />);

    const input = screen.getByLabelText(/Email Address/i);
    fireEvent.change(input, {target: {value: 'test@example.com'}});
    fireEvent.click(screen.getByText('Send Invite'));

    await waitFor(() => {
      expect(api.sendInvite).toHaveBeenCalledWith(
        mockProps.authKey,
        'test@example.com',
        expect.any(String),
      );
      expect(screen.getByText(/Invite sent successfully/i)).toBeInTheDocument();
    });
  });
});
