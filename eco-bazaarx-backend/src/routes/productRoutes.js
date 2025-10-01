import express from "express";
import { protect, verifyAdmin} from "../middleware/authMiddleware.js";
import pool from "../config/db.js";

const router = express.Router();

// Get all products
router.get("/", protect, async (req, res) => {
  try {
    const [products] = await pool.query("SELECT * FROM products");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
