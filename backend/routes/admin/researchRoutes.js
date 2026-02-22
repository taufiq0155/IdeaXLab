import express from "express";
import { protect } from "../../middlewares/authMiddleware.js";
import {
  createResearch,
  deleteResearchItem,
  getResearchItem,
  getResearchItems,
  updateResearchItem,
} from "../../controllers/admin/researchController.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getResearchItems).post(createResearch);
router.route("/:id").get(getResearchItem).put(updateResearchItem).delete(deleteResearchItem);

export default router;

