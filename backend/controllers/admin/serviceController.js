import { Readable } from "stream";
import { pipeline } from "stream/promises";
import nodemailer from "nodemailer";
import Service from "../../models/Service.js";
import cloudinary from "../../utils/cloudinary.js";

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

// @desc    Upload service documents to Cloudinary
// @route   POST /api/admin/services/upload-documents
// @access  Private (Admin only)
export const uploadServiceDocuments = async (req, res) => {
  try {
    const files = req.files || [];
    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No documents uploaded",
      });
    }

    configureCloudinaryFromEnv();

    const uploadedDocuments = [];
    for (const file of files) {
      if (!isAllowedDocument(file)) {
        return res.status(400).json({
          success: false,
          message: `Unsupported file type: ${file.originalname}`,
        });
      }

      const result = await uploadBufferToCloudinary(file);
      uploadedDocuments.push({
        originalName: file.originalname,
        fileUrl: result.secure_url,
        publicId: result.public_id,
        mimeType: file.mimetype,
        size: file.size,
      });
    }

    res.status(200).json({
      success: true,
      message: "Documents uploaded successfully",
      documents: uploadedDocuments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to upload documents: " + error.message,
      error: error.message,
    });
  }
};

// @desc    Create service request
// @route   POST /api/admin/services
// @access  Private (Admin only)
export const createServiceRequest = async (req, res) => {
  try {
    const { requesterEmail, title, description, documents } = req.body;

    if (!requesterEmail || !isValidEmail(requesterEmail)) {
      return res.status(400).json({
        success: false,
        message: "Valid requester email is required",
      });
    }

    if (!Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one document is required",
      });
    }

    const cleanedDocuments = documents
      .map((doc) => ({
        originalName: String(doc.originalName || "").trim(),
        fileUrl: String(doc.fileUrl || "").trim(),
        publicId: String(doc.publicId || "").trim(),
        mimeType: String(doc.mimeType || "").trim(),
        size: Number(doc.size || 0),
      }))
      .filter((doc) => doc.originalName && doc.fileUrl && doc.publicId);

    if (cleanedDocuments.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Uploaded document metadata is invalid",
      });
    }

    const service = await Service.create({
      adminId: req.admin._id,
      requesterEmail: requesterEmail.trim().toLowerCase(),
      title: String(title || "").trim(),
      description: String(description || "").trim(),
      documents: cleanedDocuments,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Service request created successfully",
      data: service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create service request",
      error: error.message,
    });
  }
};

// @desc    Get all service requests for admin
// @route   GET /api/admin/services
// @access  Private (Admin only)
export const getServiceRequests = async (req, res) => {
  try {
    const { status = "all", search = "" } = req.query;

    const query = { adminId: req.admin._id };
    if (status !== "all") query.status = status;
    if (search) {
      query.$or = [
        { requesterEmail: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const services = await Service.find(query).sort({ createdAt: -1 }).lean();

    res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch services",
      error: error.message,
    });
  }
};

// @desc    Get single service request
// @route   GET /api/admin/services/:id
// @access  Private (Admin only)
export const getServiceRequest = async (req, res) => {
  try {
    const service = await Service.findOne({
      _id: req.params.id,
      adminId: req.admin._id,
    }).lean();

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service request not found",
      });
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch service request",
      error: error.message,
    });
  }
};

// @desc    Stream one service document for inline preview
// @route   GET /api/admin/services/:id/documents/:documentId/file
// @access  Private (Admin only)
export const getServiceDocumentFile = async (req, res) => {
  try {
    const { document } = await getServiceDocumentContext(req.admin._id, req.params.id, req.params.documentId);
    return await streamDocumentToResponse(document, res, "inline");
  } catch (error) {
    return res.status(error?.statusCode || 500).json({
      success: false,
      message: error?.message || "Failed to stream document file",
      error: error.message,
    });
  }
};

// @desc    Download one service document with original filename
// @route   GET /api/admin/services/:id/documents/:documentId/download
// @access  Private (Admin only)
export const downloadServiceDocumentFile = async (req, res) => {
  try {
    const { document } = await getServiceDocumentContext(req.admin._id, req.params.id, req.params.documentId);
    return await streamDocumentToResponse(document, res, "attachment");
  } catch (error) {
    return res.status(error?.statusCode || 500).json({
      success: false,
      message: error?.message || "Failed to download document file",
      error: error.message,
    });
  }
};

