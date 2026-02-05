import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import Admin from "../../models/Admin.js";
import crypto from "crypto";

// Import helper functions
import { generateVerificationCode } from "../../utils/codeGenerator.js";
import sendEmail from "../../utils/sendEmail.js";

// REGISTER ADMIN for IdeaXLab
export const registerAdmin = async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;

    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required" 
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide a valid email address" 
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        success: false,
        message: "Password must be at least 8 characters long" 
      });
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password)) {
      return res.status(400).json({ 
        success: false,
        message: "Password must contain uppercase, lowercase, number, and special character" 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Passwords do not match" 
      });
    }

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ 
        success: false,
        message: "Email already registered" 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS));

    // Check if any admin exists (First admin becomes superAdmin)
    const adminCount = await Admin.countDocuments();
    
    let role = "admin";
    let status = "pending";
    let isActive = false;

    if (adminCount === 0) {
      // First registration → superAdmin
      role = "superAdmin";
      status = "approved";
      isActive = true;
    }

    // Create admin
    const admin = await Admin.create({
      fullName,
      email,
      password: hashedPassword,
      role,
      status,
      isActive
    });

    // Remove password from response
    const adminResponse = admin.toObject();
    delete adminResponse.password;

    res.status(201).json({
      success: true,
      message: role === "superAdmin" 
        ? "SuperAdmin account created successfully! You can now login."
        : "Registration successful! Your account is pending approval from superAdmin.",
      data: adminResponse
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ 
      success: false,
      message: "Registration failed. Please try again." 
    });
  }
};

// LOGIN ADMIN for IdeaXLab
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide email and password" 
      });
    }

    // Find admin with password
    const admin = await Admin.findOne({ email }).select('+password');
    
    if (!admin) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    // Check if admin is approved
    if (admin.status !== "approved") {
      return res.status(403).json({ 
        success: false,
        message: admin.status === "pending" 
          ? "Your account is pending approval from superAdmin."
          : "Your account has been rejected. Please contact superAdmin."
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(403).json({ 
        success: false,
        message: "Your account has been deactivated. Please contact superAdmin."
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Create JWT token
    const token = jwt.sign(
      { 
        id: admin._id, 
        role: admin.role,
        email: admin.email 
      },
      process.env.JWT_SECRET || 'your_fallback_secret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Prepare admin data for response
    const adminData = {
      id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      role: admin.role,
      status: admin.status,
      lastLogin: admin.lastLogin,
      createdAt: admin.createdAt
    };

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: adminData
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false,
      message: "Login failed. Please try again." 
    });
  }
};

// GET CURRENT ADMIN PROFILE
export const getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    
    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch profile" 
    });
  }
};

// CHANGE PASSWORD
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const adminId = req.admin.id;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required" 
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ 
        success: false,
        message: "New password must be at least 8 characters" 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: "New passwords do not match" 
      });
    }

    // Get admin with password
    const admin = await Admin.findById(adminId).select('+password');
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false,
        message: "Current password is incorrect" 
      });
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(newPassword, admin.password);
    if (isSamePassword) {
      return res.status(400).json({ 
        success: false,
        message: "New password must be different from current password" 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, Number(process.env.BCRYPT_SALT_ROUNDS));
    
    // Update password
    admin.password = hashedPassword;
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to change password" 
    });
  }
};

// Helper function to send verification email
const sendVerificationEmail = async (email, code) => {
  try {
    const subject = "Password Reset Verification Code";
    const text = `Your password reset verification code is: ${code}. This code will expire in 15 minutes.`;
    
    const emailSent = await sendEmail(email, subject, text);
    
    // For development, always log the code even if email fails
    if (!emailSent) {
      console.log(`📋 DEV MODE: Verification code for ${email}: ${code}`);
    }
    
    return emailSent;
  } catch (error) {
    console.error("Error in sendVerificationEmail:", error);
    console.log(`📋 DEV MODE: Verification code for ${email}: ${code}`);
    return false;
  }
};

// Helper function to send password reset success email
const sendPasswordResetSuccessEmail = async (email) => {
  try {
    const subject = "Password Reset Successful";
    const text = "Your password has been successfully reset. If you did not make this change, please contact the system administrator immediately.";
    
    const emailSent = await sendEmail(email, subject, text);
    
    if (!emailSent) {
      console.log(`📋 DEV MODE: Password reset successful for ${email}`);
    }
    
    return emailSent;
  } catch (error) {
    console.error("Error in sendPasswordResetSuccessEmail:", error);
    console.log(`📋 DEV MODE: Password reset successful for ${email}`);
    return false;
  }
};

