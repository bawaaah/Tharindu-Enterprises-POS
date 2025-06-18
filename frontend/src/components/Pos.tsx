import { useState, useEffect } from 'react';
import {
  Box, Grid, TextField, Button, Table, TableBody, TableCell, TableHead, TableRow,
  Typography, Select, MenuItem, Alert, AppBar, Toolbar, IconButton
} from '@mui/material';
import SelectComponent from 'react-select';
import { getCategories, filterProductsByCategory, processTransaction } from '../services/api';
import { Product, CartItem, Receipt } from '../types';
import LogoutIcon from '@mui/icons-material/Logout';

interface Props {
  onLogout: () => void;
}

const Pos: React.FC<Props> = ({ onLogout }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cashPaid, setCashPaid] = useState('');
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [error, setError] = useState('');
  const [customItem, setCustomItem] = useState({ name: '', price: '', quantity: '1', category: 'Others', unit: 'unit' });
  const [selectedProductQuantity, setSelectedProductQuantity] = useState('1');

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setError('Failed to load categories'));
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      filterProductsByCategory(selectedCategory)
        .then(setProducts)
        .catch(() => setError('Failed to filter products'));
    } else {
      setProducts([]);
    }
  }, [selectedCategory]);

  const addToCart = (product: Product) => {
    const quantity = parseFloat(selectedProductQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      setError('Invalid quantity');
      return;
    }

    const finalQuantity = product.unit === 'kg' ? quantity : Math.round(quantity);
    
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id 
          ? { ...item, quantity: item.quantity + finalQuantity } 
          : item
      ));
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        quantity: finalQuantity,
        category: product.category,
        unit: product.unit,
        special_price: product.special_price,
        packet_price: product.packet_price
      }]);
    }
    setSelectedProductQuantity('1');
  };

  const addCustomItem = () => {
    const { name, price, quantity, category, unit } = customItem;
    if (!name || !price || !quantity || parseFloat(quantity) <= 0) {
      setError('Invalid custom item details');
      return;
    }
    setCart([...cart, {
      is_custom: true,
      name,
      price: parseFloat(price),
      quantity: parseFloat(quantity),
      category,
      unit
    }]);
    setCustomItem({ name: '', price: '', quantity: '1', category: 'Others', unit: 'unit' });
  };

  const handleTransaction = async () => {
    if (!cart.length || !cashPaid || parseFloat(cashPaid) <= 0) {
      setError('Cart empty or invalid cash amount');
      return;
    }
    try {
      const { receipt } = await processTransaction(cart, parseFloat(cashPaid));
      setReceipt(receipt);
      setCart([]);
      setCashPaid('');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Transaction failed');
    }
  };

  const handlePrintReceipt = () => {
    if (!receipt) return;

    const printWindow = window.open('', '', 'width=300,height=600');
    if (!printWindow) return;

    const receiptHtml = `
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: monospace; font-size: 12px; width: 58mm; margin: 0; padding: 0; }
            .center { text-align: center; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 2px 0; }
            .bold { font-weight: bold; }
            .line { border-top: 1px dashed #000; margin: 4px 0; }
          </style>
        </head>
        <body>
          <div class="center bold">${receipt.shop_name}</div>
          <div class="center">${new Date(receipt.date).toLocaleString()}</div>
          <div class="line"></div>
          <table>
            <thead>
              <tr>
                <th align="left">Item</th>
                <th align="right">Qty</th>
                <th align="right">Price</th>
                <th align="right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${receipt.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td align="right">${item.quantity}</td>
                  <td align="right">$${item.special_price}</td>
                  <td align="right">$${item.total}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="line"></div>
          <div>Total: $${receipt.total}</div>
          <div>Cash: $${receipt.cash_paid}</div>
          <div>Change: $${receipt.change}</div>
          <div>Savings: $${receipt.savings}</div>
          <div class="center" style="margin-top:10px;">Thank you!</div>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleClearAll = () => {
    setCart([]);
    setCashPaid('');
    setReceipt(null);
    setError('');
  };

  const total = cart.reduce((sum, item) => {
    const price = item.is_custom ? item.price! : item.special_price!;
    return sum + price * item.quantity;
  }, 0);

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
      <Box sx={{ p: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <Grid container spacing={2}>
          <Grid>
            <Typography variant="h6">Product Selection</Typography>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              fullWidth
              displayEmpty
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
            </Select>
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <SelectComponent
                options={products.map(p => ({ value: p.id, label: `${p.name} (${p.unit}) - $${p.special_price}` }))}
                onChange={(option: any) => {
                  setSelectedProductQuantity('1');
                }}
                placeholder="Select a product"
                isSearchable
                styles={{ container: (base) => ({ ...base, flex: 1 }) }}
              />
              <TextField
                label="Quantity"
                type="number"
                value={selectedProductQuantity}
                onChange={(e) => setSelectedProductQuantity(e.target.value)}
                inputProps={{ 
                  step: products.find(p => p.id === (products.find(p => p.id)?.id))?.unit === 'kg' ? '0.1' : '1',
                  min: '0'
                }}
                sx={{ width: '120px' }}
              />
              <Button 
                variant="contained" 
                onClick={() => {
                  const selectedProduct = products.find(p => p.id === (products.find(p => p.id)?.id));
                  if (selectedProduct) addToCart(selectedProduct);
                }}
              >
                Add
              </Button>
            </Box>
            <Typography variant="h6" sx={{ mt: 2 }}>Add Custom Item</Typography>
            <TextField
              label="Name"
              fullWidth
              margin="normal"
              value={customItem.name}
              onChange={(e) => setCustomItem({ ...customItem, name: e.target.value })}
            />
            <TextField
              label="Price"
              type="number"
              fullWidth
              margin="normal"
              value={customItem.price}
              onChange={(e) => setCustomItem({ ...customItem, price: e.target.value })}
            />
            <TextField
              label="Quantity"
              type="number"
              fullWidth
              margin="normal"
              value={customItem.quantity}
              onChange={(e) => setCustomItem({ ...customItem, quantity: e.target.value })}
            />
            <Button variant="contained" onClick={addCustomItem} sx={{ mt: 2 }}>
              Add Custom Item
            </Button>
          </Grid>
          <Grid>
            <Typography variant="h6">Cart</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cart.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.is_custom ? `${item.name} (Custom)` : item.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>${item.is_custom ? item.price : item.special_price}</TableCell>
                    <TableCell>${((item.is_custom ? item.price! : item.special_price!) * item.quantity).toFixed(2)}</TableCell>
                    <TableCell>
                      <Button onClick={() => setCart(cart.filter((_, i) => i !== index))}>Remove</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Typography variant="h6">Total: ${total.toFixed(2)}</Typography>
            <TextField
              label="Cash Paid"
              type="number"
              fullWidth
              margin="normal"
              value={cashPaid}
              onChange={(e) => setCashPaid(e.target.value)}
            />
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button variant="contained" onClick={handleTransaction}>
                Process Transaction
              </Button>
              <Button variant="contained" onClick={handlePrintReceipt} disabled={!receipt}>
                Print Receipt
              </Button>
              <Button variant="contained" color="secondary" onClick={handleClearAll}>
                Clear All
              </Button>
            </Box>
            {receipt && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6">Receipt</Typography>
                <Typography>{receipt.shop_name}</Typography>
                <Typography>Date: {new Date(receipt.date).toLocaleString()}</Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell>Qty</TableCell>
                      <TableCell>Special Price</TableCell>
                      <TableCell>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {receipt.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${item.special_price} (Packet: ${item.packet_price})</TableCell>
                        <TableCell>${item.total}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Typography>Total: ${receipt.total}</Typography>
                <Typography>Cash Paid: ${receipt.cash_paid}</Typography>
                <Typography>Change: ${receipt.change}</Typography>
                <Typography>Savings: ${receipt.savings}</Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Pos;