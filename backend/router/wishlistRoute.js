import express from "express";
import { toggleWishlist, getMyWishlist } from "../controller/wishlistController.js";
import { authenticateToken } from "../middleware/auth.js"; 

const router = express.Router();

// ใช้ authenticateToken กั้นด่านไว้ ต้อง Login ก่อนเสมอ
router.post("/wishlist/toggle", authenticateToken, toggleWishlist);
router.get("/wishlist", authenticateToken, getMyWishlist);

export default router;