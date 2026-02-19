import express from "express";
import { protect } from "../../middlewares/authMiddleware.js";
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus
} from "../../controllers/admin/blogCategoryController.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/")
  .get(getCategories)
  .post(createCategory);

router.route("/:id")
  .get(getCategory)
  .put(updateCategory)
  .delete(deleteCategory);

router.patch("/:id/toggle", toggleCategoryStatus);

export default router;