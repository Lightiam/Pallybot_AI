import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Plus, MessageSquare, Clock, Check, CheckCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  user_id: string;
  username: string;
  avatar_url: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

const MessagesList: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchConversations();
    
    // Set up real-time subscription for new messages
    const subscription = supabase
      .channel('direct_messages_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'direct_messages'
      }, () => {
        // Refresh conversations when a new message is received
        fetchConversations();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Get all messages sent by or received by the current user
      const { data: messages, error } = await supabase
        .from('direct_messages')
        .select(`
          id,
          sender_id,
          receiver_id,
          content,
          created_at,
          read,
          sender:profiles(username, avatar_url),
          receiver:profiles(username, avatar_url)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching conversations:", error);
        throw error;
      }
      
      // Process messages to create conversation list
      const conversationMap = new Map<string, Conversation>();
      
      if (messages) {
        messages.forEach(message => {
          // Determine the other user in the conversation
          const isCurrentUserSender = message.sender_id === user.id;
          const otherUserId = isCurrentUserSender ? message.receiver_id : message.sender_id;
          const otherUser = isCurrentUserSender ? message.receiver : message.sender;
          
          if (!conversationMap.has(otherUserId)) {
            conversationMap.set(otherUserId, {
              user_id: otherUserId,
              username: otherUser.username,
              avatar_url: otherUser.avatar_url,
              last_message: message.content,
              last_message_time: message.created_at,
              unread_count: (!isCurrentUserSender && !message.read) ? 1 : 0
            });
          } else if (!isCurrentUserSender && !message.read) {
            // Increment unread count for existing conversation
            const conversation = conversationMap.get(otherUserId)!;
            conversation.unread_count += 1;
          }
        });
      }
      
      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const startNewConversation = () => {
    navigate('/community');
  };

  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const filteredConversations = searchQuery
    ? conversations.filter(conversation => 
        conversation.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
            <button
              onClick={startNewConversation}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="New message"
            >
              <Plus className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-purple-600" />
              </div>
              {searchQuery ? (
                <>
                  <h3 className="text-lg font-medium text-gray-900">No conversations found</h3>
                  <p className="text-gray-500 mt-1">
                    Try searching with a different term
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-gray-900">No messages yet</h3>
                  <p className="text-gray-500 mt-1">
                    Start a conversation with someone from the community
                  </p>
                  <button
                    onClick={startNewConversation}
                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Find People
                  </button>
                </>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredConversations.map((conversation) => (
                <li key={conversation.user_id}>
                  <Link
                    to={`/messages/${conversation.user_id}`}
                    className="flex items-center p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
                      {conversation.avatar_url ? (
                        <img 
                          src={conversation.avatar_url} 
                          alt={conversation.username} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-purple-600" />
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">{conversation.username}</h3>
                        <p className="text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatMessageTime(conversation.last_message_time)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-600 truncate max-w-xs">
                          {conversation.last_message}
                        </p>
                        {conversation.unread_count > 0 ? (
                          <span className="bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {conversation.unread_count}
                          </span>
                        ) : (
                          <CheckCheck className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesList;