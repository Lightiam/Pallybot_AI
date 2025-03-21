import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, 
  Users, 
  Bookmark, 
  TrendingUp, 
  Clock,
  Search,
  Filter,
  MessageCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import CreatePost from './CreatePost';
import Post from './Post';

interface PostType {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  author: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

const Community: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'trending' | 'latest' | 'following'>('latest');
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getUser();
  }, []);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('posts')
        .select(`
          *,
          author:profiles(id, username, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (selectedTab === 'trending') {
        query = query.order('likes_count', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;

      setPosts(data as PostType[]);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedTab]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/community" className="text-xl font-bold text-gray-900">
                Community
              </Link>
              <div className="hidden md:flex items-center space-x-4">
                <NavLink active={selectedTab === 'trending'} onClick={() => setSelectedTab('trending')}>
                  <TrendingUp className="h-4 w-4" />
                  Trending
                </NavLink>
                <NavLink active={selectedTab === 'latest'} onClick={() => setSelectedTab('latest')}>
                  <Clock className="h-4 w-4" />
                  Latest
                </NavLink>
                <NavLink active={selectedTab === 'following'} onClick={() => setSelectedTab('following')}>
                  <Users className="h-4 w-4" />
                  Following
                </NavLink>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/messages" 
                className="p-2 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 transition-colors"
                title="Messages"
              >
                <MessageCircle className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post */}
            <CreatePost onPostCreated={fetchPosts} />

            {/* Search and Filter */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search posts..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Filter className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Posts */}
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent mx-auto"></div>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No posts yet. Be the first to post!
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <Post
                    key={post.id}
                    post={post}
                    currentUserId={currentUserId || ''}
                    onPostUpdated={fetchPosts}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
              <div className="space-y-3">
                <QuickLink
                  icon={<MessageSquare className="h-5 w-5" />}
                  title="Discussions"
                  description="Join ongoing conversations"
                />
                <QuickLink
                  icon={<Users className="h-5 w-5" />}
                  title="Find Members"
                  description="Connect with other developers"
                  to="/community/members"
                />
                <QuickLink
                  icon={<MessageCircle className="h-5 w-5" />}
                  title="Messages"
                  description="View your conversations"
                  to="/messages"
                />
                <QuickLink
                  icon={<Bookmark className="h-5 w-5" />}
                  title="Saved Posts"
                  description="View your bookmarked content"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NavLink: React.FC<{
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}> = ({ children, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
      active
        ? 'bg-purple-100 text-purple-700'
        : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    {children}
  </button>
);

const QuickLink: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  to?: string;
}> = ({ icon, title, description, to = "#" }) => (
  <Link
    to={to}
    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
  >
    <div className="text-purple-600">{icon}</div>
    <div>
      <h4 className="font-medium text-gray-900">{title}</h4>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  </Link>
);

export default Community;