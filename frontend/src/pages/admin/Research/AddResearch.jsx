import { useState } from "react";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import {
  FiBookOpen,
  FiCalendar,
  FiFileText,
  FiGlobe,
  FiLink,
  FiPlus,
  FiSave,
  FiTag,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi";
import AnimatedCanvas from "../../../components/animations/animatedCanvas";
import GlassCard from "../../../components/ui/GlassCard";

const initialForm = {
  title: "",
  description: "",
  domain: "",
  authors: [],
  publishDate: "",
  publicationType: "",
  links: [],
};

const AddResearch = () => {
  const [form, setForm] = useState(initialForm);
  const [authorInput, setAuthorInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addAuthor = () => {
    const author = String(authorInput || "").trim();
    if (!author) return;
    if (form.authors.some((item) => item.toLowerCase() === author.toLowerCase())) {
      toast.error("Author already added");
      return;
    }
    setForm((prev) => ({ ...prev, authors: [...prev.authors, author] }));
    setAuthorInput("");
  };

  const removeAuthor = (index) => {
    setForm((prev) => ({
      ...prev,
      authors: prev.authors.filter((_, i) => i !== index),
    }));
  };

  const addLink = () => {
    setForm((prev) => ({
      ...prev,
      links: [...prev.links, { label: "", url: "" }],
    }));
  };

  const removeLink = (index) => {
    setForm((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));
  };

  const updateLink = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      links: prev.links.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleSave = async () => {
    const normalizedTitle = String(form.title || "").trim();
    const normalizedDescription = String(form.description || "").trim();
    const normalizedDomain = String(form.domain || "").trim();
    const normalizedPublishDate = String(form.publishDate || "").trim();
    const normalizedPublishedIn = String(form.publicationType || "").trim();

    const missingFields = [];
    if (!normalizedTitle) missingFields.push("Title");
    if (!normalizedDomain) missingFields.push("Domain");
    if (!normalizedPublishDate) missingFields.push("Publish Date");
    if (!normalizedPublishedIn) missingFields.push("Published In");

    if (missingFields.length) {
      toast.error(`Please fill: ${missingFields.join(", ")}`);
      return;
    }
    if (!form.authors.length) {
      toast.error("Please add at least one author");
      return;
    }
    if (!form.links.length) {
      toast.error("Please add at least one paper link");
      return;
    }

    const token = localStorage.getItem("adminToken");
    if (!token) {
      toast.error("Please log in first");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        ...form,
        title: normalizedTitle,
        description: normalizedDescription,
        domain: normalizedDomain,
        publishDate: normalizedPublishDate,
        publicationType: normalizedPublishedIn,
        publishedIn: normalizedPublishedIn,
        publish_date: normalizedPublishDate,
      };
      const response = await fetch("http://localhost:5000/api/admin/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Invalid create response");
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to add research");
      }

      toast.success("Research added successfully");
      setForm(initialForm);
      setAuthorInput("");
    } catch (error) {
      toast.error(error.message || "Failed to add research");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: "#1f2937", color: "#fff", border: "1px solid #374151" },
        }}
      />
      <AnimatedCanvas />

      <div className="relative z-10 p-4 md:p-6">
        <GlassCard className="mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Add{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  Research
                </span>
              </h2>
              <p className="text-gray-300 text-lg">
                Add research paper metadata and publication links
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge label="Authors" value={String(form.authors.length)} />
              <Badge label="Links" value={String(form.links.length)} />
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">Research Information</h3>

              <div className="space-y-6">
                <InputField
                  icon={<FiFileText className="w-4 h-4 text-cyan-400" />}
                  label="Title *"
                  value={form.title}
                  onChange={(value) => handleChange("title", value)}
                  placeholder="Paper title"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FiFileText className="w-4 h-4 text-cyan-400" />
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    className="w-full px-4 py-3 bg-black/60 border border-gray-800/70 rounded-xl text-white focus:border-blue-500 min-h-[130px]"
                    placeholder="Research description, abstract, or summary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FiTag className="w-4 h-4 text-cyan-400" />
                    Domain *
                  </label>
                  <input
                    type="text"
                    value={form.domain}
                    onChange={(e) => handleChange("domain", e.target.value)}
                    className="w-full px-4 py-3 bg-black/60 border border-gray-800/70 rounded-xl text-white focus:border-blue-500"
                    placeholder="Type domain (e.g., Machine Learning)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    icon={<FiCalendar className="w-4 h-4 text-cyan-400" />}
                    label="Publish Date *"
                    type="text"
                    value={form.publishDate}
                    onChange={(value) => handleChange("publishDate", value)}
                    placeholder="YYYY-MM-DD or DD/MM/YYYY"
                  />
                  <InputField
                    icon={<FiBookOpen className="w-4 h-4 text-cyan-400" />}
                    label="Published In *"
                    value={form.publicationType}
                    onChange={(value) => handleChange("publicationType", value)}
                    placeholder="Journal / Conference / Workshop / Other"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FiUser className="w-4 h-4 text-cyan-400" />
                    Authors Name *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={authorInput}
                      onChange={(e) => setAuthorInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addAuthor();
                        }
                      }}
                      className="flex-1 px-4 py-3 bg-black/60 border border-gray-800/70 rounded-xl text-white focus:border-blue-500"
                      placeholder="Add author and press Enter"
                    />
                    <button
                      type="button"
                      onClick={addAuthor}
                      className="px-4 py-3 rounded-xl bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-600/30"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {form.authors.map((author, index) => (
                      <span
                        key={`${author}-${index}`}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-900/30 text-blue-300 text-xs border border-blue-700/40"
                      >
                        {author}
                        <button
                          type="button"
                          onClick={() => removeAuthor(index)}
                          className="text-blue-100 hover:text-red-300"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {!form.authors.length && (
                      <p className="text-xs text-gray-500">No author added yet</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                      <FiGlobe className="w-4 h-4 text-cyan-400" />
                      Paper Links *
                    </label>
                    <button
                      type="button"
                      onClick={addLink}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 text-sm flex items-center gap-1"
                    >
                      <FiPlus className="w-3.5 h-3.5" />
                      Add Link
                    </button>
                  </div>

                  <div className="space-y-2">
                    {form.links.map((link, index) => (
                      <div key={`research-link-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-2">
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => updateLink(index, "label", e.target.value)}
                          className="md:col-span-4 px-3 py-2.5 rounded-xl bg-black/60 border border-gray-800/70 text-white focus:border-blue-500"
                          placeholder="Link Name"
                        />
                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) => updateLink(index, "url", e.target.value)}
                          className="md:col-span-7 px-3 py-2.5 rounded-xl bg-black/60 border border-gray-800/70 text-white focus:border-blue-500"
                          placeholder="https://..."
                        />
                        <button
                          type="button"
                          onClick={() => removeLink(index)}
                          className="md:col-span-1 px-3 py-2.5 rounded-xl bg-red-600/20 border border-red-500/30 text-red-300 hover:bg-red-600/30"
                        >
                          <FiTrash2 className="w-4 h-4 mx-auto" />
                        </button>
                      </div>
                    ))}
                    {!form.links.length && (
                      <p className="text-xs text-gray-500">No links added yet</p>
                    )}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 rounded-xl font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Saving Research...
                    </>
                  ) : (
                    <>
                      <FiSave className="w-4 h-4" />
                      Save Research
                    </>
                  )}
                </motion.button>
              </div>
            </GlassCard>
          </div>

          <div>
            <GlassCard className="p-6 sticky top-6">
              <h3 className="text-xl font-bold text-white mb-4">Live Preview</h3>
              <div className="rounded-2xl bg-black/50 border border-gray-800/70 p-4">
                <h4 className="text-white font-semibold line-clamp-2">
                  {form.title || "Research Title"}
                </h4>
                <p className="mt-2 text-xs text-gray-300 whitespace-pre-wrap break-words line-clamp-4 min-h-[4.5rem]">
                  {form.description || "Description will appear here"}
                </p>
                <p className="mt-2 text-xs text-cyan-300">{form.domain || "Domain"}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {formatPublicationType(form.publicationType)} |{" "}
                  {form.publishDate ? new Date(form.publishDate).toLocaleDateString() : "No date"}
                </p>

                <div className="mt-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Authors</p>
                  <div className="flex flex-wrap gap-2">
                    {form.authors.length > 0 ? (
                      form.authors.slice(0, 6).map((author, index) => (
                        <span
                          key={`${author}-preview-${index}`}
                          className="px-2 py-1 text-xs rounded-lg bg-blue-900/30 border border-blue-700/40 text-blue-300"
                        >
                          {author}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500">No author added</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-1">
                  {form.links.slice(0, 4).map((link, idx) => (
                    <div key={`preview-link-${idx}`} className="text-xs text-gray-300 flex items-center gap-1">
                      <FiLink className="w-3.5 h-3.5 text-cyan-400" />
                      {link.label || "Paper Link"}
                    </div>
                  ))}
                  {!form.links.length && <p className="text-xs text-gray-500">No links yet</p>}
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ icon, label, value, onChange, placeholder = "", type = "text" }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
      {icon}
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-black/60 border border-gray-800/70 rounded-xl text-white focus:border-blue-500"
      placeholder={placeholder}
    />
  </div>
);

const Badge = ({ label, value }) => (
  <div className="p-3 rounded-xl bg-black/40 border border-gray-800/70">
    <p className="text-xs text-gray-400">{label}</p>
    <p className="text-xl font-semibold text-cyan-300">{value}</p>
  </div>
);

const formatPublicationType = (value = "journal") =>
  String(value)
    .split(/[\s-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export default AddResearch;
