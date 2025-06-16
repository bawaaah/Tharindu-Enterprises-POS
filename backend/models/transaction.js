const db = require('../config/db');

const Transaction = {
  create: (transaction, callback) => {
    const { items, total, cash_paid, change, date } = transaction;
    db.run(
      'INSERT INTO transactions (items, total, cash_paid, change, date) VALUES (?, ?, ?, ?, ?)',
      [JSON.stringify(items), total, cash_paid, change, date],
      callback
    );
  }
};

module.exports = Transaction;