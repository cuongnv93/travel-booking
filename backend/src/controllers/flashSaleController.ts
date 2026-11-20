import { Request, Response } from 'express';
import Tour from '../models/Tour';
import Hotel from '../models/Hotel';
import { cacheService } from '../services/cacheService';

export const getFlashSaleItems = async (_req: Request, res: Response) => {
  try {
    const cached = cacheService.get('flash_sale_items');
    if (cached) return res.json(cached);

    const now = new Date();

    const [tours, hotels] = await Promise.all([
      Tour.find({
        isActive: { $ne: false },
        isFlashSale: true,
        flashSaleEnd: { $gt: now }
      }).limit(20).lean(),
      Hotel.find({
        isActive: { $ne: false },
        isFlashSale: true,
        flashSaleEnd: { $gt: now }
      }).limit(20).lean()
    ]);

    const formattedTours = tours.map(t => ({
      ...t,
      itemType: 'tour',
      salePrice: t.flashSalePrice || t.price,
      originalPrice: t.originalPrice || t.price,
      title: t.title,
      name: t.title,
    }));

    const formattedHotels = hotels.map(h => ({
      ...h,
      itemType: 'hotel',
      salePrice: h.flashSalePrice || h.pricePerNight,
      originalPrice: h.pricePerNight,
      title: h.name,
      name: h.name,
    }));

    const allItems = [...formattedTours, ...formattedHotels];
    // Cache for 60 seconds
    cacheService.set('flash_sale_items', allItems);
    res.json(allItems);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const seedFlashSale = async (_req: Request, res: Response) => {
  try {
    cacheService.del('flash_sale_items');
    const futureDate = new Date(Date.now() + 48 * 3600 * 1000); // 48h from now

    const tours = await Tour.find({}).limit(2);
    if (tours.length > 0) {
      tours[0].isFlashSale = true;
      tours[0].flashSalePrice = Math.round((tours[0].price || 2000000) * 0.55);
      tours[0].flashSaleEnd = futureDate;
      await tours[0].save();
    }
    if (tours.length > 1) {
      tours[1].isFlashSale = true;
      tours[1].flashSalePrice = Math.round((tours[1].price || 1500000) * 0.6);
      tours[1].flashSaleEnd = futureDate;
      await tours[1].save();
    }

    const hotels = await Hotel.find({}).limit(2);
    if (hotels.length > 0) {
      hotels[0].isFlashSale = true;
      hotels[0].flashSalePrice = Math.round((hotels[0].pricePerNight || 1200000) * 0.6);
      hotels[0].flashSaleEnd = futureDate;
      await hotels[0].save();
    }
    if (hotels.length > 1) {
      hotels[1].isFlashSale = true;
      hotels[1].flashSalePrice = Math.round((hotels[1].pricePerNight || 950000) * 0.7);
      hotels[1].flashSaleEnd = futureDate;
      await hotels[1].save();
    }

    res.json({ message: 'Flash sale items seeded successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
