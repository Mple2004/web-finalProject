import express from "express";
import { checkout, getOrderHistory, getOrderDetail } from "../controller/transactionController.js";
import { authenticateToken } from "../middleware/auth.js"; //

const router = express.Router();

// 1. การชำระเงิน (Checkout) ควรใช้ POST และดัก Token เพื่อรู้ว่าใครจ่าย
router.post("/transaction/checkout", authenticateToken, checkout); //

// 2. การดูประวัติ (History) แนะนำให้ใช้ GET และดัก Token 
// (เพราะเราแก้ Controller ให้ดึง email จาก Token แล้ว)
router.get("/transaction/history", authenticateToken, getOrderHistory); //

// 3. ดูรายละเอียดเชิงลึกของแต่ละ Order
router.get("/transaction/detail/:cart_id", authenticateToken, getOrderDetail); //

export default router;