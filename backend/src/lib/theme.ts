import {createTheme} from '@mui/material/styles';

// Paste the output from the Material Design 3 Theme Builder here.
// It usually looks like this:
const md3ThemeOptions = {
  palette: {
    mode: 'light' as const,
    primary: {main: '#6750A4'}, // Your custom generated colors
    secondary: {main: '#625B71'},
    // ... all other generated color tokens
  },
  shape: {
    borderRadius: 16, // MD3 heavily utilizes larger border radii
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
};

export const theme = createTheme(md3ThemeOptions);
