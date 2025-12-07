const express = require('express');
const cors = require('cors');
const db = require('./db/db'); 
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

module.exports = app;
