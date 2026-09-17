 import express from 'express';
import { registerUser, loginUser, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js'; // 👈 Make sure this import is here

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/profile', protect, updateProfile); // Now 'protect' is defined!

export default router;