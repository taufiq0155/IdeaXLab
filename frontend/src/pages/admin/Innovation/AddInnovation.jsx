import { useState } from "react";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import {
  FiActivity,
  FiCpu,
  FiLink,
  FiPlus,
  FiRadio,
  FiSave,
  FiTool,
  FiTrash2,
} from "react-icons/fi";
import AnimatedCanvas from "../../../components/animations/animatedCanvas";
import GlassCard from "../../../components/ui/GlassCard";

const initialForm = {
  innovationTitle: "",
  problemStatement: "",
  proposedIotSolution: "",
  technologiesUsed: {
    sensors: "",
    microcontroller: "",
    communication: "",
  },
  developmentStatus: "idea",
  links: [],
};

const statusOptions = [
  { label: "Idea", value: "idea" },
  { label: "Concept Validation", value: "concept-validation" },
  { label: "Prototype Development", value: "prototype-development" },
  { label: "Pilot Testing", value: "pilot-testing" },
  { label: "Deployed", value: "deployed" },
];

const AddInnovation = () => {
  const [form, setForm] = useState(initialForm);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTechChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      technologiesUsed: { ...prev.technologiesUsed, [field]: value },
    }));
  };

  const addLink = () => {
    setForm((prev) => ({
      ...prev,
      links: [...prev.links, { label: "", url: "" }],
    }));
  };

  const removeLink = (index) => {
    setForm((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));
  };

  const updateLink = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      links: prev.links.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleSaveInnovation = async () => {
    if (
      !form.innovationTitle.trim() ||
      !form.problemStatement.trim() ||
      !form.proposedIotSolution.trim()
    ) {
      toast.error(
        "Innovation title, problem statement, and proposed IoT solution are required"
      );
      return;
    }

    const token = localStorage.getItem("adminToken");
    if (!token) {
      toast.error("Please log in first");
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch("http://localhost:5000/api/admin/innovations", {
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
        throw new Error(text || "Invalid create response");
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create innovation");
      }

      toast.success("Innovation added successfully");
      setForm(initialForm);
    } catch (error) {
      toast.error(error.message || "Failed to create innovation");
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
                  Innovation
                </span>
              </h2>
              <p className="text-gray-300 text-lg">
                Register IoT innovation with status, technologies, and links
              </p>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-gray-800/70">
              <p className="text-xs text-gray-400">Links Added</p>
              <p className="text-xl font-semibold text-cyan-300">{form.links.length}</p>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">Innovation Information</h3>

              <div className="space-y-6">
                <InputField
                  icon={<FiActivity className="w-4 h-4 text-cyan-400" />}
                  label="Innovation Title *"
                  value={form.innovationTitle}
                  onChange={(value) => handleChange("innovationTitle", value)}
                  placeholder="Smart Irrigation Control System"
                />

                <TextAreaField
                  label="Problem Statement *"
                  value={form.problemStatement}
                  onChange={(value) => handleChange("problemStatement", value)}
                  rows={4}
                  placeholder="Describe the real-world problem..."
                />

                <TextAreaField
                  label="Proposed IoT Solution (Brief Description) *"
                  value={form.proposedIotSolution}
                  onChange={(value) => handleChange("proposedIotSolution", value)}
                  rows={4}
                  placeholder="Explain how IoT will solve this problem..."
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField
                    icon={<FiTool className="w-4 h-4 text-cyan-400" />}
                    label="Sensors"
                    value={form.technologiesUsed.sensors}
                    onChange={(value) => handleTechChange("sensors", value)}
                    placeholder="Moisture, Temperature"
                  />
                  <InputField
                    icon={<FiCpu className="w-4 h-4 text-cyan-400" />}
                    label="Microcontroller"
                    value={form.technologiesUsed.microcontroller}
                    onChange={(value) => handleTechChange("microcontroller", value)}
                    placeholder="ESP32 / Arduino"
                  />
                  <InputField
                    icon={<FiRadio className="w-4 h-4 text-cyan-400" />}
                    label="Communication"
                    value={form.technologiesUsed.communication}
                    onChange={(value) => handleTechChange("communication", value)}
                    placeholder="Wi-Fi / LoRa / GSM"
                  />
                </div>

                <SelectField
                  label="Development Status"
                  value={form.developmentStatus}
                  onChange={(value) => handleChange("developmentStatus", value)}
                  options={statusOptions}
                />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">Links</label>
                    <button
                      type="button"
                      onClick={addLink}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 text-sm flex items-center gap-1"
                    >
                      <FiPlus className="w-3.5 h-3.5" />
                      Add Link
                    </button>
                  </div>

                  <div className="space-y-2">
                    {form.links.map((link, index) => (
                      <div key={`innovation-link-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-2">
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => updateLink(index, "label", e.target.value)}
                          className="md:col-span-4 px-3 py-2.5 rounded-xl bg-black/60 border border-gray-800/70 text-white focus:border-blue-500"
                          placeholder="Link Name"
                        />
                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) => updateLink(index, "url", e.target.value)}
                          className="md:col-span-7 px-3 py-2.5 rounded-xl bg-black/60 border border-gray-800/70 text-white focus:border-blue-500"
                          placeholder="https://..."
                        />
                        <button
                          type="button"
                          onClick={() => removeLink(index)}
                          className="md:col-span-1 px-3 py-2.5 rounded-xl bg-red-600/20 border border-red-500/30 text-red-300 hover:bg-red-600/30"
                        >
                          <FiTrash2 className="w-4 h-4 mx-auto" />
                        </button>
                      </div>
                    ))}
                    {!form.links.length && (
                      <p className="text-xs text-gray-500">No links added yet</p>
                    )}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleSaveInnovation}
                  disabled={isSaving}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 rounded-xl font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Saving Innovation...
                    </>
                  ) : (
                    <>
                      <FiSave className="w-4 h-4" />
                      Save Innovation
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
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-white font-semibold line-clamp-2">
                    {form.innovationTitle || "Innovation Title"}
                  </h4>
                  <span className="px-2 py-1 rounded-lg text-xs bg-blue-900/30 border border-blue-700/40 text-blue-300 whitespace-nowrap">
                    {formatStatus(form.developmentStatus)}
                  </span>
                </div>

                <p className="mt-3 text-xs uppercase tracking-wide text-gray-500">Problem</p>
                <p className="mt-1 text-sm text-gray-300 line-clamp-3">
                  {form.problemStatement || "Problem statement preview..."}
                </p>

                <p className="mt-3 text-xs uppercase tracking-wide text-gray-500">IoT Solution</p>
                <p className="mt-1 text-sm text-gray-300 line-clamp-3">
                  {form.proposedIotSolution || "Proposed IoT solution preview..."}
                </p>

                <div className="mt-4 space-y-2">
                  <TechRow label="Sensors" value={form.technologiesUsed.sensors} />
                  <TechRow label="Microcontroller" value={form.technologiesUsed.microcontroller} />
                  <TechRow label="Communication" value={form.technologiesUsed.communication} />
                </div>

                <div className="mt-4 space-y-1">
                  {form.links.slice(0, 4).map((link, idx) => (
                    <div key={`preview-link-${idx}`} className="text-xs text-gray-300 flex items-center gap-1">
                      <FiLink className="w-3.5 h-3.5 text-cyan-400" />
                      {link.label || "Link"}
                    </div>
                  ))}
                  {!form.links.length && <p className="text-xs text-gray-500">No links yet</p>}
                </div>
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
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-black/60 border border-gray-800/70 rounded-xl text-white focus:border-blue-500"
      placeholder={placeholder}
    />
  </div>
);

const TextAreaField = ({ label, value, onChange, rows = 3, placeholder = "" }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-black/60 border border-gray-800/70 rounded-xl text-white focus:border-blue-500 resize-none"
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

const TechRow = ({ label, value }) => (
  <div className="rounded-lg border border-gray-800/60 bg-black/40 px-3 py-2">
    <p className="text-[10px] uppercase tracking-wide text-gray-500">{label}</p>
    <p className="text-xs text-gray-300 line-clamp-2">{value || "Not specified"}</p>
  </div>
);

const formatStatus = (value = "idea") =>
  String(value)
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export default AddInnovation;
