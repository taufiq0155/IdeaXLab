import BlogCategory from "../../models/BlogCategory.js";
import Blog from "../../models/Blog.js";

// @desc    Get all blog categories for admin
// @route   GET /api/admin/blog-categories
// @access  Private (Admin only)
export const getCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    
    const query = { adminId: req.admin._id };
    
    // Add search filter
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Get categories
    const categories = await BlogCategory.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    // Get blog counts for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const blogCount = await Blog.countDocuments({
          category: category._id,
          adminId: req.admin._id
        });
        return { ...category, blogCount };
      })
    );
    
    const total = await BlogCategory.countDocuments(query);
    
    res.json({
      success: true,
      data: categoriesWithCount,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message
    });
  }
};

// @desc    Get single blog category
// @route   GET /api/admin/blog-categories/:id
// @access  Private (Admin only)
export const getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await BlogCategory.findOne({
      _id: id,
      adminId: req.admin._id
    });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Blog category not found"
      });
    }
    
    // Get blog count
    const blogCount = await Blog.countDocuments({
      category: category._id,
      adminId: req.admin._id
    });
    
    res.json({
      success: true,
      data: { ...category.toObject(), blogCount }
    });
  } catch (error) {
    console.error("Get category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch category",
      error: error.message
    });
  }
};

// @desc    Create blog category
// @route   POST /api/admin/blog-categories
// @access  Private (Admin only)
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    
    console.log("Creating category with name:", name); // Debug log
    
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required"
      });
    }
    
    const trimmedName = name.trim();
    
    // Check if category already exists for this admin (case-insensitive)
    const existingCategory = await BlogCategory.findOne({
      adminId: req.admin._id,
      name: { $regex: new RegExp(`^${trimmedName}$`, "i") }
    });
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists"
      });
    }
    
    // Create new category
    const category = new BlogCategory({
      adminId: req.admin._id,
      name: trimmedName,
      isActive: true
    });
    
    await category.save();
    console.log("Category saved successfully:", category); // Debug log
    
    // Get blog count (0 for new category)
    const categoryWithCount = {
      ...category.toObject(),
      blogCount: 0
    };
    
    res.status(201).json({
      success: true,
      message: "Blog category created successfully",
      data: categoryWithCount
    });
  } catch (error) {
    console.error("Create category error:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: error.message
    });
  }
};

// @desc    Update blog category
// @route   PUT /api/admin/blog-categories/:id
// @access  Private (Admin only)
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    console.log("Updating category:", id, "with name:", name); // Debug log
    
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required"
      });
    }
    
    const trimmedName = name.trim();
    
    // Check if name already exists for another category
    const existingCategory = await BlogCategory.findOne({
      adminId: req.admin._id,
      name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
      _id: { $ne: id }
    });
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists"
      });
    }
    
    const category = await BlogCategory.findOneAndUpdate(
      { _id: id, adminId: req.admin._id },
      { name: trimmedName },
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Blog category not found"
      });
    }
    
    console.log("Category updated successfully:", category); // Debug log
    
    // Get updated blog count
    const blogCount = await Blog.countDocuments({
      category: category._id,
      adminId: req.admin._id
    });
    
    const categoryWithCount = {
      ...category.toObject(),
      blogCount
    };
    
    res.json({
      success: true,
      message: "Blog category updated successfully",
      data: categoryWithCount
    });
  } catch (error) {
    console.error("Update category error:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: error.message
    });
  }
};

// @desc    Delete blog category
// @route   DELETE /api/admin/blog-categories/:id
// @access  Private (Admin only)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log("Deleting category:", id); // Debug log
    
    // Check if category has blogs
    const blogCount = await Blog.countDocuments({
      category: id,
      adminId: req.admin._id
    });
    
    if (blogCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category that has ${blogCount} blog(s). Please reassign or delete the blogs first.`
      });
    }
    
    const category = await BlogCategory.findOneAndDelete({
      _id: id,
      adminId: req.admin._id
    });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Blog category not found"
      });
    }
    
    console.log("Category deleted successfully"); // Debug log
    
    res.json({
      success: true,
      message: "Blog category deleted successfully"
    });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: error.message
    });
  }
};

// @desc    Toggle category status
// @route   PATCH /api/admin/blog-categories/:id/toggle
// @access  Private (Admin only)
export const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await BlogCategory.findOne({
      _id: id,
      adminId: req.admin._id
    });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Blog category not found"
      });
    }
    
    category.isActive = !category.isActive;
    await category.save();
    
    // Get updated blog count
    const blogCount = await Blog.countDocuments({
      category: category._id,
      adminId: req.admin._id
    });
    
    const categoryWithCount = {
      ...category.toObject(),
      blogCount
    };
    
    res.json({
      success: true,
      message: `Category ${category.isActive ? "activated" : "deactivated"} successfully`,
      data: categoryWithCount
    });
  } catch (error) {
    console.error("Toggle category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle category status",
      error: error.message
    });
  }
};