import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import {
  FiSearch,
  FiUser,
  FiUpload,
  FiSave,
  FiTrash2,
  FiX,
  FiUserCheck,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiHash,
  FiCalendar,
  FiCode,
  FiBookOpen,
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

const ModifyEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [form, setForm] = useState(initialForm);
  const [skillInput, setSkillInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const getToken = () => localStorage.getItem("adminToken");

  const fetchEmployees = async (preferredId = "") => {
    const token = getToken();
    if (!token) {
      toast.error("Please log in first");
      setIsLoadingList(false);
      return;
    }

    try {
      setIsLoadingList(true);
      const response = await fetch("http://localhost:5000/api/admin/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Invalid server response");
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch employees");
      }

      const list = data.data || [];
      setEmployees(list);

      if (list.length === 0) {
        setSelectedEmployeeId("");
        setForm(initialForm);
        return;
      }

      const targetId =
        (preferredId && list.some((emp) => emp._id === preferredId) && preferredId) ||
        (selectedEmployeeId && list.some((emp) => emp._id === selectedEmployeeId) && selectedEmployeeId) ||
        list[0]._id;

      await loadEmployee(targetId);
    } catch (error) {
      toast.error(error.message || "Failed to fetch employees");
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const loadEmployee = async (employeeId) => {
    if (!employeeId) return;
    const token = getToken();
    if (!token) return;

    try {
      setIsLoadingEmployee(true);
      const response = await fetch(`http://localhost:5000/api/admin/employees/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Invalid employee response");
      }

      const data = await response.json();
      if (!response.ok || !data.success || !data.data) {
        throw new Error(data.message || "Failed to load employee");
      }

      const employee = data.data;
      setSelectedEmployeeId(employee._id);
      setForm({
        fullName: employee.fullName || "",
        email: employee.email || "",
        phone: employee.phone || "",
        profileImage: employee.profileImage || "",
        profileImagePublicId: employee.profileImagePublicId || "",
        designation: employee.designation || "",
        department: employee.department || "",
        employeeCode: employee.employeeCode || "",
        employmentType: employee.employmentType || "full-time",
        status: employee.status || "active",
        location: employee.location || "",
        education: employee.education || "",
        experience: employee.experience || "",
        yearsOfExperience: Number(employee.yearsOfExperience || 0),
        skills: Array.isArray(employee.skills) ? employee.skills : [],
        specialization: employee.specialization || "",
        researchInterests: employee.researchInterests || "",
        bio: employee.bio || "",
        achievements: employee.achievements || "",
        joinDate: toDateInputValue(employee.joinDate),
        linkedin: employee.linkedin || "",
        github: employee.github || "",
        website: employee.website || "",
      });
      setSkillInput("");
    } catch (error) {
      toast.error(error.message || "Failed to load employee");
    } finally {
      setIsLoadingEmployee(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    if (!needle) return employees;
    return employees.filter((employee) => {
      return (
        employee.fullName?.toLowerCase().includes(needle) ||
        employee.email?.toLowerCase().includes(needle) ||
        employee.designation?.toLowerCase().includes(needle) ||
        employee.department?.toLowerCase().includes(needle)
      );
    });
  }, [employees, searchTerm]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = () => {
    const nextSkill = skillInput.trim();
    if (!nextSkill) return;
    if (form.skills.some((item) => item.toLowerCase() === nextSkill.toLowerCase())) {
      toast.error("Skill already exists");
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

  const handleUploadImage = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const token = getToken();
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
        headers: { Authorization: `Bearer ${token}` },
        body,
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Invalid upload response");
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
      toast.success("Photo uploaded");
    } catch (error) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleUpdateEmployee = async () => {
    if (!selectedEmployeeId) return;
    if (!form.fullName.trim() || !form.email.trim() || !form.designation.trim()) {
      toast.error("Full name, email, and designation are required");
      return;
    }

    const token = getToken();
    if (!token) return;

    try {
      setIsSaving(true);
      const response = await fetch(`http://localhost:5000/api/admin/employees/${selectedEmployeeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Invalid update response");
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update employee");
      }

      toast.success("Employee updated successfully");
      await fetchEmployees(selectedEmployeeId);
    } catch (error) {
      toast.error(error.message || "Failed to update employee");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployeeId) return;
    const selected = employees.find((item) => item._id === selectedEmployeeId);
    if (!window.confirm(`Delete "${selected?.fullName || "this employee"}"?`)) return;

    const token = getToken();
    if (!token) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`http://localhost:5000/api/admin/employees/${selectedEmployeeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Invalid delete response");
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete employee");
      }

      toast.success("Employee deleted");
      await fetchEmployees("");
    } catch (error) {
      toast.error(error.message || "Failed to delete employee");
    } finally {
      setIsDeleting(false);
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
                Modify <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Employee</span>
              </h2>
              <p className="text-gray-300 text-lg">
                Select employee, edit details, and delete when needed
              </p>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-gray-800/70">
              <p className="text-xs text-gray-400">Employees</p>
              <p className="text-xl font-semibold text-cyan-300">{employees.length}</p>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <GlassCard className="p-4">
              <div className="relative mb-4">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search employee..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/60 border border-gray-800/70 text-white focus:border-blue-500"
                />
              </div>

              <div className="space-y-2 max-h-[68vh] overflow-auto pr-1">
                {isLoadingList ? (
                  <p className="text-sm text-gray-400 py-6 text-center">Loading employees...</p>
                ) : filteredEmployees.length === 0 ? (
                  <p className="text-sm text-gray-500 py-6 text-center">No employee found</p>
                ) : (
                  filteredEmployees.map((employee) => {
                    const isActive = selectedEmployeeId === employee._id;
                    return (
                      <button
                        key={employee._id}
                        type="button"
                        onClick={() => loadEmployee(employee._id)}
                        className={`w-full text-left p-3 rounded-xl border transition-colors ${
                          isActive
                            ? "bg-blue-900/25 border-blue-700/40"
                            : "bg-black/40 border-gray-800/70 hover:bg-black/60"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-r from-blue-700 to-cyan-700 flex items-center justify-center">
                            {employee.profileImage ? (
                              <img
                                src={employee.profileImage}
                                alt={employee.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FiUser className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-white font-medium truncate">{employee.fullName}</p>
                            <p className="text-xs text-cyan-300 truncate">{employee.designation}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-2">
            {!selectedEmployeeId ? (
              <GlassCard className="p-10 text-center">
                <FiUserCheck className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                <p className="text-lg text-gray-300">Select an employee to modify</p>
              </GlassCard>
            ) : (
              <GlassCard className="p-6">
                {isLoadingEmployee ? (
                  <p className="text-gray-400 text-center py-10">Loading employee details...</p>
                ) : (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white">Edit Employee Details</h3>

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
                            id="modify-employee-image-upload"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadImage(file);
                              e.target.value = "";
                            }}
                            disabled={isUploadingImage}
                          />
                          <label
                            htmlFor="modify-employee-image-upload"
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField
                        icon={<FiUser className="w-4 h-4 text-cyan-400" />}
                        label="Full Name *"
                        value={form.fullName}
                        onChange={(value) => handleChange("fullName", value)}
                      />
                      <InputField
                        icon={<FiMail className="w-4 h-4 text-cyan-400" />}
                        label="Email *"
                        value={form.email}
                        onChange={(value) => handleChange("email", value)}
                      />
                      <InputField
                        icon={<FiPhone className="w-4 h-4 text-cyan-400" />}
                        label="Phone"
                        value={form.phone}
                        onChange={(value) => handleChange("phone", value)}
                      />
                      <InputField
                        icon={<FiMapPin className="w-4 h-4 text-cyan-400" />}
                        label="Location"
                        value={form.location}
                        onChange={(value) => handleChange("location", value)}
                      />
                      <InputField
                        icon={<FiBriefcase className="w-4 h-4 text-cyan-400" />}
                        label="Designation *"
                        value={form.designation}
                        onChange={(value) => handleChange("designation", value)}
                      />
                      <InputField
                        icon={<FiBriefcase className="w-4 h-4 text-cyan-400" />}
                        label="Department"
                        value={form.department}
                        onChange={(value) => handleChange("department", value)}
                      />
                      <InputField
                        icon={<FiHash className="w-4 h-4 text-cyan-400" />}
                        label="Employee Code"
                        value={form.employeeCode}
                        onChange={(value) => handleChange("employeeCode", value)}
                      />
                      <InputField
                        icon={<FiCalendar className="w-4 h-4 text-cyan-400" />}
                        type="number"
                        label="Years of Experience"
                        value={form.yearsOfExperience}
                        onChange={(value) => handleChange("yearsOfExperience", value)}
                      />
                      <InputField
                        icon={<FiCalendar className="w-4 h-4 text-cyan-400" />}
                        type="date"
                        label="Join Date"
                        value={form.joinDate}
                        onChange={(value) => handleChange("joinDate", value)}
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

                    <InputField
                      icon={<FiCode className="w-4 h-4 text-cyan-400" />}
                      label="Specialization"
                      value={form.specialization}
                      onChange={(value) => handleChange("specialization", value)}
                    />

                    <TextAreaField
                      icon={<FiBookOpen className="w-4 h-4 text-cyan-400" />}
                      label="Education"
                      value={form.education}
                      onChange={(value) => handleChange("education", value)}
                    />
                    <TextAreaField
                      icon={<FiBriefcase className="w-4 h-4 text-cyan-400" />}
                      label="Experience"
                      value={form.experience}
                      onChange={(value) => handleChange("experience", value)}
                    />
                    <TextAreaField
                      icon={<FiBookOpen className="w-4 h-4 text-cyan-400" />}
                      label="Research Interests"
                      value={form.researchInterests}
                      onChange={(value) => handleChange("researchInterests", value)}
                    />
                    <TextAreaField
                      icon={<FiUser className="w-4 h-4 text-cyan-400" />}
                      label="Bio"
                      value={form.bio}
                      onChange={(value) => handleChange("bio", value)}
                    />
                    <TextAreaField
                      icon={<FiUserCheck className="w-4 h-4 text-cyan-400" />}
                      label="Achievements"
                      value={form.achievements}
                      onChange={(value) => handleChange("achievements", value)}
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
                          className="flex-1 px-4 py-3 bg-black/60 border border-gray-800/70 rounded-xl text-white focus:border-blue-500"
                          placeholder="Add skill and press Enter"
                        />
                        <button
                          type="button"
                          onClick={handleAddSkill}
                          className="px-4 py-3 rounded-xl bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-600/30"
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
                      />
                      <InputField
                        icon={<FiGithub className="w-4 h-4 text-cyan-400" />}
                        label="GitHub"
                        value={form.github}
                        onChange={(value) => handleChange("github", value)}
                      />
                      <InputField
                        icon={<FiGlobe className="w-4 h-4 text-cyan-400" />}
                        label="Website"
                        value={form.website}
                        onChange={(value) => handleChange("website", value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleUpdateEmployee}
                        disabled={isSaving || isDeleting}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {isSaving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Updating...
                          </>
                        ) : (
                          <>
                            <FiSave className="w-4 h-4" />
                            Update Employee
                          </>
                        )}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleDeleteEmployee}
                        disabled={isDeleting || isSaving}
                        className="w-full bg-red-600/20 border border-red-500/30 text-red-300 px-6 py-4 rounded-xl font-semibold hover:bg-red-600/30 transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {isDeleting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin"></div>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <FiTrash2 className="w-4 h-4" />
                            Delete Employee
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                )}
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
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
      placeholder={placeholder}
      className="w-full px-4 py-3 bg-black/60 border border-gray-800/70 rounded-xl text-white focus:border-blue-500"
    />
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-black/60 border border-gray-800/70 rounded-xl text-white focus:border-blue-500"
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
      placeholder={placeholder}
      className="w-full px-4 py-3 bg-black/60 border border-gray-800/70 rounded-xl text-white focus:border-blue-500 resize-none"
    />
  </div>
);

export default ModifyEmployee;
