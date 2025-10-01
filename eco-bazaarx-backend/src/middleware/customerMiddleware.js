// src/middleware/customerMiddleware.js
import { verifyToken } from './authMiddleware.js';

export const verifyCustomer = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && req.user.role === 'customer') {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Customers only.' });
    }
  });
};
