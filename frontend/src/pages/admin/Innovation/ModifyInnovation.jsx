import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import {
  FiActivity,
  FiCpu,
  FiEdit,
  FiLink,
  FiPlus,
  FiRadio,
  FiSave,
  FiSearch,
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

const ModifyInnovation = () => {
  const [innovations, setInnovations] = useState([]);
  const [selectedInnovationId, setSelectedInnovationId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState(initialForm);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingInnovation, setIsLoadingInnovation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getToken = () => localStorage.getItem("adminToken");

  const fetchInnovations = async (preferredId = "") => {
    const token = getToken();
    if (!token) {
      toast.error("Please log in first");
      setIsLoadingList(false);
      return;
    }

    try {
      setIsLoadingList(true);
      const response = await fetch("http://localhost:5000/api/admin/innovations", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Invalid server response");
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch innovations");
      }

      const list = data.data || [];
      setInnovations(list);

      if (list.length === 0) {
        setSelectedInnovationId("");
        setForm(initialForm);
        return;
      }

      const targetId =
        (preferredId && list.some((item) => item._id === preferredId) && preferredId) ||
        (selectedInnovationId &&
          list.some((item) => item._id === selectedInnovationId) &&
          selectedInnovationId) ||
        list[0]._id;

      await loadInnovation(targetId);
    } catch (error) {
      toast.error(error.message || "Failed to fetch innovations");
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchInnovations();
  }, []);

  const loadInnovation = async (innovationId) => {
    if (!innovationId) return;
    const token = getToken();
    if (!token) return;

    try {
      setIsLoadingInnovation(true);
      const response = await fetch(`http://localhost:5000/api/admin/innovations/${innovationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Invalid server response");
      }

      const data = await response.json();
      if (!response.ok || !data.success || !data.data) {
        throw new Error(data.message || "Failed to load innovation");
      }

      const innovation = data.data;
      setSelectedInnovationId(innovation._id);
      setForm({
        innovationTitle: innovation.innovationTitle || "",
        problemStatement: innovation.problemStatement || "",
        proposedIotSolution: innovation.proposedIotSolution || "",
        technologiesUsed: {
          sensors: innovation.technologiesUsed?.sensors || "",
          microcontroller: innovation.technologiesUsed?.microcontroller || "",
          communication: innovation.technologiesUsed?.communication || "",
        },
        developmentStatus: innovation.developmentStatus || "idea",
        links: Array.isArray(innovation.links) ? innovation.links : [],
      });
    } catch (error) {
      toast.error(error.message || "Failed to load innovation");
    } finally {
      setIsLoadingInnovation(false);
    }
  };

  const filteredInnovations = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    if (!needle) return innovations;
    return innovations.filter((item) => {
      return (
        item.innovationTitle?.toLowerCase().includes(needle) ||
        item.problemStatement?.toLowerCase().includes(needle) ||
        item.developmentStatus?.toLowerCase().includes(needle)
      );
    });
  }, [innovations, searchTerm]);

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

  const handleUpdateInnovation = async () => {
    if (!selectedInnovationId) return;
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

    const token = getToken();
    if (!token) return;

    try {
      setIsSaving(true);
      const response = await fetch(
        `http://localhost:5000/api/admin/innovations/${selectedInnovationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Invalid update response");
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update innovation");
      }

      toast.success("Innovation updated successfully");
      await fetchInnovations(selectedInnovationId);
    } catch (error) {
      toast.error(error.message || "Failed to update innovation");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteInnovation = async () => {
    if (!selectedInnovationId) return;
    const selected = innovations.find((item) => item._id === selectedInnovationId);
    if (!window.confirm(`Delete "${selected?.innovationTitle || "this innovation"}"?`)) return;

    const token = getToken();
    if (!token) return;

    try {
      setIsDeleting(true);
      const response = await fetch(
        `http://localhost:5000/api/admin/innovations/${selectedInnovationId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Invalid delete response");
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete innovation");
      }

      toast.success("Innovation deleted");
      await fetchInnovations("");
    } catch (error) {
      toast.error(error.message || "Failed to delete innovation");
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
          style: { background: "#1f2937", color: "#fff", border: "1px solid #374151" },
        }}
      />
      <AnimatedCanvas />

      <div className="relative z-10 p-4 md:p-6">
        <GlassCard className="mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Modify{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  Innovation
                </span>
              </h2>
              <p className="text-gray-300 text-lg">
                Edit innovation details, links, and development status
              </p>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-gray-800/70">
              <p className="text-xs text-gray-400">Innovations</p>
              <p className="text-xl font-semibold text-cyan-300">{innovations.length}</p>
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
                  placeholder="Search innovation..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/60 border border-gray-800/70 text-white focus:border-blue-500"
                />
              </div>

              <div className="space-y-2 max-h-[68vh] overflow-auto pr-1">
                {isLoadingList ? (
                  <p className="text-sm text-gray-400 py-6 text-center">Loading innovations...</p>
                ) : filteredInnovations.length === 0 ? (
                  <p className="text-sm text-gray-500 py-6 text-center">No innovation found</p>
                ) : (
                  filteredInnovations.map((item) => {
                    const isActive = selectedInnovationId === item._id;
                    return (
                      <button
                        key={item._id}
                        type="button"
                        onClick={() => loadInnovation(item._id)}
                        className={`w-full text-left p-3 rounded-xl border transition-colors ${
                          isActive
                            ? "bg-blue-900/25 border-blue-700/40"
                            : "bg-black/40 border-gray-800/70 hover:bg-black/60"
                        }`}
                      >
                        <p className="text-sm text-white font-medium truncate">
                          {item.innovationTitle}
                        </p>
                        <p className="text-xs text-cyan-300 truncate">
                          {formatStatus(item.developmentStatus)}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-2">
            {!selectedInnovationId ? (
              <GlassCard className="p-10 text-center">
                <FiEdit className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                <p className="text-lg text-gray-300">Select an innovation to modify</p>
              </GlassCard>
            ) : (
              <GlassCard className="p-6">
                {isLoadingInnovation ? (
                  <p className="text-gray-400 text-center py-10">Loading innovation details...</p>
                ) : (
                  <div className="space-y-6">
                    <InputField
                      icon={<FiActivity className="w-4 h-4 text-cyan-400" />}
                      label="Innovation Title *"
                      value={form.innovationTitle}
                      onChange={(value) => handleChange("innovationTitle", value)}
                    />

                    <TextAreaField
                      label="Problem Statement *"
                      value={form.problemStatement}
                      onChange={(value) => handleChange("problemStatement", value)}
                      rows={4}
                    />

                    <TextAreaField
                      label="Proposed IoT Solution (Brief Description) *"
                      value={form.proposedIotSolution}
                      onChange={(value) => handleChange("proposedIotSolution", value)}
                      rows={4}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <InputField
                        icon={<FiTool className="w-4 h-4 text-cyan-400" />}
                        label="Sensors"
                        value={form.technologiesUsed.sensors}
                        onChange={(value) => handleTechChange("sensors", value)}
                      />
                      <InputField
                        icon={<FiCpu className="w-4 h-4 text-cyan-400" />}
                        label="Microcontroller"
                        value={form.technologiesUsed.microcontroller}
                        onChange={(value) => handleTechChange("microcontroller", value)}
                      />
                      <InputField
                        icon={<FiRadio className="w-4 h-4 text-cyan-400" />}
                        label="Communication"
                        value={form.technologiesUsed.communication}
                        onChange={(value) => handleTechChange("communication", value)}
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleUpdateInnovation}
                        disabled={isSaving || isDeleting}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 rounded-xl font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {isSaving ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Updating...
                          </>
                        ) : (
                          <>
                            <FiSave className="w-4 h-4" />
                            Update Innovation
                          </>
                        )}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleDeleteInnovation}
                        disabled={isDeleting || isSaving}
                        className="w-full bg-red-600/20 border border-red-500/30 text-red-300 px-6 py-4 rounded-xl font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {isDeleting ? (
                          <>
                            <span className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin"></span>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <FiTrash2 className="w-4 h-4" />
                            Delete Innovation
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
      placeholder={placeholder}
      className="w-full px-4 py-3 bg-black/60 border border-gray-800/70 rounded-xl text-white focus:border-blue-500"
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
      placeholder={placeholder}
      className="w-full px-4 py-3 bg-black/60 border border-gray-800/70 rounded-xl text-white focus:border-blue-500 resize-none"
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

const formatStatus = (value = "idea") =>
  String(value)
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export default ModifyInnovation;

