import { useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { FiCalendar, FiTag } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import AnimatedCanvas from "../../components/animations/animatedCanvas";
import GlassCard from "../../components/ui/GlassCard";
import VisitorHeader from "./header";
import Footer from "./footer";

const BlogsHome = () => {
  const { theme } = useTheme();
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredBlogs.map((blog) => (
                <GlassCard key={blog._id} theme={theme} className="h-full">
                  <article className="h-full flex flex-col">
                    <div className="w-full h-48 rounded-xl overflow-hidden mb-4 border border-gray-800/40">
                      <img
                        src={blog.featuredImage}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                      />
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
                    <p className={`mt-3 text-sm line-clamp-3 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
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
                          className="text-blue-400 hover:text-blue-300"
                        >
                          {blog.resourceLinks[0].name}
                        </a>
                      )}
                    </div>
                  </article>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer theme={theme} />
    </div>
  );
};

export default BlogsHome;
