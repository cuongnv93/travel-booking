import { Request, Response } from 'express';
import Tour from '../models/Tour';
import Hotel from '../models/Hotel';
import News from '../models/News';
import { escapeRegex } from '../utils/helpers';
import { cacheService } from '../services/cacheService';

export const globalSearch = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string' || !q.trim()) {
      return res.json({ tours: [], hotels: [], news: [] });
    }

    const trimmed = q.trim();
    const searchLimit = Math.min(Math.max(1, Number(req.query.limit) || 12), 50);

    const cacheKey = `search_${trimmed.toLowerCase()}_${searchLimit}`;
    const cached = cacheService.get(cacheKey);
    if (cached) return res.json(cached);

    const safeRegex = new RegExp(escapeRegex(trimmed), 'i');

    const [tours, hotels, news] = await Promise.all([
      Tour.find({
        isActive: { $ne: false },
        $or: [
          { title: safeRegex },
          { 'title.vi': safeRegex },
          { 'title.en': safeRegex },
          { 'title.zh': safeRegex },
          { 'title.ko': safeRegex },
          { 'title.ja': safeRegex },
          { destination: safeRegex },
          { category: safeRegex },
        ],
      })
        .select('title images price originalPrice duration destination rating slug')
        .limit(searchLimit)
        .lean(),
      Hotel.find({
        isActive: { $ne: false },
        $or: [
          { name: safeRegex },
          { 'name.vi': safeRegex },
          { 'name.en': safeRegex },
          { 'name.zh': safeRegex },
          { 'name.ko': safeRegex },
          { 'name.ja': safeRegex },
          { location: safeRegex },
          { address: safeRegex },
        ],
      })
        .select('name images pricePerNight stars location address slug')
        .limit(searchLimit)
        .lean(),
      News.find({
        isPublished: true,
        $or: [
          { title: safeRegex },
          { 'title.vi': safeRegex },
          { 'title.en': safeRegex },
          { 'title.zh': safeRegex },
          { 'title.ko': safeRegex },
          { 'title.ja': safeRegex },
          { category: safeRegex },
          { author: safeRegex },
        ],
      })
        .select('title thumbnail category author publishedAt slug')
        .limit(searchLimit)
        .lean(),
    ]);

    const result = { tours, hotels, news };
    cacheService.set(cacheKey, result, 60); // Cache 1 minute
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
