import rateLimit from 'express-rate-limit';

// Global API rate limiter: 500 requests per 15 minutes per IP
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Quá nhiều yêu cầu từ địa chỉ IP này. Vui lòng thử lại sau 15 phút.',
  },
});

// Strict limiter for Authentication (login, register): 15 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Quá nhiều lần thử đăng nhập/đăng ký. Vui lòng thử lại sau 15 phút.',
  },
});

// Booking creation limiter: 30 bookings per hour
export const bookingCreateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Bạn đã tạo quá nhiều yêu cầu đặt chỗ. Vui lòng thử lại sau 1 giờ.',
  },
});
