import Employee from "../../models/Employee.js";
import cloudinary from "../../utils/cloudinary.js";

// @desc    Upload employee image to Cloudinary
// @route   POST /api/admin/employees/upload-image
// @access  Private (Admin only)
export const uploadEmployeeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        success: false,
        message: "Only image files are allowed",
      });
    }

    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB.",
      });
    }

    configureCloudinaryFromEnv();

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "employees",
      resource_type: "auto",
      timeout: 30000,
    });

    const oldPublicId = sanitizeString(req.body?.oldPublicId);
    if (oldPublicId && oldPublicId !== result.public_id) {
      await deleteCloudinaryImage(oldPublicId);
    }

    return res.status(200).json({
      success: true,
      message: "Employee image uploaded successfully",
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to upload employee image: " + error.message,
      error: error.message,
    });
  }
};

// @desc    Create employee
// @route   POST /api/admin/employees
// @access  Private (Admin only)
export const createEmployee = async (req, res) => {
  try {
    const payload = buildEmployeePayload(req.body);

    if (!payload.fullName || !payload.email || !payload.designation) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and designation are required",
      });
    }

    const duplicateEmail = await Employee.findOne({
      adminId: req.admin._id,
      email: payload.email,
    });
    if (duplicateEmail) {
      return res.status(409).json({
        success: false,
        message: "An employee with this email already exists",
      });
    }

    if (payload.employeeCode) {
      const duplicateCode = await Employee.findOne({
        adminId: req.admin._id,
        employeeCode: payload.employeeCode,
      });
      if (duplicateCode) {
        return res.status(409).json({
          success: false,
          message: "An employee with this employee code already exists",
        });
      }
    }

    const employee = await Employee.create({
      adminId: req.admin._id,
      ...payload,
    });

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employee,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create employee",
      error: error.message,
    });
  }
};

// @desc    Get all employees for admin
// @route   GET /api/admin/employees
// @access  Private (Admin only)
export const getEmployees = async (req, res) => {
  try {
    const { search = "", status = "all", department = "all", category = "all" } = req.query;

    const query = { adminId: req.admin._id };

    if (status !== "all") {
      query.status = status;
    }

    if (department !== "all") {
      query.department = department;
    }

    if (category !== "all") {
      const normalizedCategory = normalizeCategory(category);
      if (normalizedCategory === "research-team") {
        query.$or = [
          { category: "research-team" },
          { category: { $exists: false } },
          { category: null },
          { category: "" },
        ];
      } else {
        query.category = normalizedCategory;
      }
    }

    if (search) {
      const searchConditions = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { designation: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { employeeCode: { $regex: search, $options: "i" } },
      ];
      query.$and = query.$and || [];
      query.$and.push({ $or: searchConditions });
    }

    const employees = await Employee.find(query).sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      data: employees,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch employees",
      error: error.message,
    });
  }
};

// @desc    Get one employee
// @route   GET /api/admin/employees/:id
// @access  Private (Admin only)
export const getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      _id: req.params.id,
      adminId: req.admin._id,
    }).lean();

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch employee",
      error: error.message,
    });
  }
};

// @desc    Update employee
// @route   PUT /api/admin/employees/:id
// @access  Private (Admin only)
export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      _id: req.params.id,
      adminId: req.admin._id,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const payload = buildEmployeePayload(req.body);

    if (!payload.fullName || !payload.email || !payload.designation) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and designation are required",
      });
    }

    if (payload.email !== employee.email) {
      const duplicateEmail = await Employee.findOne({
        _id: { $ne: employee._id },
        adminId: req.admin._id,
        email: payload.email,
      });
      if (duplicateEmail) {
        return res.status(409).json({
          success: false,
          message: "An employee with this email already exists",
        });
      }
    }

    if (payload.employeeCode && payload.employeeCode !== employee.employeeCode) {
      const duplicateCode = await Employee.findOne({
        _id: { $ne: employee._id },
        adminId: req.admin._id,
        employeeCode: payload.employeeCode,
      });
      if (duplicateCode) {
        return res.status(409).json({
          success: false,
          message: "An employee with this employee code already exists",
        });
      }
    }

    const previousPublicId = employee.profileImagePublicId;
    Object.assign(employee, payload);
    await employee.save();

    if (previousPublicId && previousPublicId !== employee.profileImagePublicId) {
      await deleteCloudinaryImage(previousPublicId);
    }

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: employee,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update employee",
      error: error.message,
    });
  }
};

// @desc    Delete employee
// @route   DELETE /api/admin/employees/:id
// @access  Private (Admin only)
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      _id: req.params.id,
      adminId: req.admin._id,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    if (employee.profileImagePublicId) {
      await deleteCloudinaryImage(employee.profileImagePublicId);
    }

    await employee.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete employee",
      error: error.message,
    });
  }
};

const sanitizeString = (value) => String(value || "").trim();

const normalizeSkills = (skills) => {
  if (!skills) return [];
  const parsed = Array.isArray(skills)
    ? skills
    : String(skills)
        .split(",")
        .map((item) => item.trim());

  return parsed.filter(Boolean);
};

const normalizeOptionalUrl = (value) => {
  const raw = sanitizeString(value);
  if (!raw) return "";
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
};

const normalizeDate = (value) => {
  const raw = sanitizeString(value);
  if (!raw) return null;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const normalizeYears = (value) => {
  const numeric = Number(value);
  if (Number.isNaN(numeric) || numeric < 0) return 0;
  if (numeric > 80) return 80;
  return numeric;
};

const normalizeCategory = (value) => {
  const cleaned = sanitizeString(value).toLowerCase();
  if (cleaned === "innovation team") return "innovation-team";
  if (cleaned === "research team") return "research-team";
  if (cleaned === "development team") return "development-team";
  if (["innovation-team", "research-team", "development-team"].includes(cleaned)) {
    return cleaned;
  }
  return "research-team";
};

const buildEmployeePayload = (body) => {
  const code = sanitizeString(body.employeeCode);

  return {
    fullName: sanitizeString(body.fullName),
    email: sanitizeString(body.email).toLowerCase(),
    phone: sanitizeString(body.phone),
    profileImage: sanitizeString(body.profileImage),
    profileImagePublicId: sanitizeString(body.profileImagePublicId),
    designation: sanitizeString(body.designation),
    category: normalizeCategory(body.category),
    department: sanitizeString(body.department),
    employeeCode: code || undefined,
    employmentType: sanitizeString(body.employmentType) || "full-time",
    status: sanitizeString(body.status) || "active",
    location: sanitizeString(body.location),
    education: sanitizeString(body.education),
    experience: sanitizeString(body.experience),
    yearsOfExperience: normalizeYears(body.yearsOfExperience),
    skills: normalizeSkills(body.skills),
    specialization: sanitizeString(body.specialization),
    researchInterests: sanitizeString(body.researchInterests),
    bio: sanitizeString(body.bio),
    achievements: sanitizeString(body.achievements),
    joinDate: normalizeDate(body.joinDate),
    linkedin: normalizeOptionalUrl(body.linkedin),
    github: normalizeOptionalUrl(body.github),
    website: normalizeOptionalUrl(body.website),
    otherLink: normalizeOptionalUrl(body.otherLink),
  };
};

const configureCloudinaryFromEnv = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are missing or empty in .env");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
};

const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) return;
  try {
    configureCloudinaryFromEnv();
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (error) {
    // Ignore cloud cleanup failures to avoid blocking main action.
  }
};
