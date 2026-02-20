import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import {
  FiMapPin,
  FiBriefcase,
  FiBookOpen,
  FiCode,
  FiPhone,
  FiGlobe,
  FiLinkedin,
  FiGithub,
  FiUpload,
  FiSave,
  FiUser,
  FiMail,
  FiX,
  FiCheckCircle,
  FiFileText,
} from "react-icons/fi";
import AnimatedCanvas from "../../components/animations/animatedCanvas";
import GlassCard from "../../components/ui/GlassCard";

const Profile = () => {
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const hasFetchedRef = useRef(false);

  const [skillInput, setSkillInput] = useState("");
  const [form, setForm] = useState({
    profileImage: "",
    designation: "",
    location: "",
    education: "",
    experience: "",
    skills: [],
    bio: "",
    phone: "",
    website: "",
    linkedin: "",
    github: "",
  });

  useEffect(() => {
    const adminData = localStorage.getItem("adminData");
    if (adminData) {
      try {
        setAdmin(JSON.parse(adminData));
      } catch (error) {
        setAdmin(null);
      }
    }
  }, []);

  const syncAdminDataWithProfile = (profileUpdates = {}) => {
    const adminData = localStorage.getItem("adminData");
    if (!adminData) return;

    try {
      const parsed = JSON.parse(adminData);
      const merged = { ...parsed, ...profileUpdates };
      localStorage.setItem("adminData", JSON.stringify(merged));
      setAdmin(merged);
      window.dispatchEvent(new Event("admin-profile-updated"));
    } catch (error) {
      // Ignore sync errors to avoid blocking profile form flow.
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        toast.error("Please log in to access this page");
        setIsLoading(false);
        return;
      }

      if (hasFetchedRef.current) return;
      hasFetchedRef.current = true;

      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:5000/api/admin/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server returned HTML. Check backend profile routes.");
        }

        if (response.status === 401) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminData");
          toast.error("Session expired. Please log in again.");
          return;
        }

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load profile");
        }

        if (data.data) {
          setForm({
            profileImage: data.data.profileImage || "",
            designation: data.data.designation || "",
            location: data.data.location || "",
            education: data.data.education || "",
            experience: data.data.experience || "",
            skills: Array.isArray(data.data.skills) ? data.data.skills : [],
            bio: data.data.bio || "",
            phone: data.data.phone || "",
            website: data.data.website || "",
            linkedin: data.data.linkedin || "",
            github: data.data.github || "",
          });

          syncAdminDataWithProfile({
            profileImage: data.data.profileImage || "",
          });
        }
      } catch (error) {
        toast.error(error.message || "Failed to fetch profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
    return () => {
      hasFetchedRef.current = false;
    };
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = () => {
    const nextSkill = skillInput.trim();
    if (!nextSkill) return;

    if (form.skills.some((item) => item.toLowerCase() === nextSkill.toLowerCase())) {
      toast.error("Skill already added");
      return;
    }

    setForm((prev) => ({ ...prev, skills: [...prev.skills, nextSkill] }));
    setSkillInput("");
  };

  const handleRemoveSkill = (index) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const handleUploadProfileImage = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const token = localStorage.getItem("adminToken");
    if (!token) {
      toast.error("Please log in again");
      return;
    }

    try {
      setIsUploadingImage(true);
      const body = new FormData();
      body.append("image", file);

      const response = await fetch("http://localhost:5000/api/admin/profile/upload-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body,
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Server returned invalid upload response");
      }

      const data = await response.json();
      if (response.status === 401) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminData");
        throw new Error("Session expired. Please log in again.");
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to upload image");
      }

      const nextImageUrl = data.imageUrl || "";
      setForm((prev) => ({ ...prev, profileImage: nextImageUrl }));
      syncAdminDataWithProfile({ profileImage: nextImageUrl });
      toast.success("Profile image uploaded successfully");
    } catch (error) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      toast.error("Please log in to save profile");
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch("http://localhost:5000/api/admin/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned invalid response");
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to save profile");
      }

      syncAdminDataWithProfile({
        profileImage: form.profileImage || "",
      });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to save profile");
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
            <p className="mt-6 text-gray-400 font-medium text-lg">Loading profile...</p>
          </div>
        </div>
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
            background: "#1f2937",
            color: "#fff",
            border: "1px solid #374151",
          },
        }}
      />
      <AnimatedCanvas />

      <div className="relative z-10 p-4 md:p-6">
        <GlassCard className="mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-3">
                Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Profile</span>
              </h2>
              <p className="text-gray-300 text-lg">
                Update your professional details with live preview
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3 p-3 bg-black/40 backdrop-blur-sm rounded-xl border border-gray-800/70">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center text-white font-bold">
                {(admin?.fullName || "A").charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{admin?.fullName || "Admin User"}</p>
                <p className="text-xs text-gray-400">{admin?.email || "admin@example.com"}</p>
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">Profile Details</h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Profile Picture
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative group">
                      <input
                        type="text"
                        value={form.profileImage}
                        onChange={(e) => handleChange("profileImage", e.target.value)}
                        className="w-full px-4 py-3 bg-black/60 border border-gray-800/70 hover:border-blue-600/50 rounded-xl text-white focus:border-blue-500 transition-all duration-300 pr-10"
                        placeholder="Profile image URL"
                      />
                      {form.profileImage && (
                        <button
                          type="button"
                          onClick={() => handleChange("profileImage", "")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        id="profile-image-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadProfileImage(file);
                          e.target.value = "";
                        }}
                        disabled={isUploadingImage}
                      />
                      <label
                        htmlFor="profile-image-upload"
                        className={`px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                          isUploadingImage ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                      >
                        {isUploadingImage ? (
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
                  {form.profileImage && (
                    <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
                      <FiCheckCircle className="w-3 h-3" />
                      Profile image ready
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    icon={<FiBriefcase className="w-4 h-4 text-cyan-400" />}
                    label="Designation"
                    value={form.designation}
                    onChange={(value) => handleChange("designation", value)}
                    placeholder="Senior Researcher"
                  />
                  <InputField
                    icon={<FiMapPin className="w-4 h-4 text-cyan-400" />}
                    label="Location"
                    value={form.location}
                    onChange={(value) => handleChange("location", value)}
                    placeholder="City, Country"
                  />
                  <InputField
                    icon={<FiPhone className="w-4 h-4 text-cyan-400" />}
                    label="Phone"
                    value={form.phone}
                    onChange={(value) => handleChange("phone", value)}
                    placeholder="+1 555 123 4567"
                  />
                  <InputField
                    icon={<FiGlobe className="w-4 h-4 text-cyan-400" />}
                    label="Website"
                    value={form.website}
                    onChange={(value) => handleChange("website", value)}
                    placeholder="https://yourwebsite.com"
                  />
                  <InputField
                    icon={<FiLinkedin className="w-4 h-4 text-cyan-400" />}
                    label="LinkedIn"
                    value={form.linkedin}
                    onChange={(value) => handleChange("linkedin", value)}
                    placeholder="linkedin.com/in/username"
                  />
                  <InputField
                    icon={<FiGithub className="w-4 h-4 text-cyan-400" />}
                    label="GitHub"
                    value={form.github}
                    onChange={(value) => handleChange("github", value)}
                    placeholder="github.com/username"
                  />
                </div>

                <TextAreaField
                  icon={<FiBookOpen className="w-4 h-4 text-cyan-400" />}
                  label="Education"
                  value={form.education}
                  onChange={(value) => handleChange("education", value)}
                  placeholder="Your education details..."
                  rows={4}
                />

                <TextAreaField
                  icon={<FiBriefcase className="w-4 h-4 text-cyan-400" />}
                  label="Experience"
                  value={form.experience}
                  onChange={(value) => handleChange("experience", value)}
                  placeholder="Your experience details..."
                  rows={4}
                />

                <TextAreaField
                  icon={<FiFileText className="w-4 h-4 text-cyan-400" />}
                  label="Bio"
                  value={form.bio}
                  onChange={(value) => handleChange("bio", value)}
                  placeholder="Write a short professional bio..."
                  rows={4}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FiCode className="w-4 h-4 text-cyan-400" />
                    Skills
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      className="flex-1 px-4 py-3 bg-black/60 border border-gray-800/70 hover:border-blue-600/50 rounded-xl text-white focus:border-blue-500 transition-all duration-300"
                      placeholder="Add a skill and press Enter"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-4 py-3 bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 rounded-xl hover:bg-cyan-600/30 transition-all duration-300"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.skills.length > 0 ? (
                      form.skills.map((skill, index) => (
                        <button
                          key={`${skill}-${index}`}
                          type="button"
                          onClick={() => handleRemoveSkill(index)}
                          className="px-3 py-1.5 rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/30 text-xs hover:bg-red-600/20 hover:text-red-300 hover:border-red-500/30 transition-all duration-300"
                          title="Remove skill"
                        >
                          {skill}
                        </button>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500">No skills added yet.</p>
                    )}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving Profile...
                    </>
                  ) : (
                    <>
                      <FiSave className="w-4 h-4" />
                      Save Profile
                    </>
                  )}
                </motion.button>
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-1">
            <GlassCard className="p-6 sticky top-6">
              <h3 className="text-xl font-bold text-white mb-6">Live Preview</h3>

              <div className="bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-black/50 rounded-xl border border-gray-700/50 overflow-hidden">
                <div className="p-5 border-b border-gray-700/50">
                  <div className="flex items-center gap-4">
                    {form.profileImage ? (
                      <img
                        src={form.profileImage}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover border border-blue-500/40"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
                        <FiUser className="w-8 h-8 text-white" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-white font-semibold truncate">
                        {admin?.fullName || "Admin User"}
                      </h4>
                      <p className="text-gray-400 text-sm truncate flex items-center gap-1">
                        <FiMail className="w-3 h-3" />
                        {admin?.email || "admin@example.com"}
                      </p>
                      <p className="text-cyan-300 text-sm mt-1 truncate">
                        {form.designation || "No designation added"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4 text-sm">
                  <PreviewItem icon={<FiMapPin className="w-4 h-4 text-blue-400" />} label="Location" value={form.location} />
                  <PreviewItem icon={<FiPhone className="w-4 h-4 text-blue-400" />} label="Phone" value={form.phone} />
                  <PreviewItem icon={<FiGlobe className="w-4 h-4 text-blue-400" />} label="Website" value={form.website} />

                  <div>
                    <p className="text-gray-400 text-xs mb-1">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {form.skills.length > 0 ? (
                        form.skills.map((skill, index) => (
                          <span
                            key={`preview-skill-${index}`}
                            className="px-2 py-1 rounded-full bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 text-xs"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-xs">No skills yet</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-400 text-xs mb-1">Education</p>
                    <p className="text-gray-200 whitespace-pre-wrap">{form.education || "Not added yet"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Experience</p>
                    <p className="text-gray-200 whitespace-pre-wrap">{form.experience || "Not added yet"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Bio</p>
                    <p className="text-gray-200 whitespace-pre-wrap">{form.bio || "No bio yet"}</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none"></div>
    </div>
  );
};

const InputField = ({ icon, label, value, onChange, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
      {icon}
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 bg-black/60 border border-gray-800/70 hover:border-blue-600/50 rounded-xl text-white focus:border-blue-500 transition-all duration-300"
    />
  </div>
);

const TextAreaField = ({ icon, label, value, onChange, placeholder, rows = 4 }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
      {icon}
      {label}
    </label>
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 bg-black/60 border border-gray-800/70 hover:border-blue-600/50 rounded-xl text-white focus:border-blue-500 transition-all duration-300 resize-none"
    />
  </div>
);

const PreviewItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-2">
    <span className="mt-0.5">{icon}</span>
    <div className="min-w-0">
      <p className="text-gray-400 text-xs">{label}</p>
      <p className="text-gray-200 break-words">{value || "Not added yet"}</p>
    </div>
  </div>
);

export default Profile;
