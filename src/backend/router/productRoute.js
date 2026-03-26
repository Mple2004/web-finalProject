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
  // 1. นำเข้า 2 ฟังก์ชันใหม่ที่เราเพิ่งสร้าง
  getProductByCategory,
  getProductBySubCategory 
} from "../controller/ProductController.js";

const router = express.Router();

router.get("/products/search/:id", getSearchProduct);
router.get("/products/three", getThreeProducts);

// 2. เพิ่ม 2 เส้นทางนี้เข้าไป เพื่อให้เรียกดูตามหมวดหมู่ได้
router.get("/products/category/:category", getProductByCategory);
router.get("/products/subcategory/:subcategory", getProductBySubCategory);

router.get("/products", getAllProducts);
router.post("/products", postProduct);
router.get("/products/brands/:id", getProductByBrandId);
router.get("/products/:id", getProductById);
router.put("/products/:id", putProduct);
router.delete("/products/:id", deleteProduct);

export default router;