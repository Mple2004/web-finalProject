import express from "express";
import { checkout, getOrderHistory, getOrderDetail } from "../controller/transactionController.js";

const router = express.Router();

router.post("/transaction/checkout", checkout);
router.post("/transaction/history", getOrderHistory);

router.get("/transaction/detail/:cart_id", getOrderDetail);

export default router;