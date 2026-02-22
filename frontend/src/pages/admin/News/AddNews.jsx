import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import {
  FiAlignLeft,
  FiCalendar,
  FiFolder,
  FiSave,
  FiTag,
  FiType,
} from "react-icons/fi";
import AnimatedCanvas from "../../../components/animations/animatedCanvas";
import GlassCard from "../../../components/ui/GlassCard";

const initialForm = {
  title: "",
  date: "",
  category: "",
  year: "",
  description: "",
};

const AddNews = () => {
  const [form, setForm] = useState(initialForm);
  const [isSaving, setIsSaving] = useState(false);

  const descriptionLength = useMemo(
    () => String(form.description || "").trim().length,
    [form.description]
  );

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const normalizedTitle = String(form.title || "").trim();
    const normalizedDate = String(form.date || "").trim();
    const normalizedCategory = String(form.category || "").trim();
    const normalizedYear = String(form.year || "").trim();
    const normalizedDescription = String(form.description || "").trim();

    const missing = [];
    if (!normalizedTitle) missing.push("Title");
    if (!normalizedDate) missing.push("Date");
    if (!normalizedCategory) missing.push("Category");
    if (!normalizedYear) missing.push("Year");
    if (!normalizedDescription) missing.push("Description");

    if (missing.length) {
      toast.error(`Please fill: ${missing.join(", ")}`);
      return;
    }

    const yearNumber = Number(normalizedYear);
    if (!Number.isFinite(yearNumber) || yearNumber < 1900 || yearNumber > 2100) {
      toast.error("Please enter a valid year (1900-2100)");
      return;
    }

    const token = localStorage.getItem("adminToken");
    if (!token) {
      toast.error("Please log in first");
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch("http://localhost:5000/api/admin/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: normalizedTitle,
          date: normalizedDate,
          category: normalizedCategory,
          year: Math.trunc(yearNumber),
          description: normalizedDescription,
        }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Invalid create response");
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to add news");
      }

      toast.success("News added successfully");
      setForm(initialForm);
    } catch (error) {
      toast.error(error.message || "Failed to add news");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-x-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: "#1f2937", color: "#fff", border: "1px solid #374151" },
        }}
      />
      <AnimatedCanvas />

      <div className="relative z-10 p-4 md:p-6">
        <GlassCard className="mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Add{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  News
                </span>
              </h2>
              <p className="text-gray-300 text-lg">
                Create news with title, date, category, year, and description
              </p>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-gray-800/70">
              <p className="text-xs text-gray-400">Description Length</p>
              <p className="text-xl font-semibold text-cyan-300">{descriptionLength}</p>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">News Information</h3>

              <div className="space-y-6">
                <InputField
                  icon={<FiType className="w-4 h-4 text-cyan-400" />}
                  label="Title *"
                  value={form.title}
                  onChange={(value) => handleChange("title", value)}
                  placeholder="News title"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField
                    icon={<FiCalendar className="w-4 h-4 text-cyan-400" />}
                    label="Date *"
                    value={form.date}
                    onChange={(value) => handleChange("date", value)}
                    placeholder="YYYY-MM-DD"
                  />
                  <InputField
                    icon={<FiFolder className="w-4 h-4 text-cyan-400" />}
                    label="Category *"
                    value={form.category}
                    onChange={(value) => handleChange("category", value)}
                    placeholder="Research / Event / Award"
                  />
                  <InputField
                    icon={<FiTag className="w-4 h-4 text-cyan-400" />}
                    label="Year *"
                    value={form.year}
                    onChange={(value) => handleChange("year", value)}
                    placeholder="2026"
                    type="number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FiAlignLeft className="w-4 h-4 text-cyan-400" />
                    Description *
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(event) => handleChange("description", event.target.value)}
                    className="w-full px-4 py-3 bg-black/60 border border-gray-800/70 rounded-xl text-white focus:border-blue-500 min-h-[180px]"
                    placeholder="Write full news description"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 rounded-xl font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Saving News...
                    </>
                  ) : (
                    <>
                      <FiSave className="w-4 h-4" />
                      Save News
                    </>
                  )}
                </motion.button>
              </div>
            </GlassCard>
          </div>

          <div className="self-start lg:sticky lg:top-24">
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Live Preview</h3>
              <div className="rounded-2xl bg-black/50 border border-gray-800/70 p-4">
                <h4 className="text-white font-semibold line-clamp-2">
                  {form.title || "News Title"}
                </h4>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-2 py-1 rounded-lg text-xs bg-blue-900/30 border border-blue-700/40 text-blue-300">
                    {form.category || "Category"}
                  </span>
                  <span className="px-2 py-1 rounded-lg text-xs bg-cyan-900/30 border border-cyan-700/40 text-cyan-300">
                    {form.year || "Year"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {formatNewsDate(form.date) || "Date"}
                </p>
                <p className="mt-3 text-sm text-gray-300 whitespace-pre-wrap break-words line-clamp-8 min-h-[10rem]">
                  {form.description || "Description preview..."}
                </p>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ icon, label, value, onChange, placeholder = "", type = "text" }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
      {icon}
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 bg-black/60 border border-gray-800/70 rounded-xl text-white focus:border-blue-500"
    />
  </div>
);

const formatNewsDate = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString();
};

export default AddNews;

