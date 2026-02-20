import Blog from "../../models/Blog.js";
import BlogCategory from "../../models/BlogCategory.js";
import cloudinary from "../../utils/cloudinary.js";
import mongoose from "mongoose";

// @desc    Get all blogs for admin
// @route   GET /api/admin/blogs
// @access  Private (Admin only)
export const getBlogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = "", 
      category, 
      status,
      tags,
      isFeatured 
    } = req.query;
    
    const query = { adminId: req.admin._id };
    
    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } }
      ];
    }
    
    // Add category filter
    if (category && mongoose.Types.ObjectId.isValid(category)) {
      query.category = category;
    }
    
    // Add status filter
    if (status && status !== "all") {
      query.status = status;
    }
    
    // Add tags filter
    if (tags) {
      const tagArray = tags.split(",");
      query.tags = { $in: tagArray };
    }
    
    // Add featured filter
    if (isFeatured === "true") {
      query.isFeatured = true;
    }
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const blogs = await Blog.find(query)
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    const total = await Blog.countDocuments(query);
    
    res.json({
      success: true,
      data: blogs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch blogs",
      error: error.message
    });
  }
};

// @desc    Get single blog
// @route   GET /api/admin/blogs/:id
// @access  Private (Admin only)
export const getBlog = async (req, res) => {
  try {
    const { id } = req.params;
    
    const blog = await Blog.findOne({
      _id: id,
      adminId: req.admin._id
    }).populate("category", "name slug description");
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }
    
    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch blog",
      error: error.message
    });
  }
};

// @desc    Create blog
// @route   POST /api/admin/blogs
// @access  Private (Admin only)
export const createBlog = async (req, res) => {
  try {
    const {
      title,
      content,
      featuredImage,
      category,
      status,
      resourceLinks
    } = req.body;
    
    // Validate required fields
    if (!title || !content || !featuredImage || !category) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }
    
    // Check if category exists and belongs to admin
    const categoryExists = await BlogCategory.findOne({
      _id: category,
      adminId: req.admin._id
    });
    
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid category selected"
      });
    }
    
    // Generate excerpt from content
    const plainText = content.replace(/<[^>]*>/g, "");
    const excerpt = plainText.substring(0, 150) + (plainText.length > 150 ? "..." : "");
    
    let normalizedResourceLinks = [];
    try {
      normalizedResourceLinks = normalizeResourceLinks(resourceLinks);
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError.message
      });
    }

    // Create blog - FIELDS MUST MATCH SCHEMA
    const blogData = {
      adminId: req.admin._id,
      title: title.trim(),
      content: content,
      featuredImage: featuredImage,
      category: category,
      excerpt: excerpt,
      status: status || "published",
      resourceLinks: normalizedResourceLinks
    };
    
    const blog = await Blog.create(blogData);
    
    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: blog
    });
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Failed to create blog: " + error.message
    });
  }
};

// @desc    Update blog
// @route   PUT /api/admin/blogs/:id
// @access  Private (Admin only)
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      excerpt,
      featuredImage,
      category,
      tags,
      status,
      metaTitle,
      metaDescription,
      metaKeywords,
      isFeatured,
      resourceLinks
    } = req.body;
    
    // Find existing blog
    const existingBlog = await Blog.findOne({
      _id: id,
      adminId: req.admin._id
    });
    
    if (!existingBlog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }
    
    // Validate category belongs to admin if provided
    if (category) {
      const categoryExists = await BlogCategory.findOne({
        _id: category,
        adminId: req.admin._id
      });
      
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: "Invalid category selected"
        });
      }
    }

    let normalizedResourceLinks = null;
    if (resourceLinks !== undefined) {
      try {
        normalizedResourceLinks = normalizeResourceLinks(resourceLinks);
      } catch (validationError) {
        return res.status(400).json({
          success: false,
          message: validationError.message
        });
      }
    }
    
    // Handle Cloudinary image update - delete old image if new one is provided
    if (featuredImage && featuredImage !== existingBlog.featuredImage) {
      const oldImagePublicId = extractCloudinaryPublicId(existingBlog.featuredImage);
      
      if (oldImagePublicId) {
        try {
          await cloudinary.uploader.destroy(oldImagePublicId);
        } catch (cloudinaryError) {
          // Silently handle Cloudinary error
        }
      }
    }
    
    // Update fields
    if (title) existingBlog.title = title;
    if (content) existingBlog.content = content;
    if (excerpt !== undefined) existingBlog.excerpt = excerpt;
    if (featuredImage) existingBlog.featuredImage = featuredImage;
    if (category) existingBlog.category = category;
    if (tags) existingBlog.tags = Array.isArray(tags) ? tags : tags.split(",").map(tag => tag.trim());
    if (status) existingBlog.status = status;
    if (metaTitle) existingBlog.metaTitle = metaTitle;
    if (metaDescription) existingBlog.metaDescription = metaDescription;
    if (metaKeywords) existingBlog.metaKeywords = Array.isArray(metaKeywords) ? metaKeywords : metaKeywords.split(",").map(keyword => keyword.trim());
    if (isFeatured !== undefined) existingBlog.isFeatured = isFeatured;
    if (normalizedResourceLinks !== null) existingBlog.resourceLinks = normalizedResourceLinks;
    
    await existingBlog.save();
    
    res.json({
      success: true,
      message: "Blog updated successfully",
      data: existingBlog
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Blog with this slug already exists"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Failed to update blog",
      error: error.message
    });
  }
};

