import AnimatedCanvas from '../../components/animations/animatedCanvas';
import GlassCard from '../../components/ui/GlassCard';
import StatsCard from '../../components/ui/StatsCard';
import { FiZap, FiTrendingUp, FiUsers, FiDollarSign, FiActivity, FiBell } from 'react-icons/fi';

export default function AdminDashboard() {
  const stats = [
    { 
      label: 'Total Users', 
      value: '2,345', 
      icon: <FiUsers className="w-6 h-6" />,
      color: 'blue'
    },
    { 
      label: 'Active Sessions', 
      value: '143', 
      icon: <FiActivity className="w-6 h-6" />,
      color: 'cyan'
    },
    { 
      label: 'Revenue', 
      value: '$12,345', 
      icon: <FiDollarSign className="w-6 h-6" />,
      color: 'green'
    },
    { 
      label: 'Pending Actions', 
      value: '8', 
      icon: <FiZap className="w-6 h-6" />,
      color: 'amber'
    },
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <AnimatedCanvas />

      <div className="relative z-10 p-4 md:p-6">
        {/* Welcome Card */}
        <GlassCard className="mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-3">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Admin</span>
              </h2>
              <p className="text-gray-300 text-lg">
                Here's what's happening with your lab today.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-3 p-4 bg-black/40 backdrop-blur-sm rounded-xl border border-gray-800/70">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping animation-delay-200"></div>
                </div>
                <span className="text-sm font-medium text-blue-400">
                  System Status: <span className="text-green-400">Operational</span>
                </span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats.map((stat, index) => (
            <StatsCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              className="animate-floating"
              style={{ animationDelay: `${index * 100}ms` }}
            />
          ))}
        </div>

        {/* Additional content... */}
      </div>

      {/* Bottom Gradient */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none"></div>
    </div>
  );
}