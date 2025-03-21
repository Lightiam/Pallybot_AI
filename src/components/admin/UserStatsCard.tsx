import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface UserStatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
}

const UserStatsCard: React.FC<UserStatsCardProps> = ({
  title,
  value,
  icon,
  change,
  changeType = 'neutral'
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-gray-100 rounded-lg">
          {icon}
        </div>
        {change && (
          <div className={`flex items-center text-sm ${
            changeType === 'increase' ? 'text-green-600' : 
            changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {changeType === 'increase' ? (
              <ArrowUp className="h-4 w-4 mr-1" />
            ) : changeType === 'decrease' ? (
              <ArrowDown className="h-4 w-4 mr-1" />
            ) : null}
            <span>{change}</span>
          </div>
        )}
      </div>
      <h3 className="text-sm text-gray-500">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
    </div>
  );
};

export default UserStatsCard;