import express from "express";
import {
  postMember,
  loginMember,
  getMember,
  logoutMember,
  uploadMember,
  updateToAdmin,
} from "../controller/memberController.js";
import {authenticateToken} from "../middleware/auth.js";

const router = express.Router();

router.post("/members", postMember);
router.post("/members/login", loginMember);

// แก้: เพิ่ม /members/detail สำหรับ api.js ที่เรียก GET /members/detail
// (getMember อ่านจาก cookie token อยู่แล้ว ไม่ต้องเปลี่ยน logic)
router.get("/members/detail", getMember);
router.get("/members", getMember); // เก็บ route เดิมไว้ด้วย

router.post("/members/logout", logoutMember);
router.post("/members/upload", authenticateToken, uploadMember);
router.put("/member/set-admin", authenticateToken, updateToAdmin);

export default router;

// import express from "express";

// import {
//   postMember,
//   loginMember,
//   getMember,
//   logoutMember,
//   uploadMember,
//   updateToAdmin,
// } from "../controller/memberController.js";

// const router = express.Router();
// router.get("/members/detail", getMember);
// router.post("/members/logout", logoutMember);
// router.post("/members", postMember);
// router.post("/members/login", loginMember);
// router.post("/members/uploadimg", uploadMember);
// router.put("/set-admin", updateToAdmin);

// export default router;
