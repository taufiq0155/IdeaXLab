import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";
import researchLabLogo from "../../assets/researchLab.jpeg";

const Footer = ({ theme = "dark" }) => {
  const isDark = theme === "dark";

  return (
    <footer
      className={`relative overflow-hidden border-t ${
        isDark ? "bg-black/95 border-blue-900/30" : "bg-white border-blue-100"
      }`}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={`absolute bottom-0 left-0 w-72 h-72 rounded-full blur-3xl ${
            isDark ? "bg-blue-500/10" : "bg-blue-300/20"
          }`}
        ></div>
        <div
          className={`absolute bottom-0 right-0 w-64 h-64 rounded-full blur-3xl ${
            isDark ? "bg-cyan-500/10" : "bg-cyan-300/20"
          }`}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <img src={researchLabLogo} alt="IdeaXLab" className="h-11 w-11 rounded-full" />
              <div>
                <p className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>IdeaXLab</p>
                <p className={`text-xs ${isDark ? "text-blue-300" : "text-blue-700"}`}>AI Research Lab</p>
              </div>
            </div>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Advancing AI through transparent and interpretable research with real-world impact.
            </p>
          </div>

          <div>
            <p className={`font-semibold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>Quick Links</p>
            <div className="space-y-2">
              <Link to="/" className={`block text-sm ${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}>Home</Link>
              <Link to="/blogs" className={`block text-sm ${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}>Blogs</Link>
              <Link to="/team" className={`block text-sm ${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}>Team</Link>
              <Link to="/admin/login" className={`block text-sm ${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}>Admin Login</Link>
            </div>
          </div>

          <div>
            <p className={`font-semibold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>Follow Us</p>
            <div className="flex items-center gap-2 mb-4">
              {[
                { icon: <FaFacebookF />, href: "#" },
                { icon: <FaTwitter />, href: "#" },
                { icon: <FaInstagram />, href: "#" },
                { icon: <FaLinkedinIn />, href: "#" },
              ].map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${
                    isDark
                      ? "border-gray-800 text-gray-400 hover:text-white hover:bg-blue-900/20"
                      : "border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-blue-100"
                  }`}
                >
                  {item.icon}
                </a>
              ))}
            </div>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>research@ideaXlab.com</p>
          </div>
        </div>

        <div className={`mt-8 pt-5 border-t flex flex-col md:flex-row justify-between gap-2 text-xs ${
          isDark ? "border-gray-800 text-gray-500" : "border-gray-200 text-gray-500"
        }`}>
          <p>Copyright {new Date().getFullYear()} IdeaXLab. All rights reserved.</p>
          <p>Built for transparent AI research.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
