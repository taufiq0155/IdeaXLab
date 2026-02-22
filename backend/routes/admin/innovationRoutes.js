import express from "express";
import { protect } from "../../middlewares/authMiddleware.js";
import {
  createInnovation,
  deleteInnovation,
  getInnovation,
  getInnovations,
  updateInnovation,
} from "../../controllers/admin/innovationController.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getInnovations).post(createInnovation);
router.route("/:id").get(getInnovation).put(updateInnovation).delete(deleteInnovation);

export default router;

