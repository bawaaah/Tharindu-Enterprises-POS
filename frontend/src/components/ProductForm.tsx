import { useState } from 'react';
import { TextField, Button, Box, Typography, Alert, AppBar, Toolbar, IconButton } from '@mui/material';
import { addProduct } from '../services/api';
import LogoutIcon from '@mui/icons-material/Logout';

interface Props {
  onLogout: () => void;
}

const ProductForm: React.FC<Props> = ({ onLogout }) => {
  const [product, setProduct] = useState({
    name: '',
    category: '',
    packet_price: '',
    special_price: '',
    stock_quantity: '',
    unit: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addProduct({
        name: product.name,
        category: product.category,
        packet_price: parseFloat(product.packet_price),
        special_price: parseFloat(product.special_price),
        stock_quantity: parseFloat(product.stock_quantity),
        unit: product.unit
      });
      setSuccess('Product added successfully');
      setProduct({ name: '', category: '', packet_price: '', special_price: '', stock_quantity: '', unit: '' });
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add product');
      setSuccess('');
    }
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>POS System</Typography>
          <Button color="inherit" href="/pos" sx={{ mr: 2 }}>
        POS
          </Button>
          <Button color="inherit" href="/products" sx={{ mr: 2 }}>
        Inventory
          </Button>
          <Button color="inherit" href="/reports" sx={{ mr: 2 }}>
        Report
          </Button>
          <IconButton color="inherit" onClick={onLogout}>
        <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
        <Typography variant="h4" gutterBottom>Add New Product</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
          />
          <TextField
            label="Category"
            fullWidth
            margin="normal"
            value={product.category}
            onChange={(e) => setProduct({ ...product, category: e.target.value })}
          />
          <TextField
            label="Packet Price"
            type="number"
            fullWidth
            margin="normal"
            value={product.packet_price}
            onChange={(e) => setProduct({ ...product, packet_price: e.target.value })}
          />
          <TextField
            label="Special Price"
            type="number"
            fullWidth
            margin="normal"
            value={product.special_price}
            onChange={(e) => setProduct({ ...product, special_price: e.target.value })}
          />
          <TextField
            label="Stock Quantity"
            type="number"
            fullWidth
            margin="normal"
            value={product.stock_quantity}
            onChange={(e) => setProduct({ ...product, stock_quantity: e.target.value })}
          />
          <TextField
            label="Unit (e.g., kg, unit)"
            fullWidth
            margin="normal"
            value={product.unit}
            onChange={(e) => setProduct({ ...product, unit: e.target.value })}
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            Add Product
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default ProductForm;