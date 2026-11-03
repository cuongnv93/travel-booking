import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Tour from '../models/Tour';
import { paginate, buildDestinationRegex, slugify } from '../utils/helpers';
import { cacheService } from '../services/cacheService';

const generateSlug = (title: string) => slugify(title, true);

const invalidateTourCaches = () => {
  cacheService.delByPrefix('tours_');
  cacheService.del('tour_destinations');
  cacheService.del('flash_sale_items');
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

    const destParam = destination || req.query.search || req.query.q;
    if (destParam) {
      const destRegex = buildDestinationRegex(destParam as string);
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
    cacheService.set(cacheKey, result, 120); // Cache 2 minutes
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Highly optimized destination listing using a single MongoDB aggregation pipeline.
 * Eliminates N+1 queries.
 */
export const getDestinations = async (_req: Request, res: Response) => {
  try {
    const cached = cacheService.get('tour_destinations');
    if (cached) return res.json(cached);

    const list = await Tour.aggregate([
      {
        $match: {
          destination: { $exists: true, $ne: '' },
          isActive: { $ne: false },
        },
      },
      {
        $sort: { isFeatured: -1, rating: -1, createdAt: -1 },
      },
      {
        $group: {
          _id: '$destination',
          sampleImage: { $first: { $arrayElemAt: ['$images', 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          image: {
            $ifNull: [
              '$sampleImage',
              'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
            ],
          },
        },
      },
      { $sort: { name: 1 } },
    ]);

    cacheService.set('tour_destinations', list, 300);
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
    if (!tour) return res.status(404).json({ message: 'Không tìm thấy tour du lịch' });
    res.json(tour);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    if (!data.slug) {
      const titleStr = typeof data.title === 'string'
        ? data.title
        : (data.title?.vi || data.title?.en || Object.values(data.title || {})[0] || 'tour');
      data.slug = generateSlug(String(titleStr));
    }
    const tour = await Tour.create(data);
    invalidateTourCaches();
    res.status(201).json(tour);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Không tìm thấy tour du lịch' });
    }
    const data = { ...req.body };
    if (!data.slug && data.title) {
      const titleStr = typeof data.title === 'string'
        ? data.title
        : (data.title?.vi || data.title?.en || Object.values(data.title || {})[0] || 'tour');
      data.slug = generateSlug(String(titleStr));
    }
    const tour = await Tour.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!tour) return res.status(404).json({ message: 'Không tìm thấy tour du lịch' });
    invalidateTourCaches();
    res.json(tour);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTour = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Không tìm thấy tour du lịch' });
    }
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) return res.status(404).json({ message: 'Không tìm thấy tour du lịch' });
    invalidateTourCaches();
    res.json({ message: 'Đã xóa tour thành công' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleFeatured = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Không tìm thấy tour du lịch' });
    }
    const tour = await Tour.findById(req.params.id);
    if (!tour) return res.status(404).json({ message: 'Không tìm thấy tour du lịch' });
    tour.isFeatured = !tour.isFeatured;
    await tour.save();
    invalidateTourCaches();
    res.json(tour);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleActive = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Không tìm thấy tour du lịch' });
    }
    const tour = await Tour.findById(req.params.id);
    if (!tour) return res.status(404).json({ message: 'Không tìm thấy tour du lịch' });
    tour.isActive = !tour.isActive;
    await tour.save();
    invalidateTourCaches();
    res.json(tour);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const duplicateTour = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Không tìm thấy tour du lịch' });
    }
    const original = await Tour.findById(req.params.id).lean();
    if (!original) return res.status(404).json({ message: 'Không tìm thấy tour du lịch' });

    const { _id, createdAt, ...rest } = original as any;
    const viTitle = typeof rest.title === 'string'
      ? `${rest.title} (Bản sao)`
      : `${rest.title?.vi || 'Tour'} (Bản sao)`;
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

    invalidateTourCaches();
    res.status(201).json(duplicated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
