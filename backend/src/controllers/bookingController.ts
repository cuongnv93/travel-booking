import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Booking from '../models/Booking';
import Tour from '../models/Tour';
import User from '../models/User';
import Coupon from '../models/Coupon';
import { generateBookingCode, escapeRegex } from '../utils/helpers';
import { AuthRequest } from '../middleware/auth';
import { sendBookingConfirmation } from '../utils/email';

export const create = async (req: AuthRequest, res: Response) => {
  try {
    // travelDate fallback for hotel bookings that use checkIn instead
    const travelDate = req.body.travelDate || req.body.checkIn || new Date();
    
    // Resolve userId: from authenticated user or fallback lookup by email
    let resolvedUserId = req.user?._id;
    if (!resolvedUserId && req.body.customerInfo?.email) {
      try {
        const foundUser = await User.findOne({ email: String(req.body.customerInfo.email).trim().toLowerCase() }).select('_id');
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

    const booking = await Booking.create({
      ...bookingData,
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
      sendBookingConfirmation(booking.customerInfo.email, booking).catch(err => console.error('Failed to send booking email:', err));
    }

    res.status(201).json(booking);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find()
      .populate('tourId', 'title images slug')
      .populate('hotelId', 'name images slug')
      .populate('flightId', 'airline flightNumber from to departureTime arrivalTime duration price logo')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// User's own bookings
export const getByUser = async (req: AuthRequest, res: Response) => {
  try {
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
      return res.status(404).json({ message: 'Booking not found' });
    }
    const booking = await Booking.findById(req.params.id)
      .populate('tourId', 'title images slug destination duration')
      .populate('hotelId', 'name images slug location')
      .populate('flightId', 'airline flightNumber from to departureTime arrivalTime duration price logo')
      .lean();
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // IDOR protection: Non-admin users can only view their own booking
    if (req.user?.role !== 'admin' && String(booking.userId) !== String(req.user?._id)) {
      return res.status(403).json({ message: 'Không có quyền truy cập thông tin đơn đặt chỗ này' });
    }

    res.json(booking);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Public lookup by booking code — no auth required
export const lookupByCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ message: 'Booking code is required' });

    const codeStr = String(code).trim();
    const safeRegex = new RegExp(`^${escapeRegex(codeStr)}$`, 'i');

    const booking = await Booking.findOne({ bookingCode: safeRegex })
      .populate('tourId', 'title images slug destination duration')
      .populate('hotelId', 'name images slug location')
      .populate('flightId', 'airline flightNumber from to departureTime arrivalTime duration price logo');
    if (!booking) return res.status(404).json({ message: 'Không tìm thấy đơn đặt chỗ với mã này' });
    res.json(booking);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// User self-cancel (only pending bookings)
export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
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

    const [total, pending, confirmed, cancelled, revenueAll, revenueMonth, activeTours, totalUsers, recentBookings] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'confirmed' }),
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
    ]);

    // Format recent bookings safely
    const formattedRecent = recentBookings.map(b => ({
      _id: b._id,
      bookingCode: b.bookingCode,
      customerInfo: b.customerInfo || { name: (b as any).userId?.name || 'Guest' },
      totalPrice: b.totalPrice,
      status: b.status
    }));

    res.json({
      totalBookings: total,
      pendingCount: pending,
      confirmedCount: confirmed,
      cancelledCount: cancelled,
      totalRevenue: revenueAll[0]?.total || 0,
      revenueThisMonth: revenueMonth[0]?.total || 0,
      activeTours,
      totalUsers,
      recentBookings: formattedRecent
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
