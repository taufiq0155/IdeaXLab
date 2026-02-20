import express from "express";
import multer from "multer";
import { protect } from "../../middlewares/authMiddleware.js";
import {
  bulkDeleteServiceRequests,
  createServiceRequest,
  downloadServiceDocumentFile,
  deleteServiceRequest,
  getServiceDocumentFile,
  getServiceRequest,
  getServiceRequests,
  reviewServiceRequest,
  uploadServiceDocuments,
} from "../../controllers/admin/serviceController.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024,
    files: 20,
  },
});

router.use(protect);

router.post(
  "/upload-documents",
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
  uploadServiceDocuments
);

router.post("/bulk-delete", bulkDeleteServiceRequests);
router.route("/").get(getServiceRequests).post(createServiceRequest);
router.get("/:id/documents/:documentId/file", getServiceDocumentFile);
router.get("/:id/documents/:documentId/download", downloadServiceDocumentFile);
router.get("/:id", getServiceRequest);
router.post("/:id/review", reviewServiceRequest);
router.delete("/:id", deleteServiceRequest);

export default router;
