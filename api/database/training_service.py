from .couchdb_client import couchdb_client
import uuid
from datetime import datetime

class TrainingService:
    def __init__(self):
        self.db_name = 'trainings'
        self.modules_db = 'training_modules'
    
    def create_training(self, title, description, created_by, category_id=None, 
                        duration=None, learning_objectives=None, prerequisites=None,
                        target_audience=None, max_participants=None, status='draft'):
        """Create a new training"""
        training_id = str(uuid.uuid4())
        training = {
            '_id': training_id,
            'title': title,
            'description': description,
            'category_id': category_id,
            'duration': duration,
            'learning_objectives': learning_objectives or [],
            'prerequisites': prerequisites or [],
            'target_audience': target_audience,
            'max_participants': max_participants,
            'status': status,
            'created_by': created_by,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat(),
            'type': 'training'
        }
        return couchdb_client.create_document(self.db_name, training)
    
    def get_training(self, training_id):
        """Get a training by ID"""
        return couchdb_client.get_document(self.db_name, training_id)
    
    def update_training(self, training_id, updates):
        """Update a training"""
        return couchdb_client.update_document(self.db_name, training_id, updates)
    
    def delete_training(self, training_id):
        """Delete a training"""
        return couchdb_client.delete_document(self.db_name, training_id)
    
    def get_trainings_by_status(self, status, limit=20):
        """Get trainings by status"""
        selector = {
            'selector': {
                'status': status,
                'type': 'training'
            },
            'sort': [{'created_at': 'desc'}],
            'limit': limit
        }
        return couchdb_client.find_documents(self.db_name, selector)
    
    def get_trainings_by_creator(self, creator_id):
        """Get trainings by creator"""
        selector = {
            'selector': {
                'created_by': creator_id,
                'type': 'training'
            },
            'sort': [{'created_at': 'desc'}]
        }
        return couchdb_client.find_documents(self.db_name, selector)
    
    def create_module(self, training_id, title, content, description=None, order_index=0, duration=None):
        """Create a new training module"""
        module_id = str(uuid.uuid4())
        module = {
            '_id': module_id,
            'training_id': training_id,
            'title': title,
            'description': description,
            'content': content,
            'order_index': order_index,
            'duration': duration,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat(),
            'type': 'module'
        }
        return couchdb_client.create_document(self.modules_db, module)
    
    def get_modules_by_training(self, training_id):
        """Get all modules for a training"""
        selector = {
            'selector': {
                'training_id': training_id,
                'type': 'module'
            },
            'sort': [{'order_index': 'asc'}]
        }
        return couchdb_client.find_documents(self.modules_db, selector)

training_service = TrainingService()
