import { useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { FiCalendar, FiChevronLeft, FiChevronRight, FiExternalLink, FiTag, FiX } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import AnimatedCanvas from "../../components/animations/animatedCanvas";
import GlassCard from "../../components/ui/GlassCard";
import VisitorHeader from "./header";
import Footer from "./footer";

const BlogsHome = () => {
  const PAGE_SIZE = 9;
  const { theme } = useTheme();
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [categoryRes, blogRes] = await Promise.all([
        fetch("http://localhost:5000/api/public/blog-categories"),
        fetch("http://localhost:5000/api/public/blogs"),
      ]);

      const categoryData = await categoryRes.json();
      const blogData = await blogRes.json();

      if (!categoryRes.ok || !categoryData.success) {
        throw new Error(categoryData.message || "Failed to load categories");
      }
      if (!blogRes.ok || !blogData.success) {
        throw new Error(blogData.message || "Failed to load blogs");
      }

      setCategories(categoryData.data || []);
      setBlogs(blogData.data || []);
    } catch (error) {
      toast.error(error.message || "Failed to fetch blog data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredBlogs = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    return blogs.filter((blog) => {
      const matchesCategory =
        activeCategory === "all" ||
        String(blog.category?._id || "") === activeCategory ||
        String(blog.category?.slug || "") === activeCategory;

      const matchesSearch =
        !needle ||
        blog.title?.toLowerCase().includes(needle) ||
        blog.excerpt?.toLowerCase().includes(needle) ||
        blog.category?.name?.toLowerCase().includes(needle);

      return matchesCategory && matchesSearch;
    });
  }, [blogs, activeCategory, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / PAGE_SIZE));
  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredBlogs.slice(start, start + PAGE_SIZE);
  }, [filteredBlogs, currentPage, PAGE_SIZE]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const isDark = theme === "dark";

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
            <div className="flex flex-col gap-4">
              <h1 className={`text-3xl md:text-4xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                Research Blogs
              </h1>
              <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                Explore our published articles, updates, and research insights.
              </p>

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search blogs..."
                className={`w-full md:max-w-md px-4 py-3 rounded-xl border ${
                  isDark
                    ? "bg-black/40 border-gray-800 text-white placeholder-gray-500"
                    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                }`}
              />
            </div>
          </GlassCard>

          <GlassCard theme={theme} className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className={`px-4 py-2 rounded-full text-sm border transition ${
                  activeCategory === "all"
                    ? isDark
                      ? "bg-blue-900/40 border-blue-700/50 text-white"
                      : "bg-blue-100 border-blue-300 text-blue-800"
                    : isDark
                    ? "text-gray-300 border-gray-700 hover:bg-blue-900/20"
                    : "text-gray-700 border-gray-200 hover:bg-blue-50"
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category._id}
                  type="button"
                  onClick={() => setActiveCategory(category._id)}
                  className={`px-4 py-2 rounded-full text-sm border transition ${
                    activeCategory === category._id
                      ? isDark
                        ? "bg-blue-900/40 border-blue-700/50 text-white"
                        : "bg-blue-100 border-blue-300 text-blue-800"
                      : isDark
                      ? "text-gray-300 border-gray-700 hover:bg-blue-900/20"
                      : "text-gray-700 border-gray-200 hover:bg-blue-50"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </GlassCard>

          {isLoading ? (
            <div className="h-72 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <span className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                <p className={`mt-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>Loading blogs...</p>
              </div>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <GlassCard theme={theme}>
              <div className="text-center py-14">
                <p className={`text-xl ${isDark ? "text-gray-300" : "text-gray-700"}`}>No blogs found</p>
              </div>
            </GlassCard>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {paginatedBlogs.map((blog) => (
                  <GlassCard
                    key={blog._id}
                    theme={theme}
                    className="h-[500px] cursor-pointer hover:scale-[1.01] transition-transform"
                  >
                    <article
                      className="h-full flex flex-col"
                      onClick={() => setSelectedBlog(blog)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedBlog(blog);
                        }
                      }}
                    >
                      <div className="w-full h-48 rounded-xl overflow-hidden mb-4 border border-gray-800/40">
                        {blog.featuredImage ? (
                          <img
                            src={blog.featuredImage}
                            alt={blog.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-black/40">
                            <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                              No Image
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                          isDark ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-700"
                        }`}>
                          <FiTag className="w-3 h-3" />
                          {blog.category?.name || "Uncategorized"}
                        </span>
                      </div>
                      <h2 className={`text-xl font-semibold line-clamp-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                        {blog.title}
                      </h2>
                      <p className={`mt-3 text-sm line-clamp-4 min-h-[5rem] whitespace-pre-line break-words ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                        {blog.excerpt || "No excerpt available for this blog post."}
                      </p>
                      <div className={`mt-auto pt-4 flex items-center justify-between text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}>
                        <span className="inline-flex items-center gap-1">
                          <FiCalendar className="w-3.5 h-3.5" />
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </span>
                        {blog.resourceLinks?.length > 0 && (
                          <a
                            href={blog.resourceLinks[0].url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-blue-400 hover:text-blue-300 truncate max-w-[45%] text-right"
                          >
                            {blog.resourceLinks[0].name}
                          </a>
                        )}
                      </div>
                    </article>
                  </GlassCard>
                ))}
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
                      key={`blog-page-${page}`}
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

      {selectedBlog && (
        <div
          className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedBlog(null)}
        >
          <div
            className={`w-full max-w-4xl max-h-[90vh] overflow-auto rounded-2xl border ${
              isDark ? "bg-black border-gray-800" : "bg-white border-gray-200"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 px-5 py-4 border-b border-gray-800/60 bg-inherit flex items-center justify-between">
              <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                Blog Details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedBlog(null)}
                className={`p-2 rounded-lg ${
                  isDark ? "text-gray-300 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              {selectedBlog.featuredImage && (
                <div className="w-full h-72 rounded-xl overflow-hidden border border-gray-800/40 mb-5">
                  <img
                    src={selectedBlog.featuredImage}
                    alt={selectedBlog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                  isDark ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-700"
                }`}>
                  <FiTag className="w-3 h-3" />
                  {selectedBlog.category?.name || "Uncategorized"}
                </span>
                <span className={`inline-flex items-center gap-1 text-xs ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}>
                  <FiCalendar className="w-3.5 h-3.5" />
                  {selectedBlog.createdAt
                    ? new Date(selectedBlog.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>

              <h2 className={`text-2xl font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                {selectedBlog.title}
              </h2>

              {selectedBlog.excerpt && (
                <p className={`text-sm mb-4 whitespace-pre-wrap break-words ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  {selectedBlog.excerpt}
                </p>
              )}

              {isHtmlString(selectedBlog.content || "") ? (
                <div
                  className={`prose max-w-none ${
                    isDark ? "prose-invert" : ""
                  } prose-p:leading-relaxed prose-headings:mb-3`}
                  dangerouslySetInnerHTML={{
                    __html:
                      selectedBlog.content ||
                      "<p>No detailed content available for this blog.</p>",
                  }}
                />
              ) : (
                <p className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  {String(selectedBlog.content || "").trim() || "No detailed content available for this blog."}
                </p>
              )}

              {!!selectedBlog.resourceLinks?.length && (
                <div className="mt-6">
                  <h4 className={`font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                    References
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedBlog.resourceLinks.map((link, idx) => (
                      <a
                        key={`${selectedBlog._id}-resource-${idx}`}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg ${
                          isDark ? "bg-cyan-900/30 text-cyan-300" : "bg-cyan-100 text-cyan-700"
                        }`}
                      >
                        {link.name || "Reference"}
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

export default BlogsHome;

function isHtmlString(value) {
  const text = String(value || "").trim();
  if (!text) return false;
  return /<\/?[a-z][\s\S]*>/i.test(text);
}
