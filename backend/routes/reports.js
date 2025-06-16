const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

router.get('/', (req, res) => {
  const { type, date } = req.query;
  if (!type || !['daily', 'weekly', 'monthly'].includes(type)) {
    return res.status(400).json({ error: 'Invalid or missing report type' });
  }
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Invalid or missing date (YYYY-MM-DD)' });
  }

  let startDate, endDate;
  const inputDate = new Date(date);
  if (isNaN(inputDate)) {
    return res.status(400).json({ error: 'Invalid date format' });
  }

  if (type === 'daily') {
    startDate = new Date(inputDate.setHours(0, 0, 0, 0)).toISOString();
    endDate = new Date(inputDate.setHours(23, 59, 59, 999)).toISOString();
  } else if (type === 'weekly') {
    const firstDay = new Date(inputDate.setDate(inputDate.getDate() - inputDate.getDay()));
    firstDay.setHours(0, 0, 0, 0);
    startDate = firstDay.toISOString();
    endDate = new Date(firstDay.setDate(firstDay.getDate() + 6));
    endDate.setHours(23, 59, 59, 999);
    endDate = endDate.toISOString();
  } else if (type === 'monthly') {
    startDate = new Date(inputDate.getFullYear(), inputDate.getMonth(), 1).toISOString();
    endDate = new Date(inputDate.getFullYear(), inputDate.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
  }

  db.all(
    'SELECT * FROM transactions WHERE date >= ? AND date <= ?',
    [startDate, endDate],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const report = {
        type,
        startDate,
        endDate,
        totalSales: 0,
        transactionCount: rows.length,
        itemsSold: []
      };

      const itemMap = new Map();
      rows.forEach(row => {
        report.totalSales += row.total;
        const items = JSON.parse(row.items);
        items.forEach(item => {
          const key = `${item.name}-${item.is_custom ? 'custom' : 'regular'}`;
          const existing = itemMap.get(key) || { name: item.name, is_custom: item.is_custom, quantity: 0, total: 0 };
          existing.quantity += item.quantity;
          existing.total += item.special_price * item.quantity;
          itemMap.set(key, existing);
        });
      });

      report.itemsSold = Array.from(itemMap.values()).map(item => ({
        name: item.is_custom ? `${item.name} (Custom)` : item.name,
        quantity: item.quantity,
        total: item.total.toFixed(2)
      }));
      report.totalSales = report.totalSales.toFixed(2);

      res.json(report);
    }
  );
});

module.exports = router;