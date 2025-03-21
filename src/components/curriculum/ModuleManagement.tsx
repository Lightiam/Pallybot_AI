import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  FileText,
  Video,
  CheckCircle,
  Code,
  MoveUp,
  MoveDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface Module {
  id: string;
  title: string;
  description: string;
  content: {
    type: string;
    duration: number;
  };
  order_index: number;
  training_id: string;
}

interface Training {
  id: string;
  title: string;
}

const ModuleManagement: React.FC = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [selectedTrainingId, setSelectedTrainingId] = useState<string>('');
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    type: '',
    duration: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrainings();
  }, []);

  useEffect(() => {
    if (selectedTrainingId) {
      fetchModules(selectedTrainingId);
    }
  }, [selectedTrainingId]);

  const fetchTrainings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('trainings')
        .select('id, title')
        .order('title');

      if (error) throw error;
      setTrainings(data || []);
      
      if (data && data.length > 0) {
        setSelectedTrainingId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching trainings:', error);
      toast.error('Failed to load trainings');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchModules = async (trainingId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('training_modules')
        .select('*')
        .eq('training_id', trainingId)
        .order('order_index');

      if (error) throw error;
      setModules(data || []);
    } catch (error) {
      console.error('Error fetching modules:', error);
      toast.error('Failed to load modules');
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (module: Module) => {
    setEditingModuleId(module.id);
    setEditForm({
      title: module.title,
      description: module.description,
      type: module.content.type,
      duration: module.content.duration
    });
  };

  const cancelEditing = () => {
    setEditingModuleId(null);
    setEditForm({
      title: '',
      description: '',
      type: '',
      duration: 0
    });
  };

  const updateModule = async (moduleId: string) => {
    try {
      const { error } = await supabase
        .from('training_modules')
        .update({
          title: editForm.title,
          description: editForm.description,
          content: {
            type: editForm.type,
            duration: editForm.duration
          }
        })
        .eq('id', moduleId);

      if (error) throw error;
      
      // Update local state
      setModules(modules.map(m => 
        m.id === moduleId 
          ? {
              ...m, 
              title: editForm.title,
              description: editForm.description,
              content: {
                type: editForm.type,
                duration: editForm.duration
              }
            } 
          : m
      ));
      
      cancelEditing();
      toast.success('Module updated successfully');
    } catch (error) {
      console.error('Error updating module:', error);
      toast.error('Failed to update module');
    }
  };

  const deleteModule = async (moduleId: string) => {
    if (!window.confirm('Are you sure you want to delete this module?')) return;

    try {
      const { error } = await supabase
        .from('training_modules')
        .delete()
        .eq('id', moduleId);

      if (error) throw error;
      
      // Update local state
      setModules(modules.filter(m => m.id !== moduleId));
      toast.success('Module deleted successfully');
    } catch (error) {
      console.error('Error deleting module:', error);
      toast.error('Failed to delete module');
    }
  };

  const moveModule = async (moduleId: string, direction: 'up' | 'down') => {
    const currentIndex = modules.findIndex(m => m.id === moduleId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= modules.length) return;
    
    // Swap modules in local state
    const updatedModules = [...modules];
    const temp = updatedModules[currentIndex];
    updatedModules[currentIndex] = updatedModules[newIndex];
    updatedModules[newIndex] = temp;
    
    // Update order_index
    updatedModules[currentIndex].order_index = currentIndex;
    updatedModules[newIndex].order_index = newIndex;
    
    try {
      // Update in database
      const updates = [
        { id: updatedModules[currentIndex].id, order_index: currentIndex },
        { id: updatedModules[newIndex].id, order_index: newIndex }
      ];
      
      for (const update of updates) {
        const { error } = await supabase
          .from('training_modules')
          .update({ order_index: update.order_index })
          .eq('id', update.id);
          
        if (error) throw error;
      }
      
      setModules(updatedModules);
    } catch (error) {
      console.error('Error reordering modules:', error);
      toast.error('Failed to reorder modules');
      // Revert local state on error
      fetchModules(selectedTrainingId);
    }
  };

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'reading':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'video':
        return <Video className="h-5 w-5 text-red-600" />;
      case 'quiz':
        return <CheckCircle className="h-5 w-5 text-purple-600" />;
      case 'assignment':
        return <FileText className="h-5 w-5 text-green-600" />;
      case 'code':
        return <Code className="h-5 w-5 text-gray-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/training')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Module Management</h1>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Curriculum</h2>
          <select
            value={selectedTrainingId}
            onChange={(e) => setSelectedTrainingId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {trainings.map((training) => (
              <option key={training.id} value={training.id}>
                {training.title}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Modules</h2>
            <button
              onClick={() => navigate(`/curriculum/create`)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Module</span>
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent" />
            </div>
          ) : modules.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No modules found</h3>
              <p className="text-gray-500 mb-6">
                This curriculum doesn't have any modules yet
              </p>
              <button
                onClick={() => navigate(`/curriculum/edit/${selectedTrainingId}`)}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add First Module
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {modules.map((module) => (
                <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                  {editingModuleId === module.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Module Title
                        </label>
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Module Type
                          </label>
                          <select
                            value={editForm.type}
                            onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="reading">Reading</option>
                            <option value="video">Video</option>
                            <option value="quiz">Quiz</option>
                            <option value="assignment">Assignment</option>
                            <option value="code">Code Exercise</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duration (minutes)
                          </label>
                          <input
                            type="number"
                            value={editForm.duration}
                            onChange={(e) => setEditForm({...editForm, duration: parseInt(e.target.value) || 0})}
                            min="1"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={cancelEditing}
                          className="px-4 py-2 text-gray-700 hover:text-gray-900"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => updateModule(module.id)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <Save className="h-4 w-4 mr-2 inline" />
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            {getModuleIcon(module.content.type)}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{module.title}</h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-500 capitalize">
                                {module.content.type}
                              </span>
                              <span className="text-sm text-gray-500">
                                {module.content.duration} minutes
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => moveModule(module.id, 'up')}
                            disabled={module.order_index === 0}
                            className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <MoveUp className="h-5 w-5 text-gray-500" />
                          </button>
                          <button
                            onClick={() => moveModule(module.id, 'down')}
                            disabled={module.order_index === modules.length - 1}
                            className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <MoveDown className="h-5 w-5 text-gray-500" />
                          </button>
                          <button
                            onClick={() => startEditing(module)}
                            className="p-1 hover:bg-gray-100 rounded-full"
                          >
                            <Edit className="h-5 w-5 text-gray-500" />
                          </button>
                          <button
                            onClick={() => deleteModule(module.id)}
                            className="p-1 hover:bg-red-100 rounded-full text-red-500"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      {module.description && (
                        <p className="text-sm text-gray-600 mt-2">{module.description}</p>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleManagement;