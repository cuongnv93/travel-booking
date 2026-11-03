import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Specialty from '../models/Specialty';
import { slugify } from '../utils/helpers';
import { cacheService } from '../services/cacheService';

const generateSlug = (title: string) => slugify(title, true);

const invalidateSpecialtyCaches = () => {
  cacheService.delByPrefix('specialties_');
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const { region } = req.query;
    const cacheKey = `specialties_${region || 'all'}`;
    const cached = cacheService.get(cacheKey);
    if (cached) return res.json(cached);

    const filter: any = { isActive: { $ne: false } };
    if (region && typeof region === 'string') {
      filter.region = region;
    }

    const specialties = await Specialty.find(filter).sort({ createdAt: -1 }).lean();
    cacheService.set(cacheKey, specialties, 300);
    res.json(specialties);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const cacheKey = `specialty_${slug}`;
    const cached = cacheService.get(cacheKey);
    if (cached) return res.json(cached);

    let specialty = await Specialty.findOne({ slug }).lean();
    if (!specialty && mongoose.Types.ObjectId.isValid(slug)) {
      specialty = await Specialty.findById(slug).lean();
    }
    if (!specialty) return res.status(404).json({ message: 'Không tìm thấy đặc sản' });

    cacheService.set(cacheKey, specialty, 300);
    res.json(specialty);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    if (!data.slug) {
      const nameStr = typeof data.name === 'string'
        ? data.name
        : (data.name?.vi || data.name?.en || Object.values(data.name || {})[0] || 'dac-san');
      data.slug = generateSlug(String(nameStr));
    }
    const specialty = await Specialty.create(data);
    invalidateSpecialtyCaches();
    res.status(201).json(specialty);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Không tìm thấy đặc sản' });
    }
    const data = { ...req.body };
    if (!data.slug && data.name) {
      const nameStr = typeof data.name === 'string'
        ? data.name
        : (data.name?.vi || data.name?.en || Object.values(data.name || {})[0] || 'dac-san');
      data.slug = generateSlug(String(nameStr));
    }
    const specialty = await Specialty.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!specialty) return res.status(404).json({ message: 'Không tìm thấy đặc sản' });
    invalidateSpecialtyCaches();
    res.json(specialty);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSpecialty = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Không tìm thấy đặc sản' });
    }
    const specialty = await Specialty.findByIdAndDelete(req.params.id);
    if (!specialty) return res.status(404).json({ message: 'Không tìm thấy đặc sản' });
    invalidateSpecialtyCaches();
    res.json({ message: 'Đã xóa đặc sản thành công' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
