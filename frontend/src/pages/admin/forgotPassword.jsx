import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEnvelope, FaCheckCircle, FaKey, FaLock, FaEye, FaEyeSlash, FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';
import researchLabLogo from '../../assets/researchLab.jpeg';
import { toast } from 'react-toastify';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [resendEnabled, setResendEnabled] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const inputRefs = useRef([]);

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

    // FIXED: Added Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width / dpr;
        this.y = Math.random() * canvas.height / dpr;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.color = Math.random() > 0.5 ? '#60a5fa' : '#3b82f6';
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
          this.x = Math.random() * canvas.width / dpr;
          this.y = Math.random() * canvas.height / dpr;
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

    // FIXED: Added GeometricCircle class
    class GeometricCircle {
      constructor() {
        this.x = Math.random() * canvas.width / dpr;
        this.y = Math.random() * canvas.height / dpr;
        this.radius = Math.random() * 70 + 50;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = Math.random() * 0.002 - 0.001;
        this.segments = Math.floor(Math.random() * 8) + 6;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.01 + 0.005;
        this.color = Math.random() > 0.5 ? 'rgba(59, 130, 246, 0.07)' : 'rgba(30, 64, 175, 0.1)';
        this.currentRadius = this.radius;
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

    // Connection lines
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
          ctx.beginPath();
          ctx.strokeStyle = `rgba(96, 165, 250, ${this.opacity})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(this.p1.x, this.p1.y);
          ctx.lineTo(this.p2.x, this.p2.y);
          ctx.stroke();
        }
      }
    }

    // Initialize
    const particles = Array.from({ length: 100 }, () => new Particle());
    const circles = Array.from({ length: 6 }, () => new GeometricCircle());
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
        centerX, centerY, 500
      );
      gradient.addColorStop(0, 'rgba(30, 64, 175, 0.15)');
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

  // Countdown timer for resend email
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setResendEnabled(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  // Step 1: Send verification email
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send verification code');
      }

      toast.success('Verification code sent to your email!');
      setStep(2);
      setCountdown(60);
      setResendEnabled(false);

    } catch (error) {
      console.error('Send email error:', error);
      toast.error(error.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify code
  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    
    const code = verificationCode.join('');
    if (code.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/auth/verify-reset-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          code 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid verification code');
      }

      setResetToken(data.resetToken);
      toast.success('Code verified successfully!');
      setStep(3);

    } catch (error) {
      console.error('Verification error:', error);
      toast.error(error.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset password
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          resetToken,
          newPassword,
          confirmPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      toast.success('Password reset successful!');
      
      setTimeout(() => {
        navigate('/admin/login');
      }, 2000);

    } catch (error) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend verification code
  const handleResendCode = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/auth/resend-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend code');
      }

      toast.success('New verification code sent!');
      setCountdown(60);
      setResendEnabled(false);
      
      setVerificationCode(['', '', '', '', '', '']);
      
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }

    } catch (error) {
      console.error('Resend error:', error);
      toast.error(error.message || 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle code input
  // Handle code input - FIXED VERSION (remove auto-submit)
const handleCodeChange = (index, value) => {
  if (!/^\d?$/.test(value)) return;
  
  const newCode = [...verificationCode];
  newCode[index] = value;
  setVerificationCode(newCode);
  
  if (value && index < 5) {
    setTimeout(() => {
      inputRefs.current[index + 1]?.focus();
    }, 10);
  }
  
  // REMOVED: Auto-submit on 6th digit
  // This was causing the issue
};

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      setTimeout(() => {
        inputRefs.current[index - 1]?.focus();
      }, 10);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 6).split('');
    
    if (digits.length === 6) {
      const newCode = [...verificationCode];
      digits.forEach((digit, index) => {
        newCode[index] = digit;
      });
      setVerificationCode(newCode);
      
      setTimeout(() => {
        if (inputRefs.current[5]) {
          inputRefs.current[5].focus();
        }
      }, 10);
    }
  };

  const stepIcons = [
    { icon: FaEnvelope, title: 'Email', desc: 'Enter your email address' },
    { icon: FaCheckCircle, title: 'Verification', desc: 'Enter the 6-digit code' },
    { icon: FaKey, title: 'Password', desc: 'Set your new password' }
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
      />

      <div className="fixed top-6 left-6 z-40">
        <Link
          to="/admin/login"
          className="group flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-300"
        >
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-gray-800 hover:border-blue-600/50 flex items-center justify-center group-hover:bg-blue-900/20 transition-all duration-300">
            <FaArrowLeft className="transform group-hover:-translate-x-1 transition-transform duration-300" />
          </div>
          <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Back to Login
          </span>
        </Link>
      </div>

      <div className="fixed top-6 right-6 z-40">
        <img 
          src={researchLabLogo} 
          alt="EliteLab.AI Logo" 
          className="h-12 w-auto max-w-[160px] filter drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
        />
      </div>

      <div className="relative z-30 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
            
            <div className="relative bg-black/60 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-gray-800/50 shadow-2xl shadow-blue-900/20">
              
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-900/40 to-black/60 border border-blue-700/30 mb-6">
                  {step === 1 && <FaEnvelope className="text-3xl text-blue-400" />}
                  {step === 2 && <FaCheckCircle className="text-3xl text-cyan-400" />}
                  {step === 3 && <FaKey className="text-3xl text-green-400" />}
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  {step === 1 && 'Forgot Password'}
                  {step === 2 && 'Verification'}
                  {step === 3 && 'New Password'}
                </h1>
                
                <p className="text-gray-400 font-light tracking-wide mb-6">
                  {step === 1 && 'Enter your email to receive reset instructions'}
                  {step === 2 && `Enter the 6-digit code sent to ${email}`}
                  {step === 3 && 'Create your new password'}
                </p>

                <div className="flex justify-center items-center mb-8">
                  {stepIcons.map((stepInfo, index) => (
                    <div key={index} className="flex items-center">
                      <div className={`flex flex-col items-center ${index < step ? 'text-blue-400' : 'text-gray-600'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${index < step ? 'border-blue-500 bg-blue-900/30' : 'border-gray-700 bg-gray-900/30'}`}>
                          <stepInfo.icon className="text-lg" />
                        </div>
                        <span className="text-xs mt-2">{stepInfo.title}</span>
                      </div>
                      {index < 2 && (
                        <div className={`w-12 h-0.5 mx-2 ${index < step - 1 ? 'bg-blue-500' : 'bg-gray-700'}`}></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {step === 1 && (
                <form className="space-y-6" onSubmit={handleEmailSubmit}>
                  <div className="group">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2 ml-1">
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
                        className="w-full px-4 py-4 bg-black/40 backdrop-blur-sm border border-gray-800/70 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-900/30 transition-all duration-300 pl-12"
                        placeholder="admin@elitelab.ai"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400">
                        <FaEnvelope />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-4 px-4 bg-gradient-to-r from-blue-700 via-blue-800 to-cyan-800 text-white font-bold rounded-xl transition-all duration-300 border border-blue-700/50 relative overflow-hidden group ${
                      isLoading ? 'opacity-80 cursor-not-allowed' : 'hover:-translate-y-1'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <span className="relative flex items-center justify-center space-x-3">
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <FaEnvelope className="text-lg" />
                          <span className="text-lg">Send Verification Code</span>
                        </>
                      )}
                    </span>
                  </button>
                </form>
              )}

              {step === 2 && (
                <form className="space-y-6" onSubmit={handleVerificationSubmit}>
                  <div className="text-center mb-6">
                    <p className="text-gray-300 mb-4">Enter the 6-digit verification code</p>
                    
                    <div className="flex justify-center space-x-3 mb-8" onPaste={handlePaste}>
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <input
                          key={index}
                          ref={el => inputRefs.current[index] = el}
                          type="text"
                          inputMode="numeric"
                          maxLength="1"
                          value={verificationCode[index]}
                          onChange={(e) => handleCodeChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          onFocus={(e) => e.target.select()}
                          className="w-14 h-14 bg-black/40 backdrop-blur-sm border border-gray-800/70 rounded-xl text-white text-center text-2xl font-bold focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-900/30"
                        />
                      ))}
                    </div>

                    <div className="text-gray-400 text-sm mb-6">
                      {countdown > 0 ? (
                        <p className="flex items-center justify-center space-x-2">
                          <FaExclamationTriangle className="text-yellow-500" />
                          <span>Resend code in <span className="text-blue-400 font-bold">{countdown}s</span></span>
                        </p>
                      ) : (
                        <p>Didn't receive the code?</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button
                      type="submit"
                      disabled={isLoading || verificationCode.join('').length !== 6}
                      className={`w-full py-4 px-4 bg-gradient-to-r from-blue-700 via-blue-800 to-cyan-800 text-white font-bold rounded-xl transition-all duration-300 border border-blue-700/50 relative overflow-hidden group ${
                        isLoading || verificationCode.join('').length !== 6 ? 'opacity-80 cursor-not-allowed' : 'hover:-translate-y-1'
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      <span className="relative flex items-center justify-center space-x-3">
                        {isLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <>
                            <FaCheckCircle className="text-lg" />
                            <span className="text-lg">Verify Code</span>
                          </>
                        )}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={!resendEnabled || isLoading}
                      className={`w-full py-3 px-4 bg-transparent border-2 ${
                        resendEnabled ? 'border-blue-600 hover:border-blue-500 text-blue-400 hover:text-blue-300' : 'border-gray-700 text-gray-500 cursor-not-allowed'
                      } font-bold rounded-xl transition-all duration-300`}
                    >
                      Resend Code
                    </button>
                  </div>
                </form>
              )}

              {step === 3 && (
                <form className="space-y-6" onSubmit={handlePasswordReset}>
                  <div className="space-y-6">
                    <div className="group">
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2 ml-1">
                        <div className="flex items-center space-x-2">
                          <FaLock className="text-blue-400" />
                          <span>New Password</span>
                        </div>
                      </label>
                      <div className="relative">
                        <input
                          id="newPassword"
                          name="newPassword"
                          type={showPassword ? "text" : "password"}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-4 bg-black/40 backdrop-blur-sm border border-gray-800/70 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-900/30 pl-12"
                          placeholder="Enter new password"
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400">
                          <FaKey />
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div className="group">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2 ml-1">
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
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-4 bg-black/40 backdrop-blur-sm border border-gray-800/70 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-900/30 pl-12"
                          placeholder="Confirm new password"
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400">
                          <FaShieldAlt />
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400"
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-4 px-4 bg-gradient-to-r from-green-700 via-green-800 to-cyan-800 text-white font-bold rounded-xl transition-all duration-300 border border-green-700/50 relative overflow-hidden group ${
                      isLoading ? 'opacity-80 cursor-not-allowed' : 'hover:-translate-y-1'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <span className="relative flex items-center justify-center space-x-3">
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <FaShieldAlt className="text-lg" />
                          <span className="text-lg">Reset Password</span>
                        </>
                      )}
                    </span>
                  </button>

                  {newPassword && (
                    <div className="mt-4 p-4 bg-blue-900/20 rounded-xl border border-blue-800/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-300">Password Strength</span>
                        <span className={`text-sm font-medium ${
                          newPassword.length >= 8 ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {newPassword.length >= 8 ? 'Strong' : 'Weak'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            newPassword.length >= 8 ? 'bg-green-500 w-full' : 'bg-yellow-500 w-1/2'
                          }`}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Password must be at least 8 characters long
                      </p>
                    </div>
                  )}
                </form>
              )}

              <div className="mt-8 pt-6 border-t border-gray-800/50">
                <div className="text-center">
                  <Link
                    to="/admin/login"
                    className="text-sm font-medium text-gray-400 hover:text-blue-400 transition-colors duration-300 flex items-center justify-center space-x-2"
                  >
                    <FaArrowLeft className="text-xs" />
                    <span>Back to login</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none"></div>
    </div>
  );
}