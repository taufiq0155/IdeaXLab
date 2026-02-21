import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { FaCheckCircle, FaPaperPlane } from "react-icons/fa";
import {
  FiChevronLeft,
  FiChevronRight,
  FiMail,
  FiMessageSquare,
  FiPhone,
  FiUser,
} from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import AnimatedCanvas from "../../components/animations/animatedCanvas";
import GlassCard from "../../components/ui/GlassCard";
import VisitorHeader from "./header";
import Footer from "./footer";

const slidesData = [
  {
    tag: "Explainable AI Lab",
    title: "Transparent Intelligence",
    highlight: "for Real Decisions",
    description:
      "We build interpretable AI systems and responsible LLM pipelines for research, industry, and society.",
    primary: { label: "Read Blogs", to: "/blogs" },
    secondary: { label: "View Services", to: "/services" },
    glow: "from-blue-700/30 via-cyan-600/20 to-transparent",
  },
  {
    tag: "Research to Practice",
    title: "From Theory",
    highlight: "to Impact",
    description:
      "Our projects combine scientific rigor with practical innovation in analytics, automation, and trustworthy AI.",
    primary: { label: "Meet Team", to: "/team" },
    secondary: { label: "Contact Us", to: "/#contact" },
    glow: "from-cyan-700/30 via-blue-700/20 to-transparent",
  },
  {
    tag: "Collaborative Innovation",
    title: "Build With",
    highlight: "IdeaXLab",
    description:
      "Partner with our researchers for testing, consultancy, model development, and publication support.",
    primary: { label: "Get Free Service", to: "/services" },
    secondary: { label: "Explore Team", to: "/team" },
    glow: "from-sky-700/30 via-blue-700/20 to-transparent",
  },
];

const quickStats = [
  { number: "50+", label: "Research Papers" },
  { number: "25+", label: "AI Projects" },
  { number: "15+", label: "Industry Partners" },
  { number: "8+", label: "Years of Research" },
];

