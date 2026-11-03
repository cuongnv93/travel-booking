import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { constants } from '../config/constants';
import { AuthRequest } from '../middleware/auth';

const generateTokens = (id: string) => {
  const accessToken = jwt.sign(
    { id },
    constants.JWT_SECRET as string,
    { expiresIn: (constants.JWT_EXPIRE || '1h') as any }
  );
  const refreshToken = jwt.sign(
    { id },
    constants.JWT_REFRESH_SECRET as string,
    { expiresIn: (constants.JWT_REFRESH_EXPIRE || '7d') as any }
  );
  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ họ tên, email và mật khẩu' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Mật khẩu phải chứa ít nhất 6 ký tự' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name).trim();
    const cleanPhone = phone ? String(phone).trim() : '';

    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ message: 'Email này đã được đăng ký trong hệ thống' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      phone: cleanPhone,
    });

    const tokens = generateTokens(user._id as unknown as string);
    res.status(201).json({
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        role: user.role,
        avatar: user.avatar || '',
      },
      ...tokens,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
    }

    const tokens = generateTokens(user._id as unknown as string);
    res.json({
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        role: user.role,
        avatar: user.avatar || '',
      },
      ...tokens,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(401).json({ message: 'Yêu cầu refresh token' });

    const decoded = jwt.verify(token, constants.JWT_REFRESH_SECRET as string) as any;
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Token không hợp lệ' });

    const tokens = generateTokens(user._id as unknown as string);
    res.json(tokens);
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  res.json(req.user);
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }

    const { name, phone, address, avatar } = req.body;
    const allowedUpdates: Record<string, any> = {};
    if (name !== undefined) allowedUpdates.name = String(name).trim();
    if (phone !== undefined) allowedUpdates.phone = String(phone).trim();
    if (address !== undefined) allowedUpdates.address = String(address).trim();
    if (avatar !== undefined) allowedUpdates.avatar = String(avatar).trim();

    const user = await User.findByIdAndUpdate(req.user._id, allowedUpdates, { new: true }).select('-password');
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 100));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.role && req.query.role !== 'all') {
      filter.role = req.query.role;
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    // Backward-compatibility: if client did not ask for pagination, return array directly
    if (!req.query.page && !req.query.limit) {
      return res.json(users);
    }

    res.json({
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Quyền vai trò không hợp lệ' });
    }
    const currentUserId = (req as any).user?._id?.toString();
    if (currentUserId && currentUserId === req.params.id && role !== 'admin') {
      return res.status(400).json({ message: 'Không thể tự hạ quyền quản trị viên của chính mình' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    const currentUserId = (req as any).user?._id?.toString();
    if (currentUserId && currentUserId === req.params.id) {
      return res.status(400).json({ message: 'Không thể tự xóa tài khoản quản trị của chính mình' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.json({ message: 'Xóa tài khoản người dùng thành công' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
