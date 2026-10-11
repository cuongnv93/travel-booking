import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { constants } from '../config/constants';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, constants.JWT_SECRET) as any;
    const user = await User.findById(decoded.id).select('-password').lean();
    if (!user) {
      return res.status(401).json({ message: 'User not found or account deactivated' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

export const optionalProtect = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, constants.JWT_SECRET) as any;
    const user = await User.findById(decoded.id).select('-password').lean();
    if (user) {
      req.user = user;
    }
  } catch {
    // If token is invalid or expired, continue as guest without blocking
  }
  next();
};

