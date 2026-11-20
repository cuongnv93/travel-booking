import { Router } from 'express';
import { globalSearch } from '../controllers/searchController';
import { searchLimiter } from '../middleware/rateLimiter';

const router = Router();

router.get('/', searchLimiter, globalSearch);

export default router;
