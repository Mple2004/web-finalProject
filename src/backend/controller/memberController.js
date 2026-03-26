import database from "../services/database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";

// upload part
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "img_mem");
  },
  filename: function (req, file, cb) {
    // Changed memEmail to email to match the new convention
    const filename = `${req.body.email}.jpg`; 
    cb(null, filename);
  },
});

const upload = multer({
  storage: storage,
}).single("file");

export const postMember = async (req, res) => {
  console.log("POST /member is requested");

  const bodyData = req.body;
  try {
    // Changed memEmail and memName to email and name
    if (!bodyData.email || !bodyData.name) {
      return res.json({
        message: "ERROR email and name is required.",
        regist: false,
      });
    }

    // Updated DB column to "email"
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

    const pwd = bodyData.password;
    const saltround = await bcrypt.genSalt(11);
    const pwdHash = await bcrypt.hash(pwd, saltround);

    // Updated DB columns to match your schema image
    const result = await database.query({
      text: `INSERT INTO "user" ("email", "name", "password" , "status") VALUES ($1, $2, $3, $4)`,
      values: [bodyData.email, bodyData.name, pwdHash, "member"],
    });

    bodyData.createDate = new Date();
    bodyData.message = "Regist Success";
    bodyData.regist = true;

    res.status(201).json(bodyData);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message, regist: false });
  }
};

export const loginMember = async (req, res) => {
  console.log("POST /members/login is requested");

  const bodyData = req.body;
  try {
    if (!bodyData.loginName || !bodyData.password) {
      return res.json({ message: "ERROR email and password are required." });
    }

// แก้จาก FROM user เป็น FROM "user"
const result = await database.query({
  text: `SELECT * FROM "user" WHERE email = $1`, 
  values: [bodyData.loginName],
});

    if (result.rowCount == 0) {
      return res.json({ message: "Login Fail", login: false });
    }

    // Updated to check against the "password" column
    const login = await bcrypt.compare(
      bodyData.password,
      result.rows[0].password, 
    );

    if (login) {
      // Updated token payload to match schema columns
      const theuser = {
        email: result.rows[0].email,
        name: result.rows[0].name,
        status: result.rows[0].status, // Replaced dutyId with status
      };
      
      const secret_key = process.env.SECRET_KEY;
      const token = jwt.sign(theuser, secret_key, { expiresIn: "1h" }); 
      
      res.cookie("token", token, {
        maxAge: 3600000, 
        httpOnly: true, 
        secure: true,
        sameSite: "strict", 
      });
      res.json({ message: `Login Success`, login: true });
    } else {
      return res.json({ message: "Login Fail", login: false });
    }
  } catch (error) {
    console.log(error.message);
    res.clearCookie("token", {
      maxAge: 3600000,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    res.status(500).json({ message: error.message });
  }
};

export const getMember = async (req, res) => {
  console.log("GET /members is requested");
  const token = req.cookies.token;
  
  if (!token) {
    return res.json({ message: `No Member`, login: false });
  }

  try {
    const secret_key = process.env.SECRET_KEY; 
    const member = jwt.verify(token, secret_key);
    console.log(member);
    
    // Updated to return the new property names
    return res.json({
      email: member.email,
      name: member.name,
      status: member.status, // Replaced dutyId with status
      login: true,
    });
  } catch (error) {
    console.log(error.message);
    res.status(401).json({ message: "The information was falsified.", login: false }); // Changed to 401 Unauthorized instead of 500
  }
};

export const logoutMember = async (req, res) => {
  console.log("POST /logoutMember is requested");
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    res.json({ message: "Logout Success", login: false });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export async function uploadMember(req, res) {
  console.log("Upload Member Image");
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    res.status(200).json({ message: "File uploaded successfully!" });
  });
}

// ฟังก์ชันสำหรับเปลี่ยนสถานะผู้ใช้เป็น admin
export const updateToAdmin = async (req, res) => {
  console.log("PUT /member/set-admin is requested");
  
  // รับ email จาก body หรือ params ก็ได้ ในที่นี้ขอใช้ email จาก body ครับ
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    // ทำการ update status ในตาราง user
    const result = await database.query({
      text: `UPDATE "user" SET "status" = $1 WHERE "email" = $2`,
      values: ["admin", email],
    });

    // ตรวจสอบว่ามีการ update เกิดขึ้นจริงไหม (email มีในระบบหรือไม่)
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ 
      message: `Update ${email} to admin success.`, 
      updated: true 
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};