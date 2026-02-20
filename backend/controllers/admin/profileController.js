import Profile from "../../models/Profile.js";
import cloudinary from "../../utils/cloudinary.js";

// @desc    Get current admin profile
// @route   GET /api/admin/profile
// @access  Private (Admin only)
export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ adminId: req.admin._id }).lean();

    res.status(200).json({
      success: true,
      data: profile || null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};

// @desc    Create or update current admin profile
// @route   PUT /api/admin/profile
// @access  Private (Admin only)
export const upsertProfile = async (req, res) => {
  try {
    const {
      profileImage,
      designation,
      bio,
      location,
      education,
      experience,
      skills,
      phone,
      website,
      linkedin,
      github,
    } = req.body;

    const normalizedSkills = normalizeSkills(skills);
    const updateData = {
      profileImage: sanitizeString(profileImage),
      designation: sanitizeString(designation),
      bio: sanitizeString(bio),
      location: sanitizeString(location),
      education: sanitizeString(education),
      experience: sanitizeString(experience),
      skills: normalizedSkills,
      phone: sanitizeString(phone),
      website: normalizeOptionalUrl(website),
      linkedin: normalizeOptionalUrl(linkedin),
      github: normalizeOptionalUrl(github),
    };

    const profile = await Profile.findOneAndUpdate(
      { adminId: req.admin._id },
      { $set: updateData, $setOnInsert: { adminId: req.admin._id } },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile saved successfully",
      data: profile,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to save profile",
      error: error.message,
    });
  }
};

// @desc    Upload profile image to Cloudinary
// @route   POST /api/admin/profile/upload-image
// @access  Private (Admin only)
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
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

    // Match BlogCreate Cloudinary behavior: trim and validate env values.
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

    if (!cloudName) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary cloud name is missing or empty in .env file",
      });
    }

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary API key is missing or empty in .env file",
      });
    }

    if (!apiSecret) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary API secret is missing or empty in .env file",
      });
    }

    // Reconfigure Cloudinary per request to avoid hidden whitespace issues.
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    const profile = await Profile.findOne({ adminId: req.admin._id });

    // Upload new image
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "profiles",
      resource_type: "auto",
      timeout: 30000,
    });

    // Delete previous cloudinary image if present
    if (profile?.profileImage) {
      const oldPublicId = extractCloudinaryPublicId(profile.profileImage);
      if (oldPublicId) {
        try {
          await cloudinary.uploader.destroy(oldPublicId);
        } catch (error) {
          // Ignore delete errors to avoid blocking upload success.
        }
      }
    }

    const savedProfile = await Profile.findOneAndUpdate(
      { adminId: req.admin._id },
      {
        $set: { profileImage: result.secure_url },
        $setOnInsert: { adminId: req.admin._id },
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully",
      imageUrl: result.secure_url,
      data: savedProfile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to upload profile image: " + error.message,
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

const extractCloudinaryPublicId = (url) => {
  try {
    const matches = String(url).match(/\/upload\/(?:v\d+\/)?(.+?)\./);
    return matches?.[1] || null;
  } catch (error) {
    return null;
  }
};
