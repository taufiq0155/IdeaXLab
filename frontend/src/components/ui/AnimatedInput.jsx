import { FiSearch, FiFilter } from 'react-icons/fi';

const AnimatedInput = ({ 
  type = 'text',
  placeholder = '',
  value,
  onChange,
  icon = 'search',
  className = ''
}) => {
  const IconComponent = icon === 'filter' ? FiFilter : FiSearch;

  return (
    <div className={`relative ${className}`}>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 pl-12 bg-black/40 backdrop-blur-sm border border-gray-800/70 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-900/30 transition-all duration-300"
      />
      <IconComponent className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
    </div>
  );
};

export default AnimatedInput;