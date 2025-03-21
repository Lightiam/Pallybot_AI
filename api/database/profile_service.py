from .couchdb_client import couchdb_client
import uuid
from datetime import datetime

class ProfileService:
    def __init__(self):
        self.db_name = 'profiles'
    
    def create_profile(self, user_id, username, full_name=None, avatar_url=None, bio=None, role='trainee'):
        """Create a new user profile"""
        profile = {
            '_id': user_id,
            'username': username,
            'full_name': full_name,
            'avatar_url': avatar_url,
            'bio': bio,
            'role': role,
            'updated_at': datetime.now().isoformat(),
            'created_at': datetime.now().isoformat(),
            'type': 'profile'
        }
        return couchdb_client.create_document(self.db_name, profile)
    
    def get_profile(self, user_id):
        """Get a user profile by ID"""
        return couchdb_client.get_document(self.db_name, user_id)
    
    def update_profile(self, user_id, updates):
        """Update a user profile"""
        return couchdb_client.update_document(self.db_name, user_id, updates)
    
    def delete_profile(self, user_id):
        """Delete a user profile"""
        return couchdb_client.delete_document(self.db_name, user_id)
    
    def get_profiles_by_role(self, role):
        """Get profiles by role"""
        selector = {
            'selector': {
                'role': role,
                'type': 'profile'
            }
        }
        return couchdb_client.find_documents(self.db_name, selector)

profile_service = ProfileService()
