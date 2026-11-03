import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Booking from '../models/Booking';
import Tour from '../models/Tour';
import User from '../models/User';
import Coupon from '../models/Coupon';
import { generateBookingCode } from '../utils/helpers';
import { AuthRequest } from '../middleware/auth';
import { sendBookingConfirmation } from '../utils/email';

export const create = async (req: AuthRequest, res: Response) => {
  try {
    // travelDate fallback for hotel bookings that use checkIn instead
    const travelDate = req.body.travelDate || req.body.checkIn || new Date();

    // Resolve userId: from authenticated user or fallback lookup by email
    let resolvedUserId = req.user?._id;
    const customerEmail = req.body.customerInfo?.email
      ? String(req.body.customerInfo.email).trim().toLowerCase()
      : '';

    if (!resolvedUserId && customerEmail) {
      try {
        const foundUser = await User.findOne({ email: customerEmail }).select('_id');
        if (foundUser) {
          resolvedUserId = foundUser._id;
        }
      } catch {
        // Non-blocking fallback
      }
    }

    // Clean up IDs to guarantee Mongoose never throws CastError
    const bookingData: any = { ...req.body };
    if (bookingData.flightId && !mongoose.Types.ObjectId.isValid(bookingData.flightId)) {
      delete bookingData.flightId;
    }
    if (bookingData.tourId && !mongoose.Types.ObjectId.isValid(bookingData.tourId)) {
      delete bookingData.tourId;
    }
    if (bookingData.hotelId && !mongoose.Types.ObjectId.isValid(bookingData.hotelId)) {
      delete bookingData.hotelId;
    }

    // Sanitize customer info
    const customerInfo = {
      name: String(req.body.customerInfo?.name || '').trim(),
      email: customerEmail,
      phone: String(req.body.customerInfo?.phone || '').trim(),
      address: req.body.customerInfo?.address ? String(req.body.customerInfo.address).trim() : undefined,
      notes: req.body.customerInfo?.notes ? String(req.body.customerInfo.notes).trim() : undefined,
    };

    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ họ tên, email và số điện thoại' });
    }

    const rawTotalPrice = Number(bookingData.totalPrice) || 0;
    const sanitizedTotalPrice = Math.max(0, rawTotalPrice);

    const booking = await Booking.create({
      ...bookingData,
      customerInfo,
      totalPrice: sanitizedTotalPrice,
      status: 'pending',
      paymentStatus: 'pending',
      travelDate,
      bookingCode: generateBookingCode(),
      userId: resolvedUserId,
    });

    // Track coupon usage atomically if coupon was applied
    if (booking.couponCode) {
      try {
        await Coupon.findOneAndUpdate(
          { code: String(booking.couponCode).trim().toUpperCase() },
          { $inc: { currentUses: 1 } }
        );
      } catch (couponErr) {
        console.warn('Coupon usage tracking skipped:', couponErr);
      }
    }

    // Asynchronously send email without blocking the response
    if (booking.customerInfo?.email) {
      sendBookingConfirmation(booking.customerInfo.email, booking).catch((err) =>
        console.error('Failed to send booking email:', err)
      );
    }

    res.status(201).json(booking);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }
    if (req.query.type && req.query.type !== 'all') {
      filter.type = req.query.type;
    }

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('tourId', 'title images slug destination duration')
        .populate('hotelId', 'name images slug location')
        .populate('flightId', 'airline flightNumber from to departureTime arrivalTime duration price logo')
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments(filter),
    ]);

    // Backward-compatible response: if client did not ask for pagination params, return array directly
    if (!req.query.page && !req.query.limit) {
      return res.json(bookings);
    }

    res.json({
      data: bookings,
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

// User's own bookings
export const getByUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('tourId', 'title images slug destination duration')
      .populate('hotelId', 'name images slug location')
      .populate('flightId', 'airline flightNumber from to departureTime arrivalTime duration price logo')
      .sort({ createdAt: -1 })
      .lean();
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getById = async (req: AuthRequest, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Không tìm thấy đơn đặt chỗ' });
    }
    const booking = await Booking.findById(req.params.id)
      .populate('tourId', 'title images slug destination duration')
      .populate('hotelId', 'name images slug location')
      .populate('flightId', 'airline flightNumber from to departureTime arrivalTime duration price logo')
      .lean();
    if (!booking) return res.status(404).json({ message: 'Không tìm thấy đơn đặt chỗ' });

    // IDOR protection: Non-admin users can only view their own booking
    const isOwner = booking.userId && booking.userId.toString() === req.user?._id?.toString();
    const isAdmin = req.user?.role === 'admin';
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Không có quyền truy cập thông tin đơn đặt chỗ này' });
    }

    res.json(booking);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Public lookup by booking code — uses exact indexed match for O(1) performance.
 */
export const lookupByCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ message: 'Vui lòng cung cấp mã đơn đặt chỗ' });
    }

    const codeStr = code.trim().toUpperCase();

    // Exact indexed lookup O(1)
    const booking = await Booking.findOne({ bookingCode: codeStr })
      .populate('tourId', 'title images slug destination duration')
      .populate('hotelId', 'name images slug location')
      .populate('flightId', 'airline flightNumber from to departureTime arrivalTime duration price logo')
      .lean();

    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đơn đặt chỗ với mã này' });
    }

    res.json(booking);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Không tìm thấy đơn đặt chỗ' });
    }

    const previousBooking = await Booking.findById(req.params.id);
    if (!previousBooking) return res.status(404).json({ message: 'Không tìm thấy đơn đặt chỗ' });

    const updateData: any = {};
    if (req.body.status) updateData.status = req.body.status;
    if (req.body.paymentStatus) updateData.paymentStatus = req.body.paymentStatus;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Không tìm thấy đơn đặt chỗ' });

    // Rollback coupon usage if status changed to cancelled
    if (req.body.status === 'cancelled' && previousBooking.status !== 'cancelled' && booking.couponCode) {
      try {
        await Coupon.findOneAndUpdate(
          { code: String(booking.couponCode).trim().toUpperCase(), currentUses: { $gt: 0 } },
          { $inc: { currentUses: -1 } }
        );
      } catch (couponErr) {
        console.warn('Coupon rollback skipped on admin cancel:', couponErr);
      }
    }

    // Re-increment coupon usage if restored from cancelled to active
    if (previousBooking.status === 'cancelled' && req.body.status && req.body.status !== 'cancelled' && booking.couponCode) {
      try {
        await Coupon.findOneAndUpdate(
          { code: String(booking.couponCode).trim().toUpperCase() },
          { $inc: { currentUses: 1 } }
        );
      } catch (couponErr) {
        console.warn('Coupon re-increment skipped:', couponErr);
      }
    }

    res.json(booking);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// User self-cancel (only pending bookings)
export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Không tìm thấy đơn đặt chỗ' });
    }
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id });
    if (!booking) return res.status(404).json({ message: 'Không tìm thấy đơn đặt chỗ' });
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Chỉ có thể hủy đơn đang ở trạng thái chờ xác nhận' });
    }
    booking.status = 'cancelled';
    await booking.save();

    // Rollback coupon usage if applicable
    if (booking.couponCode) {
      try {
        await Coupon.findOneAndUpdate(
          { code: String(booking.couponCode).trim().toUpperCase(), currentUses: { $gt: 0 } },
          { $inc: { currentUses: -1 } }
        );
      } catch (couponErr) {
        console.warn('Coupon rollback skipped:', couponErr);
      }
    }

    res.json(booking);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Admin stats dashboard
export const getStats = async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, pending, confirmed, completed, cancelled, revenueAll, revenueMonth, activeTours, totalUsers, recentBookings] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'cancelled' }),
      Booking.aggregate([
        { $match: { status: { $in: ['confirmed', 'completed'] } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      Booking.aggregate([
        { $match: { status: { $in: ['confirmed', 'completed'] }, createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      Tour.countDocuments(),
      User.countDocuments(),
      Booking.find()
        .populate('tourId', 'title images slug')
        .populate('hotelId', 'name images slug')
        .populate('flightId', 'airline flightNumber from to')
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const formattedRecent = recentBookings.map((b) => ({
      _id: b._id,
      bookingCode: b.bookingCode,
      customerInfo: b.customerInfo || { name: (b as any).userId?.name || 'Guest' },
      totalPrice: b.totalPrice,
      status: b.status,
    }));

    res.json({
      totalBookings: total,
      pendingCount: pending,
      confirmedCount: confirmed,
      completedCount: completed,
      cancelledCount: cancelled,
      totalRevenue: revenueAll[0]?.total || 0,
      revenueThisMonth: revenueMonth[0]?.total || 0,
      activeTours,
      totalUsers,
      recentBookings: formattedRecent,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
