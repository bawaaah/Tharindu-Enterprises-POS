const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const authMiddleware = require('../middleware/auth');

// Search products by name
router.get('/search', (req, res) => {
  const { q } = req.query;
  Product.searchByName(q, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Filter products by category
router.get('/filter', (req, res) => {
  const { category } = req.query;
  Product.filterByCategory(category, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

router.get('/categories', (req, res) => {
  Product.getCategories((err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows.map(row => row.category));
  });
});

router.post('/', (req, res) => {
  const { name, category, packet_price, special_price, stock_quantity, unit } = req.body;
  if (!name || !category || !packet_price || !special_price || !stock_quantity || !unit) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  Product.add({ name, category, packet_price, special_price, stock_quantity, unit }, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to add product' });
    }
    res.status(201).json({ message: 'Product added successfully' });
  });
});

router.get('/', (req, res) => {
  Product.getAll((err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

router.get('/category/:category', (req, res) => {
  const { category } = req.params;
  Product.filterByCategory(category, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, category, packet_price, special_price, stock_quantity, unit } = req.body;
  if (!name || !category || !packet_price || !special_price || !stock_quantity || !unit) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  Product.update(id, { name, category, packet_price, special_price, stock_quantity, unit }, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to update product' });
    }
    res.json({ message: 'Product updated successfully' });
  });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  Product.delete(id, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete product' });
    }
    res.json({ message: 'Product deleted successfully' });
  });
});

router.get('/all', (req, res) => {
  Product.getAll((err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

router.post('/:id/update-stockDecrease', (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  if (typeof quantity !== 'number' || quantity <= 0) {
    return res.status(400).json({ error: 'Invalid quantity' });
  }
  Product.updateStockDecrease(id, quantity, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to update stock' });
    }
    res.json({ message: 'Stock updated successfully' });
  });
});

router.post('/:id/update-stockIncrease', (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  if (typeof quantity !== 'number' || quantity <= 0) {
    return res.status(400).json({ error: 'Invalid quantity' });
  }
  Product.updateStockIncrease(id, quantity, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to update stock' });
    }
    res.json({ message: 'Stock updated successfully' });
  });
});

router.delete('/delete/:id', (req, res) => {
  const { id } = req.params;
  Product.delete(id, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete product' });
    }
    res.json({ message: 'Product deleted successfully' });
  });
});



module.exports = router;