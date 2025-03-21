import React, { useState } from 'react';
import { 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  MoreVertical,
  Clock,
  Users,
  BookOpen
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';

interface Event {
  id: string;
  title: string;
  date: Date;
  type: 'lecture' | 'workshop' | 'assessment';
  duration: string;
  participants: number;
}

const CurriculumCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'React Fundamentals',
      date: new Date(2025, 2, 15),
      type: 'lecture',
      duration: '2 hours',
      participants: 25
    },
    {
      id: '2',
      title: 'State Management Workshop',
      date: new Date(2025, 2, 18),
      type: 'workshop',
      duration: '3 hours',
      participants: 15
    },
    {
      id: '3',
      title: 'Frontend Assessment',
      date: new Date(2025, 2, 20),
      type: 'assessment',
      duration: '1.5 hours',
      participants: 30
    }
  ]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const getEventsByDate = (date: Date) => {
    return events.filter(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'lecture':
        return 'bg-blue-100 text-blue-800';
      case 'workshop':
        return 'bg-green-100 text-green-800';
      case 'assessment':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Calendar Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
          <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Plus className="h-5 w-5 mr-2" />
            Add Event
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="bg-gray-50 py-2 text-center">
              <span className="text-sm font-medium text-gray-900">{day}</span>
            </div>
          ))}

          {/* Calendar Days */}
          {days.map((day, dayIdx) => {
            const dayEvents = getEventsByDate(day);
            
            return (
              <div
                key={day.toString()}
                className={`min-h-[120px] bg-white p-2 ${
                  !isSameMonth(day, currentDate)
                    ? 'bg-gray-50'
                    : isToday(day)
                    ? 'bg-purple-50'
                    : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${
                    isToday(day)
                      ? 'bg-purple-600 text-white w-6 h-6 flex items-center justify-center rounded-full'
                      : 'text-gray-900'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  {dayEvents.length > 0 && (
                    <button className="p-1 hover:bg-gray-100 rounded-full">
                      <MoreVertical className="h-4 w-4 text-gray-400" />
                    </button>
                  )}
                </div>

                {/* Events */}
                <div className="mt-2 space-y-1">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`px-2 py-1 rounded text-sm ${getEventTypeColor(event.type)}`}
                    >
                      <div className="font-medium">{event.title}</div>
                      <div className="flex items-center text-xs mt-1 space-x-2">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {event.duration}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {event.participants}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 pb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
            <span className="text-sm text-gray-600">Lecture</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
            <span className="text-sm text-gray-600">Workshop</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-purple-500 mr-2" />
            <span className="text-sm text-gray-600">Assessment</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurriculumCalendar;