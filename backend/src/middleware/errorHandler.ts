import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Lỗi máy chủ nội bộ';

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Không tìm thấy tài nguyên với định dạng ID: ${err.value}`;
  }

  // Handle Mongoose Duplicate Key Error (Code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'dữ liệu';
    message = `Giá trị của '${field}' đã tồn tại trong hệ thống.`;
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors || {})
      .map((val: any) => val.message)
      .join(', ');
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Phiên đăng nhập không hợp lệ.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  }

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'Kích thước tệp quá lớn. Giới hạn tối đa là 10MB.';
    } else {
      message = `Lỗi tải tệp tin lên: ${err.message}`;
    }
  } else if (err.message === 'Only image files are allowed!') {
    statusCode = 400;
    message = 'Chỉ chấp nhận các tệp tin hình ảnh (JPG, PNG, WEBP, GIF, SVG).';
  }

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
