import express from "express";
import {
  getAllProducts,
  getProductById,
  placeOrder,
  getCustomerOrders,
  addReview,
  getProfile,
  getCustomerReviews,
  updateProfile,
  replyReview
} from "../controllers/customerController.js";
import { protect } from "../middleware/authMiddleware.js";
import { verifyCustomer } from "../middleware/customerMiddleware.js";

const router = express.Router();

// PRODUCTS
router.get("/products", protect, verifyCustomer, getAllProducts);
router.get("/products/:id", protect, verifyCustomer, getProductById);

// ORDERS
router.post("/orders", protect, verifyCustomer, placeOrder);
router.get("/orders", protect, verifyCustomer, getCustomerOrders);

// REVIEWS
router.post("/reviews", protect, verifyCustomer, addReview);


// PROFILE
router.get("/profile", protect, verifyCustomer, getProfile);
router.put("/profile", protect, verifyCustomer, updateProfile);
// routes/customerRoutes.js or adminRoutes.js
router.post("/reviews/:id/reply", protect, verifyCustomer, replyReview);
// REVIEWS
router.post("/reviews", protect, verifyCustomer, addReview);
router.get("/reviews", protect, verifyCustomer, getCustomerReviews);  // ✅ Add this



export default router;
