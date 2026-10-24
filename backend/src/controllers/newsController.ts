import { Request, Response } from 'express';
import mongoose from 'mongoose';
import News from '../models/News';
import { paginate, slugify } from '../utils/helpers';

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
    const { slug } = req.params;
    let news = await News.findOne({ slug });
    if (!news && /^[0-9a-fA-F]{24}$/.test(slug)) {
      news = await News.findById(slug);
    }
    if (!news) return res.status(404).json({ message: 'News not found' });
    res.json(news);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

const generateSlug = (title: string) => slugify(title, true);

export const create = async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    if (!data.slug) {
      const titleStr = typeof data.title === 'string' ? data.title : (data.title?.vi || data.title?.en || Object.values(data.title || {})[0] || 'tin-tuc');
      data.slug = generateSlug(String(titleStr));
    }
    if (data.isPublished && !data.publishedAt) {
      data.publishedAt = new Date();
    }
    const news = await News.create(data);
    cacheService.flush();
    res.status(201).json(news);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'News not found' });
    }
    const data = { ...req.body };
    if (!data.slug && data.title) {
      const titleStr = typeof data.title === 'string' ? data.title : (data.title?.vi || data.title?.en || Object.values(data.title || {})[0] || 'tin-tuc');
      data.slug = generateSlug(String(titleStr));
    }
    // Set publishedAt when publishing for the first time
    if (data.isPublished) {
      const existing = await News.findById(req.params.id);
      if (existing && !existing.isPublished) {
        data.publishedAt = new Date();
      }
    }
    const news = await News.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!news) return res.status(404).json({ message: 'News not found' });
    cacheService.flush();
    res.json(news);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNews = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'News not found' });
    }
    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) return res.status(404).json({ message: 'News not found' });
    cacheService.flush();
    res.json({ message: 'News removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const duplicateNews = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'News not found' });
    }
    const original = await News.findById(req.params.id).lean();
    if (!original) return res.status(404).json({ message: 'News not found' });

    const { _id, createdAt, publishedAt, ...rest } = original as any;
    const viTitle = typeof rest.title === 'string' ? `${rest.title} (Bản sao)` : `${rest.title?.vi || 'Tin tức'} (Bản sao)`;
    const newTitle = typeof rest.title === 'object' && rest.title
      ? { ...rest.title, vi: viTitle, en: rest.title.en ? `${rest.title.en} (Copy)` : '' }
      : { vi: viTitle, en: '' };

    const newSlug = generateSlug(viTitle);

    const duplicated = await News.create({
      ...rest,
      title: newTitle,
      slug: newSlug,
      isPublished: false, // Draft
      createdAt: new Date(),
    });

    cacheService.flush();
    res.status(201).json(duplicated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
