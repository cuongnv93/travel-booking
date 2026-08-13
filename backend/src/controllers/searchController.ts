import { Request, Response } from 'express';
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
