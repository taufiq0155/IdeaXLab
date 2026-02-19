/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { 
  FiTag, 
  FiPlus, 
  FiTrash2,
  FiSave,
  FiX,
  FiFolder,
  FiEye
} from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedCanvas from "../../../components/animations/animatedCanvas";
import GlassCard from "../../../components/ui/GlassCard";

const BlogCategory = () => {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasFetchedRef = useRef(false);

  // Loading timeout hook
  const useLoadingTimeout = (loadingState, timeout = 10000) => {
    const [timedOut, setTimedOut] = useState(false);

    useEffect(() => {
      if (loadingState) {
        const timer = setTimeout(() => {
          setTimedOut(true);
        }, timeout);

        return () => clearTimeout(timer);
      } else {
        setTimedOut(false);
      }
    }, [loadingState, timeout]);

    return timedOut;
  };

  const loadingTimedOut = useLoadingTimeout(isLoading, 10000);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem('adminToken');

      if (!token) {
        setIsLoading(false);
        toast.error("Please log in to access this page");
        return;
      }

      if (hasFetchedRef.current) {
        return;
      }

      try {
        setIsLoading(true);
        hasFetchedRef.current = true;

        const response = await fetch('http://localhost:5000/api/admin/blog-categories', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminData');
          toast.error("Session expired. Please log in again.");
          return;
        }

        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server returned HTML instead of JSON. Please check backend connection.");
        }

        const data = await response.json();
        
        if (data.success) {
          setCategories(data.data || []);
        } else {
          throw new Error(data.message || "Failed to fetch categories");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error(err.message);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();

    return () => {
      hasFetchedRef.current = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) {
      toast.error("Please log in to save changes");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/admin/blog-categories', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          name: categoryName.trim()
        }),
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned HTML instead of JSON. Please check backend connection.");
      }

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        toast.error("Session expired. Please log in again.");
        return;
      }

      if (response.ok && data.success) {
        setCategories((prev) => [...prev, data.data]);
        setCategoryName("");
        toast.success(data.message || "Blog category added successfully!");
      } else {
        throw new Error(data.message || "Failed to add blog category");
      }
    } catch (err) {
      console.error("Create category error:", err);
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
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
            <p className="mt-6 text-gray-400 font-medium text-lg">Loading categories...</p>
            {loadingTimedOut && (
              <p className="mt-2 text-yellow-400 text-sm">
                Taking longer than expected. Check your connection.
              </p>
            )}
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none"></div>
      </div>
    );
  }

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
        {/* Welcome Card */}
        <GlassCard className="mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-3">
                Blog <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Categories</span>
              </h2>
              <p className="text-gray-300 text-lg">
                Add new blog categories
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-3 p-4 bg-black/40 backdrop-blur-sm rounded-xl border border-gray-800/70">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
                <span className="text-sm font-medium text-blue-400">
                  Total Categories: <span className="text-white">{categories.length}</span>
                </span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Add Category Form */}
          <div className="lg:col-span-1">
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FiPlus className="w-5 h-5 text-cyan-400" />
                Add New Category
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FiTag className="w-4 h-4 text-cyan-400" />
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full px-4 py-3 bg-black/60 backdrop-blur-sm border border-gray-800/70 hover:border-blue-600/50 rounded-xl text-white focus:border-blue-500 transition-all duration-300"
                    placeholder="Enter category name"
                    autoComplete="off"
                    required
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full group relative bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transform hover:-translate-y-0.5 overflow-hidden border border-blue-500/30 ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <span className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                  <span className="relative flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <FiPlus className="w-4 h-4" />
                        Create Category
                      </>
                    )}
                  </span>
                </motion.button>
              </form>
            </GlassCard>
          </div>

          {/* Right Column - Categories List (View Only) */}
          <div className="lg:col-span-2">
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FiFolder className="w-5 h-5 text-cyan-400" />
                Existing Categories
              </h3>

              <div className="space-y-4">
                <AnimatePresence>
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <motion.div
                        key={category._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-gradient-to-r from-gray-800/50 via-gray-900/50 to-black/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-lg">
                                {category.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-white">
                                {category.name}
                              </h4>
                              <div className="flex items-center gap-3 mt-1 text-xs">
                                <span className="text-gray-500">
                                  Blogs: <span className="text-blue-400">{category.blogCount || 0}</span>
                                </span>
                                <span className="text-gray-500">•</span>
                                <span className="text-gray-500">
                                  Status: <span className={category.isActive ? "text-green-400" : "text-red-400"}>
                                    {category.isActive ? "Active" : "Inactive"}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {category._id.slice(-6)}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-xl bg-black/30">
                      <FiFolder className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400 italic">No categories found</p>
                      <p className="text-gray-500 text-sm mt-1">
                        Add your first category to get started
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none"></div>
    </div>
  );
};

export default BlogCategory;