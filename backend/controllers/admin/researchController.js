import Research from "../../models/Research.js";

// @desc    Create research item
// @route   POST /api/admin/research
// @access  Private (Admin only)
export const createResearch = async (req, res) => {
  try {
    const payload = buildResearchPayload(req.body);

    const missing = getMissingRequiredFields(payload);
    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `${missing.join(", ")} ${missing.length > 1 ? "are" : "is"} required`,
      });
    }

    if (!payload.authors.length) {
      return res.status(400).json({
        success: false,
        message: "Please add at least one author",
      });
    }

    if (!payload.links.length) {
      return res.status(400).json({
        success: false,
        message: "Please add at least one paper link",
      });
    }

    const research = await Research.create({
      adminId: req.admin._id,
      ...payload,
    });

    return res.status(201).json({
      success: true,
      message: "Research added successfully",
      data: research,
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
      message: "Failed to create research",
      error: error.message,
    });
  }
};

// @desc    Get all research for admin
// @route   GET /api/admin/research
// @access  Private (Admin only)
export const getResearchItems = async (req, res) => {
  try {
    const { search = "", domain = "all", publicationType = "all" } = req.query;
    const query = { adminId: req.admin._id };

    if (domain !== "all") {
      query.domain = { $regex: `^${escapeRegex(sanitizeString(domain))}$`, $options: "i" };
    }

    if (publicationType !== "all") {
      query.publicationType = sanitizeString(publicationType).toLowerCase();
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { domain: { $regex: search, $options: "i" } },
        { authors: { $elemMatch: { $regex: search, $options: "i" } } },
        { "links.label": { $regex: search, $options: "i" } },
      ];
    }

    const data = await Research.find(query).sort({ publishDate: -1, createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch research",
      error: error.message,
    });
  }
};

// @desc    Get one research item
// @route   GET /api/admin/research/:id
// @access  Private (Admin only)
export const getResearchItem = async (req, res) => {
  try {
    const item = await Research.findOne({
      _id: req.params.id,
      adminId: req.admin._id,
    }).lean();

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Research not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch research",
      error: error.message,
    });
  }
};

// @desc    Update research item
// @route   PUT /api/admin/research/:id
// @access  Private (Admin only)
export const updateResearchItem = async (req, res) => {
  try {
    const item = await Research.findOne({
      _id: req.params.id,
      adminId: req.admin._id,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Research not found",
      });
    }

    const payload = buildResearchPayload(req.body);
    const missing = getMissingRequiredFields(payload);
    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `${missing.join(", ")} ${missing.length > 1 ? "are" : "is"} required`,
      });
    }
    if (!payload.authors.length) {
      return res.status(400).json({
        success: false,
        message: "Please add at least one author",
      });
    }
    if (!payload.links.length) {
      return res.status(400).json({
        success: false,
        message: "Please add at least one paper link",
      });
    }

    Object.assign(item, payload);
    await item.save();

    return res.status(200).json({
      success: true,
      message: "Research updated successfully",
      data: item,
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
      message: "Failed to update research",
      error: error.message,
    });
  }
};

// @desc    Delete research item
// @route   DELETE /api/admin/research/:id
// @access  Private (Admin only)
export const deleteResearchItem = async (req, res) => {
  try {
    const item = await Research.findOne({
      _id: req.params.id,
      adminId: req.admin._id,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Research not found",
      });
    }

    await item.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Research deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete research",
      error: error.message,
    });
  }
};

const sanitizeString = (value) => String(value || "").trim();

const pickFirstValue = (body, keys) => {
  for (const key of keys) {
    const value = body?.[key];
    if (value === 0) return value;
    if (value instanceof Date) return value;
    if (Array.isArray(value) && value.length) return value;
    if (typeof value === "string" && value.trim()) return value;
    if (value && typeof value === "object") return value;
  }
  return "";
};

const normalizeOptionalUrl = (value) => {
  const raw = sanitizeString(value);
  if (!raw) return "";
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
};

const normalizeAuthors = (authors) => {
  if (typeof authors === "string") {
    return sanitizeString(authors)
      .split(/[,;\n]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (Array.isArray(authors)) {
    return authors.map((item) => sanitizeString(item)).filter(Boolean);
  }

  return [];
};

const normalizeLinks = (links) => {
  let source = [];

  if (Array.isArray(links)) {
    source = links;
  } else if (typeof links === "string") {
    try {
      const parsed = JSON.parse(links);
      if (Array.isArray(parsed)) source = parsed;
    } catch (_) {
      source = [];
    }
  }

  return source
    .map((item) => ({
      label: sanitizeString(item?.label || "Paper Link"),
      url: normalizeOptionalUrl(item?.url),
    }))
    .filter((item) => item.label && item.url);
};

const normalizePublicationType = (value) => {
  const cleaned = sanitizeString(value).toLowerCase();
  return cleaned;
};

const normalizePublishDate = (value) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "number") {
    const fromNumber = new Date(value);
    if (!Number.isNaN(fromNumber.getTime())) return fromNumber;
  }

  const raw = sanitizeString(value);
  if (!raw) return null;

  const directDate = new Date(raw);
  if (!Number.isNaN(directDate.getTime())) return directDate;

  // Support DD/MM/YYYY and DD-MM-YYYY values from manual input.
  const match = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (match) {
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  // Support YYYY/MM/DD and YYYY-MM-DD values from manual input.
  const isoLikeMatch = raw.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (isoLikeMatch) {
    const year = Number(isoLikeMatch[1]);
    const month = Number(isoLikeMatch[2]);
    const day = Number(isoLikeMatch[3]);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return null;
};

const buildResearchPayload = (body) => ({
  title: sanitizeString(pickFirstValue(body, ["title", "researchTitle", "name"])),
  description: sanitizeString(
    pickFirstValue(body, ["description", "summary", "abstract", "researchDescription"])
  ),
  domain: sanitizeString(pickFirstValue(body, ["domain", "category", "researchDomain"])),
  authors: normalizeAuthors(pickFirstValue(body, ["authors", "authorNames"])),
  publishDate: normalizePublishDate(
    pickFirstValue(body, ["publishDate", "publishedDate", "publish_date", "date"])
  ),
  publicationType: normalizePublicationType(
    pickFirstValue(body, ["publicationType", "publishedIn", "publication", "published_in"])
  ),
  links: normalizeLinks(pickFirstValue(body, ["links", "paperLinks", "paper_links"])),
});

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getMissingRequiredFields = (payload) => {
  const missing = [];
  if (!payload.title) missing.push("Title");
  if (!payload.domain) missing.push("Domain");
  if (!payload.publishDate) missing.push("Publish date");
  if (!payload.publicationType) missing.push("Published in");
  return missing;
};
