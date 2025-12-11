const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = '7d';


const register = async (req, res) => {
  const { name, email, password } = req.body;


  if (!name || !email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Name, email and password are required',
    });
  }

  try {
    const existing = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existing.rowCount > 0) {
      return res.status(409).json({
        status: 'error',
        message: 'Email already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, role, created_at`,
      [name, email, hashedPassword]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      status: 'ok',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error('❌ Register error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Register failed',
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Email and password are required',
    });
  }

  try {
    const result = await db.query(
      `SELECT id, name, email, password_hash, role, created_at
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      });
    }

    delete user.password_hash;

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      status: 'ok',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Login failed',
    });
  }
};

const me = async (req,res)=>{
    try{
        const result = await db.query(
            `SELECT idm name, email, role, createdf_at
            FROM users
            WHERE id = $1`,
            [req.user.userId]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({
                status:'error',
                message:'User not found',
            });
        }
        return res.json({
            status:'ok',
            data: result.rows[0],
        });
    } catch (error) {
        console.error('❌ Me error:', error.message);
        res.status(500).json({
            status:'ok',
            message:'Failed to get profile',
        });
    }
}
module.exports = {
  register,
  login,
  me,
};
