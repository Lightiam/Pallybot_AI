import React, { useState } from 'react';
import { Brain, Code, FileText, List, Plus, Sparkles, Target, Video, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ModuleContent {
  title: string;
  content: string;
  type: 'text' | 'code' | 'quiz';
}

interface GeneratedModule {
  title: string;
  description: string;
  learningObjectives: string[];
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  sections: ModuleContent[];
}

const ModuleGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [moduleType, setModuleType] = useState<'reading' | 'video' | 'quiz' | 'code'>('reading');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedModule, setGeneratedModule] = useState<GeneratedModule | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setIsGenerating(true);

    try {
      // Simulated AI response - In production, this would call your AI service
      const module: GeneratedModule = {
        title: `${topic} - ${moduleType.charAt(0).toUpperCase() + moduleType.slice(1)} Module`,
        description: `A comprehensive ${moduleType} module about ${topic} for ${difficulty} level learners.`,
        learningObjectives: [
          'Understand core concepts',
          'Apply practical knowledge',
          'Master key techniques',
          'Implement best practices'
        ],
        duration: 45,
        difficulty,
        prerequisites: [
          'Basic programming knowledge',
          'Understanding of web development',
          'Familiarity with JavaScript'
        ],
        sections: [
          {
            title: 'Introduction',
            content: 'Introduction content goes here...',
            type: 'text'
          },
          {
            title: 'Core Concepts',
            content: 'Core concepts content goes here...',
            type: 'text'
          },
          {
            title: 'Practical Example',
            content: 'Example code goes here...',
            type: 'code'
          },
          {
            title: 'Knowledge Check',
            content: 'Quiz questions go here...',
            type: 'quiz'
          }
        ]
      };

      setGeneratedModule(module);
      toast.success('Module generated successfully!');
    } catch (error) {
      console.error('Error generating module:', error);
      toast.error('Failed to generate module');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedModule) return;

    try {
      // Here you would save the module to your database
      toast.success('Module saved successfully!');
    } catch (error) {
      console.error('Error saving module:', error);
      toast.error('Failed to save module');
    }
  };

  const getModuleTypeIcon = (type: string) => {
    switch (type) {
      case 'reading':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'video':
        return <Video className="h-5 w-5 text-red-600" />;
      case 'quiz':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'code':
        return <Code className="h-5 w-5 text-purple-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">AI Module Generator</h1>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <span className="text-sm text-purple-600 font-medium">AI-Powered</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Input Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate Module</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Topic
                    </label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g., React Hooks"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Module Type
                    </label>
                    <select
                      value={moduleType}
                      onChange={(e) => setModuleType(e.target.value as any)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="reading">Reading</option>
                      <option value="video">Video</option>
                      <option value="quiz">Quiz</option>
                      <option value="code">Code Exercise</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Difficulty Level
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Brain className="h-5 w-5" />
                        <span>Generate Module</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Output Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Generated Module</h2>
                {generatedModule ? (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      {getModuleTypeIcon(moduleType)}
                      <div>
                        <h3 className="font-medium text-gray-900">{generatedModule.title}</h3>
                        <p className="text-gray-600 mt-1">{generatedModule.description}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Learning Objectives</h4>
                      <ul className="space-y-2">
                        {generatedModule.learningObjectives.map((objective, index) => (
                          <li key={index} className="flex items-center space-x-2 text-gray-600">
                            <Target className="h-4 w-4 text-purple-600" />
                            <span>{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Module Content</h4>
                      <div className="space-y-3">
                        {generatedModule.sections.map((section, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                              {section.type === 'text' && <FileText className="h-5 w-5 text-blue-600" />}
                              {section.type === 'code' && <Code className="h-5 w-5 text-purple-600" />}
                              {section.type === 'quiz' && <CheckCircle className="h-5 w-5 text-green-600" />}
                              <div>
                                <h5 className="font-medium text-gray-900">{section.title}</h5>
                                <p className="text-sm text-gray-600 mt-1">{section.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleSave}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Save Module</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <List className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Module Generated</h3>
                    <p className="text-gray-500">
                      Fill in the details and click "Generate Module" to create a new module
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleGenerator;