import { Request, Response } from 'express';
import Booking from '../models/Booking';
import { generateBookingCode } from '../utils/helpers';
import { AuthRequest } from '../middleware/auth';
import { sendBookingConfirmation } from '../utils/email';

export const create = async (req: AuthRequest, res: Response) => {
  try {
    // travelDate fallback for hotel bookings that use checkIn instead
    const travelDate = req.body.travelDate || req.body.checkIn || new Date();
    const booking = await Booking.create({
      ...req.body,
      travelDate,
      bookingCode: generateBookingCode(),
      userId: req.user?._id,
    });
    
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
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
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
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('tourId', 'title images slug destination duration')
      .populate('hotelId', 'name images slug location');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
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

    const booking = await Booking.findOne({ bookingCode: code as string })
      .populate('tourId', 'title images slug destination duration')
      .populate('hotelId', 'name images slug location');
    if (!booking) return res.status(404).json({ message: 'Không tìm thấy đơn đặt chỗ với mã này' });
    res.json(booking);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
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
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Chỉ có thể hủy đơn đang ở trạng thái chờ xác nhận' });
    }
    booking.status = 'cancelled';
    await booking.save();
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
      // Import Tour and User here dynamically or just use mongoose.model
      require('mongoose').model('Tour').countDocuments(),
      require('mongoose').model('User').countDocuments(),
      Booking.find()
        .populate('tourId', 'title images slug')
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
