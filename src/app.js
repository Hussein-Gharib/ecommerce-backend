const express = require('express');
const cors = require('cors');
const db = require('./db/db');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Ecommerce API is running 🚀',
  });
});

app.get('/api/health/db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({
      status: 'ok',
      dbTime: result.rows[0].now,
      message: 'Database connection is working ✅',
    });
  } catch (error) {
    console.error('❌ DB health error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed ❌',
    });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY id ASC'
    );

    res.json({
      status: 'ok',
      count: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users',
    });
  }
});


app.use('/api/products', productRoutes);

app.use('/api/auth', authRoutes);

app.use('/api/auth', authRoutes);

module.exports = app;
