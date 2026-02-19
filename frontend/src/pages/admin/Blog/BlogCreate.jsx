/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import {
  FiEdit,
  FiEye,
  FiSave,
  FiPlus,
  FiUpload,
  FiType,
  FiFileText,
  FiX,
  FiImage,
  FiCheckCircle
} from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AnimatedCanvas from "../../../components/animations/animatedCanvas";
import GlassCard from "../../../components/ui/GlassCard";
import { Editor } from "@tinymce/tinymce-react";

const BlogCreate = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categories, setCategories] = useState([]);
  const [admin, setAdmin] = useState(null);
  const hasFetchedRef = useRef(false);

  // Form state
  const [form, setForm] = useState({
    title: "",
    category: "",
    content: "",
  });
  const [featuredImage, setFeaturedImage] = useState("");

  // Get admin data from localStorage (like Contact component)
  useEffect(() => {
    const adminData = localStorage.getItem('adminData');
    if (adminData) {
      setAdmin(JSON.parse(adminData));
    }
  }, []);

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

  // Fetch categories
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

        console.log("Fetching categories from:", 'http://localhost:5000/api/admin/blog-categories');

        const response = await fetch('http://localhost:5000/api/admin/blog-categories', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log("Response status:", response.status);

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

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Categories data:", data);
        
        if (data.success) {
          setCategories(data.data || []);
        } else {
          throw new Error(data.message || "Failed to load categories");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error(err.message || "Failed to load categories");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();

    return () => {
      hasFetchedRef.current = false;
    };
  }, []);

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditorChange = (content) => {
    handleFormChange("content", content);
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPEG, PNG, GIF, etc.)");
      return;
    }

    // Check file extension
    const fileExt = file.name.split(".").pop().toLowerCase();
    const allowedExt = ["jpg", "jpeg", "png", "gif", "webp", "bmp"];
    if (!allowedExt.includes(fileExt)) {
      toast.error("Only JPEG, PNG, GIF, WebP, and BMP images are allowed!");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const token = localStorage.getItem('adminToken');
      console.log("Uploading image to:", 'http://localhost:5000/api/admin/blogs/upload-image');

      const response = await fetch('http://localhost:5000/api/admin/blogs/upload-image', {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log("Upload response status:", response.status);

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text.substring(0, 200));
        throw new Error("Server returned HTML. Please check if upload endpoint exists");
      }

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        toast.error("Session expired. Please log in again.");
        return;
      }

      const data = await response.json();
      console.log("Upload response data:", data);

      if (!response.ok) {
        throw new Error(data.message || `Upload failed with status: ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.message || "Upload failed");
      }

      setFeaturedImage(data.imageUrl);
      toast.success("Image uploaded to Cloudinary successfully!");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateBlog = async () => {
  if (!form.title || !form.category || !form.content) {
    toast.error("Please fill all required fields");
    return;
  }

  if (!featuredImage) {
    toast.error("Please upload a featured image");
    return;
  }

  setIsSaving(true);

  try {
    const token = localStorage.getItem('adminToken');

    const blogData = {
      title: form.title,
      category: form.category,        // This sends category ID
      content: form.content,
      featuredImage: featuredImage,    // THIS MUST MATCH backend field name
      status: "published"
    };

    console.log("Creating blog with data:", blogData);
    console.log("POST URL:", 'http://localhost:5000/api/admin/blogs');

    const response = await fetch('http://localhost:5000/api/admin/blogs', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(blogData),
    });

      console.log("Create response status:", response.status);

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
      console.log("Create response data:", data);

      if (response.ok && data.success) {
        toast.success("Blog created successfully!");
        navigate('/admin/blog');
        
        // Reset form
        setForm({ title: "", category: "", content: "" });
        setFeaturedImage("");
      } else {
        throw new Error(data.message || "Failed to create blog");
      }
    } catch (err) {
      console.error("Create blog error:", err);
      toast.error(err.message);
    } finally {
      setIsSaving(false);
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
            <p className="mt-6 text-gray-400 font-medium text-lg">Loading...</p>
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
                Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">New Blog Post</span>
              </h2>
              <p className="text-gray-300 text-lg">
                Create and publish a new blog post with rich text formatting
              </p>
            </div>
            {admin && (
              <div className="mt-4 md:mt-0 flex items-center gap-3 p-3 bg-black/40 backdrop-blur-sm rounded-xl border border-gray-800/70">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center text-white font-bold">
                  {admin.fullName?.charAt(0) || admin.name?.charAt(0) || "A"}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{admin.fullName || admin.name}</p>
                  <p className="text-xs text-gray-400">Creating Blog Post</p>
                </div>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FiEdit className="w-5 h-5 text-cyan-400" />
                Blog Details
              </h3>

              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FiType className="w-4 h-4 text-cyan-400" />
                    Blog Title *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-black/60 backdrop-blur-sm border border-gray-800/70 hover:border-blue-600/50 rounded-xl text-white focus:border-blue-500 transition-all duration-300"
                    value={form.title}
                    onChange={(e) => handleFormChange("title", e.target.value)}
                    placeholder="Enter blog title"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FiImage className="w-4 h-4 text-cyan-400" />
                    Category *
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-black/60 backdrop-blur-sm border border-gray-800/70 hover:border-blue-600/50 rounded-xl text-white focus:border-blue-500 transition-all duration-300"
                    value={form.category}
                    onChange={(e) => handleFormChange("category", e.target.value)}
                  >
                    <option value="">Select a category</option>
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No categories available</option>
                    )}
                  </select>
                  {categories.length === 0 && (
                    <p className="text-yellow-400 text-xs mt-1">
                      No categories found. Please create a category first.
                    </p>
                  )}
                </div>

                {/* Featured Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FiImage className="w-4 h-4 text-cyan-400" />
                    Featured Image * (Upload to Cloudinary)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative group">
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-black/60 backdrop-blur-sm border border-gray-800/70 hover:border-blue-600/50 rounded-xl text-white focus:border-blue-500 transition-all duration-300 pr-10"
                        value={featuredImage || ""}
                        onChange={(e) => setFeaturedImage(e.target.value)}
                        placeholder="Cloudinary URL or upload"
                      />
                      {featuredImage && (
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-400 transition-colors"
                          onClick={() => setFeaturedImage("")}
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            handleImageUpload(file);
                          }
                          e.target.value = "";
                        }}
                        disabled={uploadingImage}
                      />
                      <label
                        htmlFor="image-upload"
                        className={`w-full sm:w-auto px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                          uploadingImage ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {uploadingImage ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <FiUpload className="w-4 h-4" />
                            Upload
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                  {featuredImage && featuredImage.includes("cloudinary") && (
                    <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                      <FiCheckCircle className="w-3 h-3" />
                      Image hosted on Cloudinary CDN
                    </p>
                  )}
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FiFileText className="w-4 h-4 text-cyan-400" />
                    Content *
                  </label>
                  <div className="bg-black/60 backdrop-blur-sm border border-gray-800/70 hover:border-blue-600/50 rounded-xl overflow-hidden">
                    <Editor
                      apiKey="h2ar80nttlx4hli43ugzp4wvv9ej7q3feifsu8mqssyfga6s"
                      value={form.content}
                      onEditorChange={handleEditorChange}
                      init={{
                        height: 400,
                        menubar: false,
                        plugins: [
                          "advlist", "autolink", "lists", "link", "image",
                          "charmap", "preview", "anchor", "searchreplace",
                          "visualblocks", "code", "fullscreen", "insertdatetime",
                          "media", "table", "code", "help", "wordcount",
                        ],
                        toolbar:
                          "undo redo | blocks | bold italic underline strikethrough | " +
                          "forecolor backcolor | alignleft aligncenter alignright alignjustify | " +
                          "bullist numlist outdent indent | link image | removeformat | help",
                        skin: "oxide-dark",
                        content_css: "dark",
                        content_style: `
                          body { 
                            background: #0a0a0a; 
                            color: #f9fafb; 
                            font-family: Inter, sans-serif; 
                            font-size: 14px; 
                            line-height: 1.6; 
                          }
                          p { margin: 0 0 12px 0; }
                          ul, ol { margin: 0 0 12px 0; padding-left: 20px; }
                          li { margin-bottom: 4px; }
                          strong { font-weight: bold; }
                          em { font-style: italic; }
                          u { text-decoration: underline; }
                          a { color: #60a5fa; text-decoration: underline; }
                          h1, h2, h3, h4, h5, h6 { 
                            color: #f9fafb; 
                            margin: 16px 0 8px 0;
                            font-weight: bold;
                          }
                          h1 { font-size: 24px; }
                          h2 { font-size: 20px; }
                          h3 { font-size: 18px; }
                          h4 { font-size: 16px; }
                          blockquote { 
                            border-left: 4px solid #60a5fa; 
                            padding-left: 16px; 
                            margin: 16px 0;
                            font-style: italic;
                            color: #d1d5db;
                          }
                        `,
                        branding: false,
                        statusbar: false,
                        elementpath: false,
                      }}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateBlog}
                  disabled={isSaving}
                  className="w-full group relative bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transform hover:-translate-y-0.5 overflow-hidden border border-blue-500/30 disabled:opacity-50"
                >
                  <span className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                  <span className="relative flex items-center justify-center gap-2">
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating Blog...
                      </>
                    ) : (
                      <>
                        <FiPlus className="w-4 h-4" />
                        Create Blog Post
                      </>
                    )}
                  </span>
                </motion.button>
              </div>
            </GlassCard>
          </div>

          {/* Right Column - Live Preview */}
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
                      <FiFileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Blog Preview</h4>
                      <p className="text-xs text-gray-400">How your post will look</p>
                    </div>
                  </div>
                </div>

                {/* Preview Content */}
                <div className="p-4">
                  {form.title || featuredImage || form.content ? (
                    <div className="space-y-4">
                      {/* Featured Image Preview */}
                      {featuredImage && (
                        <div className="w-full h-32 rounded-lg overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-600">
                          <img
                            src={featuredImage}
                            alt={form.title || "Preview"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        </div>
                      )}

                      {/* Category Badge */}
                      {form.category && (
                        <div className="inline-flex px-2 py-1 rounded-full bg-blue-600/20 border border-blue-500/30">
                          <span className="text-xs text-blue-300">
                            {categories.find(c => c._id === form.category)?.name || "Category"}
                          </span>
                        </div>
                      )}

                      {/* Title */}
                      <h3 className="text-lg font-bold text-white">
                        {form.title || "Untitled Blog Post"}
                      </h3>

                      {/* Content Preview */}
                      <div className="text-gray-400 text-sm leading-relaxed max-h-40 overflow-hidden relative">
                        {form.content ? (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: form.content.substring(0, 200) + "...",
                            }}
                          />
                        ) : (
                          <p className="italic">No content yet...</p>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-gray-900 to-transparent"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-800/50 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <FiEye className="w-5 h-5 text-gray-500" />
                      </div>
                      <p className="text-gray-400 text-sm">Start editing to see preview</p>
                    </div>
                  )}
                </div>
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

export default BlogCreate;