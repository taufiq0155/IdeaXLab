import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiMail,
  FiUser,
  FiPhone,
  FiMessageSquare,
  FiSend,
  FiMapPin,
  FiUsers,
  FiClock,
} from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";
import GlassCard from "../../../components/ui/GlassCard";
import StatsCard from "../../../components/ui/StatsCard";
import AnimatedCanvas from "../../../components/animations/animatedCanvas";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get admin data from localStorage
  useEffect(() => {
    const adminData = localStorage.getItem('adminData');
    if (adminData) {
      setAdmin(JSON.parse(adminData));
    } else {
      setAdmin({
        fullName: "Admin User",
        name: "Admin User",
        email: "admin@example.com",
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit clicked!");
    console.log("Form data:", formData);

    // Validation
    if (!formData.name.trim()) {
      toast.error("Please enter name");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Please enter email");
      return;
    }
    if (!formData.message.trim()) {
      toast.error("Please enter message");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    console.log("Starting submission...");

    try {
      const response = await fetch('http://localhost:5000/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || "",
          subject: formData.subject.trim() || "General Inquiry",
          message: formData.message.trim(),
        }),
      });

      console.log("Response status:", response.status);
      
      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok && data.success) {
        toast.success(data.message || "Message sent successfully!");
        
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
        
        console.log("Form reset successfully");
      } else {
        let errorMsg = data.message || "Failed to send message";
        if (data.errors && data.errors.length > 0) {
          errorMsg = data.errors.map(err => err.msg).join(", ");
        }
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error("Network/Request error:", error);
      toast.error(error.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
      console.log("Submission finished");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        <AnimatedCanvas />
        <div className="relative z-10 p-4 md:p-6 flex items-center justify-center h-screen">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151',
          },
        }}
      />
      <AnimatedCanvas />

      <div className="relative z-10 p-4 md:p-6">
        {/* Welcome Card */}
        <GlassCard className="mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Contact Management
              </h2>
              <p className="text-gray-300 text-lg">
                Send messages and manage your contact information
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-3 p-4 bg-black/40 backdrop-blur-sm rounded-xl border border-gray-800/70">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping animation-delay-200"></div>
                </div>
                <span className="text-sm font-medium text-blue-400">
                  Contact System: <span className="text-green-400">Active</span>
                </span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Stats Grid - Simplified */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatsCard
            label="Send Message"
            value="Form"
            icon={<FiMail className="w-6 h-6" />}
            color="blue"
            className="animate-floating"
          />
          <StatsCard
            label="Admin"
            value={admin?.fullName?.split(' ')[0] || "Admin"}
            icon={<FiUser className="w-6 h-6" />}
            color="cyan"
            className="animate-floating"
            style={{ animationDelay: "100ms" }}
          />
        </div>

        {/* Main Contact Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Contact Form */}
          <div className="lg:col-span-2">
            <GlassCard className="p-6">
              {/* Admin Info Header */}
              <div className="flex items-center justify-between mb-8 p-4 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-cyan-600/10 rounded-xl border border-blue-500/20">
                <div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {admin?.fullName?.charAt(0) || admin?.name?.charAt(0) || "A"}
                    </div>
                    <div>
                      <p className="text-sm font-[700] text-white truncate">
                        {admin?.fullName || admin?.name || "Admin"}
                      </p>
                      <p className="text-xs text-gray-400 font-[600] truncate mt-0.5">
                        {admin?.email || "admin@example.com"}
                      </p>
                    </div>
                  </motion.div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Send New Message</p>
                  <p className="text-white font-semibold">Contact Form</p>
                </div>
              </div>

              {/* Send Message Header */}
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-white mb-3 flex items-center justify-center gap-2">
                  <FiMail className="w-8 h-8 text-blue-400" />
                  Send Message
                </h2>
                <p className="text-gray-400 text-lg">
                  Get in touch with your contacts directly
                </p>
              </div>

              {/* Contact Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                      <FiUser className="w-4 h-4" />
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter contact's full name"
                      className="w-full px-4 py-3 bg-black/40 border border-gray-800 hover:border-gray-600 rounded-xl text-white focus:border-blue-500 transition placeholder-gray-500 backdrop-blur-sm"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                      <FiMail className="w-4 h-4" />
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter contact's email address"
                      className="w-full px-4 py-3 bg-black/40 border border-gray-800 hover:border-gray-600 rounded-xl text-white focus:border-blue-500 transition placeholder-gray-500 backdrop-blur-sm"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                      <FiPhone className="w-4 h-4" />
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter contact's phone number"
                      className="w-full px-4 py-3 bg-black/40 border border-gray-800 hover:border-gray-600 rounded-xl text-white focus:border-blue-500 transition placeholder-gray-500 backdrop-blur-sm"
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Subject Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                      <FiMessageSquare className="w-4 h-4" />
                      Subject (Optional)
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Enter message subject"
                      className="w-full px-4 py-3 bg-black/40 border border-gray-800 hover:border-gray-600 rounded-xl text-white focus:border-blue-500 transition placeholder-gray-500 backdrop-blur-sm"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Message Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                    <FiMessageSquare className="w-4 h-4" />
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Type your message here..."
                    rows="6"
                    className="w-full px-4 py-3 bg-black/40 border border-gray-800 hover:border-gray-600 rounded-xl text-white focus:border-blue-500 transition placeholder-gray-500 resize-none backdrop-blur-sm"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 group relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                  <span className="relative flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
            </GlassCard>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Contact Information Card */}
            <GlassCard className="p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <FiMail className="w-4 h-4" />
                Your Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-gray-800">
                  <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <FiUser className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Admin Name</p>
                    <p className="text-white font-medium">
                      {admin?.fullName || admin?.name || "Admin User"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-gray-800">
                  <div className="w-10 h-10 bg-cyan-600/20 rounded-lg flex items-center justify-center">
                    <FiMail className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Admin Email</p>
                    <p className="text-white font-medium">
                      {admin?.email || "admin@example.com"}
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Instructions Card */}
            <GlassCard className="p-6 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-cyan-600/10 border-blue-500/20">
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <FiMessageSquare className="w-4 h-4" />
                Instructions
              </h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Fill all required fields (*)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Enter valid email address</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Message should be at least 10 characters</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Messages appear in Contacted Users section</span>
                </li>
              </ul>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none"></div>
    </div>
  );
};

export default Contact;