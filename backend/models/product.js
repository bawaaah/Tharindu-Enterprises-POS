const db = require('../config/db');

const Product = {
  search: (query, category, callback) => {
    const searchQuery = query ? `%${query}%` : '%';
    const categoryQuery = category || '%';
    db.all(
      'SELECT * FROM products WHERE name LIKE ? AND category LIKE ? AND stock_quantity > 0',
      [searchQuery, categoryQuery],
      callback
    );
  },
  getById: (id, callback) => {
    db.get(
      'SELECT * FROM products WHERE id = ?',
      [id],
      callback
    );
  },
  updateStockDecrease: (id, quantity, callback) => {
    db.run(
      'UPDATE products SET stock_quantity = MAX(stock_quantity - ?, 0) WHERE id = ?',
      [quantity, id],
      callback
    );
  },
  updateStockIncrease: (id, quantity, callback) => {
    db.run(
      'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
      [quantity, id],
      callback
    );
  },
  add: (product, callback) => {
    const { name, category, packet_price, special_price, stock_quantity, unit } = product;
    db.run(
      'INSERT INTO products (name, category, packet_price, special_price, stock_quantity, unit) VALUES (?, ?, ?, ?, ?, ?)',
      [name, category, packet_price, special_price, stock_quantity, unit],
      callback
    );
  },
  getCategories: (callback) => {
    db.all('SELECT DISTINCT category FROM products', callback);
  }

  ,
  getAll: (callback) => {
    db.all('SELECT * FROM products', callback);
  },
  filterByCategory: (category, callback) => {
    db.all(
      'SELECT * FROM products WHERE category = ?',
      [category],
      callback
    );
  },
  delete: (id, callback) => {
    db.run(
      'DELETE FROM products WHERE id = ?',
      [id],
      callback
    );
  }
};

module.exports = Product;