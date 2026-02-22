import News from "../../models/News.js";

// @desc    Create news item
// @route   POST /api/admin/news
// @access  Private (Admin only)
export const createNews = async (req, res) => {
  try {
    const payload = buildNewsPayload(req.body);
    const missing = getMissingRequiredFields(payload);

    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `${missing.join(", ")} ${missing.length > 1 ? "are" : "is"} required`,
      });
    }

    const news = await News.create({
      adminId: req.admin._id,
      ...payload,
    });

    return res.status(201).json({
      success: true,
      message: "News added successfully",
      data: news,
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
      message: "Failed to create news",
      error: error.message,
    });
  }
};

// @desc    Get all news for admin
// @route   GET /api/admin/news
// @access  Private (Admin only)
export const getNewsItems = async (req, res) => {
  try {
    const {
      search = "",
      category = "all",
      year = "all",
      sortBy = "date",
      sortOrder = "desc",
    } = req.query;

    const query = { adminId: req.admin._id };

    if (category !== "all") {
      query.category = {
        $regex: `^${escapeRegex(sanitizeString(category))}$`,
        $options: "i",
      };
    }

    const normalizedYear = Number(year);
    if (year !== "all" && Number.isFinite(normalizedYear)) {
      query.year = normalizedYear;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const sortField = mapSortField(sanitizeString(sortBy).toLowerCase());
    const direction = sanitizeString(sortOrder).toLowerCase() === "asc" ? 1 : -1;

    const data = await News.find(query)
      .sort({ [sortField]: direction, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch news",
      error: error.message,
    });
  }
};

// @desc    Get one news item
// @route   GET /api/admin/news/:id
// @access  Private (Admin only)
export const getNewsItem = async (req, res) => {
  try {
    const item = await News.findOne({
      _id: req.params.id,
      adminId: req.admin._id,
    }).lean();

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "News not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch news",
      error: error.message,
    });
  }
};

// @desc    Update news item
// @route   PUT /api/admin/news/:id
// @access  Private (Admin only)
export const updateNewsItem = async (req, res) => {
  try {
    const item = await News.findOne({
      _id: req.params.id,
      adminId: req.admin._id,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "News not found",
      });
    }

    const payload = buildNewsPayload(req.body);
    const missing = getMissingRequiredFields(payload);

    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `${missing.join(", ")} ${missing.length > 1 ? "are" : "is"} required`,
      });
    }

    Object.assign(item, payload);
    await item.save();

    return res.status(200).json({
      success: true,
      message: "News updated successfully",
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
      message: "Failed to update news",
      error: error.message,
    });
  }
};

// @desc    Delete news item
// @route   DELETE /api/admin/news/:id
// @access  Private (Admin only)
export const deleteNewsItem = async (req, res) => {
  try {
    const item = await News.findOne({
      _id: req.params.id,
      adminId: req.admin._id,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "News not found",
      });
    }

    await item.deleteOne();

    return res.status(200).json({
      success: true,
      message: "News deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete news",
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
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
};

const normalizeDate = (value) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

  if (typeof value === "number") {
    const fromNumber = new Date(value);
    if (!Number.isNaN(fromNumber.getTime())) return fromNumber;
  }

  const raw = sanitizeString(value);
  if (!raw) return null;

  const directDate = new Date(raw);
  if (!Number.isNaN(directDate.getTime())) return directDate;

  const ddmmyyyy = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (ddmmyyyy) {
    const day = Number(ddmmyyyy[1]);
    const month = Number(ddmmyyyy[2]);
    const year = Number(ddmmyyyy[3]);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  const yyyymmdd = raw.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (yyyymmdd) {
    const year = Number(yyyymmdd[1]);
    const month = Number(yyyymmdd[2]);
    const day = Number(yyyymmdd[3]);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return null;
};

const normalizeYear = (value, normalizedDate) => {
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric >= 1900 && numeric <= 2100) {
    return Math.trunc(numeric);
  }

  if (normalizedDate instanceof Date && !Number.isNaN(normalizedDate.getTime())) {
    return normalizedDate.getUTCFullYear();
  }

  return null;
};

const buildNewsPayload = (body) => {
  const normalizedDate = normalizeDate(
    pickFirstValue(body, ["date", "newsDate", "publishDate", "publishedDate"])
  );

  return {
    title: sanitizeString(pickFirstValue(body, ["title", "newsTitle", "name"])),
    date: normalizedDate,
    category: sanitizeString(pickFirstValue(body, ["category", "newsCategory", "type"])),
    year: normalizeYear(pickFirstValue(body, ["year", "newsYear"]), normalizedDate),
    description: sanitizeString(
      pickFirstValue(body, ["description", "details", "content", "newsDescription"])
    ),
  };
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const mapSortField = (value) => {
  if (value === "category") return "category";
  if (value === "year") return "year";
  if (value === "title") return "title";
  if (value === "createdat") return "createdAt";
  return "date";
};

const getMissingRequiredFields = (payload) => {
  const missing = [];
  if (!payload.title) missing.push("Title");
  if (!payload.date) missing.push("Date");
  if (!payload.category) missing.push("Category");
  if (!payload.year) missing.push("Year");
  if (!payload.description) missing.push("Description");
  return missing;
};

