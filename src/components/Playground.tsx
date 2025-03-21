import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Calendar,
  GraduationCap,
  Clock,
  Users,
  BookOpen,
  Plus,
  Share2,
  UserPlus,
  Video
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

const Playground: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'training'>('overview');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('tab') === 'training') {
      setActiveTab('training');
    }
  }, [location]);

  const createVideoSession = async () => {
    try {
      const { data: session, error } = await supabase
        .from('training_sessions')
        .insert({
          title: 'Interview Practice Session',
          description: 'Video interview practice session',
          start_time: new Date().toISOString(),
          duration: 30,
          trainer_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      navigate(`/video-call/${session.id}`);
      toast.success('Video session created successfully');
    } catch (error) {
      console.error('Error creating video session:', error);
      toast.error('Failed to create video session');
    }
  };

  const upcomingTrainings = [
    {
      id: 1,
      title: "Advanced React Patterns",
      trainer: "Sarah Johnson",
      date: "March 15, 2025",
      time: "10:00 AM",
      duration: "2 hours",
      participants: 12,
      maxParticipants: 20,
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=640"
    },
    {
      id: 2,
      title: "System Design Interview Prep",
      trainer: "Michael Chen",
      date: "March 18, 2025",
      time: "2:00 PM",
      duration: "1.5 hours",
      participants: 8,
      maxParticipants: 15,
      image: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&q=80&w=640"
    },
    {
      id: 3,
      title: "Data Structures Deep Dive",
      trainer: "Alex Kumar",
      date: "March 20, 2025",
      time: "11:00 AM",
      duration: "2 hours",
      participants: 15,
      maxParticipants: 25,
      image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&q=80&w=640"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Training Hub</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={createVideoSession}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Video className="h-5 w-5 mr-2" />
                Start Video Interview
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Training Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              icon={<Users className="h-6 w-6 text-purple-600" />}
              title="Active Learners"
              value="1,234"
            />
            <StatCard
              icon={<BookOpen className="h-6 w-6 text-blue-600" />}
              title="Available Courses"
              value="45"
            />
            <StatCard
              icon={<Clock className="h-6 w-6 text-green-600" />}
              title="Training Hours"
              value="2,500+"
            />
            <StatCard
              icon={<GraduationCap className="h-6 w-6 text-orange-600" />}
              title="Certifications"
              value="320"
            />
          </div>

          {/* Upcoming Trainings */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Training Sessions</h2>
              <button
                onClick={() => {}}
                className="flex items-center px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Training
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingTrainings.map((training) => (
                <div key={training.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <img
                    src={training.image}
                    alt={training.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{training.title}</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{training.participants}/{training.maxParticipants} participants</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{training.date}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{training.time} ({training.duration})</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <button className="flex items-center text-purple-600 hover:text-purple-700">
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </button>
                      <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Register
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Training Calendar */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Training Calendar</h2>
            <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Calendar view coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string;
}> = ({ icon, title, value }) => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      {icon}
    </div>
  </div>
);

export default Playground;