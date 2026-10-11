import { Request, Response } from 'express';
import Tour from '../models/Tour';
import Hotel from '../models/Hotel';
import { cacheService } from '../services/cacheService';

export const getFlashSaleItems = async (_req: Request, res: Response) => {
  try {
    const cached = cacheService.get('flash_sale_items');
    if (cached) return res.json(cached);

    const now = new Date();

    let [tours, hotels] = await Promise.all([
      Tour.find({
        isActive: { $ne: false },
        isFlashSale: true,
        flashSaleEnd: { $gt: now }
      }).lean(),
      Hotel.find({
        isActive: { $ne: false },
        isFlashSale: true,
        flashSaleEnd: { $gt: now }
      }).lean()
    ]);

    // If no active flash sale items exist (expired or not yet configured),
    // automatically activate flash sales with a 7-day rolling duration so the section is always active & populated
    if (tours.length === 0 && hotels.length === 0) {
      const rollingEnd = new Date(Date.now() + 7 * 24 * 3600 * 1000);

      // Check if any tours previously had flash sale, re-activate them; otherwise pick 2 active tours
      const existingTours = await Tour.find({ isActive: { $ne: false }, isFlashSale: true });
      if (existingTours.length > 0) {
        for (const t of existingTours) {
          t.flashSaleEnd = rollingEnd;
          if (!t.flashSalePrice) t.flashSalePrice = Math.round((t.price || 2000000) * 0.7);
          await t.save();
        }
      } else {
        const sampleTours = await Tour.find({ isActive: { $ne: false } }).limit(2);
        for (const t of sampleTours) {
          t.isFlashSale = true;
          t.flashSalePrice = Math.round((t.price || 2000000) * 0.7);
          t.flashSaleEnd = rollingEnd;
          await t.save();
        }
      }

      // Check if any hotels previously had flash sale, re-activate them; otherwise pick 1 active hotel
      const existingHotels = await Hotel.find({ isActive: { $ne: false }, isFlashSale: true });
      if (existingHotels.length > 0) {
        for (const h of existingHotels) {
          h.flashSaleEnd = rollingEnd;
          if (!h.flashSalePrice) h.flashSalePrice = Math.round((h.pricePerNight || 1500000) * 0.65);
          await h.save();
        }
      } else {
        const sampleHotels = await Hotel.find({ isActive: { $ne: false } }).limit(1);
        for (const h of sampleHotels) {
          h.isFlashSale = true;
          h.flashSalePrice = Math.round((h.pricePerNight || 1500000) * 0.65);
          h.flashSaleEnd = rollingEnd;
          await h.save();
        }
      }

      [tours, hotels] = await Promise.all([
        Tour.find({
          isActive: { $ne: false },
          isFlashSale: true,
          flashSaleEnd: { $gt: now }
        }).lean(),
        Hotel.find({
          isActive: { $ne: false },
          isFlashSale: true,
          flashSaleEnd: { $gt: now }
        }).lean()
      ]);
    }

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
