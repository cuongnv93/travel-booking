const fs = require('fs');
const path = require('path');

const basePath = 'e:/project/travel-booking/backend';

const directories = [
  'src/config',
  'src/models',
  'src/controllers',
  'src/routes',
  'src/middleware',
  'src/services',
  'src/utils',
  'src/seed'
];

directories.forEach(dir => {
  fs.mkdirSync(path.join(basePath, dir), { recursive: true });
});

const files = {
  'package.json': `{
  "name": "travel-booking-backend",
  "version": "1.0.0",
  "description": "Travel Booking API",
  "main": "dist/server.js",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "seed": "ts-node-dev src/seed/seedData.ts"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cloudinary": "^1.41.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-validator": "^7.0.1",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.0.1",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "node-cache": "^5.1.2"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.16",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/morgan": "^1.9.9",
    "@types/multer": "^1.4.10",
    "@types/node": "^20.9.0",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.2.2"
  }
}
`,
  'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "rootDir": "./src",
    "outDir": "./dist",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"]
}
`,
  '.env.example': `PORT=5000
MONGODB_URI=mongodb://localhost:27017/travel-booking
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:3000
`,
  'src/config/database.ts': `import mongoose from 'mongoose';
import { constants } from './constants';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(constants.MONGODB_URI);
    console.log(\`MongoDB Connected: \${conn.connection.host}\`);
  } catch (error) {
    console.error(\`Error connecting to MongoDB: \${error}\`);
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;
`,
  'src/config/cloudinary.ts': `import { v2 as cloudinary } from 'cloudinary';
import { constants } from './constants';

cloudinary.config({
  cloud_name: constants.CLOUDINARY_CLOUD_NAME,
  api_key: constants.CLOUDINARY_API_KEY,
  api_secret: constants.CLOUDINARY_API_SECRET,
});

export default cloudinary;
`,
  'src/config/constants.ts': `import dotenv from 'dotenv';
dotenv.config();

export const constants = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-booking',
  JWT_SECRET: process.env.JWT_SECRET || 'secret',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '15m',
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '7d',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
};
`,
  'src/models/User.ts': `import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: 'admin' | 'user';
  avatar?: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, select: false },
  phone: { type: String },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>('User', userSchema);
`,
  'src/models/Tour.ts': `import mongoose, { Document, Schema } from 'mongoose';

const i18nSchema = {
  vi: { type: String, required: true },
  en: { type: String, default: '' },
  zh: { type: String, default: '' },
  ko: { type: String, default: '' },
  ja: { type: String, default: '' }
};

export interface ITour extends Document {
  slug: string;
  title: any;
  description: any;
  images: string[];
  price: number;
  originalPrice?: number;
  duration: number;
  destination: string;
  highlights: any[];
  itinerary: any[];
  rating: number;
  reviewCount: number;
  maxGuests: number;
  category: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
}

const tourSchema = new Schema<ITour>({
  slug: { type: String, required: true, unique: true },
  title: i18nSchema,
  description: i18nSchema,
  images: [{ type: String }],
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  duration: { type: Number, required: true },
  destination: { type: String, required: true },
  highlights: [i18nSchema],
  itinerary: [{
    title: i18nSchema,
    description: i18nSchema
  }],
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  maxGuests: { type: Number, required: true },
  category: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ITour>('Tour', tourSchema);
`,
  'src/models/Booking.ts': `import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  bookingCode: string;
  userId: mongoose.Types.ObjectId;
  tourId: mongoose.Types.ObjectId;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  travelDate: Date;
  guests: {
    adults: number;
    children: number;
  };
  totalPrice: number;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    notes?: string;
  };
  createdAt: Date;
}

const bookingSchema = new Schema<IBooking>({
  bookingCode: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  tourId: { type: Schema.Types.ObjectId, ref: 'Tour', required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  travelDate: { type: Date, required: true },
  guests: {
    adults: { type: Number, required: true, min: 1 },
    children: { type: Number, default: 0 }
  },
  totalPrice: { type: Number, required: true },
  customerInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String },
    notes: { type: String }
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IBooking>('Booking', bookingSchema);
`,
  'src/models/News.ts': `import mongoose, { Document, Schema } from 'mongoose';

const i18nSchema = {
  vi: { type: String, required: true },
  en: { type: String, default: '' },
  zh: { type: String, default: '' },
  ko: { type: String, default: '' },
  ja: { type: String, default: '' }
};

export interface INews extends Document {
  slug: string;
  title: any;
  content: any;
  excerpt: any;
  thumbnail: string;
  category: string;
  author: string;
  isPublished: boolean;
  publishedAt: Date;
  createdAt: Date;
}

const newsSchema = new Schema<INews>({
  slug: { type: String, required: true, unique: true },
  title: i18nSchema,
  content: i18nSchema,
  excerpt: i18nSchema,
  thumbnail: { type: String, required: true },
  category: { type: String, required: true },
  author: { type: String, required: true },
  isPublished: { type: Boolean, default: true },
  publishedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<INews>('News', newsSchema);
`,
  'src/models/Hotel.ts': `import mongoose, { Document, Schema } from 'mongoose';

const i18nSchema = {
  vi: { type: String, required: true },
  en: { type: String, default: '' },
  zh: { type: String, default: '' },
  ko: { type: String, default: '' },
  ja: { type: String, default: '' }
};

export interface IHotel extends Document {
  slug: string;
  name: any;
  description: any;
  images: string[];
  pricePerNight: number;
  stars: number;
  location: string;
  address: string;
  amenities: string[];
  isActive: boolean;
  createdAt: Date;
}

const hotelSchema = new Schema<IHotel>({
  slug: { type: String, required: true, unique: true },
  name: i18nSchema,
  description: i18nSchema,
  images: [{ type: String }],
  pricePerNight: { type: Number, required: true },
  stars: { type: Number, required: true, min: 1, max: 5 },
  location: { type: String, required: true },
  address: { type: String, required: true },
  amenities: [{ type: String }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IHotel>('Hotel', hotelSchema);
`,
  'src/models/Specialty.ts': `import mongoose, { Document, Schema } from 'mongoose';

const i18nSchema = {
  vi: { type: String, required: true },
  en: { type: String, default: '' },
  zh: { type: String, default: '' },
  ko: { type: String, default: '' },
  ja: { type: String, default: '' }
};

export interface ISpecialty extends Document {
  slug: string;
  name: any;
  description: any;
  image: string;
  price: number;
  region: string;
  isActive: boolean;
  createdAt: Date;
}

const specialtySchema = new Schema<ISpecialty>({
  slug: { type: String, required: true, unique: true },
  name: i18nSchema,
  description: i18nSchema,
  image: { type: String, required: true },
  price: { type: Number, required: true },
  region: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ISpecialty>('Specialty', specialtySchema);
`,
  'src/models/Page.ts': `import mongoose, { Document, Schema } from 'mongoose';

const i18nSchema = {
  vi: { type: String, required: true },
  en: { type: String, default: '' },
  zh: { type: String, default: '' },
  ko: { type: String, default: '' },
  ja: { type: String, default: '' }
};

export interface IPage extends Document {
  slug: string;
  title: any;
  content: any;
  metaDescription: any;
  isPublished: boolean;
  createdAt: Date;
}

const pageSchema = new Schema<IPage>({
  slug: { type: String, required: true, unique: true },
  title: i18nSchema,
  content: i18nSchema,
  metaDescription: i18nSchema,
  isPublished: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IPage>('Page', pageSchema);
`,
  'src/models/Setting.ts': `import mongoose, { Document, Schema } from 'mongoose';

export interface ISetting extends Document {
  key: string;
  value: any;
  group: string;
  createdAt: Date;
}

const settingSchema = new Schema<ISetting>({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed, required: true },
  group: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ISetting>('Setting', settingSchema);
`,
  'src/middleware/auth.ts': `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { constants } from '../config/constants';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, constants.JWT_SECRET) as any;
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};
`,
  'src/middleware/adminOnly.ts': `import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};
`,
  'src/middleware/validate.ts': `import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
`,
  'src/middleware/errorHandler.ts': `import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
`,
  'src/services/cacheService.ts': `import NodeCache from 'node-cache';

class CacheService {
  private cache: NodeCache;

  constructor(ttlSeconds = 300) {
    this.cache = new NodeCache({ stdTTL: ttlSeconds, checkperiod: ttlSeconds * 0.2, useClones: false });
  }

  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  set<T>(key: string, value: T): boolean {
    return this.cache.set(key, value);
  }

  del(key: string | string[]): number {
    return this.cache.del(key);
  }

  flush(): void {
    this.cache.flushAll();
  }
}

export const cacheService = new CacheService();
`,
  'src/utils/helpers.ts': `export const generateBookingCode = (): string => {
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return \`VTP-\${randomStr}\`;
};

export const slugify = (text: string): string => {
  return text.toString().toLowerCase()
    .replace(/\\s+/g, '-')
    .replace(/[^\\w\\-]+/g, '')
    .replace(/\\-\\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export const paginate = (data: any[], total: number, page: number, limit: number) => {
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};
`,
  'src/controllers/authController.ts': `import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { constants } from '../config/constants';
import { AuthRequest } from '../middleware/auth';

const generateTokens = (id: string) => {
  const accessToken = jwt.sign({ id }, constants.JWT_SECRET, { expiresIn: constants.JWT_EXPIRE });
  const refreshToken = jwt.sign({ id }, constants.JWT_REFRESH_SECRET, { expiresIn: constants.JWT_REFRESH_EXPIRE });
  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashedPassword, phone });
    const tokens = generateTokens(user._id as string);
    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, ...tokens });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const tokens = generateTokens(user._id as string);
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, ...tokens });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(401).json({ message: 'Refresh token required' });

    const decoded = jwt.verify(token, constants.JWT_REFRESH_SECRET) as any;
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Invalid token' });

    const tokens = generateTokens(user._id as string);
    res.json(tokens);
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  res.json(req.user);
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
`,
  'src/controllers/tourController.ts': `import { Request, Response } from 'express';
import Tour from '../models/Tour';
import { paginate } from '../utils/helpers';
import { cacheService } from '../services/cacheService';

export const getAll = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, destination, category, minPrice, maxPrice, sort } = req.query;
    const query: any = {};
    if (destination) query.destination = new RegExp(destination as string, 'i');
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sortOptions: any = {};
    if (sort === 'price_asc') sortOptions.price = 1;
    else if (sort === 'price_desc') sortOptions.price = -1;
    else sortOptions.createdAt = -1;

    const cacheKey = \`tours_\${JSON.stringify(req.query)}\`;
    const cached = cacheService.get(cacheKey);
    if (cached) return res.json(cached);

    const tours = await Tour.find(query)
      .sort(sortOptions)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    const total = await Tour.countDocuments(query);
    const result = paginate(tours, total, Number(page), Number(limit));
    cacheService.set(cacheKey, result);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getBySlug = async (req: Request, res: Response) => {
  try {
    const tour = await Tour.findOne({ slug: req.params.slug });
    if (!tour) return res.status(404).json({ message: 'Tour not found' });
    res.json(tour);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const tour = await Tour.create(req.body);
    cacheService.flush();
    res.status(201).json(tour);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!tour) return res.status(404).json({ message: 'Tour not found' });
    cacheService.flush();
    res.json(tour);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTour = async (req: Request, res: Response) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) return res.status(404).json({ message: 'Tour not found' });
    cacheService.flush();
    res.json({ message: 'Tour removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleFeatured = async (req: Request, res: Response) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) return res.status(404).json({ message: 'Tour not found' });
    tour.isFeatured = !tour.isFeatured;
    await tour.save();
    cacheService.flush();
    res.json(tour);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
`,
  'src/controllers/bookingController.ts': `import { Request, Response } from 'express';
import Booking from '../models/Booking';
import { generateBookingCode } from '../utils/helpers';
import { AuthRequest } from '../middleware/auth';

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await Booking.create({
      ...req.body,
      bookingCode: generateBookingCode(),
      userId: req.user?._id
    });
    res.status(201).json(booking);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find().populate('tourId').populate('userId', 'name email');
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getByUser = async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id }).populate('tourId');
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('tourId');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
`,
  'src/controllers/newsController.ts': `import { Request, Response } from 'express';
import News from '../models/News';
import { paginate } from '../utils/helpers';

export const getAll = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const query: any = {};
    if (category) query.category = category;

    const news = await News.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    const total = await News.countDocuments(query);
    res.json(paginate(news, total, Number(page), Number(limit)));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getBySlug = async (req: Request, res: Response) => {
  try {
    const news = await News.findOne({ slug: req.params.slug });
    if (!news) return res.status(404).json({ message: 'News not found' });
    res.json(news);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const news = await News.create(req.body);
    res.status(201).json(news);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const news = await News.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!news) return res.status(404).json({ message: 'News not found' });
    res.json(news);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNews = async (req: Request, res: Response) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) return res.status(404).json({ message: 'News not found' });
    res.json({ message: 'News removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
`,
  'src/controllers/hotelController.ts': `import { Request, Response } from 'express';
import Hotel from '../models/Hotel';

export const getAll = async (req: Request, res: Response) => {
  try {
    const hotels = await Hotel.find().sort({ createdAt: -1 });
    res.json(hotels);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getBySlug = async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.findOne({ slug: req.params.slug });
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    res.json(hotel);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.create(req.body);
    res.status(201).json(hotel);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    res.json(hotel);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteHotel = async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    res.json({ message: 'Hotel removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
`,
  'src/controllers/specialtyController.ts': `import { Request, Response } from 'express';
import Specialty from '../models/Specialty';

export const getAll = async (req: Request, res: Response) => {
  try {
    const specialties = await Specialty.find().sort({ createdAt: -1 });
    res.json(specialties);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getBySlug = async (req: Request, res: Response) => {
  try {
    const specialty = await Specialty.findOne({ slug: req.params.slug });
    if (!specialty) return res.status(404).json({ message: 'Specialty not found' });
    res.json(specialty);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const specialty = await Specialty.create(req.body);
    res.status(201).json(specialty);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const specialty = await Specialty.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!specialty) return res.status(404).json({ message: 'Specialty not found' });
    res.json(specialty);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSpecialty = async (req: Request, res: Response) => {
  try {
    const specialty = await Specialty.findByIdAndDelete(req.params.id);
    if (!specialty) return res.status(404).json({ message: 'Specialty not found' });
    res.json({ message: 'Specialty removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
`,
  'src/controllers/pageController.ts': `import { Request, Response } from 'express';
import Page from '../models/Page';

export const getBySlug = async (req: Request, res: Response) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug });
    if (!page) return res.status(404).json({ message: 'Page not found' });
    res.json(page);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const upsert = async (req: Request, res: Response) => {
  try {
    const page = await Page.findOneAndUpdate(
      { slug: req.params.slug },
      req.body,
      { new: true, upsert: true }
    );
    res.json(page);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
`,
  'src/controllers/settingController.ts': `import { Request, Response } from 'express';
import Setting from '../models/Setting';

export const getAll = async (req: Request, res: Response) => {
  try {
    const settings = await Setting.find();
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getByKey = async (req: Request, res: Response) => {
  try {
    const setting = await Setting.findOne({ key: req.params.key });
    if (!setting) return res.status(404).json({ message: 'Setting not found' });
    res.json(setting);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const upsert = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const setting = await Setting.findOneAndUpdate(
      { key },
      { ...req.body, key },
      { new: true, upsert: true }
    );
    res.json(setting);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
`,
  'src/controllers/uploadController.ts': `import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
    
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'travel',
      public_id: uuidv4()
    });

    res.json({ url: result.secure_url, public_id: result.public_id });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteImage = async (req: Request, res: Response) => {
  try {
    const { public_id } = req.body;
    if (!public_id) return res.status(400).json({ message: 'public_id is required' });
    await cloudinary.uploader.destroy(public_id);
    res.json({ message: 'Image deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
`,
  'src/controllers/searchController.ts': `import { Request, Response } from 'express';
import Tour from '../models/Tour';
import Hotel from '../models/Hotel';
import News from '../models/News';

export const globalSearch = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ tours: [], hotels: [], news: [] });

    const searchRegex = new RegExp(q as string, 'i');
    
    const [tours, hotels, news] = await Promise.all([
      Tour.find({ $or: [{ 'title.vi': searchRegex }, { 'title.en': searchRegex }, { destination: searchRegex }] }).limit(5),
      Hotel.find({ $or: [{ 'name.vi': searchRegex }, { 'name.en': searchRegex }, { location: searchRegex }] }).limit(5),
      News.find({ $or: [{ 'title.vi': searchRegex }, { 'title.en': searchRegex }] }).limit(5)
    ]);

    res.json({ tours, hotels, news });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
`,
  'src/routes/authRoutes.ts': `import { Router } from 'express';
import { register, login, refreshToken, getMe, updateProfile } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;
`,
  'src/routes/tourRoutes.ts': `import { Router } from 'express';
import { getAll, getBySlug, create, update, deleteTour, toggleFeatured } from '../controllers/tourController';
import { protect } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const router = Router();

router.get('/', getAll);
router.get('/:slug', getBySlug);
router.post('/', protect, adminOnly, create);
router.put('/:id', protect, adminOnly, update);
router.delete('/:id', protect, adminOnly, deleteTour);
router.patch('/:id/featured', protect, adminOnly, toggleFeatured);

export default router;
`,
  'src/routes/bookingRoutes.ts': `import { Router } from 'express';
import { create, getAll, getByUser, getById, updateStatus } from '../controllers/bookingController';
import { protect } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const router = Router();

router.post('/', create); // allows guest booking or auth booking depending on frontend
router.get('/my', protect, getByUser);
router.get('/:id', getById); // check permissions inside maybe
router.get('/', protect, adminOnly, getAll);
router.patch('/:id/status', protect, adminOnly, updateStatus);

export default router;
`,
  'src/routes/newsRoutes.ts': `import { Router } from 'express';
import { getAll, getBySlug, create, update, deleteNews } from '../controllers/newsController';
import { protect } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const router = Router();

router.get('/', getAll);
router.get('/:slug', getBySlug);
router.post('/', protect, adminOnly, create);
router.put('/:id', protect, adminOnly, update);
router.delete('/:id', protect, adminOnly, deleteNews);

export default router;
`,
  'src/routes/hotelRoutes.ts': `import { Router } from 'express';
import { getAll, getBySlug, create, update, deleteHotel } from '../controllers/hotelController';
import { protect } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const router = Router();

router.get('/', getAll);
router.get('/:slug', getBySlug);
router.post('/', protect, adminOnly, create);
router.put('/:id', protect, adminOnly, update);
router.delete('/:id', protect, adminOnly, deleteHotel);

export default router;
`,
  'src/routes/specialtyRoutes.ts': `import { Router } from 'express';
import { getAll, getBySlug, create, update, deleteSpecialty } from '../controllers/specialtyController';
import { protect } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const router = Router();

router.get('/', getAll);
router.get('/:slug', getBySlug);
router.post('/', protect, adminOnly, create);
router.put('/:id', protect, adminOnly, update);
router.delete('/:id', protect, adminOnly, deleteSpecialty);

export default router;
`,
  'src/routes/pageRoutes.ts': `import { Router } from 'express';
import { getBySlug, upsert } from '../controllers/pageController';
import { protect } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const router = Router();

router.get('/:slug', getBySlug);
router.put('/:slug', protect, adminOnly, upsert);

export default router;
`,
  'src/routes/settingRoutes.ts': `import { Router } from 'express';
import { getAll, getByKey, upsert } from '../controllers/settingController';
import { protect } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const router = Router();

router.get('/', getAll);
router.get('/:key', getByKey);
router.put('/:key', protect, adminOnly, upsert);

export default router;
`,
  'src/routes/uploadRoutes.ts': `import { Router } from 'express';
import { upload, uploadImage, deleteImage } from '../controllers/uploadController';
import { protect } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const router = Router();

router.post('/', protect, adminOnly, upload.single('image'), uploadImage);
router.delete('/', protect, adminOnly, deleteImage);

export default router;
`,
  'src/routes/searchRoutes.ts': `import { Router } from 'express';
import { globalSearch } from '../controllers/searchController';

const router = Router();

router.get('/', globalSearch);

export default router;
`,
  'src/routes/index.ts': `import { Router } from 'express';
import authRoutes from './authRoutes';
import tourRoutes from './tourRoutes';
import bookingRoutes from './bookingRoutes';
import newsRoutes from './newsRoutes';
import hotelRoutes from './hotelRoutes';
import specialtyRoutes from './specialtyRoutes';
import pageRoutes from './pageRoutes';
import settingRoutes from './settingRoutes';
import uploadRoutes from './uploadRoutes';
import searchRoutes from './searchRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tours', tourRoutes);
router.use('/bookings', bookingRoutes);
router.use('/news', newsRoutes);
router.use('/hotels', hotelRoutes);
router.use('/specialties', specialtyRoutes);
router.use('/pages', pageRoutes);
router.use('/settings', settingRoutes);
router.use('/upload', uploadRoutes);
router.use('/search', searchRoutes);

export default router;
`,
  'src/server.ts': `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/database';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';
import { constants } from './config/constants';

dotenv.config();

const app = express();

app.use(cors({ origin: constants.FRONTEND_URL, credentials: true }));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api', routes);

app.use(errorHandler);

const PORT = constants.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(\`Server running on port \${PORT}\`);
  });
});
`,
  'src/seed/seedData.ts': `import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Tour from '../models/Tour';
import News from '../models/News';
import Hotel from '../models/Hotel';
import Specialty from '../models/Specialty';
import Page from '../models/Page';
import Setting from '../models/Setting';
import { constants } from '../config/constants';

dotenv.config();

const createI18n = (vi: string, en: string) => ({ vi, en, zh: '', ko: '', ja: '' });

const seedData = async () => {
  try {
    await mongoose.connect(constants.MONGODB_URI);
    console.log('Connected to DB. Clearing old data...');

    await Promise.all([
      User.deleteMany(), Tour.deleteMany(), News.deleteMany(),
      Hotel.deleteMany(), Specialty.deleteMany(), Page.deleteMany(), Setting.deleteMany()
    ]);

    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('admin123', salt);
    const userPass = await bcrypt.hash('user123', salt);

    await User.create([
      { name: 'Admin User', email: 'admin@travel.com', password: adminPass, role: 'admin' },
      { name: 'Regular User', email: 'user@travel.com', password: userPass, role: 'user' }
    ]);

    await Tour.create([
      {
        slug: 'ho-guom-hanoi',
        title: createI18n('Hồ Gươm Hà Nội', 'Hoan Kiem Lake Hanoi'),
        description: createI18n('Khám phá trái tim thủ đô', 'Explore the heart of the capital'),
        images: ['https://example.com/hoguom.jpg'],
        price: 500000,
        duration: 1,
        destination: 'Hà Nội',
        highlights: [createI18n('Cầu Thê Húc', 'The Huc Bridge'), createI18n('Đền Ngọc Sơn', 'Ngoc Son Temple')],
        itinerary: [{ title: createI18n('Ngày 1', 'Day 1'), description: createI18n('Tham quan Hồ Gươm', 'Visit Hoan Kiem Lake') }],
        maxGuests: 20,
        category: 'city-tour',
        isFeatured: true
      },
      {
        slug: 'da-nang-tour',
        title: createI18n('Thành phố Đà Nẵng', 'Da Nang City'),
        description: createI18n('Thành phố đáng sống', 'Livable city'),
        images: ['https://example.com/danang.jpg'],
        price: 2500000,
        duration: 3,
        destination: 'Đà Nẵng',
        highlights: [createI18n('Cầu Rồng', 'Dragon Bridge'), createI18n('Bà Nà Hills', 'Ba Na Hills')],
        itinerary: [{ title: createI18n('Ngày 1', 'Day 1'), description: createI18n('Đến Đà Nẵng', 'Arrive in Da Nang') }],
        maxGuests: 15,
        category: 'beach',
        isFeatured: true
      },
      {
        slug: 'thac-ban-gioc-cao-bang',
        title: createI18n('Thác nước Cao Bằng', 'Cao Bang Waterfall'),
        description: createI18n('Kỳ quan thiên nhiên tuyệt đẹp', 'Beautiful natural wonder'),
        images: ['https://example.com/bangioc.jpg'],
        price: 1800000,
        duration: 2,
        destination: 'Cao Bằng',
        highlights: [createI18n('Thác Bản Giốc', 'Ban Gioc Waterfall')],
        itinerary: [{ title: createI18n('Ngày 1', 'Day 1'), description: createI18n('Khởi hành đi Cao Bằng', 'Depart for Cao Bang') }],
        maxGuests: 10,
        category: 'nature',
        isFeatured: true
      }
    ]);

    await News.create([
      {
        slug: 'top-10-dia-diem',
        title: createI18n('Top 10 địa điểm đẹp nhất Việt Nam', 'Top 10 most beautiful places in Vietnam'),
        content: createI18n('Nội dung...', 'Content...'),
        excerpt: createI18n('Tóm tắt...', 'Excerpt...'),
        thumbnail: 'https://example.com/news1.jpg',
        category: 'travel-tips',
        author: 'Admin'
      },
      {
        slug: 'kinh-nghiem-di-du-lich',
        title: createI18n('Kinh nghiệm đi du lịch', 'Travel tips'),
        content: createI18n('Nội dung...', 'Content...'),
        excerpt: createI18n('Tóm tắt...', 'Excerpt...'),
        thumbnail: 'https://example.com/news2.jpg',
        category: 'guide',
        author: 'Admin'
      },
      {
        slug: 'am-thuc-duong-pho',
        title: createI18n('Ẩm thực đường phố', 'Street food'),
        content: createI18n('Nội dung...', 'Content...'),
        excerpt: createI18n('Tóm tắt...', 'Excerpt...'),
        thumbnail: 'https://example.com/news3.jpg',
        category: 'food',
        author: 'Admin'
      }
    ]);

    await Hotel.create([
      {
        slug: 'hotel-hanoi',
        name: createI18n('Khách sạn Hà Nội', 'Hanoi Hotel'),
        description: createI18n('Ngay trung tâm', 'Right in the center'),
        images: ['https://example.com/hanoi-hotel.jpg'],
        pricePerNight: 1000000,
        stars: 4,
        location: 'Hà Nội',
        address: 'Quận Hoàn Kiếm, Hà Nội',
        amenities: ['Wifi', 'Pool', 'Breakfast']
      },
      {
        slug: 'resort-danang',
        name: createI18n('Resort Đà Nẵng', 'Da Nang Resort'),
        description: createI18n('View biển tuyệt đẹp', 'Beautiful ocean view'),
        images: ['https://example.com/danang-resort.jpg'],
        pricePerNight: 2000000,
        stars: 5,
        location: 'Đà Nẵng',
        address: 'Ven biển Đà Nẵng',
        amenities: ['Wifi', 'Spa', 'Pool', 'Breakfast']
      },
      {
        slug: 'homestay-caobang',
        name: createI18n('Homestay Cao Bằng', 'Cao Bang Homestay'),
        description: createI18n('Gần gũi thiên nhiên', 'Close to nature'),
        images: ['https://example.com/caobang-homestay.jpg'],
        pricePerNight: 500000,
        stars: 3,
        location: 'Cao Bằng',
        address: 'Trùng Khánh, Cao Bằng',
        amenities: ['Wifi', 'Breakfast']
      }
    ]);

    await Specialty.create([
      {
        slug: 'pho-ha-noi',
        name: createI18n('Phở Hà Nội', 'Hanoi Pho'),
        description: createI18n('Món ăn truyền thống', 'Traditional dish'),
        image: 'https://example.com/pho.jpg',
        price: 50000,
        region: 'Miền Bắc'
      },
      {
        slug: 'mi-quang-da-nang',
        name: createI18n('Mì Quảng Đà Nẵng', 'Da Nang Quang Noodle'),
        description: createI18n('Đặc sản miền Trung', 'Central specialty'),
        image: 'https://example.com/miquang.jpg',
        price: 45000,
        region: 'Miền Trung'
      },
      {
        slug: 'banh-cuon-cao-bang',
        name: createI18n('Bánh Cuốn Cao Bằng', 'Cao Bang Rice Rolls'),
        description: createI18n('Ăn với nước sương xương', 'Eaten with bone broth'),
        image: 'https://example.com/banhcuon.jpg',
        price: 30000,
        region: 'Miền Bắc'
      }
    ]);

    await Page.create([
      { slug: 'visa', title: createI18n('Thông tin Visa', 'Visa Info'), content: createI18n('Nội dung visa', 'Visa content'), metaDescription: createI18n('Visa', 'Visa') },
      { slug: 'contact', title: createI18n('Liên hệ', 'Contact'), content: createI18n('Nội dung liên hệ', 'Contact content'), metaDescription: createI18n('Liên hệ', 'Contact') },
      { slug: 'about', title: createI18n('Về chúng tôi', 'About Us'), content: createI18n('Giới thiệu', 'Introduction'), metaDescription: createI18n('Giới thiệu', 'Intro') }
    ]);

    await Setting.create([
      { key: 'site_name', value: createI18n('Travel Booking', 'Travel Booking'), group: 'general' },
      { key: 'logo_url', value: 'https://example.com/logo.png', group: 'general' },
      { key: 'contact_info', value: { email: 'contact@travel.com', phone: '0123456789' }, group: 'contact' }
    ]);

    console.log('Seed data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
`
};

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(basePath, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}
console.log('All files created!');
