import { Readable } from "stream";
import Project from "../../models/Project.js";
import cloudinary from "../../utils/cloudinary.js";

// @desc    Upload project images to Cloudinary
// @route   POST /api/admin/projects/upload-images
// @access  Private (Admin only)
export const uploadProjectImages = async (req, res) => {
  try {
    const files = req.files || [];
    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images uploaded",
      });
    }

    configureCloudinaryFromEnv();

    const uploadedImages = [];
    for (const file of files) {
      if (!file.mimetype.startsWith("image/")) {
        return res.status(400).json({
          success: false,
          message: `Only image files are allowed: ${file.originalname}`,
        });
      }

      const result = await uploadBufferToCloudinary(file);
      uploadedImages.push({
        imageUrl: result.secure_url,
        publicId: result.public_id,
        altText: "",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project images uploaded successfully",
      images: uploadedImages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to upload project images: " + error.message,
      error: error.message,
    });
  }
};

// @desc    Create project
// @route   POST /api/admin/projects
// @access  Private (Admin only)
export const createProject = async (req, res) => {
  try {
    const payload = buildProjectPayload(req.body);

    if (!payload.title || !payload.description) {
      return res.status(400).json({
        success: false,
        message: "Project title and description are required",
      });
    }

    if (!payload.images.length) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one project image",
      });
    }

    const project = await Project.create({
      adminId: req.admin._id,
      ...payload,
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
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
      message: "Failed to create project",
      error: error.message,
    });
  }
};

// @desc    Get all projects for admin
// @route   GET /api/admin/projects
// @access  Private (Admin only)
export const getProjects = async (req, res) => {
  try {
    const { search = "", status = "all" } = req.query;
    const query = { adminId: req.admin._id };

    if (status !== "all") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "links.label": { $regex: search, $options: "i" } },
      ];
    }

    const projects = await Project.find(query).sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
      error: error.message,
    });
  }
};

// @desc    Get one project
// @route   GET /api/admin/projects/:id
// @access  Private (Admin only)
export const getProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      adminId: req.admin._id,
    }).lean();

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch project",
      error: error.message,
    });
  }
};

// @desc    Update project
// @route   PUT /api/admin/projects/:id
// @access  Private (Admin only)
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      adminId: req.admin._id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const payload = buildProjectPayload(req.body);
    if (!payload.title || !payload.description) {
      return res.status(400).json({
        success: false,
        message: "Project title and description are required",
      });
    }

    if (!payload.images.length) {
      return res.status(400).json({
        success: false,
        message: "Please keep at least one project image",
      });
    }

    const previousImageIds = new Set(
      (project.images || []).map((item) => String(item.publicId || "").trim()).filter(Boolean)
    );
    const nextImageIds = new Set(
      payload.images.map((item) => String(item.publicId || "").trim()).filter(Boolean)
    );

    Object.assign(project, payload);
    await project.save();

    const removedPublicIds = [...previousImageIds].filter((id) => !nextImageIds.has(id));
    if (removedPublicIds.length) {
      await Promise.all(removedPublicIds.map((id) => deleteCloudinaryImage(id)));
    }

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project,
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
      message: "Failed to update project",
      error: error.message,
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/admin/projects/:id
// @access  Private (Admin only)
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      adminId: req.admin._id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    await Promise.all((project.images || []).map((item) => deleteCloudinaryImage(item.publicId)));
    await project.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete project",
      error: error.message,
    });
  }
};

const sanitizeString = (value) => String(value || "").trim();

const normalizeOptionalUrl = (value) => {
  const raw = sanitizeString(value);
  if (!raw) return "";
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
};

const normalizeImages = (images) => {
  const source = Array.isArray(images) ? images : [];
  return source
    .map((item) => ({
      imageUrl: sanitizeString(item?.imageUrl),
      publicId: sanitizeString(item?.publicId),
      altText: sanitizeString(item?.altText),
    }))
    .filter((item) => item.imageUrl && item.publicId);
};

const normalizeLinks = (links) => {
  const source = Array.isArray(links) ? links : [];
  return source
    .map((item) => ({
      label: sanitizeString(item?.label || "Project Link"),
      url: normalizeOptionalUrl(item?.url),
    }))
    .filter((item) => item.label && item.url);
};

const buildProjectPayload = (body) => ({
  title: sanitizeString(body.title),
  description: sanitizeString(body.description),
  images: normalizeImages(body.images),
  links: normalizeLinks(body.links),
  status: sanitizeString(body.status) === "draft" ? "draft" : "published",
});

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

const uploadBufferToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "projects",
        resource_type: "image",
        timeout: 30000,
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );

    Readable.from(file.buffer).pipe(stream);
  });

const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) return;
  try {
    configureCloudinaryFromEnv();
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (error) {
    // Ignore cloud cleanup failure.
  }
};
