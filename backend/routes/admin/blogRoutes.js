import express from "express";
import multer from "multer";
import { protect } from "../../middlewares/authMiddleware.js";
import {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleBlogStatus,
  toggleFeatured,
  bulkDeleteBlogs,
  bulkUpdateStatus,
  uploadImage
} from "../../controllers/admin/blogController.js";

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
  }
});

router.use(protect);

router.post("/upload-image", upload.single("image"), uploadImage);
router.post("/bulk-delete", bulkDeleteBlogs);
router.post("/bulk-status", bulkUpdateStatus);

router.route("/")
  .get(getBlogs)
  .post(createBlog);

router.route("/:id")
  .get(getBlog)
  .put(updateBlog)
  .delete(deleteBlog);

router.patch("/:id/status", toggleBlogStatus);
router.patch("/:id/featured", toggleFeatured);

export default router;