/* eslint-disable no-unused-vars */
// Footer.jsx
import React from "react";
import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

// Import your logo - adjust the path as needed
import IdeaXLabLogo from '../assets/researchLab.jpeg'; // or wherever your logo is stored

const Footer = () => {
  const footerSections = [
    {
      title: "Company",
      links: [
        { label: "About", to: "/about" },
        { label: "Careers", to: "#" },
        { label: "Press", to: "#" },
        { label: "Contact Us", to: "/contact" },
      ],
    },
    {
      title: "Useful Links",
      links: [
        { label: "Features", to: "/features" },
        { label: "Resources", to: "#" },
        { label: "Service", to: "#" },
        { label: "Team", to: "#" },
      ],
    },
    {
      title: "Contact",
      links: [
        { label: "Live Chat", to: "#" },
        { label: "Facebook", to: "#" },
        { label: "LinkedIn", to: "#" },
        { label: "support@elitelab.ai", to: "mailto:support@elitelab.ai" },
      ],
    },
  ];

  const socialLinks = [
    { name: "Facebook", icon: <FaFacebookF />, url: "#" },
    { name: "Twitter", icon: <FaTwitter />, url: "#" },
    { name: "Instagram", icon: <FaInstagram />, url: "#" },
    { name: "LinkedIn", icon: <FaLinkedinIn />, url: "#" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <footer className="bg-black/95 backdrop-blur-xl relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Consistent Container */}
      <div className="w-full container mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="flex flex-col md:flex-row justify-between gap-6"
        >
          {/* Brand Section with IdeaXLab Logo */}
          <motion.div variants={itemVariants} className="md:max-w-sm">
            <div className="flex items-center space-x-2 mb-2">
              <NavLink to="/" className="flex items-center space-x-2 group">
                <div className="flex items-center space-x-2">
                  {/* Your IdeaXLab Logo */}
                  <img 
                    src={IdeaXLabLogo} 
                    alt="IdeaXLab Logo" 
                    className="h-10 w-auto"
                  />
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    IdeaXLab
                  </span>
                </div>
              </NavLink>
            </div>
            <p className="text-gray-400 mb-3 leading-relaxed text-sm">
              Advancing AI through research and innovation. Creating transparent, 
              interpretable, and accessible artificial intelligence solutions.
            </p>

            {/* Social Icons */}
            <div className="flex space-x-2">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-purple-600/20 hover:border-purple-500/30 transition-all duration-300 backdrop-blur-sm text-sm"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Links Sections - All three in one container with reduced gap */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-end gap-4 md:gap-6 pr-0"
          >
            {footerSections.map((section, sectionIndex) => (
              <div key={section.title} className="min-w-[120px]">
                <h4 className="text-sm font-semibold mb-2 text-white">
                  {section.title}
                </h4>
                <ul className="space-y-1">
                  {section.links.map((link, linkIndex) => (
                    <motion.li
                      key={link.label}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: sectionIndex * 0.1 + linkIndex * 0.05,
                      }}
                      viewport={{ once: true }}
                    >
                      {link.to.startsWith("mailto:") ? (
                        <a
                          href={link.to}
                          className="text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-1 block group text-xs"
                        >
                          <span className="relative">
                            {link.label}
                            <span className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-purple-400 to-blue-400 group-hover:w-full transition-all duration-300"></span>
                          </span>
                        </a>
                      ) : link.to === "#" ? (
                        <a
                          href={link.to}
                          className="text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-1 block group text-xs"
                        >
                          <span className="relative">
                            {link.label}
                            <span className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-purple-400 to-blue-400 group-hover:w-full transition-all duration-300"></span>
                          </span>
                        </a>
                      ) : (
                        <Link
                          to={link.to}
                          className="text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-1 block group text-xs"
                        >
                          <span className="relative">
                            {link.label}
                            <span className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-purple-400 to-blue-400 group-hover:w-full transition-all duration-300"></span>
                          </span>
                        </Link>
                      )}
                    </motion.li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="border-t border-white/10 mt-4 pt-4 text-center"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="flex space-x-3 text-xs text-gray-400">
              <a
                href="#"
                className="hover:text-white transition-colors duration-300"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="hover:text-white transition-colors duration-300"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="hover:text-white transition-colors duration-300"
              >
                Cookies
              </a>
            </div>
            <p className="text-gray-400 text-xs">
              Copyright © {new Date().getFullYear()}{" "}
              <strong className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                IdeaXLab
              </strong>
              . All rights reserved.
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;