import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters long"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
  },
  phone: {
    type: String,
    default: "",
    match: [/^[+]?[\d\s\-()]*$/, "Please enter a valid phone number"]
  },
  subject: {
    type: String,
    default: "General Inquiry",
    trim: true
  },
  message: {
    type: String,
    required: [true, "Message is required"],
    trim: true,
    minlength: [1, "Message is required"]
  },
  status: {
    type: String,
    enum: ["pending", "replied", "archived"],
    default: "pending"
  },
  read: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },
  repliedAt: {
    type: Date
  },
  replyMessage: {
    type: String,
    default: ""
  },
  repliedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin"
  },
  source: {
    type: String,
    enum: ["website", "mobile", "api", "direct"],
    default: "website"
  }
}, { 
  timestamps: true 
});

// Indexes for better query performance
contactSchema.index({ email: 1, createdAt: -1 });
contactSchema.index({ status: 1 });
contactSchema.index({ read: 1 });
contactSchema.index({ priority: 1 });
contactSchema.index({ createdAt: -1 });
contactSchema.index({ updatedAt: -1 });

// NO PRE-SAVE HOOK - SIMPLEST SOLUTION
// Priority will always be "medium" as default

const Contact = mongoose.model("Contact", contactSchema);
export default Contact;