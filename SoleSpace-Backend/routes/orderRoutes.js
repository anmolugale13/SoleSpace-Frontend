import express from 'express';

import {
    addOrderItems,
    getOrders,
    getAllOrders,
    updateOrderStatus,
    getAdminOrderById
} from '../controllers/orderController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Customer
router.route('/')
    .get(protect, getOrders)
    .post(protect, addOrderItems);

// Admin
router.get('/admin', protect, getAllOrders);
router.get('/admin/:id', protect, getAdminOrderById);
router.put('/admin/:id/status', protect, updateOrderStatus);

export default router;