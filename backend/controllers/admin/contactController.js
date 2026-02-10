import Contact from '../../models/Contact.js';
import nodemailer from 'nodemailer';
import { validationResult, body } from 'express-validator';
import Admin from '../../models/Admin.js';

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "taufiqrahman015@gmail.com",
    pass: process.env.EMAIL_PASS || "upxp pwmu ekvk incr"
  }
});

// Submit contact form (Public)
export const submitContact = [
  // Validation middleware
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('phone')
    .optional({ checkFalsy: true })
    .matches(/^[+]?[\d\s\-()]*$/).withMessage('Please enter a valid phone number'),
  
  body('subject')
    .optional()
    .trim(),
  
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required'),

  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array()
        });
      }

      const { name, email, phone, subject, message } = req.body;

      // Create new contact
      const contact = await Contact.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : "",
        subject: subject ? subject.trim() : "General Inquiry",
        message: message.trim(),
        source: req.body.source || "website"
      });

      // Optional: Send auto-response email
      if (process.env.SEND_AUTO_RESPONSE === 'true') {
        try {
          const autoResponse = {
            from: `"IdeaXLab" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Thank you for contacting us!",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #667eea; color: white; padding: 20px; text-align: center;">
                  <h1 style="margin: 0; font-size: 24px;">IdeaXLab</h1>
                  <p style="margin: 5px 0 0 0; opacity: 0.9;">Thank You for Your Message</p>
                </div>
                
                <div style="padding: 20px;">
                  <p>Dear <strong>${name}</strong>,</p>
                  <p>Thank you for contacting IdeaXLab. We have received your message and our team will get back to you within 24-48 hours.</p>
                  
                  <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Message Reference:</strong> ${contact._id || 'N/A'}</p>
                    <p><strong>Received:</strong> ${new Date().toLocaleString()}</p>
                  </div>
                  
                  <p>Best regards,<br>
                  <strong>IdeaXLab Team</strong></p>
                </div>
              </div>
            `
          };
          
          await transporter.sendMail(autoResponse);
        } catch (emailError) {
          // Don't fail the contact submission if auto-email fails
        }
      }

      res.status(201).json({
        success: true,
        message: "Your message has been sent successfully! We'll get back to you soon.",
        data: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          subject: subject ? subject.trim() : "General Inquiry"
        }
      });
      
    } catch (error) {
      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: messages.join(", ")
        });
      }

      res.status(500).json({
        success: false,
        message: "Server error. Please try again later.",
        error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
      });
    }
  }
];

// ========== ADMIN ROUTES ==========

// Get all contact messages (Admin access)
export const getAllContacts = async (req, res) => {
  try {
    const { 
      search, 
      status, 
      priority,
      page = 1, 
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc" 
    } = req.query;

    // Build query
    let query = {};

    // Search filter
    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { subject: searchRegex },
        { message: searchRegex },
        { phone: searchRegex }
      ];
    }

    // Status filter
    if (status && status !== "all") {
      query.status = status;
    }

    // Priority filter
    if (priority && priority !== "all") {
      query.priority = priority;
    }

    // Sort options
    const sortOptions = {};
    if (sortBy === "name") sortOptions.name = sortOrder === "desc" ? -1 : 1;
    else if (sortBy === "email") sortOptions.email = sortOrder === "desc" ? -1 : 1;
    else if (sortBy === "priority") sortOptions.priority = sortOrder === "desc" ? -1 : 1;
    else if (sortBy === "updatedAt") sortOptions.updatedAt = sortOrder === "desc" ? -1 : 1;
    else sortOptions.createdAt = sortOrder === "desc" ? -1 : 1;

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count
    const total = await Contact.countDocuments(query);

    // Get messages with pagination
    const messages = await Contact.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .select("-__v")
      .populate("repliedBy", "name email avatar")
      .lean();

    // Get statistics
    const stats = await Contact.aggregate([
      {
        $facet: {
          total: [{ $count: "count" }],
          byStatus: [
            { $group: { _id: "$status", count: { $sum: 1 } } }
          ],
          byPriority: [
            { $group: { _id: "$priority", count: { $sum: 1 } } }
          ],
          unread: [
            { $match: { read: false } },
            { $count: "count" }
          ],
          recent: [
            { 
              $match: { 
                createdAt: { 
                  $gte: new Date(new Date().setDate(new Date().getDate() - 7)) 
                } 
              } 
            },
            { $count: "count" }
          ],
          today: [
            { 
              $match: { 
                createdAt: { 
                  $gte: new Date(new Date().setHours(0, 0, 0, 0)) 
                } 
              } 
            },
            { $count: "count" }
          ]
        }
      }
    ]);

    res.json({
      success: true,
      message: "Messages fetched successfully",
      messages,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalMessages: total,
        hasNext: skip + messages.length < total,
        hasPrev: pageNum > 1,
        limit: limitNum
      },
      stats: {
        total: stats[0].total[0]?.count || 0,
        byStatus: stats[0].byStatus,
        byPriority: stats[0].byPriority,
        unread: stats[0].unread[0]?.count || 0,
        recent: stats[0].recent[0]?.count || 0,
        today: stats[0].today[0]?.count || 0
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching contacts"
    });
  }
};

