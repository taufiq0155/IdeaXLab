import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import adminAuthRoutes from "./routes/admin/authRoutes.js";

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// Only auth routes
app.use("/api/admin/auth", adminAuthRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "Auth API is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Auth Server running on port ${PORT}`));