import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  getMe,
  updateProfile,
  getAllUsers,
  updateUserRole,
  deleteUser,
  updateAdminUser,
  toggleUserStatus,
} from '../controllers/authController';
import { protect, adminOnly } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refreshToken);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/:id', protect, adminOnly, updateAdminUser);
router.patch('/users/:id/role', protect, adminOnly, updateUserRole);
router.patch('/users/:id/status', protect, adminOnly, toggleUserStatus);
router.delete('/users/:id', protect, adminOnly, deleteUser);

export default router;
