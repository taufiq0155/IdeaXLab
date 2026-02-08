import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiSearch, FiFilter, FiCheckCircle, FiXCircle, FiClock, FiEye, FiUserPlus, FiUserX, FiAlertCircle, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import AnimatedCanvas from '../../../components/animations/animatedCanvas';
import GlassCard from '../../../components/ui/GlassCard';
import StatsCard from '../../../components/ui/StatsCard';

export default function PendingAdmins() {
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [actionType, setActionType] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingAdmins();
  }, []);

  useEffect(() => {
    filterAdmins();
  }, [pendingAdmins, searchTerm, filterStatus]);

  const fetchPendingAdmins = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/admin/auth/admins', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch admins');
      }

      const data = await response.json();
      if (data.success) {
        const pending = (data.data || []).filter(admin => 
          admin.status === 'pending' || admin.status === 'rejected'
        );
        setPendingAdmins(pending);
        setFilteredAdmins(pending);
      } else {
        throw new Error(data.message || 'Failed to fetch pending admins');
      }
    } catch (error) {
      console.error('Error fetching pending admins:', error);
      toast.error(error.message || 'Failed to load pending admins');
    } finally {
      setLoading(false);
    }
  };

  const filterAdmins = () => {
    let filtered = [...pendingAdmins];

    if (searchTerm) {
      filtered = filtered.filter(admin =>
        admin.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(admin => admin.status === filterStatus);
    }

    setFilteredAdmins(filtered);
  };

  const handleViewClick = (admin) => {
    setSelectedAdmin(admin);
    setShowViewModal(true);
  };

  const handleApproveClick = (admin) => {
    setSelectedAdmin(admin);
    setActionType('approve');
    setShowActionModal(true);
  };

  const handleRejectClick = (admin) => {
    setSelectedAdmin(admin);
    setActionType('reject');
    setRejectionReason('');
    setShowActionModal(true);
  };

  const handleDeleteClick = (admin) => {
    setSelectedAdmin(admin);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/auth/admins/${selectedAdmin._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete admin');
      }

      const data = await response.json();
      if (data.success) {
        toast.success('Rejected admin deleted successfully');
        setShowDeleteModal(false);
        fetchPendingAdmins();
      } else {
        throw new Error(data.message || 'Failed to delete admin');
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error(error.message || 'Failed to delete admin');
    }
  };

  const handleActionConfirm = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const endpoint = 'http://localhost:5000/api/admin/auth/admins/status';
      
      const body = {
        adminId: selectedAdmin._id,
        status: actionType === 'approve' ? 'approved' : 'rejected'
      };

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error('Failed to update admin status');
      }

      const data = await response.json();
      if (data.success) {
        toast.success(`Admin ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`);
        setShowActionModal(false);
        setSelectedAdmin(null);
        setRejectionReason('');
        fetchPendingAdmins();
      } else {
        throw new Error(data.message || 'Failed to update admin status');
      }
    } catch (error) {
      console.error('Error updating admin status:', error);
      toast.error(error.message || 'Failed to update admin status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs font-medium flex items-center">
            <FiClock className="mr-1 w-3 h-3" />
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium flex items-center">
            <FiXCircle className="mr-1 w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30 text-xs font-medium">
            Unknown
          </span>
        );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const stats = [
    { 
      label: 'Total Requests', 
      value: pendingAdmins.length, 
      icon: <FiUserPlus className="w-6 h-6" />,
      color: 'orange'
    },
    { 
      label: 'Pending Review', 
      value: pendingAdmins.filter(a => a.status === 'pending').length, 
      icon: <FiClock className="w-6 h-6" />,
      color: 'yellow'
    },
    { 
      label: 'Rejected', 
      value: pendingAdmins.filter(a => a.status === 'rejected').length, 
      icon: <FiUserX className="w-6 h-6" />,
      color: 'red'
    },
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Canvas Background */}
      <AnimatedCanvas color="orange" />

      <div className="relative z-10 p-4 md:p-6">
        {/* Header Section */}
        <GlassCard color="orange" className="mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-3 flex items-center">
                <FiUserPlus className="mr-3 text-amber-400" />
                Pending <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400 ml-2">Admin Requests</span>
              </h2>
              <p className="text-gray-300 text-lg">
                Review and manage new admin registration requests
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-3 p-4 bg-black/40 backdrop-blur-sm rounded-xl border border-gray-800/70">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-ping animation-delay-200"></div>
                </div>
                <span className="text-sm font-medium text-amber-400">
                  Pending Review: <span className="text-white">{pendingAdmins.filter(a => a.status === 'pending').length}</span>
                </span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              className="animate-floating"
              style={{ animationDelay: `${index * 100}ms` }}
            />
          ))}
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Search Bar */}
          <div className="md:col-span-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search pending admins by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-black/40 backdrop-blur-sm border border-gray-800/70 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-900/30 transition-all duration-300"
              />
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-black/40 backdrop-blur-sm border border-gray-800/70 rounded-xl text-white focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-900/30 transition-all duration-300 appearance-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
              <FiFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Admins Table */}
        <GlassCard color="orange">
          <div className="relative overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-400">Loading pending admin requests...</p>
              </div>
            ) : filteredAdmins.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
                  <FiClock className="w-10 h-10 text-gray-600" />
                </div>
                <p className="text-gray-400 text-lg">No pending admin requests found</p>
                <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800/50">
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-400">Admin</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-400">Status</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-400">Request Date</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdmins.map((admin, index) => (
                    <motion.tr 
                      key={admin._id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            admin.status === 'pending' 
                              ? 'bg-gradient-to-br from-amber-600 to-yellow-600'
                              : 'bg-gradient-to-br from-gray-600 to-gray-700'
                          }`}>
                            <span className="text-white font-semibold">
                              {admin.fullName?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{admin.fullName}</p>
                            <p className="text-gray-400 text-sm">{admin.email}</p>
                            <p className="text-gray-500 text-xs mt-1">
                              ID: <span className="font-mono">{admin._id?.substring(0, 8)}...</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(admin.status)}
                      </td>
                      <td className="py-4 px-6 text-gray-400 text-sm">
                        {formatDate(admin.createdAt)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewClick(admin)}
                            className="p-2 rounded-lg bg-gray-800/20 text-gray-400 hover:text-blue-400 hover:bg-gray-800/30 border border-gray-700/30 hover:border-blue-700/30 transition-colors hover:scale-110 duration-300"
                            title="View Details"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          
                          {admin.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleApproveClick(admin)}
                                className="p-2 rounded-lg bg-green-900/20 text-green-400 hover:bg-green-900/30 border border-green-800/30 transition-colors hover:scale-110 duration-300"
                                title="Approve"
                              >
                                <FiCheckCircle className="w-4 h-4" />
                              </button>
                              
                              <button
                                onClick={() => handleRejectClick(admin)}
                                className="p-2 rounded-lg bg-red-900/20 text-red-400 hover:bg-red-900/30 border border-red-800/30 transition-colors hover:scale-110 duration-300"
                                title="Reject"
                              >
                                <FiXCircle className="w-4 h-4" />
                              </button>
                            </>
                          ) : admin.status === 'rejected' && (
                            <>
                              <button
                                onClick={() => handleApproveClick(admin)}
                                className="p-2 rounded-lg bg-amber-900/20 text-amber-400 hover:bg-amber-900/30 border border-amber-800/30 transition-colors hover:scale-110 duration-300"
                                title="Re-approve"
                              >
                                <FiUserPlus className="w-4 h-4" />
                              </button>
                              
                              <button
                                onClick={() => handleDeleteClick(admin)}
                                className="p-2 rounded-lg bg-red-900/20 text-red-400 hover:bg-red-900/30 border border-red-800/30 transition-colors hover:scale-110 duration-300"
                                title="Delete Permanently"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Modals */}
      {showViewModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard color="blue" className="w-full max-w-md">
            <div className="p-6 border-b border-gray-800/50">
              <h3 className="text-xl font-bold text-white">Admin Request Details</h3>
              <p className="text-gray-400 text-sm mt-1">View full admin request information</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  selectedAdmin.status === 'pending' 
                    ? 'bg-gradient-to-br from-amber-600 to-yellow-600'
                    : 'bg-gradient-to-br from-gray-600 to-gray-700'
                }`}>
                  <span className="text-white text-2xl font-bold">
                    {selectedAdmin.fullName?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <div>
                  <h4 className="text-white text-lg font-bold">{selectedAdmin.fullName}</h4>
                  <p className="text-gray-400">{selectedAdmin.email}</p>
                  <div className="mt-2">
                    {getStatusBadge(selectedAdmin.status)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-gray-500 text-sm">Registration Date</p>
                  <p className="text-gray-300">{formatDate(selectedAdmin.createdAt)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-500 text-sm">Last Updated</p>
                  <p className="text-gray-300">{formatDate(selectedAdmin.updatedAt)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-500 text-sm">Requested Role</p>
                  <p className="text-gray-300 capitalize">{selectedAdmin.role || 'Admin'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-500 text-sm">Request ID</p>
                  <p className="text-gray-300 text-xs font-mono truncate">{selectedAdmin._id}</p>
                </div>
              </div>

              {selectedAdmin.status === 'pending' && (
                <div className="pt-4 border-t border-gray-800/50">
                  <p className="text-gray-400 text-sm mb-4">Quick Actions:</p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        setTimeout(() => handleApproveClick(selectedAdmin), 200);
                      }}
                      className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium hover:from-green-700 hover:to-emerald-700 transition-all"
                    >
                      <FiCheckCircle className="inline mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        setTimeout(() => handleRejectClick(selectedAdmin), 200);
                      }}
                      className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-medium hover:from-red-700 hover:to-red-800 transition-all"
                    >
                      <FiXCircle className="inline mr-2" />
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {selectedAdmin.status === 'rejected' && (
                <div className="pt-4 border-t border-gray-800/50">
                  <p className="text-gray-400 text-sm mb-4">Manage Rejected Request:</p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        setTimeout(() => handleApproveClick(selectedAdmin), 200);
                      }}
                      className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium hover:from-amber-700 hover:to-orange-700 transition-all"
                    >
                      <FiUserPlus className="inline mr-2" />
                      Re-approve
                    </button>
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        setTimeout(() => handleDeleteClick(selectedAdmin), 200);
                      }}
                      className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-medium hover:from-red-700 hover:to-red-800 transition-all"
                    >
                      <FiTrash2 className="inline mr-2" />
                      Delete Permanently
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-800/50">
              <button
                onClick={() => setShowViewModal(false)}
                className="w-full px-6 py-3 rounded-xl bg-gray-800/50 text-gray-300 hover:text-white border border-gray-700/50 hover:border-gray-600/50 transition-colors"
              >
                Close
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {showActionModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard color={actionType === 'approve' ? 'green' : 'red'} className="w-full max-w-md">
            <div className="p-6 border-b border-gray-800/50">
              <h3 className="text-xl font-bold text-white flex items-center">
                {actionType === 'approve' ? (
                  <>
                    <FiCheckCircle className="mr-3 text-green-500" />
                    Approve Admin Request
                  </>
                ) : (
                  <>
                    <FiXCircle className="mr-3 text-red-500" />
                    Reject Admin Request
                  </>
                )}
              </h3>
            </div>
            
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  actionType === 'approve' 
                    ? 'bg-gradient-to-br from-green-600 to-emerald-700'
                    : 'bg-gradient-to-br from-red-600 to-red-700'
                }`}>
                  {actionType === 'approve' ? (
                    <FiCheckCircle className="w-7 h-7 text-white" />
                  ) : (
                    <FiXCircle className="w-7 h-7 text-white" />
                  )}
                </div>
                <div>
                  <h4 className="text-white text-lg font-bold">
                    {actionType === 'approve' ? 'Approve Admin?' : 'Reject Admin Request?'}
                  </h4>
                  <p className="text-gray-400 text-sm mt-1">
                    Admin: <span className="text-white font-semibold">{selectedAdmin.fullName}</span>
                  </p>
                </div>
              </div>
              
              {actionType === 'reject' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reason for rejection (optional)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide a reason for rejecting this request..."
                    className="w-full px-4 py-3 bg-black/40 backdrop-blur-sm border border-gray-800/70 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-900/30 transition-all duration-300 resize-none h-24"
                    rows={3}
                  />
                </div>
              )}
              
              <p className="text-gray-300 mb-6">
                {actionType === 'approve' 
                  ? `This will grant ${selectedAdmin.fullName} full admin access to the system. Are you sure you want to approve this request?`
                  : `This will permanently reject ${selectedAdmin.fullName}'s admin request. They will need to register again for reconsideration.`
                }
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowActionModal(false);
                    setRejectionReason('');
                  }}
                  className="px-6 py-3 rounded-xl bg-gray-800/50 text-gray-300 hover:text-white border border-gray-700/50 hover:border-gray-600/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleActionConfirm}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    actionType === 'approve'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                      : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800'
                  }`}
                >
                  {actionType === 'approve' ? 'Approve Admin' : 'Reject Request'}
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard color="red" className="w-full max-w-md">
            <div className="p-6 border-b border-gray-800/50">
              <h3 className="text-xl font-bold text-white flex items-center">
                <FiTrash2 className="mr-3 text-red-500" />
                Delete Rejected Admin
              </h3>
              <p className="text-gray-400 text-sm mt-1">This action cannot be undone</p>
            </div>
            
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center">
                  <FiTrash2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h4 className="text-white text-lg font-bold">Warning!</h4>
                  <p className="text-gray-400 text-sm mt-1">
                    Deleting rejected admin: <span className="text-white font-semibold">{selectedAdmin.fullName}</span>
                  </p>
                </div>
              </div>
              
              <p className="text-gray-300 mb-6">
                Are you sure you want to permanently delete this rejected admin account? 
                This action will remove all their data and cannot be recovered.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-3 rounded-xl bg-gray-800/50 text-gray-300 hover:text-white border border-gray-700/50 hover:border-gray-600/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-medium hover:from-red-700 hover:to-red-800 transition-all"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Bottom Gradient */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none z-0"></div>
    </div>
  );
}