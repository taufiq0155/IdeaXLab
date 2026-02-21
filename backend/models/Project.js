import mongoose from "mongoose";

const projectImageSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      required: true,
      trim: true,
    },
    altText: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },
  },
  { _id: true }
);

const projectLinkSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    url: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
  },
  { _id: true }
);

const projectSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 220,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 8000,
    },
    images: {
      type: [projectImageSchema],
      default: [],
    },
    links: {
      type: [projectLinkSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "published",
      index: true,
    },
  },
  { timestamps: true }
);

projectSchema.index({ adminId: 1, createdAt: -1 });
projectSchema.index({ title: "text", description: "text" });

const Project = mongoose.model("Project", projectSchema);
export default Project;
