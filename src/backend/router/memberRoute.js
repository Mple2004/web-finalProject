import express from "express";

import {
  postMember,
  loginMember,
  getMember,
  logoutMember,
  uploadMember,
  updateToAdmin,
} from "../controller/memberController.js";

const router = express.Router();
router.get("/members/detail", getMember);
router.post("/members/logout", logoutMember);
router.post("/members", postMember);
router.post("/members/login", loginMember);
router.post("/members/uploadimg", uploadMember);
router.put("/set-admin", updateToAdmin);

export default router;
