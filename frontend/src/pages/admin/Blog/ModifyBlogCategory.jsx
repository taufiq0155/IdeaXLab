import React, { useState, useEffect, useRef } from "react";
import { FiEdit, FiEye, FiSave, FiTrash2, FiArrowLeft, FiX } from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AnimatedCanvas from "../../../components/animations/animatedCanvas";
import GlassCard from "../../../components/ui/GlassCard";

const ModifyBlogCategory = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
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

  // Fetch categories data
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
          const text = await response.text();
          console.error("Non-JSON response:", text.substring(0, 200));
          throw new Error("Server returned HTML. Please check if backend is running on port 5000");
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
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

  const startEditing = (category) => {
    setEditingId(category._id);
    setEditName(category.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleUpdate = async (categoryId) => {
    if (!editName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) {
      toast.error("Please log in to update category");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/blog-categories/${categoryId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: editName.trim() }),
        }
      );

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text.substring(0, 200));
        throw new Error("Server returned HTML. Please check if backend is running");
      }

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        toast.error("Session expired. Please log in again.");
        return;
      }

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || "Category updated successfully!");
        setEditingId(null);
        setEditName("");

        setCategories((prevCategories) =>
          prevCategories.map((cat) =>
            cat._id === categoryId ? data.data : cat
          )
        );
      } else {
        throw new Error(data.message || "Failed to update category");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) {
      toast.error("Please log in to delete category");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/blog-categories/${categoryId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text.substring(0, 200));
        throw new Error("Server returned HTML. Please check if backend is running");
      }

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        toast.error("Session expired. Please log in again.");
        return;
      }

      const data = await response.json();

      if (response.ok && data.success) {
        setCategories((prev) => prev.filter((cat) => cat._id !== categoryId));
        toast.success(data.message || "Category deleted successfully!");
      } else {
        throw new Error(data.message || "Failed to delete category");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.message);
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
        {/* Header */}
        <GlassCard className="mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/blog')}
                className="w-10 h-10 rounded-xl bg-black/60 backdrop-blur-md border border-gray-800/70 flex items-center justify-center text-gray-300 hover:text-white hover:border-blue-600/50 transition-all duration-300"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Blog Categories</span>
                </h2>
                <p className="text-gray-300 text-lg">
                  Edit or delete existing categories
                </p>
              </div>
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
          {/* Left Column - Categories List */}
          <div className="lg:col-span-2">
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FiEdit className="w-5 h-5 text-cyan-400" />
                Edit Categories
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
                        className="bg-gradient-to-r from-gray-800/50 via-gray-900/50 to-black/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-300"
                      >
                        {editingId === category._id ? (
                          <div className="flex items-center gap-3">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="flex-1 px-4 py-2 bg-black/60 border border-gray-700 hover:border-blue-600/50 rounded-lg text-white focus:border-blue-500 transition"
                              placeholder="Category name"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdate(category._id)}
                                disabled={isSaving}
                                className="p-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50"
                                title="Save"
                              >
                                {isSaving ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <FiSave className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="p-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
                                title="Cancel"
                              >
                                <FiX className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
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
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => startEditing(category)}
                                className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
                                title="Edit Category"
                              >
                                <FiEdit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(category._id)}
                                className="p-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 transition-all duration-300 shadow-lg hover:shadow-red-500/20"
                                title="Delete Category"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-xl bg-black/30">
                      <FiEdit className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400 italic">No categories found</p>
                      <p className="text-gray-500 text-sm mt-1">
                        Add categories in the Blog Categories section
                      </p>
                      <button
                        onClick={() => navigate('/admin/blog/categories')}
                        className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-300"
                      >
                        Go to Add Categories
                      </button>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </GlassCard>
          </div>

          {/* Right Column - Preview */}
          <div className="lg:col-span-1">
            <GlassCard className="p-6 sticky top-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FiEye className="w-5 h-5 text-cyan-400" />
                Live Preview
              </h3>

              <div className="bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-black/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50">
                {/* Preview Header */}
                <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-4 border-b border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                      <FiEdit className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Categories Preview</h4>
                      <p className="text-xs text-gray-400">How categories will appear</p>
                    </div>
                  </div>
                </div>

                {/* Preview Content */}
                <div className="p-4">
                  {categories.length > 0 ? (
                    <div className="space-y-3">
                      <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Available Categories
                      </h5>
                      {categories.map((category) => (
                        <motion.div
                          key={category._id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30 border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300"
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-sm">
                              {category.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-white text-sm font-medium">
                              {category.name}
                            </p>
                          </div>
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        </motion.div>
                      ))}
                      
                      {/* Stats Footer */}
                      <div className="mt-4 pt-4 border-t border-gray-700/50">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Total Categories:</span>
                          <span className="text-cyan-300 font-semibold text-lg">
                            {categories.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-800/50 rounded-xl flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-700">
                        <FiEye className="w-6 h-6 text-gray-500" />
                      </div>
                      <p className="text-gray-400 text-sm mb-2">No categories to preview</p>
                      <p className="text-gray-500 text-xs">
                        Add categories to see them here
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Tips Card */}
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 rounded-xl border border-blue-500/20">
                <h4 className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                  Quick Tips
                </h4>
                <ul className="space-y-2 text-xs text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Click the edit icon to modify category names</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Deleting a category won't delete blog posts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Categories help organize your blog content</span>
                  </li>
                </ul>
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

export default ModifyBlogCategory;