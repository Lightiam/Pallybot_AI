import React, { useState } from 'react';
import { format, addDays } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Users, CheckCircle } from 'lucide-react';

interface UpcomingEvent {
  id: string;
  title: string;
  start_time: string;
  color?: string;
}

interface CalendarSidebarProps {
  upcomingEvents: UpcomingEvent[];
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({ upcomingEvents }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Generate mini calendar dates
  const generateCalendarDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = addDays(today, i);
      days.push(date);
    }
    
    return days;
  };
  
  const calendarDays = generateCalendarDays();
  
  const getEventColor = (color?: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-500';
      case 'green':
        return 'bg-green-500';
      case 'red':
        return 'bg-red-500';
      case 'yellow':
        return 'bg-yellow-500';
      case 'purple':
      default:
        return 'bg-purple-500';
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 h-full">
      {/* Mini Calendar */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {format(new Date(), 'MMMM yyyy')}
        </h3>
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {calendarDays.map((day) => (
            <button
              key={day.toString()}
              onClick={() => setSelectedDate(day)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg min-w-[60px] ${
                format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                  ? 'bg-purple-100 text-purple-700'
                  : 'hover:bg-gray-100'
              }`}
            >
              <span className="text-xs text-gray-500">{format(day, 'EEE')}</span>
              <span className={`text-lg font-medium ${
                format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                  ? 'text-purple-600'
                  : 'text-gray-900'
              }`}>
                {format(day, 'd')}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
        <div className="space-y-3">
          {upcomingEvents.length === 0 ? (
            <p className="text-gray-500 text-sm">No upcoming events</p>
          ) : (
            upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-start space-x-3">
                <div className={`h-3 w-3 rounded-full mt-1.5 ${getEventColor(event.color)}`} />
                <div>
                  <p className="font-medium text-gray-900">{event.title}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(event.start_time), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <button className="flex items-center w-full p-2 text-left hover:bg-gray-100 rounded-lg transition-colors">
            <CalendarIcon className="h-5 w-5 text-purple-600 mr-3" />
            <span className="text-gray-700">Create Event</span>
          </button>
          <button className="flex items-center w-full p-2 text-left hover:bg-gray-100 rounded-lg transition-colors">
            <Clock className="h-5 w-5 text-blue-600 mr-3" />
            <span className="text-gray-700">Schedule Meeting</span>
          </button>
          <button className="flex items-center w-full p-2 text-left hover:bg-gray-100 rounded-lg transition-colors">
            <Users className="h-5 w-5 text-green-600 mr-3" />
            <span className="text-gray-700">Invite Team</span>
          </button>
          <button className="flex items-center w-full p-2 text-left hover:bg-gray-100 rounded-lg transition-colors">
            <CheckCircle className="h-5 w-5 text-yellow-600 mr-3" />
            <span className="text-gray-700">Set Reminder</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarSidebar;