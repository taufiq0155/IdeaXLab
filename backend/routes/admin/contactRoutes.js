import express from "express";
const router = express.Router();

// Option 2: Import named exports directly
import { 
  submitContact,
  getAllContacts,
  getContactById,
  sendReply,
  updateContact,
  markAllAsRead,
  bulkUpdate,
  deleteContact,
  bulkDelete,
  getDashboardStats
} from "../../controllers/admin/contactController.js";

import { protect, authorize } from "../../middlewares/authMiddleware.js";

// ========== PUBLIC ROUTES ==========
// Submit contact form (Public access)
router.post("/", submitContact);

// ========== PROTECTED ADMIN ROUTES ==========
router.use(protect);


// Get all contact messages (Admin access)
router.get("/", getAllContacts);

// Get single contact message
router.get("/:id", getContactById);

// Send reply to contact message
router.post("/:id/reply", sendReply);

// Update contact (status, priority, read)
router.put("/:id", updateContact);

// Delete contact message
router.delete("/:id", deleteContact);

// ========== BULK ACTIONS ==========
// Mark all messages as read
router.put("/actions/mark-all-read", markAllAsRead);

// Bulk update contacts
router.put("/actions/bulk-update", bulkUpdate);

// Bulk delete contacts
router.delete("/actions/bulk-delete", bulkDelete);

// ========== STATISTICS ==========
// Get comprehensive dashboard statistics
router.get("/stats/dashboard", getDashboardStats);

export default router;