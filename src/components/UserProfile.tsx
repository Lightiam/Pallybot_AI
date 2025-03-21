import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home,
  LayoutGrid,
  Book,
  FileText,
  MessageSquare,
  BarChart2,
  Users,
  LogIn,
  ChevronDown,
  ArrowRight,
  Lock
} from 'lucide-react';

const UserProfile: React.FC = () => {
  const [isUpskillOpen, setIsUpskillOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8F7FF]">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r flex flex-col">
        {/* Logo */}
        <div className="p-6">
          <Link to="/" className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-[#8B5CF6] rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-white" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">HiDevs</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            <NavLink icon={<Home />} label="Home" isActive={false} />
            <div>
              <button
                onClick={() => setIsUpskillOpen(!isUpskillOpen)}
                className="w-full flex items-center justify-between p-3 rounded-lg text-gray-700 hover:bg-[#F8F7FF] hover:text-[#8B5CF6] transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <LayoutGrid className="h-5 w-5" />
                  <span>Upskill Yourself</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${isUpskillOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
            <NavLink icon={<Book />} label="Courses" isActive={false} />
            <NavLink icon={<FileText />} label="LeetPrompt" isActive={false} />
            <NavLink icon={<MessageSquare />} label="EchoDeepak" isActive={false} />
            <NavLink icon={<BarChart2 />} label="Talent Pool" isActive={false} />
            <NavLink icon={<Users />} label="GenAI Workforce" isActive={false} />
          </div>
        </nav>

        {/* Bottom Links */}
        <div className="p-4 border-t">
          <NavLink icon={<LogIn />} label="Login" isActive={false} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white border-b px-8 py-4">
          <h1 className="text-2xl font-semibold text-[#8B5CF6]">Dashboard</h1>
        </header>

        {/* Content */}
        <div className="p-8">
          {/* Learning Journey Section */}
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2">
              <div className="bg-white rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-gray-900">Your Learning Journey</h2>
                <p className="text-gray-600 mt-2 mb-6">
                  Complete Level 0 by giving an interview to start your journey
                </p>
                <button className="inline-flex items-center px-6 py-3 bg-[#8B5CF6] text-white rounded-full hover:bg-[#7C3AED] transition-colors font-medium">
                  Start with Interview
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Score Card */}
            <div>
              <div className="bg-white rounded-2xl p-8">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900">HiDevs Score</h3>
                  <div className="text-4xl font-bold text-[#8B5CF6] mt-2">N/A</div>
                  <div className="text-sm text-[#8B5CF6] font-medium">POOR</div>

                  {/* Score Range */}
                  <div className="mt-8">
                    <div className="relative h-2 bg-gray-100 rounded-full">
                      <div className="absolute left-0 top-0 h-2 w-1/3 bg-[#8B5CF6] rounded-full"></div>
                      <div className="absolute left-0 top-0 h-4 w-1 bg-black -translate-y-1" style={{ left: '45%' }}></div>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-sm text-gray-600">300</span>
                      <span className="text-sm text-gray-600">900</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      <ScoreLabel label="Poor" range="300-550" />
                      <ScoreLabel label="Average" range="550-650" />
                      <ScoreLabel label="Good" range="650-750" />
                      <ScoreLabel label="Excellent" range="750-900" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Level 1 */}
          <div className="mt-8">
            <div className="bg-white rounded-2xl p-8">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-[#F8F7FF] rounded-xl">
                    <svg className="h-6 w-6 text-[#8B5CF6]" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-semibold text-gray-900">Level 1</h3>
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <h4 className="font-medium text-gray-900 mt-1">Basic Foundation</h4>
                    <p className="text-gray-600 mt-1">
                      Master the fundamentals of coding and essential development concepts
                    </p>
                  </div>
                </div>
                <div className="h-8 w-8 bg-[#F8F7FF] rounded-full flex items-center justify-center text-[#8B5CF6] font-medium">
                  1
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <SkillItem label="Coding Skills" />
                <SkillItem label="Version Control" />
                <SkillItem label="Linux Basics" />
                <SkillItem label="DSA Patterns" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NavLink: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}> = ({ icon, label, isActive }) => (
  <Link
    to="#"
    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
      isActive
        ? 'bg-[#8B5CF6] text-white'
        : 'text-gray-700 hover:bg-[#F8F7FF] hover:text-[#8B5CF6]'
    }`}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

const ScoreLabel: React.FC<{ label: string; range: string }> = ({ label, range }) => (
  <div className="bg-[#F8F7FF] rounded-full px-2 py-1 text-center">
    <div className="text-xs text-[#8B5CF6] font-medium">{label}</div>
    <div className="text-xs text-gray-500">{range}</div>
  </div>
);

const SkillItem: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center space-x-3">
    <ArrowRight className="h-4 w-4 text-[#8B5CF6]" />
    <span className="text-gray-700">{label}</span>
  </div>
);

export default UserProfile;