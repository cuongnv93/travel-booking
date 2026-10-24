import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Tour from '../models/Tour';
import { paginate, escapeRegex, buildDestinationRegex, slugify } from '../utils/helpers';
import { cacheService } from '../services/cacheService';

const generateSlug = (title: string) => slugify(title, true);

const TOUR_LANDMARK_MAP: Record<string, string[]> = {
  'ha-long-bay': [
    'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200',
    'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200'
  ],
  'nha-trang-diving': [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200'
  ],
  'ho-guom-hanoi': [
    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200',
    'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200'
  ],
  'da-nang-ba-na-hills': [
    'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1200',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200'
  ],
  'ban-gioc-cao-bang': [
    'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200'
  ],
  'phu-quoc-paradise': [
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200'
  ],
  'sapa-fansipan': [
    'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200',
    'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200'
  ],
  'hue-culture-tour': [
    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200',
    'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200'
  ]
};

export const fixLandmarkImages = async (_req: Request, res: Response) => {
  try {
    cacheService.flush();
    const tours = await Tour.find({});
    for (const tour of tours) {
      if (TOUR_LANDMARK_MAP[tour.slug]) {
        tour.images = TOUR_LANDMARK_MAP[tour.slug];
      } else if (tour.destination === 'Nha Trang') {
        tour.images = TOUR_LANDMARK_MAP['nha-trang-diving'];
      } else if (tour.destination && /Hạ Long|Ha Long/i.test(tour.destination)) {
        tour.images = TOUR_LANDMARK_MAP['ha-long-bay'];
      } else if (tour.destination && /Hà Nội|Ha Noi/i.test(tour.destination)) {
        tour.images = TOUR_LANDMARK_MAP['ho-guom-hanoi'];
      } else if (tour.destination === 'ÄÃ  Náºµng') {
        tour.images = TOUR_LANDMARK_MAP['da-nang-ba-na-hills'];
      }
      await tour.save();
    }
    res.json({ message: 'Successfully updated all tour images with zero people/handbag photos!' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, destination, category, minPrice, maxPrice, sort, isFeatured, all, isActive } = req.query;
    const query: any = {};

    // Filter isActive: true for public queries; respect all=true or explicit isActive
    if (all !== 'true' && isActive === undefined) {
      query.isActive = { $ne: false };
    } else if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (destination) {
      const destRegex = buildDestinationRegex(destination as string);
      query.$or = [
        { destination: destRegex },
        { title: destRegex },
        { 'title.vi': destRegex },
        { 'title.en': destRegex },
      ];
    }
    if (category) query.category = category;
    if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sortOptions: any = {};
    if (sort === 'price_asc') sortOptions.price = 1;
    else if (sort === 'price_desc') sortOptions.price = -1;
    else sortOptions.createdAt = -1;

    const cacheKey = `tours_${JSON.stringify(req.query)}`;
    const cached = cacheService.get(cacheKey);
    if (cached) return res.json(cached);

    const tours = await Tour.find(query)
      .sort(sortOptions)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();
    const total = await Tour.countDocuments(query);
    const result = paginate(tours, total, Number(page), Number(limit));
    cacheService.set(cacheKey, result);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getDestinations = async (_req: Request, res: Response) => {
  try {
    const cached = cacheService.get('tour_destinations');
    if (cached) return res.json(cached);

    const rawDestinations = await Tour.distinct('destination');
    const filtered = rawDestinations.filter(Boolean);

    const list = await Promise.all(
      filtered.map(async (destName) => {
        const sampleTour = await Tour.findOne({ destination: destName })
          .sort({ isFeatured: -1, rating: -1, createdAt: -1 })
          .select('images')
          .lean();
        const image = sampleTour?.images?.[0] || 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800';
        return {
          name: destName,
          image: image
        };
      })
    );

    cacheService.set('tour_destinations', list);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    let tour = await Tour.findOne({ slug }).lean();
    if (!tour && /^[0-9a-fA-F]{24}$/.test(slug)) {
      tour = await Tour.findById(slug).lean();
    }
    if (!tour) return res.status(404).json({ message: 'Tour not found' });
    res.json(tour);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    if (!data.slug) {
      const titleStr = typeof data.title === 'string' ? data.title : (data.title?.vi || data.title?.en || Object.values(data.title || {})[0] || 'tour');
      data.slug = generateSlug(String(titleStr));
    }
    const tour = await Tour.create(data);
    cacheService.flush();
    res.status(201).json(tour);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    const data = { ...req.body };
    if (!data.slug && data.title) {
      const titleStr = typeof data.title === 'string' ? data.title : (data.title?.vi || data.title?.en || Object.values(data.title || {})[0] || 'tour');
      data.slug = generateSlug(String(titleStr));
    }
    const tour = await Tour.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!tour) return res.status(404).json({ message: 'Tour not found' });
    cacheService.flush();
    res.json(tour);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTour = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Tour not found' });
    }
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Tour not found' });
    }
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

export const toggleActive = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    const tour = await Tour.findById(req.params.id);
    if (!tour) return res.status(404).json({ message: 'Tour not found' });
    tour.isActive = !tour.isActive;
    await tour.save();
    cacheService.flush();
    res.json(tour);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const duplicateTour = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    const original = await Tour.findById(req.params.id).lean();
    if (!original) return res.status(404).json({ message: 'Tour not found' });

    const { _id, createdAt, ...rest } = original as any;
    const viTitle = typeof rest.title === 'string' ? `${rest.title} (Bản sao)` : `${rest.title?.vi || 'Tour'} (Bản sao)`;
    const newTitle = typeof rest.title === 'object' && rest.title
      ? { ...rest.title, vi: viTitle, en: rest.title.en ? `${rest.title.en} (Copy)` : '' }
      : { vi: viTitle, en: '' };

    const newSlug = generateSlug(viTitle);

    const duplicated = await Tour.create({
      ...rest,
      title: newTitle,
      slug: newSlug,
      isActive: false, // Default to draft so admin can review
      isFeatured: false,
      createdAt: new Date(),
    });

    cacheService.flush();
    res.status(201).json(duplicated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
