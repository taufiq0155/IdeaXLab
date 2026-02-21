import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { FiExternalLink, FiLinkedin, FiMail, FiUser } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import AnimatedCanvas from "../../components/animations/animatedCanvas";
import GlassCard from "../../components/ui/GlassCard";
import VisitorHeader from "./header";
import Footer from "./footer";

const TEAM_CATEGORIES = [
  { slug: "research-team", label: "Research Team" },
  { slug: "development-team", label: "Development Team" },
  { slug: "innovation-team", label: "Innovation Team" },
];

const ROLE_ORDER = {
  "research-team": [
    "Principal Research Scientist",
    "Research Scientist",
    "Lead Researcher",
    "Researcher",
    "Research Associate",
    "Research Assistant",
    "Research Intern",
    "Our Collaborators",
    "Lab Alumni",
  ],
  "development-team": [
    "Head of Development",
    "Engineering Manager",
    "Lead Software Engineer",
    "Senior Software Engineer",
    "Software Engineer",
    "Full Stack Developer",
    "Backend Developer",
    "Frontend Developer",
    "DevOps Engineer",
    "QA Engineer",
    "Product Engineer",
    "Development Intern",
    "Technology Collaborators",
    "Development Alumni",
  ],
  "innovation-team": [
    "Chief Innovation Officer",
    "Innovation Director",
    "Innovation Program Manager",
    "Innovation Strategist",
    "Product Innovation Lead",
    "Innovation Researcher",
    "Startup Partnership Lead",
    "Technology Transfer Specialist",
    "Innovation Analyst",
    "Innovation Associate",
    "Innovation Intern",
    "Innovation Collaborators",
    "Innovation Alumni",
  ],
};

const TeamHome = () => {
  const { theme } = useTheme();
  const { category } = useParams();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const normalizedCategory = useMemo(() => {
    const slug = String(category || "research-team").trim().toLowerCase();
    return TEAM_CATEGORIES.some((item) => item.slug === slug)
      ? slug
      : "research-team";
  }, [category]);

  const activeCategoryLabel = useMemo(
    () =>
      TEAM_CATEGORIES.find((item) => item.slug === normalizedCategory)?.label ||
      "Research Team",
    [normalizedCategory]
  );

  const fetchTeam = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/public/team?category=${normalizedCategory}`
      );
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
  }, [normalizedCategory]);

  const groupedByRole = useMemo(() => {
    const canonicalRoleLookup = new Map(
      (ROLE_ORDER[normalizedCategory] || []).map((role) => [role.toLowerCase(), role])
    );
    const map = new Map();
    members.forEach((member) => {
      const rawRole = String(member.designation || "Team Member").trim() || "Team Member";
      const role = canonicalRoleLookup.get(rawRole.toLowerCase()) || rawRole;
      if (!map.has(role)) map.set(role, []);
      map.get(role).push(member);
    });

    const orderedRoles = ROLE_ORDER[normalizedCategory] || [];
    const sections = [];

    orderedRoles.forEach((role) => {
      const list = map.get(role);
      if (list?.length) {
        sections.push({ role, members: list });
        map.delete(role);
      }
    });

    map.forEach((value, key) => {
      sections.push({ role: key, members: value });
    });

    return sections;
  }, [members, normalizedCategory]);

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
              {activeCategoryLabel}
            </h1>
            <p className={`mt-2 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              Role-based team directory for {activeCategoryLabel.toLowerCase()}.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {TEAM_CATEGORIES.map((item) => (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => navigate(`/team/${item.slug}`)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    normalizedCategory === item.slug
                      ? isDark
                        ? "bg-blue-800/60 text-white"
                        : "bg-blue-100 text-blue-700"
                      : isDark
                      ? "bg-black/40 text-gray-300 border border-gray-700/60 hover:bg-blue-900/20"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-blue-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </GlassCard>

          {isLoading ? (
            <div className="h-72 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <span className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                <p className={`mt-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>Loading team members...</p>
              </div>
            </div>
          ) : groupedByRole.length === 0 ? (
            <GlassCard theme={theme}>
              <div className="text-center py-14">
                <p className={`text-xl ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  No members found in this category
                </p>
              </div>
            </GlassCard>
          ) : (
            <div className="space-y-7">
              {groupedByRole.map((section) => (
                <section key={section.role}>
                  <h2 className={`text-xl font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                    {section.role}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {section.members.map((member) => (
                      <GlassCard key={member._id} theme={theme} className="h-full">
                        <div className="h-full flex flex-col">
                          <div className="flex items-start gap-3">
                            <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-800/40 bg-gradient-to-br from-blue-700/20 to-cyan-700/20 shrink-0">
                              {member.profileImage ? (
                                <img
                                  src={member.profileImage}
                                  alt={member.fullName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <FiUser className={`w-10 h-10 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h3 className={`text-base font-semibold truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                                {member.fullName}
                              </h3>
                              <p className={`text-xs mt-1 truncate ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                {member.department || activeCategoryLabel}
                              </p>
                            </div>
                          </div>

                          <a
                            href={`mailto:${member.email}`}
                            className={`mt-3 inline-flex items-center gap-2 text-sm ${
                              isDark ? "text-blue-300 hover:text-blue-200" : "text-blue-700 hover:text-blue-600"
                            }`}
                          >
                            <FiMail className="w-4 h-4" />
                            <span className="truncate">{member.email}</span>
                          </a>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {member.linkedin && (
                              <a
                                href={member.linkedin}
                                target="_blank"
                                rel="noreferrer"
                                className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg ${
                                  isDark ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                <FiLinkedin className="w-3.5 h-3.5" />
                                LinkedIn
                              </a>
                            )}
                            {(member.otherLink || member.website || member.github) && (
                              <a
                                href={member.otherLink || member.website || member.github}
                                target="_blank"
                                rel="noreferrer"
                                className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg ${
                                  isDark ? "bg-cyan-900/30 text-cyan-300" : "bg-cyan-100 text-cyan-700"
                                }`}
                              >
                                <FiExternalLink className="w-3.5 h-3.5" />
                                Other Link
                              </a>
                            )}
                          </div>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </section>
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
