import React from 'react';

interface ActivityChartProps {
  data: any[];
}

const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => {
  // If no data is provided, show sample data
  const chartData = data.length > 0 ? data : [
    { date: '2025-03-01', login: 24, interview: 12, training: 8 },
    { date: '2025-03-02', login: 30, interview: 15, training: 10 },
    { date: '2025-03-03', login: 28, interview: 18, training: 12 },
    { date: '2025-03-04', login: 32, interview: 20, training: 15 },
    { date: '2025-03-05', login: 35, interview: 22, training: 18 },
    { date: '2025-03-06', login: 40, interview: 25, training: 20 },
    { date: '2025-03-07', login: 38, interview: 24, training: 22 }
  ];

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get the maximum value for scaling
  const getMaxValue = () => {
    let max = 0;
    chartData.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== 'date' && item[key] > max) {
          max = item[key];
        }
      });
    });
    return max;
  };

  const maxValue = getMaxValue();
  const barColors = {
    login: '#8884d8',
    interview: '#82ca9d',
    training: '#ffc658'
  };

  return (
    <div className="h-80">
      {/* Custom chart implementation */}
      <div className="flex flex-col h-full">
        {/* Chart header with legend */}
        <div className="flex justify-end mb-4 space-x-6">
          {Object.entries(barColors).map(([key, color]) => (
            <div key={key} className="flex items-center">
              <div className="w-3 h-3 mr-2" style={{ backgroundColor: color }}></div>
              <span className="text-sm text-gray-600 capitalize">{key}</span>
            </div>
          ))}
        </div>
        
        {/* Chart body */}
        <div className="flex-1 flex">
          {/* Y-axis labels */}
          <div className="w-12 flex flex-col justify-between pr-2 text-right text-xs text-gray-500">
            <span>{maxValue}</span>
            <span>{Math.round(maxValue * 0.75)}</span>
            <span>{Math.round(maxValue * 0.5)}</span>
            <span>{Math.round(maxValue * 0.25)}</span>
            <span>0</span>
          </div>
          
          {/* Chart content */}
          <div className="flex-1">
            {/* Grid lines */}
            <div className="relative h-full">
              {[0.25, 0.5, 0.75, 1].map((ratio) => (
                <div 
                  key={ratio}
                  className="absolute w-full border-t border-gray-200"
                  style={{ top: `${100 - ratio * 100}%` }}
                ></div>
              ))}
              
              {/* Bars */}
              <div className="absolute inset-0 flex justify-between">
                {chartData.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col justify-end items-center">
                    {/* Bars for each data type */}
                    <div className="w-full flex justify-center space-x-1">
                      {Object.entries(item).map(([key, value]) => {
                        if (key === 'date') return null;
                        const height = (Number(value) / maxValue) * 100;
                        return (
                          <div 
                            key={key}
                            className="w-3 rounded-t-sm transition-all duration-300 hover:opacity-80"
                            style={{ 
                              height: `${height}%`, 
                              backgroundColor: barColors[key as keyof typeof barColors] || '#ccc'
                            }}
                            title={`${key}: ${value}`}
                          ></div>
                        );
                      })}
                    </div>
                    
                    {/* X-axis label */}
                    <div className="mt-2 text-xs text-gray-500">
                      {formatDate(item.date)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityChart;