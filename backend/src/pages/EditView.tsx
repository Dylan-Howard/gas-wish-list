import React, {useState} from 'react';
import {Product} from '../lib/types';
import {updateProduct} from '../lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Select,
  MenuItem,
  Typography,
  Box,
} from '@mui/material';

interface Props {
  products: Product[];
  authKey: string;
  onUpdate: (product: Product) => void;
}

const EditView: React.FC<Props> = ({products, authKey, onUpdate}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [saving, setSaving] = useState<boolean>(false);

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setEditForm({...product});
  };

  const handleSave = async () => {
    if (!editForm.id) return;

    // Find original for potential revert
    const original = products.find(p => p.id === editForm.id);
    if (!original) return;

    const payload = {
      ...editForm,
      tags:
        typeof editForm.tags === 'string'
          ? (editForm.tags as string).split(',').map(t => t.trim())
          : editForm.tags,
    } as Product;

    // Optimistic Update
    onUpdate(payload);
    setEditingId(null);

    setSaving(true);
    try {
      await updateProduct(authKey, payload, 'UPDATE');
    } catch {
      // Revert on error
      onUpdate(original);
      alert('Failed to update product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Manage Products
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table sx={{minWidth: 650}}>
          <TableHead>
            <TableRow sx={{bgcolor: 'background.default'}}>
              <TableCell>Name</TableCell>
              <TableCell>Link</TableCell>
              <TableCell>Tags</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map(product => {
              const isEditing = editingId === product.id;

              return (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>
                    {isEditing ? (
                      <TextField
                        size="small"
                        fullWidth
                        value={editForm.link || ''}
                        onChange={e =>
                          setEditForm({...editForm, link: e.target.value})
                        }
                      />
                    ) : (
                      <a
                        href={product.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Link
                      </a>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <TextField
                        size="small"
                        fullWidth
                        value={
                          Array.isArray(editForm.tags)
                            ? editForm.tags.join(', ')
                            : editForm.tags
                        }
                        onChange={e =>
                          setEditForm({
                            ...editForm,
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            tags: e.target.value as any,
                          })
                        }
                      />
                    ) : (
                      product.tags.join(', ')
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Select
                        size="small"
                        value={editForm.priority}
                        onChange={e =>
                          setEditForm({
                            ...editForm,
                            priority: e.target.value as Product['priority'],
                          })
                        }
                      >
                        <MenuItem value="Low">Low</MenuItem>
                        <MenuItem value="Medium">Medium</MenuItem>
                        <MenuItem value="High">High</MenuItem>
                      </Select>
                    ) : (
                      product.priority
                    )}
                  </TableCell>
                  <TableCell>{product.purchased ? '✅' : '⏳'}</TableCell>
                  <TableCell align="right">
                    {isEditing ? (
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 1,
                          justifyContent: 'flex-end',
                        }}
                      >
                        <Button
                          size="small"
                          variant="contained"
                          onClick={handleSave}
                          disabled={saving}
                        >
                          Save
                        </Button>
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => setEditingId(null)}
                          disabled={saving}
                        >
                          Cancel
                        </Button>
                      </Box>
                    ) : (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => startEdit(product)}
                      >
                        Edit
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EditView;
