const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Transaction = require('../models/transaction');
const { generateReceipt } = require('../utils/receipt');

router.post('/', (req, res) => {
  const { items, cash_paid } = req.body;
  if (!items || !Array.isArray(items) || !cash_paid) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  let total = 0;
  const errors = [];

  // Validate items
  let completed = 0;
  items.forEach((item, index) => {
    if (item.is_custom) {
      // Validate custom item
      if (!item.name || !item.price || !item.quantity || item.quantity <= 0) {
        errors.push(`Invalid custom item at index ${index}: missing name, price, or valid quantity`);
      } else {
        total += item.price * item.quantity;
        item.packet_price = item.price; // Set packet_price = price for receipt
        item.special_price = item.price; // Set special_price = price
        item.category = item.category || 'Others'; // Default category
        item.unit = item.unit || 'unit'; // Default unit
      }
      completed++;
      if (completed === items.length) {
        processTransaction();
      }
    } else {
      // Validate regular product
      Product.getById(item.id, (err, row) => {
        if (err || !row) {
          errors.push(`Invalid product ID: ${item.id}`);
        } else if (row.stock_quantity < item.quantity) {
          errors.push(`Insufficient stock for ${item.name}`);
        } else {
          total += row.special_price * item.quantity;
          item.packet_price = row.packet_price; // Add for receipt
          item.special_price = row.special_price; // Add for receipt
          item.category = row.category; // Add for receipt
          item.unit = row.unit; // Add for receipt
        }
        completed++;
        if (completed === items.length) {
          processTransaction();
        }
      });
    }
  });

  function processTransaction() {
    if (errors.length > 0) {
      return res.status(400).json({ error: errors });
    }
    if (cash_paid < total) {
      return res.status(400).json({ error: 'Insufficient cash' });
    }

    // Update inventory for regular products
    items.forEach((item) => {
      if (!item.is_custom) {
        Product.updateStockDecrease(item.id, item.quantity, (err) => {
          if (err) {
            console.error(`Failed to update stock for product ${item.id}`);
          }
        });
      }
    });

    // Save transaction
    const date = new Date().toISOString();
    const change = cash_paid - total;
    const transaction = { items, total, cash_paid, change, date };
    Transaction.create(transaction, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to save transaction' });
      }
      const receipt = generateReceipt(transaction);
      res.json({ message: 'Transaction successful', receipt });
    });
  }
});

module.exports = router;