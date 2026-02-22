import mongoose from "mongoose";

const innovationLinkSchema = new mongoose.Schema(
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

const innovationSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },
    innovationTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 220,
    },
    problemStatement: {
      type: String,
      required: true,
      trim: true,
      maxlength: 6000,
    },
    proposedIotSolution: {
      type: String,
      required: true,
      trim: true,
      maxlength: 6000,
    },
    technologiesUsed: {
      sensors: {
        type: String,
        default: "",
        trim: true,
        maxlength: 2000,
      },
      microcontroller: {
        type: String,
        default: "",
        trim: true,
        maxlength: 2000,
      },
      communication: {
        type: String,
        default: "",
        trim: true,
        maxlength: 2000,
      },
    },
    developmentStatus: {
      type: String,
      enum: [
        "idea",
        "concept-validation",
        "prototype-development",
        "pilot-testing",
        "deployed",
      ],
      default: "idea",
      index: true,
    },
    links: {
      type: [innovationLinkSchema],
      default: [],
    },
  },
  { timestamps: true }
);

innovationSchema.index({ adminId: 1, createdAt: -1 });
innovationSchema.index({
  innovationTitle: "text",
  problemStatement: "text",
  proposedIotSolution: "text",
});

const Innovation = mongoose.model("Innovation", innovationSchema);
export default Innovation;

