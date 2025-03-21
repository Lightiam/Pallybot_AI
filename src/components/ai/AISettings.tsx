import React, { useState, useEffect } from 'react';
import { Settings, Key, Save, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { groqAI } from '../../lib/groqAI';
import { supabase } from '../../lib/supabase';

const AISettings: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: settings } = await supabase
        .from('user_settings')
        .select('groq_api_key')
        .eq('user_id', user.id)
        .single();

      if (settings?.groq_api_key) {
        setApiKey('••••••••••••••••');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter your Groq API key');
      return;
    }

    try {
      setIsSaving(true);
      await groqAI.saveApiKey(apiKey);
      toast.success('API key saved successfully');
      setApiKey('••••••••••••••••');
    } catch (error) {
      console.error('Error saving API key:', error);
      toast.error('Failed to save API key');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">AI Settings</h1>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Groq AI Configuration</h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800">Important</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Your API key is stored securely and is never exposed to the client side.
                        Get your API key from the{' '}
                        <a
                          href="https://console.groq.com/keys"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-yellow-800 underline hover:text-yellow-900"
                        >
                          Groq Console
                        </a>.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Groq API Key
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your Groq API key"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={isSaving || !apiKey.trim()}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        <span>Save API Key</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Model Configuration</h3>
                <p className="text-gray-600 mb-4">
                  We use the Mixtral 8x7B model for optimal performance in generating educational content.
                  This model provides a good balance of capabilities and response time.
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-600">Model</dt>
                      <dd className="text-sm text-gray-900">mixtral-8x7b-32768</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-600">Temperature</dt>
                      <dd className="text-sm text-gray-900">0.7</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-600">Max Tokens</dt>
                      <dd className="text-sm text-gray-900">4000</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-600">Top P</dt>
                      <dd className="text-sm text-gray-900">1.0</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISettings;