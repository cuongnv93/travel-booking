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
    const { from = 'SGN', to = 'HAN' } = req.query;
    const fromCode = (from as string).toUpperCase();
    const toCode = (to as string).toUpperCase();

    const filter: any = { isAvailable: { $ne: false } };
    if (fromCode) filter.from = fromCode;
    if (toCode) filter.to = toCode;

    let flights = await Flight.find(filter).sort({ price: 1 }).lean();

    // If no exact match in DB, generate realistic flights and persist them to DB
    if (!flights || flights.length === 0) {
      const generated: any[] = [];
      const times = [
        { dep: '06:15', arr: '08:25', dur: '2h 10m' },
        { dep: '09:30', arr: '11:45', dur: '2h 15m' },
        { dep: '12:00', arr: '14:10', dur: '2h 10m' },
        { dep: '15:45', arr: '18:00', dur: '2h 15m' },
        { dep: '19:20', arr: '21:35', dur: '2h 15m' },
        { dep: '21:50', arr: '23:55', dur: '2h 05m' },
      ];

      AIRLINES_CONFIG.forEach((airline, index) => {
        const timeObj = times[index % times.length];
        const flightNum = `${airline.prefix}-${100 + index * 15}`;
        const priceVar = (index % 3) * 150000;

        generated.push({
          airline: airline.name,
          logo: airline.logo,
          flightNumber: flightNum,
          from: fromCode,
          to: toCode,
          departureTime: timeObj.dep,
          arrivalTime: timeObj.arr,
          duration: timeObj.dur,
          price: airline.basePrice + priceVar,
          availableSeats: 25 + (index * 12),
          isAvailable: true,
        });
      });

      try {
        await Flight.insertMany(generated, { ordered: false });
      } catch {
        // Ignore duplicate key errors if already seeded
      }

      flights = await Flight.find(filter).sort({ price: 1 }).lean();
    }

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
