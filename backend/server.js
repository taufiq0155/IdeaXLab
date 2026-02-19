import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import adminAuthRoutes from "./routes/admin/authRoutes.js";
import adminContactRoutes from "./routes/admin/contactRoutes.js";
import blogCategoryRoutes from "./routes/admin/blogCategoryRoutes.js";
import blogRoutes from "./routes/admin/blogRoutes.js";

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// Only auth routes
app.use("/api/admin/auth", adminAuthRoutes);

app.use("/api/contacts", adminContactRoutes);
app.use("/api/admin/blog-categories", blogCategoryRoutes);
app.use("/api/admin/blogs", blogRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Auth Server running on port ${PORT}`));