import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  BarChart2,
  Settings,
  Shield,
  Bell,
  Database,
  Search,
  UserPlus,
  AlertTriangle,
  Activity,
  Clock,
  Calendar,
  LogOut
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import UserStatsCard from './UserStatsCard';
import ActivityChart from './ActivityChart';
import RecentActivityTable from './RecentActivityTable';

interface AdminDashboardProps {
  adminRole?: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminRole = 'super_admin' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    bannedUsers: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
    fetchDashboardData();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data, error } = await supabase.rpc('is_admin');
      
      if (error) throw error;
      
      if (!data) {
        toast.error('You do not have admin access');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      toast.error('Failed to verify admin access');
      navigate('/dashboard');
    }
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch user stats
      const { data: userStats, error: userStatsError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' });
      
      if (userStatsError) throw userStatsError;
      
      // Fetch banned users count
      const { data: bannedUsers, error: bannedError } = await supabase
        .from('user_bans')
        .select('id', { count: 'exact' })
        .or('is_permanent.eq.true,banned_until.gt.now()');
      
      if (bannedError) throw bannedError;
      
      // Fetch new users today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: newUsers, error: newUsersError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .gte('created_at', today.toISOString());
      
      if (newUsersError) throw newUsersError;
      
      // Fetch recent admin activity
      const { data: activity, error: activityError } = await supabase
        .from('admin_logs')
        .select(`
          id,
          action,
          entity_type,
          entity_id,
          details,
          created_at,
          admin:admin_id(
            id,
            user:user_id(
              id,
              username
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (activityError) throw activityError;
      
      // Fetch analytics data for chart
      const { data: analytics, error: analyticsError } = await supabase
        .from('app_analytics')
        .select('event_type, created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (analyticsError) throw analyticsError;
      
      // Process analytics data for chart
      const processedData = processAnalyticsData(analytics || []);
      
      setStats({
        totalUsers: userStats?.length || 0,
        activeUsers: (userStats?.length || 0) - (bannedUsers?.length || 0),
        newUsersToday: newUsers?.length || 0,
        bannedUsers: bannedUsers?.length || 0
      });
      
      setRecentActivity(activity || []);
      setActivityData(processedData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const processAnalyticsData = (data: any[]) => {
    // Group data by day and event type
    const groupedData: Record<string, Record<string, number>> = {};
    
    data.forEach(item => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      const eventType = item.event_type;
      
      if (!groupedData[date]) {
        groupedData[date] = {};
      }
      
      if (!groupedData[date][eventType]) {
        groupedData[date][eventType] = 0;
      }
      
      groupedData[date][eventType]++;
    });
    
    // Convert to array format for chart
    const chartData = Object.entries(groupedData).map(([date, events]) => {
      return {
        date,
        ...events
      };
    });
    
    // Sort by date
    chartData.sort((a, b) => a.date.localeCompare(b.date));
    
    return chartData;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebar activeItem="dashboard" adminRole={adminRole} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Admin Dashboard" />
        
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <UserStatsCard
                  title="Total Users"
                  value={stats.totalUsers}
                  icon={<Users className="h-6 w-6 text-blue-500" />}
                  change="+5%"
                  changeType="increase"
                />
                <UserStatsCard
                  title="Active Users"
                  value={stats.activeUsers}
                  icon={<Activity className="h-6 w-6 text-green-500" />}
                  change="+3%"
                  changeType="increase"
                />
                <UserStatsCard
                  title="New Users Today"
                  value={stats.newUsersToday}
                  icon={<UserPlus className="h-6 w-6 text-purple-500" />}
                  change="+12"
                  changeType="increase"
                />
                <UserStatsCard
                  title="Banned Users"
                  value={stats.bannedUsers}
                  icon={<AlertTriangle className="h-6 w-6 text-red-500" />}
                  change="-2"
                  changeType="decrease"
                />
              </div>
              
              {/* Activity Chart */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">User Activity</h2>
                <ActivityChart data={activityData} />
              </div>
              
              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Admin Activity</h2>
                  <button
                    onClick={() => navigate('/admin/logs')}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    View All
                  </button>
                </div>
                <RecentActivityTable activities={recentActivity} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;