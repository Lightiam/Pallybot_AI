import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Share, 
  Settings,
  X,
  MessageSquare
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { interviewApi } from '../lib/interviewApi';

interface Answer {
  text: string;
  timestamp: string;
}

const InterviewCopilot: React.FC = () => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [suggestedAnswers, setSuggestedAnswers] = useState<Answer[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    initializeMedia();
    startSession();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      interviewApi.endSession().catch(console.error);
    };
  }, []);

  const initializeMedia = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setStream(mediaStream);
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast.error('Failed to access camera or microphone');
    }
  };

  const startSession = async () => {
    try {
      await interviewApi.startSession({
        interviewerStyle: 'professional',
        interviewType: 'technical'
      });
      
      setIsTranscribing(true);
      const response = await interviewApi.askQuestion('javascript_closures');
      setCurrentQuestion(response.text);
      
      // Simulate AI generating answers
      setIsGenerating(true);
      setTimeout(() => {
        setSuggestedAnswers([
          {
            text: "Yes, I have made mistakes at work. One significant incident was when I deployed code to production without thorough testing in our staging environment. This led to a brief service disruption for some users.",
            timestamp: "3:26:07 AM"
          }
        ]);
        setIsGenerating(false);
      }, 1500);
    } catch (error) {
      console.error('Failed to start interview:', error);
      toast.error('Failed to start interview session');
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

  const handleExit = () => {
    if (window.confirm('Are you sure you want to end the interview?')) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <span className="text-white font-medium">Software Engineer @ Meta</span>
              <div className="h-4 w-px bg-gray-600" />
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 text-sm bg-gray-700 text-white rounded-md">
                  Transcription
                </button>
                <button className="px-3 py-1 text-sm text-gray-400 hover:text-white">
                  Interviewer
                </button>
                <button className="px-3 py-1 text-sm text-gray-400 hover:text-white">
                  Candidate
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {}}
                className="px-3 py-1.5 text-sm text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors flex items-center"
              >
                <Share className="h-4 w-4 mr-2" />
                Share Candidate Audio
              </button>
              <button
                onClick={() => {}}
                className="px-3 py-1.5 text-sm text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors flex items-center"
              >
                <Share className="h-4 w-4 mr-2" />
                Share Interviewer Audio
              </button>
              <button
                onClick={handleExit}
                className="px-3 py-1.5 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Main Video Area */}
        <div className="flex-1 relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${!isVideoEnabled ? 'hidden' : ''}`}
          />
          {!isVideoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
              <Video className="h-20 w-20 text-gray-500" />
            </div>
          )}
          
          {/* Video Controls */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
            <button
              onClick={toggleAudio}
              className={`p-4 rounded-full transition-colors ${
                isAudioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isAudioEnabled ? (
                <Mic className="h-6 w-6 text-white" />
              ) : (
                <MicOff className="h-6 w-6 text-white" />
              )}
            </button>
            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full transition-colors ${
                isVideoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isVideoEnabled ? (
                <Video className="h-6 w-6 text-white" />
              ) : (
                <VideoOff className="h-6 w-6 text-white" />
              )}
            </button>
            <button
              className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              <Settings className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>

        {/* Interview Content Sidebar */}
        <div className="w-[480px] bg-gray-800 overflow-y-auto">
          <div className="p-6">
            {/* Question */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-gray-400">Q1</span>
                <p className="text-white">Have you ever made a mistake at work? How did you handle it, and what did you learn from that experience?</p>
              </div>
              <span className="text-sm text-gray-500">3:26:07 AM</span>
            </div>

            {/* Interview Copilot */}
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5 text-purple-400" />
                  <h3 className="text-white font-medium">Interview Copilot</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-purple-400">Auto Scroll</span>
                  <div className="w-8 h-4 bg-purple-900 rounded-full relative">
                    <div className="absolute right-0 top-0 w-4 h-4 bg-purple-400 rounded-full" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Lessons Learned:</h4>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-400 font-medium">Importance of Thorough Testing:</span>
                      <span>I learned the critical importance of thoroughly testing code in a staging environment before deployment.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-400 font-medium">Improved Processes:</span>
                      <span>We implemented a more robust peer-review process and enhanced our continuous integration pipeline to catch errors earlier.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-400 font-medium">Communication Skills:</span>
                      <span>The experience improved my communication skills, ensuring clear and timely updates during crises.</span>
                    </li>
                  </ul>
                  <p className="mt-4 text-gray-300">
                    This incident taught me valuable lessons in{' '}
                    <em className="text-purple-400">preventive measures, effective communication</em>, and the{' '}
                    <em className="text-purple-400">importance of a strong review process</em>, all of which have significantly enhanced my approach to software development.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewCopilot;