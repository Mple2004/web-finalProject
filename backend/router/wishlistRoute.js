import express from "express";
import { toggleWishlist, getMyWishlist } from "../controller/wishlistController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: ระบบจัดการรายการสินค้าที่ถูกใจ
 */

/**
 * @swagger
 * /wishlist/toggle:
 *   post:
 *     summary: เพิ่ม/ลบสินค้าออกจาก Wishlist (ถ้ามีอยู่แล้วจะลบ ถ้ายังไม่มีจะเพิ่ม)
 *     tags: [Wishlist]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: integer
 *                 description: รหัสสินค้าที่ต้องการ Toggle
 *                 example: 5
 *     responses:
 *       200:
 *         description: ผลการ Toggle Wishlist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 action:
 *                   type: string
 *                   description: ผลลัพธ์ที่เกิดขึ้น
 *                   example: "added"
 *                   enum:
 *                     - added
 *                     - removed
 *                 wishlistOK:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (Token ไม่ถูกต้อง)
 */
router.post("/wishlist/toggle", authenticateToken, toggleWishlist);

/**
 * @swagger
 * /wishlist:
 *   get:
 *     summary: ดูรายการ Wishlist ทั้งหมดของผู้ใช้ที่ล็อกอินอยู่ (อ่าน Email จาก Token)
 *     tags: [Wishlist]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: รายการสินค้าใน Wishlist ทั้งหมด (Array)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   product_id:
 *                     type: integer
 *                     example: 5
 *                   product_name:
 *                     type: string
 *                     example: "Red Wine"
 *                   price:
 *                     type: number
 *                     example: 599
 *                   added_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-01-15T10:30:00Z"
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (Token ไม่ถูกต้อง)
 */
router.get("/wishlist", authenticateToken, getMyWishlist);

export default router;