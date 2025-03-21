import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Brain, 
  GraduationCap, 
  Home, 
  Bot, 
  Users, 
  DollarSign
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

const Navigation: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/signin');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <div className="h-10 w-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900">
              Pally Bot AI
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/"
              className={`flex items-center text-gray-600 hover:text-purple-700 font-medium transition-colors ${
                location.pathname === '/' ? 'text-purple-700' : ''
              }`}
            >
              <Home className="h-5 w-5 mr-2" />
              Home
            </Link>
            <Link 
              to="/training"
              className={`flex items-center text-gray-600 hover:text-purple-700 font-medium transition-colors ${
                location.pathname.startsWith('/training') ? 'text-purple-700' : ''
              }`}
            >
              <GraduationCap className="h-5 w-5 mr-2" />
              Upskill
            </Link>
            <Link 
              to="/interview/copilot"
              className={`flex items-center text-gray-600 hover:text-purple-700 font-medium transition-colors ${
                isActive('/interview/copilot') ? 'text-purple-700' : ''
              }`}
            >
              <Bot className="h-5 w-5 mr-2" />
              Interview Copilot
            </Link>
            <Link 
              to="/community"
              className={`flex items-center text-gray-600 hover:text-purple-700 font-medium transition-colors ${
                isActive('/community') ? 'text-purple-700' : ''
              }`}
            >
              <Users className="h-5 w-5 mr-2" />
              Community
            </Link>
            <Link 
              to="/pricing"
              className={`flex items-center text-gray-600 hover:text-purple-700 font-medium transition-colors ${
                isActive('/pricing') ? 'text-purple-700' : ''
              }`}
            >
              <DollarSign className="h-5 w-5 mr-2" />
              Pricing
            </Link>

            {isAuthenticated ? (
              <button
                onClick={handleSignOut}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] font-medium"
              >
                Sign Out
              </button>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="px-4 py-2 text-gray-700 hover:text-purple-700 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;