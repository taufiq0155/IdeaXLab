import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
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
    date: {
      type: Date,
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
      index: true,
    },
    year: {
      type: Number,
      required: true,
      min: 1900,
      max: 2100,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 6000,
    },
  },
  { timestamps: true }
);

newsSchema.index({ adminId: 1, createdAt: -1 });
newsSchema.index({ title: "text", category: "text", description: "text" });

const News = mongoose.model("News", newsSchema);
export default News;

