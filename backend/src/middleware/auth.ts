import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { constants } from '../config/constants';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser & { _id: any };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Không có quyền truy cập, thiếu token xác thực' });
  }

  try {
    const decoded = jwt.verify(token, constants.JWT_SECRET as string) as { id: string };
    const user = await User.findById(decoded.id).select('-password').lean();
    if (!user) {
      return res.status(401).json({ message: 'Tài khoản không tồn tại hoặc đã bị khóa' });
    }
    req.user = user as any;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Phiên xác thực không hợp lệ hoặc đã hết hạn' });
  }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Yêu cầu quyền Quản trị viên (Admin)' });
  }
};

export const optionalProtect = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, constants.JWT_SECRET as string) as { id: string };
    const user = await User.findById(decoded.id).select('-password').lean();
    if (user) {
      req.user = user as any;
    }
  } catch {
    // Continue as guest if token is expired or invalid
  }
  next();
};
