import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import productsRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupen.route.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();

dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "10mb" })); //helps to parse the body of the request
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // Change this to match your frontend URL
    credentials: true, // Allow cookies
  })
);
app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.listen(PORT, () => {
  console.log("Server is running on port 5000");
  connectDB();
});
