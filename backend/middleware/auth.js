import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  const token = req.cookies.token; // ดึงจาก Cookie

  if (!token) return res.status(401).json({ message: "กรุณาเข้าสู่ระบบ" });

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Token ไม่ถูกต้อง" });
    
    // สำคัญ: เก็บข้อมูล user ไว้ใน req เพื่อให้ controller เรียกใช้ได้
    req.user = user; 
    next();
  });
};