const Home = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidesData.length);
    }, 5500);

    return () => window.clearInterval(timer);
  }, []);

  const goPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slidesData.length) % slidesData.length);
  };

  const goNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slidesData.length);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (!formData.message.trim()) {
      toast.error("Please enter your message");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("http://localhost:5000/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || "",
          subject: formData.subject.trim() || "General Inquiry",
          message: formData.message.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to send message");
      }

      toast.success(data.message || "Message sent successfully");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setFormSubmitted(true);
      setTimeout(() => setFormSubmitted(false), 4500);
    } catch (error) {
      toast.error(error.message || "Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${isDark ? "bg-black" : "bg-white"}`}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: isDark ? "#1f2937" : "#ffffff",
            color: isDark ? "#ffffff" : "#111827",
            border: isDark ? "1px solid #374151" : "1px solid #d1d5db",
          },
        }}
      />

      <AnimatedCanvas theme={theme} />
      <VisitorHeader />

      <main className="relative z-20 pt-28">
        <section className="px-4 sm:px-6 lg:px-8 pt-8 pb-10">
          <div className="max-w-7xl mx-auto">
            <div
              className={`relative overflow-hidden rounded-3xl border ${
                isDark
                  ? "bg-black/55 border-blue-900/40"
                  : "bg-white/85 border-blue-200/70"
              } backdrop-blur-xl h-[470px] md:h-[530px]`}
            >
              {slidesData.map((slide, idx) => {
                const active = idx === currentSlide;
                return (
                  <div
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-700 ${
                      active ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${slide.glow}`}></div>
                    <div className="absolute -top-20 -right-10 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl"></div>
                    <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl"></div>

                    <div className="relative h-full px-6 md:px-12 py-10 flex items-center">
                      <div className="max-w-3xl">
                        <p
                          className={`inline-flex px-4 py-2 rounded-full border text-xs tracking-[0.2em] uppercase ${
                            isDark
                              ? "text-blue-300 border-blue-800/60 bg-blue-900/20"
                              : "text-blue-700 border-blue-300 bg-blue-100"
                          }`}
                        >
                          {slide.tag}
                        </p>

                        <h1
                          className={`mt-5 text-4xl md:text-6xl font-black tracking-tight ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {slide.title}
                          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                            {slide.highlight}
                          </span>
                        </h1>

                        <p
                          className={`mt-5 text-lg md:text-xl leading-relaxed ${
                            isDark ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {slide.description}
                        </p>

                        <div className="mt-8 flex flex-col sm:flex-row gap-3">
                          <Link
                            to={slide.primary.to}
                            className="px-7 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-center"
                          >
                            {slide.primary.label}
                          </Link>
                          <Link
                            to={slide.secondary.to}
                            className={`px-7 py-3 rounded-xl font-semibold border text-center ${
                              isDark
                                ? "text-white border-blue-700/50 bg-blue-900/15 hover:bg-blue-900/25"
                                : "text-gray-900 border-blue-300 bg-blue-50 hover:bg-blue-100"
                            }`}
                          >
                            {slide.secondary.label}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={goPrevSlide}
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border flex items-center justify-center ${
                  isDark
                    ? "bg-black/60 border-blue-900/40 text-white hover:bg-black/75"
                    : "bg-white/90 border-blue-200 text-gray-900 hover:bg-white"
                }`}
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={goNextSlide}
                className={`absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border flex items-center justify-center ${
                  isDark
                    ? "bg-black/60 border-blue-900/40 text-white hover:bg-black/75"
                    : "bg-white/90 border-blue-200 text-gray-900 hover:bg-white"
                }`}
              >
                <FiChevronRight className="w-5 h-5" />
              </button>

              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {slidesData.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => setCurrentSlide(dotIdx)}
                    className={`h-2.5 rounded-full transition-all ${
                      dotIdx === currentSlide
                        ? "w-8 bg-cyan-400"
                        : isDark
                        ? "w-2.5 bg-gray-600"
                        : "w-2.5 bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div
              className={`mt-6 rounded-2xl border px-4 py-4 ${
                isDark ? "border-blue-900/40 bg-black/40" : "border-blue-200 bg-white/80"
              } backdrop-blur-lg`}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickStats.map((item) => (
                  <div key={item.label} className="text-center">
                    <p className={`text-2xl font-black ${isDark ? "text-cyan-300" : "text-blue-700"}`}>
                      {item.number}
                    </p>
                    <p className={`text-xs md:text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="px-4 sm:px-6 lg:px-8 pb-16 scroll-mt-28">
          <div className="max-w-5xl mx-auto">
            <GlassCard color="amber" theme={theme}>
              {formSubmitted ? (
                <div className="text-center py-10">
                  <FaCheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                    Message Sent Successfully
                  </h3>
                  <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                    Our team will get back to you soon.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className={`text-2xl md:text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                    Contact Our Research Team
                  </h3>
                  <p className={`mb-6 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                    Share your idea, collaboration proposal, or research question.
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field
                        icon={<FiUser />}
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        required
                        theme={theme}
                      />
                      <Field
                        icon={<FiMail />}
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Your email"
                        required
                        theme={theme}
                      />
                      <Field
                        icon={<FiPhone />}
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Phone (optional)"
                        theme={theme}
                      />
                      <Field
                        icon={<FiMessageSquare />}
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Subject (optional)"
                        theme={theme}
                      />
                    </div>

                    <div className="relative">
                      <FiMessageSquare
                        className={`absolute left-3 top-3.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                      />
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        required
                        placeholder="Write your message..."
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border resize-none ${
                          isDark
                            ? "bg-black/40 border-gray-800 text-white placeholder-gray-500"
                            : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                        }`}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Sending...
                        </>
                      ) : (
                        <>
                          <FaPaperPlane className="text-sm" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </GlassCard>
          </div>
        </section>
      </main>

      <Footer theme={theme} />
    </div>
  );
};

const Field = ({
  icon,
  name,
  value,
  onChange,
  placeholder,
  theme,
  required = false,
  type = "text",
}) => {
  const isDark = theme === "dark";

  return (
    <div className="relative">
      <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
        {icon}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
          isDark
            ? "bg-black/40 border-gray-800 text-white placeholder-gray-500"
            : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
        }`}
      />
    </div>
  );
};

export default Home;
