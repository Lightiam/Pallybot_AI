import { couchdbClient } from './couchdbClient';
import { v4 as uuidv4 } from 'uuid';

export interface Profile {
  _id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: 'trainee' | 'trainer' | 'admin';
  updated_at: string;
  created_at: string;
  type: 'profile';
}

export interface ProfileUpdate {
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  role?: 'trainee' | 'trainer' | 'admin';
}

class ProfileService {
  private static instance: ProfileService;
  private dbName = 'profiles';

  private constructor() {}

  public static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  public async createProfile(
    userId: string,
    username: string,
    fullName?: string,
    avatarUrl?: string,
    bio?: string,
    role: 'trainee' | 'trainer' | 'admin' = 'trainee'
  ): Promise<string> {
    const profile: Profile = {
      _id: userId,
      username,
      full_name: fullName || null,
      avatar_url: avatarUrl || null,
      bio: bio || null,
      role,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      type: 'profile'
    };

    const result = await couchdbClient.createDocument<{ id: string }>(this.dbName, profile);
    return result.id;
  }

  public async getProfile(userId: string): Promise<Profile | null> {
    try {
      return await couchdbClient.getDocument<Profile>(this.dbName, userId);
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

  public async updateProfile(userId: string, updates: ProfileUpdate): Promise<boolean> {
    try {
      const profile = await this.getProfile(userId);
      if (!profile) return false;

      const updatedProfile = {
        ...profile,
        ...updates,
        updated_at: new Date().toISOString()
      };

      await couchdbClient.updateDocument<any>(this.dbName, userId, updatedProfile);
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  }

  public async deleteProfile(userId: string): Promise<boolean> {
    try {
      await couchdbClient.deleteDocument<any>(this.dbName, userId);
      return true;
    } catch (error) {
      console.error('Error deleting profile:', error);
      return false;
    }
  }

  public async getProfilesByRole(role: 'trainee' | 'trainer' | 'admin'): Promise<Profile[]> {
    try {
      const selector = {
        selector: {
          role,
          type: 'profile'
        }
      };
      const result = await couchdbClient.findDocuments<{ docs: Profile[] }>(this.dbName, selector);
      return result.docs;
    } catch (error) {
      console.error('Error fetching profiles by role:', error);
      return [];
    }
  }
}

export const profileService = ProfileService.getInstance();
