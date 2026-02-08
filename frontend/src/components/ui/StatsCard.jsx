// components/ui/StatsCard.jsx
const StatsCard = ({ 
  label, 
  value, 
  icon, 
  color = 'blue', 
  gradient = null,
  className = '',
  theme = 'dark' 
}) => {
  // Default gradients based on theme
  const defaultGradients = {
    blue: theme === 'dark' 
      ? 'from-blue-600/20 to-blue-800/10' 
      : 'from-blue-100/80 to-blue-200/60',
    green: theme === 'dark'
      ? 'from-green-600/20 to-emerald-800/10'
      : 'from-green-100/80 to-emerald-200/60',
    amber: theme === 'dark'
      ? 'from-amber-600/20 to-yellow-800/10'
      : 'from-amber-100/80 to-yellow-200/60',
    cyan: theme === 'dark'
      ? 'from-cyan-600/20 to-blue-700/10'
      : 'from-cyan-100/80 to-blue-200/60',
    purple: theme === 'dark'
      ? 'from-purple-600/20 to-purple-800/10'
      : 'from-purple-100/80 to-purple-200/60',
    violet: theme === 'dark'
      ? 'from-violet-600/20 to-violet-800/10'
      : 'from-violet-100/80 to-violet-200/60'
  };

  const finalGradient = gradient || defaultGradients[color] || defaultGradients.blue;

  const colorClasses = {
    blue: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
    green: theme === 'dark' ? 'text-green-400' : 'text-green-600',
    amber: theme === 'dark' ? 'text-amber-400' : 'text-amber-600',
    purple: theme === 'dark' ? 'text-purple-400' : 'text-purple-600',
    red: theme === 'dark' ? 'text-red-400' : 'text-red-600',
    cyan: theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600',
    violet: theme === 'dark' ? 'text-violet-400' : 'text-violet-600'
  };

  const textColor = colorClasses[color] || colorClasses.blue;

  const borderColor = theme === 'dark' ? 'border-gray-800/50' : 'border-gray-300/50';
  const hoverBorderColor = theme === 'dark' ? `hover:border-${color}-700/30` : `hover:border-${color}-500/30`;
  const hoverShadow = theme === 'dark' ? `hover:shadow-${color}-900/20` : `hover:shadow-${color}-400/20`;
  const iconBgColor = theme === 'dark' ? 'bg-black/40' : 'bg-white/60';
  const iconBorderColor = theme === 'dark' ? 'border-gray-800/70' : 'border-gray-300/70';

  return (
    <div className={`relative group ${className}`}>
      <div className={`absolute -inset-1 bg-gradient-to-r ${finalGradient} rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500`}></div>
      
      <div className={`relative bg-gradient-to-br ${finalGradient} backdrop-blur-xl rounded-2xl p-6 border ${borderColor} ${hoverBorderColor} transition-all duration-500 hover:shadow-2xl ${hoverShadow}`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${iconBgColor} backdrop-blur-sm border ${iconBorderColor}`}>
            <div className={textColor}>
              {icon}
            </div>
          </div>
          <div className={`text-2xl font-bold ${textColor}`}>
            {value}
          </div>
        </div>
        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {label}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;