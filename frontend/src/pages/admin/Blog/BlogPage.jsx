import React, { useState, useEffect } from "react";
import {
  FiCalendar,
  FiEye,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiFilter,
  FiFolder,
  FiSearch,
  FiClock,
  FiArrowLeft,
  FiLink,
} from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AnimatedCanvas from "../../../components/animations/animatedCanvas";
import GlassCard from "../../../components/ui/GlassCard";

const BlogPage = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showBlogDetail, setShowBlogDetail] = useState(false);

  // Fetch blogs and categories - FIXED to match BlogCreate pattern
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('adminToken');

      if (!token) {
        setIsLoading(false);
        toast.error("Please log in to access this page");
        return;
      }

      try {
        setIsLoading(true);

        // Fetch categories - EXACT same pattern as BlogCreate
        console.log("Fetching categories from:", 'http://localhost:5000/api/admin/blog-categories');
        const categoriesResponse = await fetch('http://localhost:5000/api/admin/blog-categories', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log("Categories response status:", categoriesResponse.status);

        // Check if response is JSON
        const categoriesContentType = categoriesResponse.headers.get("content-type");
        if (!categoriesContentType || !categoriesContentType.includes("application/json")) {
          const text = await categoriesResponse.text();
          console.error("Non-JSON response:", text.substring(0, 200));
          throw new Error("Server returned HTML. Please check if backend is running");
        }

        if (categoriesResponse.status === 401) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminData');
          toast.error("Session expired. Please log in again.");
          return;
        }

        if (!categoriesResponse.ok) {
          throw new Error(`HTTP error! status: ${categoriesResponse.status}`);
        }

        const categoriesData = await categoriesResponse.json();
        console.log("Categories data:", categoriesData);
        
        if (categoriesData.success) {
          setCategories(categoriesData.data || []);
        }

        // Fetch blogs - EXACT same pattern
        console.log("Fetching blogs from:", 'http://localhost:5000/api/admin/blogs');
        const blogsResponse = await fetch('http://localhost:5000/api/admin/blogs', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log("Blogs response status:", blogsResponse.status);

        // Check if response is JSON
        const blogsContentType = blogsResponse.headers.get("content-type");
        if (!blogsContentType || !blogsContentType.includes("application/json")) {
          const text = await blogsResponse.text();
          console.error("Non-JSON response:", text.substring(0, 200));
          throw new Error("Server returned HTML. Please check if backend is running");
        }

        if (blogsResponse.status === 401) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminData');
          toast.error("Session expired. Please log in again.");
          return;
        }

        if (!blogsResponse.ok) {
          throw new Error(`HTTP error! status: ${blogsResponse.status}`);
        }

        const blogsData = await blogsResponse.json();
        console.log("Blogs data:", blogsData);

        if (blogsData.success) {
          setBlogs(blogsData.data || []);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error(err.message || "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get category name by ID - FIXED to handle populated category
  const getCategoryName = (category) => {
    if (!category) return "Uncategorized";
    
    // If category is populated (has name property)
    if (typeof category === 'object' && category !== null) {
      return category.name || "Uncategorized";
    }
    
    // If category is just an ID, find in categories array
    const foundCategory = categories.find(c => c._id === category);
    return foundCategory ? foundCategory.name : "Uncategorized";
  };

  // Filter blogs
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch = 
      blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.content?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const categoryId = typeof blog.category === 'object' ? blog.category?._id : blog.category;
    const matchesCategory = 
      selectedCategory === "all" || categoryId === selectedCategory;
    
    const matchesStatus =
      selectedStatus === "all" || blog.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Handle delete
  const handleDelete = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) {
      return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) {
      toast.error("Please log in to delete");
      return;
    }

    setDeleteLoading(blogId);

    try {
      console.log("Deleting blog:", `http://localhost:5000/api/admin/blogs/${blogId}`);
      
      const response = await fetch(`http://localhost:5000/api/admin/blogs/${blogId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log("Delete response status:", response.status);

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text.substring(0, 200));
        throw new Error("Server returned HTML");
      }

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        toast.error("Session expired. Please log in again.");
        return;
      }

      const data = await response.json();

      if (response.ok && data.success) {
        setBlogs(prev => prev.filter(blog => blog._id !== blogId));
        toast.success("Blog deleted successfully!");
      } else {
        throw new Error(data.message || "Failed to delete blog");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.message);
    } finally {
      setDeleteLoading(null);
    }
  };

  // Strip HTML tags for excerpt
  const stripHtmlTags = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "");
  };

  const getResourceLinks = (blog) => {
    if (!blog || !Array.isArray(blog.resourceLinks)) return [];

    return blog.resourceLinks
      .filter((link) => link && link.name && link.url)
      .map((link) => ({
        name: String(link.name).trim(),
        url: /^https?:\/\//i.test(String(link.url).trim())
          ? String(link.url).trim()
          : `https://${String(link.url).trim()}`,
      }))
      .filter((link) => link.name && link.url);
  };

  // Open blog detail
  const openBlogDetail = (blog) => {
    setSelectedBlog(blog);
    setShowBlogDetail(true);
  };

  // Close blog detail
  const closeBlogDetail = () => {
    setSelectedBlog(null);
    setShowBlogDetail(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        <AnimatedCanvas />
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin blur-sm opacity-50"></div>
            </div>
            <p className="mt-6 text-gray-400 font-medium text-lg">Loading blog posts...</p>
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none"></div>
      </div>
    );
  }

  // Blog Detail View
  if (showBlogDetail && selectedBlog) {
    const blogLinks = getResourceLinks(selectedBlog);

    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#fff',
              border: '1px solid #374151',
            },
          }}
        />
        <AnimatedCanvas />
        
        <div className="relative z-10 p-4 md:p-6">
          <div className="max-w-5xl mx-auto">
            <button
              onClick={closeBlogDetail}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
            >
              <FiArrowLeft className="w-5 h-5" />
              Back to Blog List
            </button>

            <GlassCard className="p-5 md:p-8">
            {/* Blog Header */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  selectedBlog.status === "published"
                    ? "bg-green-600/20 text-green-300 border border-green-500/30"
                    : selectedBlog.status === "draft"
                    ? "bg-yellow-600/20 text-yellow-300 border border-yellow-500/30"
                    : "bg-gray-600/20 text-gray-300 border border-gray-500/30"
                }`}>
                  {selectedBlog.status || "draft"}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-600/20 text-blue-300 border border-blue-500/30">
                  {getCategoryName(selectedBlog.category)}
                </span>
              </div>

              <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">
                {selectedBlog.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <FiCalendar className="w-4 h-4" />
                  {selectedBlog.createdAt
                    ? new Date(selectedBlog.createdAt).toLocaleDateString()
                    : "Recent"}
                </span>
                <span className="flex items-center gap-1">
                  <FiClock className="w-4 h-4" />
                  5 min read
                </span>
                <span className="flex items-center gap-1">
                  <FiEye className="w-4 h-4" />
                  {selectedBlog.views || 0} views
                </span>
              </div>
            </div>

            {/* Featured Image */}
            {selectedBlog.featuredImage && (
              <div className="mb-8 rounded-xl overflow-hidden border border-gray-700/30 bg-black/40">
                <img
                  src={selectedBlog.featuredImage}
                  alt={selectedBlog.title}
                  className="w-full h-52 md:h-72 object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="blog-content max-w-none text-gray-100">
              {selectedBlog.content ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: selectedBlog.content,
                  }}
                />
              ) : (
                <p className="text-gray-400 italic">No content available.</p>
              )}
            </div>

            {/* Resource Links */}
            {blogLinks.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-700/30">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <FiLink className="w-4 h-4 text-cyan-400" />
                  Resource Links
                </h3>
                <div className="flex flex-wrap gap-2">
                  {blogLinks.map((link, index) => (
                    <a
                      key={`blog-link-${index}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-full bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-600/30 transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-700/30">
              <button
                onClick={() => {
                  navigate(`/admin/blog/edit/${selectedBlog._id}`);
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 flex items-center gap-2"
              >
                <FiEdit className="w-4 h-4" />
                Edit Post
              </button>
            </div>
            </GlassCard>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none"></div>
      </div>
    );
  }

  // Main Blog List View
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151',
          },
        }}
      />
      <AnimatedCanvas />

      <div className="relative z-10 p-4 md:p-6">
        {/* Header */}
        <GlassCard className="mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-3">
                Blog <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Management</span>
              </h2>
              <p className="text-gray-300 text-lg">
                Create and manage your blog posts
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-black/60 backdrop-blur-sm border border-gray-800/70 hover:border-blue-600/50 rounded-xl text-white transition-all duration-300 flex items-center gap-2"
              >
                <FiFilter className="w-4 h-4" />
                Filters
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/admin/blog/create')}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl hover:shadow-blue-500/20"
              >
                <FiPlus className="w-4 h-4" />
                New Post
              </motion.button>
            </div>
          </div>
        </GlassCard>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <GlassCard className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Search
                    </label>
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search posts..."
                        className="w-full pl-10 pr-4 py-2 bg-black/60 backdrop-blur-sm border border-gray-800/70 hover:border-blue-600/50 rounded-lg text-white focus:border-blue-500 transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-2 bg-black/60 backdrop-blur-sm border border-gray-800/70 hover:border-blue-600/50 rounded-lg text-white focus:border-blue-500 transition-all duration-300"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-4 py-2 bg-black/60 backdrop-blur-sm border border-gray-800/70 hover:border-blue-600/50 rounded-lg text-white focus:border-blue-500 transition-all duration-300"
                    >
                      <option value="all">All Status</option>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Posts</p>
                <p className="text-2xl font-bold text-white">{blogs.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <FiFolder className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Published</p>
                <p className="text-2xl font-bold text-white">
                  {blogs.filter(b => b.status === "published").length}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <FiEye className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Drafts</p>
                <p className="text-2xl font-bold text-white">
                  {blogs.filter(b => b.status === "draft").length}
                </p>
              </div>
              <div className="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                <FiEdit className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Categories</p>
                <p className="text-2xl font-bold text-white">{categories.length}</p>
              </div>
              <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <FiFolder className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredBlogs.length > 0 ? (
              filteredBlogs.map((blog, index) => {
                const resourceLinks = getResourceLinks(blog);

                return (
                <motion.div
                  key={blog._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard className="group cursor-pointer hover:border-blue-500/30 transition-all duration-300 overflow-hidden">
                    {/* Featured Image */}
                    {blog.featuredImage && (
                      <div className="h-48 overflow-hidden" onClick={() => openBlogDetail(blog)}>
                        <img
                          src={blog.featuredImage}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    )}

                    <div className="p-6">
                      {/* Status Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          blog.status === "published"
                            ? "bg-green-600/20 text-green-300 border border-green-500/30"
                            : blog.status === "draft"
                            ? "bg-yellow-600/20 text-yellow-300 border border-yellow-500/30"
                            : "bg-gray-600/20 text-gray-300 border border-gray-500/30"
                        }`}>
                          {blog.status || "draft"}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/blog/edit/${blog._id}`);
                            }}
                            className="p-1.5 bg-cyan-600/20 text-cyan-300 rounded-lg hover:bg-cyan-600/30 transition-colors border border-cyan-500/30"
                            title="Edit"
                          >
                            <FiEdit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(blog._id);
                            }}
                            disabled={deleteLoading === blog._id}
                            className="p-1.5 bg-red-600/20 text-red-300 rounded-lg hover:bg-red-600/30 transition-colors border border-red-500/30 disabled:opacity-50"
                            title="Delete"
                          >
                            {deleteLoading === blog._id ? (
                              <div className="w-3 h-3 border-2 border-red-300 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <FiTrash2 className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Category - FIXED to handle populated category */}
                      <div className="mb-2" onClick={() => openBlogDetail(blog)}>
                        <span className="text-xs text-blue-400 bg-blue-600/20 px-2 py-1 rounded-full border border-blue-500/30">
                          {getCategoryName(blog.category)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 
                        className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition-colors line-clamp-2 cursor-pointer"
                        onClick={() => openBlogDetail(blog)}
                      >
                        {blog.title}
                      </h3>

                      {/* Excerpt */}
                      <p 
                        className="text-gray-400 text-sm mb-4 line-clamp-2 cursor-pointer"
                        onClick={() => openBlogDetail(blog)}
                      >
                        {blog.excerpt || stripHtmlTags(blog.content).substring(0, 120) + "..." || "No excerpt available..."}
                      </p>

                      {resourceLinks.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {resourceLinks.slice(0, 3).map((link, linkIndex) => (
                            <a
                              key={`card-link-${blog._id}-${linkIndex}`}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="px-2 py-1 rounded-full bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-600/30 transition-colors text-xs"
                            >
                              {link.name}
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Meta */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <FiCalendar className="w-3 h-3" />
                            {blog.createdAt
                              ? new Date(blog.createdAt).toLocaleDateString()
                              : "Recent"}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiClock className="w-3 h-3" />
                            5 min
                          </span>
                        </div>
                        <span className="flex items-center gap-1 text-blue-400">
                          <FiEye className="w-3 h-3" />
                          {blog.views || 0}
                        </span>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
                );
              })
            ) : (
              <div className="col-span-full">
                <GlassCard className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiSearch className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No blog posts found
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {searchTerm
                      ? `No posts matching "${searchTerm}"`
                      : "Get started by creating your first blog post"}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/admin/blog/create')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 inline-flex items-center gap-2"
                  >
                    <FiPlus className="w-4 h-4" />
                    Create New Post
                  </motion.button>
                </GlassCard>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none"></div>
    </div>
  );
};

export default BlogPage;
