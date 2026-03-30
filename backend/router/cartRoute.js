import express from "express";
import * as cartC from "../controller/cartController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Carts
 *     description: ระบบจัดการตะกร้าสินค้า
 */

/**
 * @swagger
 * /carts/addcart:
 *   post:
 *     summary: สร้างตะกร้าสินค้าใบใหม่ (ระบบจะอ่าน Email จาก Token)
 *     tags: [Carts]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: สร้างตะกร้าสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cartOK:
 *                   type: boolean
 *                   example: true
 *                 messageAddCart:
 *                   type: integer
 *                   description: รหัสตะกร้า (Cart ID) ที่ได้
 *                   example: 1
 */
router.post("/carts/addcart", authenticateToken, cartC.postCart);

/**
 * @swagger
 * /carts/addcartdtl:
 *   post:
 *     summary: เพิ่มสินค้าลงในตะกร้า (ตรวจสอบสต็อกอัตโนมัติ)
 *     tags: [Carts]
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
 *                 example: 1
 *               pdId:
 *                 type: integer
 *                 example: 2
 *               pdPrice:
 *                 type: number
 *                 example: 60
 *     responses:
 *       200:
 *         description: ผลการเพิ่มสินค้าลงตะกร้า
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cartDtlOK:
 *                   type: boolean
 *                   example: true
 *                 messageAddCart:
 *                   type: integer
 *                   example: 1
 */
router.post("/carts/addcartdtl", authenticateToken, cartC.postCartDtl);

/**
 * @swagger
 * /carts/chkcart:
 *   post:
 *     summary: เช็คว่า User คนนี้มีตะกร้าที่สถานะยัง "active" อยู่หรือไม่
 *     tags: [Carts]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: ผลการตรวจสอบตะกร้า
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cartExist:
 *                   type: boolean
 *                   example: true
 *                 cartId:
 *                   type: integer
 *                   example: 1
 */
router.post("/carts/chkcart", authenticateToken, cartC.chkCart);

/**
 * @swagger
 * /carts/sumcart/{id}:
 *   get:
 *     summary: ดูจำนวนชิ้นรวมและราคารวมของตะกร้า
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: รหัสตะกร้า (Cart ID)
 *     responses:
 *       200:
 *         description: ยอดรวมของตะกร้า
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "1"
 *                 qty:
 *                   type: integer
 *                   example: 2
 *                 money:
 *                   type: number
 *                   example: 120
 */
router.get("/carts/sumcart/:id", cartC.sumCart);

/**
 * @swagger
 * /carts/getcart/{id}:
 *   get:
 *     summary: ดึงข้อมูลหัวตะกร้าสินค้า (รวมยอดทั้งหมด)
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: รหัสตะกร้า (Cart ID)
 *     responses:
 *       200:
 *         description: ข้อมูลตะกร้า 1 รายการ
 */
router.get("/carts/getcart/:id", cartC.getCart);

/**
 * @swagger
 * /carts/getcartdtl/{id}:
 *   get:
 *     summary: ดูรายละเอียดสินค้าทุกชิ้นที่อยู่ในตะกร้านี้
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: รหัสตะกร้า (Cart ID)
 *     responses:
 *       200:
 *         description: รายการสินค้าในตะกร้า (Array)
 */
router.get("/carts/getcartdtl/:id", cartC.getCartDtl);

/**
 * @swagger
 * /carts/getcartbycus:
 *   post:
 *     summary: ค้นหาประวัติตะกร้าทั้งหมดของลูกค้าด้วย Email
 *     tags: [Carts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "tanza007gmail.com"
 *     responses:
 *       200:
 *         description: รายการตะกร้าทั้งหมดของลูกค้ารายนี้
 */
router.post("/carts/getcartbycus", cartC.getCartByCus);

router.put("/carts/cartdtl/:cart_id", authenticateToken, cartC.updateCartDtlQty);


export default router;