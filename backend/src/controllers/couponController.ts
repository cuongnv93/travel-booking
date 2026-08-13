import { Request, Response } from 'express';
import Coupon from '../models/Coupon';

export const create = async (req: Request, res: Response) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Mã giảm giá đã tồn tại' });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
    res.json(coupon);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
    res.json({ message: 'Đã xóa mã giảm giá' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const validate = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Vui lòng nhập mã giảm giá' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) return res.status(404).json({ message: 'Mã giảm giá không hợp lệ' });
    if (!coupon.isActive) return res.status(400).json({ message: 'Mã giảm giá đã bị vô hiệu hóa' });
    if (new Date(coupon.validUntil) < new Date()) return res.status(400).json({ message: 'Mã giảm giá đã hết hạn' });
    if (coupon.usageLimit > 0 && coupon.currentUses >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Mã giảm giá đã hết lượt sử dụng' });
    }

    res.json(coupon);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
