import React, { useState } from 'react';
import { BookOpen, Brain, Code, FileText, List, Plus, Sparkles, Target, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface GeneratedModule {
  title: string;
  description: string;
  type: 'reading' | 'video' | 'quiz' | 'code';
  duration: number;
  content: string;
}

interface GeneratedCurriculum {
  title: string;
  description: string;
  modules: GeneratedModule[];
  prerequisites: string[];
  learningObjectives: string[];
  targetAudience: string;
}

const CurriculumGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [skillLevel, setSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [duration, setDuration] = useState<'short' | 'medium' | 'long'>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCurriculum, setGeneratedCurriculum] = useState<GeneratedCurriculum | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setIsGenerating(true);

    try {
      // Simulated AI response - In production, this would call your AI service
      const curriculum: GeneratedCurriculum = {
        title: `${topic} - ${skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1)} Course`,
        description: `A comprehensive ${duration} course on ${topic} designed for ${skillLevel} level learners.`,
        modules: [
          {
            title: 'Introduction to the Fundamentals',
            description: `Core concepts and fundamentals of ${topic}`,
            type: 'reading',
            duration: 30,
            content: 'Introduction content would go here...'
          },
          {
            title: 'Practical Implementation',
            description: 'Hands-on coding exercises',
            type: 'code',
            duration: 60,
            content: 'Code exercises would go here...'
          },
          {
            title: 'Advanced Concepts',
            description: 'Deep dive into advanced topics',
            type: 'video',
            duration: 45,
            content: 'Video content would go here...'
          },
          {
            title: 'Knowledge Assessment',
            description: 'Test your understanding',
            type: 'quiz',
            duration: 30,
            content: 'Quiz questions would go here...'
          }
        ],
        prerequisites: [
          'Basic programming knowledge',
          'Understanding of web development concepts',
          'Familiarity with JavaScript'
        ],
        learningObjectives: [
          'Understand core principles',
          'Build practical applications',
          'Master advanced concepts',
          'Implement best practices'
        ],
        targetAudience: `${skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1)} level developers looking to master ${topic}`
      };

      setGeneratedCurriculum(curriculum);
      toast.success('Curriculum generated successfully!');
    } catch (error) {
      console.error('Error generating curriculum:', error);
      toast.error('Failed to generate curriculum');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedCurriculum) return;

    try {
      // Here you would save the curriculum to your database
      toast.success('Curriculum saved successfully!');
    } catch (error) {
      console.error('Error saving curriculum:', error);
      toast.error('Failed to save curriculum');
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
                <h1 className="text-2xl font-bold text-gray-900">AI Curriculum Generator</h1>
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
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate Curriculum</h2>
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
                      Skill Level
                    </label>
                    <select
                      value={skillLevel}
                      onChange={(e) => setSkillLevel(e.target.value as any)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course Duration
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value as any)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="short">Short (2-3 hours)</option>
                      <option value="medium">Medium (4-6 hours)</option>
                      <option value="long">Long (8+ hours)</option>
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
                        <span>Generate Curriculum</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Output Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Generated Curriculum</h2>
                {generatedCurriculum ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium text-gray-900">{generatedCurriculum.title}</h3>
                      <p className="text-gray-600 mt-1">{generatedCurriculum.description}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Learning Objectives</h4>
                      <ul className="space-y-2">
                        {generatedCurriculum.learningObjectives.map((objective, index) => (
                          <li key={index} className="flex items-center space-x-2 text-gray-600">
                            <Target className="h-4 w-4 text-purple-600" />
                            <span>{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Modules</h4>
                      <div className="space-y-3">
                        {generatedCurriculum.modules.map((module, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                              {module.type === 'reading' && <FileText className="h-5 w-5 text-blue-600" />}
                              {module.type === 'video' && <Video className="h-5 w-5 text-red-600" />}
                              {module.type === 'quiz' && <CheckCircle className="h-5 w-5 text-green-600" />}
                              {module.type === 'code' && <Code className="h-5 w-5 text-purple-600" />}
                              <div>
                                <h5 className="font-medium text-gray-900">{module.title}</h5>
                                <p className="text-sm text-gray-600">{module.description}</p>
                                <span className="text-xs text-gray-500 mt-1 block">
                                  Duration: {module.duration} minutes
                                </span>
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
                      <Save className="h-5 w-5" />
                      <span>Save Curriculum</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Curriculum Generated</h3>
                    <p className="text-gray-500">
                      Fill in the details and click "Generate Curriculum" to create a new curriculum
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

export default CurriculumGenerator;