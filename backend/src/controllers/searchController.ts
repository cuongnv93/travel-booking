import { Request, Response } from 'express';
import Tour from '../models/Tour';
import Hotel from '../models/Hotel';
import News from '../models/News';
import { escapeRegex } from '../utils/helpers';

export const globalSearch = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string' || !q.trim()) {
      return res.json({ tours: [], hotels: [], news: [] });
    }

    const safeRegex = new RegExp(escapeRegex(q.trim()), 'i');
    const searchLimit = Math.min(Math.max(1, Number(req.query.limit) || 12), 50);
    
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
          { tags: safeRegex }
        ]
      })
        .select('title images price duration destination rating slug')
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
          { city: safeRegex }
        ]
      })
        .select('name images pricePerNight stars location slug')
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
          { category: safeRegex }
        ]
      })
        .select('title thumbnail category author publishedAt slug')
        .limit(searchLimit)
        .lean()
    ]);

    res.json({ tours, hotels, news });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
