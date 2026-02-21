import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import {
  FiChevronLeft,
  FiChevronRight,
  FiEdit,
  FiImage,
  FiPlus,
  FiSave,
  FiSearch,
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

const ModifyProject = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState(initialForm);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const getToken = () => localStorage.getItem("adminToken");

  const fetchProjects = async (preferredId = "") => {
    const token = getToken();
    if (!token) {
      toast.error("Please log in first");
      setIsLoadingList(false);
      return;
    }

    try {
      setIsLoadingList(true);
      const response = await fetch("http://localhost:5000/api/admin/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Invalid server response");
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch projects");
      }

      const list = data.data || [];
      setProjects(list);

      if (list.length === 0) {
        setSelectedProjectId("");
        setForm(initialForm);
        return;
      }

      const targetId =
        (preferredId && list.some((p) => p._id === preferredId) && preferredId) ||
        (selectedProjectId && list.some((p) => p._id === selectedProjectId) && selectedProjectId) ||
        list[0]._id;

      await loadProject(targetId);
    } catch (error) {
      toast.error(error.message || "Failed to fetch projects");
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const loadProject = async (projectId) => {
    if (!projectId) return;
    const token = getToken();
    if (!token) return;

    try {
      setIsLoadingProject(true);
      const response = await fetch(`http://localhost:5000/api/admin/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Invalid server response");
      }

      const data = await response.json();
      if (!response.ok || !data.success || !data.data) {
        throw new Error(data.message || "Failed to load project");
      }

      const project = data.data;
      setSelectedProjectId(project._id);
      setForm({
        title: project.title || "",
        description: project.description || "",
        status: project.status || "published",
        images: Array.isArray(project.images) ? project.images : [],
        links: Array.isArray(project.links) ? project.links : [],
      });
      setActiveSlide(0);
    } catch (error) {
      toast.error(error.message || "Failed to load project");
    } finally {
      setIsLoadingProject(false);
    }
  };

  const filteredProjects = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    if (!needle) return projects;
    return projects.filter((project) => {
      return (
        project.title?.toLowerCase().includes(needle) ||
        project.description?.toLowerCase().includes(needle)
      );
    });
  }, [projects, searchTerm]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUploadImages = async (files) => {
    const selected = Array.from(files || []);
    if (!selected.length) return;

    const token = getToken();
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

      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...(data.images || [])],
      }));
      toast.success(`${(data.images || []).length} image(s) uploaded`);
    } catch (error) {
      toast.error(error.message || "Failed to upload images");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index) => {
    setForm((prev) => {
      const nextImages = prev.images.filter((_, i) => i !== index);
      setActiveSlide((slide) => {
        if (!nextImages.length) return 0;
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

  const handleUpdateProject = async () => {
    if (!selectedProjectId) return;
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Project title and description are required");
      return;
    }
    if (!form.images.length) {
      toast.error("At least one image is required");
      return;
    }

    const token = getToken();
    if (!token) return;

    try {
      setIsSaving(true);
      const response = await fetch(`http://localhost:5000/api/admin/projects/${selectedProjectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Invalid update response");
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update project");
      }

      toast.success("Project updated successfully");
      await fetchProjects(selectedProjectId);
    } catch (error) {
      toast.error(error.message || "Failed to update project");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProjectId) return;
    const selected = projects.find((item) => item._id === selectedProjectId);
    if (!window.confirm(`Delete "${selected?.title || "this project"}"?`)) return;

    const token = getToken();
    if (!token) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`http://localhost:5000/api/admin/projects/${selectedProjectId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Invalid delete response");
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete project");
      }

      toast.success("Project deleted");
      await fetchProjects("");
    } catch (error) {
      toast.error(error.message || "Failed to delete project");
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
          style: { background: "#1f2937", color: "#fff", border: "1px solid #374151" },
        }}
      />
      <AnimatedCanvas />

      <div className="relative z-10 p-4 md:p-6">
        <GlassCard className="mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Modify <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Project</span>
              </h2>
              <p className="text-gray-300 text-lg">Edit project info, slideshow images, and links</p>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-gray-800/70">
              <p className="text-xs text-gray-400">Projects</p>
              <p className="text-xl font-semibold text-cyan-300">{projects.length}</p>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <GlassCard className="p-4">
              <div className="relative mb-4">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search projects..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/60 border border-gray-800/70 text-white focus:border-blue-500"
                />
              </div>

              <div className="space-y-2 max-h-[68vh] overflow-auto pr-1">
                {isLoadingList ? (
                  <p className="text-sm text-gray-400 py-6 text-center">Loading projects...</p>
                ) : filteredProjects.length === 0 ? (
                  <p className="text-sm text-gray-500 py-6 text-center">No project found</p>
                ) : (
                  filteredProjects.map((project) => {
                    const isActive = selectedProjectId === project._id;
                    return (
                      <button
                        key={project._id}
                        type="button"
                        onClick={() => loadProject(project._id)}
                        className={`w-full text-left p-3 rounded-xl border transition-colors ${
                          isActive
                            ? "bg-blue-900/25 border-blue-700/40"
                            : "bg-black/40 border-gray-800/70 hover:bg-black/60"
                        }`}
                      >
                        <p className="text-sm text-white font-medium truncate">{project.title}</p>
                        <p className="text-xs text-gray-400 truncate">
                          {(project.images || []).length} image(s) | {project.status}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-2">
            {!selectedProjectId ? (
              <GlassCard className="p-10 text-center">
                <FiEdit className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                <p className="text-lg text-gray-300">Select a project to modify</p>
              </GlassCard>
            ) : (
              <GlassCard className="p-6">
                {isLoadingProject ? (
                  <p className="text-gray-400 text-center py-10">Loading project details...</p>
                ) : (
                  <div className="space-y-6">
                    <InputField
                      icon={<FiImage className="w-4 h-4 text-cyan-400" />}
                      label="Project Title *"
                      value={form.title}
                      onChange={(value) => handleChange("title", value)}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Project Description *</label>
                      <textarea
                        rows={6}
                        value={form.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                        className="w-full px-4 py-3 bg-black/60 border border-gray-800/70 rounded-xl text-white focus:border-blue-500 resize-none"
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
                      <label className="block text-sm font-medium text-gray-300 mb-2">Project Slideshow</label>
                      <div className="relative rounded-xl overflow-hidden border border-gray-800/70 bg-black/50">
                        {form.images.length ? (
                          <img
                            src={form.images[activeSlide]?.imageUrl}
                            alt={form.images[activeSlide]?.altText || form.title}
                            className="w-full h-60 object-cover"
                          />
                        ) : (
                          <div className="h-60 flex items-center justify-center">
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

                      <div className="mt-3 flex items-center gap-3">
                        <input
                          type="file"
                          id="modify-project-images-upload"
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
                          htmlFor="modify-project-images-upload"
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
                              Add More Photos
                            </>
                          )}
                        </label>
                        <span className="text-xs text-gray-400">{form.images.length} image(s)</span>
                      </div>

                      {!!form.images.length && (
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {form.images.map((image, index) => (
                            <div key={`${image.publicId}-${index}`} className="relative rounded-xl overflow-hidden border border-gray-800/70">
                              <img src={image.imageUrl} alt={image.altText || "Project"} className="w-full h-24 object-cover" />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleUpdateProject}
                        disabled={isSaving || isDeleting}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 rounded-xl font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {isSaving ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Updating...
                          </>
                        ) : (
                          <>
                            <FiSave className="w-4 h-4" />
                            Update Project
                          </>
                        )}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleDeleteProject}
                        disabled={isDeleting || isSaving}
                        className="w-full bg-red-600/20 border border-red-500/30 text-red-300 px-6 py-4 rounded-xl font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {isDeleting ? (
                          <>
                            <span className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin"></span>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <FiTrash2 className="w-4 h-4" />
                            Delete Project
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                )}
              </GlassCard>
            )}
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
      placeholder={placeholder}
      className="w-full px-4 py-3 bg-black/60 border border-gray-800/70 rounded-xl text-white focus:border-blue-500"
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

export default ModifyProject;
