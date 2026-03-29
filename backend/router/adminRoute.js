import express from "express";
import { 
  getDashboardStats, 
  getAllOrders, 
  updateOrderStatus, 
  getAllMembers, 
  deleteMember 
} from "../controller/adminController.js";
import { authenticateToken } from "../middleware/auth.js"; 

const router = express.Router();

// ใช้ authenticateToken กั้นด่านแรกก่อน แล้วใน Controller จะมีฟังก์ชันเช็คสิทธิ์ Admin กั้นอีกชั้นครับ
router.get("/admin/dashboard", authenticateToken, getDashboardStats);

router.get("/admin/orders", authenticateToken, getAllOrders);
router.put("/admin/orders/status", authenticateToken, updateOrderStatus);

router.get("/admin/members", authenticateToken, getAllMembers);
router.delete("/admin/members/:email", authenticateToken, deleteMember);

export default router;