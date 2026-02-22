import { useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { FiCalendar, FiFilter, FiSearch, FiTag, FiX } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import AnimatedCanvas from "../../components/animations/animatedCanvas";
import GlassCard from "../../components/ui/GlassCard";
import VisitorHeader from "./header";
import Footer from "./footer";

const NewsHome = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:5000/api/public/news");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch news");
      }

      setItems(data.data || []);
    } catch (error) {
      toast.error(error.message || "Failed to load news");
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
      new Set(items.map((item) => Number(item.year)).filter((value) => Number.isFinite(value)))
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
          item.description?.toLowerCase().includes(needle) ||
          item.category?.toLowerCase().includes(needle);
        return matchesCategory && matchesYear && matchesSearch;
      })
      .sort((a, b) => toTimestamp(b.date) - toTimestamp(a.date));
  }, [items, searchTerm, categoryFilter, yearFilter]);

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
              News
            </h1>
            <p className={`mt-2 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              Latest news and announcements sorted by category and year.
            </p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="relative md:col-span-6">
                <FiSearch
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search news..."
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                    isDark
                      ? "bg-black/40 border-gray-800 text-white placeholder-gray-500"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                  }`}
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className={`md:col-span-4 px-4 py-3 rounded-xl border ${
                  isDark
                    ? "bg-black/40 border-gray-800 text-white"
                    : "bg-white border-gray-200 text-gray-900"
                }`}
              >
                {categoryOptions.map((option) => (
                  <option key={`category-${option}`} value={option}>
                    {option === "all" ? "All Categories" : option}
                  </option>
                ))}
              </select>
              <select
                value={yearFilter}
                onChange={(event) => setYearFilter(event.target.value)}
                className={`md:col-span-2 px-4 py-3 rounded-xl border ${
                  isDark
                    ? "bg-black/40 border-gray-800 text-white"
                    : "bg-white border-gray-200 text-gray-900"
                }`}
              >
                {yearOptions.map((option) => (
                  <option key={`year-${option}`} value={option}>
                    {option === "all" ? "All Years" : option}
                  </option>
                ))}
              </select>
            </div>
          </GlassCard>

          {isLoading ? (
            <div className="h-72 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <span className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                <p className={`mt-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>Loading news...</p>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <GlassCard theme={theme}>
              <div className="text-center py-14">
                <p className={`text-xl ${isDark ? "text-gray-300" : "text-gray-700"}`}>No news found</p>
              </div>
            </GlassCard>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <GlassCard key={item._id} theme={theme} className="cursor-pointer">
                  <article
                    className="flex flex-col md:flex-row md:items-start md:justify-between gap-4"
                    onClick={() => setSelectedItem(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedItem(item);
                      }
                    }}
                  >
                    <div className="min-w-0 md:flex-1">
                      <h2 className={`text-lg font-bold line-clamp-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                        {item.title}
                      </h2>
                      <p className={`mt-2 text-sm line-clamp-2 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                        {item.description}
                      </p>
                    </div>

                    <div className="md:w-[280px] md:flex-shrink-0">
                      <div className="flex flex-wrap md:justify-end gap-2">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                          isDark ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-700"
                        }`}>
                          <FiTag className="w-3 h-3" />
                          {item.category}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                          isDark ? "bg-cyan-900/30 text-cyan-300" : "bg-cyan-100 text-cyan-700"
                        }`}>
                          <FiFilter className="w-3 h-3" />
                          {item.year}
                        </span>
                      </div>
                      <p className={`mt-2 text-xs md:text-right ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        <FiCalendar className="inline w-3.5 h-3.5 mr-1" />
                        {formatDate(item.date)}
                      </p>
                    </div>
                  </article>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedItem && (
        <div
          className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className={`w-full max-w-4xl max-h-[90vh] overflow-auto rounded-2xl border ${
              isDark ? "bg-black border-gray-800" : "bg-white border-gray-200"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 px-5 py-4 border-b border-gray-800/60 bg-inherit flex items-center justify-between">
              <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                News Details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className={`p-2 rounded-lg ${
                  isDark ? "text-gray-300 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                {selectedItem.title}
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                  isDark ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-700"
                }`}>
                  {selectedItem.category}
                </span>
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                  isDark ? "bg-cyan-900/30 text-cyan-300" : "bg-cyan-100 text-cyan-700"
                }`}>
                  {selectedItem.year}
                </span>
                <span className={`inline-flex items-center gap-1 text-xs ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}>
                  <FiCalendar className="w-3.5 h-3.5" />
                  {formatDate(selectedItem.date)}
                </span>
              </div>

              <p className={`mt-4 leading-relaxed whitespace-pre-wrap break-words ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}>
                {selectedItem.description}
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer theme={theme} />
    </div>
  );
};

const toTimestamp = (value) => {
  const parsed = new Date(value || "").getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const formatDate = (value) => {
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString();
};

export default NewsHome;

