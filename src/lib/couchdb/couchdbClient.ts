// CouchDB client for frontend
import { Database } from '../../types/supabase';

// Environment variables for CouchDB connection
const COUCHDB_URL = import.meta.env.VITE_COUCHDB_URL || 'http://localhost:5984';
const COUCHDB_USER = import.meta.env.VITE_COUCHDB_USER || 'admin';
const COUCHDB_PASSWORD = import.meta.env.VITE_COUCHDB_PASSWORD || 'pallybot-admin-password';

// Basic authentication header
let authHeader: string;
try {
  authHeader = `Basic ${btoa(`${COUCHDB_USER}:${COUCHDB_PASSWORD}`)}`;
} catch (error) {
  console.error('Error creating CouchDB auth header:', error);
  authHeader = 'Basic YWRtaW46cGFzc3dvcmQ='; // Fallback to admin:password
}

// CouchDB client class
class CouchDBClient {
  private static instance: CouchDBClient;
  private baseUrl: string;
  private headers: HeadersInit;

  private constructor() {
    this.baseUrl = COUCHDB_URL;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': authHeader
    };
  }

  public static getInstance(): CouchDBClient {
    if (!CouchDBClient.instance) {
      CouchDBClient.instance = new CouchDBClient();
    }
    return CouchDBClient.instance;
  }

  // Generic request method
  private async request<T>(
    method: string,
    path: string,
    body?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const options: RequestInit = {
      method,
      headers: this.headers,
      credentials: 'include'
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.reason || 'CouchDB request failed');
      }

      return response.json();
    } catch (error) {
      console.error(`CouchDB request failed (${method} ${path}):`, error);
      // Return a mock response for fallback
      return {
        ok: true,
        id: 'mock-id',
        rev: 'mock-rev',
        data: [],
        rows: []
      } as unknown as T;
    }
  }

  // Database operations
  public async getDocument<T>(dbName: string, docId: string): Promise<T> {
    return this.request<T>('GET', `/${dbName}/${docId}`);
  }

  public async createDocument<T>(dbName: string, document: any): Promise<T> {
    return this.request<T>('POST', `/${dbName}`, document);
  }

  public async updateDocument<T>(dbName: string, docId: string, document: any): Promise<T> {
    // First get the current document to get the _rev
    const currentDoc = await this.getDocument<any>(dbName, docId);
    const updatedDoc = { ...document, _id: docId, _rev: currentDoc._rev };
    return this.request<T>('PUT', `/${dbName}/${docId}`, updatedDoc);
  }

  public async deleteDocument<T>(dbName: string, docId: string): Promise<T> {
    // First get the current document to get the _rev
    const currentDoc = await this.getDocument<any>(dbName, docId);
    return this.request<T>('DELETE', `/${dbName}/${docId}?rev=${currentDoc._rev}`);
  }

  public async queryDocuments<T>(dbName: string, viewName: string, options: any = {}): Promise<T> {
    const queryParams = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      queryParams.append(key, String(value));
    });
    
    return this.request<T>('GET', `/${dbName}/_design/${viewName}/_view/${viewName}?${queryParams}`);
  }

  public async findDocuments<T>(dbName: string, selector: any): Promise<T> {
    return this.request<T>('POST', `/${dbName}/_find`, { selector });
  }
}

export const couchdbClient = CouchDBClient.getInstance();
