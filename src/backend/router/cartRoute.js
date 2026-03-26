import express from "express";
import * as cartC from "../controller/cartController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/carts/addcart", authenticateToken, cartC.postCart);
router.post("/carts/addcartdtl", authenticateToken, cartC.postCartDtl);
router.post("/carts/chkcart", authenticateToken, cartC.chkCart); // เพิ่มด่านตรวจ
router.get("/carts/sumcart/:id", cartC.sumCart);
router.get("/carts/getcart/:id", cartC.getCart);
router.get("/carts/getcartdtl/:id", cartC.getCartDtl);
router.post("/carts/getcartbycus", cartC.getCartByCus);


export default router;
