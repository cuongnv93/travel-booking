import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

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
    const ext = path.extname(file.originalname);
    cb(null, 'img-' + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
});

// Single image upload route: POST /api/upload
router.post('/', upload.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please select an image file to upload' });
  }

  const host = req.get('host') || 'localhost:5000';
  const protocol = req.get('x-forwarded-proto') || req.protocol || 'http';
  const baseUrl = process.env.BACKEND_URL || `${protocol}://${host}`;
  const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

  res.json({
    url: imageUrl,
    path: `/uploads/${req.file.filename}`,
    filename: req.file.filename,
    message: 'Image uploaded successfully'
  });
});

// List uploaded media for Media Library: GET /api/upload
router.get('/', (_req: Request, res: Response) => {
  try {
    if (!fs.existsSync(uploadDir)) {
      return res.json([]);
    }
    const files = fs.readdirSync(uploadDir);
    const host = _req.get('host') || 'localhost:5000';
    const protocol = _req.get('x-forwarded-proto') || _req.protocol || 'http';
    const baseUrl = process.env.BACKEND_URL || `${protocol}://${host}`;
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
});

export default router;
