import React, { useState, useEffect, useRef } from 'react';
import { Camera, Mic, MicOff, Video, VideoOff, Settings, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Lottie from 'lottie-react';
import { speechHelper } from '../lib/speechHelper';
import { interviewApi, InterviewSettings } from '../lib/interviewApi';

// Import Lottie animations
import idleAnimation from '../assets/animations/avatar-idle.json';
import talkingAnimation from '../assets/animations/avatar-talking.json';
import thinkingAnimation from '../assets/animations/avatar-thinking.json';
import listeningAnimation from '../assets/animations/avatar-listening.json';

const MockInterviewAvatar: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [userResponse, setUserResponse] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [avatarState, setAvatarState] = useState<'idle' | 'talking' | 'thinking' | 'listening'>('idle');
  const [interviewSettings, setInterviewSettings] = useState<InterviewSettings>({
    interviewerStyle: 'professional',
    interviewType: 'technical'
  });

  const lottieConfig = {
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
    loop: true,
    autoplay: true,
  };

  const getAnimationData = () => {
    switch (avatarState) {
      case 'talking':
        return talkingAnimation;
      case 'thinking':
        return thinkingAnimation;
      case 'listening':
        return listeningAnimation;
      default:
        return idleAnimation;
    }
  };

  useEffect(() => {
    initializeWebRTC();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      speechHelper.cancelSpeaking();
      if (isListening) {
        speechHelper.stopListening();
      }
      // End interview session when component unmounts
      interviewApi.endSession().catch(console.error);
    };
  }, []);

  const initializeWebRTC = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setStream(mediaStream);
      setIsLoading(false);
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast.error('Failed to access camera or microphone');
      setIsLoading(false);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoEnabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !isAudioEnabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const startInterview = async () => {
    try {
      setInterviewStarted(true);
      setIsThinking(true);
      setAvatarState('thinking');
      
      // Initialize interview session
      await interviewApi.startSession(interviewSettings);
      
      // Get first question
      const response = await interviewApi.askQuestion('javascript_closures');
      setCurrentQuestion(response.text);
      
      setIsThinking(false);
      setAvatarState('talking');
      await speechHelper.speak(response.text);
      setAvatarState('idle');
      
      toast.success('Interview session started!');
    } catch (error) {
      toast.error('Failed to start interview session');
      setInterviewStarted(false);
      setIsThinking(false);
      setAvatarState('idle');
    }
  };

  const toggleListening = () => {
    if (isListening) {
      speechHelper.stopListening();
      setIsListening(false);
      setAvatarState('idle');
    } else {
      try {
        speechHelper.startListening((text) => {
          setUserResponse(prev => prev + ' ' + text);
        });
        setIsListening(true);
        setAvatarState('listening');
      } catch (error) {
        toast.error('Speech recognition not supported in this browser');
      }
    }
  };

  const handleSubmitResponse = async () => {
    if (!userResponse.trim() || !currentQuestion) return;

    setIsThinking(true);
    setAvatarState('thinking');
    
    try {
      // Submit response for evaluation
      const evaluation = await interviewApi.evaluateResponse(userResponse);
      
      // Get follow-up question or feedback
      const response = await interviewApi.submitResponse(userResponse);
      
      setUserResponse('');
      setCurrentQuestion(response.followUpQuestion || null);

      // Provide feedback and ask next question
      setAvatarState('talking');
      if (evaluation.evaluation) {
        await speechHelper.speak(evaluation.evaluation);
      }
      if (response.followUpQuestion) {
        await speechHelper.speak(response.followUpQuestion);
      }
      setAvatarState('idle');
    } catch (error) {
      toast.error('Failed to process response');
    } finally {
      setIsThinking(false);
    }
  };

  const handleSettingsChange = (
    setting: 'interviewerStyle' | 'interviewType',
    value: string
  ) => {
    setInterviewSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Video */}
          <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl">
            <div className="relative aspect-video bg-black">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${!isVideoEnabled ? 'hidden' : ''}`}
                  />
                  {!isVideoEnabled && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                      <Camera className="h-20 w-20 text-gray-600" />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Controls */}
            <div className="p-6">
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={toggleVideo}
                  className={`p-4 rounded-full transition-colors ${
                    isVideoEnabled ? 'bg-purple-600 text-white' : 'bg-red-600 text-white'
                  }`}
                >
                  {isVideoEnabled ? (
                    <Video className="h-6 w-6" />
                  ) : (
                    <VideoOff className="h-6 w-6" />
                  )}
                </button>
                
                <button
                  onClick={toggleAudio}
                  className={`p-4 rounded-full transition-colors ${
                    isAudioEnabled ? 'bg-purple-600 text-white' : 'bg-red-600 text-white'
                  }`}
                >
                  {isAudioEnabled ? (
                    <Mic className="h-6 w-6" />
                  ) : (
                    <MicOff className="h-6 w-6" />
                  )}
                </button>

                <button
                  className="p-4 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                >
                  <Settings className="h-6 w-6" />
                </button>
              </div>

              {interviewStarted && (
                <div className="mt-6">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <textarea
                      value={userResponse}
                      onChange={(e) => setUserResponse(e.target.value)}
                      placeholder="Your response will appear here..."
                      className="w-full bg-gray-600 text-white rounded-md p-3 min-h-[100px] resize-none"
                    />
                    <div className="flex justify-between mt-4">
                      <button
                        onClick={toggleListening}
                        className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                          isListening ? 'bg-red-600' : 'bg-purple-600'
                        } text-white`}
                      >
                        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        <span>{isListening ? 'Stop' : 'Start'} Recording</span>
                      </button>
                      <button
                        onClick={handleSubmitResponse}
                        disabled={!userResponse.trim()}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
                      >
                        Submit Response
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interviewer Avatar */}
          <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl">
            <div className="relative aspect-video bg-gradient-to-br from-gray-700 to-gray-900">
              <div className="absolute inset-0">
                <Lottie
                  animationData={getAnimationData()}
                  {...lottieConfig}
                  className="w-full h-full"
                />
              </div>

              {!interviewStarted ? (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <button
                    onClick={startInterview}
                    className="px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span>Start Interview</span>
                  </button>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  {isThinking ? (
                    <div className="flex items-center space-x-3 bg-black bg-opacity-50 px-6 py-3 rounded-lg">
                      <div className="animate-pulse text-white">Thinking</div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  ) : currentQuestion && (
                    <div className="bg-black bg-opacity-50 p-6 rounded-lg max-w-lg">
                      <p className="text-white text-lg">{currentQuestion}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Interview Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Interviewer Style
                  </label>
                  <select 
                    className="w-full bg-gray-600 text-white rounded-md p-2 border border-gray-500"
                    value={interviewSettings.interviewerStyle}
                    onChange={(e) => handleSettingsChange('interviewerStyle', e.target.value)}
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="friendly">Friendly</option>
                  </select>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Interview Type
                  </label>
                  <select 
                    className="w-full bg-gray-600 text-white rounded-md p-2 border border-gray-500"
                    value={interviewSettings.interviewType}
                    onChange={(e) => handleSettingsChange('interviewType', e.target.value)}
                  >
                    <option value="technical">Technical</option>
                    <option value="behavioral">Behavioral</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockInterviewAvatar;