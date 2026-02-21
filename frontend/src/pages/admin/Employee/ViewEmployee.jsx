import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import {
  FiSearch,
  FiUsers,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiBookOpen,
  FiCode,
  FiCalendar,
} from "react-icons/fi";
import AnimatedCanvas from "../../../components/animations/animatedCanvas";
import GlassCard from "../../../components/ui/GlassCard";

const ViewEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchEmployees = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      toast.error("Please log in first");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:5000/api/admin/employees", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Invalid server response");
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load employees");
      }

      setEmployees(data.data || []);
    } catch (error) {
      toast.error(error.message || "Failed to fetch employees");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    return employees.filter((employee) => {
      const matchesStatus = statusFilter === "all" || employee.status === statusFilter;
      const matchesSearch =
        !needle ||
        employee.fullName?.toLowerCase().includes(needle) ||
        employee.email?.toLowerCase().includes(needle) ||
        employee.designation?.toLowerCase().includes(needle) ||
        employee.department?.toLowerCase().includes(needle) ||
        employee.employeeCode?.toLowerCase().includes(needle);

      return matchesStatus && matchesSearch;
    });
  }, [employees, searchTerm, statusFilter]);

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
                View <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Employees</span>
              </h2>
              <p className="text-gray-300 text-lg">
                Research farm team directory with professional details
              </p>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-gray-800/70">
              <p className="text-xs text-gray-400">Total Employees</p>
              <p className="text-xl font-semibold text-cyan-300">{employees.length}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative md:col-span-2">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, designation, department..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/60 border border-gray-800/70 text-white focus:border-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/60 border border-gray-800/70 text-white focus:border-blue-500"
            >
              <option value="all" className="bg-gray-900 text-white">All Status</option>
              <option value="active" className="bg-gray-900 text-white">Active</option>
              <option value="on-leave" className="bg-gray-900 text-white">On Leave</option>
              <option value="inactive" className="bg-gray-900 text-white">Inactive</option>
            </select>
          </div>
        </GlassCard>

        {isLoading ? (
          <div className="h-[55vh] flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-400">Loading employees...</p>
            </div>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <FiUsers className="w-10 h-10 text-gray-500 mx-auto mb-3" />
            <p className="text-lg text-gray-300">No employee found</p>
            <p className="text-sm text-gray-500 mt-1">Try changing filters or add new employee</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredEmployees.map((employee) => (
              <motion.div
                key={employee._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <GlassCard className="p-5 h-full">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-r from-blue-700 to-cyan-700 flex items-center justify-center shrink-0">
                      {employee.profileImage ? (
                        <img
                          src={employee.profileImage}
                          alt={employee.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FiUser className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-white font-bold text-lg truncate">{employee.fullName}</h3>
                        <StatusBadge status={employee.status} />
                      </div>
                      <p className="text-cyan-300 text-sm">{employee.designation || "No designation"}</p>
                      <p className="text-gray-400 text-xs">{employee.department || "No department"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                    <InfoLine icon={<FiMail className="w-3.5 h-3.5" />} text={employee.email || "-"} />
                    <InfoLine icon={<FiPhone className="w-3.5 h-3.5" />} text={employee.phone || "-"} />
                    <InfoLine icon={<FiMapPin className="w-3.5 h-3.5" />} text={employee.location || "-"} />
                    <InfoLine
                      icon={<FiBriefcase className="w-3.5 h-3.5" />}
                      text={`${employee.employmentType || "full-time"} | ${Number(employee.yearsOfExperience || 0)} yrs`}
                    />
                    <InfoLine icon={<FiCode className="w-3.5 h-3.5" />} text={employee.employeeCode || "No code"} />
                    <InfoLine
                      icon={<FiCalendar className="w-3.5 h-3.5" />}
                      text={employee.joinDate ? new Date(employee.joinDate).toLocaleDateString() : "No join date"}
                    />
                  </div>

                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-2 flex items-center gap-1">
                      <FiBookOpen className="w-3.5 h-3.5" />
                      Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {employee.skills?.length ? (
                        employee.skills.map((skill, index) => (
                          <span
                            key={`${employee._id}-skill-${index}`}
                            className="px-2 py-1 text-xs rounded-lg bg-blue-900/30 border border-blue-700/40 text-blue-300"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">No skills provided</span>
                      )}
                    </div>
                  </div>

                  {(employee.bio || employee.researchInterests) && (
                    <div className="mt-4 p-3 rounded-xl bg-black/40 border border-gray-800/60">
                      {employee.bio && (
                        <p className="text-sm text-gray-300 line-clamp-2">
                          <span className="text-gray-500">Bio:</span> {employee.bio}
                        </p>
                      )}
                      {employee.researchInterests && (
                        <p className="text-sm text-gray-300 mt-2 line-clamp-2">
                          <span className="text-gray-500">Research:</span> {employee.researchInterests}
                        </p>
                      )}
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const InfoLine = ({ icon, text }) => (
  <div className="flex items-center gap-2 text-gray-300 text-sm bg-black/30 border border-gray-800/60 rounded-lg px-2.5 py-2 min-w-0">
    <span className="text-cyan-400 shrink-0">{icon}</span>
    <span className="truncate">{text}</span>
  </div>
);

const StatusBadge = ({ status = "active" }) => {
  const map = {
    active: "text-green-300 bg-green-900/30 border-green-600/30",
    "on-leave": "text-yellow-300 bg-yellow-900/30 border-yellow-600/30",
    inactive: "text-red-300 bg-red-900/30 border-red-600/30",
  };

  return (
    <span className={`px-2 py-0.5 rounded-full border text-[10px] uppercase tracking-wide ${map[status] || map.active}`}>
      {status}
    </span>
  );
};

export default ViewEmployee;
