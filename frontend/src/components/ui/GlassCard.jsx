// components/ui/GlassCard.jsx
const GlassCard = ({ children, className = '', color = 'blue', theme = 'dark' }) => {
  const colorConfig = {
    blue: {
      gradient: theme === 'dark' 
        ? 'from-blue-600 via-cyan-500 to-blue-600' 
        : 'from-blue-400 via-blue-300 to-blue-400',
      shadow: theme === 'dark' 
        ? 'shadow-blue-900/20' 
        : 'shadow-blue-400/20',
      border: theme === 'dark' 
        ? 'border-gray-800/50' 
        : 'border-gray-300/50',
      bgOpacity: theme === 'dark' ? 'bg-black/60' : 'bg-white/80'
    },
    amber: {
      gradient: theme === 'dark'
        ? 'from-amber-600 via-yellow-500 to-amber-600'
        : 'from-amber-400 via-yellow-300 to-amber-400',
      shadow: theme === 'dark'
        ? 'shadow-amber-900/20'
        : 'shadow-amber-400/20',
      border: theme === 'dark'
        ? 'border-gray-800/50'
        : 'border-gray-300/50',
      bgOpacity: theme === 'dark' ? 'bg-black/60' : 'bg-white/80'
    },
    green: {
      gradient: theme === 'dark'
        ? 'from-green-600 via-emerald-500 to-green-600'
        : 'from-green-400 via-emerald-300 to-green-400',
      shadow: theme === 'dark'
        ? 'shadow-green-900/20'
        : 'shadow-green-400/20',
      border: theme === 'dark'
        ? 'border-gray-800/50'
        : 'border-gray-300/50',
      bgOpacity: theme === 'dark' ? 'bg-black/60' : 'bg-white/80'
    }
  };

  const config = colorConfig[color] || colorConfig.blue;

  return (
    <div className={`relative ${className}`}>
      <div className={`absolute -inset-1 bg-gradient-to-r ${config.gradient} rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500`}></div>
      <div className={`relative ${config.bgOpacity} backdrop-blur-xl rounded-3xl p-8 border ${config.border} shadow-2xl ${config.shadow}`}>
        {children}
      </div>
    </div>
  );
};

export default GlassCard;