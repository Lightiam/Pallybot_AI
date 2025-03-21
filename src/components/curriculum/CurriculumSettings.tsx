import React, { useState } from 'react';
import { 
  Settings,
  Users,
  BookOpen,
  Clock,
  Bell,
  Shield,
  Save,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ReactNode;
}

const CurriculumSettings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sections: SettingsSection[] = [
    { id: 'general', title: 'General Settings', icon: <Settings className="h-5 w-5" /> },
    { id: 'notifications', title: 'Notifications', icon: <Bell className="h-5 w-5" /> },
    { id: 'permissions', title: 'Permissions', icon: <Shield className="h-5 w-5" /> },
    { id: 'scheduling', title: 'Scheduling', icon: <Clock className="h-5 w-5" /> }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 border-r">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage your curriculum preferences
            </p>
          </div>

          <nav className="p-4">
            <div className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {section.icon}
                  <span>{section.title}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <form onSubmit={handleSubmit}>
            {activeSection === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    General Settings
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Default Course Duration
                      </label>
                      <select className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500">
                        <option>4 weeks</option>
                        <option>8 weeks</option>
                        <option>12 weeks</option>
                        <option>16 weeks</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Maximum Class Size
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                        defaultValue={30}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Default Time Zone
                      </label>
                      <select className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500">
                        <option>UTC</option>
                        <option>EST (UTC-5)</option>
                        <option>PST (UTC-8)</option>
                        <option>GMT</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    AI Assistant Settings
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        AI Model
                      </label>
                      <select className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500">
                        <option>GPT-4</option>
                        <option>GPT-3.5</option>
                        <option>Custom Model</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Response Style
                      </label>
                      <select className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500">
                        <option>Professional</option>
                        <option>Friendly</option>
                        <option>Technical</option>
                        <option>Simplified</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="autoSuggestions"
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor="autoSuggestions" className="ml-2 block text-sm text-gray-700">
                        Enable automatic curriculum suggestions
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Notification Preferences
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-4 border-b">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                      <p className="text-sm text-gray-500">Receive updates via email</p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-4 border-b">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Course Updates</h4>
                      <p className="text-sm text-gray-500">Get notified about curriculum changes</p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-4 border-b">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">AI Suggestions</h4>
                      <p className="text-sm text-gray-500">Receive AI-generated recommendations</p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'permissions' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Access Control
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-4 border-b">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Public Access</h4>
                      <p className="text-sm text-gray-500">Make curriculum visible to everyone</p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-4 border-b">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Instructor Access</h4>
                      <p className="text-sm text-gray-500">Allow instructors to modify content</p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-4 border-b">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Student Access</h4>
                      <p className="text-sm text-gray-500">Allow students to view progress</p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'scheduling' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Scheduling Preferences
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Default Session Duration
                    </label>
                    <select className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500">
                      <option>30 minutes</option>
                      <option>45 minutes</option>
                      <option>60 minutes</option>
                      <option>90 minutes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Break Duration
                    </label>
                    <select className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500">
                      <option>5 minutes</option>
                      <option>10 minutes</option>
                      <option>15 minutes</option>
                      <option>20 minutes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Working Days
                    </label>
                    <div className="mt-2 space-y-2">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                        <div key={day} className="flex items-center">
                          <input
                            type="checkbox"
                            id={day}
                            defaultChecked={day !== 'Saturday' && day !== 'Sunday'}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <label htmlFor={day} className="ml-2 text-sm text-gray-700">
                            {day}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end space-x-4">
              <button
                type="button"
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CurriculumSettings;