import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBars, FaChevronDown, FaMoon, FaSun, FaTimes, FaUser } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import researchLabLogo from "../../assets/researchLab.jpeg";

const VisitorHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTeamMenuOpen, setIsTeamMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Home", to: "/" },
    { label: "Blog", to: "/blogs" },
    { label: "Projects", to: "/projects" },
    { label: "Services", to: "/services" },
    { label: "Contact", to: "/#contact" },
  ];

  const teamCategories = [
    { label: "Research Team", slug: "research-team" },
    { label: "Development Team", slug: "development-team" },
    { label: "Innovation Team", slug: "innovation-team" },
  ];

  const handleNav = (to) => {
    if (to.startsWith("/#")) {
      const targetId = to.replace("/#", "");
      if (location.pathname === "/") {
        const targetEl = document.getElementById(targetId);
        if (targetEl) targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        navigate("/", { replace: false });
        setTimeout(() => {
          const targetEl = document.getElementById(targetId);
          if (targetEl) targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 250);
      }
      setIsMenuOpen(false);
      setIsTeamMenuOpen(false);
      return;
    }

    navigate(to);
    setIsMenuOpen(false);
    setIsTeamMenuOpen(false);
  };

  const handleTeamCategory = (category) => {
    navigate(`/team/${category}`);
    setIsMenuOpen(false);
    setIsTeamMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 w-full z-40 transition-all duration-300 border-b ${
        isScrolled
          ? theme === "dark"
            ? "bg-black/90 border-blue-900/30 backdrop-blur-xl shadow-xl shadow-blue-900/20"
            : "bg-white/95 border-blue-200/60 backdrop-blur-xl shadow-lg shadow-blue-200/40"
          : theme === "dark"
          ? "bg-black/75 border-transparent backdrop-blur-sm"
          : "bg-white/85 border-transparent backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-20 flex items-center justify-between">
          <button
            type="button"
            onClick={() => handleNav("/")}
            className="flex items-center gap-3"
          >
            <img src={researchLabLogo} alt="IdeaXLab Logo" className="h-12 w-auto rounded-full" />
            <div className="text-left">
              <p className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                IdeaXLab
              </p>
              <p className={`text-xs ${theme === "dark" ? "text-blue-300" : "text-blue-700"}`}>
                Research & Innovation
              </p>
            </div>
          </button>

          <div className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive =
                !item.to.startsWith("/#") &&
                (location.pathname === item.to ||
                  (item.to === "/" && location.pathname === "/"));

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleNav(item.to)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? theme === "dark"
                        ? "bg-blue-900/40 text-white"
                        : "bg-blue-100 text-blue-700"
                      : theme === "dark"
                      ? "text-gray-300 hover:text-white hover:bg-blue-900/20"
                      : "text-gray-700 hover:text-gray-900 hover:bg-blue-100/70"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}

            <div className="relative group">
              <button
                type="button"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-2 ${
                  location.pathname.startsWith("/team")
                    ? theme === "dark"
                      ? "bg-blue-900/40 text-white"
                      : "bg-blue-100 text-blue-700"
                    : theme === "dark"
                    ? "text-gray-300 hover:text-white hover:bg-blue-900/20"
                    : "text-gray-700 hover:text-gray-900 hover:bg-blue-100/70"
                }`}
              >
                Team
                <FaChevronDown className="text-xs" />
              </button>
              <div
                className={`absolute left-0 top-full mt-2 w-52 rounded-xl border p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all ${
                  theme === "dark"
                    ? "bg-black/95 border-gray-800"
                    : "bg-white/95 border-gray-200 shadow-lg"
                }`}
              >
                {teamCategories.map((item) => (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => handleTeamCategory(item.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      theme === "dark"
                        ? "text-gray-200 hover:bg-blue-900/30"
                        : "text-gray-800 hover:bg-blue-100"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2.5 rounded-lg border transition-all ${
                theme === "dark"
                  ? "text-yellow-300 border-gray-700/60 bg-gray-800/60 hover:bg-gray-700/60"
                  : "text-blue-700 border-gray-200 bg-white hover:bg-gray-100"
              }`}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <FaSun /> : <FaMoon />}
            </button>

            <Link
              to="/admin/login"
              className={`ml-1 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all flex items-center gap-2 ${
                theme === "dark"
                  ? "bg-gradient-to-r from-blue-700 to-cyan-700 hover:from-blue-600 hover:to-cyan-600"
                  : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500"
              }`}
            >
              <FaUser className="text-xs" />
              Login
            </Link>
          </div>

          <div className="lg:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2.5 rounded-lg border transition-all ${
                theme === "dark"
                  ? "text-yellow-300 border-gray-700/60 bg-gray-800/60"
                  : "text-blue-700 border-gray-200 bg-white"
              }`}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <FaSun /> : <FaMoon />}
            </button>

            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className={`p-2.5 rounded-lg border transition-all ${
                theme === "dark"
                  ? "text-white border-gray-700/60 bg-gray-800/60"
                  : "text-gray-900 border-gray-200 bg-white"
              }`}
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div
          className={`lg:hidden border-t ${
            theme === "dark" ? "border-gray-800 bg-black/95" : "border-gray-200 bg-white/95"
          } backdrop-blur-xl`}
        >
          <div className="px-4 py-3 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleNav(item.to)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                  theme === "dark"
                    ? "text-gray-200 hover:bg-blue-900/20"
                    : "text-gray-800 hover:bg-blue-100"
                }`}
              >
                {item.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setIsTeamMenuOpen((prev) => !prev)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${
                theme === "dark"
                  ? "text-gray-200 hover:bg-blue-900/20"
                  : "text-gray-800 hover:bg-blue-100"
              }`}
            >
              Team
              <FaChevronDown
                className={`text-xs transition-transform ${isTeamMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isTeamMenuOpen && (
              <div className="pl-2 space-y-1">
                {teamCategories.map((item) => (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => handleTeamCategory(item.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                      theme === "dark"
                        ? "text-gray-300 hover:bg-blue-900/20"
                        : "text-gray-700 hover:bg-blue-100"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            <Link
              to="/admin/login"
              onClick={() => {
                setIsMenuOpen(false);
                setIsTeamMenuOpen(false);
              }}
              className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default VisitorHeader;
