import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaShieldAlt, FaEnvelope } from 'react-icons/fa';
import researchLabLogo from '../../assets/researchLab.jpeg';
import { toast } from 'react-toastify';
import AnimatedCanvas from '../../components/animations/animatedCanvas';
import GlassCard from '../../components/ui/GlassCard';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save token and admin data to localStorage
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminData', JSON.stringify(data.data));

      toast.success('Login successful!');
      
      // Navigate to dashboard
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1000);

    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/admin/forgot-password');
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Canvas Background */}
      <AnimatedCanvas />

      {/* Back to Home Button */}
      <div className="fixed top-6 left-6 z-40">
        <Link
          to="/"
          className="group flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-300"
        >
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-gray-800 hover:border-blue-600/50 flex items-center justify-center group-hover:bg-blue-900/20 transition-all duration-300">
            <FaArrowLeft className="transform group-hover:-translate-x-1 transition-transform duration-300" />
          </div>
          <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Back to Home
          </span>
        </Link>
      </div>

      {/* Logo in Corner */}
      <div className="fixed top-6 right-6 z-40">
        <img 
          src={researchLabLogo} 
          alt="ideaXlab" 
          className="h-12 w-auto max-w-[160px] filter drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-30 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Glassmorphism Login Card */}
          <GlassCard color="blue">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-900/40 to-black/60 border border-blue-700/30 mb-6">
                <FaShieldAlt className="text-3xl text-blue-400" />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Portal</span>
              </h1>
              
              <p className="text-gray-400 font-light tracking-wide">
                Secure access to research dashboard
              </p>
              
              {/* Animated Indicator */}
              <div className="flex justify-center items-center mt-4 space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping animation-delay-200"></div>
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping animation-delay-400"></div>
              </div>
            </div>

            {/* Login Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="group">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2 ml-1 group-hover:text-blue-300 transition-colors duration-300">
                  <div className="flex items-center space-x-2">
                    <FaEnvelope className="text-blue-400" />
                    <span>Email Address</span>
                  </div>
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-4 bg-black/40 backdrop-blur-sm border border-gray-800/70 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-900/30 transition-all duration-300 pl-12 group-hover:border-blue-700/50"
                    placeholder="admin@gmail.com"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400">
                    <FaUser />
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div className="group">
                <div className="flex items-center justify-between mb-2 ml-1">
                  <label htmlFor="password" className="text-sm font-medium text-gray-300 group-hover:text-blue-300 transition-colors duration-300 flex items-center space-x-2">
                    <FaLock className="text-blue-400" />
                    <span>Password</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm font-medium text-blue-400 hover:text-cyan-400 transition-colors duration-300 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-4 bg-black/40 backdrop-blur-sm border border-gray-800/70 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-900/30 transition-all duration-300 pl-12 group-hover:border-blue-700/50"
                    placeholder="••••••••"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400">
                    <FaLock />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors duration-300"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 rounded bg-gray-900"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300 hover:text-gray-200 cursor-pointer transition-colors duration-300">
                  Remember me
                </label>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 px-4 bg-gradient-to-r from-blue-700 via-blue-800 to-cyan-800 hover:from-blue-600 hover:via-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/40 transform hover:-translate-y-1 border border-blue-700/50 relative overflow-hidden group ${
                  isLoading ? 'opacity-80 cursor-not-allowed' : ''
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <span className="relative flex items-center justify-center space-x-3">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <FaShieldAlt className="text-lg group-hover:animate-pulse" />
                      <span className="text-lg">Secure Login</span>
                    </>
                  )}
                </span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-gray-800"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
                <div className="flex-grow border-t border-gray-800"></div>
              </div>

              {/* Sign Up Link */}
              <div className="text-center">
                <p className="text-gray-400 text-sm">
                  Need admin access?{' '}
                  <Link
                    to="/admin/signup"
                    className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-300 hover:to-cyan-300 transition-all duration-300 hover:underline"
                  >
                    Request access here
                  </Link>
                </p>
              </div>
            </form>
          </GlassCard>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none"></div>
    </div>
  );
}