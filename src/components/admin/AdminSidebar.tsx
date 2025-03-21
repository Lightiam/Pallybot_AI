import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  BarChart2,
  FileText,
  LogOut,
  Database,
  AlertTriangle,
  BookOpen
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface AdminSidebarProps {
  activeItem: string;
  adminRole?: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  activeItem,
  adminRole = 'super_admin'
}) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const menuItems = [
    {
      name: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: '/admin',
      roles: ['super_admin', 'content_admin', 'user_admin']
    },
    {
      name: 'users',
      label: 'User Management',
      icon: <Users className="h-5 w-5" />,
      path: '/admin/users',
      roles: ['super_admin', 'user_admin']
    },
    {
      name: 'content',
      label: 'Content Management',
      icon: <FileText className="h-5 w-5" />,
      path: '/admin/content',
      roles: ['super_admin', 'content_admin']
    },
    {
      name: 'trainings',
      label: 'Training Management',
      icon: <BookOpen className="h-5 w-5" />,
      path: '/admin/trainings',
      roles: ['super_admin', 'content_admin']
    },
    {
      name: 'analytics',
      label: 'Analytics',
      icon: <BarChart2 className="h-5 w-5" />,
      path: '/admin/analytics',
      roles: ['super_admin', 'content_admin', 'user_admin']
    },
    {
      name: 'roles',
      label: 'Role Management',
      icon: <Shield className="h-5 w-5" />,
      path: '/admin/roles',
      roles: ['super_admin']
    },
    {
      name: 'bans',
      label: 'User Bans',
      icon: <AlertTriangle className="h-5 w-5" />,
      path: '/admin/bans',
      roles: ['super_admin', 'user_admin']
    },
    {
      name: 'logs',
      label: 'Admin Logs',
      icon: <Database className="h-5 w-5" />,
      path: '/admin/logs',
      roles: ['super_admin']
    },
    {
      name: 'settings',
      label: 'System Settings',
      icon: <Settings className="h-5 w-5" />,
      path: '/admin/settings',
      roles: ['super_admin']
    }
  ];

  // Filter menu items based on admin role
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(adminRole)
  );

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-sm text-gray-500 capitalize">{adminRole.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeItem === item.name
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleSignOut}
          className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="ml-3">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;