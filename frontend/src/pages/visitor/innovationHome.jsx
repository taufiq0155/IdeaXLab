import { useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { FiExternalLink, FiSearch, FiTag, FiX } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import AnimatedCanvas from "../../components/animations/animatedCanvas";
import GlassCard from "../../components/ui/GlassCard";
import VisitorHeader from "./header";
import Footer from "./footer";

const InnovationHome = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchInnovations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:5000/api/public/innovations");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch innovations");
      }

      setItems(data.data || []);
    } catch (error) {
      toast.error(error.message || "Failed to load innovations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInnovations();
  }, []);

  const statusOptions = useMemo(() => {
    const unique = Array.from(
      new Set(items.map((item) => String(item.developmentStatus || "").trim()).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));
    return ["all", ...unique];
  }, [items]);

  const filteredItems = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    return items.filter((item) => {
      const matchesStatus =
        statusFilter === "all" ||
        String(item.developmentStatus || "").toLowerCase() === String(statusFilter).toLowerCase();
      const matchesSearch =
        !needle ||
        item.innovationTitle?.toLowerCase().includes(needle) ||
        item.problemStatement?.toLowerCase().includes(needle) ||
        item.proposedIotSolution?.toLowerCase().includes(needle);
      return matchesStatus && matchesSearch;
    });
  }, [items, searchTerm, statusFilter]);

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
              Innovation
            </h1>
            <p className={`mt-2 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              Explore IoT-focused innovation concepts, prototypes, and deployments.
            </p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="relative md:col-span-8">
                <FiSearch
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search innovations..."
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                    isDark
                      ? "bg-black/40 border-gray-800 text-white placeholder-gray-500"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                  }`}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className={`md:col-span-4 px-4 py-3 rounded-xl border ${
                  isDark
                    ? "bg-black/40 border-gray-800 text-white"
                    : "bg-white border-gray-200 text-gray-900"
                }`}
              >
                {statusOptions.map((option) => (
                  <option key={`status-${option}`} value={option}>
                    {option === "all" ? "All Status" : toTitle(option)}
                  </option>
                ))}
              </select>
            </div>
          </GlassCard>

          {isLoading ? (
            <div className="h-72 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <span className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                <p className={`mt-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>Loading innovations...</p>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <GlassCard theme={theme}>
              <div className="text-center py-14">
                <p className={`text-xl ${isDark ? "text-gray-300" : "text-gray-700"}`}>No innovations found</p>
              </div>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <GlassCard
                  key={item._id}
                  theme={theme}
                  className="h-[360px] cursor-pointer hover:scale-[1.01] transition-transform"
                >
                  <article
                    className="h-full flex flex-col"
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
                    <h2 className={`text-lg font-bold line-clamp-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                      {item.innovationTitle}
                    </h2>
                    <span className={`mt-2 inline-flex w-fit items-center gap-1 text-xs px-2 py-1 rounded-full ${
                      isDark ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-700"
                    }`}>
                      <FiTag className="w-3 h-3" />
                      {toTitle(item.developmentStatus)}
                    </span>
                    <p className={`mt-3 text-sm line-clamp-3 min-h-[4.2rem] ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                      {item.problemStatement || "No problem statement"}
                    </p>
                    <p className={`mt-2 text-sm line-clamp-3 min-h-[4.2rem] ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      {item.proposedIotSolution || "No proposed solution"}
                    </p>
                    <p className={`mt-auto pt-3 text-xs ${isDark ? "text-cyan-300" : "text-cyan-700"}`}>
                      Click to view full details
                    </p>
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
                Innovation Details
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
                {selectedItem.innovationTitle}
              </h2>
              <span className={`mt-3 inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                isDark ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-700"
              }`}>
                {toTitle(selectedItem.developmentStatus)}
              </span>

              <section className="mt-4">
                <h4 className={`font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Problem Statement</h4>
                <p className={`${isDark ? "text-gray-300" : "text-gray-700"} whitespace-pre-wrap break-words`}>
                  {selectedItem.problemStatement || "N/A"}
                </p>
              </section>

              <section className="mt-4">
                <h4 className={`font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Proposed IoT Solution</h4>
                <p className={`${isDark ? "text-gray-300" : "text-gray-700"} whitespace-pre-wrap break-words`}>
                  {selectedItem.proposedIotSolution || "N/A"}
                </p>
              </section>

              <section className="mt-4">
                <h4 className={`font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Technologies Used</h4>
                <div className={`text-sm space-y-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  <p><strong>Sensors:</strong> {selectedItem.technologiesUsed?.sensors || "N/A"}</p>
                  <p><strong>Microcontroller:</strong> {selectedItem.technologiesUsed?.microcontroller || "N/A"}</p>
                  <p><strong>Communication:</strong> {selectedItem.technologiesUsed?.communication || "N/A"}</p>
                </div>
              </section>

              {!!selectedItem.links?.length && (
                <div className="mt-6">
                  <h4 className={`font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                    Innovation Links
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.links.map((link, index) => (
                      <a
                        key={`${selectedItem._id}-link-${index}`}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg ${
                          isDark ? "bg-cyan-900/30 text-cyan-300" : "bg-cyan-100 text-cyan-700"
                        }`}
                      >
                        {link.label || "Link"}
                        <FiExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer theme={theme} />
    </div>
  );
};

const toTitle = (value = "") =>
  String(value || "")
    .split(/[\s-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export default InnovationHome;

