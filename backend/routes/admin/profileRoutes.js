import express from "express";
import multer from "multer";
import { protect } from "../../middlewares/authMiddleware.js";
import {
  getProfile,
  upsertProfile,
  uploadProfileImage,
} from "../../controllers/admin/profileController.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
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
  "/upload-image",
  (req, res, next) => {
    upload.single("image")(req, res, (error) => {
      if (!error) return next();

      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File too large. Maximum size is 5MB.",
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message || "Failed to process upload",
      });
    });
  },
  uploadProfileImage
);
router.route("/").get(getProfile).put(upsertProfile);

export default router;
