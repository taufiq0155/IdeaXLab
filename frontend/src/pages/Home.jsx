// Home.jsx (updated)
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUser, FaBars, FaTimes, FaChevronDown, 
  FaSearch, FaEnvelope, FaPhone, FaCaretRight,
  FaSun, FaMoon
} from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext'; // Add this import
import researchLabLogo from '../assets/researchLab.jpeg';
import Footer from './footer';

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const canvasRef = useRef(null);
  const { theme, toggleTheme } = useTheme(); // Get theme and toggle function

  // Update background color based on theme
  useEffect(() => {
    const updateCanvasBackground = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Clear and set background based on theme
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = theme === 'dark' ? '#000000' : '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    
    updateCanvasBackground();
  }, [theme]);

  // Add theme-aware styles to your particle system
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

    class Particle {
      constructor() {
        this.reset();
        this.x = Math.random() * canvas.width / dpr;
        this.y = Math.random() * canvas.height / dpr;
      }
      
      reset() {
        this.x = Math.random() * canvas.width / dpr;
        this.y = Math.random() * canvas.height / dpr;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        // Update colors based on theme
        this.color = theme === 'dark' 
          ? (Math.random() > 0.7 ? '#60a5fa' : '#3b82f6')
          : (Math.random() > 0.7 ? '#1d4ed8' : '#3b82f6');
        this.opacity = Math.random() * 0.3 + 0.1;
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

    class GeometricCircle {
      constructor() {
        this.x = Math.random() * canvas.width / dpr;
        this.y = Math.random() * canvas.height / dpr;
        this.radius = Math.random() * 60 + 40;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = Math.random() * 0.002 - 0.001;
        this.segments = Math.floor(Math.random() * 8) + 6;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.01 + 0.005;
        // Theme-aware colors
        this.color = theme === 'dark'
          ? (Math.random() > 0.5 ? 'rgba(59, 130, 246, 0.05)' : 'rgba(30, 64, 175, 0.08)')
          : (Math.random() > 0.5 ? 'rgba(37, 99, 235, 0.1)' : 'rgba(30, 64, 175, 0.15)');
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
        ctx.lineWidth = 1;
        
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
        
        if (distance < 80) {
          this.opacity = Math.min(this.opacity + 0.02, 0.2 * (1 - distance / 80));
        } else {
          this.opacity = Math.max(this.opacity - 0.02, 0);
        }
      }
      
      draw() {
        if (this.opacity > 0.01) {
          const lineColor = theme === 'dark' 
            ? `rgba(96, 165, 250, ${this.opacity})`
            : `rgba(37, 99, 235, ${this.opacity})`;
          
          ctx.beginPath();
          ctx.strokeStyle = lineColor;
          ctx.lineWidth = 0.5;
          ctx.moveTo(this.p1.x, this.p1.y);
          ctx.lineTo(this.p2.x, this.p2.y);
          ctx.stroke();
        }
      }
    }

    // Initialize
    const particles = Array.from({ length: 150 }, () => new Particle());
    const circles = Array.from({ length: 12 }, () => new GeometricCircle());
    const connections = [];
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        connections.push(new ConnectionLine(particles[i], particles[j]));
      }
    }

    let animationId;
    
    const animate = () => {
      // Set background based on theme
      ctx.fillStyle = theme === 'dark' ? '#000000' : '#ffffff';
      ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      
      circles.forEach(circle => {
        circle.update();
        circle.draw();
      });
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      connections.forEach(connection => {
        connection.update();
        connection.draw();
      });
      
      // Theme-aware gradient
      const centerX = canvas.width / dpr / 2;
      const centerY = canvas.height / dpr / 2;
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, 400
      );
      
      if (theme === 'dark') {
        gradient.addColorStop(0, 'rgba(30, 64, 175, 0.15)');
        gradient.addColorStop(1, 'rgba(30, 64, 175, 0)');
      } else {
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
      }
      
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
  }, [theme]); // Add theme as dependency

  const menuItems = [
    'Home',
    'About Us',
    'News',
    'Events',
    'Projects',
    'Products',
    'Publications',
    'Team',
    'Contact',
    'Blog',
   
  ];

  return (
    <div className={`min-h-screen relative overflow-hidden ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}`}>
      {/* Canvas for animated background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
      />

      {/* Header background overlay */}
      <div className={`fixed inset-0 h-32 z-30 pointer-events-none transition-all duration-500 ${
        theme === 'dark' 
          ? 'bg-gradient-to-b from-black via-black/90 to-transparent' 
          : 'bg-gradient-to-b from-gray-50 via-gray-50/90 to-transparent'
      }`}></div>
      
      {/* Main Navigation */}
      <nav className={`relative z-40 fixed w-full transition-all duration-500 ${
        isScrolled 
          ? `${theme === 'dark' ? 'bg-black/90' : 'bg-white/95'} backdrop-blur-md shadow-xl border-b ${
              theme === 'dark' 
                ? 'shadow-blue-900/10 border-blue-900/30' 
                : 'shadow-blue-200/30 border-blue-200/50'
            }`
          : `${theme === 'dark' ? 'bg-black/80' : 'bg-white/90'} backdrop-blur-sm`
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center group cursor-pointer">
              <div className="relative">
                <div className={`absolute inset-0 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                  theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-400/30'
                }`}></div>
                
                <img 
                  src={researchLabLogo} 
                  alt="EliteLab.AI Logo" 
                  className="relative h-16 w-auto max-w-[200px] z-10 transform group-hover:scale-105 transition-transform duration-300"
                  style={{
                    filter: theme === 'dark' 
                      ? 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.4))'
                      : 'drop-shadow(0 0 15px rgba(37, 99, 235, 0.3))'
                  }}
                />
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-1">
              {menuItems.map((item) => (
                <div key={item} className="relative group">
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 relative overflow-hidden group-hover:scale-105 ${
                      theme === 'dark'
                        ? 'text-gray-300 hover:text-white hover:bg-blue-900/30'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-blue-100/60'
                    }`}
                  >
                    <span className="relative z-10">{item}</span>
                    <div className={`absolute inset-0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-blue-900/0 via-blue-700/20 to-blue-900/0'
                        : 'bg-gradient-to-r from-blue-400/0 via-blue-300/30 to-blue-400/0'
                    }`}></div>
                    {['Products', 'Projects', 'Publications'].includes(item) && (
                      <FaChevronDown className={`inline ml-1 text-xs transition-opacity ${
                        theme === 'dark' ? 'opacity-60' : 'opacity-70'
                      } group-hover:opacity-100`} />
                    )}
                  </button>
                </div>
              ))}
              
              {/* Theme Toggle Button */}
              <div className="mx-4">
                <button
                  onClick={toggleTheme}
                  className={`relative p-3 rounded-lg transition-all duration-300 hover:shadow-lg ${
                    theme === 'dark'
                      ? 'bg-gray-800/50 hover:bg-gray-700/50 text-yellow-300 hover:text-yellow-200 border border-gray-700/50'
                      : 'bg-gray-100/70 hover:bg-gray-200 text-yellow-600 hover:text-yellow-700 border border-gray-200'
                  }`}
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <FaSun className="w-5 h-5 transition-transform duration-500 hover:rotate-180" />
                  ) : (
                    <FaMoon className="w-5 h-5 transition-transform duration-500 hover:rotate-45" />
                  )}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </button>
              </div>
              
              {/* Login Button */}
              <div className={`ml-4 pl-4 ${
                theme === 'dark' ? 'border-l border-gray-800' : 'border-l border-gray-200'
              }`}>
                <Link
                  to="/admin/login"
                  className={`relative px-6 py-2.5 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-xl flex items-center space-x-2 group overflow-hidden ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 border border-blue-700/50 hover:shadow-blue-900/40'
                      : 'bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 border border-blue-600/50 hover:shadow-blue-500/40'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <FaUser className="text-sm relative z-10 group-hover:animate-pulse" />
                  <span className="relative z-10">Login</span>
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center space-x-3">
              {/* Mobile Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-lg transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 hover:bg-gray-700/50 text-yellow-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-yellow-600'
                }`}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <FaSun size={20} /> : <FaMoon size={20} />}
              </button>
              
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  theme === 'dark'
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-30 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="max-w-7xl mx-auto w-full">
          {/* Main Lab Title */}
          <div className="text-center mb-16">
            <div className="inline-block mb-12">
              <div className="relative">
                <h1 className={`text-8xl md:text-9xl font-black tracking-tighter bg-clip-text animate-pulse-slow ${
                  theme === 'dark'
                    ? 'text-transparent bg-gradient-to-b from-white via-blue-100 to-blue-300'
                    : 'text-transparent bg-gradient-to-b from-gray-900 via-blue-800 to-blue-600'
                }`}>
                  Lab
                </h1>
                <div className={`absolute inset-0 blur-3xl opacity-20 -z-10 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-b from-blue-400 via-blue-600 to-blue-900'
                    : 'bg-gradient-to-b from-blue-300 via-blue-500 to-blue-700'
                }`}></div>
              </div>
              
              <div className="mt-12 space-y-4">
                <div className={`inline-flex items-center justify-center px-8 py-3 rounded-full border shadow-lg backdrop-blur-sm ${
                  theme === 'dark'
                    ? 'bg-black/40 border-blue-900/50 shadow-blue-900/20'
                    : 'bg-white/40 border-blue-400/50 shadow-blue-400/20'
                }`}>
                  <span className={`font-mono text-sm tracking-widest animate-pulse ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    RESEARCH & DEVELOPMENT
                  </span>
                </div>
                
                <h2 className={`text-4xl md:text-6xl font-bold tracking-wider leading-tight ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  IDEAS, <span className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} animate-gradient-x`}>EXPERIMENTS</span>,
                </h2>
                <h2 className={`text-4xl md:text-6xl font-bold tracking-wider leading-tight ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  <span className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} animate-gradient-x-reverse`}>INNOVATION</span>
                </h2>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h1 className={`text-4xl md:text-6xl font-bold mb-10 leading-tight tracking-tight ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">ELITE</span> Research Lab
              </h1>
              
              <div className={`inline-flex items-center justify-center px-8 py-4 rounded-full border shadow-lg backdrop-blur-sm mb-12 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-blue-900/30 to-blue-800/30 border-blue-700/50 shadow-blue-900/30'
                  : 'bg-gradient-to-r from-blue-400/20 to-blue-500/20 border-blue-400/50 shadow-blue-400/30'
              }`}>
                <div className={`w-3 h-3 rounded-full mr-4 shadow-lg ${
                  theme === 'dark' ? 'bg-blue-500 animate-ping shadow-blue-500' : 'bg-blue-400 animate-ping shadow-blue-400'
                }`}></div>
                <span className={`text-2xl font-semibold tracking-wide ${
                  theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                }`}>
                  Advancing Artificial Intelligence for a
                </span>
              </div>
              
              <h2 className="text-4xl md:text-6xl font-bold mb-16">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-400 animate-gradient-flow">
                  Transparent Future
                </span>
              </h2>
            </div>

            {/* Description Card */}
            <div className={`backdrop-blur-md rounded-3xl p-8 md:p-12 border shadow-2xl mb-16 ${
              theme === 'dark'
                ? 'bg-black/40 border-gray-800/50 shadow-blue-900/20'
                : 'bg-white/40 border-gray-300/50 shadow-blue-400/20'
            }`}>
              <div className="text-center">
                <div className="flex justify-center mb-8">
                  <div className={`h-px w-32 animate-scan ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-transparent via-blue-500 to-transparent'
                      : 'bg-gradient-to-r from-transparent via-blue-400 to-transparent'
                  }`}></div>
                </div>
                
                <p className={`text-xl md:text-2xl leading-relaxed mb-10 font-light tracking-wide ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  At <span className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} font-semibold`}>ELITE Research Lab</span> (Explainable LLM and Interpretable Technology Ensemble Research Lab), we innovate in AI, creating solutions that are both advanced and interpretable. Our research focuses on making AI technologies transparent, reliable, and accessible to everyone.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
                  <Link
                    to="/admin/login"
                    className={`group relative px-10 py-4 font-bold rounded-xl transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 overflow-hidden ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-600 hover:to-blue-800 text-white hover:shadow-blue-900/50'
                        : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white hover:shadow-blue-500/50'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <span className="relative flex items-center justify-center space-x-3">
                      <FaUser className="text-lg" />
                      <span className="text-lg">Login to Dashboard</span>
                    </span>
                  </Link>
                  
                  <Link
                    to="/admin/signup"
                    className={`group relative px-10 py-4 font-bold rounded-xl transition-all duration-300 hover:shadow-xl overflow-hidden border-2 ${
                      theme === 'dark'
                        ? 'bg-transparent border-blue-700 hover:bg-blue-900/20 text-white hover:shadow-blue-900/30'
                        : 'bg-transparent border-blue-600 hover:bg-blue-500/10 text-gray-800 hover:shadow-blue-400/30'
                    }`}
                  >
                    <div className={`absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-blue-900/0 via-blue-700/10 to-blue-900/0'
                        : 'bg-gradient-to-r from-blue-500/0 via-blue-400/20 to-blue-500/0'
                    }`}></div>
                    <span className="relative flex items-center justify-center space-x-3">
                      <span className="text-lg">Join Our Research</span>
                      <FaCaretRight className="transform group-hover:translate-x-2 transition-transform duration-300" />
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
              {[
                { number: '50+', label: 'Research Papers', gradient: 'from-blue-500 to-cyan-500' },
                { number: '25+', label: 'AI Projects', gradient: 'from-blue-600 to-indigo-600' },
                { number: '15+', label: 'Industry Partners', gradient: 'from-blue-700 to-purple-700' },
                { number: '8+', label: 'Years of Research', gradient: 'from-blue-800 to-violet-800' }
              ].map((stat, index) => (
                <div 
                  key={index} 
                  className={`backdrop-blur-sm rounded-2xl p-6 border transition-all duration-500 group hover:transform hover:-translate-y-2 hover:shadow-xl ${
                    theme === 'dark'
                      ? 'bg-gradient-to-br from-gray-900/60 to-black/60 border-gray-800/50 hover:border-blue-700/50 hover:shadow-blue-900/20'
                      : 'bg-gradient-to-br from-white/60 to-gray-100/60 border-gray-300/50 hover:border-blue-400/50 hover:shadow-blue-400/20'
                  }`}
                >
                  <div className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-3`}>
                    {stat.number}
                  </div>
                  <div className={`text-sm font-medium tracking-wide group-hover:text-blue-300 transition-colors duration-300 flex items-center ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 animate-pulse ${
                      theme === 'dark' ? 'bg-blue-500' : 'bg-blue-400'
                    }`}></div>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Additional visual elements */}
      <div className="fixed inset-0 pointer-events-none z-20">
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}></div>
        </div>
        
        {/* Corner accents */}
        <div className={`absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 ${
          theme === 'dark' ? 'border-blue-500/20' : 'border-blue-400/30'
        }`}></div>
        <div className={`absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 ${
          theme === 'dark' ? 'border-blue-500/20' : 'border-blue-400/30'
        }`}></div>
        <div className={`absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 ${
          theme === 'dark' ? 'border-blue-500/20' : 'border-blue-400/30'
        }`}></div>
        <div className={`absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 ${
          theme === 'dark' ? 'border-blue-500/20' : 'border-blue-400/30'
        }`}></div>
      </div>

      {/* Add Footer Component - You'll need to update Footer.jsx too */}
      <Footer theme={theme} />
    </div>
  );
}