// @desc    Review documents and send feedback email
// @route   POST /api/admin/services/:id/review
// @access  Private (Admin only)
export const reviewServiceRequest = async (req, res) => {
  try {
    const { documentReviews, emailMessage = "" } = req.body;

    if (!Array.isArray(documentReviews) || documentReviews.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Document reviews are required",
      });
    }

    const service = await Service.findOne({
      _id: req.params.id,
      adminId: req.admin._id,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service request not found",
      });
    }

    let updatedCount = 0;
    const normalizedStatuses = new Set(["pending", "reviewed", "needs-update"]);

    for (const incoming of documentReviews) {
      const documentId = String(incoming.documentId || "");
      const document = service.documents.id(documentId);
      if (!document) continue;

      const nextStatus = normalizedStatuses.has(incoming.reviewStatus)
        ? incoming.reviewStatus
        : document.reviewStatus;

      document.review = String(incoming.review || "").trim();
      document.suggestion = String(incoming.suggestion || "").trim();
      document.reviewStatus = nextStatus;
      document.reviewedAt = new Date();
      updatedCount += 1;
    }

    if (updatedCount === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid document reviews found",
      });
    }

    const allReviewed = service.documents.every((doc) => doc.reviewStatus !== "pending");
    service.status = allReviewed ? "reviewed" : "in-review";
    service.reviewSentAt = new Date();
    await service.save();

    const emailResult = await sendServiceReviewEmail({
      to: service.requesterEmail,
      service,
      reviewerName: req.admin.fullName || req.admin.name || "Admin Reviewer",
      reviewerEmail: req.admin.email,
      emailMessage: String(emailMessage || "").trim(),
    });

    res.status(200).json({
      success: true,
      message: emailResult
        ? "Review saved and sent to requester email"
        : "Review saved, but email could not be sent",
      emailSent: emailResult,
      data: service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to review service request",
      error: error.message,
    });
  }
};

// @desc    Delete one service request
// @route   DELETE /api/admin/services/:id
// @access  Private (Admin only)
export const deleteServiceRequest = async (req, res) => {
  try {
    const service = await Service.findOne({
      _id: req.params.id,
      adminId: req.admin._id,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service request not found",
      });
    }

    configureCloudinaryFromEnv();
    await Promise.all(
      service.documents.map((doc) => deleteCloudinaryDocument(doc.publicId))
    );

    await service.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Service request deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete service request",
      error: error.message,
    });
  }
};

