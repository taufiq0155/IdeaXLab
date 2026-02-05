import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBell, FiSearch, FiZap, FiTrendingUp, FiUsers, FiDollarSign, FiActivity, FiMenu, FiX } from 'react-icons/fi';
import Sidebar from './components/sidebar';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Canvas Animation (EXACT SAME AS LOGIN PAGE)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    const resizeCanvas = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    resizeCanvas();

    // Particle system (same as login)
    class Particle {
      constructor() {
        this.reset();
        this.x = Math.random() * canvas.width / dpr;
        this.y = Math.random() * canvas.height / dpr;
      }
      
      reset() {
        this.x = Math.random() * canvas.width / dpr;
        this.y = Math.random() * canvas.height / dpr;
        this.size = Math.random() * 2.5 + 0.5;
        this.speedX = Math.random() * 0.6 - 0.3;
        this.speedY = Math.random() * 0.6 - 0.3;
        this.color = Math.random() > 0.5 ? '#60a5fa' : '#3b82f6';
        this.opacity = Math.random() * 0.4 + 0.1;
        this.wander = 0;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        this.wander += 0.01;
        this.x += Math.sin(this.wander) * 0.2;
        this.y += Math.cos(this.wander) * 0.2;
        
        if (this.x < -20 || this.x > canvas.width / dpr + 20 || 
            this.y < -20 || this.y > canvas.height / dpr + 20) {
          this.reset();
        }
      }
      
      draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // Geometric circles (same as login)
    class GeometricCircle {
      constructor() {
        this.x = Math.random() * canvas.width / dpr;
        this.y = Math.random() * canvas.height / dpr;
        this.radius = Math.random() * 80 + 60;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = Math.random() * 0.003 - 0.0015;
        this.segments = Math.floor(Math.random() * 8) + 6;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.015 + 0.008;
        this.color = Math.random() > 0.5 ? 'rgba(59, 130, 246, 0.08)' : 'rgba(30, 64, 175, 0.12)';
      }
      
      update() {
        this.rotation += this.rotationSpeed;
        this.pulse += this.pulseSpeed;
        const pulseEffect = Math.sin(this.pulse) * 0.2 + 0.8;
        this.currentRadius = this.radius * pulseEffect;
      }
      
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1.5;
        
        const segmentAngle = (Math.PI * 2) / this.segments;
        
        for (let i = 0; i < this.segments; i++) {
          const angle1 = i * segmentAngle;
          const angle2 = (i + 1) % this.segments * segmentAngle;
          
          const x1 = Math.cos(angle1) * this.currentRadius;
          const y1 = Math.sin(angle1) * this.currentRadius;
          const x2 = Math.cos(angle2) * this.currentRadius;
          const y2 = Math.sin(angle2) * this.currentRadius;
          
          ctx.moveTo(0, 0);
          ctx.lineTo(x1, y1);
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
        }
        
        ctx.moveTo(this.currentRadius, 0);
        for (let i = 0; i <= this.segments; i++) {
          const angle = i * segmentAngle;
          const x = Math.cos(angle) * this.currentRadius;
          const y = Math.sin(angle) * this.currentRadius;
          ctx.lineTo(x, y);
        }
        
        ctx.stroke();
        ctx.restore();
      }
    }

    // Connection lines (same as login)
    class ConnectionLine {
      constructor(particle1, particle2) {
        this.p1 = particle1;
        this.p2 = particle2;
        this.opacity = 0;
      }
      
      update() {
        const dx = this.p1.x - this.p2.x;
        const dy = this.p1.y - this.p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          this.opacity = Math.min(this.opacity + 0.03, 0.25 * (1 - distance / 100));
        } else {
          this.opacity = Math.max(this.opacity - 0.03, 0);
        }
      }
      
      draw() {
        if (this.opacity > 0.01) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(96, 165, 250, ${this.opacity})`;
          ctx.lineWidth = 0.8;
          ctx.moveTo(this.p1.x, this.p1.y);
          ctx.lineTo(this.p2.x, this.p2.y);
          ctx.stroke();
        }
      }
    }

    // Initialize with same particle count as login
    const particles = Array.from({ length: 120 }, () => new Particle());
    const circles = Array.from({ length: 8 }, () => new GeometricCircle());
    const connections = [];
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        connections.push(new ConnectionLine(particles[i], particles[j]));
      }
    }

    let animationId;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      
      // Dark background (same as login)
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      
      // Circles
      circles.forEach(circle => {
        circle.update();
        circle.draw();
      });
      
      // Particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      // Connections
      connections.forEach(connection => {
        connection.update();
        connection.draw();
      });
      
      // Radial gradient (same as login)
      const centerX = canvas.width / dpr / 2;
      const centerY = canvas.height / dpr / 2;
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, 600
      );
      gradient.addColorStop(0, 'rgba(30, 64, 175, 0.2)');
      gradient.addColorStop(0.5, 'rgba(30, 64, 175, 0.08)');
      gradient.addColorStop(1, 'rgba(30, 64, 175, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      
      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const stats = [
    { 
      name: 'Total Users', 
      value: '2,345', 
      change: '+12%', 
      icon: <FiUsers className="text-blue-400" />,
      gradient: 'from-blue-600/20 to-blue-800/10'
    },
    { 
      name: 'Active Sessions', 
      value: '143', 
      change: '+5%', 
      icon: <FiActivity className="text-cyan-400" />,
      gradient: 'from-cyan-600/20 to-blue-700/10'
    },
    { 
      name: 'Revenue', 
      value: '$12,345', 
      change: '+18%', 
      icon: <FiDollarSign className="text-green-400" />,
      gradient: 'from-green-600/20 to-emerald-700/10'
    },
    { 
      name: 'Pending Actions', 
      value: '8', 
      change: '-2%', 
      icon: <FiZap className="text-yellow-400" />,
      gradient: 'from-yellow-600/20 to-orange-700/10'
    },
  ];

  const recentActivities = [
    { id: 1, action: 'User login', time: '5 mins ago', user: 'John Doe' },
    { id: 2, action: 'Report generated', time: '1 hour ago', user: 'System' },
    { id: 3, action: 'Settings updated', time: '2 hours ago', user: 'Admin' },
    { id: 4, action: 'New user registered', time: '3 hours ago', user: 'Jane Smith' },
    { id: 5, action: 'Backup completed', time: '5 hours ago', user: 'System' },
  ];

  const quickActions = [
    { name: 'Add new user', icon: '👤', color: 'blue' },
    { name: 'Generate report', icon: '📊', color: 'cyan' },
    { name: 'Update settings', icon: '⚙️', color: 'purple' },
    { name: 'View analytics', icon: '📈', color: 'green' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Welcome Card with same glassmorphism effect as login */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative bg-black/60 backdrop-blur-xl rounded-3xl p-8 border border-gray-800/50 shadow-2xl shadow-blue-900/20"
            >
              {/* Glow effect like login */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
              
              <div className="relative flex flex-col md:flex-row items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-3">
                    Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Admin</span>
                  </h2>
                  <p className="text-gray-300 text-lg">
                    Here's what's happening with your lab today.
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <div className="flex items-center space-x-3 p-4 bg-black/40 backdrop-blur-sm rounded-xl border border-gray-800/70">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
                      <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping animation-delay-200"></div>
                      <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping animation-delay-400"></div>
                    </div>
                    <span className="text-sm font-medium text-blue-400">
                      System Status: <span className="text-green-400">Operational</span>
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats Grid with login card styling */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  {/* Glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                  
                  <div className={`relative bg-gradient-to-br ${stat.gradient} backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50 hover:border-blue-700/30 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-900/20`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-black/40 backdrop-blur-sm border border-gray-800/70">
                        {stat.icon}
                      </div>
                      <div className={`text-sm font-bold px-3 py-1 rounded-full backdrop-blur-sm ${
                        stat.change.startsWith('+') ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {stat.change}
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                        {stat.value}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {stat.name}
                      </div>
                    </div>
                    <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden mt-4">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          stat.change.startsWith('+') ? 'bg-gradient-to-r from-green-500 to-cyan-400' : 'bg-gradient-to-r from-red-500 to-orange-400'
                        }`}
                        style={{ 
                          width: `${Math.min(parseInt(stat.change.replace('%', '')) * 3, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2 relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                <div className="relative bg-black/60 backdrop-blur-xl rounded-3xl p-6 border border-gray-800/50">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <FiZap className="mr-2 text-yellow-400" />
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {quickActions.map((action, index) => (
                      <motion.button
                        key={action.name}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative bg-black/40 backdrop-blur-sm rounded-2xl p-5 border border-gray-800/70 hover:border-${action.color}-600/50 transition-all duration-300 group overflow-hidden`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        <div className="relative flex flex-col items-center space-y-3">
                          <div className="text-3xl transform group-hover:scale-110 transition-transform duration-300">
                            {action.icon}
                          </div>
                          <div className="text-sm text-gray-300 group-hover:text-white text-center font-medium">
                            {action.name}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                <div className="relative bg-black/60 backdrop-blur-xl rounded-3xl p-6 border border-gray-800/50">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <FiBell className="mr-2 text-blue-400" />
                    Recent Activity
                  </h3>
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-2xl bg-black/40 backdrop-blur-sm border border-gray-800/70 hover:bg-gray-800/50 transition-all duration-300 hover:border-blue-700/30"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-50"></div>
                          </div>
                          <div>
                            <div className="text-sm text-white font-medium">{activity.action}</div>
                            <div className="text-xs text-gray-400">{activity.user}</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 bg-black/30 px-2 py-1 rounded-lg">
                          {activity.time}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* System Stats Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
              <div className="relative bg-black/60 backdrop-blur-xl rounded-3xl p-6 border border-blue-800/30">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <FiTrendingUp className="mr-2 text-green-400" />
                  System Performance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'CPU Usage', value: '65%', gradient: 'from-blue-500 to-cyan-400' },
                    { label: 'Memory', value: '78%', gradient: 'from-green-500 to-emerald-400' },
                    { label: 'Storage', value: '42%', gradient: 'from-purple-500 to-pink-400' },
                  ].map((item, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">{item.label}</span>
                        <span className="text-white font-bold">{item.value}</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden backdrop-blur-sm">
                        <div 
                          className={`h-full rounded-full bg-gradient-to-r ${item.gradient} transition-all duration-1000`}
                          style={{ width: item.value }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        );
      default:
        return (
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
            <div className="relative bg-black/60 backdrop-blur-xl rounded-3xl p-8 border border-gray-800/50">
              <h2 className="text-2xl font-bold text-white mb-4">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Panel
              </h2>
              <p className="text-gray-300">
                Content for {activeTab} will be displayed here.
              </p>
            </div>
          </div>
        );
    }
  };

  const contentPadding = isMobile 
    ? 'p-4' 
    : isSidebarOpen 
      ? 'pl-[300px] pr-6 pt-6' 
      : 'pl-[100px] pr-6 pt-6';

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Canvas Background (EXACT SAME AS LOGIN) */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
      />

  

      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isMobile={isMobile}
      />

      {/* Main Content Area */}
      <div className={`min-h-screen transition-all duration-300 ${contentPadding}`}>
        {/* Header */}
        <header className={`fixed top-0 right-0 h-16 bg-black/80 backdrop-blur-xl border-b border-blue-900/30 flex items-center justify-between z-40 transition-all duration-300 ${
          isMobile 
            ? 'left-0 px-4' 
            : isSidebarOpen 
              ? 'left-[280px] px-6' 
              : 'left-[80px] px-6'
        }`}>
          <div className="flex items-center">
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="mr-4 p-2 text-gray-300 hover:text-white transition-colors duration-300"
              >
                {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            )}
            <h1 className="text-xl font-bold text-white">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Dashboard
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {!isMobile && (
              <>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search dashboard..."
                    className="pl-10 pr-4 py-2 bg-black/40 backdrop-blur-sm border border-gray-800/70 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-900/30 w-64 transition-all duration-300"
                  />
                </div>
                <button className="relative p-2 text-gray-300 hover:text-white transition-colors duration-300">
                  <FiBell className="w-5 h-5" />
                  <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                </button>
              </>
            )}
            <Link
              to="/"
              className="px-4 py-2 bg-gradient-to-r from-blue-700 to-blue-900 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/40 hover:-translate-y-0.5 border border-blue-700/50 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <span className="relative">Back to Home</span>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className={`pt-20 ${isMobile ? 'pb-6' : 'pb-6'}`}>
          {renderContent()}
        </main>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-gray-800/50 text-center">
          <p className="text-gray-500 text-sm">
            IdeaXLab Admin Dashboard v1.0 • Secure Access Only
          </p>
          <p className="text-gray-600 text-xs mt-2">
            © {new Date().getFullYear()} IdeaXLab. All rights reserved.
          </p>
        </footer>
      </div>

      {/* Bottom Gradient (same as login) */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none"></div>
    </div>
  );
}