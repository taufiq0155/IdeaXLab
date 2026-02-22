import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import {
  FiBookOpen,
  FiCalendar,
  FiFileText,
  FiGlobe,
  FiPlus,
  FiSave,
  FiSearch,
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

const ModifyResearch = () => {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState(initialForm);
  const [authorInput, setAuthorInput] = useState("");
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingOne, setIsLoadingOne] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getToken = () => localStorage.getItem("adminToken");

  const fetchItems = async (preferredId = "") => {
    const token = getToken();
    if (!token) {
      toast.error("Please log in first");
      setIsLoadingList(false);
      return;
    }

    try {
      setIsLoadingList(true);
      const response = await fetch("http://localhost:5000/api/admin/research", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Invalid server response");
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch research");
      }

      const list = data.data || [];
      setItems(list);

      if (!list.length) {
        setSelectedId("");
        setForm(initialForm);
        setAuthorInput("");
        return;
      }

      const targetId =
        (preferredId && list.some((item) => item._id === preferredId) && preferredId) ||
        (selectedId && list.some((item) => item._id === selectedId) && selectedId) ||
        list[0]._id;

      await loadItem(targetId);
    } catch (error) {
      toast.error(error.message || "Failed to fetch research");
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const loadItem = async (id) => {
    if (!id) return;
    const token = getToken();
    if (!token) return;

    try {
      setIsLoadingOne(true);
      const response = await fetch(`http://localhost:5000/api/admin/research/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Invalid response");
      }

      const data = await response.json();
      if (!response.ok || !data.success || !data.data) {
        throw new Error(data.message || "Failed to load research");
      }

      const item = data.data;
      setSelectedId(item._id);
      setForm({
        title: item.title || "",
        description: item.description || "",
        domain: item.domain || "",
        authors: Array.isArray(item.authors) ? item.authors : [],
        publishDate: toDateInputValue(item.publishDate),
        publicationType: item.publicationType || "",
        links: Array.isArray(item.links) ? item.links : [],
      });
      setAuthorInput("");
    } catch (error) {
      toast.error(error.message || "Failed to load research");
    } finally {
      setIsLoadingOne(false);
    }
  };

  const filteredItems = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) => {
      return (
        item.title?.toLowerCase().includes(needle) ||
        item.domain?.toLowerCase().includes(needle) ||
        (item.authors || []).some((author) =>
          String(author || "").toLowerCase().includes(needle)
        )
      );
    });
  }, [items, searchTerm]);

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

  const handleUpdate = async () => {
    if (!selectedId) return;
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

    const token = getToken();
    if (!token) return;

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
      const response = await fetch(`http://localhost:5000/api/admin/research/${selectedId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Invalid update response");
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update research");
      }

      toast.success("Research updated successfully");
      await fetchItems(selectedId);
    } catch (error) {
      toast.error(error.message || "Failed to update research");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    const selected = items.find((item) => item._id === selectedId);
    if (!window.confirm(`Delete "${selected?.title || "this research"}"?`)) return;

    const token = getToken();
    if (!token) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`http://localhost:5000/api/admin/research/${selectedId}`, {
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
        throw new Error(data.message || "Failed to delete research");
      }

      toast.success("Research deleted");
      await fetchItems("");
    } catch (error) {
      toast.error(error.message || "Failed to delete research");
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
                Modify{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  Research
                </span>
              </h2>
              <p className="text-gray-300 text-lg">
                Edit research details, authors, and links
              </p>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-gray-800/70">
              <p className="text-xs text-gray-400">Research Items</p>
              <p className="text-xl font-semibold text-cyan-300">{items.length}</p>
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
                  placeholder="Search research..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/60 border border-gray-800/70 text-white focus:border-blue-500"
                />
              </div>

              <div className="space-y-2 max-h-[68vh] overflow-auto pr-1">
                {isLoadingList ? (
                  <p className="text-sm text-gray-400 py-6 text-center">Loading research...</p>
                ) : filteredItems.length === 0 ? (
                  <p className="text-sm text-gray-500 py-6 text-center">No research found</p>
                ) : (
                  filteredItems.map((item) => {
                    const isActive = selectedId === item._id;
                    return (
                      <button
                        key={item._id}
                        type="button"
                        onClick={() => loadItem(item._id)}
                        className={`w-full text-left p-3 rounded-xl border transition-colors ${
                          isActive
                            ? "bg-blue-900/25 border-blue-700/40"
                            : "bg-black/40 border-gray-800/70 hover:bg-black/60"
                        }`}
                      >
                        <p className="text-sm text-white font-medium truncate">{item.title}</p>
                        <p className="text-xs text-cyan-300 truncate">{item.domain}</p>
                      </button>
                    );
                  })
                )}
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-2">
            {!selectedId ? (
              <GlassCard className="p-10 text-center">
                <FiFileText className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                <p className="text-lg text-gray-300">Select research item to modify</p>
              </GlassCard>
            ) : (
              <GlassCard className="p-6">
                {isLoadingOne ? (
                  <p className="text-gray-400 text-center py-10">Loading research details...</p>
                ) : (
                  <div className="space-y-6">
                    <InputField
                      icon={<FiFileText className="w-4 h-4 text-cyan-400" />}
                      label="Title *"
                      value={form.title}
                      onChange={(value) => handleChange("title", value)}
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleUpdate}
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
                            Update Research
                          </>
                        )}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleDelete}
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
                            Delete Research
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

const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

export default ModifyResearch;
