import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, 
  FiUsers, 
  FiChevronLeft,
  FiLogOut,
  FiUser,
  FiX,
  FiMenu,
  FiUserCheck,
  FiUserPlus,
  FiChevronDown,
  FiMail,
  FiMessageSquare,
  FiFileText,      // Added for Blog
  FiFolder,        // Added for Categories
  FiEdit,          // Added for Edit
  FiPlus           // Added for Create
} from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';

// Logo import
import researchLabLogo from '../assets/researchLab.jpeg';

export default function Sidebar({ 
  isSidebarOpen, 
  setIsSidebarOpen,
  isMobile 
}) {
  const [admin, setAdmin] = useState(null);
  const [showAdminSubmenu, setShowAdminSubmenu] = useState(false);
  const [showContactSubmenu, setShowContactSubmenu] = useState(false);
  const [showBlogSubmenu, setShowBlogSubmenu] = useState(false);  // Added for Blog
  const navigate = useNavigate();
  const location = useLocation();

  // Load logged-in admin details from localStorage
  useEffect(() => {
    const storedAdmin = localStorage.getItem('adminData');
    if (storedAdmin) {
      try {
        setAdmin(JSON.parse(storedAdmin));
      } catch (error) {
        console.error('Error parsing admin data:', error);
        setAdmin(null);
      }
    }
  }, []);

  const handleLogout = () => {
    // Remove token and admin data from localStorage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    
    // Redirect to login page
    navigate('/admin/login');
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const logoToUse = researchLabLogo;

  // Check if current route is active
  const isDashboardActive = location.pathname === '/admin/dashboard';
  const isAdminsActive = location.pathname.includes('/admin/admins');
  const isContactsActive = location.pathname.includes('/admin/contacts');
  const isBlogActive = location.pathname.includes('/admin/blog');  // Added for Blog

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isMobile ? (isSidebarOpen ? 0 : -280) : 0,
          opacity: isMobile ? (isSidebarOpen ? 1 : 0) : 1,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={`bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl h-full flex flex-col border-r border-blue-900/30 shadow-2xl shadow-blue-900/10 fixed top-0 z-40 ${
          isSidebarOpen ? 'w-[280px]' : 'w-0 md:w-[80px]'
        } ${isMobile ? 'left-0' : ''}`}
      >
        {/* Header - Clean and organized */}
        <div className={`border-b border-blue-900/30 ${isSidebarOpen ? 'p-6' : 'p-4'}`}>
          <div className={`flex items-center ${isSidebarOpen ? 'justify-between' : 'flex-col justify-center gap-3'}`}>
            
            {/* When sidebar is OPEN */}
            {isSidebarOpen ? (
              <>
                {/* Logo and Title */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-4"
                >
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
                    <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-blue-900/90 to-black/90 border-2 border-blue-700/50 overflow-hidden shadow-lg shadow-blue-900/30">
                      <img 
                        src={logoToUse} 
                        alt="Research Lab Logo" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">
                      IdeaXLab
                    </h1>
                    <p className="text-xs text-blue-400 font-mono tracking-wider mt-1">
                      ADMIN PORTAL
                    </p>
                  </div>
                </motion.div>

                {/* Close Button - Desktop only */}
                {!isMobile && (
                  <button
                    onClick={handleToggleSidebar}
                    className="w-10 h-10 rounded-xl bg-black/60 backdrop-blur-md border border-gray-800/70 flex items-center justify-center text-gray-300 hover:text-white hover:border-blue-600/50 transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <FiChevronLeft className="w-5 h-5" />
                  </button>
                )}
              </>
            ) : (
              /* When sidebar is CLOSED */
              <>
                {/* 3-line Menu Button - Positioned at the top (DESKTOP ONLY) */}
                {!isMobile && (
                  <button
                    onClick={handleToggleSidebar}
                    className="w-10 h-10 rounded-xl bg-black/60 backdrop-blur-md border border-gray-800/70 flex items-center justify-center text-gray-300 hover:text-white hover:border-blue-600/50 transition-all duration-300 mb-3 shadow-lg"
                  >
                    <FiMenu className="w-5 h-5" />
                  </button>
                )}

                {/* Logo */}
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
                  <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-blue-900/90 to-black/90 border-2 border-blue-700/50 overflow-hidden shadow-lg shadow-blue-900/30">
                    <img 
                      src={logoToUse} 
                      alt="Research Lab Logo" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                      }}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Mobile Close Button - Only when sidebar is open on mobile */}
            {isMobile && isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-gray-300 hover:text-white transition-colors duration-300 p-2 hover:bg-blue-900/20 rounded-lg"
              >
                <FiX className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6">
          <ul className="space-y-1.5 px-4">
            {/* Dashboard */}
            <li>
              <button
                onClick={() => {
                  navigate('/admin/dashboard');
                  if (isMobile) setIsSidebarOpen(false);
                }}
                className={`flex items-center w-full rounded-xl transition-all duration-300 group ${
                  isSidebarOpen ? 'px-4 py-3' : 'p-3 justify-center'
                } ${
                  isDashboardActive
                    ? 'bg-gradient-to-r from-blue-600/30 to-cyan-600/20 text-white shadow-lg shadow-blue-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                }`}
              >
                <div className={`flex items-center ${isSidebarOpen ? 'space-x-4' : 'justify-center'}`}>
                  <span className={`flex items-center justify-center w-5 h-5 ${
                    isDashboardActive 
                      ? 'text-blue-400' 
                      : 'text-gray-400 group-hover:text-blue-300'
                  } transition-transform duration-200`}>
                    <FiHome />
                  </span>
                  {isSidebarOpen && (
                    <span className="text-sm font-medium tracking-wide whitespace-nowrap">
                      Dashboard
                    </span>
                  )}
                </div>
              </button>
            </li>

            {/* BLOG MANAGEMENT - NEW SECTION */}
            <li>
              <div>
                <button
                  onClick={() => {
                    setShowBlogSubmenu(!showBlogSubmenu);
                    // If clicking blog for first time, navigate to blog list
                    if (!showBlogSubmenu) {
                      navigate('/admin/blog');
                    }
                  }}
                  className={`flex items-center w-full rounded-xl transition-all duration-300 group ${
                    isSidebarOpen ? 'px-4 py-3' : 'p-3 justify-center'
                  } ${
                    isBlogActive
                      ? 'bg-gradient-to-r from-blue-600/30 to-cyan-600/20 text-white shadow-lg shadow-blue-500/10'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                  }`}
                >
                  <div className={`flex items-center ${isSidebarOpen ? 'space-x-4' : 'justify-center'}`}>
                    <span className={`flex items-center justify-center w-5 h-5 ${
                      isBlogActive 
                        ? 'text-blue-400' 
                        : 'text-gray-400 group-hover:text-blue-300'
                    } transition-transform duration-200`}>
                      <FiFileText />
                    </span>
                    {isSidebarOpen && (
                      <span className="text-sm font-medium tracking-wide whitespace-nowrap">
                        Blog
                      </span>
                    )}
                  </div>
                  {isSidebarOpen && (
                    <FiChevronDown className={`ml-auto transition-transform duration-300 ${showBlogSubmenu ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {/* Submenu for Blog section */}
                {isSidebarOpen && showBlogSubmenu && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-12 mt-1 space-y-1"
                  >
                    {/* All Blog Posts */}
                    <button
                      onClick={() => {
                        navigate('/admin/blog');
                        if (isMobile) setIsSidebarOpen(false);
                      }}
                      className={`flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                        location.pathname === '/admin/blog'
                          ? 'text-blue-400 bg-blue-900/20'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                      }`}
                    >
                      <FiFileText className="w-4 h-4" />
                      <span>All Posts</span>
                    </button>

                    {/* Create New Post */}
                    <button
                      onClick={() => {
                        navigate('/admin/blog/create');
                        if (isMobile) setIsSidebarOpen(false);
                      }}
                      className={`flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                        location.pathname === '/admin/blog/create'
                          ? 'text-blue-400 bg-blue-900/20'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                      }`}
                    >
                      <FiPlus className="w-4 h-4" />
                      <span>Create Post</span>
                    </button>

                    {/* Edit Post (Dynamic - will open with ID) */}
                    <button
                      onClick={() => {
                        // This will navigate to edit page with a specific ID
                        // You might want to show a list or modal to select which post to edit
                        navigate('/admin/blog'); // First go to blog list, then edit from there
                        if (isMobile) setIsSidebarOpen(false);
                      }}
                      className={`flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                        location.pathname.includes('/admin/blog/edit')
                          ? 'text-blue-400 bg-blue-900/20'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                      }`}
                    >
                      <FiEdit className="w-4 h-4" />
                      <span>Edit Post</span>
                    </button>

                    {/* Add Categories */}
                    <button
                      onClick={() => {
                        navigate('/admin/blog/categories');
                        if (isMobile) setIsSidebarOpen(false);
                      }}
                      className={`flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                        location.pathname === '/admin/blog/categories'
                          ? 'text-blue-400 bg-blue-900/20'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                      }`}
                    >
                      <FiFolder className="w-4 h-4" />
                      <span>Add Categories</span>
                    </button>

                    {/* Edit Categories */}
                    <button
                      onClick={() => {
                        navigate('/admin/blog/categories/edit');
                        if (isMobile) setIsSidebarOpen(false);
                      }}
                      className={`flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                        location.pathname === '/admin/blog/categories/edit'
                          ? 'text-blue-400 bg-blue-900/20'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                      }`}
                    >
                      <FiEdit className="w-4 h-4" />
                      <span>Edit Categories</span>
                    </button>
                  </motion.div>
                )}
              </div>
            </li>

            {/* Contact Management */}
            <li>
              <div>
                <button
                  onClick={() => {
                    setShowContactSubmenu(!showContactSubmenu);
                    // If clicking contact for first time, navigate to messages
                    if (!showContactSubmenu) {
                      navigate('/admin/contacts/messages');
                    }
                  }}
                  className={`flex items-center w-full rounded-xl transition-all duration-300 group ${
                    isSidebarOpen ? 'px-4 py-3' : 'p-3 justify-center'
                  } ${
                    isContactsActive
                      ? 'bg-gradient-to-r from-blue-600/30 to-cyan-600/20 text-white shadow-lg shadow-blue-500/10'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                  }`}
                >
                  <div className={`flex items-center ${isSidebarOpen ? 'space-x-4' : 'justify-center'}`}>
                    <span className={`flex items-center justify-center w-5 h-5 ${
                      isContactsActive 
                        ? 'text-blue-400' 
                        : 'text-gray-400 group-hover:text-blue-300'
                    } transition-transform duration-200`}>
                      <FiMail />
                    </span>
                    {isSidebarOpen && (
                      <span className="text-sm font-medium tracking-wide whitespace-nowrap">
                        Contacts
                      </span>
                    )}
                  </div>
                  {isSidebarOpen && (
                    <FiChevronDown className={`ml-auto transition-transform duration-300 ${showContactSubmenu ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {/* Submenu for Contact section */}
                {isSidebarOpen && showContactSubmenu && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-12 mt-1 space-y-1"
                  >
                    <button
                      onClick={() => {
                        navigate('/admin/contacts/messages');
                        if (isMobile) setIsSidebarOpen(false);
                      }}
                      className={`flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                        location.pathname === '/admin/contacts/messages'
                          ? 'text-blue-400 bg-blue-900/20'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                      }`}
                    >
                      <FiMessageSquare />
                      <span>Messages</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/admin/contacts/compose');
                        if (isMobile) setIsSidebarOpen(false);
                      }}
                      className={`flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                        location.pathname === '/admin/contacts/compose'
                          ? 'text-blue-400 bg-blue-900/20'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                      }`}
                    >
                      <FiMail />
                      <span>Compose</span>
                    </button>
                  </motion.div>
                )}
              </div>
            </li>

            {/* Admins (only for superAdmin) */}
            {admin?.role === "superAdmin" && (
              <li>
                <div>
                  <button
                    onClick={() => {
                      setShowAdminSubmenu(!showAdminSubmenu);
                      // If clicking admin for first time, navigate to all admins
                      if (!showAdminSubmenu) {
                        navigate('/admin/admins/all');
                      }
                    }}
                    className={`flex items-center w-full rounded-xl transition-all duration-300 group ${
                      isSidebarOpen ? 'px-4 py-3' : 'p-3 justify-center'
                    } ${
                      isAdminsActive
                        ? 'bg-gradient-to-r from-blue-600/30 to-cyan-600/20 text-white shadow-lg shadow-blue-500/10'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                    }`}
                  >
                    <div className={`flex items-center ${isSidebarOpen ? 'space-x-4' : 'justify-center'}`}>
                      <span className={`flex items-center justify-center w-5 h-5 ${
                        isAdminsActive 
                          ? 'text-blue-400' 
                          : 'text-gray-400 group-hover:text-blue-300'
                      } transition-transform duration-200`}>
                        <FiUsers />
                      </span>
                      {isSidebarOpen && (
                        <span className="text-sm font-medium tracking-wide whitespace-nowrap">
                          Admins
                        </span>
                      )}
                    </div>
                    {isSidebarOpen && (
                      <FiChevronDown className={`ml-auto transition-transform duration-300 ${showAdminSubmenu ? 'rotate-180' : ''}`} />
                    )}
                  </button>

                  {/* Submenu for Admin section */}
                  {isSidebarOpen && showAdminSubmenu && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="ml-12 mt-1 space-y-1"
                    >
                      <button
                        onClick={() => {
                          navigate('/admin/admins/all');
                          if (isMobile) setIsSidebarOpen(false);
                        }}
                        className={`flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                          location.pathname === '/admin/admins/all'
                            ? 'text-blue-400 bg-blue-900/20'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                        }`}
                      >
                        <FiUserCheck />
                        <span>All Admins</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/admin/admins/pending');
                          if (isMobile) setIsSidebarOpen(false);
                        }}
                        className={`flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                          location.pathname === '/admin/admins/pending'
                            ? 'text-blue-400 bg-blue-900/20'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                        }`}
                      >
                        <FiUserPlus />
                        <span>Pending Admins</span>
                      </button>
                    </motion.div>
                  )}
                </div>
              </li>
            )}
          </ul>

          {/* Admin Status Card */}
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 mx-4 p-4 bg-gradient-to-br from-blue-900/30 to-black/40 rounded-xl border border-blue-800/30 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                <span className="text-blue-400 text-sm font-semibold tracking-wide">
                  {admin?.role === 'superAdmin' ? 'SUPER ADMIN' : 'ADMIN PRIVILEGES'}
                </span>
              </div>
              <p className="text-gray-300 text-xs leading-relaxed">
                {admin?.role === 'superAdmin' 
                  ? 'Full system access with elevated permissions and security controls.' 
                  : 'Administrative access with limited permissions.'}
              </p>
            </motion.div>
          )}
        </nav>

        {/* Footer - User Profile */}
        <div className={`border-t border-blue-900/30 ${isSidebarOpen ? 'p-4' : 'p-4'}`}>
          <div className={`flex items-center ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}>
            <div className={`relative ${isSidebarOpen ? 'flex items-center w-full' : ''}`}>
              {/* User Avatar */}
              <div className={`relative ${isSidebarOpen ? '' : 'mx-auto'}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 blur-md rounded-full opacity-40"></div>
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
                  <FiUser className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* User Info - Only shown when sidebar is open */}
              {isSidebarOpen && (
                <div className="flex-1 min-w-0 ml-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {admin?.fullName || 'Admin User'}
                      </p>
                      <p className="text-xs text-blue-300 font-medium truncate mt-0.5">
                        {admin?.email || 'admin@gmail.com'}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="ml-3 p-2 rounded-lg hover:bg-red-900/30 transition-colors duration-300 flex-shrink-0 group"
                      title="Logout"
                    >
                      <FiLogOut className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors duration-300" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}