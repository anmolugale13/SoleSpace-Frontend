 import express from 'express';
import { addOrderItems, getOrders } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getOrders)
  .post(protect, addOrderItems);

export default router;