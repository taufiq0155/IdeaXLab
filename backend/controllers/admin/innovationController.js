import Innovation from "../../models/Innovation.js";

// @desc    Create innovation
// @route   POST /api/admin/innovations
// @access  Private (Admin only)
export const createInnovation = async (req, res) => {
  try {
    const payload = buildInnovationPayload(req.body);

    if (
      !payload.innovationTitle ||
      !payload.problemStatement ||
      !payload.proposedIotSolution
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Innovation title, problem statement, and proposed IoT solution are required",
      });
    }

    const innovation = await Innovation.create({
      adminId: req.admin._id,
      ...payload,
    });

    return res.status(201).json({
      success: true,
      message: "Innovation created successfully",
      data: innovation,
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
      message: "Failed to create innovation",
      error: error.message,
    });
  }
};

// @desc    Get all innovations for admin
// @route   GET /api/admin/innovations
// @access  Private (Admin only)
export const getInnovations = async (req, res) => {
  try {
    const { search = "", developmentStatus = "all" } = req.query;
    const query = { adminId: req.admin._id };

    if (developmentStatus !== "all") {
      query.developmentStatus = normalizeDevelopmentStatus(developmentStatus);
    }

    if (search) {
      query.$or = [
        { innovationTitle: { $regex: search, $options: "i" } },
        { problemStatement: { $regex: search, $options: "i" } },
        { proposedIotSolution: { $regex: search, $options: "i" } },
        { "technologiesUsed.sensors": { $regex: search, $options: "i" } },
        {
          "technologiesUsed.microcontroller": { $regex: search, $options: "i" },
        },
        { "technologiesUsed.communication": { $regex: search, $options: "i" } },
        { "links.label": { $regex: search, $options: "i" } },
      ];
    }

    const innovations = await Innovation.find(query).sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      data: innovations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch innovations",
      error: error.message,
    });
  }
};

// @desc    Get one innovation
// @route   GET /api/admin/innovations/:id
// @access  Private (Admin only)
export const getInnovation = async (req, res) => {
  try {
    const innovation = await Innovation.findOne({
      _id: req.params.id,
      adminId: req.admin._id,
    }).lean();

    if (!innovation) {
      return res.status(404).json({
        success: false,
        message: "Innovation not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: innovation,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch innovation",
      error: error.message,
    });
  }
};

// @desc    Update innovation
// @route   PUT /api/admin/innovations/:id
// @access  Private (Admin only)
export const updateInnovation = async (req, res) => {
  try {
    const innovation = await Innovation.findOne({
      _id: req.params.id,
      adminId: req.admin._id,
    });

    if (!innovation) {
      return res.status(404).json({
        success: false,
        message: "Innovation not found",
      });
    }

    const payload = buildInnovationPayload(req.body);
    if (
      !payload.innovationTitle ||
      !payload.problemStatement ||
      !payload.proposedIotSolution
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Innovation title, problem statement, and proposed IoT solution are required",
      });
    }

    Object.assign(innovation, payload);
    await innovation.save();

    return res.status(200).json({
      success: true,
      message: "Innovation updated successfully",
      data: innovation,
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
      message: "Failed to update innovation",
      error: error.message,
    });
  }
};

// @desc    Delete innovation
// @route   DELETE /api/admin/innovations/:id
// @access  Private (Admin only)
export const deleteInnovation = async (req, res) => {
  try {
    const innovation = await Innovation.findOne({
      _id: req.params.id,
      adminId: req.admin._id,
    });

    if (!innovation) {
      return res.status(404).json({
        success: false,
        message: "Innovation not found",
      });
    }

    await innovation.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Innovation deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete innovation",
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

const normalizeLinks = (links) => {
  const source = Array.isArray(links) ? links : [];
  return source
    .map((item) => ({
      label: sanitizeString(item?.label || "Innovation Link"),
      url: normalizeOptionalUrl(item?.url),
    }))
    .filter((item) => item.label && item.url);
};

const normalizeDevelopmentStatus = (value) => {
  const cleaned = sanitizeString(value).toLowerCase();
  if (
    [
      "idea",
      "concept-validation",
      "prototype-development",
      "pilot-testing",
      "deployed",
    ].includes(cleaned)
  ) {
    return cleaned;
  }
  return "idea";
};

const buildInnovationPayload = (body) => ({
  innovationTitle: sanitizeString(body.innovationTitle),
  problemStatement: sanitizeString(body.problemStatement),
  proposedIotSolution: sanitizeString(body.proposedIotSolution),
  technologiesUsed: {
    sensors: sanitizeString(body.technologiesUsed?.sensors),
    microcontroller: sanitizeString(body.technologiesUsed?.microcontroller),
    communication: sanitizeString(body.technologiesUsed?.communication),
  },
  developmentStatus: normalizeDevelopmentStatus(body.developmentStatus),
  links: normalizeLinks(body.links),
});

