import { couchdbClient } from './couchdbClient';
import { v4 as uuidv4 } from 'uuid';

export interface Training {
  _id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  duration: string | null;
  learning_objectives: string[];
  prerequisites: string[];
  target_audience: string | null;
  max_participants: number | null;
  status: 'draft' | 'published' | 'archived';
  created_by: string;
  created_at: string;
  updated_at: string;
  type: 'training';
}

export interface TrainingModule {
  _id: string;
  training_id: string;
  title: string;
  description: string | null;
  content: any;
  order_index: number;
  duration: string | null;
  created_at: string;
  updated_at: string;
  type: 'module';
}

export interface TrainingUpdate {
  title?: string;
  description?: string;
  category_id?: string;
  duration?: string;
  learning_objectives?: string[];
  prerequisites?: string[];
  target_audience?: string;
  max_participants?: number;
  status?: 'draft' | 'published' | 'archived';
}

export interface ModuleUpdate {
  title?: string;
  description?: string;
  content?: any;
  order_index?: number;
  duration?: string;
}

class TrainingService {
  private static instance: TrainingService;
  private dbName = 'trainings';
  private modulesDbName = 'training_modules';

  private constructor() {}

  public static getInstance(): TrainingService {
    if (!TrainingService.instance) {
      TrainingService.instance = new TrainingService();
    }
    return TrainingService.instance;
  }

  public async createTraining(
    title: string,
    description: string | null,
    createdBy: string,
    categoryId?: string,
    duration?: string,
    learningObjectives?: string[],
    prerequisites?: string[],
    targetAudience?: string,
    maxParticipants?: number,
    status: 'draft' | 'published' | 'archived' = 'draft'
  ): Promise<string> {
    const trainingId = uuidv4();
    const training: Training = {
      _id: trainingId,
      title,
      description,
      category_id: categoryId || null,
      duration: duration || null,
      learning_objectives: learningObjectives || [],
      prerequisites: prerequisites || [],
      target_audience: targetAudience || null,
      max_participants: maxParticipants || null,
      status,
      created_by: createdBy,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      type: 'training'
    };

    const result = await couchdbClient.createDocument<{ id: string }>(this.dbName, training);
    return result.id;
  }

  public async getTraining(trainingId: string): Promise<Training | null> {
    try {
      return await couchdbClient.getDocument<Training>(this.dbName, trainingId);
    } catch (error) {
      console.error('Error fetching training:', error);
      return null;
    }
  }

  public async updateTraining(trainingId: string, updates: TrainingUpdate): Promise<boolean> {
    try {
      const training = await this.getTraining(trainingId);
      if (!training) return false;

      const updatedTraining = {
        ...training,
        ...updates,
        updated_at: new Date().toISOString()
      };

      await couchdbClient.updateDocument<any>(this.dbName, trainingId, updatedTraining);
      return true;
    } catch (error) {
      console.error('Error updating training:', error);
      return false;
    }
  }

  public async deleteTraining(trainingId: string): Promise<boolean> {
    try {
      await couchdbClient.deleteDocument<any>(this.dbName, trainingId);
      return true;
    } catch (error) {
      console.error('Error deleting training:', error);
      return false;
    }
  }

  public async getTrainingsByStatus(
    status: 'draft' | 'published' | 'archived',
    limit: number = 20
  ): Promise<Training[]> {
    try {
      const selector = {
        selector: {
          status,
          type: 'training'
        },
        sort: [{ created_at: 'desc' }],
        limit
      };
      const result = await couchdbClient.findDocuments<{ docs: Training[] }>(this.dbName, selector);
      return result.docs;
    } catch (error) {
      console.error('Error fetching trainings by status:', error);
      return [];
    }
  }

  public async getTrainingsByCreator(creatorId: string): Promise<Training[]> {
    try {
      const selector = {
        selector: {
          created_by: creatorId,
          type: 'training'
        },
        sort: [{ created_at: 'desc' }]
      };
      const result = await couchdbClient.findDocuments<{ docs: Training[] }>(this.dbName, selector);
      return result.docs;
    } catch (error) {
      console.error('Error fetching trainings by creator:', error);
      return [];
    }
  }

  public async createModule(
    trainingId: string,
    title: string,
    content: any,
    description?: string,
    orderIndex: number = 0,
    duration?: string
  ): Promise<string> {
    const moduleId = uuidv4();
    const module: TrainingModule = {
      _id: moduleId,
      training_id: trainingId,
      title,
      description: description || null,
      content,
      order_index: orderIndex,
      duration: duration || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      type: 'module'
    };

    const result = await couchdbClient.createDocument<{ id: string }>(this.modulesDbName, module);
    return result.id;
  }

  public async getModulesByTraining(trainingId: string): Promise<TrainingModule[]> {
    try {
      const selector = {
        selector: {
          training_id: trainingId,
          type: 'module'
        },
        sort: [{ order_index: 'asc' }]
      };
      const result = await couchdbClient.findDocuments<{ docs: TrainingModule[] }>(
        this.modulesDbName,
        selector
      );
      return result.docs;
    } catch (error) {
      console.error('Error fetching modules by training:', error);
      return [];
    }
  }
}

export const trainingService = TrainingService.getInstance();
