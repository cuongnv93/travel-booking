import { Request, Response } from 'express';
import Specialty from '../models/Specialty';

export const getAll = async (req: Request, res: Response) => {
  try {
    const specialties = await Specialty.find().sort({ createdAt: -1 });
    res.json(specialties);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getBySlug = async (req: Request, res: Response) => {
  try {
    const specialty = await Specialty.findOne({ slug: req.params.slug });
    if (!specialty) return res.status(404).json({ message: 'Specialty not found' });
    res.json(specialty);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') + '-' + Date.now().toString().slice(-6);
};

export const create = async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    if (!data.slug) {
      const nameStr = typeof data.name === 'string' ? data.name : (data.name?.vi || data.name?.en || Object.values(data.name || {})[0] || 'dac-san');
      data.slug = generateSlug(String(nameStr));
    }
    const specialty = await Specialty.create(data);
    res.status(201).json(specialty);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    if (!data.slug && data.name) {
      const nameStr = typeof data.name === 'string' ? data.name : (data.name?.vi || data.name?.en || Object.values(data.name || {})[0] || 'dac-san');
      data.slug = generateSlug(String(nameStr));
    }
    const specialty = await Specialty.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!specialty) return res.status(404).json({ message: 'Specialty not found' });
    res.json(specialty);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSpecialty = async (req: Request, res: Response) => {
  try {
    const specialty = await Specialty.findByIdAndDelete(req.params.id);
    if (!specialty) return res.status(404).json({ message: 'Specialty not found' });
    res.json({ message: 'Specialty removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
