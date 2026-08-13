import { Request, Response } from 'express';
import News from '../models/News';
import { paginate } from '../utils/helpers';

import { cacheService } from '../services/cacheService';

// PUBLIC: only published articles
export const getAll = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const cacheKey = `news_${JSON.stringify(req.query)}`;
    const cached = cacheService.get(cacheKey);
    if (cached) return res.json(cached);

    const query: any = { isPublished: true };
    if (category) query.category = category;

    const news = await News.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    const total = await News.countDocuments(query);
    const result = paginate(news, total, Number(page), Number(limit));
    cacheService.set(cacheKey, result);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN: all articles (published + draft)
export const getAllAdmin = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 100, category } = req.query;
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
    const data = { ...req.body };
    if (data.isPublished && !data.publishedAt) {
      data.publishedAt = new Date();
    }
    const news = await News.create(data);
    res.status(201).json(news);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    // Set publishedAt when publishing for the first time
    if (data.isPublished) {
      const existing = await News.findById(req.params.id);
      if (existing && !existing.isPublished) {
        data.publishedAt = new Date();
      }
    }
    const news = await News.findByIdAndUpdate(req.params.id, data, { new: true });
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
