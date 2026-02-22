import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import {
  FiActivity,
  FiCpu,
  FiExternalLink,
  FiLink,
  FiRadio,
  FiSearch,
  FiTool,
  FiX,
} from "react-icons/fi";
import AnimatedCanvas from "../../../components/animations/animatedCanvas";
import GlassCard from "../../../components/ui/GlassCard";

const statusOptions = [
  { label: "All Status", value: "all" },
  { label: "Idea", value: "idea" },
  { label: "Concept Validation", value: "concept-validation" },
  { label: "Prototype Development", value: "prototype-development" },
  { label: "Pilot Testing", value: "pilot-testing" },
  { label: "Deployed", value: "deployed" },
];

const ViewInnovation = () => {
  const [innovations, setInnovations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInnovation, setSelectedInnovation] = useState(null);

  const fetchInnovations = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      toast.error("Please log in first");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
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
        throw new Error(data.message || "Failed to load innovations");
      }

      setInnovations(data.data || []);
    } catch (error) {
      toast.error(error.message || "Failed to fetch innovations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInnovations();
  }, []);

  const filteredInnovations = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    return innovations.filter((item) => {
      const matchesStatus =
        statusFilter === "all" || item.developmentStatus === statusFilter;
      const matchesSearch =
        !needle ||
        item.innovationTitle?.toLowerCase().includes(needle) ||
        item.problemStatement?.toLowerCase().includes(needle) ||
        item.proposedIotSolution?.toLowerCase().includes(needle) ||
        item.technologiesUsed?.sensors?.toLowerCase().includes(needle) ||
        item.technologiesUsed?.microcontroller?.toLowerCase().includes(needle) ||
        item.technologiesUsed?.communication?.toLowerCase().includes(needle) ||
        (item.links || []).some(
          (link) =>
            link.label?.toLowerCase().includes(needle) ||
            link.url?.toLowerCase().includes(needle)
        );

      return matchesStatus && matchesSearch;
    });
  }, [innovations, searchTerm, statusFilter]);

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
                View{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  Innovations
                </span>
              </h2>
              <p className="text-gray-300 text-lg">
                All innovations in equal cards, organized in 3 columns
              </p>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-gray-800/70">
              <p className="text-xs text-gray-400">Total Innovations</p>
              <p className="text-xl font-semibold text-cyan-300">{innovations.length}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative md:col-span-3">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search innovation title, problem, technologies..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/60 border border-gray-800/70 text-white focus:border-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/60 border border-gray-800/70 text-white focus:border-blue-500"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-gray-900 text-white">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </GlassCard>

        {isLoading ? (
          <div className="h-[55vh] flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-400">Loading innovations...</p>
            </div>
          </div>
        ) : filteredInnovations.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <FiActivity className="w-10 h-10 text-gray-500 mx-auto mb-3" />
            <p className="text-lg text-gray-300">No innovation found</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredInnovations.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedInnovation(item)}
                  className="w-full text-left"
                >
                <GlassCard className="p-4 h-full min-h-[220px] flex flex-col hover:border-blue-700/50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-white text-base font-bold line-clamp-2 min-h-[3rem]">
                      {item.innovationTitle}
                    </h3>
                    <span className="px-2 py-1 rounded-lg text-[11px] border bg-blue-900/30 border-blue-700/40 text-blue-300 whitespace-nowrap">
                      {formatStatus(item.developmentStatus)}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-gray-300 leading-relaxed line-clamp-3 min-h-[4rem]">
                    {item.problemStatement || "No problem statement"}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <SmallBadge label="Sensors" value={item.technologiesUsed?.sensors} />
                    <SmallBadge
                      label="Microcontroller"
                      value={item.technologiesUsed?.microcontroller}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {(item.links || []).length} link(s)
                    </span>
                    <span className="text-xs text-cyan-300">Click to view details</span>
                  </div>
                </GlassCard>
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {selectedInnovation && (
        <div
          className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm p-4 md:p-8 overflow-y-auto"
          onClick={() => setSelectedInnovation(null)}
        >
          <div
            className="max-w-5xl mx-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <GlassCard className="p-5 md:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {selectedInnovation.innovationTitle}
                  </h3>
                  <p className="text-sm text-cyan-300 mt-1">
                    {formatStatus(selectedInnovation.developmentStatus)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedInnovation(null)}
                  className="p-2 rounded-lg bg-black/50 border border-gray-800/70 text-gray-300 hover:text-white"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-5">
                  <section>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Problem Statement</p>
                    <p className="mt-2 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {selectedInnovation.problemStatement || "No problem statement"}
                    </p>
                  </section>
                  <section>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Proposed IoT Solution
                    </p>
                    <p className="mt-2 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {selectedInnovation.proposedIotSolution || "No solution details"}
                    </p>
                  </section>
                </div>

                <div className="space-y-4">
                  <TechLine
                    icon={<FiTool className="w-3.5 h-3.5" />}
                    label="Sensors"
                    value={selectedInnovation.technologiesUsed?.sensors}
                  />
                  <TechLine
                    icon={<FiCpu className="w-3.5 h-3.5" />}
                    label="Microcontroller"
                    value={selectedInnovation.technologiesUsed?.microcontroller}
                  />
                  <TechLine
                    icon={<FiRadio className="w-3.5 h-3.5" />}
                    label="Communication"
                    value={selectedInnovation.technologiesUsed?.communication}
                  />

                  <div className="rounded-xl border border-gray-800/60 bg-black/35 p-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Links</p>
                    <div className="flex flex-wrap gap-2">
                      {(selectedInnovation.links || []).length > 0 ? (
                        selectedInnovation.links.map((link, index) => (
                          <a
                            key={`${selectedInnovation._id}-modal-link-${index}`}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs bg-cyan-900/30 border border-cyan-700/40 text-cyan-300 hover:bg-cyan-900/45"
                          >
                            <FiLink className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[15rem]">{link.label || "Link"}</span>
                            <FiExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">No links added</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};

const SmallBadge = ({ label, value }) => (
  <div className="rounded-lg border border-gray-800/60 bg-black/35 px-2 py-1.5">
    <p className="text-[10px] uppercase tracking-wide text-gray-500">{label}</p>
    <p className="text-xs text-gray-300 truncate">{value || "N/A"}</p>
  </div>
);

const TechLine = ({ icon, label, value }) => (
  <div className="rounded-lg border border-gray-800/60 bg-black/35 px-2.5 py-2">
    <div className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-gray-500">
      <span className="text-cyan-400">{icon}</span>
      {label}
    </div>
    <p className="text-xs text-gray-300 mt-1 line-clamp-2 min-h-[2rem]">
      {value || "Not specified"}
    </p>
  </div>
);

const formatStatus = (value = "idea") =>
  String(value)
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export default ViewInnovation;
