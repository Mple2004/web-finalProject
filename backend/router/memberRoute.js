import express from "express";
import {
  postMember,
  loginMember,
  getMember,
  logoutMember,
  uploadMember,
  updateToAdmin,
} from "../controller/memberController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Members
 *   description: ระบบจัดการสมาชิก
 */

/**
 * @swagger
 * /members:
 *   post:
 *     summary: สมัครสมาชิกใหม่
 *     tags: [Members]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *     responses:
 *       200:
 *         description: สมัครสมาชิกสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 memberOK:
 *                   type: boolean
 *                   example: true
 */
router.post("/members", postMember);

/**
 * @swagger
 * /members/login:
 *   post:
 *     summary: เข้าสู่ระบบสมาชิก
 *     tags: [Members]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: เข้าสู่ระบบสำเร็จ (Token จะถูกเก็บใน Cookie)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 loginOK:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: อีเมลหรือรหัสผ่านไม่ถูกต้อง
 */
router.post("/members/login", loginMember);

/**
 * @swagger
 * /members/detail:
 *   get:
 *     summary: ดึงข้อมูลสมาชิกที่ล็อกอินอยู่ (อ่านจาก Cookie Token)
 *     tags: [Members]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: ข้อมูลสมาชิก
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   example: "user@example.com"
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 role:
 *                   type: string
 *                   example: "user"
 */
router.get("/members/detail", getMember);

/**
 * @swagger
 * /members:
 *   get:
 *     summary: ดึงข้อมูลสมาชิกที่ล็อกอินอยู่ (route เดิม)
 *     tags: [Members]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: ข้อมูลสมาชิก
 */
router.get("/members", getMember);

/**
 * @swagger
 * /members/logout:
 *   post:
 *     summary: ออกจากระบบ (ล้าง Cookie Token)
 *     tags: [Members]
 *     responses:
 *       200:
 *         description: ออกจากระบบสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logoutOK:
 *                   type: boolean
 *                   example: true
 */
router.post("/members/logout", logoutMember);

/**
 * @swagger
 * /members/upload:
 *   post:
 *     summary: อัปโหลดรูปโปรไฟล์สมาชิก
 *     tags: [Members]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: ไฟล์รูปภาพโปรไฟล์
 *     responses:
 *       200:
 *         description: อัปโหลดรูปสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uploadOK:
 *                   type: boolean
 *                   example: true
 *                 imageUrl:
 *                   type: string
 *                   example: "https://example.com/uploads/profile.jpg"
 */
router.post("/members/upload", authenticateToken, uploadMember);

/**
 * @swagger
 * /member/set-admin:
 *   put:
 *     summary: อัปเกรดสมาชิกเป็น Admin
 *     tags: [Members]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: อัปเกรดเป็น Admin สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 updateOK:
 *                   type: boolean
 *                   example: true
 */
router.put("/member/set-admin", authenticateToken, updateToAdmin);

export default router;