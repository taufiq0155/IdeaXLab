import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiBarChart2,
  FiBriefcase,
  FiClock,
  FiFileText,
  FiMail,
  FiRefreshCw,
  FiUsers,
  FiZap,
} from "react-icons/fi";
import AnimatedCanvas from "../../components/animations/animatedCanvas";
import GlassCard from "../../components/ui/GlassCard";
import StatsCard from "../../components/ui/StatsCard";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboard, setDashboard] = useState({
    adminName: "Admin",
    unreadContacts: 0,
    pendingContacts: 0,
    repliedContacts: 0,
    pendingServices: 0,
    totalServices: 0,
    publishedBlogs: 0,
    totalBlogs: 0,
    activeEmployees: 0,
    totalEmployees: 0,
    publishedProjects: 0,
    totalProjects: 0,
    recentContacts: [],
    recentServices: [],
  });

  const getToken = () => localStorage.getItem("adminToken");

  const parseJSONSafe = async (response) => {
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) return null;
    try {
      return await response.json();
    } catch (error) {
      return null;
    }
  };

  const fetchDashboard = async (showFullLoader = true) => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      if (showFullLoader) setIsLoading(true);
      else setRefreshing(true);

      const storedAdmin = localStorage.getItem("adminData");
      let adminName = "Admin";
      if (storedAdmin) {
        try {
          const parsed = JSON.parse(storedAdmin);
          adminName = parsed?.fullName || parsed?.name || "Admin";
        } catch (error) {
          adminName = "Admin";
        }
      }

      const [contactRes, serviceRes, blogRes, employeeRes, projectRes] = await Promise.all([
        fetch("http://localhost:5000/api/contacts?limit=6&sortBy=createdAt&sortOrder=desc", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/admin/services?status=all", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/admin/blogs?page=1&limit=200", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/admin/employees", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/admin/projects", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [contactData, serviceData, blogData, employeeData, projectData] = await Promise.all([
        parseJSONSafe(contactRes),
        parseJSONSafe(serviceRes),
        parseJSONSafe(blogRes),
        parseJSONSafe(employeeRes),
        parseJSONSafe(projectRes),
      ]);

      const contacts = contactData?.messages || [];
      const contactStats = contactData?.stats || {};

      const services = serviceData?.data || [];
      const blogs = blogData?.data || [];
      const employees = employeeData?.data || [];
      const projects = projectData?.data || [];

      const pendingServices = services.filter((item) => item.status === "pending");
      const publishedBlogs = blogs.filter((item) => item.status === "published");
      const activeEmployees = employees.filter((item) => item.status === "active");
      const publishedProjects = projects.filter((item) => item.status === "published");

      const recentServices = [...services]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setDashboard({
        adminName,
        unreadContacts: Number(contactStats.unread || 0),
        pendingContacts:
          contactStats.byStatus?.find((item) => item._id === "pending")?.count || 0,
        repliedContacts:
          contactStats.byStatus?.find((item) => item._id === "replied")?.count || 0,
        pendingServices: pendingServices.length,
        totalServices: services.length,
        publishedBlogs: publishedBlogs.length,
        totalBlogs: blogs.length,
        activeEmployees: activeEmployees.length,
        totalEmployees: employees.length,
        publishedProjects: publishedProjects.length,
        totalProjects: projects.length,
        recentContacts: contacts.slice(0, 5),
        recentServices,
      });
    } catch (error) {
      // Keep dashboard stable on failure.
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard(true);
  }, []);

  const healthScore = useMemo(() => {
    const totalWork = dashboard.totalServices + dashboard.pendingContacts;
    if (totalWork === 0) return 100;
    const completed = dashboard.repliedContacts + (dashboard.totalServices - dashboard.pendingServices);
    return Math.max(0, Math.min(100, Math.round((completed / totalWork) * 100)));
  }, [dashboard]);

  const cards = [
    {
      label: "Unread Contacts",
      value: dashboard.unreadContacts,
      icon: <FiMail className="w-6 h-6" />,
      color: "cyan",
    },
    {
      label: "Pending Services",
      value: dashboard.pendingServices,
      icon: <FiClock className="w-6 h-6" />,
      color: "amber",
    },
    {
      label: "Published Blogs",
      value: dashboard.publishedBlogs,
      icon: <FiFileText className="w-6 h-6" />,
      color: "blue",
    },
    {
      label: "Active Employees",
      value: dashboard.activeEmployees,
      icon: <FiUsers className="w-6 h-6" />,
      color: "green",
    },
    {
      label: "Published Projects",
      value: dashboard.publishedProjects,
      icon: <FiBriefcase className="w-6 h-6" />,
      color: "violet",
    },
    {
      label: "Operational Score",
      value: `${healthScore}%`,
      icon: <FiBarChart2 className="w-6 h-6" />,
      color: "purple",
    },
  ];

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
            <p className="mt-6 text-gray-400 font-medium text-lg">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <AnimatedCanvas />

      <div className="relative z-10 p-4 md:p-6">
        <GlassCard className="mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  {dashboard.adminName}
                </span>
              </h2>
              <p className="text-gray-300 text-lg">
                Live overview of contacts, services, blogs, team, and projects.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-black/40 border border-gray-800/70">
                <p className="text-xs text-gray-400">System Status</p>
                <p className="text-sm font-semibold text-green-400 flex items-center gap-1">
                  <FiZap className="w-4 h-4" />
                  Operational
                </p>
              </div>
              <button
                type="button"
                onClick={() => fetchDashboard(false)}
                className="px-4 py-3 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 inline-flex items-center gap-2"
              >
                <FiRefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
          {cards.map((card) => (
            <StatsCard
              key={card.label}
              label={card.label}
              value={String(card.value)}
              icon={card.icon}
              color={card.color}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <GlassCard className="p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Recent Contact Messages</h3>
                <button
                  type="button"
                  onClick={() => navigate("/admin/contacts/messages")}
                  className="text-sm text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1"
                >
                  View All
                  <FiArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {dashboard.recentContacts.length > 0 ? (
                  dashboard.recentContacts.map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => navigate(`/admin/contacts/messages?contactId=${item._id}`)}
                      className="w-full text-left p-3 rounded-xl bg-black/40 border border-gray-800/70 hover:border-blue-700/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {item.name || item.email || "Unknown sender"}
                          </p>
                          <p className="text-xs text-cyan-300 truncate mt-1">
                            {item.subject || "General Inquiry"}
                          </p>
                          <p className="text-xs text-gray-400 truncate mt-1">
                            {item.email}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-1 rounded-full border ${
                            item.read
                              ? "text-gray-400 border-gray-700 bg-gray-900/50"
                              : "text-blue-300 border-blue-700/50 bg-blue-900/20"
                          }`}
                        >
                          {item.read ? "READ" : "NEW"}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 py-6 text-center">
                    No recent contact messages.
                  </p>
                )}
              </div>
            </GlassCard>
          </div>

          <div>
            <GlassCard className="p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Pending Services</h3>
                <button
                  type="button"
                  onClick={() => navigate("/admin/services/view")}
                  className="text-sm text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1"
                >
                  Open
                  <FiArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {dashboard.recentServices.length > 0 ? (
                  dashboard.recentServices.map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => navigate(`/admin/services/view?serviceId=${item._id}`)}
                      className="w-full text-left p-3 rounded-xl bg-black/40 border border-gray-800/70 hover:border-blue-700/40 transition-colors"
                    >
                      <p className="text-white text-sm font-medium truncate">
                        {item.title || "Document review request"}
                      </p>
                      <p className="text-xs text-cyan-300 truncate mt-1">{item.requesterEmail}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(item.createdAt).toLocaleDateString()} -{" "}
                        {(item.documents || []).length} file(s)
                      </p>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 py-6 text-center">No service requests.</p>
                )}
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-white mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <QuickAction label="Create Blog Post" onClick={() => navigate("/admin/blog/create")} />
                <QuickAction label="View Contact Messages" onClick={() => navigate("/admin/contacts/messages")} />
                <QuickAction label="Review Services" onClick={() => navigate("/admin/services/view")} />
                <QuickAction label="Add Employee" onClick={() => navigate("/admin/employees/add")} />
                <QuickAction label="Add Project" onClick={() => navigate("/admin/projects/add")} />
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuickAction = ({ label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full text-left px-3 py-2.5 rounded-xl bg-black/40 border border-gray-800/70 hover:border-blue-700/40 text-gray-200 hover:text-white transition-colors text-sm inline-flex items-center justify-between"
  >
    <span>{label}</span>
    <FiArrowRight className="w-4 h-4 text-cyan-300" />
  </button>
);

export default AdminDashboard;
