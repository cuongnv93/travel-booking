import { Request, Response } from 'express';
import Consultation from '../models/Consultation';
import { escapeRegex } from '../utils/helpers';

export const create = async (req: Request, res: Response) => {
  try {
    const { name, phone, email, country, travelDate, guests, type, notes } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: 'Vui lòng cung cấp họ tên và số điện thoại liên hệ' });
    }

    const consultation = await Consultation.create({
      name: String(name).trim(),
      phone: String(phone).trim(),
      email: email ? String(email).trim() : undefined,
      country: country ? String(country).trim() : undefined,
      travelDate: travelDate ? String(travelDate).trim() : undefined,
      guests: guests ?? 1,
      type: ['visa', 'tour', 'hotel', 'general'].includes(type) ? type : 'visa',
      notes: notes ? String(notes).trim() : undefined,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Đăng ký tư vấn thành công! Chuyên viên sẽ sớm liên hệ lại.',
      data: consultation,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Lỗi hệ thống khi tạo yêu cầu tư vấn' });
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const { status, type, search, page = 1, limit = 50 } = req.query;

    const filter: any = {};

    if (status && typeof status === 'string' && status !== 'all') {
      filter.status = status;
    }

    if (type && typeof type === 'string' && type !== 'all') {
      filter.type = type;
    }

    if (search && typeof search === 'string' && search.trim()) {
      const sanitized = escapeRegex(search.trim());
      filter.$or = [
        { name: { $regex: sanitized, $options: 'i' } },
        { phone: { $regex: sanitized, $options: 'i' } },
        { email: { $regex: sanitized, $options: 'i' } },
        { country: { $regex: sanitized, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Consultation.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Consultation.countDocuments(filter),
    ]);

    res.json({
      items,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const allowedStatuses = ['pending', 'contacted', 'completed', 'cancelled'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái cập nhật không hợp lệ' });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const updated = await Consultation.findByIdAndUpdate(id, updateData, { new: true }).lean();

    if (!updated) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu tư vấn' });
    }

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await Consultation.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu tư vấn' });
    }

    res.json({ success: true, message: 'Đã xóa yêu cầu tư vấn' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getStats = async (_req: Request, res: Response) => {
  try {
    const [total, pending, contacted, completed] = await Promise.all([
      Consultation.countDocuments(),
      Consultation.countDocuments({ status: 'pending' }),
      Consultation.countDocuments({ status: 'contacted' }),
      Consultation.countDocuments({ status: 'completed' }),
    ]);

    res.json({
      total,
      pending,
      contacted,
      completed,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
