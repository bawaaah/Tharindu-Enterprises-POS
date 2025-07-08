import { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, Alert, AppBar, Toolbar, IconButton, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { getProducts, updateProductIncrease, deleteProduct } from '../services/api';
import LogoutIcon from '@mui/icons-material/Logout';

interface Props {
  onLogout: () => void;
}

interface Product {
  id: number;
  name: string;
  category: string;
  packet_price: number;
  special_price: number;
  stock_quantity: number;
  unit: string;
}

const InventoryPage: React.FC<Props> = ({ onLogout }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stockUpdates, setStockUpdates] = useState<{ [key: string]: string }>({});
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response);
      setCategories(Array.from(new Set(response.map((p: Product) => p.category))));
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch products');
      setSuccess('');
    }
  };

  const handleStockIncrease = async (productId: number) => {
    const quantity = parseFloat(stockUpdates[productId] || '0');
    if (isNaN(quantity) || quantity <= 0) {
      setError('Please enter a valid quantity to increase');
      return;
    }
    try {
      await updateProductIncrease(productId, quantity);
      setSuccess('Stock updated successfully');
      setStockUpdates({ ...stockUpdates, [productId]: '' });
      fetchProducts();
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update stock');
      setSuccess('');
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      await deleteProduct(productId);
      setSuccess('Product deleted successfully');
      fetchProducts();
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete product');
      setSuccess('');
    }
  };

  // Filter products by search and category
  const filteredProducts = products.filter((product) => {
    const matchesName = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category ? product.category === category : true;
    return matchesName && matchesCategory;
  });

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>POS System</Typography>
          <Button color="inherit" href="/pos" sx={{ mr: 2 }}>
            POS
          </Button>
          <Button color="inherit" href="/inventory" sx={{ mr: 2 }}>
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
      <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, p: 2 }}>
        <Typography variant="h4" gutterBottom>Inventory Management</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
          <TextField
            label="Search by Name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ width: 250 }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Filter by Category</InputLabel>
            <Select
              value={category}
              label="Filter by Category"
              onChange={(e) => setCategory(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            href="/products"
            sx={{ height: '40px' }}
          >
            Add Product
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Packet Price</TableCell>
                <TableCell>Special Price</TableCell>
                <TableCell>Stock Quantity</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Increase Stock</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>${product.packet_price.toFixed(2)}</TableCell>
                  <TableCell>${product.special_price.toFixed(2)}</TableCell>
                  <TableCell>{product.stock_quantity}</TableCell>
                  <TableCell>{product.unit}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        size="small"
                        type="number"
                        placeholder="Qty"
                        value={stockUpdates[product.id] || ''}
                        onChange={(e) => setStockUpdates({ ...stockUpdates, [product.id]: e.target.value })}
                        sx={{ width: 100 }}
                      />
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleStockIncrease(product.id)}
                      >
                        Add
                      </Button>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default InventoryPage;