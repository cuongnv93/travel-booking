import { Request, Response } from 'express';
import Page from '../models/Page';
import { cacheService } from '../services/cacheService';

export const getBySlug = async (req: Request, res: Response) => {
  try {
    const cacheKey = `page_${req.params.slug}`;
    const cached = cacheService.get(cacheKey);
    if (cached) return res.json(cached);

    const page = await Page.findOne({ slug: req.params.slug }).lean();
    if (!page) return res.status(404).json({ message: 'Page not found' });

    cacheService.set(cacheKey, page);
    res.json(page);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const upsert = async (req: Request, res: Response) => {
  try {
    cacheService.del(`page_${req.params.slug}`);
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