// @desc    Delete blog
// @route   DELETE /api/admin/blogs/:id
// @access  Private (Admin only)
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    
    const blog = await Blog.findOne({
      _id: id,
      adminId: req.admin._id
    });
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }
    
    // Delete featured image from Cloudinary
    const imagePublicId = extractCloudinaryPublicId(blog.featuredImage);
    if (imagePublicId) {
      try {
        await cloudinary.uploader.destroy(imagePublicId);
      } catch (cloudinaryError) {
        // Silently handle Cloudinary error
      }
    }
    
    await blog.deleteOne();
    
    res.json({
      success: true,
      message: "Blog deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete blog",
      error: error.message
    });
  }
};

// @desc    Toggle blog status (draft/published)
// @route   PATCH /api/admin/blogs/:id/status
// @access  Private (Admin only)
export const toggleBlogStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!["draft", "published", "archived"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }
    
    const blog = await Blog.findOne({
      _id: id,
      adminId: req.admin._id
    });
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }
    
    blog.status = status;
    await blog.save();
    
    res.json({
      success: true,
      message: `Blog ${status} successfully`,
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to toggle blog status",
      error: error.message
    });
  }
};

// @desc    Toggle featured status
// @route   PATCH /api/admin/blogs/:id/featured
// @access  Private (Admin only)
export const toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    
    const blog = await Blog.findOne({
      _id: id,
      adminId: req.admin._id
    });
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }
    
    blog.isFeatured = !blog.isFeatured;
    await blog.save();
    
    res.json({
      success: true,
      message: `Blog ${blog.isFeatured ? "featured" : "unfeatured"} successfully`,
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to toggle featured status",
      error: error.message
    });
  }
};

// @desc    Bulk delete blogs
// @route   POST /api/admin/blogs/bulk-delete
// @access  Private (Admin only)
export const bulkDeleteBlogs = async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide blog IDs to delete"
      });
    }
    
    // Get all blogs to be deleted
    const blogs = await Blog.find({
      _id: { $in: ids },
      adminId: req.admin._id
    });
    
    // Delete images from Cloudinary
    const deletePromises = blogs.map(async (blog) => {
      const imagePublicId = extractCloudinaryPublicId(blog.featuredImage);
      if (imagePublicId) {
        try {
          await cloudinary.uploader.destroy(imagePublicId);
        } catch (error) {
          // Silently handle error
        }
      }
    });
    
    await Promise.all(deletePromises);
    
    // Delete blogs from database
    const result = await Blog.deleteMany({
      _id: { $in: ids },
      adminId: req.admin._id
    });
    
    res.json({
      success: true,
      message: `${result.deletedCount} blog(s) deleted successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete blogs",
      error: error.message
    });
  }
};

// @desc    Bulk update blog status
// @route   POST /api/admin/blogs/bulk-status
// @access  Private (Admin only)
export const bulkUpdateStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide blog IDs"
      });
    }
    
    if (!["draft", "published", "archived"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }
    
    const result = await Blog.updateMany(
      { _id: { $in: ids }, adminId: req.admin._id },
      { status }
    );
    
    res.json({
      success: true,
      message: `${result.modifiedCount} blog(s) updated successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update blogs",
      error: error.message
    });
  }
};

// @desc    Upload image to Cloudinary
// @route   POST /api/admin/blogs/upload-image
// @access  Private (Admin only)
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }
    
    // Validate file size (5MB max)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB."
      });
    }
    
    // Validate file type
    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        success: false,
        message: "Only image files are allowed"
      });
    }
    
    // Trim the values to remove any whitespace or hidden characters
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
    
    // Check if any values are empty after trimming
    if (!cloudName) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary cloud name is missing or empty in .env file"
      });
    }
    
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary API key is missing or empty in .env file"
      });
    }
    
    if (!apiSecret) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary API secret is missing or empty in .env file"
      });
    }
    
    // Reconfigure Cloudinary with trimmed values
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret
    });
    
    // Upload to Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "blogs",
      resource_type: "auto",
      timeout: 30000
    });
    
    res.json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to upload image: " + error.message
    });
  }
};

// Helper function to extract Cloudinary public_id from URL
const extractCloudinaryPublicId = (url) => {
  try {
    if (!url) return null;
    
    const matches = url.match(/\/upload\/(?:v\d+\/)?(.+?)\./);
    if (matches && matches[1]) {
      return matches[1];
    }
    return null;
  } catch (error) {
    return null;
  }
};

const normalizeResourceLinks = (resourceLinks) => {
  if (resourceLinks === undefined || resourceLinks === null) {
    return [];
  }

  if (!Array.isArray(resourceLinks)) {
    throw new Error("Resource links must be an array");
  }

  const normalized = [];

  for (const link of resourceLinks) {
    if (!link || typeof link !== "object") {
      continue;
    }

    const name = String(link.name || "").trim();
    let url = String(link.url || "").trim();

    if (!name && !url) {
      continue;
    }

    if (!name || !url) {
      throw new Error("Each resource link must include both name and URL");
    }

    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    try {
      new URL(url);
    } catch (error) {
      throw new Error(`Invalid URL for "${name}"`);
    }

    normalized.push({
      name,
      url
    });
  }

  return normalized;
};
