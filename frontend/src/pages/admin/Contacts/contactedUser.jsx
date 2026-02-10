import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMail,
  FiUser,
  FiPhone,
  FiMessageSquare,
  FiSend,
  FiClock,
  FiSearch,
  FiFilter,
  FiCheck,
  FiX,
  FiEye,
  FiUsers,
  FiTrendingUp,
  FiTrash2,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
} from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";
import GlassCard from "../../../components/ui/GlassCard";
import StatsCard from "../../../components/ui/StatsCard";
import AnimatedCanvas from "../../../components/animations/animatedCanvas";

const ContactedUser = () => {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [contactedUsers, setContactedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalMessages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [stats, setStats] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [isBulkOperating, setIsBulkOperating] = useState(false);

  // Stats for dashboard
  const [dashboardStats, setDashboardStats] = useState([
    { 
      label: 'Total Messages', 
      value: '0', 
      icon: <FiMessageSquare className="w-5 h-5" />,
      color: 'blue',
    },
    { 
      label: 'Pending', 
      value: '0', 
      icon: <FiClock className="w-5 h-5" />,
      color: 'amber',
    },
    { 
      label: 'Replied', 
      value: '0', 
      icon: <FiCheckCircle className="w-5 h-5" />,
      color: 'green',
    },
    { 
      label: 'Unread', 
      value: '0', 
      icon: <FiEye className="w-5 h-5" />,
      color: 'cyan',
    },
  ]);

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('adminToken');
  };

  // Fetch current user data
  useEffect(() => {
    const fetchCurrentUser = () => {
      try {
        const userData = localStorage.getItem('adminData');
        if (userData) {
          const parsedData = JSON.parse(userData);
          setCurrentUser(parsedData);
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch contacted users from backend
  const fetchContactedUsers = async (page = 1, showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      
      const token = getToken();
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        sortBy: sortBy,
        sortOrder: sortOrder,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(priorityFilter !== "all" && { priority: priorityFilter }),
      });

      const url = `http://localhost:5000/api/contacts?${params}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminData');
          return;
        }
        throw new Error(data.message || `Failed to fetch messages`);
      }

      if (data.success) {
        setContactedUsers(data.messages || []);
        setPagination(data.pagination || {
          currentPage: page,
          totalPages: 1,
          totalMessages: data.messages?.length || 0,
          hasNext: false,
          hasPrev: false,
        });
        
        // Update dashboard stats
        if (data.stats) {
          const total = data.stats.total || 0;
          const pending = data.stats.byStatus?.find(s => s._id === 'pending')?.count || 0;
          const replied = data.stats.byStatus?.find(s => s._id === 'replied')?.count || 0;
          const unread = data.stats.unread || 0;
          
          setDashboardStats([
            { 
              label: 'Total Messages', 
              value: total.toString(), 
              icon: <FiMessageSquare className="w-5 h-5" />,
              color: 'blue',
            },
            { 
              label: 'Pending', 
              value: pending.toString(), 
              icon: <FiClock className="w-5 h-5" />,
              color: 'amber',
            },
            { 
              label: 'Replied', 
              value: replied.toString(), 
              icon: <FiCheckCircle className="w-5 h-5" />,
              color: 'green',
            },
            { 
              label: 'Unread', 
              value: unread.toString(), 
              icon: <FiEye className="w-5 h-5" />,
              color: 'cyan',
            },
          ]);
        }
        
        // Clear selected messages when list changes
        setSelectedMessages([]);
      }
    } catch (error) {
      console.error("Error fetching contacted users:", error);
      setContactedUsers([]);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/contacts/stats/dashboard', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

  // Initial load
  useEffect(() => {
    const initData = async () => {
      await fetchContactedUsers(1, true);
      await fetchDashboardStats();
    };
    initData();
  }, [searchTerm, statusFilter, priorityFilter, sortBy, sortOrder]);

  // Handle reply submission
  const handleReply = async (e) => {
    e.preventDefault();

    if (!replyText.trim()) {
      toast.error("Please write a reply message");
      return;
    }

    if (!selectedMessage) {
      toast.error("No message selected");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = getToken();
      if (!token) {
        toast.error("Please login to send reply");
        return;
      }

      const response = await fetch(`http://localhost:5000/api/contacts/${selectedMessage._id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ replyMessage: replyText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to send reply`);
      }

      if (data.success) {
        toast.success(data.message || "Reply sent successfully!");
        setReplyText("");

        // Refresh the messages list
        await fetchContactedUsers(pagination.currentPage, false);
        await fetchDashboardStats();

        // Update selected message locally
        if (selectedMessage) {
          setSelectedMessage({ 
            ...selectedMessage, 
            status: "replied",
            replyMessage: replyText,
            repliedAt: new Date().toISOString(),
            repliedBy: currentUser,
            read: true
          });
        }
      }
    } catch (error) {
      toast.error(error.message || "Failed to send reply. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle message selection for bulk actions
  const toggleMessageSelection = (messageId, e) => {
    e.stopPropagation();
    setSelectedMessages(prev => {
      if (prev.includes(messageId)) {
        return prev.filter(id => id !== messageId);
      } else {
        return [...prev, messageId];
      }
    });
  };

  // Mark as replied
  const markAsReplied = async (userId, e) => {
    e?.stopPropagation();
    
    try {
      const token = getToken();
      if (!token) {
        toast.error("Please login to update status");
        return;
      }

      const response = await fetch(`http://localhost:5000/api/contacts/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: "replied", read: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      if (data.success) {
        toast.success(data.message || "Marked as replied");
        
        // Update local state
        const updatedUsers = contactedUsers.map(user => 
          user._id === userId ? { ...user, status: "replied", read: true } : user
        );
        setContactedUsers(updatedUsers);
        
        if (selectedMessage && selectedMessage._id === userId) {
          setSelectedMessage(prev => 
            prev ? { ...prev, status: "replied", read: true, repliedAt: new Date().toISOString() } : null
          );
        }
        
        // Refresh stats
        await fetchDashboardStats();
      }
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    }
  };

  // Mark as read
  const markAsRead = async (userId) => {
    try {
      const token = getToken();
      if (!token) return;

      await fetch(`http://localhost:5000/api/contacts/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ read: true }),
      });

      // Update local state
      const updatedUsers = contactedUsers.map(user => 
        user._id === userId ? { ...user, read: true } : user
      );
      setContactedUsers(updatedUsers);
      
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // Show delete confirmation modal
  const confirmDelete = (userId, e) => {
    e?.stopPropagation();
    setMessageToDelete(userId);
    setShowDeleteModal(true);
  };

  // Delete message
  const deleteMessage = async () => {
    if (!messageToDelete) return;

    try {
      const token = getToken();
      if (!token) {
        toast.error("Please login to delete messages");
        return;
      }

      const response = await fetch(`http://localhost:5000/api/contacts/${messageToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete message");
      }

      if (data.success) {
        toast.success(data.message || "Message deleted successfully");

        // Remove from local state
        const filteredUsers = contactedUsers.filter((user) => user._id !== messageToDelete);
        setContactedUsers(filteredUsers);
        
        // Update pagination
        setPagination(prev => ({
          ...prev,
          totalMessages: prev.totalMessages - 1
        }));

        if (selectedMessage && selectedMessage._id === messageToDelete) {
          setSelectedMessage(null);
        }

        // Remove from selected messages if present
        setSelectedMessages(prev => prev.filter(id => id !== messageToDelete));

        // Refresh stats
        await fetchDashboardStats();
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete message");
    } finally {
      setShowDeleteModal(false);
      setMessageToDelete(null);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const token = getToken();
      if (!token) {
        toast.error("Please login to perform this action");
        return;
      }

      const response = await fetch('http://localhost:5000/api/contacts/actions/mark-all-read', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to mark all as read");
      }

      if (data.success) {
        toast.success(data.message || "All messages marked as read");
        
        // Update all messages locally to read
        const updatedUsers = contactedUsers.map(user => ({ ...user, read: true }));
        setContactedUsers(updatedUsers);
        
        if (selectedMessage) {
          setSelectedMessage({ ...selectedMessage, read: true });
        }
        
        // Refresh stats
        await fetchDashboardStats();
      }
    } catch (error) {
      toast.error(error.message || "Failed to mark all as read");
    }
  };

  // Bulk delete messages
  const bulkDelete = async () => {
    if (selectedMessages.length === 0) {
      toast.error("Please select messages to delete");
      return;
    }

    setIsBulkOperating(true);

    try {
      const token = getToken();
      if (!token) {
        toast.error("Please login to delete messages");
        return;
      }

      const response = await fetch('http://localhost:5000/api/contacts/actions/bulk-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ contactIds: selectedMessages }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete messages");
      }

      if (data.success) {
        toast.success(data.message || `${data.deletedCount} messages deleted successfully`);

        // Remove deleted messages from local state
        const filteredUsers = contactedUsers.filter((user) => !selectedMessages.includes(user._id));
        setContactedUsers(filteredUsers);
        
        // Update pagination
        setPagination(prev => ({
          ...prev,
          totalMessages: prev.totalMessages - data.deletedCount
        }));

        // Clear selected messages
        setSelectedMessages([]);
        
        // Clear selected message if it was deleted
        if (selectedMessage && selectedMessages.includes(selectedMessage._id)) {
          setSelectedMessage(null);
        }

        // Refresh stats
        await fetchDashboardStats();
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete messages");
    } finally {
      setIsBulkOperating(false);
      setShowBulkActions(false);
    }
  };

  // Bulk mark as read
  const bulkMarkAsRead = async () => {
    if (selectedMessages.length === 0) {
      toast.error("Please select messages to mark as read");
      return;
    }

    setIsBulkOperating(true);

    try {
      const token = getToken();
      if (!token) {
        toast.error("Please login to perform this action");
        return;
      }

      const response = await fetch('http://localhost:5000/api/contacts/actions/bulk-update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          contactIds: selectedMessages, 
          action: "mark-read" 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to mark messages as read");
      }

      if (data.success) {
        toast.success(data.message || `${data.modifiedCount} messages marked as read`);
        
        // Update local state
        const updatedUsers = contactedUsers.map(user => 
          selectedMessages.includes(user._id) ? { ...user, read: true } : user
        );
        setContactedUsers(updatedUsers);
        
        // Clear selected messages
        setSelectedMessages([]);
        
        // Refresh stats
        await fetchDashboardStats();
      }
    } catch (error) {
      toast.error(error.message || "Failed to mark messages as read");
    } finally {
      setIsBulkOperating(false);
      setShowBulkActions(false);
    }
  };

  // Select/Deselect all messages on current page
  const toggleSelectAll = () => {
    if (selectedMessages.length === contactedUsers.length) {
      setSelectedMessages([]);
    } else {
      const allIds = contactedUsers.map(user => user._id);
      setSelectedMessages(allIds);
    }
  };

  const handleMessageSelect = (user) => {
    setSelectedMessage(user);
    if (!user.read) {
      markAsRead(user._id);
    }
  };

  const StatusBadge = ({ status }) => (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        status === "replied"
          ? "bg-green-500/20 text-green-400"
          : status === "archived"
          ? "bg-gray-500/20 text-gray-400"
          : "bg-amber-500/20 text-amber-400"
      }`}
    >
      {status === "replied" ? "Replied" : status === "archived" ? "Archived" : "Pending"}
    </span>
  );

  const PriorityBadge = ({ priority }) => (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        priority === "high"
          ? "bg-red-500/20 text-red-400"
          : priority === "medium"
          ? "bg-amber-500/20 text-amber-400"
          : "bg-green-500/20 text-green-400"
      }`}
    >
      {priority === "high" ? "High" : priority === "medium" ? "Medium" : "Low"}
    </span>
  );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchContactedUsers(newPage);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151',
          },
        }}
      />
      <AnimatedCanvas />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-900 rounded-2xl border border-gray-800 max-w-md w-full p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <FiAlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Confirm Delete</h3>
                  <p className="text-gray-400 text-sm">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this message? All associated data will be permanently removed.
              </p>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setMessageToDelete(null);
                  }}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteMessage}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <FiTrash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="relative z-10 p-4 md:p-6">
        {/* Welcome Card */}
        <GlassCard className="mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Contact Messages
              </h2>
              <p className="text-gray-400">
                View and manage customer inquiries
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              {selectedMessages.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
                  <FiCheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">{selectedMessages.length} selected</span>
                </div>
              )}
              <div className="px-4 py-2 bg-black/40 backdrop-blur-sm rounded-xl border border-gray-800/70">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-400">
                    <span className="text-white font-medium">{pagination.totalMessages}</span> total
                  </span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {dashboardStats.map((stat, index) => (
            <StatsCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              compact
            />
          ))}
        </div>

        {/* Bulk Actions Bar */}
        {selectedMessages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <GlassCard className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                    <FiCheckCircle className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{selectedMessages.length} messages selected</p>
                    <p className="text-gray-400 text-sm">Choose an action below</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={bulkMarkAsRead}
                    disabled={isBulkOperating}
                    className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors border border-blue-500/30 flex items-center gap-2 disabled:opacity-50"
                  >
                    <FiEye className="w-4 h-4" />
                    Mark as Read
                  </button>
                  <button
                    onClick={bulkDelete}
                    disabled={isBulkOperating}
                    className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors border border-red-500/30 flex items-center gap-2 disabled:opacity-50"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Delete Selected
                  </button>
                  <button
                    onClick={() => setSelectedMessages([])}
                    className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Messages List */}
          <div className="lg:col-span-2">
            <GlassCard className="p-0 overflow-hidden">
              {/* Header with actions */}
              <div className="p-6 border-b border-gray-800/50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-1">All Messages</h3>
                    <p className="text-gray-400 text-sm">
                      {pagination.totalMessages} messages • {contactedUsers.filter(m => !m.read).length} unread
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={toggleSelectAll}
                      className="px-3 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center gap-2"
                    >
                      {selectedMessages.length === contactedUsers.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <button
                      onClick={markAllAsRead}
                      className="px-3 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors border border-blue-500/30 text-sm flex items-center gap-2"
                    >
                      <FiEye className="w-4 h-4" />
                      Mark All Read
                    </button>
                  </div>
                </div>
              </div>

              {/* Search and Filter Controls */}
              <div className="p-6 border-b border-gray-800/50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="relative md:col-span-2">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search messages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-gray-800 hover:border-gray-600 rounded-xl text-white focus:border-blue-500 transition placeholder-gray-500 backdrop-blur-sm text-sm"
                    />
                  </div>
                  <div className="relative">
                    <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-gray-800 hover:border-gray-600 rounded-xl text-white focus:border-blue-500 transition appearance-none backdrop-blur-sm text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="replied">Replied</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div className="relative">
                    <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-gray-800 hover:border-gray-600 rounded-xl text-white focus:border-blue-500 transition appearance-none backdrop-blur-sm text-sm"
                    >
                      <option value="all">All Priority</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Messages List */}
              <div className="p-6">
                {isLoading ? (
                  <div className="py-12">
                    <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400 text-center">Loading messages...</p>
                  </div>
                ) : contactedUsers.length > 0 ? (
                  <div className="space-y-3">
                    {contactedUsers.map((user) => (
                      <motion.div
                        key={user._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`bg-black/40 rounded-xl border transition-all cursor-pointer group hover:border-blue-500/30 ${
                          selectedMessage?._id === user._id
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-gray-800/50"
                        } ${!user.read ? "border-l-2 border-l-blue-500" : ""}`}
                        onClick={() => handleMessageSelect(user)}
                      >
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            {/* Selection checkbox */}
                            <div className="pt-1" onClick={(e) => toggleMessageSelection(user._id, e)}>
                              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                selectedMessages.includes(user._id)
                                  ? "bg-blue-500 border-blue-500"
                                  : "border-gray-700 group-hover:border-gray-600"
                              }`}>
                                {selectedMessages.includes(user._id) && (
                                  <FiCheck className="w-3 h-3 text-white" />
                                )}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                                  </div>
                                  <div>
                                    <h3 className="text-white font-medium text-sm truncate">
                                      {user.name || "No Name"}
                                    </h3>
                                    <p className="text-gray-400 text-xs truncate">{user.email || "No Email"}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <StatusBadge status={user.status || "pending"} />
                                  <PriorityBadge priority={user.priority || "medium"} />
                                </div>
                              </div>

                              <div className="mb-3">
                                <h4 className="text-white font-medium text-sm mb-1">
                                  {user.subject || "No Subject"}
                                </h4>
                                <p className="text-gray-400 text-xs line-clamp-2">
                                  {user.message || "No message content"}
                                </p>
                              </div>

                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <FiClock className="w-3 h-3" />
                                  {formatDate(user.createdAt)}
                                </div>
                                <div className="flex items-center gap-2">
                                  {user.status !== "replied" && (
                                    <button
                                      onClick={(e) => markAsReplied(user._id, e)}
                                      className="hover:text-green-400 transition-colors p-1.5 rounded-lg hover:bg-green-500/10"
                                      title="Mark as replied"
                                    >
                                      <FiCheck className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => confirmDelete(user._id, e)}
                                    className="hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10"
                                    title="Delete message"
                                  >
                                    <FiTrash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-gray-400">
                    <FiMail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No messages found</p>
                    {searchTerm || statusFilter !== "all" || priorityFilter !== "all" && (
                      <p className="text-xs mt-1">Try adjusting your search or filters</p>
                    )}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && contactedUsers.length > 0 && (
                <div className="p-6 border-t border-gray-800/50">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-gray-400 text-sm">
                      Showing {((pagination.currentPage - 1) * 10) + 1} to {Math.min(pagination.currentPage * 10, pagination.totalMessages)} of {pagination.totalMessages} messages
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={!pagination.hasPrev || isLoading}
                        className="px-3 py-2 bg-black/40 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors border border-gray-800 flex items-center gap-2 text-sm"
                      >
                        <FiChevronLeft className="w-4 h-4" />
                        Previous
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(3, pagination.totalPages) }, (_, i) => {
                          let pageNum;
                          if (pagination.totalPages <= 3) {
                            pageNum = i + 1;
                          } else if (pagination.currentPage === 1) {
                            pageNum = i + 1;
                          } else if (pagination.currentPage === pagination.totalPages) {
                            pageNum = pagination.totalPages - 2 + i;
                          } else {
                            pageNum = pagination.currentPage - 1 + i;
                          }
                          
                          return pageNum >= 1 && pageNum <= pagination.totalPages ? (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`w-8 h-8 rounded-lg text-sm ${
                                pagination.currentPage === pageNum
                                  ? "bg-blue-600 text-white"
                                  : "bg-black/40 text-gray-400 hover:bg-gray-800"
                              }`}
                            >
                              {pageNum}
                            </button>
                          ) : null;
                        })}
                      </div>
                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={!pagination.hasNext || isLoading}
                        className="px-3 py-2 bg-black/40 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors border border-gray-800 flex items-center gap-2 text-sm"
                      >
                        Next
                        <FiChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>

          {/* Right Column - Message Details & Reply */}
          <div className="space-y-6">
            {selectedMessage ? (
              <>
                {/* Message Details Card */}
                <GlassCard>
                  <div className="p-6">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <FiMessageSquare className="w-4 h-4" />
                      Message Details
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-black/40 rounded-xl border border-gray-800">
                        <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                          <FiUser className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-400 text-xs mb-1">From</p>
                          <p className="text-white font-medium truncate">
                            {selectedMessage.name || "No Name"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-black/40 rounded-xl border border-gray-800">
                        <div className="w-10 h-10 bg-cyan-600/20 rounded-lg flex items-center justify-center">
                          <FiMail className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-400 text-xs mb-1">Email</p>
                          <p className="text-white font-medium truncate">
                            {selectedMessage.email || "No Email"}
                          </p>
                        </div>
                      </div>

                      {selectedMessage.phone && (
                        <div className="flex items-center gap-3 p-3 bg-black/40 rounded-xl border border-gray-800">
                          <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                            <FiPhone className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs mb-1">Phone</p>
                            <p className="text-white font-medium">
                              {selectedMessage.phone}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-gray-400 text-xs mb-1">Subject</p>
                            <h4 className="text-white font-medium">
                              {selectedMessage.subject || "No Subject"}
                            </h4>
                          </div>
                          <div className="flex gap-2">
                            <StatusBadge status={selectedMessage.status || "pending"} />
                          </div>
                        </div>
                        
                        <p className="text-gray-400 text-xs mb-2">Message</p>
                        <div className="bg-black/60 rounded-lg p-4 border border-gray-800">
                          <p className="text-white text-sm whitespace-pre-wrap">
                            {selectedMessage.message || "No message content"}
                          </p>
                        </div>
                      </div>

                      {selectedMessage.replyMessage && (
                        <div className="mt-4">
                          <p className="text-gray-400 text-xs mb-2">Your Reply</p>
                          <div className="bg-green-900/20 rounded-lg p-4 border border-green-700/50">
                            <p className="text-white text-sm whitespace-pre-wrap">
                              {selectedMessage.replyMessage}
                            </p>
                            {selectedMessage.repliedAt && (
                              <p className="text-green-400 text-xs mt-2">
                                Replied: {formatDate(selectedMessage.repliedAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCard>

                {/* Reply Form - Only show if not replied */}
                {selectedMessage.status !== "replied" && (
                  <GlassCard>
                    <div className="p-6">
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <FiSend className="w-4 h-4" />
                        Send Reply
                      </h3>

                      <form onSubmit={handleReply} className="space-y-4">
                        <div>
                          <label className="block text-gray-400 text-sm mb-2">
                            Your Reply Message
                          </label>
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={`Type your reply to ${selectedMessage.name || "the user"}...`}
                            rows="5"
                            className="w-full px-4 py-3 bg-black/40 border border-gray-800 hover:border-gray-600 rounded-xl text-white focus:border-blue-500 transition placeholder-gray-500 resize-none backdrop-blur-sm text-sm"
                            required
                            disabled={isSubmitting}
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Sending...
                            </>
                          ) : (
                            <>
                              <FiSend className="w-4 h-4" />
                              Send Reply
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  </GlassCard>
                )}
              </>
            ) : (
              /* Empty State Card */
              <GlassCard>
                <div className="p-8 text-center">
                  <FiMessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-white text-lg font-semibold mb-2">
                    No Message Selected
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Select a message from the list to view details
                  </p>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none"></div>
    </div>
  );
};

export default ContactedUser;