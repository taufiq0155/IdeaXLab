import { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { FiMail, FiUser } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import AnimatedCanvas from "../../components/animations/animatedCanvas";
import GlassCard from "../../components/ui/GlassCard";
import VisitorHeader from "./header";
import Footer from "./footer";

const TeamHome = () => {
  const { theme } = useTheme();
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTeam = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:5000/api/public/team");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch team");
      }

      setMembers(data.data || []);
    } catch (error) {
      toast.error(error.message || "Failed to fetch team members");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const isDark = theme === "dark";

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

      <main className="relative z-20 pt-28 px-4 sm:px-6 lg:px-8 pb-14">
        <div className="max-w-7xl mx-auto">
          <GlassCard theme={theme} className="mb-6">
            <h1 className={`text-3xl md:text-4xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              Meet Our Team
            </h1>
            <p className={`mt-2 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              Researchers and engineers working on interpretable AI systems.
            </p>
          </GlassCard>

          {isLoading ? (
            <div className="h-72 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <span className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                <p className={`mt-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>Loading team members...</p>
              </div>
            </div>
          ) : members.length === 0 ? (
            <GlassCard theme={theme}>
              <div className="text-center py-14">
                <p className={`text-xl ${isDark ? "text-gray-300" : "text-gray-700"}`}>No active team members found</p>
              </div>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {members.map((member) => (
                <GlassCard key={member._id} theme={theme} className="h-full">
                  <div className="h-full flex flex-col">
                    <div className="flex items-start gap-3">
                      <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-800/40 bg-gradient-to-br from-blue-700/20 to-cyan-700/20 shrink-0">
                      {member.profileImage ? (
                        <img
                          src={member.profileImage}
                          alt={member.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiUser className={`w-16 h-16 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                        </div>
                      )}
                    </div>
                      <div className="min-w-0">
                        <h2 className={`text-base font-semibold truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                          {member.fullName}
                        </h2>
                        <p className="text-cyan-400 text-sm font-medium truncate">
                          {member.designation || "Research Team Member"}
                        </p>
                        {member.department && (
                          <p className={`text-xs mt-1 truncate ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            {member.department}
                          </p>
                        )}
                      </div>
                    </div>

                    <a
                      href={`mailto:${member.email}`}
                      className={`mt-3 inline-flex items-center gap-2 text-sm ${
                        isDark ? "text-blue-300 hover:text-blue-200" : "text-blue-700 hover:text-blue-600"
                      }`}
                    >
                      <FiMail className="w-4 h-4" />
                      {member.email}
                    </a>

                    {member.skills?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {member.skills.slice(0, 6).map((skill, index) => (
                          <span
                            key={`${member._id}-${index}`}
                            className={`text-xs px-2 py-1 rounded-lg ${
                              isDark ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer theme={theme} />
    </div>
  );
};

export default TeamHome;
