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
} from "../controller/ProductController.js";

const router = express.Router();
router.get("/products/search/:id", getSearchProduct);
router.get("/products/three", getThreeProducts);
router.get("/products", getAllProducts);
router.post("/products", postProduct);
router.get("/products/brands/:id", getProductByBrandId);
router.get("/products/:id", getProductById);
router.put("/products/:id", putProduct);
router.delete("/products/:id", deleteProduct);

export default router;
