 import express from 'express';
import { 
  addOrderItems, 
  getOrders, 
  getAllOrders, 
  updateOrderStatus, 
  updateOrderShipment, 
  addOrderNote, 
  processReturnRequest 
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getOrders)
  .post(protect, addOrderItems);

router.route('/admin')
  .get(protect, admin, getAllOrders);

router.route('/:id/status')
  .put(protect, admin, updateOrderStatus);

router.route('/:id/shipment')
  .put(protect, admin, updateOrderShipment);

router.route('/:id/notes')
  .post(protect, admin, addOrderNote);

router.route('/:id/return')
  .put(protect, admin, processReturnRequest);

export default router;