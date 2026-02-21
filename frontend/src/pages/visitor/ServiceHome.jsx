import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import {
  FiCheckCircle,
  FiFileText,
  FiMail,
  FiPaperclip,
  FiSend,
  FiTrash2,
  FiUpload,
} from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import AnimatedCanvas from "../../components/animations/animatedCanvas";
import GlassCard from "../../components/ui/GlassCard";
import VisitorHeader from "./header";
import Footer from "./footer";

const serviceItems = [
  {
    title: "Research & Development (R&D)",
    points: [
      "Basic and applied research",
      "Product development and prototype testing",
      "Innovation support for companies",
    ],
  },
  {
    title: "Testing & Analysis Services",
    points: [
      "Material, chemical, and microbiological testing",
      "Environmental and software testing",
      "Quality assurance and validation",
    ],
  },
  {
    title: "Consultancy Services",
    points: [
      "Technical consultancy for industries",
      "Feasibility and project evaluation",
      "Policy and data advisory",
    ],
  },
  {
    title: "Training & Skill Development",
    points: [
      "Workshops, seminars, and lab training",
      "Certification and research methodology",
      "Internship support programs",
    ],
  },
  {
    title: "Instrumentation & Equipment Access",
    points: [
      "Advanced instrument access",
      "Calibration and technical support",
      "Equipment rental/shared facilities",
    ],
  },
  {
    title: "Data & Analytical Services",
    points: [
      "Statistical and big data analysis",
      "AI/ML model development",
      "Simulation, modeling, and surveys",
    ],
  },
  {
    title: "Publication & Documentation Support",
    points: [
      "Research paper assistance",
      "Patent drafting support",
      "Technical and regulatory documentation",
    ],
  },
  {
    title: "Collaboration & Partnership Services",
    points: [
      "Industry-academia collaboration",
      "Joint research and grant proposals",
      "International research partnerships",
    ],
  },
];

