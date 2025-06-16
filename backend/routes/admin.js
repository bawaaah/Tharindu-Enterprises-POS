const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const adminCredentials = {
  username: process.env.ADMIN_USERNAME,
  passwordHash: bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10)
};

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' });
  }

  if (username !== adminCredentials.username) {
    return res.status(401).json({ error: 'Invalid username' });
  }

  const isPasswordValid = await bcrypt.compare(password, adminCredentials.passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '24h' });
  res.json({ message: 'Login successful', token });
});

module.exports = router;