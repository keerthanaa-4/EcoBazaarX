import express from "express";
import { protect, verifyAdmin } from "../middleware/authMiddleware.js";
import { getAdminStats, getAllUsers, getPendingUsers, approveUser,getAllOrders, deleteUser } from "../controllers/adminController.js";
import { getAllProducts, getProductById,addProduct,updateProduct, deleteProduct,getAllSellers } from '../controllers/adminController.js';


// Import the new controller at the top
import { approveOrder } from "../controllers/adminController.js";


const router = express.Router();
router.use(protect, verifyAdmin);

router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);
router.get("/pending-users", getPendingUsers);
router.put("/users/:id/approve", approveUser);
router.delete("/users/:id", deleteUser);
// adminRoutes.js
router.get("/products", verifyAdmin, getAllProducts);
router.get("/products/:id", verifyAdmin, getProductById);
router.post("/products", verifyAdmin, addProduct);
router.put("/products/:id", verifyAdmin, updateProduct);
router.delete("/products/:id", verifyAdmin, deleteProduct);
router.get("/products", protect, verifyAdmin, getAllProducts);
router.get("/users", protect, verifyAdmin, getAllUsers);
router.get("/sellers", protect, verifyAdmin, getAllSellers);


// Add this line somewhere after your other router.get routes:
router.get("/orders", protect, verifyAdmin, getAllOrders);
// Approve order
router.put("/orders/:id/approve", protect, verifyAdmin, approveOrder);



export default router;
