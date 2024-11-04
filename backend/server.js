import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import { connectDB } from "./lib/db.js";
const app = express();

dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(express.json()); //helps to parse the body of the request
app.use("/api/auth", authRoutes);
app.listen(PORT, () => {
  console.log("Server is running on port 5000");
  connectDB();
});