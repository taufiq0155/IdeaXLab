import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import {
  FiMail,
  FiFileText,
  FiUpload,
  FiSend,
  FiTrash2,
  FiPaperclip,
  FiCheckCircle,
  FiInfo,
} from "react-icons/fi";
import AnimatedCanvas from "../../../components/animations/animatedCanvas";
import GlassCard from "../../../components/ui/GlassCard";

const GetService = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);

  const [form, setForm] = useState({
    requesterEmail: "",
    title: "",
    description: "",
  });

  const selectedSizeMB = useMemo(() => {
    const totalBytes = selectedFiles.reduce((sum, file) => sum + (file.size || 0), 0);
    return (totalBytes / (1024 * 1024)).toFixed(2);
  }, [selectedFiles]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleUploadDocuments = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select documents first");
      return;
    }

    const token = localStorage.getItem("adminToken");
    if (!token) {
      toast.error("Please log in to upload documents");
      return;
    }

    try {
      setIsUploading(true);
      const body = new FormData();
      selectedFiles.forEach((file) => body.append("documents", file));

      const response = await fetch("http://localhost:5000/api/admin/services/upload-documents", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body,
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Server returned invalid upload response");
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to upload documents");
      }

      setUploadedDocuments((prev) => [...prev, ...(data.documents || [])]);
      setSelectedFiles([]);
      toast.success(`${data.documents?.length || 0} document(s) uploaded`);
    } catch (error) {
      toast.error(error.message || "Failed to upload documents");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveUploaded = (index) => {
    setUploadedDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitRequest = async () => {
    if (!form.requesterEmail.trim()) {
      toast.error("Requester email is required");
      return;
    }

    if (uploadedDocuments.length === 0) {
      toast.error("Please upload at least one document");
      return;
    }

    const token = localStorage.getItem("adminToken");
    if (!token) {
      toast.error("Please log in first");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("http://localhost:5000/api/admin/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          requesterEmail: form.requesterEmail.trim(),
          title: form.title.trim(),
          description: form.description.trim(),
          documents: uploadedDocuments,
        }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Server returned invalid response");
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create service request");
      }

      toast.success("Service request submitted successfully");
      setForm({ requesterEmail: "", title: "", description: "" });
      setUploadedDocuments([]);
      setSelectedFiles([]);
    } catch (error) {
      toast.error(error.message || "Failed to submit service request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-x-hidden">
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
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-3">
                Get <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Service</span>
              </h2>
              <p className="text-gray-300 text-lg">
                Submit CV, SOP, or any documents for review
              </p>
            </div>
            <div className="mt-4 md:mt-0 p-3 rounded-xl bg-black/40 border border-gray-800/70">
              <p className="text-xs text-gray-400">Uploaded Documents</p>
              <p className="text-xl font-semibold text-cyan-300">{uploadedDocuments.length}</p>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">Service Request Form</h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FiMail className="w-4 h-4 text-cyan-400" />
                    Requester Email *
                  </label>
                  <input
                    type="email"
                    value={form.requesterEmail}
                    onChange={(e) => setForm((prev) => ({ ...prev, requesterEmail: e.target.value }))}
                    className="w-full px-4 py-3 bg-black/60 border border-gray-800/70 hover:border-blue-600/50 rounded-xl text-white focus:border-blue-500 transition-all duration-300"
                    placeholder="student@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FiFileText className="w-4 h-4 text-cyan-400" />
                    Service Title
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 bg-black/60 border border-gray-800/70 hover:border-blue-600/50 rounded-xl text-white focus:border-blue-500 transition-all duration-300"
                    placeholder="CV and SOP review for graduate admission"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FiInfo className="w-4 h-4 text-cyan-400" />
                    Request Details
                  </label>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 bg-black/60 border border-gray-800/70 hover:border-blue-600/50 rounded-xl text-white focus:border-blue-500 transition-all duration-300 resize-none"
                    placeholder="Add review goals, deadlines, or specific expectations..."
                  />
                </div>

                <div className="border border-gray-800/70 rounded-xl p-4 bg-black/50">
                  <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <FiPaperclip className="w-4 h-4 text-cyan-400" />
                    Attach Documents (Multiple)
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600/20 file:text-blue-300 hover:file:bg-blue-600/30"
                    accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx"
                  />
                  {selectedFiles.length > 0 && (
                    <p className="text-xs text-gray-400 mt-2">
                      {selectedFiles.length} file(s) selected, {selectedSizeMB} MB total
                    </p>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="button"
                    onClick={handleUploadDocuments}
                    disabled={isUploading || selectedFiles.length === 0}
                    className="mt-4 px-4 py-2.5 bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 rounded-xl hover:bg-cyan-600/30 transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FiUpload className="w-4 h-4" />
                        Upload Selected Documents
                      </>
                    )}
                  </motion.button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleSubmitRequest}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <FiSend className="w-4 h-4" />
                      Submit Service Request
                    </>
                  )}
                </motion.button>
              </div>
            </GlassCard>
          </div>

          <div className="self-start lg:sticky lg:top-24">
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Uploaded Files</h3>
              <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
                {uploadedDocuments.length > 0 ? (
                  uploadedDocuments.map((doc, index) => (
                    <div key={`${doc.publicId}-${index}`} className="p-3 rounded-xl bg-black/50 border border-gray-800/70">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm text-white truncate">{doc.originalName}</p>
                          <p className="text-xs text-gray-400">{(doc.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveUploaded(index)}
                          className="p-1.5 rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600/30 transition-colors"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-xs text-blue-400 hover:text-blue-300"
                      >
                        <FiFileText className="w-3.5 h-3.5" />
                        View Document
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <FiPaperclip className="w-8 h-8 mx-auto mb-2 opacity-60" />
                    <p className="text-sm">No uploaded documents yet</p>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-800/70">
                <p className="text-xs text-green-400 flex items-center gap-1">
                  <FiCheckCircle className="w-3.5 h-3.5" />
                  You can upload and review all attached files before submitting.
                </p>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetService;