// @desc    Bulk delete service requests
// @route   POST /api/admin/services/bulk-delete
// @access  Private (Admin only)
export const bulkDeleteServiceRequests = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide service request IDs",
      });
    }

    const services = await Service.find({
      _id: { $in: ids },
      adminId: req.admin._id,
    });

    configureCloudinaryFromEnv();
    const publicIds = services.flatMap((service) =>
      (service.documents || []).map((doc) => doc.publicId).filter(Boolean)
    );

    await Promise.all(publicIds.map((publicId) => deleteCloudinaryDocument(publicId)));

    const result = await Service.deleteMany({
      _id: { $in: ids },
      adminId: req.admin._id,
    });

    return res.status(200).json({
      success: true,
      message: `${result.deletedCount} service request(s) deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to bulk delete service requests",
      error: error.message,
    });
  }
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());

const isAllowedDocument = (file) => {
  if (!file) return false;
  if (allowedMimeTypes.has(file.mimetype)) return true;
  const lower = String(file.originalname || "").toLowerCase();
  return (
    lower.endsWith(".pdf") ||
    lower.endsWith(".doc") ||
    lower.endsWith(".docx") ||
    lower.endsWith(".txt") ||
    lower.endsWith(".ppt") ||
    lower.endsWith(".pptx") ||
    lower.endsWith(".xls") ||
    lower.endsWith(".xlsx")
  );
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

const uploadBufferToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "service-documents",
        resource_type: "raw",
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );

    Readable.from(file.buffer).pipe(stream);
  });

const deleteCloudinaryDocument = async (publicId) => {
  if (!publicId) return;

  // Try raw first (most likely for docs), then image as fallback.
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
    return;
  } catch (error) {
    // continue to fallback
  }

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (error) {
    // swallow cleanup errors
  }
};

const sendServiceReviewEmail = async ({
  to,
  service,
  reviewerName,
  reviewerEmail,
  emailMessage,
}) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return false;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const docsHtml = service.documents
      .map(
        (doc, idx) => `
          <div style="padding:12px;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:10px;">
            <p style="margin:0 0 6px 0;"><strong>${idx + 1}. ${doc.originalName}</strong></p>
            <p style="margin:0 0 4px 0;"><strong>Status:</strong> ${doc.reviewStatus}</p>
            <p style="margin:0 0 4px 0;"><strong>Review:</strong> ${doc.review || "No comments yet."}</p>
            <p style="margin:0;"><strong>Suggestion:</strong> ${doc.suggestion || "No suggestions yet."}</p>
            <p style="margin:8px 0 0 0;"><a href="${doc.fileUrl}" target="_blank" rel="noreferrer">Open Document</a></p>
          </div>
        `
      )
      .join("");

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
        <div style="background:#0f172a;color:white;padding:18px 20px;border-radius:12px 12px 0 0;">
          <h2 style="margin:0;">IdeaXLab Service Review</h2>
          <p style="margin:8px 0 0 0;opacity:0.9;">Your submitted documents were reviewed.</p>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:0;padding:20px;border-radius:0 0 12px 12px;">
          <p><strong>Service Title:</strong> ${service.title || "Document Review Request"}</p>
          ${
            emailMessage
              ? `<div style="background:#f8fafc;border-left:4px solid #3b82f6;padding:12px;margin:12px 0;">
                    <p style="margin:0;"><strong>Additional Message:</strong></p>
                    <p style="margin:6px 0 0 0;">${emailMessage}</p>
                 </div>`
              : ""
          }
          <h3 style="margin:18px 0 10px;">Document Feedback</h3>
          ${docsHtml}
          <p style="margin-top:18px;">
            Reviewed by: <strong>${reviewerName}</strong><br/>
            Contact: ${reviewerEmail}
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"IdeaXLab Services" <${process.env.EMAIL_USER}>`,
      to,
      cc: reviewerEmail,
      subject: `Service Review Update - ${service.title || "Document Review"}`,
      html,
      replyTo: reviewerEmail,
    });

    return true;
  } catch (error) {
    return false;
  }
};

const getServiceDocumentContext = async (adminId, serviceId, documentId) => {
  const service = await Service.findOne({
    _id: serviceId,
    adminId,
  });

  if (!service) {
    const error = new Error("Service request not found");
    error.statusCode = 404;
    throw error;
  }

  const document = service.documents.id(documentId);
  if (!document) {
    const error = new Error("Document not found");
    error.statusCode = 404;
    throw error;
  }

  return { service, document };
};

const streamDocumentToResponse = async (document, res, dispositionMode = "inline") => {
  configureCloudinaryFromEnv();
  const { response: remoteResponse } = await fetchDocumentFromStorage(document);

  const contentType =
    document.mimeType ||
    remoteResponse.headers.get("content-type") ||
    "application/octet-stream";

  const safeName = encodeURIComponent(document.originalName || "document");
  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `${dispositionMode}; filename*=UTF-8''${safeName}`);
  res.setHeader("Cache-Control", "private, max-age=600");
  res.setHeader("X-Content-Type-Options", "nosniff");

  const nodeReadable = Readable.fromWeb(remoteResponse.body);
  await pipeline(nodeReadable, res);
};

const normalizeRemoteUrl = (url) => {
  const raw = String(url || "").trim();
  if (!raw) return raw;
  try {
    return new URL(raw).toString();
  } catch (error) {
    return encodeURI(raw);
  }
};

const fetchDocumentFromStorage = async (document) => {
  const candidates = buildStorageCandidates(document);
  const errors = [];

  for (const candidate of candidates) {
    if (!candidate) continue;

    try {
      const response = await fetch(candidate, { redirect: "follow" });
      if (response.ok && response.body) {
        return { response, url: candidate };
      }
      errors.push(`${candidate} -> ${response.status}`);
    } catch (error) {
      errors.push(`${candidate} -> ${error.message}`);
    }
  }

  const error = new Error(
    `Failed to fetch document file from storage. Tried: ${errors.join(" | ")}`
  );
  error.statusCode = 400;
  throw error;
};

