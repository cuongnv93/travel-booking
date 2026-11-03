import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'img-' + uniqueSuffix + ext);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (file.mimetype.startsWith('image/') || allowedMime.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận các tệp tin hình ảnh (JPG, PNG, WEBP, GIF, SVG)!'));
    }
  },
});

export const uploadSingle = (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Vui lòng chọn một tệp hình ảnh để tải lên' });
  }

  const host = req.get('host') || 'localhost:5000';
  const protocol = req.get('x-forwarded-proto') || req.protocol || 'http';
  const baseUrl = process.env.BACKEND_URL || `${protocol}://${host}`;
  const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

  res.status(201).json({
    url: imageUrl,
    path: `/uploads/${req.file.filename}`,
    filename: req.file.filename,
    size: req.file.size,
    message: 'Tải hình ảnh lên thành công',
  });
};

export const listMedia = (req: Request, res: Response) => {
  try {
    if (!fs.existsSync(uploadDir)) {
      return res.json([]);
    }

    const host = req.get('host') || 'localhost:5000';
    const protocol = req.get('x-forwarded-proto') || req.protocol || 'http';
    const baseUrl = process.env.BACKEND_URL || `${protocol}://${host}`;

    const files = fs.readdirSync(uploadDir);
    const images = files
      .filter((file) => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file))
      .map((file) => {
        try {
          const stats = fs.statSync(path.join(uploadDir, file));
          return {
            filename: file,
            url: `${baseUrl}/uploads/${file}`,
            createdAt: stats.mtime,
            size: stats.size,
          };
        } catch {
          return {
            filename: file,
            url: `${baseUrl}/uploads/${file}`,
            createdAt: new Date(),
            size: 0,
          };
        }
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(images);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMedia = (req: Request, res: Response) => {
  try {
    const rawFilename = req.params.filename;
    if (!rawFilename) {
      return res.status(400).json({ message: 'Tên tệp không hợp lệ' });
    }

    // Path traversal mitigation: strictly extract base filename
    const safeFilename = path.basename(rawFilename);
    const targetPath = path.join(uploadDir, safeFilename);

    if (!fs.existsSync(targetPath)) {
      return res.status(404).json({ message: 'Không tìm thấy tệp tin cần xóa' });
    }

    fs.unlinkSync(targetPath);
    res.json({ message: 'Đã xóa tệp tin thành công', filename: safeFilename });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
