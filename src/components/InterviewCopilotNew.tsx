import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Mic, MicOff, AlertCircle, Video } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { speechHelper } from '../lib/speechHelper';
import { supabase } from '../lib/supabase';

interface JobOption {
  icon: React.ReactNode;
  title: string;
  description?: string;
}

const InterviewCopilotNew: React.FC = () => {
  const navigate = useNavigate();
  const [selectedJob, setSelectedJob] = useState<string>('Software Engineer');
  const [currentQuestion, setCurrentQuestion] = useState<string>('Why do you want to work as a software engineer at our company?');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userResponse, setUserResponse] = useState('');
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'pending'>('pending');

  useEffect(() => {
    checkMicrophonePermission();
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicPermission('granted');
    } catch (error) {
      console.error('Microphone permission error:', error);
      setMicPermission('denied');
    }
  };

  const jobOptions: JobOption[] = [
    {
      icon: <span className="text-purple-600">💻</span>,
      title: 'Software Engineer',
      description: 'Frontend, Backend, Full Stack'
    },
    {
      icon: <span>📊</span>,
      title: 'Product Manager'
    },
    {
      icon: <span>📈</span>,
      title: 'Financial Analyst'
    },
    {
      icon: <span>📊</span>,
      title: 'Data Scientist'
    },
    {
      icon: <span>📱</span>,
      title: 'Marketing Manager'
    },
    {
      icon: <span>📋</span>,
      title: 'Management Consultant'
    }
  ];

  const toggleMicrophone = async () => {
    if (isTranscribing) {
      speechHelper.stopListening();
      setIsTranscribing(false);
    } else {
      try {
        await checkMicrophonePermission();
        if (micPermission === 'denied') {
          toast.error('Please enable microphone access to use this feature');
          return;
        }

        speechHelper.startListening((text) => {
          setUserResponse(prev => prev + ' ' + text);
        });
        setIsTranscribing(true);
        toast.success('Listening... Speak now');
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        toast.error('Failed to start speech recognition');
      }
    }
  };

  const startVideoCall = async () => {
    try {
      // Create a new session
      const { data: session, error } = await supabase
        .from('training_sessions')
        .insert({
          title: `Interview Session - ${selectedJob}`,
          description: 'Video interview session',
          start_time: new Date().toISOString(),
          duration: 30, // 30 minutes
          trainer_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      // Navigate to video call with session ID
      navigate(`/video-call/${session.id}`);
    } catch (error) {
      console.error('Error starting video call:', error);
      toast.error('Failed to start video call');
    }
  };

  const handleSubmitResponse = () => {
    if (!userResponse.trim()) {
      toast.error('Please provide a response before submitting');
      return;
    }

    setIsGenerating(true);
    // Simulate AI processing
    setTimeout(() => {
      setIsGenerating(false);
      toast.success('Response analyzed successfully');
      setUserResponse('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Ace your Interview with AI Interview Assistant
          </h1>
          <p className="text-lg text-gray-600">
            Level up your interview game with real-time AI-powered answers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Job Selection */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Select Job Title
              </h2>
              <div className="space-y-2">
                {jobOptions.map((job) => (
                  <button
                    key={job.title}
                    onClick={() => setSelectedJob(job.title)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                      selectedJob === job.title
                        ? 'bg-purple-50 text-purple-600'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {job.icon}
                    <span>{job.title}</span>
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4">
                More than 100 positions waiting for you to choose
              </p>
            </div>
          </div>

          {/* Interview Section */}
          <div className="md:col-span-4">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Interviewer
                </h2>
                <button
                  onClick={startVideoCall}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Video className="h-5 w-5" />
                  <span>Start Video Call</span>
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Brain className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-2xl p-4">
                    <p className="text-gray-900">{currentQuestion}</p>
                    <span className="text-sm text-gray-500 mt-2 block">
                      00:02:58
                    </span>
                  </div>
                </div>
              </div>

              {micPermission === 'denied' && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Microphone Access Required</h3>
                    <p className="text-sm text-red-600 mt-1">
                      Please enable microphone access in your browser settings to use voice input.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={toggleMicrophone}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isTranscribing
                      ? 'bg-red-100 text-red-600'
                      : 'bg-purple-100 text-purple-600'
                  }`}
                >
                  {isTranscribing ? (
                    <>
                      <MicOff className="h-5 w-5" />
                      <span>Stop Recording</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-5 w-5" />
                      <span>Start Recording</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleSubmitResponse}
                  disabled={!userResponse.trim() || isGenerating}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
                >
                  {isGenerating ? 'Processing...' : 'Submit Response'}
                </button>
              </div>
            </div>
          </div>

          {/* AI Response Section */}
          <div className="md:col-span-5">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Interview Copilot™ & You
                </h2>
                {isGenerating && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm flex items-center">
                    <span className="mr-2">AI Generating</span>
                    <span className="flex space-x-1">
                      <span className="w-1 h-1 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1 h-1 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1 h-1 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </span>
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <textarea
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  placeholder="Your response will appear here as you speak..."
                  className="w-full h-40 p-4 bg-purple-50 rounded-2xl resize-none focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />

                <div className="bg-purple-50 rounded-2xl p-4">
                  <p className="text-gray-900">
                    I admire your innovative tech solutions and collaborative culture. My skills in software development and passion for creating efficient code align perfectly with your company's mission, and I'm eager to contribute to your team's success.
                  </p>
                  <span className="text-sm text-gray-500 mt-2 block">
                    00:02:58
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewCopilotNew;