import express from "express";
import {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllMembers,
  deleteMember,
} from "../controller/adminController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: ระบบจัดการสำหรับ Admin (ต้อง Login และมีสิทธิ์ Admin เท่านั้น)
 */

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: ดูสถิติภาพรวมของระบบ (Dashboard)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: ข้อมูลสถิติภาพรวม
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_members:
 *                   type: integer
 *                   description: จำนวนสมาชิกทั้งหมด
 *                   example: 120
 *                 total_orders:
 *                   type: integer
 *                   description: จำนวนออเดอร์ทั้งหมด
 *                   example: 350
 *                 total_revenue:
 *                   type: number
 *                   description: รายได้รวมทั้งหมด
 *                   example: 175000
 *                 total_products:
 *                   type: integer
 *                   description: จำนวนสินค้าทั้งหมด
 *                   example: 80
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (Token ไม่ถูกต้อง)
 *       403:
 *         description: ไม่มีสิทธิ์ Admin
 */
router.get("/admin/dashboard", authenticateToken, getDashboardStats);

/**
 * @swagger
 * /admin/orders:
 *   get:
 *     summary: ดูรายการออเดอร์ทั้งหมดในระบบ
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: รายการออเดอร์ทั้งหมด (Array)
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
 *                   email:
 *                     type: string
 *                     example: "user@example.com"
 *                   total_price:
 *                     type: number
 *                     example: 1200
 *                   status:
 *                     type: string
 *                     example: "pending"
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-01-15T10:30:00Z"
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (Token ไม่ถูกต้อง)
 *       403:
 *         description: ไม่มีสิทธิ์ Admin
 */
router.get("/admin/orders", authenticateToken, getAllOrders);

/**
 * @swagger
 * /admin/orders/status:
 *   put:
 *     summary: อัปเดตสถานะของออเดอร์
 *     tags: [Admin]
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
 *                 description: รหัสออเดอร์ที่ต้องการอัปเดต
 *                 example: 1
 *               status:
 *                 type: string
 *                 description: สถานะใหม่ของออเดอร์
 *                 example: "completed"
 *                 enum:
 *                   - pending
 *                   - processing
 *                   - completed
 *                   - cancelled
 *     responses:
 *       200:
 *         description: อัปเดตสถานะออเดอร์สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 updateOK:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (Token ไม่ถูกต้อง)
 *       403:
 *         description: ไม่มีสิทธิ์ Admin
 *       404:
 *         description: ไม่พบออเดอร์นี้
 */
router.put("/admin/orders/status", authenticateToken, updateOrderStatus);

/**
 * @swagger
 * /admin/members:
 *   get:
 *     summary: ดูรายการสมาชิกทั้งหมดในระบบ
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: รายการสมาชิกทั้งหมด (Array)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                     example: "user@example.com"
 *                   name:
 *                     type: string
 *                     example: "John Doe"
 *                   role:
 *                     type: string
 *                     example: "user"
 *                     enum:
 *                       - user
 *                       - admin
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-01-01T00:00:00Z"
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (Token ไม่ถูกต้อง)
 *       403:
 *         description: ไม่มีสิทธิ์ Admin
 */
router.get("/admin/members", authenticateToken, getAllMembers);

/**
 * @swagger
 * /admin/members/{email}:
 *   delete:
 *     summary: ลบสมาชิกออกจากระบบด้วย Email
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: Email ของสมาชิกที่ต้องการลบ
 *         example: "user@example.com"
 *     responses:
 *       200:
 *         description: ลบสมาชิกสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deleteOK:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (Token ไม่ถูกต้อง)
 *       403:
 *         description: ไม่มีสิทธิ์ Admin
 *       404:
 *         description: ไม่พบสมาชิกนี้
 */
router.delete("/admin/members/:email", authenticateToken, deleteMember);

export default router;