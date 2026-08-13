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

export const create = async (req: Request, res: Response) => {
  try {
    const specialty = await Specialty.create(req.body);
    res.status(201).json(specialty);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const specialty = await Specialty.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
