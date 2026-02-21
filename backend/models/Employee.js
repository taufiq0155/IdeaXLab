import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 200,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50,
    },
    profileImage: {
      type: String,
      default: "",
      trim: true,
    },
    profileImagePublicId: {
      type: String,
      default: "",
      trim: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    department: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
    },
    employeeCode: {
      type: String,
      trim: true,
      maxlength: 50,
      sparse: true,
    },
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "intern"],
      default: "full-time",
    },
    status: {
      type: String,
      enum: ["active", "on-leave", "inactive"],
      default: "active",
    },
    location: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },
    education: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    experience: {
      type: String,
      default: "",
      trim: true,
      maxlength: 3000,
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
      min: 0,
      max: 80,
    },
    skills: {
      type: [String],
      default: [],
    },
    specialization: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },
    researchInterests: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2500,
    },
    achievements: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    joinDate: {
      type: Date,
      default: null,
    },
    linkedin: {
      type: String,
      default: "",
      trim: true,
    },
    github: {
      type: String,
      default: "",
      trim: true,
    },
    website: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

employeeSchema.index({ adminId: 1, email: 1 }, { unique: true });
employeeSchema.index(
  { adminId: 1, employeeCode: 1 },
  { unique: true, sparse: true }
);

const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;
