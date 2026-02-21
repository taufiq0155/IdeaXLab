import { useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import {
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
  FiImage,
  FiSearch,
  FiX,
} from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import AnimatedCanvas from "../../components/animations/animatedCanvas";
import GlassCard from "../../components/ui/GlassCard";
import VisitorHeader from "./header";
import Footer from "./footer";

const ProjectHome = () => {
  const PAGE_SIZE = 6;
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [modalSlideIndex, setModalSlideIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:5000/api/public/projects");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch projects");
      }

      const list = data.data || [];
      setProjects(list);
    } catch (error) {
      toast.error(error.message || "Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    if (!needle) return projects;
    return projects.filter((project) => {
      const descriptionText = toPlainText(project.description || "").toLowerCase();
      return (
        project.title?.toLowerCase().includes(needle) ||
        descriptionText.includes(needle) ||
        (project.links || []).some(
          (link) =>
            link.label?.toLowerCase().includes(needle) ||
            link.url?.toLowerCase().includes(needle)
        )
      );
    });
  }, [projects, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / PAGE_SIZE));
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProjects.slice(start, start + PAGE_SIZE);
  }, [filteredProjects, currentPage, PAGE_SIZE]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const moveSlide = (direction, total) => {
    if (total <= 1) return;
    setModalSlideIndex((prev) =>
      direction === "next" ? (prev + 1) % total : (prev - 1 + total) % total
    );
  };

  const openProjectModal = (project) => {
    setSelectedProject(project);
    setModalSlideIndex(0);
  };

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
              Projects
            </h1>
            <p className={`mt-2 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              Research and development works with photos, video links, and external references.
            </p>

            <div className="relative mt-4">
              <FiSearch
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-500" : "text-gray-400"}`}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search projects..."
                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                  isDark
                    ? "bg-black/40 border-gray-800 text-white placeholder-gray-500"
                    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                }`}
              />
            </div>
          </GlassCard>

          {isLoading ? (
            <div className="h-72 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <span className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                <p className={`mt-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>Loading projects...</p>
              </div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <GlassCard theme={theme}>
              <div className="text-center py-14">
                <p className={`text-xl ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  No projects found
                </p>
              </div>
            </GlassCard>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginatedProjects.map((project) => {
                const images = Array.isArray(project.images) ? project.images : [];
                const coverImage = images[0];
                const visibleLinks = (project.links || []).slice(0, 2);
                const extraLinks = Math.max((project.links || []).length - visibleLinks.length, 0);

                return (
                  <GlassCard
                    key={project._id}
                    theme={theme}
                    className="h-[500px] cursor-pointer hover:scale-[1.01] transition-transform"
                  >
                    <div
                      className="h-full flex flex-col"
                      onClick={() => openProjectModal(project)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openProjectModal(project);
                        }
                      }}
                    >
                      <div className="relative rounded-xl overflow-hidden border border-gray-800/40 bg-black/30">
                        {coverImage ? (
                          <img
                            src={coverImage.imageUrl}
                            alt={coverImage.altText || project.title}
                            className="w-full h-52 object-cover"
                          />
                        ) : (
                          <div className="h-52 flex items-center justify-center">
                            <FiImage className={`w-10 h-10 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
                          </div>
                        )}
                      </div>

                      <h2 className={`mt-4 text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {project.title}
                      </h2>
                      <p className={`mt-2 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        Click to view full description and all project details.
                      </p>

                      <div className="mt-auto pt-4 flex flex-wrap gap-2 items-center">
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg ${
                            isDark ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {images.length} image(s)
                        </span>
                        {visibleLinks.map((link, index) => (
                          <a
                            key={`${project._id}-link-${index}`}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className={`inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg ${
                              isDark ? "bg-cyan-900/30 text-cyan-300" : "bg-cyan-100 text-cyan-700"
                            }`}
                          >
                            {link.label || "Project Link"}
                            <FiExternalLink className="w-3 h-3" />
                          </a>
                        ))}
                        {extraLinks > 0 && (
                          <span
                            className={`inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg ${
                              isDark ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            +{extraLinks} more
                          </span>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
              {totalPages > 1 && (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm border disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDark
                        ? "border-gray-700 text-gray-300 hover:bg-blue-900/20"
                        : "border-gray-200 text-gray-700 hover:bg-blue-50"
                    }`}
                  >
                    <FiChevronLeft className="w-4 h-4" />
                    Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                    <button
                      key={`project-page-${page}`}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg text-sm border ${
                        currentPage === page
                          ? isDark
                            ? "bg-blue-900/40 border-blue-700/50 text-white"
                            : "bg-blue-100 border-blue-300 text-blue-800"
                          : isDark
                          ? "border-gray-700 text-gray-300 hover:bg-blue-900/20"
                          : "border-gray-200 text-gray-700 hover:bg-blue-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm border disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDark
                        ? "border-gray-700 text-gray-300 hover:bg-blue-900/20"
                        : "border-gray-200 text-gray-700 hover:bg-blue-50"
                    }`}
                  >
                    Next
                    <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {selectedProject && (
        <div
          className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className={`w-full max-w-5xl max-h-[90vh] overflow-auto rounded-2xl border ${
              isDark ? "bg-black border-gray-800" : "bg-white border-gray-200"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 px-5 py-4 border-b border-gray-800/60 bg-inherit flex items-center justify-between">
              <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                Project Details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className={`p-2 rounded-lg ${
                  isDark ? "text-gray-300 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              <div className="relative rounded-xl overflow-hidden border border-gray-800/40 bg-black/40">
                {(selectedProject.images || []).length > 0 ? (
                  <img
                    src={selectedProject.images[modalSlideIndex]?.imageUrl}
                    alt={
                      selectedProject.images[modalSlideIndex]?.altText ||
                      selectedProject.title
                    }
                    className="w-full h-[24rem] object-cover"
                  />
                ) : (
                  <div className="h-[24rem] flex items-center justify-center">
                    <FiImage className={`w-12 h-12 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
                  </div>
                )}

                {(selectedProject.images || []).length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => moveSlide("prev", selectedProject.images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/65 text-white flex items-center justify-center"
                    >
                      <FiChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSlide("next", selectedProject.images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/65 text-white flex items-center justify-center"
                    >
                      <FiChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-3 right-3 text-xs text-white bg-black/70 px-2 py-1 rounded-lg">
                      {modalSlideIndex + 1}/{selectedProject.images.length}
                    </div>
                  </>
                )}
              </div>

              <h2 className={`mt-5 text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                {selectedProject.title}
              </h2>

              {isHtmlString(selectedProject.description || "") ? (
                <div
                  className={`mt-3 prose max-w-none ${
                    isDark ? "prose-invert" : ""
                  } prose-p:leading-relaxed prose-headings:mb-3`}
                  dangerouslySetInnerHTML={{ __html: selectedProject.description }}
                />
              ) : (
                <p className={`mt-3 ${isDark ? "text-gray-300" : "text-gray-700"} leading-relaxed whitespace-pre-wrap break-words`}>
                  {String(selectedProject.description || "").trim() || "No description provided."}
                </p>
              )}

              {!!selectedProject.links?.length && (
                <div className="mt-6">
                  <h4 className={`font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                    Project Links
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.links.map((link, index) => (
                      <a
                        key={`${selectedProject._id}-modal-link-${index}`}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg ${
                          isDark ? "bg-cyan-900/30 text-cyan-300" : "bg-cyan-100 text-cyan-700"
                        }`}
                      >
                        {link.label || "Project Link"}
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

export default ProjectHome;

function isHtmlString(value) {
  const text = String(value || "").trim();
  if (!text) return false;
  return /<\/?[a-z][\s\S]*>/i.test(text);
}

function toPlainText(value) {
  return String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
