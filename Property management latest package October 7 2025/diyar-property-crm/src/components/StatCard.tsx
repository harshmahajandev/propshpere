import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange';
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  icon, 
  color = 'blue',
  className = '' 
}) => {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
  };

  const changeColorClasses = {
    increase: 'text-green-600',
    decrease: 'text-red-600',
    neutral: 'text-gray-600',
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {icon && (
          <div className={`text-xl ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-baseline">
        <p className={`text-2xl font-bold ${colorClasses[color]}`}>
          {value}
        </p>
        
        {change && (
          <span className={`ml-2 text-sm font-medium ${changeColorClasses[change.type]}`}>
            {change.type === 'increase' && '↗'}
            {change.type === 'decrease' && '↘'}
            {change.value}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;