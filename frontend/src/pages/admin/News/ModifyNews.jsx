import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import {
  FiAlignLeft,
  FiCalendar,
  FiEdit,
  FiFilter,
  FiSave,
  FiSearch,
  FiTag,
  FiTrash2,
  FiType,
} from "react-icons/fi";
import AnimatedCanvas from "../../../components/animations/animatedCanvas";
import GlassCard from "../../../components/ui/GlassCard";

const initialForm = {
  title: "",
  date: "",
  category: "",
  year: "",
  description: "",
};

const ModifyNews = () => {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState(initialForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
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
      const response = await fetch("http://localhost:5000/api/admin/news", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Invalid server response");
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch news");
      }

      const list = data.data || [];
      setItems(list);

      if (!list.length) {
        setSelectedId("");
        setForm(initialForm);
        return;
      }

      const targetId =
        (preferredId && list.some((item) => item._id === preferredId) && preferredId) ||
        (selectedId && list.some((item) => item._id === selectedId) && selectedId) ||
        list[0]._id;

      await loadItem(targetId);
    } catch (error) {
      toast.error(error.message || "Failed to fetch news");
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
      const response = await fetch(`http://localhost:5000/api/admin/news/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Invalid response");
      }

      const data = await response.json();
      if (!response.ok || !data.success || !data.data) {
        throw new Error(data.message || "Failed to load news");
      }

      const item = data.data;
      setSelectedId(item._id);
      setForm({
        title: item.title || "",
        date: toDateInputValue(item.date),
        category: item.category || "",
        year: item.year ? String(item.year) : "",
        description: item.description || "",
      });
    } catch (error) {
      toast.error(error.message || "Failed to load news");
    } finally {
      setIsLoadingOne(false);
    }
  };

  const categoryOptions = useMemo(() => {
    const unique = Array.from(
      new Set(items.map((item) => String(item.category || "").trim()).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));
    return ["all", ...unique];
  }, [items]);

  const yearOptions = useMemo(() => {
    const uniqueYears = Array.from(
      new Set(
        items
          .map((item) => Number(item.year))
          .filter((value) => Number.isFinite(value))
      )
    ).sort((a, b) => b - a);
    return ["all", ...uniqueYears.map((value) => String(value))];
  }, [items]);

  const filteredItems = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();

    return items
      .filter((item) => {
        const matchesCategory =
          categoryFilter === "all" ||
          String(item.category || "").toLowerCase() === String(categoryFilter).toLowerCase();
        const matchesYear = yearFilter === "all" || String(item.year || "") === String(yearFilter);
        const matchesSearch =
          !needle ||
          item.title?.toLowerCase().includes(needle) ||
          item.category?.toLowerCase().includes(needle) ||
          item.description?.toLowerCase().includes(needle) ||
          String(item.year || "").includes(needle);

        return matchesCategory && matchesYear && matchesSearch;
      })
      .sort((a, b) => toTimestamp(b.date) - toTimestamp(a.date));
  }, [items, searchTerm, categoryFilter, yearFilter]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    if (!selectedId) return;

    const normalizedTitle = String(form.title || "").trim();
    const normalizedDate = String(form.date || "").trim();
    const normalizedCategory = String(form.category || "").trim();
    const normalizedYear = String(form.year || "").trim();
    const normalizedDescription = String(form.description || "").trim();

    const missing = [];
    if (!normalizedTitle) missing.push("Title");
    if (!normalizedDate) missing.push("Date");
    if (!normalizedCategory) missing.push("Category");
    if (!normalizedYear) missing.push("Year");
    if (!normalizedDescription) missing.push("Description");

    if (missing.length) {
      toast.error(`Please fill: ${missing.join(", ")}`);
      return;
    }

    const yearNumber = Number(normalizedYear);
    if (!Number.isFinite(yearNumber) || yearNumber < 1900 || yearNumber > 2100) {
      toast.error("Please enter a valid year (1900-2100)");
      return;
    }

    const token = getToken();
    if (!token) return;

    try {
      setIsSaving(true);
      const response = await fetch(`http://localhost:5000/api/admin/news/${selectedId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: normalizedTitle,
          date: normalizedDate,
          category: normalizedCategory,
          year: Math.trunc(yearNumber),
          description: normalizedDescription,
        }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Invalid update response");
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update news");
      }

      toast.success("News updated successfully");
      await fetchItems(selectedId);
    } catch (error) {
      toast.error(error.message || "Failed to update news");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    const selected = items.find((item) => item._id === selectedId);
    if (!window.confirm(`Delete "${selected?.title || "this news"}"?`)) return;

    const token = getToken();
    if (!token) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`http://localhost:5000/api/admin/news/${selectedId}`, {
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
        throw new Error(data.message || "Failed to delete news");
      }

      toast.success("News deleted");
      await fetchItems("");
    } catch (error) {
      toast.error(error.message || "Failed to delete news");
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
                  News
                </span>
              </h2>
              <p className="text-gray-300 text-lg">
                Edit news and sort using category/year filters
              </p>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-gray-800/70">
              <p className="text-xs text-gray-400">News Items</p>
              <p className="text-xl font-semibold text-cyan-300">{items.length}</p>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <GlassCard className="p-4">
              <div className="relative mb-3">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search news..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/60 border border-gray-800/70 text-white focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-gray-800/70 text-white focus:border-blue-500 text-sm"
                >
                  {categoryOptions.map((option) => (
                    <option key={`category-filter-${option}`} value={option} className="bg-gray-900 text-white">
                      {option === "all" ? "All Categories" : option}
                    </option>
                  ))}
                </select>

                <select
                  value={yearFilter}
                  onChange={(event) => setYearFilter(event.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-gray-800/70 text-white focus:border-blue-500 text-sm"
                >
                  {yearOptions.map((option) => (
                    <option key={`year-filter-${option}`} value={option} className="bg-gray-900 text-white">
                      {option === "all" ? "All Years" : option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 max-h-[64vh] overflow-auto pr-1">
                {isLoadingList ? (
                  <p className="text-sm text-gray-400 py-6 text-center">Loading news...</p>
                ) : filteredItems.length === 0 ? (
                  <p className="text-sm text-gray-500 py-6 text-center">No news found</p>
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
                        <p className="text-xs text-cyan-300 truncate">
                          {item.category} | {item.year}
                        </p>
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
                <FiEdit className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                <p className="text-lg text-gray-300">Select a news item to modify</p>
              </GlassCard>
            ) : (
              <GlassCard className="p-6">
                {isLoadingOne ? (
                  <p className="text-gray-400 text-center py-10">Loading news details...</p>
                ) : (
                  <div className="space-y-6">
                    <InputField
                      icon={<FiType className="w-4 h-4 text-cyan-400" />}
                      label="Title *"
                      value={form.title}
                      onChange={(value) => handleChange("title", value)}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <InputField
                        icon={<FiCalendar className="w-4 h-4 text-cyan-400" />}
                        label="Date *"
                        value={form.date}
                        onChange={(value) => handleChange("date", value)}
                        placeholder="YYYY-MM-DD"
                      />
                      <InputField
                        icon={<FiTag className="w-4 h-4 text-cyan-400" />}
                        label="Category *"
                        value={form.category}
                        onChange={(value) => handleChange("category", value)}
                      />
                      <InputField
                        icon={<FiFilter className="w-4 h-4 text-cyan-400" />}
                        label="Year *"
                        value={form.year}
                        onChange={(value) => handleChange("year", value)}
                        type="number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <FiAlignLeft className="w-4 h-4 text-cyan-400" />
                        Description *
                      </label>
                      <textarea
                        value={form.description}
                        onChange={(event) => handleChange("description", event.target.value)}
                        className="w-full px-4 py-3 bg-black/60 border border-gray-800/70 rounded-xl text-white focus:border-blue-500 min-h-[180px]"
                        placeholder="News description"
                      />
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
                            Update News
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
                            Delete News
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
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 bg-black/60 border border-gray-800/70 rounded-xl text-white focus:border-blue-500"
    />
  </div>
);

const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || "");
  return date.toISOString().slice(0, 10);
};

const toTimestamp = (value) => {
  const parsed = new Date(value || "").getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

export default ModifyNews;

