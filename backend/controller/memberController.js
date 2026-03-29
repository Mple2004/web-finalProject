import database from "../services/database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import { renameSync, existsSync } from "fs";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "img_mem");
  },
  filename: function (req, file, cb) {
    const filename = `${req.body.email}.jpg`;
    cb(null, filename);
  },
});

const upload = multer({ storage }).single("file");

export const postMember = async (req, res) => {
  console.log("POST /member is requested");
  const bodyData = req.body;
  try {
    if (!bodyData.email || !bodyData.name) {
      return res.json({ message: "ERROR email and name is required.", regist: false });
    }

    const chkRow = await database.query({
      text: `SELECT * FROM "user" WHERE "email" = $1`,
      values: [bodyData.email],
    });

    if (chkRow.rowCount != 0) {
      return res.json({
        message: `ERROR email ${bodyData.email} already exists.`,
        regist: false,
      });
    }

    const saltround = await bcrypt.genSalt(11);
    const pwdHash = await bcrypt.hash(bodyData.password, saltround);

    await database.query({
      text: `INSERT INTO "user" ("email", "name", "password", "status") VALUES ($1, $2, $3, $4)`,
      values: [bodyData.email, bodyData.name, pwdHash, "member"],
    });

    res.status(201).json({
      email: bodyData.email,
      name: bodyData.name,
      message: "Regist Success",
      regist: true,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message, regist: false });
  }
};

export const loginMember = async (req, res) => {
  console.log("POST /members/login is requested");
  const bodyData = req.body;
  try {
    // แก้: รองรับทั้ง loginName และ email (api.js เก่าส่ง loginName, ใหม่ส่ง email)
    const loginIdentifier = bodyData.loginName || bodyData.email;

    if (!loginIdentifier || !bodyData.password) {
      return res.json({ message: "ERROR email and password are required." });
    }

    const result = await database.query({
      text: `SELECT * FROM "user" WHERE email = $1`,
      values: [loginIdentifier],
    });

    if (result.rowCount == 0) {
      return res.json({ message: "Login Fail", login: false });
    }

    const login = await bcrypt.compare(bodyData.password, result.rows[0].password);

    if (login) {
      const theuser = {
        email: result.rows[0].email,
        name: result.rows[0].name,
        status: result.rows[0].status,
      };

      const secret_key = process.env.SECRET_KEY;
      const token = jwt.sign(theuser, secret_key, { expiresIn: "1h" });

      res.cookie("token", token, {
        maxAge: 3600000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // แก้: ใช้ false ใน dev เพื่อให้ cookie ส่งผ่าน HTTP ได้
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      });
      res.json({ message: "Login Success", login: true, token: token });
    } else {
      return res.json({ message: "Login Fail", login: false });
    }
  } catch (error) {
    console.log(error.message);
    res.clearCookie("token");
    res.status(500).json({ message: error.message });
  }
};

export const getMember = async (req, res) => {
  console.log("GET /members/detail is requested");
  const token = req.cookies.token;

  if (!token) {
    return res.json({ message: "No Member", login: false });
  }

  try {
    const secret_key = process.env.SECRET_KEY;
    const member = jwt.verify(token, secret_key);
    return res.json({
      email: member.email,
      name: member.name,
      status: member.status,
      login: true,
    });
  } catch (error) {
    console.log(error.message);
    res.status(401).json({ message: "Token invalid.", login: false });
  }
};

