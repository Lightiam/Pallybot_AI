import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Calendar from './Calendar';
import CalendarSidebar from './CalendarSidebar';
import { parseISO, isAfter } from 'date-fns';

interface Event {
  id: string;
  title: string;
  start_time: string;
  color?: string;
}

const CalendarPage: React.FC = () => {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('calendar_events')
        .select('id, title, start_time, color')
        .eq('user_id', user.id)
        .gte('start_time', now)
        .order('start_time', { ascending: true })
        .limit(5);
      
      if (error) throw error;
      
      setUpcomingEvents(data || []);
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Calendar</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <CalendarSidebar upcomingEvents={upcomingEvents} />
          </div>
          
          {/* Main Calendar */}
          <div className="lg:col-span-3">
            <Calendar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;