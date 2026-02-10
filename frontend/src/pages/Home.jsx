import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUser, FaBars, FaTimes, FaChevronDown, 
  FaEnvelope, FaPhone, FaCaretRight,
  FaSun, FaMoon, FaCheckCircle, FaPaperPlane
} from 'react-icons/fa';
import { FiUser, FiMail, FiPhone, FiMessageSquare, FiSend } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import researchLabLogo from '../assets/researchLab.jpeg';
import Footer from './footer';
import AnimatedCanvas from '../components/animations/animatedCanvas';
import GlassCard from '../components/ui/GlassCard';
import StatsCard from '../components/ui/StatsCard';
import { toast, Toaster } from 'react-hot-toast';

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Contact form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    if (!formData.message.trim()) {
      toast.error('Please enter your message');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || '',
          subject: formData.subject.trim() || 'General Inquiry',
          message: formData.message.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || 'Message sent successfully! We will get back to you soon.');
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
        
        setFormSubmitted(true);
        
        // Reset submitted state after 5 seconds
        setTimeout(() => {
          setFormSubmitted(false);
        }, 5000);
      } else {
        let errorMsg = data.message || 'Failed to send message';
        if (data.errors && data.errors.length > 0) {
          errorMsg = data.errors.map(err => err.msg).join(', ');
        }
        throw new Error(errorMsg);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const stats = [
    { 
      number: '50+', 
      label: 'Research Papers', 
      color: 'blue',
      gradient: 'from-blue-600/20 to-blue-800/10'
    },
    { 
      number: '25+', 
      label: 'AI Projects', 
      color: 'cyan',
      gradient: 'from-cyan-600/20 to-blue-700/10'
    },
    { 
      number: '15+', 
      label: 'Industry Partners', 
      color: 'purple',
      gradient: 'from-purple-600/20 to-purple-800/10'
    },
    { 
      number: '8+', 
      label: 'Years of Research', 
      color: 'violet',
      gradient: 'from-violet-600/20 to-violet-800/10'
    }
  ];

  return (
    <div className={`min-h-screen relative overflow-hidden ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}`}>
      {/* Toaster for notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: theme === 'dark' ? '#1f2937' : '#ffffff',
            color: theme === 'dark' ? '#ffffff' : '#111827',
            border: theme === 'dark' ? '1px solid #374151' : '1px solid #d1d5db',
          },
        }}
      />

      {/* Animated Canvas Background */}
      <AnimatedCanvas theme={theme} />

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
                  alt="IdeaXlab logo" 
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
                Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">IdeaXLab</span> 
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

            {/* Description Card using GlassCard */}
            <GlassCard color="blue" className="mb-16" theme={theme}>
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
                  At <span className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} font-semibold`}>IdeaXLab</span> (Explainable LLM and Interpretable Technology Ensemble Research Lab), we innovate in AI, creating solutions that are both advanced and interpretable. Our research focuses on making AI technologies transparent, reliable, and accessible to everyone.
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
            </GlassCard>

            {/* Stats Grid using StatsCard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
              {stats.map((stat, index) => (
                <StatsCard
                  key={index}
                  label={stat.label}
                  value={stat.number}
                  icon={stat.icon}
                  color={stat.color}
                  className="animate-floating"
                  theme={theme}
                  style={{ animationDelay: `${index * 100}ms` }}
                />
              ))}
            </div>

            {/* Featured Projects Section */}
            <GlassCard color="blue" className="mb-20" theme={theme}>
              <div className="text-center mb-10">
                <h3 className={`text-3xl font-bold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    Featured Research Projects
                  </span>
                </h3>
                <p className={`text-lg ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Cutting-edge AI research that's shaping the future
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { 
                    title: 'Explainable AI Systems', 
                    desc: 'Developing transparent AI models for critical decision-making',
                    gradient: 'from-blue-500/20 to-blue-700/10'
                  },
                  { 
                    title: 'Multimodal LLM Research', 
                    desc: 'Advanced language models that understand text, images, and audio',
                    gradient: 'from-cyan-500/20 to-blue-600/10'
                  }
                ].map((project, index) => (
                  <div 
                    key={index}
                    className={`rounded-2xl p-6 border backdrop-blur-sm transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl ${
                      theme === 'dark'
                        ? 'bg-gradient-to-br from-gray-900/60 to-black/60 border-gray-800/50 hover:border-blue-700/50 hover:shadow-blue-900/20'
                        : 'bg-gradient-to-br from-white/60 to-gray-100/60 border-gray-300/50 hover:border-blue-400/50 hover:shadow-blue-400/20'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${project.gradient} flex items-center justify-center`}>
                        <div className="text-white text-xl font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className={`text-xl font-bold mb-2 ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {project.title}
                        </h4>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {project.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Contact Form Section - Added Here */}
            <div className="mb-20">
              <GlassCard color="purple" className="overflow-hidden" theme={theme}>
                <div className="p-6 md:p-8">
                  {formSubmitted ? (
                    <div className="text-center py-12">
                      <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                          <FaCheckCircle className="w-10 h-10 text-green-400 animate-bounce" />
                        </div>
                      </div>
                      <h3 className={`text-3xl font-bold mb-4 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Message Sent Successfully!
                      </h3>
                      <p className={`text-lg mb-8 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Thank you for contacting us. Our team will get back to you within 24-48 hours.
                      </p>
                      <button
                        onClick={() => setFormSubmitted(false)}
                        className={`px-8 py-3 rounded-lg font-medium transition-all duration-300 ${
                          theme === 'dark'
                            ? 'bg-blue-700 hover:bg-blue-600 text-white'
                            : 'bg-blue-600 hover:bg-blue-500 text-white'
                        }`}
                      >
                        Send Another Message
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="text-center mb-8">
                        <h3 className={`text-3xl font-bold mb-3 ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                            Get In Touch With Us
                          </span>
                        </h3>
                        <p className={`text-lg ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          Have questions about our research? Send us a message
                        </p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Name Field */}
                          <div className="space-y-2">
                            <label className={`block text-sm font-medium flex items-center gap-2 ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              <FiUser className="w-4 h-4" />
                              Your Name *
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              placeholder="Enter your full name"
                              className={`w-full px-4 py-3 rounded-xl transition placeholder-gray-500 backdrop-blur-sm border ${
                                theme === 'dark'
                                  ? 'bg-black/40 border-gray-800 hover:border-gray-600 text-white focus:border-purple-500'
                                  : 'bg-white/40 border-gray-300 hover:border-gray-400 text-gray-900 focus:border-purple-400'
                              }`}
                              required
                              disabled={isSubmitting}
                            />
                          </div>

                          {/* Email Field */}
                          <div className="space-y-2">
                            <label className={`block text-sm font-medium flex items-center gap-2 ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              <FiMail className="w-4 h-4" />
                              Email Address *
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              placeholder="Enter your email address"
                              className={`w-full px-4 py-3 rounded-xl transition placeholder-gray-500 backdrop-blur-sm border ${
                                theme === 'dark'
                                  ? 'bg-black/40 border-gray-800 hover:border-gray-600 text-white focus:border-purple-500'
                                  : 'bg-white/40 border-gray-300 hover:border-gray-400 text-gray-900 focus:border-purple-400'
                              }`}
                              required
                              disabled={isSubmitting}
                            />
                          </div>

                          {/* Phone Field */}
                          <div className="space-y-2">
                            <label className={`block text-sm font-medium flex items-center gap-2 ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              <FiPhone className="w-4 h-4" />
                              Phone Number (Optional)
                            </label>
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              placeholder="Enter your phone number"
                              className={`w-full px-4 py-3 rounded-xl transition placeholder-gray-500 backdrop-blur-sm border ${
                                theme === 'dark'
                                  ? 'bg-black/40 border-gray-800 hover:border-gray-600 text-white focus:border-purple-500'
                                  : 'bg-white/40 border-gray-300 hover:border-gray-400 text-gray-900 focus:border-purple-400'
                              }`}
                              disabled={isSubmitting}
                            />
                          </div>

                          {/* Subject Field */}
                          <div className="space-y-2">
                            <label className={`block text-sm font-medium flex items-center gap-2 ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              <FiMessageSquare className="w-4 h-4" />
                              Subject (Optional)
                            </label>
                            <input
                              type="text"
                              name="subject"
                              value={formData.subject}
                              onChange={handleChange}
                              placeholder="Enter message subject"
                              className={`w-full px-4 py-3 rounded-xl transition placeholder-gray-500 backdrop-blur-sm border ${
                                theme === 'dark'
                                  ? 'bg-black/40 border-gray-800 hover:border-gray-600 text-white focus:border-purple-500'
                                  : 'bg-white/40 border-gray-300 hover:border-gray-400 text-gray-900 focus:border-purple-400'
                              }`}
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>

                        {/* Message Field */}
                        <div className="space-y-2">
                          <label className={`block text-sm font-medium flex items-center gap-2 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            <FiMessageSquare className="w-4 h-4" />
                            Your Message *
                          </label>
                          <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Type your message here..."
                            rows="5"
                            className={`w-full px-4 py-3 rounded-xl transition placeholder-gray-500 backdrop-blur-sm resize-none border ${
                              theme === 'dark'
                                ? 'bg-black/40 border-gray-800 hover:border-gray-600 text-white focus:border-purple-500'
                                : 'bg-white/40 border-gray-300 hover:border-gray-400 text-gray-900 focus:border-purple-400'
                            }`}
                            required
                            disabled={isSubmitting}
                          />
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className={`w-full px-6 py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden ${
                            theme === 'dark'
                              ? 'bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600 text-white disabled:opacity-50'
                              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white disabled:opacity-50'
                          }`}
                        >
                          <span className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                          <span className="relative flex items-center justify-center gap-2">
                            {isSubmitting ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Sending Message...
                              </>
                            ) : (
                              <>
                                <FiSend className="w-5 h-5" />
                                Send Message
                              </>
                            )}
                          </span>
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </GlassCard>
            </div>

            {/* Contact CTA */}
            <GlassCard color="cyan" theme={theme}>
              <div className="text-center">
                <h3 className={`text-3xl font-bold mb-6 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    Ready to Collaborate?
                  </span>
                </h3>
                <p className={`text-xl mb-8 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Join our network of researchers, students, and industry partners
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                  <div className={`flex items-center space-x-3 px-6 py-4 rounded-xl border ${
                    theme === 'dark'
                      ? 'bg-black/40 border-blue-800/50'
                      : 'bg-white/40 border-blue-300/50'
                  }`}>
                    <FaEnvelope className={`text-xl ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                    <div className="text-left">
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>Email us at</p>
                      <p className={`font-semibold ${
                        theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                      }`}>research@ideaXlab.com</p>
                    </div>
                  </div>
                  
                  <div className={`flex items-center space-x-3 px-6 py-4 rounded-xl border ${
                    theme === 'dark'
                      ? 'bg-black/40 border-blue-800/50'
                      : 'bg-white/40 border-blue-300/50'
                  }`}>
                    <FaPhone className={`text-xl ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                    <div className="text-left">
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>Call us</p>
                      <p className={`font-semibold ${
                        theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                      }`}>+8801555555555</p>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
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

      {/* Footer */}
      <Footer theme={theme} />
    </div>
  );
}