import express from "express";
import { getAllCustomers, searchCustomers, getCustomerById, getCustomerOrders } from "../controllers/customerController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/admin", protect, getAllCustomers);
router.get("/admin/search", protect, searchCustomers);
router.get("/admin/:id/orders", protect, getCustomerOrders);
router.get("/admin/:id", protect, getCustomerById);

export default router;