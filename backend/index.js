import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import productRoute from "./router/productRoute.js";
import memberRoute from "./router/memberRoute.js";
import transactionRoute from "./router/transactionRoute.js";
import cartRoute from "./router/cartRoute.js";
import cookieParser from "cookie-parser";

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

app.get("/", (req, res) => {
  res.json({ info: "Hello World", message: "Ok" });
});

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});