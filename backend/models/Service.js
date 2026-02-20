import mongoose from "mongoose";

const serviceDocumentSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      default: "",
      trim: true,
    },
    size: {
      type: Number,
      default: 0,
    },
    review: {
      type: String,
      default: "",
      trim: true,
    },
    suggestion: {
      type: String,
      default: "",
      trim: true,
    },
    reviewStatus: {
      type: String,
      enum: ["pending", "reviewed", "needs-update"],
      default: "pending",
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const serviceSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },
    requesterEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ["pending", "in-review", "reviewed"],
      default: "pending",
    },
    documents: {
      type: [serviceDocumentSchema],
      default: [],
    },
    reviewSentAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

serviceSchema.index({ requesterEmail: 1 });
serviceSchema.index({ status: 1 });
serviceSchema.index({ createdAt: -1 });

const Service = mongoose.model("Service", serviceSchema);
export default Service;
