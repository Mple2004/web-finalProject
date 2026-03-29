import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";

// 1. นำเข้าไลบรารี Swagger
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";

// นำเข้า Route ต่างๆ ของคุณ
import productRoute from "./router/productRoute.js";
import memberRoute from "./router/memberRoute.js";
import transactionRoute from "./router/transactionRoute.js";
import cartRoute from "./router/cartRoute.js";
import wishlistRoute from "./router/wishlistRoute.js";
import adminRoute from "./router/adminRoute.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5500; // แนะนำให้ใส่ fallback port ไว้เผื่อไฟล์ .env มีปัญหา

// 2. ตั้งค่า Configuration สำหรับ Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SpiritSelect E-Commerce API",
      version: "1.0.0",
      description: "API Documentation สำหรับระบบ E-Commerce (Node.js + Express + PostgreSQL)",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: "Local Development Server",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token", // ชื่อ Cookie ที่เราใช้เก็บ Token
          description: "ใส่ Token ที่ได้จากการ Login ลงใน Cookie",
        },
      },
    },
    security: [
      {
        cookieAuth: [],
      },
    ],
  },
  // 3. บอกให้ Swagger ไปสแกนหาคอมเมนต์ @swagger ที่ไฟล์ในโฟลเดอร์ router ทั้งหมด
  apis: ["./router/*.js"], 
};

// สร้างตัวแปรเก็บเอกสาร Swagger ที่ถูกแปลงแล้ว
const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:8081"], //Domain ของ Frontend
    methods: ["GET", "POST", "PUT", "DELETE"], //Method ที่อนุญาต
    credentials: true, //ให้ส่งข้อมูล Header+Cookie ได้
  }),
);
app.use(cookieParser());
app.use(bodyParser.json());

// 4. สร้างเส้นทางสำหรับดูหน้า Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ใช้งาน Route ต่างๆ
app.use(productRoute);
app.use(memberRoute);
app.use(cartRoute);
app.use(transactionRoute);
app.use(wishlistRoute);
app.use(adminRoute);

app.get("/", (req, res) => {
  res.json({ info: "Hello World", message: "Ok" });
});

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
  console.log(`Swagger API Docs available at http://localhost:${port}/api-docs`);
});