// FORGOT PASSWORD - Send verification code
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: "Email is required" 
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide a valid email address" 
      });
    }

    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      return res.status(404).json({ 
        success: false,
        message: "No account found with this email" 
      });
    }

    // Check if admin is approved and active
    if (admin.status !== "approved" || !admin.isActive) {
      return res.status(403).json({ 
        success: false,
        message: "Your account is not active or not approved" 
      });
    }

    // Generate 6-digit verification code
    const verificationCode = generateVerificationCode();
    
    // Hash the code for storage
    const hashedCode = crypto
      .createHash('sha256')
      .update(verificationCode)
      .digest('hex');

    // Store in database with expiration (15 minutes)
    admin.resetPasswordToken = hashedCode;
    admin.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    
    await admin.save();

    // Send email with verification code
    const emailSent = await sendVerificationEmail(email, verificationCode);

    if (!emailSent) {
      // For development, we'll still allow it but log a warning
      console.log("⚠️ Email sending failed, but continuing in development mode");
    }

    res.status(200).json({
      success: true,
      message: "Verification code sent to your email",
      email: email // Return email for next step
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to process password reset request" 
    });
  }
};

// VERIFY RESET CODE
export const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ 
        success: false,
        message: "Email and verification code are required" 
      });
    }

    if (code.length !== 6 || !/^\d+$/.test(code)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid verification code format" 
      });
    }

    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      return res.status(404).json({ 
        success: false,
        message: "No account found with this email" 
      });
    }

    // Check if reset token exists and is not expired
    if (!admin.resetPasswordToken || !admin.resetPasswordExpire) {
      return res.status(400).json({ 
        success: false,
        message: "No password reset request found" 
      });
    }

    if (admin.resetPasswordExpire < Date.now()) {
      return res.status(400).json({ 
        success: false,
        message: "Verification code has expired" 
      });
    }

    // Hash the provided code and compare
    const hashedCode = crypto
      .createHash('sha256')
      .update(code)
      .digest('hex');

    if (admin.resetPasswordToken !== hashedCode) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid verification code" 
      });
    }

    // Generate a temporary token for password reset
    const resetToken = jwt.sign(
      { id: admin._id, email: admin.email, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.status(200).json({
      success: true,
      message: "Verification successful",
      resetToken
    });

  } catch (error) {
    console.error("Verify code error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to verify code" 
    });
  }
};


// RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (!resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required" 
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ 
        success: false,
        message: "Password must be at least 8 characters" 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Passwords do not match" 
      });
    }

    // Verify the reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
      
      // Check if token is for password reset
      if (decoded.type !== 'password_reset') {
        throw new Error("Invalid token type");
      }
    } catch (error) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid or expired reset token" 
      });
    }

    // Find admin with password field included
    const admin = await Admin.findById(decoded.id).select('+password');
    
    if (!admin) {
      return res.status(404).json({ 
        success: false,
        message: "Admin not found" 
      });
    }

    // Check if password reset was initiated
    if (!admin.resetPasswordToken || !admin.resetPasswordExpire) {
      return res.status(400).json({ 
        success: false,
        message: "Password reset not initiated" 
      });
    }

    // Check if reset token has expired
    if (admin.resetPasswordExpire < Date.now()) {
      return res.status(400).json({ 
        success: false,
        message: "Password reset session expired" 
      });
    }

    // Check if new password is same as old password
    // Note: admin.password should exist now because we used .select('+password')
    const isSamePassword = await bcrypt.compare(newPassword, admin.password);
    if (isSamePassword) {
      return res.status(400).json({ 
        success: false,
        message: "New password must be different from current password" 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, Number(process.env.BCRYPT_SALT_ROUNDS || 12));
    
    // Update password and clear reset token
    admin.password = hashedPassword;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpire = undefined;
    admin.lastPasswordChange = new Date();
    
    await admin.save();

    // Send success email
    await sendPasswordResetSuccessEmail(admin.email);

    res.status(200).json({
      success: true,
      message: "Password reset successful. You can now login with new password."
    });

  } catch (error) {
    console.error("Reset password error:", error);
    
    // More specific error message
    let errorMessage = "Failed to reset password";
    if (error.message.includes("Illegal arguments")) {
      errorMessage = "Database error: Password field not found";
    }
    
    res.status(500).json({ 
      success: false,
      message: errorMessage 
    });
  }
};
// RESEND VERIFICATION CODE
export const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: "Email is required" 
      });
    }

    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      return res.status(404).json({ 
        success: false,
        message: "No account found with this email" 
      });
    }

    // Generate new 6-digit verification code
    const verificationCode = generateVerificationCode();
    
    // Hash the code for storage
    const hashedCode = crypto
      .createHash('sha256')
      .update(verificationCode)
      .digest('hex');

    // Update in database with new expiration (15 minutes)
    admin.resetPasswordToken = hashedCode;
    admin.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    
    await admin.save();

    // Send email with new verification code
    const emailSent = await sendVerificationEmail(email, verificationCode);

    if (!emailSent) {
      console.log("⚠️ Email resend failed, but continuing in development mode");
    }

    res.status(200).json({
      success: true,
      message: "New verification code sent to your email"
    });

  } catch (error) {
    console.error("Resend code error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to resend verification code" 
    });
  }
};

