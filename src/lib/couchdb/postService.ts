import { couchdbClient } from './couchdbClient';
import { v4 as uuidv4 } from 'uuid';

export interface Post {
  _id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  type: 'post';
}

export interface PostUpdate {
  content?: string;
  image_url?: string | null;
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
}

class PostService {
  private static instance: PostService;
  private dbName = 'posts';

  private constructor() {}

  public static getInstance(): PostService {
    if (!PostService.instance) {
      PostService.instance = new PostService();
    }
    return PostService.instance;
  }

  public async createPost(
    userId: string,
    content: string,
    imageUrl?: string
  ): Promise<string> {
    const postId = uuidv4();
    const post: Post = {
      _id: postId,
      user_id: userId,
      content,
      image_url: imageUrl || null,
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
      created_at: new Date().toISOString(),
      type: 'post'
    };

    const result = await couchdbClient.createDocument<{ id: string }>(this.dbName, post);
    return result.id;
  }

  public async getPost(postId: string): Promise<Post | null> {
    try {
      return await couchdbClient.getDocument<Post>(this.dbName, postId);
    } catch (error) {
      console.error('Error fetching post:', error);
      return null;
    }
  }

  public async updatePost(postId: string, updates: PostUpdate): Promise<boolean> {
    try {
      const post = await this.getPost(postId);
      if (!post) return false;

      const updatedPost = {
        ...post,
        ...updates
      };

      await couchdbClient.updateDocument<any>(this.dbName, postId, updatedPost);
      return true;
    } catch (error) {
      console.error('Error updating post:', error);
      return false;
    }
  }

  public async deletePost(postId: string): Promise<boolean> {
    try {
      await couchdbClient.deleteDocument<any>(this.dbName, postId);
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  }

  public async getUserPosts(userId: string): Promise<Post[]> {
    try {
      const selector = {
        selector: {
          user_id: userId,
          type: 'post'
        },
        sort: [{ created_at: 'desc' }]
      };
      const result = await couchdbClient.findDocuments<{ docs: Post[] }>(this.dbName, selector);
      return result.docs;
    } catch (error) {
      console.error('Error fetching user posts:', error);
      return [];
    }
  }

  public async getRecentPosts(limit: number = 20): Promise<Post[]> {
    try {
      const selector = {
        selector: {
          type: 'post'
        },
        sort: [{ created_at: 'desc' }],
        limit
      };
      const result = await couchdbClient.findDocuments<{ docs: Post[] }>(this.dbName, selector);
      return result.docs;
    } catch (error) {
      console.error('Error fetching recent posts:', error);
      return [];
    }
  }
}

export const postService = PostService.getInstance();
