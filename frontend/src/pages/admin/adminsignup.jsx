import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaShieldAlt, FaUserPlus, FaInfoCircle } from 'react-icons/fa'
import researchLabLogo from '../../assets/researchLab.jpeg'
import { toast } from 'react-toastify'

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
  const canvasRef = useRef(null)

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

    // Particle system
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

    // Geometric circles
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
      
      ctx.fillStyle = '#000000';
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
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
      />

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
          <div className="relative">
            {/* Card Glow Effect - Changed from purple to blue/cyan */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-40 transition-opacity duration-500"></div>
            
            {/* Main Card */}
            <div className="relative bg-black/60 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-gray-800/50 shadow-2xl shadow-blue-900/20">
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
                
                {/* Animated Indicator - Changed from purple to blue/cyan */}
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
                      placeholder="admin@elitelab.ai"
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
            </div>
          </div>

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