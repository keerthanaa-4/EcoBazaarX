import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import { getUsers, createUser } from "../controllers/userController.js"; // names must match

const router = express.Router();

router.get("/", protect, admin, getUsers);
router.post("/", protect, admin, createUser);

export default router;
