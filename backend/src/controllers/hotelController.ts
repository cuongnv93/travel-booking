import { Request, Response } from 'express';
import Hotel from '../models/Hotel';

export const getAll = async (req: Request, res: Response) => {
  try {
    const { location, stars, priceMin, priceMax } = req.query;
    const query: any = { isActive: true };

    if (location) query.location = { $regex: location as string, $options: 'i' };
    if (stars) query.stars = Number(stars);
    if (priceMin || priceMax) {
      query.pricePerNight = {};
      if (priceMin) query.pricePerNight.$gte = Number(priceMin);
      if (priceMax) query.pricePerNight.$lte = Number(priceMax);
    }

    const hotels = await Hotel.find(query).sort({ stars: -1, createdAt: -1 });
    res.json(hotels);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getBySlug = async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.findOne({ slug: req.params.slug });
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    res.json(hotel);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getLocations = async (_req: Request, res: Response) => {
  try {
    const locations = await Hotel.distinct('location', { isActive: true });
    res.json(locations.filter(Boolean).sort());
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.create(req.body);
    res.status(201).json(hotel);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    res.json(hotel);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteHotel = async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    res.json({ message: 'Hotel removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
