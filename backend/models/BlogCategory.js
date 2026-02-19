import mongoose from "mongoose";

const blogCategorySchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: [true, "Admin ID is required"],
      index: true
    },
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: false,
      minlength: [2, "Category name must be at least 2 characters"],
      maxlength: [50, "Category name cannot exceed 50 characters"]
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
      default: function() {
        return this.name
          ? this.name.toLowerCase().replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "")
          : "";
      }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// NO PRE-SAVE MIDDLEWARE - using default function instead

// Ensure unique category name per admin
blogCategorySchema.index({ adminId: 1, name: 1 }, { unique: true });
blogCategorySchema.index({ adminId: 1, slug: 1 }, { unique: true });
blogCategorySchema.index({ isActive: 1 });

// Virtual for blog count
blogCategorySchema.virtual("blogCount", {
  ref: "Blog",
  localField: "_id",
  foreignField: "category",
  count: true
});

const BlogCategory = mongoose.model("BlogCategory", blogCategorySchema);
export default BlogCategory;