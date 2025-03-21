import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
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
  Bot
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const Dashboard: React.FC = () => {
  const [userName, setUserName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.username) {
          setUserName(user.user_metadata.username);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();
  }, []);

  const handleStartInterview = () => {
    navigate('/interview');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back{userName ? `, ${userName}` : ''}! 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Your interview preparation dashboard
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={handleStartInterview}
            className="block p-6 rounded-xl shadow-sm transition-all duration-200 transform hover:scale-[1.02] bg-purple-600 text-white hover:bg-purple-700"
          >
            <div className="flex items-center space-x-4">
              <PlayCircle className="h-6 w-6 text-white" />
              <div>
                <h3 className="font-semibold text-white">Start Interview</h3>
                <p className="text-sm text-purple-100">Begin a new interview session</p>
              </div>
            </div>
          </button>

          <Link
            to="/interview/copilot"
            className="block p-6 rounded-xl shadow-sm transition-all duration-200 transform hover:scale-[1.02] bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
          >
            <div className="flex items-center space-x-4">
              <Bot className="h-6 w-6 text-white" />
              <div>
                <h3 className="font-semibold text-white">Interview Copilot</h3>
                <p className="text-sm text-purple-100">AI-powered assistance</p>
              </div>
            </div>
          </Link>

          <Link
            to="/mock-interview"
            className="block p-6 rounded-xl shadow-sm transition-all duration-200 transform hover:scale-[1.02] bg-white hover:bg-gray-50"
          >
            <div className="flex items-center space-x-4">
              <MessageSquare className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Mock Interview</h3>
                <p className="text-sm text-gray-500">Practice with AI</p>
              </div>
            </div>
          </Link>

          <Link
            to="/goals"
            className="block p-6 rounded-xl shadow-sm transition-all duration-200 transform hover:scale-[1.02] bg-white hover:bg-gray-50"
          >
            <div className="flex items-center space-x-4">
              <Target className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Set Goals</h3>
                <p className="text-sm text-gray-500">Track your progress</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Section */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={<Users className="h-6 w-6 text-blue-500" />}
                title="Practice Sessions"
                value="24"
              />
              <StatCard
                icon={<Clock className="h-6 w-6 text-green-500" />}
                title="Hours Practiced"
                value="12"
              />
              <StatCard
                icon={<BarChart className="h-6 w-6 text-purple-500" />}
                title="Avg. Score"
                value="85%"
              />
              <StatCard
                icon={<Trophy className="h-6 w-6 text-yellow-500" />}
                title="Skills Mastered"
                value="8"
              />
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Sessions</h2>
            <div className="space-y-4">
              {upcomingSessions.map((session, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{session.title}</p>
                    <p className="text-xs text-gray-500">{session.date}</p>
                  </div>
                </div>
              ))}
              <button className="w-full mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium">
                View All Sessions
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${activity.iconBg}`}>
                    {activity.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{activity.title}</h3>
                    <p className="text-sm text-gray-500">{activity.date}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${activity.scoreColor}`}>
                  {activity.score}
                </span>
              </div>
            ))}
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
  <div className="bg-gray-50 rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      {icon}
      <span className="text-xl font-semibold text-gray-900">{value}</span>
    </div>
    <p className="text-sm text-gray-600">{title}</p>
  </div>
);

const upcomingSessions = [
  {
    title: "Technical Interview Practice",
    date: "Tomorrow at 2:00 PM",
  },
  {
    title: "System Design Discussion",
    date: "Thursday at 11:00 AM",
  },
  {
    title: "Behavioral Interview Prep",
    date: "Friday at 3:30 PM",
  },
];

const recentActivity = [
  {
    icon: <Brain className="h-5 w-5 text-purple-600" />,
    iconBg: "bg-purple-100",
    title: "Technical Interview Practice",
    date: "Today",
    score: "92%",
    scoreColor: "bg-green-100 text-green-800",
  },
  {
    icon: <MessageSquare className="h-5 w-5 text-blue-600" />,
    iconBg: "bg-blue-100",
    title: "System Design Discussion",
    date: "Yesterday",
    score: "85%",
    scoreColor: "bg-blue-100 text-blue-800",
  },
  {
    icon: <Users className="h-5 w-5 text-yellow-600" />,
    iconBg: "bg-yellow-100",
    title: "Behavioral Questions",
    date: "2 days ago",
    score: "78%",
    scoreColor: "bg-yellow-100 text-yellow-800",
  },
];

export default Dashboard;