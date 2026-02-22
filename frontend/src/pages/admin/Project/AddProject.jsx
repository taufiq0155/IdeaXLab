import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import {
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
  FiImage,
  FiLink,
  FiPlus,
  FiSave,
  FiTrash2,
  FiUpload,
} from "react-icons/fi";
import AnimatedCanvas from "../../../components/animations/animatedCanvas";
import GlassCard from "../../../components/ui/GlassCard";

const initialForm = {
  title: "",
  description: "",
  status: "published",
  images: [],
  links: [],
};

const AddProject = () => {
  const [form, setForm] = useState(initialForm);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const imageCount = useMemo(() => form.images.length, [form.images.length]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUploadImages = async (files) => {
    const selected = Array.from(files || []);
    if (!selected.length) return;

    const token = localStorage.getItem("adminToken");
    if (!token) {
      toast.error("Please log in first");
      return;
    }

    try {
      setIsUploading(true);
      const body = new FormData();
      selected.forEach((file) => body.append("images", file));

      const response = await fetch("http://localhost:5000/api/admin/projects/upload-images", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body,
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Invalid upload response");
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to upload images");
      }

      const incoming = Array.isArray(data.images) ? data.images : [];
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...incoming],
      }));
      toast.success(`${incoming.length} image(s) uploaded`);
    } catch (error) {
      toast.error(error.message || "Failed to upload images");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setForm((prev) => {
      const nextImages = prev.images.filter((_, i) => i !== index);
      setActiveSlide((slide) => {
        if (nextImages.length === 0) return 0;
        return Math.min(slide, nextImages.length - 1);
      });
      return { ...prev, images: nextImages };
    });
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
      links: prev.links.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
  };

  const nextSlide = () => {
    if (!form.images.length) return;
    setActiveSlide((prev) => (prev + 1) % form.images.length);
  };

  const prevSlide = () => {
    if (!form.images.length) return;
    setActiveSlide((prev) => (prev - 1 + form.images.length) % form.images.length);
  };

  const handleCreateProject = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Project title and description are required");
      return;
    }
    if (!form.images.length) {
      toast.error("Please upload at least one project image");
      return;
    }

    const token = localStorage.getItem("adminToken");
    if (!token) {
      toast.error("Please log in first");
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch("http://localhost:5000/api/admin/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Invalid create response");
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create project");
      }

      toast.success("Project created successfully");
      setForm(initialForm);
      setActiveSlide(0);
    } catch (error) {
      toast.error(error.message || "Failed to create project");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-x-hidden">
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
                Add <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Project</span>
              </h2>
              <p className="text-gray-300 text-lg">Create project with multiple images and links</p>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-gray-800/70">
              <p className="text-xs text-gray-400">Images</p>
              <p className="text-xl font-semibold text-cyan-300">{imageCount}</p>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">Project Information</h3>

              <div className="space-y-6">
                <InputField
                  icon={<FiImage className="w-4 h-4 text-cyan-400" />}
                  label="Project Title *"
                  value={form.title}
                  onChange={(value) => handleChange("title", value)}
                  placeholder="Project title"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Project Description *</label>
                  <textarea
                    rows={6}
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    className="w-full px-4 py-3 bg-black/60 border border-gray-800/70 rounded-xl text-white focus:border-blue-500 resize-none"
                    placeholder="Project details..."
                  />
                </div>

                <SelectField
                  label="Status"
                  value={form.status}
                  onChange={(value) => handleChange("status", value)}
                  options={[
                    { label: "Published", value: "published" },
                    { label: "Draft", value: "draft" },
                  ]}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Project Photos *</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      id="project-images-upload"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        handleUploadImages(e.target.files);
                        e.target.value = "";
                      }}
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="project-images-upload"
                      className={`px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium flex items-center gap-2 cursor-pointer ${
                        isUploading ? "opacity-60 cursor-not-allowed" : "hover:from-blue-700 hover:to-cyan-700"
                      }`}
                    >
                      {isUploading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <FiUpload className="w-4 h-4" />
                          Upload Photos
                        </>
                      )}
                    </label>
                    <p className="text-xs text-gray-400">You can upload multiple images</p>
                  </div>

                  {!!form.images.length && (
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {form.images.map((image, index) => (
                        <div key={`${image.publicId}-${index}`} className="relative rounded-xl overflow-hidden border border-gray-800/70">
                          <img src={image.imageUrl} alt={image.altText || "Project"} className="w-full h-24 object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 p-1.5 rounded-lg bg-black/70 text-red-300 hover:bg-red-900/70"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">Project Links</label>
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
                      <div key={`link-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-2">
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => updateLink(index, "label", e.target.value)}
                          className="md:col-span-4 px-3 py-2.5 rounded-xl bg-black/60 border border-gray-800/70 text-white focus:border-blue-500"
                          placeholder="Link Name (YouTube)"
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
                      <p className="text-xs text-gray-500">No link added yet</p>
                    )}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleCreateProject}
                  disabled={isSaving}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 rounded-xl font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Saving Project...
                    </>
                  ) : (
                    <>
                      <FiSave className="w-4 h-4" />
                      Save Project
                    </>
                  )}
                </motion.button>
              </div>
            </GlassCard>
          </div>

          <div className="self-start lg:sticky lg:top-24">
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Live Preview</h3>
              <div className="rounded-2xl bg-black/50 border border-gray-800/70 p-4">
                <div className="relative rounded-xl overflow-hidden border border-gray-800/70 bg-black/60">
                  {form.images.length ? (
                    <img
                      src={form.images[activeSlide]?.imageUrl}
                      alt={form.images[activeSlide]?.altText || form.title || "Project preview"}
                      className="w-full h-44 object-cover"
                    />
                  ) : (
                    <div className="h-44 flex items-center justify-center">
                      <FiImage className="w-10 h-10 text-gray-500" />
                    </div>
                  )}
                  {form.images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={prevSlide}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-black/60 text-white"
                      >
                        <FiChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={nextSlide}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-black/60 text-white"
                      >
                        <FiChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                <h4 className="mt-4 text-white font-semibold">
                  {form.title || "Project Title"}
                </h4>
                <p className="mt-2 text-sm text-gray-300 line-clamp-4">
                  {form.description || "Project description preview..."}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="px-2 py-1 rounded-lg text-xs bg-blue-900/30 border border-blue-700/40 text-blue-300">
                    {form.status}
                  </span>
                  <span className="px-2 py-1 rounded-lg text-xs bg-cyan-900/30 border border-cyan-700/40 text-cyan-300">
                    {form.images.length} image(s)
                  </span>
                </div>

                <div className="mt-3 space-y-1">
                  {form.links.slice(0, 3).map((link, idx) => (
                    <div key={`preview-link-${idx}`} className="text-xs text-gray-300 flex items-center gap-1">
                      <FiLink className="w-3.5 h-3.5 text-cyan-400" />
                      {link.label || "Link"} <FiExternalLink className="w-3 h-3 text-gray-400" />
                    </div>
                  ))}
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

const SelectField = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-black/60 border border-gray-800/70 rounded-xl text-white focus:border-blue-500"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} className="bg-gray-900 text-white">
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export default AddProject;