const getPublicIdParts = (document) => {
  const rawPublicId = String(document?.publicId || "").trim();
  const originalName = String(document?.originalName || "").trim();
  const mimeType = String(document?.mimeType || "").trim().toLowerCase();

  const originalExt = originalName.includes(".")
    ? originalName.split(".").pop()?.toLowerCase()
    : "";

  const publicIdExt = rawPublicId.includes(".")
    ? rawPublicId.split(".").pop()?.toLowerCase()
    : "";

  const mimeExtMap = {
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "text/plain": "txt",
    "application/vnd.ms-powerpoint": "ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
    "application/vnd.ms-excel": "xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  };
  const mimeExt = mimeExtMap[mimeType] || "";

  const basePublicId =
    publicIdExt && rawPublicId.endsWith(`.${publicIdExt}`)
      ? rawPublicId.slice(0, -(publicIdExt.length + 1))
      : rawPublicId;

  return {
    rawPublicId,
    basePublicId: basePublicId || rawPublicId,
    extension: originalExt || publicIdExt || mimeExt || "",
  };
};

const extractCloudinaryVersion = (url) => {
  const normalized = normalizeRemoteUrl(url);
  if (!normalized) return undefined;
  try {
    const pathname = new URL(normalized).pathname;
    const segments = pathname.split("/").filter(Boolean);
    const versionSegment = segments.find((seg) => /^v\d+$/.test(seg));
    if (!versionSegment) return undefined;
    return Number(versionSegment.slice(1));
  } catch (error) {
    return undefined;
  }
};

const buildSignedCloudinaryCandidates = ({ basePublicId, extension, version }) => {
  if (!basePublicId) return [];

  const signed = [];
  const addUrl = (builder) => {
    try {
      const url = builder();
      if (url) signed.push(url);
    } catch (error) {
      // Ignore a single candidate failure; others may still work.
    }
  };

  // Signed delivery URLs for strict/protected Cloudinary accounts.
  for (const resourceType of ["raw", "image"]) {
    for (const deliveryType of ["upload", "authenticated", "private"]) {
      addUrl(() =>
        cloudinary.url(basePublicId, {
          secure: true,
          sign_url: true,
          resource_type: resourceType,
          type: deliveryType,
          ...(version ? { version } : {}),
          ...(extension ? { format: extension } : {}),
        })
      );
    }
  }

  // Time-limited private download URLs (works well for protected originals).
  if (extension) {
    const expiresAt = Math.floor(Date.now() / 1000) + 60 * 10;
    for (const resourceType of ["raw", "image"]) {
      addUrl(() =>
        cloudinary.utils.private_download_url(basePublicId, extension, {
          resource_type: resourceType,
          type: "upload",
          expires_at: expiresAt,
        })
      );
    }
  }

  return signed;
};

const buildStorageCandidates = (document) => {
  const directUrl = normalizeRemoteUrl(document.fileUrl);
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const { rawPublicId, basePublicId, extension } = getPublicIdParts(document);
  const version = extractCloudinaryVersion(directUrl);

  if (!cloudName || !basePublicId) {
    return [directUrl].filter(Boolean);
  }

  const encodedPublicId = basePublicId
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  // Try multiple Cloudinary variants because uploaded docs can be stored as raw or image(pdf).
  const rawUrl = `https://res.cloudinary.com/${cloudName}/raw/upload/${encodedPublicId}`;
  const imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${encodedPublicId}`;
  const rawWithExt = extension
    ? `https://res.cloudinary.com/${cloudName}/raw/upload/${encodedPublicId}.${extension}`
    : "";
  const imageWithExt = extension
    ? `https://res.cloudinary.com/${cloudName}/image/upload/${encodedPublicId}.${extension}`
    : "";

  const signedCandidates = buildSignedCloudinaryCandidates({
    basePublicId,
    extension,
    version,
  });

  return [
    directUrl,
    rawPublicId ? normalizeRemoteUrl(cloudinary.url(rawPublicId, { secure: true, resource_type: "raw", type: "upload" })) : "",
    rawPublicId ? normalizeRemoteUrl(cloudinary.url(rawPublicId, { secure: true, resource_type: "image", type: "upload" })) : "",
    rawUrl,
    rawWithExt,
    imageUrl,
    imageWithExt,
    ...signedCandidates,
  ].filter(Boolean);
};
