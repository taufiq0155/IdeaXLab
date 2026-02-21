import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import {
  FiUpload,
  FiSave,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiHash,
  FiCalendar,
  FiBookOpen,
  FiCode,
  FiX,
  FiCheckCircle,
  FiLinkedin,
  FiGithub,
  FiGlobe,
} from "react-icons/fi";
import AnimatedCanvas from "../../../components/animations/animatedCanvas";
import GlassCard from "../../../components/ui/GlassCard";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  profileImage: "",
  profileImagePublicId: "",
  designation: "",
  department: "",
  employeeCode: "",
  employmentType: "full-time",
  status: "active",
  location: "",
  education: "",
  experience: "",
  yearsOfExperience: 0,
  skills: [],
  specialization: "",
  researchInterests: "",
  bio: "",
  achievements: "",
  joinDate: "",
  linkedin: "",
  github: "",
  website: "",
};

const AddEmployee = () => {
  const [form, setForm] = useState(initialForm);
  const [skillInput, setSkillInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const skillCount = useMemo(() => form.skills.length, [form.skills]);

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

    const token = localStorage.getItem("adminToken");
    if (!token) {
      toast.error("Please log in again");
      return;
    }

    try {
      setIsUploadingImage(true);
      const body = new FormData();
      body.append("image", file);
      if (form.profileImagePublicId) {
        body.append("oldPublicId", form.profileImagePublicId);
      }

      const response = await fetch("http://localhost:5000/api/admin/employees/upload-image", {
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
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to upload image");
      }

      setForm((prev) => ({
        ...prev,
        profileImage: data.imageUrl || "",
        profileImagePublicId: data.publicId || "",
      }));
      toast.success("Employee photo uploaded");
    } catch (error) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveEmployee = async () => {
    if (!form.fullName.trim() || !form.email.trim() || !form.designation.trim()) {
      toast.error("Full name, email, and designation are required");
      return;
    }

    const token = localStorage.getItem("adminToken");
    if (!token) {
      toast.error("Please log in first");
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch("http://localhost:5000/api/admin/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Server returned invalid response");
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to add employee");
      }

      toast.success("Employee added successfully");
      setForm(initialForm);
      setSkillInput("");
    } catch (error) {
      toast.error(error.message || "Failed to add employee");
    } finally {
      setIsSaving(false);
    }
  };

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
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Add <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Employee</span>
              </h2>
              <p className="text-gray-300 text-lg">
                Add complete team information for your research farm
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-black/40 border border-gray-800/70">
                <p className="text-xs text-gray-400">Skills Added</p>
                <p className="text-xl font-semibold text-cyan-300">{skillCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-gray-800/70">
                <p className="text-xs text-gray-400">Status</p>
                <p className="text-sm font-semibold text-green-400 capitalize">{form.status}</p>
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">Employee Information</h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Profile Photo</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={form.profileImage}
                      onChange={(e) => handleChange("profileImage", e.target.value)}
                      className="flex-1 px-4 py-3 bg-black/60 border border-gray-800/70 hover:border-blue-600/50 rounded-xl text-white focus:border-blue-500 transition-all duration-300"
                      placeholder="Employee photo URL"
                    />
                    <div>
                      <input
                        type="file"
                        id="employee-image-upload"
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
                        htmlFor="employee-image-upload"
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
                  {!!form.profileImage && (
                    <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
                      <FiCheckCircle className="w-3 h-3" />
                      Employee photo ready
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    icon={<FiUser className="w-4 h-4 text-cyan-400" />}
                    label="Full Name *"
                    value={form.fullName}
                    onChange={(value) => handleChange("fullName", value)}
                    placeholder="Employee full name"
                  />
                  <InputField
                    icon={<FiMail className="w-4 h-4 text-cyan-400" />}
                    type="email"
                    label="Email *"
                    value={form.email}
                    onChange={(value) => handleChange("email", value)}
                    placeholder="employee@email.com"
                  />
                  <InputField
                    icon={<FiPhone className="w-4 h-4 text-cyan-400" />}
                    label="Phone"
                    value={form.phone}
                    onChange={(value) => handleChange("phone", value)}
                    placeholder="+1 555 123 4567"
                  />
                  <InputField
                    icon={<FiMapPin className="w-4 h-4 text-cyan-400" />}
                    label="Location"
                    value={form.location}
                    onChange={(value) => handleChange("location", value)}
                    placeholder="City, Country"
                  />
                  <InputField
                    icon={<FiBriefcase className="w-4 h-4 text-cyan-400" />}
                    label="Designation *"
                    value={form.designation}
                    onChange={(value) => handleChange("designation", value)}
                    placeholder="Research Scientist"
                  />
                  <InputField
                    icon={<FiBriefcase className="w-4 h-4 text-cyan-400" />}
                    label="Department"
                    value={form.department}
                    onChange={(value) => handleChange("department", value)}
                    placeholder="AI Research"
                  />
                  <InputField
                    icon={<FiHash className="w-4 h-4 text-cyan-400" />}
                    label="Employee Code"
                    value={form.employeeCode}
                    onChange={(value) => handleChange("employeeCode", value)}
                    placeholder="EMP-1025"
                  />
                  <InputField
                    icon={<FiCalendar className="w-4 h-4 text-cyan-400" />}
                    type="date"
                    label="Join Date"
                    value={form.joinDate}
                    onChange={(value) => handleChange("joinDate", value)}
                  />
                  <InputField
                    icon={<FiCalendar className="w-4 h-4 text-cyan-400" />}
                    type="number"
                    label="Years of Experience"
                    value={form.yearsOfExperience}
                    onChange={(value) => handleChange("yearsOfExperience", value)}
                    placeholder="5"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField
                    label="Employment Type"
                    value={form.employmentType}
                    onChange={(value) => handleChange("employmentType", value)}
                    options={[
                      { label: "Full-time", value: "full-time" },
                      { label: "Part-time", value: "part-time" },
                      { label: "Contract", value: "contract" },
                      { label: "Intern", value: "intern" },
                    ]}
                  />
                  <SelectField
                    label="Employee Status"
                    value={form.status}
                    onChange={(value) => handleChange("status", value)}
                    options={[
                      { label: "Active", value: "active" },
                      { label: "On Leave", value: "on-leave" },
                      { label: "Inactive", value: "inactive" },
                    ]}
                  />
                </div>

                <TextAreaField
                  icon={<FiBookOpen className="w-4 h-4 text-cyan-400" />}
                  label="Education"
                  value={form.education}
                  onChange={(value) => handleChange("education", value)}
                  placeholder="PhD in Computer Science, University..."
                  rows={3}
                />

                <TextAreaField
                  icon={<FiBriefcase className="w-4 h-4 text-cyan-400" />}
                  label="Experience"
                  value={form.experience}
                  onChange={(value) => handleChange("experience", value)}
                  placeholder="Previous institutions, projects, and role details..."
                  rows={3}
                />

                <InputField
                  icon={<FiCode className="w-4 h-4 text-cyan-400" />}
                  label="Specialization"
                  value={form.specialization}
                  onChange={(value) => handleChange("specialization", value)}
                  placeholder="NLP, Computer Vision, Bioinformatics..."
                />

                <TextAreaField
                  icon={<FiBookOpen className="w-4 h-4 text-cyan-400" />}
                  label="Research Interests"
                  value={form.researchInterests}
                  onChange={(value) => handleChange("researchInterests", value)}
                  placeholder="List current research interests and domains..."
                  rows={3}
                />

                <TextAreaField
                  icon={<FiUser className="w-4 h-4 text-cyan-400" />}
                  label="Bio"
                  value={form.bio}
                  onChange={(value) => handleChange("bio", value)}
                  placeholder="Professional summary of this employee..."
                  rows={4}
                />

                <TextAreaField
                  icon={<FiCheckCircle className="w-4 h-4 text-cyan-400" />}
                  label="Achievements"
                  value={form.achievements}
                  onChange={(value) => handleChange("achievements", value)}
                  placeholder="Awards, publications, grants..."
                  rows={3}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Skills</label>
                  <div className="flex gap-2">
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
                      placeholder="Add skill and press Enter"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-4 py-3 bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 rounded-xl hover:bg-cyan-600/30 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {form.skills.map((skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-900/30 text-blue-300 text-xs border border-blue-700/40"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(index)}
                          className="text-blue-200 hover:text-red-300"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField
                    icon={<FiLinkedin className="w-4 h-4 text-cyan-400" />}
                    label="LinkedIn"
                    value={form.linkedin}
                    onChange={(value) => handleChange("linkedin", value)}
                    placeholder="linkedin.com/in/..."
                  />
                  <InputField
                    icon={<FiGithub className="w-4 h-4 text-cyan-400" />}
                    label="GitHub"
                    value={form.github}
                    onChange={(value) => handleChange("github", value)}
                    placeholder="github.com/..."
                  />
                  <InputField
                    icon={<FiGlobe className="w-4 h-4 text-cyan-400" />}
                    label="Website"
                    value={form.website}
                    onChange={(value) => handleChange("website", value)}
                    placeholder="https://..."
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleSaveEmployee}
                  disabled={isSaving}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving Employee...
                    </>
                  ) : (
                    <>
                      <FiSave className="w-4 h-4" />
                      Save Employee
                    </>
                  )}
                </motion.button>
              </div>
            </GlassCard>
          </div>

          <div>
            <GlassCard className="p-6 sticky top-6">
              <h3 className="text-xl font-bold text-white mb-4">Live Preview</h3>
              <div className="rounded-2xl bg-black/50 border border-gray-800/70 p-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-r from-blue-700 to-cyan-700 flex items-center justify-center">
                    {form.profileImage ? (
                      <img
                        src={form.profileImage}
                        alt="Employee"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FiUser className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-semibold truncate">
                      {form.fullName || "Employee Name"}
                    </p>
                    <p className="text-cyan-300 text-sm truncate">
                      {form.designation || "Designation"}
                    </p>
                    <p className="text-gray-400 text-xs truncate">{form.email || "email@company.com"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Badge label="Department" value={form.department || "N/A"} />
                  <Badge label="Status" value={form.status || "active"} />
                  <Badge label="Type" value={form.employmentType || "full-time"} />
                  <Badge label="Experience" value={`${form.yearsOfExperience || 0} yrs`} />
                </div>
                <div className="mt-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {form.skills.length > 0 ? (
                      form.skills.slice(0, 8).map((skill, index) => (
                        <span
                          key={`${skill}-preview-${index}`}
                          className="px-2 py-1 text-xs rounded-lg bg-blue-900/30 border border-blue-700/40 text-blue-300"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500">No skills added yet</p>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputField = ({
  icon,
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
      {icon}
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-black/60 border border-gray-800/70 hover:border-blue-600/50 rounded-xl text-white focus:border-blue-500 transition-all duration-300"
      placeholder={placeholder}
    />
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-black/60 border border-gray-800/70 hover:border-blue-600/50 rounded-xl text-white focus:border-blue-500 transition-all duration-300"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} className="bg-gray-900 text-white">
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const TextAreaField = ({
  icon,
  label,
  value,
  onChange,
  placeholder = "",
  rows = 3,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
      {icon}
      {label}
    </label>
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-black/60 border border-gray-800/70 hover:border-blue-600/50 rounded-xl text-white focus:border-blue-500 transition-all duration-300 resize-none"
      placeholder={placeholder}
    />
  </div>
);

const Badge = ({ label, value }) => (
  <div className="rounded-lg border border-gray-800/70 bg-black/40 p-2">
    <p className="text-[10px] uppercase tracking-wide text-gray-500">{label}</p>
    <p className="text-sm text-gray-200 truncate capitalize">{value}</p>
  </div>
);

export default AddEmployee;
