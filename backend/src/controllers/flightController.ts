import { Request, Response } from 'express';
import Flight from '../models/Flight';

import mongoose from 'mongoose';

const AIRLINES_CONFIG = [
  { name: 'Vietravel Airlines', logo: 'VU', prefix: 'VU', basePrice: 890000 },
  { name: 'Vietnam Airlines', logo: 'VN', prefix: 'VN', basePrice: 1450000 },
  { name: 'Vietjet Air', logo: 'VJ', prefix: 'VJ', basePrice: 780000 },
  { name: 'Bamboo Airways', logo: 'QH', prefix: 'QH', basePrice: 1190000 },
];

export const getAll = async (req: Request, res: Response) => {
  try {
    const { from, to, all } = req.query;
    const filter: any = {};

    const fromCode = from ? String(from).trim().toUpperCase() : '';
    const toCode = to ? String(to).trim().toUpperCase() : '';

    if (all !== 'true') {
      filter.isAvailable = { $ne: false };
    }

    if (fromCode) filter.from = fromCode;
    if (toCode) filter.to = toCode;

    // For public searches with no route specified, default to SGN -> HAN
    if (all !== 'true' && !fromCode && !toCode) {
      filter.from = 'SGN';
      filter.to = 'HAN';
    }

    const flights = await Flight.find(filter).sort({ price: 1 }).limit(100).lean();
    res.json(flights);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    const flight = await Flight.findById(req.params.id);
    if (!flight) return res.status(404).json({ message: 'Flight not found' });
    res.json(flight);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const flight = await Flight.create(req.body);
    res.status(201).json(flight);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Số hiệu chuyến bay đã tồn tại' });
    }
    res.status(500).json({ message: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    const flight = await Flight.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!flight) return res.status(404).json({ message: 'Flight not found' });
    res.json(flight);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    const flight = await Flight.findByIdAndDelete(req.params.id);
    if (!flight) return res.status(404).json({ message: 'Flight not found' });
    res.json({ message: 'Flight deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