// SUPERADMIN: GET ALL ADMINS
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find()
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins
    });

  } catch (error) {
    console.error("Get all admins error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch admins" 
    });
  }
};

// SUPERADMIN: UPDATE ADMIN STATUS
export const updateAdminStatus = async (req, res) => {
  try {
    const { adminId, status } = req.body;

    if (!adminId || !status) {
      return res.status(400).json({ 
        success: false,
        message: "Admin ID and status are required" 
      });
    }

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid status value" 
      });
    }

    const admin = await Admin.findById(adminId);
    
    if (!admin) {
      return res.status(404).json({ 
        success: false,
        message: "Admin not found" 
      });
    }

    // Prevent modifying superAdmin
    if (admin.role === "superAdmin") {
      return res.status(403).json({ 
        success: false,
        message: "Cannot modify superAdmin status" 
      });
    }

    // Prevent superAdmin from rejecting themselves
    if (req.admin.id === adminId && status === "rejected") {
      return res.status(403).json({ 
        success: false,
        message: "Cannot reject your own account" 
      });
    }

    // Update status
    admin.status = status;
    admin.isActive = status === "approved";
    
    if (status === "approved") {
      admin.approvedBy = req.admin.id;
      admin.approvedAt = new Date();
    }

    await admin.save();

    // Remove sensitive data from response
    const adminResponse = admin.toObject();
    delete adminResponse.password;
    delete adminResponse.resetPasswordToken;
    delete adminResponse.resetPasswordExpire;

    res.status(200).json({
      success: true,
      message: `Admin status updated to ${status}`,
      data: adminResponse
    });

  } catch (error) {
    console.error("Update admin status error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to update admin status" 
    });
  }
};

// SUPERADMIN: UPDATE ADMIN
export const updateAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { fullName, email, role, status, isActive } = req.body;

    const admin = await Admin.findById(adminId);
    
    if (!admin) {
      return res.status(404).json({ 
        success: false,
        message: "Admin not found" 
      });
    }

    // Prevent modifying superAdmin
    if (admin.role === "superAdmin") {
      return res.status(403).json({ 
        success: false,
        message: "Cannot modify superAdmin" 
      });
    }

    // Update fields
    if (fullName) admin.fullName = fullName;
    if (email && email !== admin.email) {
      // Check if new email is already taken
      const emailExists = await Admin.findOne({ 
        email, 
        _id: { $ne: adminId } 
      });
      
      if (emailExists) {
        return res.status(400).json({ 
          success: false,
          message: "Email already in use" 
        });
      }
      admin.email = email;
    }
    if (role && role !== admin.role) {
      admin.role = role;
    }
    if (status) {
      admin.status = status;
      admin.isActive = status === "approved";
    }
    if (typeof isActive === 'boolean') {
      admin.isActive = isActive;
    }

    await admin.save();

    // Remove sensitive data
    const adminResponse = admin.toObject();
    delete adminResponse.password;
    delete adminResponse.resetPasswordToken;
    delete adminResponse.resetPasswordExpire;

    res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      data: adminResponse
    });

  } catch (error) {
    console.error("Update admin error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to update admin" 
    });
  }
};

// SUPERADMIN: DELETE ADMIN
export const deleteAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;

    const admin = await Admin.findById(adminId);
    
    if (!admin) {
      return res.status(404).json({ 
        success: false,
        message: "Admin not found" 
      });
    }

    // Prevent deleting superAdmin
    if (admin.role === "superAdmin") {
      return res.status(403).json({ 
        success: false,
        message: "Cannot delete superAdmin account" 
      });
    }

    // Prevent self-deletion
    if (req.admin.id === adminId) {
      return res.status(403).json({ 
        success: false,
        message: "Cannot delete your own account" 
      });
    }

    await Admin.findByIdAndDelete(adminId);

    res.status(200).json({
      success: true,
      message: "Admin deleted successfully"
    });

  } catch (error) {
    console.error("Delete admin error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to delete admin" 
    });
  }
};