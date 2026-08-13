import { Router } from 'express';
import { register, login, refreshToken, getMe, updateProfile, getAllUsers, updateUserRole, deleteUser } from '../controllers/authController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/users', protect, adminOnly, getAllUsers);
router.patch('/users/:id/role', protect, adminOnly, updateUserRole);
router.delete('/users/:id', protect, adminOnly, deleteUser);

export default router;
