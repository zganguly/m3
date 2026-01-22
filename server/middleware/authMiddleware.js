import jwt from 'jsonwebtoken';
import AuthUser from '../models/Auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const authUser = await AuthUser.findById(decoded.userId).select('_id name email');
    
    if (!authUser) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.authUser = {
      id: authUser._id.toString(),
      name: authUser.name,
      email: authUser.email
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
