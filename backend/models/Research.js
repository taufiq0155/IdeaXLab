import mongoose from "mongoose";

const researchLinkSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    url: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1200,
    },
  },
  { _id: true }
);

const researchSchema = new mongoose.Schema(
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
      maxlength: 260,
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 6000,
    },
    domain: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
      index: true,
    },
    authors: {
      type: [String],
      default: [],
    },
    publishDate: {
      type: Date,
      required: true,
      index: true,
    },
    publicationType: {
      type: String,
      required: true,
      default: "other",
      trim: true,
      maxlength: 120,
      index: true,
    },
    links: {
      type: [researchLinkSchema],
      default: [],
    },
  },
  { timestamps: true }
);

researchSchema.index({ adminId: 1, createdAt: -1 });
researchSchema.index({ title: "text", description: "text", domain: "text", authors: "text" });

const Research = mongoose.model("Research", researchSchema);
export default Research;
