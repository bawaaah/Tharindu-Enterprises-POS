import React, { useEffect, useState } from 'react';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Box,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    SelectChangeEvent,
} from '@mui/material';

// Product type
type Product = {
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
};

type InventoryProps = {
    onLogout: () => void;
};

const Inventory: React.FC<InventoryProps> = ({ onLogout }) => {
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [products, setProducts] = useState<Product[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [form, setForm] = useState<Omit<Product, 'id'>>({
        name: '',
        category: '',
        price: 0,
        quantity: 0,
    });

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            const response = await api.get('/products/categories');
            setCategories(response.data);
        };
        fetchCategories();
    }, []);

    // Fetch products by category
    useEffect(() => {
        const fetchProducts = async () => {
            if (selectedCategory) {
                const response = await api.get('/products/filter', { params: { category: selectedCategory } });
                setProducts(response.data);
            } else {
                setProducts([]);
            }
        };
        fetchProducts();
    }, [selectedCategory]);

    const handleCategoryChange = (event: SelectChangeEvent<string>) => {
        setSelectedCategory(event.target.value as string);
    };

    const handleOpenDialog = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setForm({
                name: product.name,
                category: product.category,
                price: product.price,
                quantity: product.quantity,
            });
        } else {
            setEditingProduct(null);
            setForm({
                name: '',
                category: selectedCategory || '',
                price: 0,
                quantity: 0,
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingProduct(null);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === 'price' || name === 'quantity' ? Number(value) : value,
        }));
    };

    const handleSave = async () => {
        if (editingProduct) {
            await api.put(`/products/${editingProduct.id}`, form);
        } else {
            await api.post('/products', form);
        }
        setOpenDialog(false);
        setEditingProduct(null);
        // Refresh products
        if (selectedCategory) {
            const response = await api.get('/products/filter', { params: { category: selectedCategory } });
            setProducts(response.data);
        }
    };

    const handleDelete = async (id: string) => {
        await api.delete(`/products/${id}`);
        setProducts((prev) => prev.filter((p) => p.id !== id));
    };

    return (
        <Box>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        POS System
                    </Typography>
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
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <FormControl sx={{ minWidth: 200, mr: 2 }}>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={selectedCategory}
                            label="Category"
                            onChange={handleCategoryChange}
                        >
                            {categories.map((cat) => (
                                <MenuItem key={cat} value={cat}>
                                    {cat}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                        disabled={!selectedCategory}
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
                                <TableCell>Price</TableCell>
                                <TableCell>Quantity</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>{product.category}</TableCell>
                                    <TableCell>{product.price}</TableCell>
                                    <TableCell>{product.quantity}</TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={() => handleOpenDialog(product)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(product.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {products.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        No products found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Name"
                        name="name"
                        value={form.name}
                        onChange={handleFormChange}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        label="Category"
                        name="category"
                        value={form.category}
                        onChange={handleFormChange}
                        fullWidth
                        disabled
                    />
                    <TextField
                        margin="dense"
                        label="Price"
                        name="price"
                        type="number"
                        value={form.price}
                        onChange={handleFormChange}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        label="Quantity"
                        name="quantity"
                        type="number"
                        value={form.quantity}
                        onChange={handleFormChange}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained">
                        {editingProduct ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Inventory;