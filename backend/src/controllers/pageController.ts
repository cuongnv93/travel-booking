import { Request, Response } from 'express';
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
