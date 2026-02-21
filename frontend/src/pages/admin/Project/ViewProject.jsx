import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import {
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
  FiImage,
  FiLink,
  FiSearch,
} from "react-icons/fi";
import AnimatedCanvas from "../../../components/animations/animatedCanvas";
import GlassCard from "../../../components/ui/GlassCard";

const ViewProject = () => {
  const PAGE_SIZE = 6;
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [slideIndexById, setSlideIndexById] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProjects = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      toast.error("Please log in first");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
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
        throw new Error(data.message || "Failed to load projects");
      }

      const list = data.data || [];
      setProjects(list);
      setSlideIndexById((prev) => {
        const next = { ...prev };
        list.forEach((item) => {
          if (typeof next[item._id] !== "number") next[item._id] = 0;
        });
        return next;
      });
    } catch (error) {
      toast.error(error.message || "Failed to fetch projects");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesStatus = statusFilter === "all" || project.status === statusFilter;
      const matchesSearch =
        !needle ||
        project.title?.toLowerCase().includes(needle) ||
        project.description?.toLowerCase().includes(needle) ||
        (project.links || []).some(
          (link) =>
            link.label?.toLowerCase().includes(needle) ||
            link.url?.toLowerCase().includes(needle)
        );
      return matchesStatus && matchesSearch;
    });
  }, [projects, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / PAGE_SIZE));
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProjects.slice(start, start + PAGE_SIZE);
  }, [filteredProjects, currentPage, PAGE_SIZE]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const moveSlide = (projectId, direction, total) => {
    if (total <= 1) return;
    setSlideIndexById((prev) => {
      const current = prev[projectId] || 0;
      const next =
        direction === "next"
          ? (current + 1) % total
          : (current - 1 + total) % total;
      return { ...prev, [projectId]: next };
    });
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
                View <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Projects</span>
              </h2>
              <p className="text-gray-300 text-lg">Browse project cards with slideshow and links</p>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-gray-800/70">
              <p className="text-xs text-gray-400">Total Projects</p>
              <p className="text-xl font-semibold text-cyan-300">{projects.length}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative md:col-span-3">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search title, description, links..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/60 border border-gray-800/70 text-white focus:border-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/60 border border-gray-800/70 text-white focus:border-blue-500"
            >
              <option value="all" className="bg-gray-900 text-white">All Status</option>
              <option value="published" className="bg-gray-900 text-white">Published</option>
              <option value="draft" className="bg-gray-900 text-white">Draft</option>
            </select>
          </div>
        </GlassCard>

        {isLoading ? (
          <div className="h-[55vh] flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-400">Loading projects...</p>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <FiImage className="w-10 h-10 text-gray-500 mx-auto mb-3" />
            <p className="text-lg text-gray-300">No project found</p>
          </GlassCard>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {paginatedProjects.map((project) => {
              const images = Array.isArray(project.images) ? project.images : [];
              const slideIndex = Math.min(slideIndexById[project._id] || 0, Math.max(images.length - 1, 0));
              const currentImage = images[slideIndex];

              return (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <GlassCard className="p-5 h-full">
                    <div className="relative rounded-xl overflow-hidden border border-gray-800/70 bg-black/50">
                      {currentImage ? (
                        <img
                          src={currentImage.imageUrl}
                          alt={currentImage.altText || project.title}
                          className="w-full h-56 object-cover"
                        />
                      ) : (
                        <div className="h-56 flex items-center justify-center">
                          <FiImage className="w-10 h-10 text-gray-500" />
                        </div>
                      )}

                      {images.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() => moveSlide(project._id, "prev", images.length)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-black/60 text-white"
                          >
                            <FiChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSlide(project._id, "next", images.length)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-black/60 text-white"
                          >
                            <FiChevronRight className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-2 right-2 text-xs text-white bg-black/70 px-2 py-1 rounded-lg">
                            {slideIndex + 1}/{images.length}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <h3 className="text-white text-xl font-bold">{project.title}</h3>
                      <span
                        className={`px-2 py-1 rounded-lg text-xs border ${
                          project.status === "draft"
                            ? "text-yellow-300 bg-yellow-900/30 border-yellow-700/40"
                            : "text-green-300 bg-green-900/30 border-green-700/40"
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>

                    <p className="mt-2 text-gray-300 text-sm leading-relaxed line-clamp-4">
                      {project.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {(project.links || []).map((link, idx) => (
                        <a
                          key={`${project._id}-link-${idx}`}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-cyan-900/30 border border-cyan-700/40 text-cyan-300 hover:bg-cyan-900/45"
                        >
                          <FiLink className="w-3.5 h-3.5" />
                          {link.label || "Link"}
                          <FiExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm border border-gray-700 text-gray-300 hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronLeft className="w-4 h-4" />
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                  <button
                    key={`admin-project-page-${page}`}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg text-sm border ${
                      currentPage === page
                        ? "bg-blue-900/40 border-blue-700/50 text-white"
                        : "border-gray-700 text-gray-300 hover:bg-blue-900/20"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm border border-gray-700 text-gray-300 hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ViewProject;
