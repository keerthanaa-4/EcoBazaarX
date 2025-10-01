import express from "express";
import { getMyProducts, addProduct, updateProduct, deleteProduct, getMyOrders, getMyReviews, getSellerStats, updateOrderStatus, replyToReview  } from "../controllers/sellerController.js";
import { verifySeller } from "../middleware/sellerMiddleware.js";
// routes/sellerRoutes.js

import { replyReview } from "../controllers/sellerController.js";
import { protect } from "../middleware/authMiddleware.js";





const router = express.Router();

// Products
router.get("/products", verifySeller, getMyProducts);
router.post("/products", verifySeller, addProduct);
router.put("/products/:id", verifySeller, updateProduct);
router.delete("/products/:id", verifySeller, deleteProduct);




// Orders
router.get("/orders", verifySeller, getMyOrders);
router.put("/orders/:orderId/status", verifySeller, updateOrderStatus);



// Reviews
router.get("/reviews", verifySeller, getMyReviews);
router.put("/reviews/:reviewId/reply", verifySeller, replyToReview);
//router.post("/reviews/:id/reply", protect, verifySeller, replyReview);//


// Stats
router.get("/stats", verifySeller, getSellerStats);

export default router;
