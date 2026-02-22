import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import adminAuthRoutes from "./routes/admin/authRoutes.js";
import adminContactRoutes from "./routes/admin/contactRoutes.js";
import blogCategoryRoutes from "./routes/admin/blogCategoryRoutes.js";
import blogRoutes from "./routes/admin/blogRoutes.js";
import profileRoutes from "./routes/admin/profileRoutes.js";
import serviceRoutes from "./routes/admin/serviceRoutes.js";
import employeeRoutes from "./routes/admin/employeeRoutes.js";
import projectRoutes from "./routes/admin/projectRoutes.js";
import innovationRoutes from "./routes/admin/innovationRoutes.js";
import researchRoutes from "./routes/admin/researchRoutes.js";
import publicRoutes from "./routes/public/publicRoutes.js";

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// Only auth routes
app.use("/api/admin/auth", adminAuthRoutes);

app.use("/api/contacts", adminContactRoutes);
app.use("/api/admin/blog-categories", blogCategoryRoutes);
app.use("/api/admin/blogs", blogRoutes);
app.use("/api/admin/profile", profileRoutes);
app.use("/api/admin/services", serviceRoutes);
app.use("/api/admin/employees", employeeRoutes);
app.use("/api/admin/projects", projectRoutes);
app.use("/api/admin/innovations", innovationRoutes);
app.use("/api/admin/research", researchRoutes);
app.use("/api/public", publicRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Auth Server running on port ${PORT}`));
