import express from "express";
import multer from "multer";
import { protect } from "../../middlewares/authMiddleware.js";
import {
  createProject,
  deleteProject,
  getProject,
  getProjects,
  updateProject,
  uploadProjectImages,
} from "../../controllers/admin/projectController.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 12 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

router.use(protect);

router.post(
  "/upload-images",
  (req, res, next) => {
    upload.array("images", 12)(req, res, (error) => {
      if (!error) return next();

      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File too large. Maximum size is 5MB per image.",
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message || "Failed to process upload",
      });
    });
  },
  uploadProjectImages
);

router.route("/").get(getProjects).post(createProject);
router.route("/:id").get(getProject).put(updateProject).delete(deleteProject);

export default router;
