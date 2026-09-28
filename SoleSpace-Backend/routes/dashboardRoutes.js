import express from "express";
import { getDashboardAnalytics } from "../controllers/dashboardController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getDashboardAnalytics);

export default router;