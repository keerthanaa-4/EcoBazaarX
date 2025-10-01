import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import { getOrders, createOrder } from "../controllers/orderController.js";

const router = express.Router();

router.get("/", protect, admin, getOrders);
router.post("/", protect, createOrder);

export default router; // ✅ make it a default export
