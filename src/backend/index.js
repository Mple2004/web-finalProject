import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import productRoute from "./router/productRoute.js";
import memberRoute from "./router/memberRoute.js";
import transactionRoute from "./router/transactionRoute.js";
import cartRoute from "./router/cartRoute.js";
import cookieParser from "cookie-parser";


// import swaggerUI from "swagger-ui-express";
// import yaml from "yaml";
// ใช้ File
// import fs from "fs";

dotenv.config();

const app = express();
const port = process.env.PORT;
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:8081"], //Domain ของ Frontend
    methods: ["GET", "POST", "PUT", "DELETE"], //Method ที่อนุญาต
    credentials: true, //ให้ส่งข้อมูล Header+Cookie ได้
  }),
);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(productRoute);
app.use(memberRoute);
app.use(cartRoute);
app.use(transactionRoute);

// swagger กำหนด file config ของตัว swagger
// const swaggerfile = fs.readFileSync("services/swagger.yaml", "utf-8");
// const swaggerDoc = yaml.parse(swaggerfile);
// กำหนด path ที่จะให้เรียกหน้า Document ขึ้นมา
// app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDoc));

// app.use("/img_pd", express.static("img_pd"));
// app.use("/img_mem", express.static("img_mem"));

app.get("/", (req, res) => {
  res.json({ info: "Hello World", message: "Ok" });
});

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
