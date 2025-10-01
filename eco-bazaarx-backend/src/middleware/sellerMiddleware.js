import { verifyToken } from './authMiddleware.js';

export const verifySeller = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && req.user.role === 'seller') {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Sellers only.' });
    }
  });
};