// Get single contact message
export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate("repliedBy", "name email avatar")
      .select("-__v");

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found"
      });
    }

    // Mark as read if accessed by admin
    if (!contact.read && req.admin) {
      contact.read = true;
      await contact.save();
    }

    res.json({
      success: true,
      message: "Contact fetched successfully",
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Send reply to contact message
export const sendReply = [
  body('replyMessage')
    .trim()
    .notEmpty().withMessage('Reply message is required'),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { replyMessage } = req.body;
      const contact = await Contact.findById(req.params.id);

      if (!contact) {
        return res.status(404).json({
          success: false,
          message: "Contact message not found"
        });
      }

      // Send email
      let emailSent = false;
      let emailError = null;

      try {
        const mailOptions = {
          from: `"IdeaXLab" <${process.env.EMAIL_USER}>`,
          to: contact.email,
          cc: req.admin.email,
          subject: contact.subject ? `Re: ${contact.subject}` : "Re: Your Contact Message",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #667eea; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">IdeaXLab</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">Response to Your Message</p>
              </div>
              
              <div style="padding: 20px;">
                <p>Dear <strong>${contact.name}</strong>,</p>
                <p>Thank you for contacting IdeaXLab. Here is our response to your message:</p>
                
                <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0;">
                  <h3 style="margin-top: 0; color: #667eea;">Our Response:</h3>
                  <p>${replyMessage.replace(/\n/g, "<br>")}</p>
                </div>
                
                <div style="background: #f1f3f4; padding: 12px; border-left: 4px solid #ccc; margin: 15px 0;">
                  <h4 style="margin-top: 0; color: #666;">Your Original Message:</h4>
                  <p><strong>Subject:</strong> ${contact.subject || "No Subject"}</p>
                  <p><strong>Message:</strong></p>
                  <p>${contact.message.replace(/\n/g, "<br>")}</p>
                </div>
                
                <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
                  <p>Best regards,</p>
                  <p><strong>${req.admin.name}</strong><br>
                  ${req.admin.title || "IdeaXLab Team"}<br>
                  Email: ${req.admin.email}</p>
                </div>
              </div>
            </div>
          `,
          replyTo: req.admin.email
        };

        await transporter.sendMail(mailOptions);
        emailSent = true;
      } catch (emailErr) {
        emailError = emailErr.message;
      }

      // Update contact with reply
      contact.status = "replied";
      contact.repliedAt = new Date();
      contact.replyMessage = replyMessage.trim();
      contact.repliedBy = req.admin._id;
      contact.read = true;
      await contact.save();

      res.json({
        success: true,
        message: emailSent 
          ? "Reply sent successfully!" 
          : `Reply saved but email failed: ${emailError}`,
        emailSent,
        data: {
          id: contact._id,
          status: contact.status,
          repliedAt: contact.repliedAt,
          repliedBy: req.admin.name
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }
];

// Update contact status or priority
export const updateContact = async (req, res) => {
  try {
    const { status, priority, read } = req.body;
    const updates = {};

    if (status) {
      updates.status = status;
      if (status === "replied" && !req.body.repliedAt) {
        updates.repliedAt = new Date();
      }
    }

    if (priority) {
      updates.priority = priority;
    }

    if (typeof read === "boolean") {
      updates.read = read;
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select("-__v");

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found"
      });
    }

    res.json({
      success: true,
      message: "Contact updated successfully",
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Mark all messages as read
export const markAllAsRead = async (req, res) => {
  try {
    const result = await Contact.updateMany(
      { read: false },
      { $set: { read: true } }
    );

    res.json({
      success: true,
      message: `Marked ${result.modifiedCount} messages as read`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Bulk update contacts
export const bulkUpdate = async (req, res) => {
  try {
    const { contactIds, action } = req.body;

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No contact IDs provided"
      });
    }

    let updateQuery = {};
    let message = "";

    switch (action) {
      case "mark-read":
        updateQuery = { read: true };
        message = "marked as read";
        break;
      case "mark-unread":
        updateQuery = { read: false };
        message = "marked as unread";
        break;
      case "archive":
        updateQuery = { status: "archived" };
        message = "archived";
        break;
      case "mark-replied":
        updateQuery = { 
          status: "replied",
          repliedAt: new Date()
        };
        message = "marked as replied";
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid action"
        });
    }

    const result = await Contact.updateMany(
      { _id: { $in: contactIds } },
      { $set: updateQuery }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} contacts ${message}`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Delete contact message
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found"
      });
    }

    res.json({
      success: true,
      message: "Contact message deleted successfully",
      deletedId: req.params.id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Bulk delete contacts
export const bulkDelete = async (req, res) => {
  try {
    const { contactIds } = req.body;

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No contact IDs provided"
      });
    }

    const result = await Contact.deleteMany({ _id: { $in: contactIds } });

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} contacts`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Get contact statistics dashboard
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalMessages,
      pendingMessages,
      repliedMessages,
      unreadMessages,
      todayMessages,
      weeklyMessages,
      monthlyMessages
    ] = await Promise.all([
      Contact.countDocuments(),
      Contact.countDocuments({ status: "pending" }),
      Contact.countDocuments({ status: "replied" }),
      Contact.countDocuments({ read: false }),
      Contact.countDocuments({ 
        createdAt: { 
          $gte: new Date(new Date().setHours(0, 0, 0, 0)) 
        } 
      }),
      Contact.countDocuments({ 
        createdAt: { 
          $gte: new Date(new Date().setDate(new Date().getDate() - 7)) 
        } 
      }),
      Contact.countDocuments({ 
        createdAt: { 
          $gte: new Date(new Date().setDate(new Date().getDate() - 30)) 
        } 
      })
    ]);

    res.json({
      success: true,
      message: "Dashboard stats fetched successfully",
      stats: {
        total: totalMessages,
        pending: pendingMessages,
        replied: repliedMessages,
        unread: unreadMessages,
        today: todayMessages,
        weekly: weeklyMessages,
        monthly: monthlyMessages
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Export all functions as default
export default {
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
};