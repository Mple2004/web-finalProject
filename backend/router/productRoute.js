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
  // นำเข้า 2 ฟังก์ชันใหม่
  getProductByCategory,
  getProductBySubCategory,
  getProductByCountry,
  getProductByPriceRange
} from "../controller/ProductController.js";

const router = express.Router();

router.get("/products/search/:id", getSearchProduct);
router.get("/products/three", getThreeProducts);

// 2 เส้นทางนี้เอาไว้เรียกดูตามหมวดหมู่
router.get("/products/category/:category", getProductByCategory);
router.get("/products/subcategory/:subcategory", getProductBySubCategory);
router.get("/products/country/:country", getProductByCountry);
router.get("/products/price", getProductByPriceRange); //sort ตามช่วงราคา โดยรับ min และ max ผ่าน Query String (?min=xxx&max=yyy)
router.get("/products", getAllProducts);
router.post("/products", postProduct); 
router.get("/products/brands/:id", getProductByBrandId);
router.get("/products/:id", getProductById);
router.put("/products/:id", putProduct);
router.delete("/products/:id", deleteProduct);

export default router;