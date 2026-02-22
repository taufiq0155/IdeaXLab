import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import { useLocation } from "react-router-dom";
import {
  FiSearch,
  FiFilter,
  FiFileText,
  FiMail,
  FiClock,
  FiSend,
  FiExternalLink,
  FiCheckCircle,
  FiTrash2,
  FiEye,
  FiDownload,
  FiCheckSquare,
  FiSquare,
} from "react-icons/fi";
import AnimatedCanvas from "../../../components/animations/animatedCanvas";
import GlassCard from "../../../components/ui/GlassCard";

const ViewService = () => {
  const location = useLocation();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState(null);
  const [emailMessage, setEmailMessage] = useState("");
  const [reviewForm, setReviewForm] = useState({});
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewMimeType, setPreviewMimeType] = useState("");
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const previewUrlRef = useRef("");
  const preselectServiceId = new URLSearchParams(location.search).get("serviceId") || "";

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesStatus = statusFilter === "all" || service.status === statusFilter;
      const needle = searchTerm.toLowerCase();
      const matchesSearch =
        !needle ||
        service.requesterEmail?.toLowerCase().includes(needle) ||
        service.title?.toLowerCase().includes(needle) ||
        service.description?.toLowerCase().includes(needle);
      return matchesStatus && matchesSearch;
    });
  }, [services, statusFilter, searchTerm]);

  const getToken = () => localStorage.getItem("adminToken");

  const revokePreviewUrl = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
    }
  };

  const applySelectedServiceState = (service) => {
    setSelectedService(service);

    const firstDoc = service.documents?.[0] || null;
    setSelectedPreviewDoc(firstDoc);

    const next = {};
    (service.documents || []).forEach((doc) => {
      next[doc._id] = {
        review: doc.review || "",
        suggestion: doc.suggestion || "",
        reviewStatus: doc.reviewStatus || "pending",
      };
    });
    setReviewForm(next);
    setEmailMessage("");

    if (firstDoc) {
      loadDocumentPreview(service._id, firstDoc);
    } else {
      revokePreviewUrl();
      setPreviewUrl("");
      setPreviewMimeType("");
    }
  };

  const fetchServices = async (preserveSelection = true) => {
    const token = getToken();
    if (!token) {
      toast.error("Please log in");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:5000/api/admin/services?status=all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Invalid response from server");
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch services");
      }

      const nextServices = data.data || [];
      setServices(nextServices);

      if (!preserveSelection) {
        setSelectedServiceIds([]);
      }

      if (nextServices.length === 0) {
        setSelectedService(null);
        setSelectedPreviewDoc(null);
        setReviewForm({});
        setPreviewUrl("");
        setPreviewMimeType("");
        revokePreviewUrl();
        return;
      }

      const currentId = selectedService?._id;
      const candidateId = preselectServiceId && nextServices.some((item) => item._id === preselectServiceId)
        ? preselectServiceId
        : currentId && nextServices.some((item) => item._id === currentId)
        ? currentId
        : nextServices[0]._id;

      await handleSelectService(candidateId);
    } catch (error) {
      toast.error(error.message || "Failed to fetch services");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    return () => {
      revokePreviewUrl();
    };
  }, [preselectServiceId]);

  const loadDocumentPreview = async (serviceId, document) => {
    if (!serviceId || !document?._id) return;

    const token = getToken();
    if (!token) return;

    try {
      setIsPreviewLoading(true);
      revokePreviewUrl();
      setPreviewUrl("");
      setPreviewMimeType("");

      const response = await fetch(
        `http://localhost:5000/api/admin/services/${serviceId}/documents/${document._id}/file`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          throw new Error(data.message || "Failed to preview document");
        }
        throw new Error("Failed to preview document");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      previewUrlRef.current = objectUrl;
      setPreviewUrl(objectUrl);
      setPreviewMimeType(blob.type || document.mimeType || "");
    } catch (error) {
      toast.error(error.message || "Failed to preview document");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const openDocumentInNewTab = async (serviceId, document) => {
    if (!serviceId || !document?._id) return;
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/services/${serviceId}/documents/${document._id}/file`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          throw new Error(data.message || "Failed to open document");
        }
        throw new Error("Failed to open document");
      }

      const blob = await response.blob();
      const tempUrl = URL.createObjectURL(blob);
      window.open(tempUrl, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(tempUrl), 120000);
    } catch (error) {
      toast.error(error.message || "Failed to open document");
    }
  };

  const downloadDocumentToPC = async (serviceId, docItem) => {
    if (!serviceId || !docItem?._id) return;
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/services/${serviceId}/documents/${docItem._id}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          throw new Error(data.message || "Failed to download document");
        }
        throw new Error("Failed to download document");
      }

      const blob = await response.blob();
      const tempUrl = URL.createObjectURL(blob);
      const anchor = window.document.createElement("a");
      anchor.href = tempUrl;
      anchor.download = docItem.originalName || "document";
      window.document.body.appendChild(anchor);
      anchor.click();
      window.document.body.removeChild(anchor);
      URL.revokeObjectURL(tempUrl);
    } catch (error) {
      toast.error(error.message || "Failed to download document");
    }
  };

  const handleSelectService = async (serviceOrId) => {
    const serviceId = typeof serviceOrId === "string" ? serviceOrId : serviceOrId?._id;
    if (!serviceId) return;

    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/services/${serviceId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Invalid service details response");
      }

      const data = await response.json();
      if (!response.ok || !data.success || !data.data) {
        throw new Error(data.message || "Failed to load full service details");
      }

      applySelectedServiceState(data.data);
    } catch (error) {
      toast.error(error.message || "Failed to load service details");
      if (typeof serviceOrId === "object" && serviceOrId) {
        applySelectedServiceState(serviceOrId);
      }
    }
  };

  const handleReviewChange = (docId, field, value) => {
    setReviewForm((prev) => ({
      ...prev,
      [docId]: {
        ...(prev[docId] || {}),
        [field]: value,
      },
    }));
  };

  const handleSendReview = async () => {
    if (!selectedService) return;

    const documentReviews = (selectedService.documents || []).map((doc) => ({
      documentId: doc._id,
      review: reviewForm[doc._id]?.review || "",
      suggestion: reviewForm[doc._id]?.suggestion || "",
      reviewStatus: reviewForm[doc._id]?.reviewStatus || "pending",
    }));

    const hasAnyReview = documentReviews.some(
      (doc) => doc.review.trim() || doc.suggestion.trim() || doc.reviewStatus !== "pending"
    );

    if (!hasAnyReview) {
      toast.error("Please add at least one review or suggestion");
      return;
    }

    const token = getToken();
    if (!token) {
      toast.error("Please log in again");
      return;
    }

    try {
      setIsSavingReview(true);
      const response = await fetch(
        `http://localhost:5000/api/admin/services/${selectedService._id}/review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            documentReviews,
            emailMessage: emailMessage.trim(),
          }),
        }
      );

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Invalid response from server");
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to send review");
      }

      toast.success(data.message || "Review saved and email sent");
      await fetchServices();
    } catch (error) {
      toast.error(error.message || "Failed to submit review");
    } finally {
      setIsSavingReview(false);
    }
  };

  const handleToggleSelectService = (serviceId, event) => {
    event.stopPropagation();
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const toggleSelectAllVisible = () => {
    const visibleIds = filteredServices.map((service) => service._id);
    const allSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) => selectedServiceIds.includes(id));

    if (allSelected) {
      setSelectedServiceIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedServiceIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleDeleteSingle = async (serviceId) => {
    if (!window.confirm("Delete this service request?")) return;
    const token = getToken();
    if (!token) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`http://localhost:5000/api/admin/services/${serviceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Failed to delete service request");
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete service request");
      }

      toast.success(data.message || "Service request deleted");
      setSelectedServiceIds((prev) => prev.filter((id) => id !== serviceId));
      await fetchServices(false);
    } catch (error) {
      toast.error(error.message || "Failed to delete service request");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedServiceIds.length === 0) {
      toast.error("Select service requests first");
      return;
    }

    if (!window.confirm(`Delete ${selectedServiceIds.length} selected request(s)?`)) return;
    const token = getToken();
    if (!token) return;

    try {
      setIsDeleting(true);
      const response = await fetch("http://localhost:5000/api/admin/services/bulk-delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: selectedServiceIds }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Failed to bulk delete service requests");
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to bulk delete service requests");
      }

      toast.success(data.message || "Selected requests deleted");
      setSelectedServiceIds([]);
      await fetchServices(false);
    } catch (error) {
      toast.error(error.message || "Failed to bulk delete service requests");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1f2937",
            color: "#fff",
            border: "1px solid #374151",
          },
        }}
      />
      <AnimatedCanvas />

      <div className="relative z-10 p-4 md:p-6">
        <GlassCard className="mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                View <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Service</span>
              </h2>
              <p className="text-gray-300 text-lg">
                Review each uploaded document and send detailed feedback
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-black/40 border border-gray-800/70">
                <p className="text-xs text-gray-400">Total Requests</p>
                <p className="text-xl font-semibold text-blue-300">{services.length}</p>
              </div>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={isDeleting || selectedServiceIds.length === 0}
                className="px-4 py-3 rounded-xl bg-red-600/20 border border-red-500/30 text-red-300 hover:bg-red-600/30 disabled:opacity-50 flex items-center gap-2"
              >
                <FiTrash2 className="w-4 h-4" />
                Bulk Delete
              </button>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <GlassCard className="p-5">
              <div className="space-y-3 mb-4">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search email/title"
                    className="w-full pl-10 pr-4 py-2.5 bg-black/60 border border-gray-800/70 rounded-xl text-white focus:border-blue-500"
                  />
                </div>
                <div className="relative">
                  <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-black/60 border border-gray-800/70 rounded-xl text-white focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in-review">In Review</option>
                    <option value="reviewed">Reviewed</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleSelectAllVisible}
                className="mb-3 text-xs text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1"
              >
                {filteredServices.length > 0 &&
                filteredServices.every((service) => selectedServiceIds.includes(service._id)) ? (
                  <FiCheckSquare className="w-4 h-4" />
                ) : (
                  <FiSquare className="w-4 h-4" />
                )}
                Select All Visible
              </button>

              <div className="space-y-3 max-h-[620px] overflow-auto pr-1">
                {isLoading ? (
                  <div className="py-10 text-center text-gray-400">Loading service requests...</div>
                ) : filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <button
                      key={service._id}
                      onClick={() => handleSelectService(service)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        selectedService?._id === service._id
                          ? "bg-blue-600/15 border-blue-500/40"
                          : "bg-black/50 border-gray-800/70 hover:border-blue-700/40"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={(event) => handleToggleSelectService(service._id, event)}
                          className="mt-0.5 text-gray-400 hover:text-cyan-300"
                        >
                          {selectedServiceIds.includes(service._id) ? (
                            <FiCheckSquare className="w-4 h-4 text-cyan-300" />
                          ) : (
                            <FiSquare className="w-4 h-4" />
                          )}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-sm font-medium truncate">
                            {service.title || "Document Review Request"}
                          </p>
                          <p className="text-gray-400 text-xs truncate mt-1">{service.requesterEmail}</p>
                          <div className="flex items-center justify-between mt-2 text-xs">
                            <span className="text-cyan-300">{service.documents?.length || 0} docs</span>
                            <span className="text-gray-500">{new Date(service.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="py-12 text-center text-gray-500">
                    <FiFileText className="w-8 h-8 mx-auto mb-2 opacity-60" />
                    <p className="text-sm">No service requests found</p>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-2">
            {selectedService ? (
              <GlassCard className="p-6">
                <div className="mb-6 flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {selectedService.title || "Document Review Request"}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <FiMail className="w-4 h-4" />
                        {selectedService.requesterEmail}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiClock className="w-4 h-4" />
                        {new Date(selectedService.createdAt).toLocaleString()}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/30 text-xs">
                        {selectedService.status}
                      </span>
                    </div>
                    {selectedService.description && (
                      <p className="text-gray-300 mt-3 whitespace-pre-wrap">{selectedService.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteSingle(selectedService._id)}
                    disabled={isDeleting}
                    className="px-4 py-2.5 rounded-xl bg-red-600/20 border border-red-500/30 text-red-300 hover:bg-red-600/30 disabled:opacity-50 flex items-center gap-2"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Delete Request
                  </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                  <div className="space-y-4 max-h-[640px] overflow-auto pr-1 xl:col-span-2">
                    <div className="px-1">
                      <p className="text-sm text-cyan-300">
                        Documents: {(selectedService.documents || []).length}
                      </p>
                    </div>
                    {(selectedService.documents || []).map((doc, index) => (
                      <div key={doc._id} className="p-4 rounded-xl bg-black/50 border border-gray-800/70">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="min-w-0">
                            <p className="text-white text-sm font-medium truncate">
                              {index + 1}. {doc.originalName}
                            </p>
                            <p className="text-xs text-gray-400">
                              {doc.mimeType || "Unknown type"} - {(doc.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPreviewDoc(doc);
                              loadDocumentPreview(selectedService._id, doc);
                            }}
                            className="px-2 py-1 rounded-lg bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 text-xs hover:bg-cyan-600/30 inline-flex items-center gap-1"
                          >
                            <FiEye className="w-3.5 h-3.5" />
                            Preview
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <button
                            type="button"
                            onClick={() => openDocumentInNewTab(selectedService._id, doc)}
                            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                          >
                            <FiExternalLink className="w-3.5 h-3.5" />
                            Open in new tab
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadDocumentToPC(selectedService._id, doc)}
                            className="inline-flex items-center gap-1 text-xs text-cyan-300 hover:text-cyan-200"
                          >
                            <FiDownload className="w-3.5 h-3.5" />
                            Download original
                          </button>
                        </div>

                        <div className="space-y-3">
                          <select
                            value={reviewForm[doc._id]?.reviewStatus || "pending"}
                            onChange={(e) => handleReviewChange(doc._id, "reviewStatus", e.target.value)}
                            className="w-full px-3 py-2 bg-black/60 border border-gray-800/70 rounded-lg text-white text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="needs-update">Needs Update</option>
                          </select>

                          <textarea
                            rows={3}
                            value={reviewForm[doc._id]?.review || ""}
                            onChange={(e) => handleReviewChange(doc._id, "review", e.target.value)}
                            className="w-full px-3 py-2 bg-black/60 border border-gray-800/70 rounded-lg text-white text-sm resize-none"
                            placeholder="Write review comments for this document..."
                          />

                          <textarea
                            rows={3}
                            value={reviewForm[doc._id]?.suggestion || ""}
                            onChange={(e) => handleReviewChange(doc._id, "suggestion", e.target.value)}
                            className="w-full px-3 py-2 bg-black/60 border border-gray-800/70 rounded-lg text-white text-sm resize-none"
                            placeholder="Write specific suggestions for improvement..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 xl:col-span-3">
                    <div className="p-4 rounded-xl bg-black/50 border border-gray-800/70">
                      <h4 className="text-white font-medium mb-2">Document Preview</h4>
                      {isPreviewLoading ? (
                        <div className="h-[72vh] min-h-[520px] rounded-lg border border-gray-800/70 bg-black/40 flex items-center justify-center text-gray-400">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                            Loading preview...
                          </div>
                        </div>
                      ) : selectedPreviewDoc && previewUrl ? (
                        previewMimeType.includes("pdf") ? (
                          <iframe
                            src={previewUrl}
                            title={selectedPreviewDoc.originalName}
                            className="w-full h-[72vh] min-h-[520px] rounded-lg border border-gray-800/70 bg-black"
                          />
                        ) : previewMimeType.startsWith("text/") ? (
                          <iframe
                            src={previewUrl}
                            title={selectedPreviewDoc.originalName}
                            className="w-full h-[72vh] min-h-[520px] rounded-lg border border-gray-800/70 bg-white"
                          />
                        ) : (
                          <div className="h-[72vh] min-h-[520px] rounded-lg border border-gray-800/70 bg-black/40 flex items-center justify-center text-center px-4">
                            <div>
                              <p className="text-gray-300 text-sm">
                                Inline preview is optimized for PDF/Text files.
                              </p>
                              <button
                                type="button"
                                onClick={() => openDocumentInNewTab(selectedService._id, selectedPreviewDoc)}
                                className="inline-flex items-center gap-1 mt-2 text-blue-400 text-sm"
                              >
                                <FiExternalLink className="w-4 h-4" />
                                Open this file
                              </button>
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="h-[72vh] min-h-[520px] rounded-lg border border-gray-800/70 bg-black/40 flex items-center justify-center text-gray-500 text-sm">
                          Select a document to preview
                        </div>
                      )}
                    </div>

                    <div className="p-4 rounded-xl bg-black/50 border border-gray-800/70">
                      <label className="block text-sm text-gray-300 mb-2">
                        Additional Email Message (Optional)
                      </label>
                      <textarea
                        rows={5}
                        value={emailMessage}
                        onChange={(e) => setEmailMessage(e.target.value)}
                        className="w-full px-3 py-2 bg-black/60 border border-gray-800/70 rounded-lg text-white text-sm resize-none"
                        placeholder="Add overall feedback before sending..."
                      />

                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleSendReview}
                        disabled={isSavingReview}
                        className="w-full mt-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {isSavingReview ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Saving & Sending...
                          </>
                        ) : (
                          <>
                            <FiSend className="w-4 h-4" />
                            Save Review & Send Email
                          </>
                        )}
                      </motion.button>
                      <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                        <FiCheckCircle className="w-3.5 h-3.5" />
                        If 2 files were uploaded, you can review both separately here.
                      </p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ) : (
              <GlassCard className="p-10 text-center">
                <FiFileText className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p className="text-gray-400">Select a service request to start reviewing.</p>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewService;
