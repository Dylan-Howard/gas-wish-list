import React, {useState, useMemo} from 'react';
import {Product, SortOption} from '../lib/types';
import {updateProduct} from '../lib/api';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CardMedia,
  Grid,
} from '@mui/material';

interface Props {
  products: Product[];
  authKey: string;
  onUpdate: (product: Product) => void;
}

const priorityWeights = {High: 3, Medium: 2, Low: 1};

const ListView: React.FC<Props> = ({products, authKey, onUpdate}) => {
  const [filterTag, setFilterTag] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('None');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const unpurchased = useMemo(
    () => products.filter(p => !p.purchased),
    [products],
  );

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    unpurchased.forEach(p => p.tags.forEach(t => tags.add(t.trim())));
    return Array.from(tags).sort();
  }, [unpurchased]);

  const displayedProducts = useMemo(() => {
    let filtered = unpurchased;

    if (filterTag) {
      filtered = filtered.filter(p =>
        p.tags.map(t => t.trim()).includes(filterTag),
      );
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'Priority') {
        return priorityWeights[b.priority] - priorityWeights[a.priority];
      }
      if (sortBy === 'Name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [unpurchased, filterTag, sortBy]);

  const handleMarkPurchased = async (product: Product) => {
    // Optimistic Update
    const updatedProduct = {...product, purchased: true};
    onUpdate(updatedProduct);

    setProcessingId(product.id);
    try {
      await updateProduct(authKey, product, 'MARK_PURCHASED');
      // No need for full refresh here since we updated state optimistically
    } catch (err) {
      // Revert optimistic update on error
      onUpdate(product);
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      alert(`Failed to mark as purchased: ${errorMessage}`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Box>
      <Box sx={{display: 'flex', gap: 2, mb: 4}}>
        <FormControl size="small" sx={{minWidth: 150}}>
          <InputLabel>Filter by Tag</InputLabel>
          <Select
            value={filterTag}
            label="Filter by Tag"
            onChange={e => setFilterTag(e.target.value)}
          >
            <MenuItem value="">
              <em>All Tags</em>
            </MenuItem>
            {allTags.map(tag => (
              <MenuItem key={tag} value={tag}>
                {tag}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{minWidth: 150}}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={e => setSortBy(e.target.value as SortOption)}
          >
            <MenuItem value="None">Default</MenuItem>
            <MenuItem value="Priority">Priority</MenuItem>
            <MenuItem value="Name">Name</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {displayedProducts.length === 0 && (
          <Typography sx={{mt: 2, ml: 3}}>No items found.</Typography>
        )}
        {displayedProducts.map(product => (
          <Grid size={{xs: 12, sm: 6}} key={product.id}>
            <Card
              variant="outlined"
              sx={{display: 'flex', flexDirection: 'column', height: '100%'}}
            >
              {product.imageUrl && (
                <CardMedia
                  component="img"
                  height="140"
                  image={product.imageUrl}
                  alt={product.name}
                />
              )}
              <CardContent sx={{flexGrow: 1}}>
                <Typography variant="h6" gutterBottom>
                  {product.name}
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                    sx={{ml: 1}}
                  >
                    ({product.priority})
                  </Typography>
                </Typography>
                <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1}}>
                  {product.tags.map(tag => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </CardContent>
              <CardActions sx={{justifyContent: 'space-between', px: 2, pb: 2}}>
                <Button size="small" href={product.link} target="_blank">
                  View Item
                </Button>
                <Button
                  variant="contained"
                  disableElevation
                  onClick={() => handleMarkPurchased(product)}
                  disabled={processingId === product.id}
                >
                  {processingId === product.id ? 'Updating...' : 'Got It'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ListView;