export const logoutMember = async (req, res) => {
  console.log("POST /logoutMember is requested");
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });
    res.json({ message: "Logout Success", login: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export async function uploadMember(req, res) {
  upload(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    res.status(200).json({ message: "File uploaded successfully!" });
  });
}

export const updateToAdmin = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) return res.status(400).json({ message: "Email is required." });

    const result = await database.query({
      text: `UPDATE "user" SET "status" = $1 WHERE "email" = $2`,
      values: ["admin", email],
    });

    if (result.rowCount === 0) return res.status(404).json({ message: "User not found." });

    res.status(200).json({ message: `Update ${email} to admin success.`, updated: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllMembers = async (req, res) => {
  try {
    const result = await database.query({
      text: `SELECT email, name, status FROM "user" ORDER BY email ASC`,
    });
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMember = async (req, res) => {
  const { email } = req.params;
  try {
    if (req.user.email === email) {
      return res.status(400).json({ message: "ไม่สามารถลบบัญชีของตัวเองได้" });
    }
    const result = await database.query({
      text: `DELETE FROM "user" WHERE email = $1`,
      values: [email],
    });
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้นี้" });
    }
    res.status(200).json({ message: "ลบสมาชิกสำเร็จ", deleted: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMember = async (req, res) => {
  const { email } = req.params;
  const { name, status } = req.body;
  try {
    // Check current status before updating
    const check = await database.query({
      text: `SELECT status FROM "user" WHERE email = $1`,
      values: [email],
    });
    if (check.rowCount === 0) return res.status(404).json({ message: "ไม่พบผู้ใช้นี้" });

    // Block demoting an admin to member
    if (check.rows[0].status === 'admin' && status && status !== 'admin') {
      return res.status(403).json({ message: "ไม่สามารถเปลี่ยน status ของ admin เป็น member ได้" });
    }

    const setClauses = [];
    const values = [];
    let idx = 1;
    if (name !== undefined)   { setClauses.push(`"name" = $${idx++}`);   values.push(name); }
    if (status !== undefined) { setClauses.push(`"status" = $${idx++}`); values.push(status); }

    if (setClauses.length === 0) return res.status(400).json({ message: "ไม่มีข้อมูลที่ต้องอัปเดต" });

    values.push(email);
    const result = await database.query({
      text: `UPDATE "user" SET ${setClauses.join(', ')} WHERE email = $${idx} RETURNING email, name, status`,
      values,
    });
    res.status(200).json({ message: "อัปเดตสมาชิกสำเร็จ", updated: true, member: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMemberWithFile = async (req, res) => {
  upload(req, res, async (err) => {
    const { email } = req.params;
    const { email: newEmail, name, status, password, newPassword, currentPassword } = req.body;

    try {
      if (err) return res.status(400).json({ message: err.message });

      // Check user exists + get hashed password for verification
      const check = await database.query({
        text: `SELECT status, password AS hashed_pwd FROM "user" WHERE email = $1`,
        values: [email],
      });
      if (check.rowCount === 0) return res.status(404).json({ message: "ไม่พบผู้ใช้นี้" });

      // Regular users can only edit their own account
      if (req.user.status !== 'admin' && req.user.email !== email) {
        return res.status(403).json({ message: "ไม่มีสิทธิ์แก้ไขข้อมูลผู้ใช้อื่น" });
      }

      // Block demoting an admin to member
      if (check.rows[0].status === 'admin' && status && status !== 'admin') {
        return res.status(403).json({ message: "ไม่สามารถเปลี่ยน status ของ admin เป็น member ได้" });
      }

      // Check new email not taken
      if (newEmail && newEmail !== email) {
        const emailCheck = await database.query({
          text: `SELECT email FROM "user" WHERE email = $1`,
          values: [newEmail],
        });
        if (emailCheck.rowCount > 0) return res.status(400).json({ message: "อีเมลนี้มีผู้ใช้งานแล้ว" });
      }

      const setClauses = [];
      const values = [];
      let idx = 1;

      if (newEmail && newEmail !== email) { setClauses.push(`"email" = $${idx++}`); values.push(newEmail); }
      if (name !== undefined)             { setClauses.push(`"name" = $${idx++}`);  values.push(name); }
      if (status !== undefined)           { setClauses.push(`"status" = $${idx++}`); values.push(status); }

      // Admin direct password change (no current-password check needed)
      if (password && password !== '') {
        const pwdHash = await bcrypt.hash(password, await bcrypt.genSalt(11));
        setClauses.push(`"password" = $${idx++}`); values.push(pwdHash);
      }

      // User self-edit: verify currentPassword before setting newPassword
      if (newPassword && newPassword !== '') {
        if (currentPassword) {
          const isMatch = await bcrypt.compare(currentPassword, check.rows[0].hashed_pwd);
          if (!isMatch) return res.status(400).json({ message: "รหัสผ่านปัจจุบันไม่ถูกต้อง" });
        }
        const pwdHash = await bcrypt.hash(newPassword, await bcrypt.genSalt(11));
        setClauses.push(`"password" = $${idx++}`); values.push(pwdHash);
      }

      // Photo-only update: no text fields changed but file was uploaded — still success
      if (setClauses.length === 0) {
        return res.status(200).json({ message: "อัปเดตสมาชิกสำเร็จ", updated: true, member: { email, name: undefined, status: check.rows[0].status } });
      }

      values.push(email);
      const result = await database.query({
        text: `UPDATE "user" SET ${setClauses.join(', ')} WHERE email = $${idx} RETURNING email, name, status`,
        values,
      });

      // Rename photo file when email changes
      if (newEmail && newEmail !== email) {
        try {
          if (existsSync(`img_mem/${email}.jpg`)) renameSync(`img_mem/${email}.jpg`, `img_mem/${newEmail}.jpg`);
        } catch { /* ignore */ }
      }

      // Re-issue JWT if user edited their own account (so refresh shows new data)
      if (req.user.email === email) {
        const updated = result.rows[0];
        const newToken = jwt.sign(
          { email: updated.email, name: updated.name, status: updated.status },
          process.env.SECRET_KEY,
          { expiresIn: "1h" }
        );
        res.cookie("token", newToken, {
          maxAge: 3600000,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        });
      }

      res.status(200).json({ message: "อัปเดตสมาชิกสำเร็จ", updated: true, member: result.rows[0] });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: error.message });
    }
  });
};