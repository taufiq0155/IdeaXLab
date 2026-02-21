import express from "express";
import multer from "multer";
import {
  createPublicServiceRequest,
  getPublicBlogCategories,
  getPublicBlogs,
  getPublicProjects,
  getPublicTeam,
  uploadPublicServiceDocuments,
} from "../../controllers/public/publicController.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024,
    files: 20,
  },
});

router.get("/blogs", getPublicBlogs);
router.get("/blog-categories", getPublicBlogCategories);
router.get("/team", getPublicTeam);
router.get("/projects", getPublicProjects);
router.post(
  "/services/upload-documents",
  (req, res, next) => {
    upload.array("documents", 20)(req, res, (error) => {
      if (!error) return next();
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File too large. Maximum size is 15MB per file.",
        });
      }
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to process uploaded files",
      });
    });
  },
  uploadPublicServiceDocuments
);
router.post("/services/request", createPublicServiceRequest);

export default router;
