import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, 
  FiUsers, 
  FiBarChart2, 
  FiSettings, 
  FiChevronLeft, 
  FiChevronRight,
  FiLogOut,
  FiUser,
  FiDatabase,
  FiFileText,
  FiBell,
  FiMessageSquare,
  FiArchive,
  FiX,
  FiMenu
} from 'react-icons/fi';

// Logo import
import researchLabLogo from '../../../assets/researchLab.jpeg';



export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isSidebarOpen, 
  setIsSidebarOpen,
  isMobile 
}) {
  const navItems = [
    { name: 'Dashboard', icon: <FiHome />, tab: 'overview' },
    { name: 'User Management', icon: <FiUsers />, tab: 'users' },
    { name: 'Analytics', icon: <FiBarChart2 />, tab: 'analytics' },
    { name: 'Reports', icon: <FiFileText />, tab: 'reports' },
    { name: 'Messages', icon: <FiMessageSquare />, tab: 'messages' },
    { name: 'Notifications', icon: <FiBell />, tab: 'notifications' },
    { name: 'Database', icon: <FiDatabase />, tab: 'database' },
    { name: 'Archive', icon: <FiArchive />, tab: 'archive' },
    { name: 'Settings', icon: <FiSettings />, tab: 'settings' },
  ];

  const handleItemClick = (tab) => {
    setActiveTab(tab);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    // Add your logout logic here
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const logoToUse = researchLabLogo ;

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
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleToggleSidebar}
                    className="w-10 h-10 rounded-xl bg-black/60 backdrop-blur-md border border-gray-800/70 flex items-center justify-center text-gray-300 hover:text-white hover:border-blue-600/50 transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <FiChevronLeft className="w-5 h-5" />
                  </motion.button>
                )}
              </>
            ) : (
              /* When sidebar is CLOSED */
              <>
                {/* 3-line Menu Button - Positioned at the top */}
                {!isMobile && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleToggleSidebar}
                    className="w-10 h-10 rounded-xl bg-black/60 backdrop-blur-md border border-gray-800/70 flex items-center justify-center text-gray-300 hover:text-white hover:border-blue-600/50 transition-all duration-300 mb-3 shadow-lg"
                  >
                    <FiMenu className="w-5 h-5" />
                  </motion.button>
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
            {navItems.map((item) => {
              const isActive = activeTab === item.tab;
              
              return (
                <li key={item.tab}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleItemClick(item.tab)}
                    className={`flex items-center w-full rounded-xl transition-all duration-300 group ${
                      isSidebarOpen ? 'px-4 py-3' : 'p-3 justify-center'
                    } ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600/30 to-cyan-600/20 text-white shadow-lg shadow-blue-500/10'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                    }`}
                  >
                    <div className={`flex items-center ${isSidebarOpen ? 'space-x-4' : 'justify-center'}`}>
                      <span className={`flex items-center justify-center w-5 h-5 ${
                        isActive 
                          ? 'text-blue-400' 
                          : 'text-gray-400 group-hover:text-blue-300'
                      } transition-transform duration-200`}>
                        {item.icon}
                      </span>
                      {isSidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-sm font-medium tracking-wide whitespace-nowrap"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </div>
                    {isSidebarOpen && isActive && (
                      <div className="ml-auto">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                      </div>
                    )}
                  </motion.button>
                </li>
              );
            })}
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
                  ADMIN PRIVILEGES
                </span>
              </div>
              <p className="text-gray-300 text-xs leading-relaxed">
                Full system access with elevated permissions and security controls.
              </p>
            </motion.div>
          )}
        </nav>

        {/* Footer - User Profile */}
        <div className={`border-t border-blue-900/30 ${isSidebarOpen ? 'p-4' : 'p-4'}`}>
          <div className={`flex items-center ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}>
            <motion.div
              whileHover={isSidebarOpen ? { scale: 1.02 } : {}}
              className={`relative ${isSidebarOpen ? 'flex items-center w-full' : ''}`}
            >
              {/* User Avatar */}
              <div className={`relative ${isSidebarOpen ? '' : 'mx-auto'}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 blur-md rounded-full opacity-40"></div>
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
                  <FiUser className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* User Info - Only shown when sidebar is open */}
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex-1 min-w-0 ml-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        Admin User
                      </p>
                      <p className="text-xs text-blue-300 font-medium truncate mt-0.5">
                        admin@gmail.com
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLogout}
                      className="ml-3 p-2 rounded-lg hover:bg-red-900/30 transition-colors duration-300 flex-shrink-0"
                      title="Logout"
                    >
                      <FiLogOut className="w-4 h-4 text-gray-400 hover:text-red-400" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}