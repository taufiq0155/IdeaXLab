import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiKey, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiCheckCircle,
  FiAlertCircle,
  FiShield 
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import AnimatedCanvas from '../../components/animations/animatedCanvas';
import GlassCard from '../../components/ui/GlassCard';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Check password strength and criteria
  useEffect(() => {
    const checkPasswordStrength = (password) => {
      let strength = 0;
      const criteria = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[@$!%*?&]/.test(password)
      };

      setPasswordCriteria(criteria);

      // Calculate strength
      Object.values(criteria).forEach(criterion => {
        if (criterion) strength += 20;
      });

      setPasswordStrength(strength);
    };

    if (formData.newPassword) {
      checkPasswordStrength(formData.newPassword);
    } else {
      setPasswordStrength(0);
      setPasswordCriteria({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
      });
    }
  }, [formData.newPassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 20) return 'bg-red-500';
    if (passwordStrength <= 40) return 'bg-orange-500';
    if (passwordStrength <= 60) return 'bg-yellow-500';
    if (passwordStrength <= 80) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 20) return 'Very Weak';
    if (passwordStrength <= 40) return 'Weak';
    if (passwordStrength <= 60) return 'Fair';
    if (passwordStrength <= 80) return 'Good';
    return 'Excellent';
  };

  const validateForm = () => {
    if (!formData.currentPassword.trim()) {
      toast.error('Current password is required');
      return false;
    }

    if (!formData.newPassword.trim()) {
      toast.error('New password is required');
      return false;
    }

    if (!formData.confirmPassword.trim()) {
      toast.error('Confirm password is required');
      return false;
    }

    if (formData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return false;
    }

    // Check if all criteria are met
    const allCriteriaMet = Object.values(passwordCriteria).every(criterion => criterion);
    if (!allCriteriaMet) {
      toast.error('Password does not meet all security requirements');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/admin/auth/change-password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      if (data.success) {
        toast.success('Password changed successfully!');
        
        // Clear form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });

        // Optional: Logout user and redirect to login
        setTimeout(() => {
          // localStorage.removeItem('adminToken');
          // navigate('/admin/login');
        }, 2000);

      } else {
        throw new Error(data.message || 'Failed to change password');
      }

    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Canvas Background */}
      <AnimatedCanvas color="purple" />

      <div className="relative z-10 p-4 md:p-6 max-w-4xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard color="purple" className="mb-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-3 flex items-center">
                  <FiKey className="mr-3 text-purple-400" />
                  Change <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 ml-2">Password</span>
                </h2>
                <p className="text-gray-300 text-lg">
                  Update your account password for enhanced security
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="flex items-center space-x-3 p-4 bg-black/40 backdrop-blur-sm rounded-xl border border-gray-800/70">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></div>
                    <div className="w-2 h-2 rounded-full bg-pink-500 animate-ping animation-delay-200"></div>
                  </div>
                  <span className="text-sm font-medium text-purple-400">
                    Security Status: <span className="text-white">Active</span>
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Password Change Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Left Column - Security Info */}
          <div className="lg:col-span-1 space-y-6">
            <GlassCard color="blue" className="h-full">
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                    <FiShield className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-bold">Security Tips</h3>
                    <p className="text-gray-400 text-sm">Follow these best practices</p>
                  </div>
                </div>

                <ul className="space-y-4">
                  {[
                    { text: 'Use at least 8 characters', icon: <FiCheckCircle className="text-green-500" /> },
                    { text: 'Include uppercase & lowercase letters', icon: <FiCheckCircle className="text-green-500" /> },
                    { text: 'Add numbers and special characters', icon: <FiCheckCircle className="text-green-500" /> },
                    { text: 'Avoid common words & patterns', icon: <FiAlertCircle className="text-yellow-500" /> },
                    { text: 'Don\'t reuse old passwords', icon: <FiAlertCircle className="text-yellow-500" /> },
                    { text: 'Change password every 90 days', icon: <FiAlertCircle className="text-blue-500" /> }
                  ].map((tip, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="mt-1">{tip.icon}</div>
                      <span className="text-gray-300 text-sm">{tip.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </GlassCard>

            <GlassCard color="green" className="h-full">
              <div className="p-6">
                <h4 className="text-white font-semibold mb-4">Password Requirements</h4>
                <div className="space-y-3">
                  {Object.entries(passwordCriteria).map(([key, met]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300 capitalize">
                        {key === 'special' ? 'Special Character' : key}
                      </span>
                      {met ? (
                        <FiCheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <FiAlertCircle className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Right Column - Change Password Form */}
          <div className="lg:col-span-2">
            <GlassCard color="purple">
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                      <FiLock className="mr-2" />
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-3 pl-12 bg-black/40 backdrop-blur-sm border border-gray-800/70 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-900/30 transition-all duration-300"
                        placeholder="Enter your current password"
                        required
                      />
                      <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showCurrentPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-3 pl-12 bg-black/40 backdrop-blur-sm border border-gray-800/70 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-900/30 transition-all duration-300"
                        placeholder="Create a new strong password"
                        required
                      />
                      <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showNewPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    {formData.newPassword && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">Password Strength</span>
                          <span className={`font-medium ${
                            passwordStrength <= 40 ? 'text-red-400' :
                            passwordStrength <= 60 ? 'text-yellow-400' :
                            passwordStrength <= 80 ? 'text-blue-400' : 'text-green-400'
                          }`}>
                            {getStrengthText()}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${getStrengthColor()}`}
                            style={{ width: `${passwordStrength}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-3 pl-12 bg-black/40 backdrop-blur-sm border border-gray-800/70 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-900/30 transition-all duration-300"
                        placeholder="Re-enter your new password"
                        required
                      />
                      <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                    </div>
                    {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                      <p className="text-red-400 text-sm mt-2 flex items-center">
                        <FiAlertCircle className="mr-2" />
                        Passwords do not match
                      </p>
                    )}
                    {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                      <p className="text-green-400 text-sm mt-2 flex items-center">
                        <FiCheckCircle className="mr-2" />
                        Passwords match
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                          Updating Password...
                        </>
                      ) : (
                        <>
                          <FiKey className="mr-3" />
                          Change Password
                        </>
                      )}
                    </button>
                  </div>

                  {/* Security Note */}
                  <div className="mt-6 p-4 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/50">
                    <p className="text-sm text-gray-400 text-center">
                      <FiAlertCircle className="inline mr-2 text-yellow-500" />
                      For security reasons, you'll need to re-login after changing your password
                    </p>
                  </div>
                </form>
              </div>
            </GlassCard>
          </div>
        </motion.div>
      </div>

      {/* Bottom Gradient */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none z-0"></div>
    </div>
  );
}