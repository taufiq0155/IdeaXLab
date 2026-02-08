import { useState, useEffect } from 'react';
import { FiUsers, FiSearch, FiFilter, FiEdit2, FiTrash2, FiCheckCircle, FiXCircle, FiEye, FiUserCheck, FiUserX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import AnimatedCanvas from '../../../components/animations/animatedCanvas';
import GlassCard from '../../../components/ui/GlassCard';
import StatsCard from '../../../components/ui/StatsCard';

export default function AllAdmins() {
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    role: 'admin'
  });

  useEffect(() => {
    fetchApprovedAdmins();
  }, []);

  useEffect(() => {
    filterAdmins();
  }, [admins, searchTerm, filterRole]);

  const fetchApprovedAdmins = async () => {
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
        const approved = (data.data || []).filter(admin => admin.status === 'approved');
        setAdmins(approved);
        setFilteredAdmins(approved);
      } else {
        throw new Error(data.message || 'Failed to fetch admins');
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error(error.message || 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const filterAdmins = () => {
    let filtered = [...admins];

    if (searchTerm) {
      filtered = filtered.filter(admin =>
        admin.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRole !== 'all') {
      filtered = filtered.filter(admin => admin.role === filterRole);
    }

    setFilteredAdmins(filtered);
  };

  const handleEditClick = (admin) => {
    setSelectedAdmin(admin);
    setEditFormData({
      fullName: admin.fullName,
      email: admin.email,
      role: admin.role
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (admin) => {
    setSelectedAdmin(admin);
    setShowDeleteModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/auth/admins/${selectedAdmin._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editFormData)
      });

      if (!response.ok) {
        throw new Error('Failed to update admin');
      }

      const data = await response.json();
      if (data.success) {
        toast.success('Admin updated successfully');
        setShowEditModal(false);
        fetchApprovedAdmins();
      } else {
        throw new Error(data.message || 'Failed to update admin');
      }
    } catch (error) {
      console.error('Error updating admin:', error);
      toast.error(error.message || 'Failed to update admin');
    }
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
        toast.success('Admin deleted successfully');
        setShowDeleteModal(false);
        fetchApprovedAdmins();
      } else {
        throw new Error(data.message || 'Failed to delete admin');
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error(error.message || 'Failed to delete admin');
    }
  };

const handleToggleStatus = async (adminId, currentStatus) => {
  try {
    const token = localStorage.getItem('adminToken');
    const newStatus = !currentStatus;
    
    const response = await fetch(`http://localhost:5000/api/admin/auth/admins/${adminId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        isActive: newStatus
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update admin status');
    }

    const data = await response.json();
    if (data.success) {
      toast.success(`Admin ${newStatus ? 'activated' : 'deactivated'} successfully`);
      fetchApprovedAdmins();
    } else {
      throw new Error(data.message || 'Failed to update admin status');
    }
  } catch (error) {
    console.error('Error updating admin status:', error);
    toast.error(error.message || 'Failed to update admin status');
  }
};

  const getRoleColor = (role) => {
    switch (role) {
      case 'superAdmin': return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
      case 'admin': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-medium flex items-center">
        <FiUserCheck className="mr-1 w-3 h-3" />
        Active
      </span>
    ) : (
      <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium flex items-center">
        <FiUserX className="mr-1 w-3 h-3" />
        Inactive
      </span>
    );
  };

  const stats = [
    { 
      label: 'Total Approved', 
      value: admins.length, 
      icon: <FiUsers className="w-6 h-6" />,
      color: 'blue'
    },
    { 
      label: 'Active Admins', 
      value: admins.filter(a => a.isActive).length, 
      icon: <FiUserCheck className="w-6 h-6" />,
      color: 'green'
    },
    { 
      label: 'Super Admins', 
      value: admins.filter(a => a.role === 'superAdmin').length, 
      icon: <FiEye className="w-6 h-6" />,
      color: 'purple'
    },
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Canvas Background */}
      <AnimatedCanvas />

      <div className="relative z-10 p-4 md:p-6">
        {/* Header Section */}
        <GlassCard color="blue" className="mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-3 flex items-center">
                <FiUsers className="mr-3 text-blue-400" />
                Approved <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 ml-2">Administrators</span>
              </h2>
              <p className="text-gray-300 text-lg">
                Manage active admin accounts and permissions
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-3 p-4 bg-black/40 backdrop-blur-sm rounded-xl border border-gray-800/70">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping animation-delay-200"></div>
                </div>
                <span className="text-sm font-medium text-blue-400">
                  Active Admins: <span className="text-white">{admins.filter(a => a.isActive).length}/{admins.length}</span>
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
                placeholder="Search approved admins by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-black/40 backdrop-blur-sm border border-gray-800/70 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-900/30 transition-all duration-300"
              />
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <div className="relative">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-black/40 backdrop-blur-sm border border-gray-800/70 rounded-xl text-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-900/30 transition-all duration-300 appearance-none"
              >
                <option value="all">All Roles</option>
                <option value="superAdmin">Super Admin</option>
                <option value="admin">Admin</option>
              </select>
              <FiFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Admins Table */}
        <GlassCard color="blue">
          <div className="relative overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-400">Loading approved admins...</p>
              </div>
            ) : filteredAdmins.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
                  <FiUsers className="w-10 h-10 text-gray-600" />
                </div>
                <p className="text-gray-400 text-lg">No approved admins found</p>
                <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800/50">
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-400">Admin</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-400">Role</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-400">Status</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-400">Last Login</th>
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
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {admin.fullName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{admin.fullName}</p>
                            <p className="text-gray-400 text-sm">{admin.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(admin.role)}`}>
                          {admin.role === 'superAdmin' ? 'Super Admin' : 'Admin'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(admin.isActive)}
                      </td>
                      <td className="py-4 px-6 text-gray-400 text-sm">
                        {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditClick(admin)}
                            className="p-2 rounded-lg bg-blue-900/20 text-blue-400 hover:bg-blue-900/30 border border-blue-800/30 transition-colors hover:scale-110 duration-300"
                            title="Edit"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleToggleStatus(admin._id, admin.isActive)}
                            className={`p-2 rounded-lg border transition-colors hover:scale-110 duration-300 ${
                              admin.isActive 
                                ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30 border-red-800/30'
                                : 'bg-green-900/20 text-green-400 hover:bg-green-900/30 border-green-800/30'
                            }`}
                            title={admin.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {admin.isActive ? <FiXCircle className="w-4 h-4" /> : <FiCheckCircle className="w-4 h-4" />}
                          </button>
                          
                          {admin.role !== 'superAdmin' && (
                            <button
                              onClick={() => handleDeleteClick(admin)}
                              className="p-2 rounded-lg bg-red-900/20 text-red-400 hover:bg-red-900/30 border border-red-800/30 transition-colors hover:scale-110 duration-300"
                              title="Delete"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
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
      {showEditModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard color="blue" className="w-full max-w-md">
            <div className="p-6 border-b border-gray-800/50">
              <h3 className="text-xl font-bold text-white">Edit Admin</h3>
              <p className="text-gray-400 text-sm mt-1">Update admin information</p>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData({...editFormData, fullName: e.target.value})}
                  className="w-full px-4 py-3 bg-black/40 backdrop-blur-sm border border-gray-800/70 rounded-xl text-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-900/30"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-black/40 backdrop-blur-sm border border-gray-800/70 rounded-xl text-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-900/30"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                  className="w-full px-4 py-3 bg-black/40 backdrop-blur-sm border border-gray-800/70 rounded-xl text-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-900/30"
                >
                  <option value="admin">Admin</option>
                  <option value="superAdmin">Super Admin</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 rounded-xl bg-gray-800/50 text-gray-300 hover:text-white border border-gray-700/50 hover:border-gray-600/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium hover:from-blue-700 hover:to-cyan-700 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {showDeleteModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard color="red" className="w-full max-w-md">
            <div className="p-6 border-b border-gray-800/50">
              <h3 className="text-xl font-bold text-white">Delete Admin</h3>
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
                    Deleting admin: <span className="text-white font-semibold">{selectedAdmin.fullName}</span>
                  </p>
                </div>
              </div>
              
              <p className="text-gray-300 mb-6">
                Are you sure you want to permanently delete this admin account? 
                This action will remove all their access and cannot be recovered.
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
                  Delete Admin
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