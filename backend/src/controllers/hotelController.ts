import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Hotel from '../models/Hotel';
import { escapeRegex, buildDestinationRegex } from '../utils/helpers';
import { cacheService } from '../services/cacheService';

export const getAll = async (req: Request, res: Response) => {
  try {
    const { location, stars, priceMin, priceMax, all, isActive } = req.query;
    const query: any = {};

    // Only filter isActive: true when not explicitly requesting all or specific isActive flag
    if (all !== 'true' && isActive === undefined) {
      query.isActive = true;
    } else if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (location) {
      const locRegex = buildDestinationRegex(location as string);
      query.$or = [
        { location: locRegex },
        { address: locRegex },
        { 'name.vi': locRegex },
        { 'name.en': locRegex },
      ];
    }
    if (stars) query.stars = Number(stars);
    if (priceMin || priceMax) {
      query.pricePerNight = {};
      if (priceMin) query.pricePerNight.$gte = Number(priceMin);
      if (priceMax) query.pricePerNight.$lte = Number(priceMax);
    }

    const hotels = await Hotel.find(query)
      .sort({ stars: -1, createdAt: -1 })
      .lean();
    res.json(hotels);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    let hotel = await Hotel.findOne({ slug }).lean();
    if (!hotel && /^[0-9a-fA-F]{24}$/.test(slug)) {
      hotel = await Hotel.findById(slug).lean();
    }
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    res.json(hotel);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getLocations = async (_req: Request, res: Response) => {
  try {
    const cached = cacheService.get('hotel_locations');
    if (cached) return res.json(cached);

    const locations = await Hotel.distinct('location', { isActive: true });
    const result = locations.filter(Boolean).sort();
    cacheService.set('hotel_locations', result);
    res.json(result);
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
    cacheService.del('hotel_locations');
    cacheService.del('flash_sale_items');
    const data = { ...req.body };
    if (!data.slug) {
      const nameStr = typeof data.name === 'string' ? data.name : (data.name?.vi || data.name?.en || Object.values(data.name || {})[0] || 'hotel');
      data.slug = generateSlug(String(nameStr));
    }
    const hotel = await Hotel.create(data);
    res.status(201).json(hotel);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    cacheService.del('hotel_locations');
    cacheService.del('flash_sale_items');
    const data = { ...req.body };
    if (!data.slug && data.name) {
      const nameStr = typeof data.name === 'string' ? data.name : (data.name?.vi || data.name?.en || Object.values(data.name || {})[0] || 'hotel');
      data.slug = generateSlug(String(nameStr));
    }
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    res.json(hotel);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteHotel = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    cacheService.del('hotel_locations');
    cacheService.del('flash_sale_items');
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    res.json({ message: 'Hotel removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
