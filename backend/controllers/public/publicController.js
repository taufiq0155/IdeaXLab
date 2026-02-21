import Blog from "../../models/Blog.js";
import BlogCategory from "../../models/BlogCategory.js";
import Employee from "../../models/Employee.js";
import Project from "../../models/Project.js";
import Service from "../../models/Service.js";
import Admin from "../../models/Admin.js";
import cloudinary from "../../utils/cloudinary.js";
import { Readable } from "stream";
import mongoose from "mongoose";

// @desc    Get published blogs for visitor pages
// @route   GET /api/public/blogs
// @access  Public
export const getPublicBlogs = async (req, res) => {
  try {
    const { category = "all", search = "" } = req.query;

    const query = { status: "published" };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    if (category && category !== "all") {
      const conditions = [{ slug: category }];
      if (mongoose.Types.ObjectId.isValid(category)) {
        conditions.unshift({ _id: category });
      }

      const matchedCategory = await BlogCategory.findOne({
        $or: conditions,
      }).select("_id");

      if (matchedCategory) {
        query.category = matchedCategory._id;
      } else {
        query.category = null;
      }
    }

    const blogs = await Blog.find(query)
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: blogs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch public blogs",
      error: error.message,
    });
  }
};

// @desc    Get active blog categories for visitor pages
// @route   GET /api/public/blog-categories
// @access  Public
export const getPublicBlogCategories = async (req, res) => {
  try {
    const categories = await BlogCategory.find({ isActive: true })
      .sort({ name: 1 })
      .lean();

    const categoryIds = categories.map((item) => item._id);

    const counts = await Blog.aggregate([
      {
        $match: {
          status: "published",
          category: { $in: categoryIds },
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = new Map(counts.map((item) => [String(item._id), item.count]));

    const data = categories.map((item) => ({
      ...item,
      blogCount: countMap.get(String(item._id)) || 0,
    }));

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch public blog categories",
      error: error.message,
    });
  }
};

// @desc    Get active employees for visitor team page
// @route   GET /api/public/team
// @access  Public
export const getPublicTeam = async (req, res) => {
  try {
    const { category = "all" } = req.query;

    const query = { status: "active" };
    if (category !== "all") {
      const normalizedCategory = normalizeTeamCategory(category);
      if (normalizedCategory === "research-team") {
        query.$or = [
          { category: "research-team" },
          { category: { $exists: false } },
          { category: null },
          { category: "" },
        ];
      } else {
        query.category = normalizedCategory;
      }
    }

    const team = await Employee.find(query)
      .select(
        "fullName email designation department profileImage bio skills category linkedin github website otherLink"
      )
      .sort({ designation: 1, fullName: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: team,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch team members",
      error: error.message,
    });
  }
};

// @desc    Get published projects for visitor pages
// @route   GET /api/public/projects
// @access  Public
export const getPublicProjects = async (req, res) => {
  try {
    const { search = "" } = req.query;
    const query = { status: "published" };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "links.label": { $regex: search, $options: "i" } },
      ];
    }

    const projects = await Project.find(query)
      .select("title description images links createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch public projects",
      error: error.message,
    });
  }
};

const normalizeTeamCategory = (value) => {
  const cleaned = String(value || "").trim().toLowerCase();
  if (cleaned === "innovation team") return "innovation-team";
  if (cleaned === "research team") return "research-team";
  if (cleaned === "development team") return "development-team";
  if (["innovation-team", "research-team", "development-team"].includes(cleaned)) {
    return cleaned;
  }
  return "research-team";
};

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

const isAllowedDocument = (file) => {
  if (!file) return false;
  if (allowedMimeTypes.has(file.mimetype)) return true;
  const lower = String(file.originalname || "").toLowerCase();
  return (
    lower.endsWith(".pdf") ||
    lower.endsWith(".doc") ||
    lower.endsWith(".docx") ||
    lower.endsWith(".txt") ||
    lower.endsWith(".ppt") ||
    lower.endsWith(".pptx") ||
    lower.endsWith(".xls") ||
    lower.endsWith(".xlsx")
  );
};

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());

const configureCloudinaryFromEnv = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are missing or empty in .env");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
};

const uploadBufferToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "service-documents",
        resource_type: "raw",
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );

    Readable.from(file.buffer).pipe(stream);
  });

const getServiceOwnerAdmin = async () => {
  const superAdmin = await Admin.findOne({
    role: "superAdmin",
    isActive: true,
    status: "approved",
  }).select("_id");

  if (superAdmin) return superAdmin;

  const approvedAdmin = await Admin.findOne({
    isActive: true,
    status: "approved",
  }).select("_id");

  if (approvedAdmin) return approvedAdmin;

  const fallbackAdmin = await Admin.findOne({ isActive: true }).select("_id");
  return fallbackAdmin;
};

// @desc    Upload service documents from visitor page
// @route   POST /api/public/services/upload-documents
// @access  Public
export const uploadPublicServiceDocuments = async (req, res) => {
  try {
    const files = req.files || [];
    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No documents uploaded",
      });
    }

    configureCloudinaryFromEnv();

    const uploadedDocuments = [];
    for (const file of files) {
      if (!isAllowedDocument(file)) {
        return res.status(400).json({
          success: false,
          message: `Unsupported file type: ${file.originalname}`,
        });
      }

      const result = await uploadBufferToCloudinary(file);
      uploadedDocuments.push({
        originalName: file.originalname,
        fileUrl: result.secure_url,
        publicId: result.public_id,
        mimeType: file.mimetype,
        size: file.size,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Documents uploaded successfully",
      documents: uploadedDocuments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to upload documents: " + error.message,
      error: error.message,
    });
  }
};

// @desc    Submit service request from visitor page
// @route   POST /api/public/services/request
// @access  Public
export const createPublicServiceRequest = async (req, res) => {
  try {
    const { requesterEmail, title, description, documents } = req.body;

    if (!requesterEmail || !isValidEmail(requesterEmail)) {
      return res.status(400).json({
        success: false,
        message: "Valid requester email is required",
      });
    }

    if (!Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one document is required",
      });
    }

    const targetAdmin = await getServiceOwnerAdmin();
    if (!targetAdmin?._id) {
      return res.status(503).json({
        success: false,
        message: "No active reviewer available right now",
      });
    }

    const cleanedDocuments = documents
      .map((doc) => ({
        originalName: String(doc.originalName || "").trim(),
        fileUrl: String(doc.fileUrl || "").trim(),
        publicId: String(doc.publicId || "").trim(),
        mimeType: String(doc.mimeType || "").trim(),
        size: Number(doc.size || 0),
      }))
      .filter((doc) => doc.originalName && doc.fileUrl && doc.publicId);

    if (cleanedDocuments.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Uploaded document metadata is invalid",
      });
    }

    const service = await Service.create({
      adminId: targetAdmin._id,
      requesterEmail: String(requesterEmail || "").trim().toLowerCase(),
      title: String(title || "Document review request").trim(),
      description: String(description || "").trim(),
      documents: cleanedDocuments,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Service request submitted successfully",
      data: service,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create service request",
      error: error.message,
    });
  }
};
