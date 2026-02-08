import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaShieldAlt, FaUserPlus, FaInfoCircle } from 'react-icons/fa'
import researchLabLogo from '../../assets/researchLab.jpeg'
import { toast } from 'react-toastify'
import AnimatedCanvas from '../../components/animations/animatedCanvas'
import GlassCard from '../../components/ui/GlassCard'

export default function AdminSignup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }

    if (!/^[A-Za-z\s]+$/.test(formData.fullName)) {
      toast.error('Full name should only contain letters and spaces')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      toast.error('Password must contain uppercase, lowercase, number, and special character')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Check if it's superAdmin or regular admin
      const isSuperAdmin = data.message.includes('SuperAdmin');
      
      if (isSuperAdmin) {
        toast.success('SuperAdmin account created! You can now login.');
        setTimeout(() => {
          navigate('/admin/login');
        }, 2000);
      } else {
        toast.success('Registration successful! Your account is pending approval.');
        setTimeout(() => {
          navigate('/admin/login');
        }, 2000);
      }

    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

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
          alt="EliteLab.AI Logo" 
          className="h-12 w-auto max-w-[160px] filter drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-30 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Glassmorphism Signup Card */}
          <GlassCard color="blue">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-900/40 to-black/60 border border-blue-700/30 mb-6">
                <FaUserPlus className="text-3xl text-blue-400" />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Registration</span>
              </h1>
              
              <p className="text-gray-400 font-light tracking-wide">
                Create your secure research dashboard access
              </p>
              
              {/* Animated Indicator */}
              <div className="flex justify-center items-center mt-4 space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping animation-delay-200"></div>
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping animation-delay-400"></div>
              </div>
            </div>

            {/* Signup Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Full Name Field */}
              <div className="group">
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2 ml-1 group-hover:text-blue-300 transition-colors duration-300">
                  <div className="flex items-center space-x-2">
                    <FaUser className="text-blue-400" />
                    <span>Full Name</span>
                  </div>
                </label>
                <div className="relative">
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-black/40 backdrop-blur-sm border border-gray-800/70 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-900/30 transition-all duration-300 pl-12 group-hover:border-blue-700/50"
                    placeholder="Dr. John Smith"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400">
                    <FaUser />
                  </div>
                </div>
              </div>

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
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-black/40 backdrop-blur-sm border border-gray-800/70 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-900/30 transition-all duration-300 pl-12 group-hover:border-blue-700/50"
                    placeholder="admin@gmail.com"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400">
                    <FaEnvelope />
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
                    onClick={() => setShowPasswordRequirements(!showPasswordRequirements)}
                    className="flex items-center space-x-1 text-sm font-medium text-blue-400 hover:text-cyan-400 transition-colors duration-300"
                  >
                    <FaInfoCircle className="text-xs" />
                    <span>{showPasswordRequirements ? 'Hide Requirements' : 'Show Requirements'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
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

              {/* Confirm Password Field */}
              <div className="group">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2 ml-1 group-hover:text-blue-300 transition-colors duration-300">
                  <div className="flex items-center space-x-2">
                    <FaLock className="text-blue-400" />
                    <span>Confirm Password</span>
                  </div>
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-black/40 backdrop-blur-sm border border-gray-800/70 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-900/30 transition-all duration-300 pl-12 group-hover:border-blue-700/50"
                    placeholder="••••••••"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400">
                    <FaLock />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors duration-300"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              {showPasswordRequirements && (
                <div className="mt-4 p-4 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-xl border border-blue-800/30 animate-fadeIn">
                  <p className="text-sm font-medium text-blue-300 mb-3">Password must include:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { text: '8+ characters', valid: formData.password.length >= 8 },
                      { text: 'Uppercase letter', valid: /[A-Z]/.test(formData.password) },
                      { text: 'Lowercase letter', valid: /[a-z]/.test(formData.password) },
                      { text: 'Number', valid: /\d/.test(formData.password) },
                      { text: 'Special character', valid: /[!@#$%^&*]/.test(formData.password) },
                      { text: 'Passwords match', valid: formData.password === formData.confirmPassword && formData.password !== '' }
                    ].map((req, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${req.valid ? 'bg-green-500' : 'bg-gray-700'}`}></div>
                        <span className={`text-xs ${req.valid ? 'text-green-400' : 'text-gray-500'}`}>
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Terms Checkbox */}
              <div className="flex items-start space-x-3">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 rounded bg-gray-900 mt-1 flex-shrink-0"
                />
                <label htmlFor="terms" className="text-sm text-gray-300 leading-tight cursor-pointer hover:text-gray-200 transition-colors duration-300">
                  I agree to the{' '}
                  <Link to="/terms" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-300">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-300">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Create Account Button */}
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
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <FaUserPlus className="text-lg group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-lg">Create Admin Account</span>
                    </>
                  )}
                </span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-gray-800"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-sm">ALREADY HAVE ACCESS?</span>
                <div className="flex-grow border-t border-gray-800"></div>
              </div>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-gray-400 text-sm">
                  Already have an admin account?{' '}
                  <Link
                    to="/admin/login"
                    className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-300 hover:to-cyan-300 transition-all duration-300 hover:underline"
                  >
                    Login here
                  </Link>
                </p>
              </div>
            </form>
          </GlassCard>

          {/* Bottom Info */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              <FaShieldAlt className="inline mr-1 text-blue-500/50" />
              For security purposes, all admin registrations require verification
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none"></div>
    </div>
  )
}