import React, {useState} from 'react';
import {sendInvite} from '../lib/api';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  authKey: string;
}

const ShareDialog: React.FC<Props> = ({isOpen, onClose, authKey}) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<
    'IDLE' | 'SENDING' | 'SUCCESS' | 'ERROR'
  >('IDLE');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSend = async () => {
    if (!validateEmail(email)) {
      setStatus('ERROR');
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setStatus('SENDING');
    setErrorMsg('');

    try {
      // Captures the current URL including the key parameter
      const currentUrl = window.location.href;
      await sendInvite(authKey, email, currentUrl);
      setStatus('SUCCESS');
      setTimeout(() => {
        closeAndReset();
      }, 2000); // Auto-close after success
    } catch (err: unknown) {
      setStatus('ERROR');
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to send invite.',
      );
    }
  };

  const closeAndReset = () => {
    setEmail('');
    setStatus('IDLE');
    setErrorMsg('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={closeAndReset} maxWidth="sm" fullWidth>
      <DialogTitle>Share Wishlist</DialogTitle>
      <DialogContent>
        {status === 'SUCCESS' ? (
          <Alert severity="success" sx={{mt: 2}}>
            Invite sent successfully!
          </Alert>
        ) : (
          <>
            <DialogContentText sx={{mb: 2}}>
              Send an email invitation containing your secure link.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Email Address"
              type="email"
              fullWidth
              variant="outlined"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={status === 'SENDING'}
              error={status === 'ERROR'}
              helperText={status === 'ERROR' ? errorMsg : ''}
            />
          </>
        )}
      </DialogContent>
      <DialogActions sx={{px: 3, pb: 2}}>
        {status !== 'SUCCESS' && (
          <>
            <Button onClick={closeAndReset} disabled={status === 'SENDING'}>
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              variant="contained"
              disabled={status === 'SENDING' || !email}
              startIcon={
                status === 'SENDING' ? (
                  <CircularProgress size={20} color="inherit" />
                ) : null
              }
            >
              {status === 'SENDING' ? 'Sending...' : 'Send Invite'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ShareDialog;