const ServiceHome = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [selectedServiceTitle, setSelectedServiceTitle] = useState(serviceItems[0].title);
  const [form, setForm] = useState({
    requesterEmail: "",
    description: "",
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSelectedMB = useMemo(() => {
    const totalBytes = selectedFiles.reduce((sum, file) => sum + (file.size || 0), 0);
    return (totalBytes / (1024 * 1024)).toFixed(2);
  }, [selectedFiles]);

  const handleUploadDocuments = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select documents first");
      return;
    }

    try {
      setIsUploading(true);
      const body = new FormData();
      selectedFiles.forEach((file) => body.append("documents", file));

      const response = await fetch("http://localhost:5000/api/public/services/upload-documents", {
        method: "POST",
        body,
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Invalid upload response");
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to upload documents");
      }

      setUploadedDocuments((prev) => [...prev, ...(data.documents || [])]);
      setSelectedFiles([]);
      toast.success(`${data.documents?.length || 0} file(s) uploaded`);
    } catch (error) {
      toast.error(error.message || "Failed to upload documents");
    } finally {
      setIsUploading(false);
    }
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

    try {
      setIsSubmitting(true);
      const response = await fetch("http://localhost:5000/api/public/services/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requesterEmail: form.requesterEmail.trim(),
          title: selectedServiceTitle,
          description: form.description.trim(),
          documents: uploadedDocuments,
        }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Invalid submit response");
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to submit request");
      }

      toast.success("Service request submitted successfully");
      setForm({ requesterEmail: "", description: "" });
      setSelectedFiles([]);
      setUploadedDocuments([]);
    } catch (error) {
      toast.error(error.message || "Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${isDark ? "bg-black" : "bg-white"}`}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: isDark ? "#1f2937" : "#ffffff",
            color: isDark ? "#ffffff" : "#111827",
            border: isDark ? "1px solid #374151" : "1px solid #d1d5db",
          },
        }}
      />
      <AnimatedCanvas theme={theme} />
      <VisitorHeader />

      <main className="relative z-20 pt-28 px-4 sm:px-6 lg:px-8 pb-14">
        <div className="max-w-7xl mx-auto">
          <GlassCard theme={theme} className="mb-6">
            <h1 className={`text-3xl md:text-4xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              Service Portfolio
            </h1>
            <p className={`mt-2 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              Select a service and get a free service by rating your documents.
            </p>
          </GlassCard>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {serviceItems.map((item) => {
              const isActive = selectedServiceTitle === item.title;
              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setSelectedServiceTitle(item.title)}
                  className={`text-left rounded-2xl border p-4 transition-all ${
                    isActive
                      ? isDark
                        ? "bg-blue-900/30 border-blue-700/50"
                        : "bg-blue-100 border-blue-300"
                      : isDark
                      ? "bg-black/50 border-gray-800/70 hover:bg-blue-900/15"
                      : "bg-white border-gray-200 hover:bg-blue-50"
                  }`}
                >
                  <h3 className={`font-semibold text-base ${isDark ? "text-white" : "text-gray-900"}`}>
                    {item.title}
                  </h3>
                  <p className={`text-xs mt-1 mb-2 ${isDark ? "text-blue-300" : "text-blue-700"}`}>
                    Get a free service by rating your documents
                  </p>
                  <ul className={`text-xs space-y-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                    {item.points.map((point, idx) => (
                      <li key={idx} className="flex gap-1.5">
                        <span className="mt-0.5">-</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <GlassCard theme={theme} className="p-6">
                <h2 className={`text-xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                  Get Free Service
                </h2>
                <p className={`mt-1 text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  Selected service: <span className="text-cyan-400">{selectedServiceTitle}</span>
                </p>

                <div className="mt-5 space-y-5">
                  <div>
                    <label className={`text-sm font-medium mb-2 block ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      <span className="inline-flex items-center gap-2">
                        <FiMail className="w-4 h-4 text-cyan-400" />
                        Your Email
                      </span>
                    </label>
                    <input
                      type="email"
                      value={form.requesterEmail}
                      onChange={(e) => setForm((prev) => ({ ...prev, requesterEmail: e.target.value }))}
                      placeholder="youremail@example.com"
                      className={`w-full px-4 py-3 rounded-xl border ${
                        isDark
                          ? "bg-black/40 border-gray-800 text-white placeholder-gray-500"
                          : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`text-sm font-medium mb-2 block ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      <span className="inline-flex items-center gap-2">
                        <FiFileText className="w-4 h-4 text-cyan-400" />
                        Request Details (Optional)
                      </span>
                    </label>
                    <textarea
                      rows={4}
                      value={form.description}
                      onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Add notes about your requirement..."
                      className={`w-full px-4 py-3 rounded-xl border resize-none ${
                        isDark
                          ? "bg-black/40 border-gray-800 text-white placeholder-gray-500"
                          : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                      }`}
                    />
                  </div>

                  <div className={`rounded-xl border p-4 ${isDark ? "bg-black/50 border-gray-800/70" : "bg-gray-50 border-gray-200"}`}>
                    <label className={`text-sm font-medium mb-2 block ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      <span className="inline-flex items-center gap-2">
                        <FiPaperclip className="w-4 h-4 text-cyan-400" />
                        Attach Files
                      </span>
                    </label>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx"
                      onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                      className="w-full text-sm text-gray-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600/20 file:text-blue-300 hover:file:bg-blue-600/30"
                    />
                    {selectedFiles.length > 0 && (
                      <p className={`text-xs mt-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {selectedFiles.length} file(s) selected, {totalSelectedMB} MB total
                      </p>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="button"
                      onClick={handleUploadDocuments}
                      disabled={isUploading || selectedFiles.length === 0}
                      className="mt-3 px-4 py-2.5 rounded-xl border border-cyan-500/40 text-cyan-300 bg-cyan-700/10 hover:bg-cyan-700/20 disabled:opacity-50 inline-flex items-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin"></span>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <FiUpload className="w-4 h-4" />
                          Upload Selected Files
                        </>
                      )}
                    </motion.button>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="button"
                    onClick={handleSubmitRequest}
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-60 inline-flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Submitting...
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

            <div>
              <GlassCard theme={theme} className="p-6 sticky top-28">
                <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                  Uploaded Documents
                </h3>
                <div className="mt-4 space-y-3 max-h-[520px] overflow-auto pr-1">
                  {uploadedDocuments.length > 0 ? (
                    uploadedDocuments.map((doc, idx) => (
                      <div
                        key={`${doc.publicId}-${idx}`}
                        className={`rounded-xl border p-3 ${isDark ? "bg-black/50 border-gray-800/70" : "bg-gray-50 border-gray-200"}`}
                      >
                        <p className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                          {doc.originalName}
                        </p>
                        <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          {(doc.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            setUploadedDocuments((prev) => prev.filter((_, index) => index !== idx))
                          }
                          className="mt-2 inline-flex items-center gap-1 text-xs text-red-300 hover:text-red-200"
                        >
                          <FiTrash2 className="w-3 h-3" />
                          Remove
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                      No documents uploaded yet.
                    </p>
                  )}
                </div>
                <p className="mt-4 text-xs text-green-400 inline-flex items-center gap-1">
                  <FiCheckCircle className="w-3.5 h-3.5" />
                  You can upload multiple documents.
                </p>
              </GlassCard>
            </div>
          </div>
        </div>
      </main>
      <Footer theme={theme} />
    </div>
  );
};

export default ServiceHome;
