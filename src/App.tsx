import React, {useState, useEffect} from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import {theme} from './lib/theme';
import {Product} from './lib/types';
import {fetchProducts} from './lib/api';
import ListView from './pages/ListView';
import EditView from './pages/EditView';
import ShareDialog from './components/ShareDialog';

const App: React.FC = () => {
  const [authKey, setAuthKey] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [view, setView] = useState<'LIST' | 'EDIT'>('LIST');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get('key');
    const isLocal = window.location.hostname === 'localhost';
    const isTest =
      typeof process !== 'undefined' && process.env.NODE_ENV === 'test';

    if (key && key.length === 32) {
      setAuthKey(key);
      void loadData(key);
    } else if (isLocal && !isTest) {
      // Local development convenience
      const devKey = 'local-dev-key-32-chars-long-1234';
      setAuthKey(devKey);
      void loadData(devKey);
    } else {
      setError('Invalid or missing authentication key.');
      setLoading(false);
    }
  }, []);

  const loadData = async (key: string) => {
    try {
      setLoading(true);
      interface ApiResponse {
        data?: Product[];
        isAdmin?: boolean;
      }
      const res = (await fetchProducts(key)) as ApiResponse | Product[];
      // The API returns either raw Product[] (old) or {data, isAdmin} (new)
      if (!Array.isArray(res) && res.data) {
        setProducts(res.data);
        setIsAdmin(!!res.isAdmin);
      } else if (Array.isArray(res)) {
        setProducts(res);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev =>
      prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p)),
    );
  };

  if (error)
    return (
      <Alert severity="error" sx={{m: 2}}>
        {error}
      </Alert>
    );
  if (loading)
    return (
      <Box sx={{display: 'flex', justifyContent: 'center', mt: 10}}>
        <CircularProgress />
      </Box>
    );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
            My Wishlist
          </Typography>
          <Button color="inherit" onClick={() => setIsShareOpen(true)}>
            Share
          </Button>
          <Box
            sx={{
              mx: 2,
              height: '24px',
              borderLeft: '1px solid rgba(255,255,255,0.3)',
            }}
          />
          <Button
            color="inherit"
            onClick={() => setView('LIST')}
            sx={{opacity: view === 'LIST' ? 1 : 0.6}}
          >
            List
          </Button>
          {isAdmin && (
            <Button
              color="inherit"
              onClick={() => setView('EDIT')}
              sx={{opacity: view === 'EDIT' ? 1 : 0.6}}
            >
              Edit
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{mt: 4, mb: 4}}>
        {view === 'LIST' && (
          <ListView
            products={products}
            authKey={authKey!}
            onUpdate={handleUpdateProduct}
          />
        )}
        {view === 'EDIT' && (
          <EditView
            products={products}
            authKey={authKey!}
            onUpdate={handleUpdateProduct}
          />
        )}
      </Container>

      <ShareDialog
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        authKey={authKey!}
      />
    </ThemeProvider>
  );
};

export default App;
