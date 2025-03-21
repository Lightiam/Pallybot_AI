import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  BarChart2,
  Clock,
  MessageSquare,
  Users,
  Activity,
  Download
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface ParticipantMetrics {
  userId: string;
  userName: string;
  speakingTime: number;
  chatMessages: number;
  screenShares: number;
  participationRate: number;
}

interface SessionStats {
  totalParticipants: number;
  avgParticipationRate: number;
  totalChatMessages: number;
  totalSpeakingTime: number;
}

const SessionAnalytics: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [metrics, setMetrics] = useState<ParticipantMetrics[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [sessionId]);

  const fetchAnalytics = async () => {
    try {
      // Fetch participant metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from('participation_metrics')
        .select(`
          user_id,
          profiles:user_id(name),
          speaking_time,
          chat_messages,
          screen_shares
        `)
        .eq('session_id', sessionId);

      if (metricsError) throw metricsError;

      // Fetch session statistics
      const { data: statsData, error: statsError } = await supabase
        .from('session_analytics')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (statsError) throw statsError;

      // Transform metrics data
      const transformedMetrics = metricsData.map(m => ({
        userId: m.user_id,
        userName: m.profiles.name,
        speakingTime: m.speaking_time,
        chatMessages: m.chat_messages,
        screenShares: m.screen_shares,
        participationRate: calculateParticipationRate(m)
      }));

      setMetrics(transformedMetrics);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateParticipationRate = (metrics: any): number => {
    const weights = {
      speaking: 0.5,
      chat: 0.3,
      screenShare: 0.2
    };

    const speakingScore = metrics.speaking_time > 0 ? weights.speaking : 0;
    const chatScore = metrics.chat_messages > 0 ? weights.chat : 0;
    const screenShareScore = metrics.screen_shares > 0 ? weights.screenShare : 0;

    return (speakingScore + chatScore + screenShareScore) * 100;
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return [
      hours > 0 ? `${hours}h` : null,
      minutes > 0 ? `${minutes}m` : null,
      `${remainingSeconds}s`
    ].filter(Boolean).join(' ');
  };

  const exportAnalytics = () => {
    const csvContent = [
      ['Name', 'Speaking Time', 'Chat Messages', 'Screen Shares', 'Participation Rate'],
      ...metrics.map(m => [
        m.userName,
        formatDuration(m.speakingTime),
        m.chatMessages,
        m.screenShares,
        `${m.participationRate.toFixed(1)}%`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-${sessionId}-analytics.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Session Analytics</h1>
          <button
            onClick={exportAnalytics}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Download className="h-5 w-5 mr-2" />
            Export Report
          </button>
        </div>

        {/* Overview Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Participants</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalParticipants}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg. Participation Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.avgParticipationRate.toFixed(1)}%
                  </p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Messages</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalChatMessages}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Speaking Time</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatDuration(stats.totalSpeakingTime)}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>
        )}

        {/* Participant Metrics */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Participant Metrics</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Speaking Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chat Messages
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Screen Shares
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participation Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {metrics.map((metric) => (
                  <tr key={metric.userId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-purple-600">
                            {metric.userName[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{metric.userName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDuration(metric.speakingTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {metric.chatMessages}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {metric.screenShares}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-purple-600 rounded-full h-2"
                            style={{ width: `${metric.participationRate}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500">
                          {metric.participationRate.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionAnalytics;