import database from "../services/database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";

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

      res.json({ message: "Login Success", login: true, token: token, user: theuser });
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