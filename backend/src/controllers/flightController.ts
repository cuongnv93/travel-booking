import { Request, Response } from 'express';
import Flight from '../models/Flight';
import { fetchLiveAmadeusFlights } from '../services/flightApiService';

const AIRLINES_CONFIG = [
  { name: 'Vietravel Airlines', logo: 'VU', prefix: 'VU', basePrice: 890000 },
  { name: 'Vietnam Airlines', logo: 'VN', prefix: 'VN', basePrice: 1450000 },
  { name: 'Vietjet Air', logo: 'VJ', prefix: 'VJ', basePrice: 780000 },
  { name: 'Bamboo Airways', logo: 'QH', prefix: 'QH', basePrice: 1190000 },
];

export const getAll = async (req: Request, res: Response) => {
  try {
    const { from = 'SGN', to = 'HAN', date } = req.query;
    const fromCode = (from as string).toUpperCase();
    const toCode = (to as string).toUpperCase();
    const departDate = date as string;

    // 1. Try Live Amadeus API if credentials are set in .env
    const liveFlights = await fetchLiveAmadeusFlights(fromCode, toCode, departDate);
    if (liveFlights && liveFlights.length > 0) {
      return res.json(liveFlights);
    }

    // 2. Query MongoDB for existing flights
    const filter: any = { isAvailable: { $ne: false } };
    if (fromCode) filter.from = fromCode;
    if (toCode) filter.to = toCode;

    let flights = await Flight.find(filter).sort({ price: 1 }).lean();

    // 3. Fallback: generate realistic dynamic flights (including Vietravel Airlines)
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
        const flightNum = `${airline.prefix}-${100 + Math.floor(Math.random() * 800)}`;
        const priceVar = (index % 3) * 150000;

        generated.push({
          _id: `dynamic-${fromCode}-${toCode}-${index}`,
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

      flights = generated;
    }

    res.json(flights);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
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
    const flight = await Flight.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!flight) return res.status(404).json({ message: 'Flight not found' });
    res.json(flight);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const flight = await Flight.findByIdAndDelete(req.params.id);
    if (!flight) return res.status(404).json({ message: 'Flight not found' });
    res.json({ message: 'Flight deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
