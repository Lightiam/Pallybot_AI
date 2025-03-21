import couchdb
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class CouchDBClient:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(CouchDBClient, cls).__new__(cls)
            # Initialize the connection
            couchdb_url = os.getenv('COUCHDB_URL', 'http://localhost:5984')
            couchdb_user = os.getenv('COUCHDB_USER', 'admin')
            couchdb_password = os.getenv('COUCHDB_PASSWORD', 'pallybot-admin-password')
            
            # Connect to CouchDB
            cls._instance.server = couchdb.Server(couchdb_url)
            cls._instance.server.resource.credentials = (couchdb_user, couchdb_password)
            
            # Create or get databases
            cls._instance._ensure_databases()
        
        return cls._instance
    
    def _ensure_databases(self):
        """Ensure all required databases exist"""
        required_dbs = ['profiles', 'posts', 'comments', 'likes', 'trainings', 'training_modules']
        
        for db_name in required_dbs:
            if db_name not in self.server:
                self.server.create(db_name)
    
    def get_db(self, db_name):
        """Get a database by name"""
        return self.server[db_name]
    
    def create_document(self, db_name, document):
        """Create a new document in the specified database"""
        db = self.get_db(db_name)
        doc_id, doc_rev = db.save(document)
        return doc_id
    
    def get_document(self, db_name, doc_id):
        """Get a document by ID from the specified database"""
        db = self.get_db(db_name)
        try:
            return db[doc_id]
        except couchdb.ResourceNotFound:
            return None
    
    def update_document(self, db_name, doc_id, updates):
        """Update an existing document"""
        db = self.get_db(db_name)
        try:
            doc = db[doc_id]
            for key, value in updates.items():
                doc[key] = value
            db.save(doc)
            return True
        except couchdb.ResourceNotFound:
            return False
    
    def delete_document(self, db_name, doc_id):
        """Delete a document by ID"""
        db = self.get_db(db_name)
        try:
            doc = db[doc_id]
            db.delete(doc)
            return True
        except couchdb.ResourceNotFound:
            return False
    
    def query_documents(self, db_name, query):
        """Query documents using CouchDB views"""
        db = self.get_db(db_name)
        return db.view(query)
    
    def find_documents(self, db_name, selector):
        """Find documents using Mango queries"""
        db = self.get_db(db_name)
        return db.find(selector)

# Singleton instance
couchdb_client = CouchDBClient()
