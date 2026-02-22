import express from "express";
import { protect } from "../../middlewares/authMiddleware.js";
import {
  createNews,
  deleteNewsItem,
  getNewsItem,
  getNewsItems,
  updateNewsItem,
} from "../../controllers/admin/newsController.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getNewsItems).post(createNews);
router.route("/:id").get(getNewsItem).put(updateNewsItem).delete(deleteNewsItem);

export default router;

