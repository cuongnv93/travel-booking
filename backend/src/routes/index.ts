import { Router } from 'express';
import authRoutes from './authRoutes';
import tourRoutes from './tourRoutes';
import bookingRoutes from './bookingRoutes';
import newsRoutes from './newsRoutes';
import hotelRoutes from './hotelRoutes';
import specialtyRoutes from './specialtyRoutes';
import pageRoutes from './pageRoutes';
import settingRoutes from './settingRoutes';
import uploadRoutes from './uploadRoutes';
import searchRoutes from './searchRoutes';
import flightRoutes from './flightRoutes';
import flashSaleRoutes from './flashSaleRoutes';
import couponRoutes from './couponRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tours', tourRoutes);
router.use('/bookings', bookingRoutes);
router.use('/news', newsRoutes);
router.use('/hotels', hotelRoutes);
router.use('/specialties', specialtyRoutes);
router.use('/pages', pageRoutes);
router.use('/settings', settingRoutes);
router.use('/upload', uploadRoutes);
router.use('/search', searchRoutes);
router.use('/flights', flightRoutes);
router.use('/flash-sale', flashSaleRoutes);
router.use('/coupons', couponRoutes);

export default router;
