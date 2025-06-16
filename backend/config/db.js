const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Ensure data directory exists
const dbDir = path.dirname(process.env.DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(process.env.DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  } else {
    console.log(`Connected to SQLite database at ${process.env.DB_PATH}`);
    db.serialize(() => {
      // Create products table with category and unit
      db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          packet_price REAL NOT NULL,
          special_price REAL NOT NULL,
          stock_quantity REAL NOT NULL, -- REAL for kg-based items
          unit TEXT NOT NULL
        )
      `, (err) => {
        if (err) console.error('Error creating products table:', err.message);
      });

      // Create transactions table (unchanged)
      db.run(`
        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          items TEXT NOT NULL,
          total REAL NOT NULL,
          cash_paid REAL NOT NULL,
          change REAL NOT NULL,
          date TEXT NOT NULL
        )
      `, (err) => {
        if (err) console.error('Error creating transactions table:', err.message);
      });

      // Insert sample products with categories
    //   db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
    //     if (err) {
    //       console.error('Error checking products table:', err.message);
    //     } else if (row.count === 0) {
    //       db.run(`
    //         INSERT INTO products (name, category, packet_price, special_price, stock_quantity, unit)
    //         VALUES 
    //           ('Tomato', 'Vegetables', 1.50, 1.20, 50.0, 'kg'),
    //           ('Spinach', 'Vegetables', 0.80, 0.60, 30.0, 'kg'),
    //           ('Milk 1L', 'Dairy', 2.00, 1.50, 100, 'unit'),
    //           ('Bread', 'Bakery', 1.00, 0.80, 50, 'unit'),
    //           ('Eggs 12pk', 'Dairy', 3.50, 3.00, 30, 'unit'),
    //           ('Rice 1kg', 'Pantry', 2.50, 2.00, 200, 'kg'),
    //           ('Detergent', 'Household', 5.00, 4.50, 20, 'unit')
    //       `, (err) => {
    //         if (err) console.error('Error inserting sample products:', err.message);
    //         else console.log('Sample products inserted.');
    //       });
    //     }
    //   });
    });
  }
});

// Handle database errors
db.on('error', (err) => {
  console.error('Database error:', err.message);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Closing database connection...');
  db.close((err) => {
    if (err) console.error('Error closing database:', err.message);
    console.log('Database connection closed.');
    process.exit(0);
  });
});

module.exports = db;