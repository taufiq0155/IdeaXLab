import express from "express";
import {
  registerAdmin,
  loginAdmin,
  getProfile,
  changePassword,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  resendVerificationCode,
  getAllAdmins,
  updateAdminStatus,
  updateAdmin,
  deleteAdmin
} from "../../controllers/admin/authController.js";
import { protect, authorize } from "../../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// Password reset routes
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);
router.post("/resend-verification-code", resendVerificationCode);

// Protected routes (require login)
router.get("/profile", protect, getProfile);
router.put("/change-password", protect, changePassword);

// SuperAdmin only routes
router.get("/admins", protect, authorize("superAdmin"), getAllAdmins);
router.put("/admins/status", protect, authorize("superAdmin"), updateAdminStatus);
router.put("/admins/:adminId", protect, authorize("superAdmin"), updateAdmin);
router.delete("/admins/:adminId", protect, authorize("superAdmin"), deleteAdmin);

export default router;