import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Booking from '../models/Booking';
import Tour from '../models/Tour';
import Hotel from '../models/Hotel';
import Flight from '../models/Flight';
import User from '../models/User';
import Coupon from '../models/Coupon';
import { generateBookingCode } from '../utils/helpers';
import { AuthRequest } from '../middleware/auth';
import { sendBookingConfirmation } from '../utils/email';

export const create = async (req: AuthRequest, res: Response) => {
  try {
    // travelDate fallback for hotel bookings that use checkIn instead
    const travelDate = req.body.travelDate || req.body.checkIn || new Date();

    // Resolve userId: ONLY from authenticated session to prevent fraud/account pollution
    const resolvedUserId = req.user?._id || undefined;

    const customerEmail = req.body.customerInfo?.email
      ? String(req.body.customerInfo.email).trim().toLowerCase()
      : '';

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

    // Server-side price recalculation to prevent price tampering
    let calculatedTotalPrice = 0;
    const adults = Math.max(1, Number(bookingData.guests?.adults) || 1);
    const children = Math.max(0, Number(bookingData.guests?.children) || 0);

    if (bookingData.type === 'tour' && bookingData.tourId) {
      const tour = await Tour.findById(bookingData.tourId).lean();
      if (!tour) {
        return res.status(404).json({ message: 'Tour du lịch không tồn tại hoặc đã ngừng phục vụ' });
      }
      const basePrice = (tour.isFlashSale && tour.flashSalePrice && tour.flashSalePrice > 0)
        ? tour.flashSalePrice
        : tour.price;
      const childPrice = Math.round(basePrice * 0.7);
      calculatedTotalPrice = adults * basePrice + children * childPrice;
    } else if (bookingData.type === 'hotel' && bookingData.hotelId) {
      const hotel = await Hotel.findById(bookingData.hotelId).lean();
      if (!hotel) {
        return res.status(404).json({ message: 'Khách sạn không tồn tại hoặc đã ngừng phục vụ' });
      }
      const checkInDate = new Date(bookingData.checkIn || travelDate);
      const checkOutDate = new Date(bookingData.checkOut || travelDate);
      let nights = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      if (isNaN(nights) || nights < 1) nights = 1;
      const rooms = Math.max(1, Number(bookingData.rooms) || 1);

      let roomPrice = (hotel.isFlashSale && hotel.flashSalePrice && hotel.flashSalePrice > 0)
        ? hotel.flashSalePrice
        : (hotel.pricePerNight || 0);

      if (bookingData.roomType && Array.isArray(hotel.rooms)) {
        const matchedRoom = hotel.rooms.find((r: any) => r.type === bookingData.roomType || r.name === bookingData.roomType);
        if (matchedRoom && matchedRoom.price > 0) {
          roomPrice = matchedRoom.price;
        }
      }
      calculatedTotalPrice = roomPrice * rooms * nights;
    } else if (bookingData.type === 'flight' && bookingData.flightId) {
      const flight = await Flight.findById(bookingData.flightId).lean();
      if (!flight) {
        return res.status(404).json({ message: 'Chuyến bay không tồn tại' });
      }
      calculatedTotalPrice = flight.price * (adults + children);
    } else {
      // Fallback for custom / combo bookings
      calculatedTotalPrice = Math.max(0, Number(bookingData.totalPrice) || 0);
    }

    // Atomic Coupon Validation & Reservation
    let discountAmount = 0;
    if (bookingData.couponCode) {
      const cleanCouponCode = String(bookingData.couponCode).trim().toUpperCase();
      const appliedCoupon = await Coupon.findOneAndUpdate(
        {
          code: cleanCouponCode,
          isActive: true,
          validUntil: { $gte: new Date() },
          $or: [{ usageLimit: 0 }, { $expr: { $lt: ['$currentUses', '$usageLimit'] } }],
        },
        { $inc: { currentUses: 1 } },
        { new: true }
      );

      if (!appliedCoupon) {
        return res.status(400).json({ message: 'Mã giảm giá không hợp lệ, đã hết hạn hoặc hết lượt sử dụng' });
      }

      discountAmount = appliedCoupon.discountAmount || 0;
      discountAmount = Math.min(discountAmount, calculatedTotalPrice);
      calculatedTotalPrice = Math.max(0, calculatedTotalPrice - discountAmount);
    }

    const booking = await Booking.create({
      ...bookingData,
      customerInfo,
      totalPrice: calculatedTotalPrice,
      discount: discountAmount,
      status: 'pending',
      paymentStatus: 'pending',
      travelDate,
      bookingCode: generateBookingCode(),
      userId: resolvedUserId,
    });

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
    const { code, phone } = req.query;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ message: 'Vui lòng cung cấp mã đơn đặt chỗ' });
    }

    const codeStr = code.trim().toUpperCase();
    const query: any = { bookingCode: codeStr };

    if (phone && typeof phone === 'string') {
      query['customerInfo.phone'] = phone.trim();
    }

    const booking: any = await Booking.findOne(query)
      .populate('tourId', 'title images slug destination duration')
      .populate('hotelId', 'name images slug location')
      .populate('flightId', 'airline flightNumber from to departureTime arrivalTime duration price logo')
      .lean();

    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đơn đặt chỗ với thông tin đã cung cấp' });
    }

    // Mask sensitive PII in public lookup if phone verification was omitted
    if (!phone && booking.customerInfo) {
      const p = String(booking.customerInfo.phone || '');
      const e = String(booking.customerInfo.email || '');
      booking.customerInfo = {
        name: booking.customerInfo.name,
        phone: p.length > 6 ? p.slice(0, 3) + '****' + p.slice(-3) : '***',
        email: e.replace(/(.{2})(.*)(?=@)/, '$1***'),
      };
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
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Đơn hàng đã thanh toán không thể tự hủy. Vui lòng liên hệ bộ phận chăm sóc khách hàng để yêu cầu hoàn tiền.' });
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

// Admin stats dashboard with 100% REAL database metrics & month-over-month growth calculations
export const getStats = async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const startOfThisMonth = new Date(currentYear, currentMonth, 1);
    const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfLastMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);

    const [
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      revenueAll,
      revenueMonth,
      revenuePrevMonth,
      bookingsThisMonth,
      bookingsPrevMonth,
      activeTours,
      totalUsers,
      usersThisMonth,
      usersPrevMonth,
      monthlyAgg,
      recentBookings,
    ] = await Promise.all([
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
        { $match: { status: { $in: ['confirmed', 'completed'] }, createdAt: { $gte: startOfThisMonth } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      Booking.aggregate([
        {
          $match: {
            status: { $in: ['confirmed', 'completed'] },
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          },
        },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      Booking.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      Booking.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      Tour.countDocuments({ isActive: { $ne: false } }),
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      User.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      Booking.aggregate([
        { $match: { createdAt: { $gte: startOfYear, $lte: endOfYear } } },
        {
          $group: {
            _id: { $month: '$createdAt' },
            revenue: {
              $sum: {
                $cond: [{ $in: ['$status', ['confirmed', 'completed']] }, '$totalPrice', 0],
              },
            },
            bookings: { $sum: 1 },
          },
        },
      ]),
      Booking.find()
        .populate('tourId', 'title images slug')
        .populate('hotelId', 'name images slug')
        .populate('flightId', 'airline flightNumber from to')
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const revThis = revenueMonth[0]?.total || 0;
    const revLast = revenuePrevMonth[0]?.total || 0;
    let revenueGrowth = 0;
    if (revLast > 0) {
      revenueGrowth = Math.round(((revThis - revLast) / revLast) * 100 * 10) / 10;
    } else if (revThis > 0) {
      revenueGrowth = 100;
    }

    let bookingsGrowth = 0;
    if (bookingsPrevMonth > 0) {
      bookingsGrowth = Math.round(((bookingsThisMonth - bookingsPrevMonth) / bookingsPrevMonth) * 100 * 10) / 10;
    } else if (bookingsThisMonth > 0) {
      bookingsGrowth = 100;
    }

    let usersGrowth = 0;
    if (usersPrevMonth > 0) {
      usersGrowth = Math.round(((usersThisMonth - usersPrevMonth) / usersPrevMonth) * 100 * 10) / 10;
    } else if (usersThisMonth > 0) {
      usersGrowth = 100;
    }

    // Build real 12-month data series
    const MONTH_LABELS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    const monthlyData = MONTH_LABELS.map((monthLabel, idx) => {
      const monthNum = idx + 1;
      const found = monthlyAgg.find((m: any) => m._id === monthNum);
      return {
        month: monthLabel,
        revenue: found ? found.revenue : 0,
        bookings: found ? found.bookings : 0,
      };
    });

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
      revenueThisMonth: revThis,
      revenueGrowth,
      hasPrevRevenueData: revLast > 0,
      bookingsThisMonth,
      bookingsGrowth,
      hasPrevBookingData: bookingsPrevMonth > 0,
      activeTours,
      totalUsers,
      usersThisMonth,
      usersGrowth,
      hasPrevUserData: usersPrevMonth > 0,
      monthlyData,
      recentBookings: formattedRecent,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
