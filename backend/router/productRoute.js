import express from "express";

import {
  getAllProducts,
  getProductById,
  postProduct,
  putProduct,
  deleteProduct,
  getProductByBrandId,
  getThreeProducts,
  getSearchProduct,
  getFilteredProducts,
  getProductByCategory,
  getProductBySubCategory,
  getProductByCountry,
  getProductByPriceRange,
  getProductRankings,
  uploadProduct,
} from "../controller/ProductController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: ระบบจัดการสินค้า
 */

/**
 * @swagger
 * /products/search/{id}:
 *   get:
 *     summary: ค้นหาสินค้าตามคำค้นหา
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: คำค้นหาสินค้า (ชื่อ หรือ คีย์เวิร์ด)
 *         example: "wine"
 *     responses:
 *       200:
 *         description: รายการสินค้าที่ตรงกับคำค้นหา (Array)
 */
router.get("/products/rankings", getProductRankings);
router.get("/products/search/:id", getSearchProduct);
router.get("/products/filter", getFilteredProducts);

/**
 * @swagger
 * /products/three:
 *   get:
 *     summary: ดึงสินค้าแนะนำ 3 รายการ
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: รายการสินค้าแนะนำ 3 ชิ้น
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Red Wine"
 *                   price:
 *                     type: number
 *                     example: 599
 */
router.get("/products/three", getThreeProducts);

/**
 * @swagger
 * /products/category/{category}:
 *   get:
 *     summary: ดึงสินค้าตามหมวดหมู่หลัก (Category)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: category
 *         schema:
 *           type: string
 *         required: true
 *         description: ชื่อหมวดหมู่หลัก
 *         example: "Wine"
 *     responses:
 *       200:
 *         description: รายการสินค้าในหมวดหมู่นี้ (Array)
 */
router.get("/products/category/:category", getProductByCategory);

/**
 * @swagger
 * /products/subcategory/{subcategory}:
 *   get:
 *     summary: ดึงสินค้าตามหมวดหมู่ย่อย (Sub-Category)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: subcategory
 *         schema:
 *           type: string
 *         required: true
 *         description: ชื่อหมวดหมู่ย่อย
 *         example: "Red Wine"
 *     responses:
 *       200:
 *         description: รายการสินค้าในหมวดหมู่ย่อยนี้ (Array)
 */
router.get("/products/subcategory/:subcategory", getProductBySubCategory);

/**
 * @swagger
 * /products/country/{country}:
 *   get:
 *     summary: ดึงสินค้าตามประเทศผู้ผลิต
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: country
 *         schema:
 *           type: string
 *         required: true
 *         description: ชื่อประเทศผู้ผลิต
 *         example: "France"
 *     responses:
 *       200:
 *         description: รายการสินค้าจากประเทศนี้ (Array)
 */
router.get("/products/country/:country", getProductByCountry);

/**
 * @swagger
 * /products/price:
 *   get:
 *     summary: ดึงสินค้าตามช่วงราคา (เรียงจากน้อยไปมาก)
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: min
 *         schema:
 *           type: number
 *         required: true
 *         description: ราคาต่ำสุด
 *         example: 100
 *       - in: query
 *         name: max
 *         schema:
 *           type: number
 *         required: true
 *         description: ราคาสูงสุด
 *         example: 1000
 *     responses:
 *       200:
 *         description: รายการสินค้าในช่วงราคาที่กำหนด (Array)
 */
router.get("/products/price", getProductByPriceRange);

/**
 * @swagger
 * /products:
 *   get:
 *     summary: ดึงสินค้าทั้งหมด
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: รายการสินค้าทั้งหมด (Array)
 */
router.get("/products", getAllProducts);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: เพิ่มสินค้าใหม่
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Red Wine"
 *               price:
 *                 type: number
 *                 example: 599
 *               category:
 *                 type: string
 *                 example: "Wine"
 *               subcategory:
 *                 type: string
 *                 example: "Red Wine"
 *               country:
 *                 type: string
 *                 example: "France"
 *               brand_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: เพิ่มสินค้าสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 productOK:
 *                   type: boolean
 *                   example: true
 */
router.post("/products", uploadProduct, postProduct);

/**
 * @swagger
 * /products/brands/{id}:
 *   get:
 *     summary: ดึงสินค้าตาม Brand ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: รหัสแบรนด์ (Brand ID)
 *         example: 1
 *     responses:
 *       200:
 *         description: รายการสินค้าของแบรนด์นี้ (Array)
 */
router.get("/products/brands/:id", getProductByBrandId);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: ดึงข้อมูลสินค้าตาม ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: รหัสสินค้า (Product ID)
 *         example: 1
 *     responses:
 *       200:
 *         description: ข้อมูลสินค้า 1 รายการ
 *       404:
 *         description: ไม่พบสินค้า
 */
router.get("/products/:id", getProductById);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: แก้ไขข้อมูลสินค้าตาม ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: รหัสสินค้า (Product ID)
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Red Wine Updated"
 *               price:
 *                 type: number
 *                 example: 699
 *               category:
 *                 type: string
 *                 example: "Wine"
 *               subcategory:
 *                 type: string
 *                 example: "Red Wine"
 *               country:
 *                 type: string
 *                 example: "Italy"
 *               brand_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: แก้ไขสินค้าสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 updateOK:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: ไม่พบสินค้า
 */
router.put("/products/:id", uploadProduct, putProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: ลบสินค้าตาม ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: รหัสสินค้า (Product ID)
 *         example: 1
 *     responses:
 *       200:
 *         description: ลบสินค้าสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deleteOK:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: ไม่พบสินค้า
 */
router.delete("/products/:id", deleteProduct);

export default router;