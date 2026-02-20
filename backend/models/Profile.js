import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      unique: true,
      index: true,
    },
    profileImage: {
      type: String,
      default: "",
      trim: true,
    },
    designation: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
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
    skills: {
      type: [String],
      default: [],
    },
    phone: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50,
    },
    website: {
      type: String,
      default: "",
      trim: true,
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
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;
