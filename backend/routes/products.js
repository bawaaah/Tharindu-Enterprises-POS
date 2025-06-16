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

module.exports = router;