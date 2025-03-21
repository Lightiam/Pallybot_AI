import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  X, 
  Plus, 
  Trash2, 
  MoveUp, 
  MoveDown,
  BookOpen,
  FileText,
  Video,
  Code,
  CheckCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface Module {
  id: string;
  title: string;
  type: 'reading' | 'video' | 'quiz' | 'assignment' | 'code';
  description: string;
  duration: number;
}

const CurriculumCreate: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [modules, setModules] = useState<Module[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addModule = () => {
    const newModule: Module = {
      id: `temp-${Date.now()}`,
      title: '',
      type: 'reading',
      description: '',
      duration: 30
    };
    setModules([...modules, newModule]);
  };

  const removeModule = (index: number) => {
    const updatedModules = [...modules];
    updatedModules.splice(index, 1);
    setModules(updatedModules);
  };

  const moveModuleUp = (index: number) => {
    if (index === 0) return;
    const updatedModules = [...modules];
    const temp = updatedModules[index];
    updatedModules[index] = updatedModules[index - 1];
    updatedModules[index - 1] = temp;
    setModules(updatedModules);
  };

  const moveModuleDown = (index: number) => {
    if (index === modules.length - 1) return;
    const updatedModules = [...modules];
    const temp = updatedModules[index];
    updatedModules[index] = updatedModules[index + 1];
    updatedModules[index + 1] = temp;
    setModules(updatedModules);
  };

  const updateModule = (index: number, field: keyof Module, value: any) => {
    const updatedModules = [...modules];
    updatedModules[index] = { ...updatedModules[index], [field]: value };
    setModules(updatedModules);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a curriculum title');
      return;
    }
    
    if (modules.length === 0) {
      toast.error('Please add at least one module');
      return;
    }
    
    // Validate all modules have titles
    const invalidModules = modules.filter(m => !m.title.trim());
    if (invalidModules.length > 0) {
      toast.error('All modules must have titles');
      return;
    }
    
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Create curriculum
      const { data: curriculum, error: curriculumError } = await supabase
        .from('trainings')
        .insert({
          title: title.trim(),
          description: description.trim(),
          duration: `${modules.reduce((total, m) => total + m.duration, 0)} minutes`,
          created_by: user.id,
          status: 'draft'
        })
        .select()
        .single();

      if (curriculumError) throw curriculumError;

      // Create modules
      for (let i = 0; i < modules.length; i++) {
        const module = modules[i];
        const { error: moduleError } = await supabase
          .from('training_modules')
          .insert({
            training_id: curriculum.id,
            title: module.title,
            description: module.description,
            content: {
              type: module.type,
              duration: module.duration
            },
            order_index: i,
            duration: `${module.duration} minutes`
          });

        if (moduleError) throw moduleError;
      }

      toast.success('Curriculum created successfully');
      navigate(`/curriculum/library`);
    } catch (error: any) {
      console.error('Error creating curriculum:', error);
      toast.error(error.message || 'Failed to create curriculum');
    } finally {
      setIsSubmitting(false);
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/curriculum/library')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Create New Curriculum</h1>
          </div>
          <button
            onClick={() => navigate('/curriculum/library')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Curriculum Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Curriculum Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Advanced React Development"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide a detailed description of the curriculum..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          {/* Modules */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Curriculum Modules</h2>
              <button
                type="button"
                onClick={addModule}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Module</span>
              </button>
            </div>

            {modules.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No modules yet</h3>
                <p className="text-gray-500 mb-6">
                  Start building your curriculum by adding modules
                </p>
                <button
                  type="button"
                  onClick={addModule}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add First Module
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {modules.map((module, index) => (
                  <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="flex items-center justify-center h-6 w-6 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">
                          {index + 1}
                        </span>
                        <h3 className="font-medium text-gray-900">Module {index + 1}</h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => moveModuleUp(index)}
                          disabled={index === 0}
                          className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <MoveUp className="h-5 w-5 text-gray-500" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveModuleDown(index)}
                          disabled={index === modules.length - 1}
                          className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <MoveDown className="h-5 w-5 text-gray-500" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeModule(index)}
                          className="p-1 hover:bg-red-100 rounded-full text-red-500"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Module Title
                        </label>
                        <input
                          type="text"
                          value={module.title}
                          onChange={(e) => updateModule(index, 'title', e.target.value)}
                          placeholder="e.g., Introduction to React Hooks"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Module Type
                          </label>
                          <select
                            value={module.type}
                            onChange={(e) => updateModule(index, 'type', e.target.value)}
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
                            value={module.duration}
                            onChange={(e) => updateModule(index, 'duration', parseInt(e.target.value) || 0)}
                            min="1"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={module.description}
                          onChange={(e) => updateModule(index, 'description', e.target.value)}
                          placeholder="Describe what this module covers..."
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/curriculum/library')}
              className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Create Curriculum</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CurriculumCreate;