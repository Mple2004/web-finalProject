import express from "express";
import {
  checkout,
  getOrderHistory,
  getOrderDetail,
  getAdminSalesSummary,
  getAdminDashboard,
  getAllOrders,
  updateOrderStatus,
  getMemberOrders,
} from "../controller/transactionController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: ระบบจัดการการชำระเงินและประวัติคำสั่งซื้อ
 */

/**
 * @swagger
 * /transaction/checkout:
 *   post:
 *     summary: ชำระเงิน (Checkout) ระบบจะอ่าน Email จาก Token
 *     tags: [Transactions]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cart_id:
 *                 type: integer
 *                 description: รหัสตะกร้าสินค้าที่ต้องการชำระเงิน
 *                 example: 1
 *               payment_method:
 *                 type: string
 *                 description: วิธีการชำระเงิน
 *                 example: "credit_card"
 *     responses:
 *       200:
 *         description: ชำระเงินสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 checkoutOK:
 *                   type: boolean
 *                   example: true
 *                 transaction_id:
 *                   type: integer
 *                   example: 101
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (Token ไม่ถูกต้อง)
 */
router.post("/transaction/checkout", authenticateToken, checkout);

/**
 * @swagger
 * /transaction/history:
 *   get:
 *     summary: ดูประวัติคำสั่งซื้อทั้งหมดของผู้ใช้ที่ล็อกอินอยู่ (อ่าน Email จาก Token)
 *     tags: [Transactions]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: รายการประวัติคำสั่งซื้อทั้งหมด (Array)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   cart_id:
 *                     type: integer
 *                     example: 1
 *                   total_price:
 *                     type: number
 *                     example: 1200
 *                   status:
 *                     type: string
 *                     example: "completed"
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-01-15T10:30:00Z"
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (Token ไม่ถูกต้อง)
 */
router.get("/transaction/history", authenticateToken, getOrderHistory);

/**
 * @swagger
 * /transaction/detail/{cart_id}:
 *   get:
 *     summary: ดูรายละเอียดเชิงลึกของแต่ละคำสั่งซื้อ
 *     tags: [Transactions]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: cart_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: รหัสตะกร้าสินค้า (Cart ID) ที่ต้องการดูรายละเอียด
 *         example: 1
 *     responses:
 *       200:
 *         description: รายละเอียดคำสั่งซื้อและสินค้าทุกชิ้นในออเดอร์นี้
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cart_id:
 *                   type: integer
 *                   example: 1
 *                 total_price:
 *                   type: number
 *                   example: 1200
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       product_id:
 *                         type: integer
 *                         example: 2
 *                       product_name:
 *                         type: string
 *                         example: "Red Wine"
 *                       qty:
 *                         type: integer
 *                         example: 2
 *                       price:
 *                         type: number
 *                         example: 600
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (Token ไม่ถูกต้อง)
 *       404:
 *         description: ไม่พบคำสั่งซื้อนี้
 */
router.get("/transaction/detail/:cart_id", authenticateToken, getOrderDetail);

/**
 * @swagger
 * /admin/sales-summary:
 *   get:
 *     summary: ดูสรุปยอดขายทั้งหมด (เฉพาะ Admin)
 *     tags: [Transactions]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: ข้อมูลสรุปยอดขาย
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_orders:
 *                   type: integer
 *                   description: จำนวนออเดอร์ทั้งหมด
 *                   example: 250
 *                 total_revenue:
 *                   type: number
 *                   description: รายได้รวมทั้งหมด
 *                   example: 125000
 *                 best_selling:
 *                   type: array
 *                   description: สินค้าขายดี
 *                   items:
 *                     type: object
 *                     properties:
 *                       product_name:
 *                         type: string
 *                         example: "Red Wine"
 *                       total_sold:
 *                         type: integer
 *                         example: 80
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (Token ไม่ถูกต้อง)
 *       403:
 *         description: ไม่มีสิทธิ์ Admin
 */
router.get("/admin/sales-summary", authenticateToken, getAdminSalesSummary);

// ── Admin Routes ─────────────────────────────────────────────
router.get("/admin/dashboard", authenticateToken, getAdminDashboard);
router.get("/admin/orders", authenticateToken, getAllOrders);
router.put("/admin/order/:cart_id/status", authenticateToken, updateOrderStatus);
router.get("/admin/member-orders/:email", authenticateToken, getMemberOrders);

export default router;