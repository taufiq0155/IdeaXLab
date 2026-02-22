import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import {
  FiAlignLeft,
  FiCalendar,
  FiFileText,
  FiFilter,
  FiSearch,
  FiTag,
  FiType,
  FiX,
} from "react-icons/fi";
import AnimatedCanvas from "../../../components/animations/animatedCanvas";
import GlassCard from "../../../components/ui/GlassCard";

const ViewNews = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [sortMode, setSortMode] = useState("date_desc");
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchNews = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      toast.error("Please log in first");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
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

      setItems(data.data || []);
    } catch (error) {
      toast.error(error.message || "Failed to fetch news");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

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

    const filtered = items.filter((item) => {
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
    });

    return [...filtered].sort((a, b) => {
      if (sortMode === "category_asc") {
        return String(a.category || "").localeCompare(String(b.category || ""));
      }
      if (sortMode === "category_desc") {
        return String(b.category || "").localeCompare(String(a.category || ""));
      }
      if (sortMode === "year_asc") {
        return Number(a.year || 0) - Number(b.year || 0);
      }
      if (sortMode === "year_desc") {
        return Number(b.year || 0) - Number(a.year || 0);
      }
      if (sortMode === "date_asc") {
        return toTimestamp(a.date) - toTimestamp(b.date);
      }
      return toTimestamp(b.date) - toTimestamp(a.date);
    });
  }, [items, searchTerm, categoryFilter, yearFilter, sortMode]);

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
                View{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  News
                </span>
              </h2>
              <p className="text-gray-300 text-lg">
                Sort and filter news by category and year
              </p>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-gray-800/70">
              <p className="text-xs text-gray-400">Total News</p>
              <p className="text-xl font-semibold text-cyan-300">{items.length}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="relative md:col-span-4">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search title/category/year..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/60 border border-gray-800/70 text-white focus:border-blue-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/60 border border-gray-800/70 text-white focus:border-blue-500 md:col-span-3"
            >
              {categoryOptions.map((option) => (
                <option key={`category-${option}`} value={option} className="bg-gray-900 text-white">
                  {option === "all" ? "All Categories" : option}
                </option>
              ))}
            </select>

            <select
              value={yearFilter}
              onChange={(event) => setYearFilter(event.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/60 border border-gray-800/70 text-white focus:border-blue-500 md:col-span-2"
            >
              {yearOptions.map((option) => (
                <option key={`year-${option}`} value={option} className="bg-gray-900 text-white">
                  {option === "all" ? "All Years" : option}
                </option>
              ))}
            </select>

            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/60 border border-gray-800/70 text-white focus:border-blue-500 md:col-span-3"
            >
              <option value="date_desc" className="bg-gray-900 text-white">
                Date (Newest)
              </option>
              <option value="date_asc" className="bg-gray-900 text-white">
                Date (Oldest)
              </option>
              <option value="category_asc" className="bg-gray-900 text-white">
                Category (A-Z)
              </option>
              <option value="category_desc" className="bg-gray-900 text-white">
                Category (Z-A)
              </option>
              <option value="year_desc" className="bg-gray-900 text-white">
                Year (Newest)
              </option>
              <option value="year_asc" className="bg-gray-900 text-white">
                Year (Oldest)
              </option>
            </select>
          </div>
        </GlassCard>

        {isLoading ? (
          <div className="h-[55vh] flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-400">Loading news...</p>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <FiFileText className="w-10 h-10 text-gray-500 mx-auto mb-3" />
            <p className="text-lg text-gray-300">No news found</p>
          </GlassCard>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className="w-full text-left"
                >
                  <GlassCard className="p-4 hover:border-blue-700/50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="min-w-0 md:flex-1">
                        <h3 className="text-white text-lg font-bold line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm text-gray-300 whitespace-pre-wrap break-words line-clamp-2">
                          {item.description || "No description"}
                        </p>
                      </div>

                      <div className="md:w-[280px] md:flex-shrink-0">
                        <div className="flex flex-wrap md:justify-end items-center gap-2">
                          <span className="px-2 py-1 rounded-lg text-[11px] bg-blue-900/30 border border-blue-700/40 text-blue-300">
                            {item.category || "Category"}
                          </span>
                          <span className="px-2 py-1 rounded-lg text-[11px] bg-cyan-900/30 border border-cyan-700/40 text-cyan-300">
                            {item.year || "Year"}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-gray-500 md:text-right">
                          {formatDate(item.date) || "No date"}
                        </p>
                        <div className="mt-3 flex items-center md:justify-end gap-2 text-xs text-cyan-300">
                          <FiFilter className="w-3.5 h-3.5" />
                          Click to view
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {selectedItem && (
        <div
          className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm p-4 md:p-8 overflow-y-auto"
          onClick={() => setSelectedItem(null)}
        >
          <div className="max-w-4xl mx-auto" onClick={(event) => event.stopPropagation()}>
            <GlassCard className="p-5 md:p-7">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-2xl font-bold text-white">{selectedItem.title}</h3>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="p-2 rounded-lg bg-black/50 border border-gray-800/70 text-gray-300 hover:text-white"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
                <InfoBlock
                  icon={<FiTag className="w-4 h-4" />}
                  label="Category"
                  value={selectedItem.category || "N/A"}
                />
                <InfoBlock
                  icon={<FiCalendar className="w-4 h-4" />}
                  label="Date"
                  value={formatDate(selectedItem.date) || "N/A"}
                />
                <InfoBlock
                  icon={<FiType className="w-4 h-4" />}
                  label="Year"
                  value={String(selectedItem.year || "N/A")}
                />
                <InfoBlock
                  icon={<FiAlignLeft className="w-4 h-4" />}
                  label="Description"
                  value={selectedItem.description || "N/A"}
                  multiline
                />
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoBlock = ({ icon, label, value, multiline = false }) => (
  <div className="rounded-xl border border-gray-800/60 bg-black/35 p-3">
    <p className="text-xs uppercase tracking-wide text-gray-500 flex items-center gap-1">
      <span className="text-cyan-400">{icon}</span>
      {label}
    </p>
    <p
      className={`text-sm text-gray-300 mt-1 ${
        multiline ? "whitespace-pre-wrap break-words min-h-[5rem]" : ""
      }`}
    >
      {value}
    </p>
  </div>
);

const toTimestamp = (value) => {
  const parsed = new Date(value || "").getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const formatDate = (value) => {
  const timestamp = toTimestamp(value);
  if (!timestamp) return String(value || "");
  return new Date(timestamp).toLocaleDateString();
};

export default ViewNews;
