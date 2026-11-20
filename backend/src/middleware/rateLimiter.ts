import rateLimit from 'express-rate-limit';

// Global API rate limiter: 500 requests per 15 minutes per IP
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
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
  validate: { xForwardedForHeader: false },
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
  validate: { xForwardedForHeader: false },
  message: {
    message: 'Bạn đã tạo quá nhiều yêu cầu đặt chỗ. Vui lòng thử lại sau 1 giờ.',
  },
});

// Consultation & contact submission limiter: 10 requests per 15 minutes
export const consultationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    message: 'Bạn đã gửi yêu cầu tư vấn nhiều lần. Vui lòng đợi 15 phút trước khi gửi lại.',
  },
});

// Media upload limiter: 50 uploads per 15 minutes
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    message: 'Quá nhiều yêu cầu tải lên tệp tin. Vui lòng thử lại sau 15 phút.',
  },
});

// Search query limiter: 60 requests per minute
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    message: 'Quá nhiều lượt tìm kiếm. Vui lòng thử lại sau giây lát.',
  },
});

// Sensitive public search/validation limiter (coupon check, booking lookup): 30 requests per 15 minutes
export const sensitiveLookupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    message: 'Quá nhiều lượt tra cứu liên tiếp. Vui lòng thử lại sau 15 phút.',
  },
});
