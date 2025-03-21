import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface PostProps {
  post: {
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
  };
  currentUserId: string;
  onPostUpdated: () => void;
}

const Post: React.FC<PostProps> = ({ post, currentUserId, onPostUpdated }) => {
  const [isLiking, setIsLiking] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleLike = async () => {
    try {
      setIsLiking(true);

      // Check if user already liked the post
      const { data: existingLike } = await supabase
        .from('likes')
        .select()
        .eq('user_id', currentUserId)
        .eq('post_id', post.id)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', currentUserId)
          .eq('post_id', post.id);

        await supabase
          .from('posts')
          .update({ likes_count: post.likes_count - 1 })
          .eq('id', post.id);
      } else {
        // Like
        await supabase
          .from('likes')
          .insert({ user_id: currentUserId, post_id: post.id });

        await supabase
          .from('posts')
          .update({ likes_count: post.likes_count + 1 })
          .eq('id', post.id);
      }

      onPostUpdated();
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to like post');
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id)
        .eq('user_id', currentUserId);

      if (error) throw error;

      onPostUpdated();
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const startConversation = () => {
    if (post.author.id === currentUserId) {
      toast.error("You can't message yourself");
      return;
    }
    
    window.location.href = `/messages/${post.author.id}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <Link to={`/profile/${post.author.username}`}>
            <img
              src={post.author.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${post.author.username}`}
              alt={post.author.username}
              className="h-10 w-10 rounded-full"
            />
          </Link>
          <div>
            <Link to={`/profile/${post.author.username}`} className="font-medium text-gray-900 hover:underline">
              {post.author.username}
            </Link>
            <span className="text-sm text-gray-500 block">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MoreHorizontal className="h-5 w-5 text-gray-500" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
              {post.author.id === currentUserId ? (
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                >
                  Delete Post
                </button>
              ) : (
                <button
                  onClick={startConversation}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Message {post.author.username}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 text-gray-700">{post.content}</p>

      {post.image_url && (
        <img
          src={post.image_url}
          alt="Post"
          className="mt-4 rounded-lg max-h-96 w-full object-cover"
        />
      )}

      <div className="flex items-center space-x-6 mt-4 pt-4 border-t">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className="flex items-center space-x-2 text-gray-500 hover:text-purple-600 transition-colors disabled:opacity-50"
        >
          <ThumbsUp className="h-5 w-5" />
          <span>{post.likes_count}</span>
        </button>
        <button className="flex items-center space-x-2 text-gray-500 hover:text-purple-600 transition-colors">
          <MessageCircle className="h-5 w-5" />
          <span>{post.comments_count}</span>
        </button>
        <button className="flex items-center space-x-2 text-gray-500 hover:text-purple-600 transition-colors">
          <Share2 className="h-5 w-5" />
          <span>{post.shares_count}</span>
        </button>
        {post.author.id !== currentUserId && (
          <button 
            onClick={startConversation}
            className="ml-auto flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            <span>Message</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Post;