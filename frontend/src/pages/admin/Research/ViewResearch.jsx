import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import { FiCalendar, FiExternalLink, FiFileText, FiLink, FiSearch, FiTag, FiUser, FiX } from "react-icons/fi";
import AnimatedCanvas from "../../../components/animations/animatedCanvas";
import GlassCard from "../../../components/ui/GlassCard";

const ViewResearch = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [publicationFilter, setPublicationFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchResearch = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      toast.error("Please log in first");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
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
        throw new Error(data.message || "Failed to load research");
      }

      setItems(data.data || []);
    } catch (error) {
      toast.error(error.message || "Failed to fetch research");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResearch();
  }, []);

  const domainOptions = useMemo(() => {
    const unique = Array.from(
      new Set(
        items
          .map((item) => String(item.domain || "").trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));
    return ["all", ...unique];
  }, [items]);

  const filteredItems = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();

    return items.filter((item) => {
      const matchesDomain =
        domainFilter === "all" ||
        String(item.domain || "").toLowerCase() === String(domainFilter).toLowerCase();

      const matchesPublication =
        publicationFilter === "all" || item.publicationType === publicationFilter;

      const matchesSearch =
        !needle ||
        item.title?.toLowerCase().includes(needle) ||
        item.description?.toLowerCase().includes(needle) ||
        item.domain?.toLowerCase().includes(needle) ||
        (item.authors || []).some((author) =>
          String(author || "").toLowerCase().includes(needle)
        ) ||
        (item.links || []).some(
          (link) =>
            link.label?.toLowerCase().includes(needle) ||
            link.url?.toLowerCase().includes(needle)
        );

      return matchesDomain && matchesPublication && matchesSearch;
    });
  }, [items, searchTerm, domainFilter, publicationFilter]);

  const publicationOptions = useMemo(() => {
    const unique = Array.from(
      new Set(
        items
          .map((item) => String(item.publicationType || "").trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));
    return ["all", ...unique];
  }, [items]);

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
                  Research
                </span>
              </h2>
              <p className="text-gray-300 text-lg">
                Browse all research records in organized 3-column cards
              </p>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-gray-800/70">
              <p className="text-xs text-gray-400">Total Research</p>
              <p className="text-xl font-semibold text-cyan-300">{items.length}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <div className="relative md:col-span-3">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search title, domain, author, links..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/60 border border-gray-800/70 text-white focus:border-blue-500"
              />
            </div>

            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/60 border border-gray-800/70 text-white focus:border-blue-500 md:col-span-2"
            >
              {domainOptions.map((option) => (
                <option key={`domain-${option}`} value={option} className="bg-gray-900 text-white">
                  {option === "all" ? "All Domains" : option}
                </option>
              ))}
            </select>

            <select
              value={publicationFilter}
              onChange={(e) => setPublicationFilter(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/60 border border-gray-800/70 text-white focus:border-blue-500 md:col-span-1"
            >
              {publicationOptions.map((option) => (
                <option key={`publication-${option}`} value={option} className="bg-gray-900 text-white">
                  {option === "all" ? "All Published In" : formatPublicationType(option)}
                </option>
              ))}
            </select>
          </div>
        </GlassCard>

        {isLoading ? (
          <div className="h-[55vh] flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-400">Loading research...</p>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <FiFileText className="w-10 h-10 text-gray-500 mx-auto mb-3" />
            <p className="text-lg text-gray-300">No research found</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                  <GlassCard className="p-4 h-full min-h-[220px] flex flex-col hover:border-blue-700/50 transition-colors">
                    <h3 className="text-white text-base font-bold line-clamp-2 min-h-[3rem]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs text-gray-300 whitespace-pre-wrap break-words line-clamp-3 min-h-[3.4rem]">
                      {item.description || "No description"}
                    </p>
                    <p className="mt-2 text-xs text-cyan-300 line-clamp-1">{item.domain}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatPublicationType(item.publicationType)} |{" "}
                      {item.publishDate
                        ? new Date(item.publishDate).toLocaleDateString()
                        : "No date"}
                    </p>

                    <div className="mt-3">
                      <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">
                        Authors
                      </p>
                      <p className="text-xs text-gray-300 line-clamp-3 min-h-[3rem]">
                        {(item.authors || []).join(", ") || "No authors"}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {(item.links || []).length} link(s)
                      </span>
                      <span className="text-xs text-cyan-300">Click to view</span>
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
          <div className="max-w-5xl mx-auto" onClick={(event) => event.stopPropagation()}>
            <GlassCard className="p-5 md:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedItem.title}</h3>
                  <p className="text-sm text-cyan-300 mt-1">{selectedItem.domain}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="p-2 rounded-lg bg-black/50 border border-gray-800/70 text-gray-300 hover:text-white"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <InfoBlock
                    icon={<FiTag className="w-4 h-4" />}
                    label="Domain"
                    value={selectedItem.domain || "N/A"}
                  />
                  <InfoBlock
                    icon={<FiCalendar className="w-4 h-4" />}
                    label="Publish Date"
                    value={
                      selectedItem.publishDate
                        ? new Date(selectedItem.publishDate).toLocaleDateString()
                        : "N/A"
                    }
                  />
                  <InfoBlock
                    icon={<FiFileText className="w-4 h-4" />}
                    label="Published In"
                    value={formatPublicationType(selectedItem.publicationType)}
                  />
                  <div className="rounded-xl border border-gray-800/60 bg-black/35 p-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500 flex items-center gap-1">
                      <span className="text-cyan-400">
                        <FiFileText className="w-4 h-4" />
                      </span>
                      Description
                    </p>
                    <p className="text-sm text-gray-300 mt-1 whitespace-pre-wrap break-words">
                      {selectedItem.description || "No description"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-gray-800/60 bg-black/35 p-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-2 flex items-center gap-1">
                      <FiUser className="w-3.5 h-3.5" />
                      Authors
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(selectedItem.authors || []).length > 0 ? (
                        selectedItem.authors.map((author, index) => (
                          <span
                            key={`${selectedItem._id}-author-${index}`}
                            className="px-2 py-1 text-xs rounded-lg bg-blue-900/30 border border-blue-700/40 text-blue-300"
                          >
                            {author}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500">No authors</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-800/60 bg-black/35 p-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-2 flex items-center gap-1">
                      <FiLink className="w-3.5 h-3.5" />
                      Paper Links
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(selectedItem.links || []).length > 0 ? (
                        selectedItem.links.map((link, index) => (
                          <a
                            key={`${selectedItem._id}-link-${index}`}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs bg-cyan-900/30 border border-cyan-700/40 text-cyan-300 hover:bg-cyan-900/45"
                          >
                            {link.label || "Paper Link"}
                            <FiExternalLink className="w-3 h-3" />
                          </a>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">No links</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoBlock = ({ icon, label, value }) => (
  <div className="rounded-xl border border-gray-800/60 bg-black/35 p-3">
    <p className="text-xs uppercase tracking-wide text-gray-500 flex items-center gap-1">
      <span className="text-cyan-400">{icon}</span>
      {label}
    </p>
    <p className="text-sm text-gray-300 mt-1">{value}</p>
  </div>
);

const formatPublicationType = (value = "journal") =>
  String(value)
    .split(/[\s-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export default ViewResearch;
