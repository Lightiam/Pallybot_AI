import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Brain, 
  Users, 
  Clock, 
  Trophy, 
  BarChart, 
  Calendar,
  PlayCircle,
  BookOpen,
  MessageSquare,
  Target,
  Bot,
  Layers,
  Plus,
  Layout,
  Settings,
  Code,
  Search,
  Filter,
  Share2,
  UserPlus
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

const TrainingHub: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'training' | 'curriculum' | 'ai'>('training');
  const [trainings, setTrainings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrainings();
  }, []);

  const fetchTrainings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('trainings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setTrainings(data || []);
    } catch (error) {
      console.error('Error fetching trainings:', error);
      toast.error('Failed to load trainings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTraining = () => {
    navigate('/training/create');
  };

  const handleViewTrainings = () => {
    navigate('/training/list');
  };

  const handleViewCalendar = () => {
    navigate('/calendar');
  };

  const handleCreateCurriculum = () => {
    navigate('/curriculum/create');
  };

  const handleViewCurriculumLibrary = () => {
    navigate('/curriculum/library');
  };

  const handleManageModules = () => {
    navigate('/curriculum/modules');
  };

  const handleChatMode = () => {
    navigate('/ai/chat');
  };

  const handleCodeInterface = () => {
    navigate('/ai/code');
  };
  
  const handleLearningEnvironment = () => {
    navigate('/ai/learning-environment');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Training Hub</span>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-4">
            {/* Training Management */}
            <div>
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Training Management
              </h3>
              <div className="mt-2 space-y-1">
                <SidebarLink
                  icon={<Plus />}
                  label="Create Training"
                  onClick={handleCreateTraining}
                  active={false}
                />
                <SidebarLink
                  icon={<Layout />}
                  label="View Trainings"
                  onClick={handleViewTrainings}
                  active={false}
                />
                <SidebarLink
                  icon={<Calendar />}
                  label="Training Calendar"
                  onClick={handleViewCalendar}
                  active={false}
                />
              </div>
            </div>

            {/* Curriculum */}
            <div>
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Curriculum
              </h3>
              <div className="mt-2 space-y-1">
                <SidebarLink
                  icon={<Plus />}
                  label="Create Curriculum"
                  onClick={handleCreateCurriculum}
                  active={false}
                />
                <SidebarLink
                  icon={<BookOpen />}
                  label="Curriculum Library"
                  onClick={handleViewCurriculumLibrary}
                  active={false}
                />
                <SidebarLink
                  icon={<Settings />}
                  label="Module Management"
                  onClick={handleManageModules}
                  active={false}
                />
              </div>
            </div>

            {/* Pally Bot AI */}
            <div>
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Pally Bot AI
              </h3>
              <div className="mt-2 space-y-1">
                <SidebarLink
                  icon={<MessageSquare />}
                  label="Chat Mode"
                  onClick={handleChatMode}
                  active={false}
                />
                <SidebarLink
                  icon={<Code />}
                  label="Code Interface"
                  onClick={handleCodeInterface}
                  active={false}
                />
                <SidebarLink
                  icon={<Layers />}
                  label="Learning Environment"
                  onClick={handleLearningEnvironment}
                  active={false}
                />
              </div>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t">
          <button className="w-full flex items-center justify-center px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white border-b px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <div className="flex items-center space-x-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                <Users className="h-4 w-4" />
                <span>Trainer</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Filter className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </header>

        <div className="p-8">
          <div className="space-y-8">
            {/* Stats Cards */}
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

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <QuickAction
                title="Create New Training"
                description="Set up a new training program with curriculum mapping"
                icon={<Plus className="h-6 w-6" />}
                onClick={handleCreateTraining}
              />
              <QuickAction
                title="Manage Curriculum"
                description="Update and organize your training materials"
                icon={<BookOpen className="h-6 w-6" />}
                onClick={handleViewCurriculumLibrary}
              />
              <QuickAction
                title="Interactive Learning Environment"
                description="Use the dual-pane learning interface"
                icon={<Layers className="h-6 w-6" />}
                onClick={handleLearningEnvironment}
              />
            </div>

            {/* Calendar Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Training Calendar</h2>
                <button
                  onClick={handleViewCalendar}
                  className="flex items-center px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  View Full Calendar
                </button>
              </div>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Calendar className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Manage Your Schedule</h3>
                  <p className="text-gray-500 mt-2 max-w-md mx-auto">
                    Keep track of all your training sessions, interviews, and events in one place
                  </p>
                  <button
                    onClick={handleViewCalendar}
                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Open Calendar
                  </button>
                </div>
              </div>
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
          </div>
        </div>
      </div>
    </div>
  );
};

const SidebarLink: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active: boolean;
}> = ({ icon, label, onClick, active }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
      active
        ? 'bg-purple-50 text-purple-700'
        : 'text-gray-700 hover:bg-gray-50 hover:text-purple-700'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

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

const QuickAction: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ title, description, icon, onClick }) => (
  <button
    onClick={onClick}
    className="block w-full text-left bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
  >
    <div className="flex items-center space-x-4">
      <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  </button>
);

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

export default TrainingHub;