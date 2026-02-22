// src/components/Header.jsx
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { 
  FiBell, 
  FiSearch, 
  FiX,
  FiKey,
  FiMenu,
  FiMail,
  FiBriefcase,
  FiRefreshCw,
} from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';

const DISMISSED_NOTIFICATIONS_KEY = "adminDismissedNotifications";

export default function Header({ 
  onToggleSidebar, 
  isSidebarOpen,
  isMobile 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadContactCount, setUnreadContactCount] = useState(0);
  const [pendingServiceCount, setPendingServiceCount] = useState(0);
  const [isRefreshingNotifications, setIsRefreshingNotifications] = useState(false);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const notificationRef = useRef(null);
  const searchRef = useRef(null);
  const notificationTimerRef = useRef(null);

  // Get current page title from route
  const getPageTitle = () => {
    const path = location.pathname;
    const pathSegments = path.split('/').filter(segment => segment);
    
    if (pathSegments.length >= 2) {
      const lastSegment = pathSegments[pathSegments.length - 1];
      // Convert kebab-case to Title Case
      return lastSegment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    return 'Dashboard';
  };

  const handleChangePassword = () => {
    navigate('/admin/change-password');
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearch(false);
  };

  const saveDismissedIds = (ids) => {
    try {
      localStorage.setItem(DISMISSED_NOTIFICATIONS_KEY, JSON.stringify(ids));
    } catch (error) {
      // Ignore localStorage errors and keep runtime state.
    }
  };

  const dismissNotification = (notificationId) => {
    if (!notificationId) return;

    setDismissedNotificationIds((prev) => {
      if (prev.includes(notificationId)) return prev;
      const next = [...prev, notificationId].slice(-500);
      saveDismissedIds(next);
      return next;
    });

    setNotifications((prev) => {
      const target = prev.find((item) => item.id === notificationId);
      if (target?.type === "contact") {
        setUnreadContactCount((count) => Math.max(0, count - 1));
      } else if (target?.type === "service") {
        setPendingServiceCount((count) => Math.max(0, count - 1));
      }
      return prev.filter((item) => item.id !== notificationId);
    });
  };

  const clearAllNotifications = () => {
    if (notifications.length === 0) return;

    setDismissedNotificationIds((prev) => {
      const currentIds = notifications.map((item) => item.id).filter(Boolean);
      const next = Array.from(new Set([...prev, ...currentIds])).slice(-500);
      saveDismissedIds(next);
      return next;
    });

    setNotifications([]);
    setUnreadContactCount(0);
    setPendingServiceCount(0);
  };

  const fetchNotifications = async (showLoader = false) => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setNotifications([]);
      setUnreadContactCount(0);
      setPendingServiceCount(0);
      return;
    }

    try {
      if (showLoader) setIsRefreshingNotifications(true);

      const [contactResponse, serviceResponse] = await Promise.all([
        fetch("http://localhost:5000/api/contacts?limit=25&sortBy=createdAt&sortOrder=desc", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/admin/services?status=pending", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const contactContentType = contactResponse.headers.get("content-type") || "";
      const serviceContentType = serviceResponse.headers.get("content-type") || "";

      const contactData = contactContentType.includes("application/json")
        ? await contactResponse.json()
        : { success: false };
      const serviceData = serviceContentType.includes("application/json")
        ? await serviceResponse.json()
        : { success: false };

      const contactMessages = contactData?.success
        ? (contactData.messages || []).filter((item) => !item.read)
        : [];
      const pendingServices = serviceData?.success
        ? (serviceData.data || []).filter((item) => item.status === "pending")
        : [];

      const contactNotifications = contactMessages.map((item) => ({
        id: `contact-${item._id}`,
        type: "contact",
        icon: "mail",
        title: "New Contact Message",
        message: `${item.name || item.email || "Unknown"}: ${item.subject || "General Inquiry"}`,
        time: formatRelativeTime(item.createdAt),
        createdAt: item.createdAt ? new Date(item.createdAt).getTime() : 0,
        path: `/admin/contacts/messages?contactId=${item._id}`,
      }));

      const serviceNotifications = pendingServices.map((item) => ({
        id: `service-${item._id}`,
        type: "service",
        icon: "service",
        title: "New Service Request",
        message: `${item.requesterEmail || "Unknown"}: ${item.title || "Document review request"}`,
        time: formatRelativeTime(item.createdAt),
        createdAt: item.createdAt ? new Date(item.createdAt).getTime() : 0,
        path: `/admin/services/view?serviceId=${item._id}`,
      }));

      const dismissedSet = new Set(dismissedNotificationIds);
      const filteredContacts = contactNotifications.filter((item) => !dismissedSet.has(item.id));
      const filteredServices = serviceNotifications.filter((item) => !dismissedSet.has(item.id));

      const combined = [...filteredContacts, ...filteredServices]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 20);

      setNotifications(combined);
      setUnreadContactCount(filteredContacts.length);
      setPendingServiceCount(filteredServices.length);
    } catch (error) {
      // Keep header stable on failure.
    } finally {
      if (showLoader) setIsRefreshingNotifications(false);
    }
  };

  const handleNotificationNavigate = async (notification) => {
    if (!notification?.path) return;

    navigate(notification.path);
    setShowNotifications(false);

    if (notification.type === "contact") {
      try {
        const token = localStorage.getItem("adminToken");
        if (token) {
          const contactId = notification.id.replace("contact-", "");
          await fetch(`http://localhost:5000/api/contacts/${contactId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      } catch (error) {
        // Non-blocking; selection still navigates.
      }
      fetchNotifications(false);
    }
  };

  const markContactNotificationsAsRead = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:5000/api/contacts/actions/mark-all-read", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        await response.json();
      }
    } catch (error) {
      // Ignore notification mark failures.
    } finally {
      fetchNotifications(false);
    }
  };

  // Menu items for search
  const menuItems = [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Contacts", path: "/admin/contacts/messages" },
    { label: "View Service", path: "/admin/services/view" },
    { label: "Blogs", path: "/admin/blog" },
    { label: "Projects", path: "/admin/projects/view" },
    { label: "Innovations", path: "/admin/innovations/view" },
    { label: "Research", path: "/admin/research/view" },
    { label: "All Admins", path: "/admin/admins/all" },
    { label: "Pending Admins", path: "/admin/admins/pending" },
    { label: "Change Password", path: "/admin/change-password" },
  ];

  const searchResults = searchQuery ? menuItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DISMISSED_NOTIFICATIONS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setDismissedNotificationIds(parsed.filter((item) => typeof item === "string"));
      }
    } catch (error) {
      // Ignore malformed storage values.
    }
  }, []);

  useEffect(() => {
    fetchNotifications(true);

    if (notificationTimerRef.current) {
      clearInterval(notificationTimerRef.current);
    }

    notificationTimerRef.current = setInterval(() => {
      fetchNotifications(false);
    }, 60000);

    return () => {
      if (notificationTimerRef.current) {
        clearInterval(notificationTimerRef.current);
      }
    };
  }, [location.pathname, dismissedNotificationIds]);

  // Handle header position based on sidebar state
  const headerPosition = isSidebarOpen 
    ? isMobile ? 'left-0' : 'left-[280px]'
    : isMobile ? 'left-0' : 'left-[80px]';

  return (
    <>
      <header
        className={`bg-gradient-to-r from-gray-900/95 to-black/95 backdrop-blur-xl border-b border-blue-900/30 shadow-xl shadow-blue-900/10 fixed top-0 h-16 z-40 transition-all duration-300 ${headerPosition} ${
          isMobile ? 'right-0' : 'right-0'
        }`}
      >
        <div className="flex items-center justify-between h-full px-4 md:px-6">
          {/* Left Section - Page Title */}
          <div className="flex items-center">
            {/* Mobile Menu Button */}
            {isMobile && (
              <button
                onClick={onToggleSidebar}
                className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md border border-gray-800/70 flex items-center justify-center text-white hover:border-blue-600/50 transition-all duration-300 mr-4"
              >
                {isSidebarOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
              </button>
            )}
            
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-white">
                {getPageTitle()}
              </h1>
              <p className="text-xs text-gray-400">IdeaXLab Admin Portal</p>
            </div>
          </div>

          {/* Right Section - Search, Notifications, Change Password */}
          <div className="flex items-center space-x-4">
            {/* Desktop Search */}
            <div className="hidden md:block relative" ref={searchRef}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 px-4 py-2 pl-10 pr-10 rounded-xl bg-gray-800/50 backdrop-blur-md border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-blue-600/50 focus:ring-1 focus:ring-blue-600/30 transition-all"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearch(true);
                  }}
                  onFocus={() => searchQuery && setShowSearch(true)}
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {showSearch && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl rounded-xl border border-gray-800/50 shadow-2xl overflow-hidden z-50">
                    {searchResults.map((item, index) => (
                      <div
                        key={index}
                        className="px-4 py-3 hover:bg-gray-800/50 cursor-pointer border-b border-gray-800/30 last:border-b-0"
                        onClick={() => {
                          navigate(item.path);
                          clearSearch();
                        }}
                      >
                        <p className="text-white font-medium">{item.label}</p>
                        <p className="text-xs text-gray-400 mt-1">{item.path}</p>
                      </div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Search Button */}
            {isMobile && (
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md border border-gray-800/70 flex items-center justify-center text-white hover:border-blue-600/50 transition-all"
              >
                <FiSearch className="w-5 h-5" />
              </button>
            )}

            {/* Change Password Button */}
             <button
              onClick={handleChangePassword}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-900/20 to-cyan-900/20 backdrop-blur-md border border-blue-800/30 text-blue-400 hover:text-white hover:border-blue-600/50 hover:bg-gradient-to-r hover:from-blue-900/30 hover:to-cyan-900/30 transition-all duration-300 group"
              title="Change Password"
            >
              <FiKey className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline text-sm font-medium">Change Password</span>
            </button>


            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={handleNotificationClick}
                className="relative w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md border border-gray-800/70 flex items-center justify-center text-white hover:border-blue-600/50 transition-all"
              >
                <FiBell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-xl rounded-xl border border-gray-800/50 shadow-2xl overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-800/50">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-white font-semibold">Notifications</h3>
                        <button
                          type="button"
                          onClick={() => fetchNotifications(true)}
                          className="text-gray-400 hover:text-cyan-300 transition-colors"
                          title="Refresh notifications"
                        >
                          <FiRefreshCw className={`w-4 h-4 ${isRefreshingNotifications ? "animate-spin" : ""}`} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {unreadContactCount} contact + {pendingServiceCount} service notifications
                      </p>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification, index) => (
                          <div
                            key={notification.id || index}
                            className="p-4 border-b border-gray-800/30 hover:bg-gray-800/50 cursor-pointer"
                            onClick={() => handleNotificationNavigate(notification)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center">
                                  {notification.icon === "mail" ? (
                                    <FiMail className="w-4 h-4 text-cyan-300" />
                                  ) : notification.icon === "service" ? (
                                    <FiBriefcase className="w-4 h-4 text-blue-300" />
                                  ) : (
                                    <FiBell className="w-4 h-4 text-blue-400" />
                                  )}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white font-medium">{notification.title}</p>
                                <p className="text-xs text-gray-400 mt-1">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                              </div>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  dismissNotification(notification.id);
                                }}
                                className="flex-shrink-0 text-gray-500 hover:text-red-400 transition-colors"
                                title="Delete notification"
                                aria-label="Delete notification"
                              >
                                <FiX className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <div className="w-16 h-16 mx-auto rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
                            <FiBell className="w-8 h-8 text-gray-600" />
                          </div>
                          <p className="text-gray-400">No notifications yet</p>
                          <p className="text-xs text-gray-500 mt-2">You're all caught up!</p>
                        </div>
                      )}
                    </div>
                    
                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-gray-800/50 space-y-2">
                        <button
                          onClick={clearAllNotifications}
                          className="w-full text-center text-sm text-red-400 hover:text-red-300"
                        >
                          Delete all notifications
                        </button>
                        <button
                          onClick={markContactNotificationsAsRead}
                          className="w-full text-center text-sm text-blue-400 hover:text-blue-300"
                        >
                          Mark contact notifications as read
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        <AnimatePresence>
          {isMobile && showSearch && (
            <div className="md:hidden bg-gray-900/95 backdrop-blur-xl border-b border-gray-800/50 absolute top-16 left-0 right-0 z-40">
              <div className="p-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search menu items..."
                    className="w-full px-4 py-3 pl-10 pr-10 rounded-xl bg-gray-800/50 backdrop-blur-md border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-blue-600/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <button
                    onClick={() => {
                      clearSearch();
                      setShowSearch(false);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
                
                {searchQuery && searchResults.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {searchResults.map((item, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 cursor-pointer"
                        onClick={() => {
                          navigate(item.path);
                          clearSearch();
                          setShowSearch(false);
                        }}
                      >
                        <p className="text-white font-medium">{item.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer to prevent content from being hidden under fixed header */}
      <div className="h-16"></div>
    </>
  );
}

function formatRelativeTime(value) {
  if (!value) return "Just now";
  const timestamp = new Date(value).getTime();
  if (!timestamp || Number.isNaN(timestamp)) return "Just now";

  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
