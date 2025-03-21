from .couchdb_client import couchdb_client
import uuid
from datetime import datetime

class PostService:
    def __init__(self):
        self.db_name = 'posts'
    
    def create_post(self, user_id, content, image_url=None):
        """Create a new post"""
        post_id = str(uuid.uuid4())
        post = {
            '_id': post_id,
            'user_id': user_id,
            'content': content,
            'image_url': image_url,
            'likes_count': 0,
            'comments_count': 0,
            'shares_count': 0,
            'created_at': datetime.now().isoformat(),
            'type': 'post'
        }
        return couchdb_client.create_document(self.db_name, post)
    
    def get_post(self, post_id):
        """Get a post by ID"""
        return couchdb_client.get_document(self.db_name, post_id)
    
    def update_post(self, post_id, updates):
        """Update a post"""
        return couchdb_client.update_document(self.db_name, post_id, updates)
    
    def delete_post(self, post_id):
        """Delete a post"""
        return couchdb_client.delete_document(self.db_name, post_id)
    
    def get_user_posts(self, user_id):
        """Get all posts by a user"""
        selector = {
            'selector': {
                'user_id': user_id,
                'type': 'post'
            },
            'sort': [{'created_at': 'desc'}]
        }
        return couchdb_client.find_documents(self.db_name, selector)
    
    def get_recent_posts(self, limit=20):
        """Get recent posts"""
        selector = {
            'selector': {
                'type': 'post'
            },
            'sort': [{'created_at': 'desc'}],
            'limit': limit
        }
        return couchdb_client.find_documents(self.db_name, selector)

post_service = PostService()
