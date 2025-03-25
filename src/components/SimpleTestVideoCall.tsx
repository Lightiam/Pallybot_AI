import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Mic, MicOff, Video, VideoOff, ScreenShare, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

const SimpleTestVideoCall: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    console.log('SimpleTestVideoCall component mounted with sessionId:', sessionId);
    
    // Show a success toast to confirm the component is working
    toast.success('Test video call page loaded successfully');
    
    // Set loading to false after a short delay
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    // Update the time every second to show the component is alive
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    
    // Cleanup function
    return () => {
      console.log('SimpleTestVideoCall component unmounting');
      clearTimeout(loadingTimer);
      clearInterval(timeInterval);
    };
  }, [sessionId]);

  // Toggle audio (mock function)
  const toggleAudio = () => {
    setIsMuted(!isMuted);
    toast.success(isMuted ? 'Microphone unmuted (mock)' : 'Microphone muted (mock)');
    console.log('Audio toggled:', isMuted ? 'unmuted' : 'muted');
  };

  // Toggle video (mock function)
  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    toast.success(isVideoOff ? 'Camera turned on (mock)' : 'Camera turned off (mock)');
    console.log('Video toggled:', isVideoOff ? 'on' : 'off');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
          <p className="text-lg font-medium text-gray-700">Initializing test video call...</p>
        </div>
      ) : (
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 bg-indigo-600 text-white">
            <h1 className="text-2xl font-bold">Test Video Call</h1>
            <p className="text-sm opacity-80">Session ID: {sessionId || 'test'}</p>
          </div>
          
          <div className="p-6">
            <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg overflow-hidden aspect-video mb-6">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <div className="text-2xl font-bold mb-2">Mock Camera</div>
                <div className="mb-4">No device available</div>
                <div className="text-xl font-mono">{currentTime}</div>
                <div className="mt-4 text-sm">Session: {sessionId || 'test'}</div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4 mb-6">
              <button 
                onClick={toggleAudio}
                className={`p-3 rounded-full ${isMuted ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
              
              <button 
                onClick={toggleVideo}
                className={`p-3 rounded-full ${isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
                title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
              >
                {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
              </button>
              
              <button 
                onClick={() => {
                  setIsScreenSharing(!isScreenSharing);
                  toast.success(isScreenSharing ? 'Screen sharing stopped (mock)' : 'Screen sharing started (mock)');
                  console.log('Screen sharing toggled:', isScreenSharing ? 'stopped' : 'started');
                }}
                className={`p-3 rounded-full ${isScreenSharing ? 'bg-indigo-500 text-white' : 'bg-gray-200'}`}
                title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
              >
                <ScreenShare size={24} />
              </button>
              
              <button 
                onClick={() => {
                  toast.error('Call ended (mock)');
                  console.log('Call end button clicked');
                }}
                className="p-3 rounded-full bg-red-500 text-white"
                title="End call"
              >
                <Phone size={24} />
              </button>
            </div>
            
            <div className="p-4 bg-gray-100 rounded-lg">
              <h3 className="font-medium mb-2">Debug Information:</h3>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>Component: SimpleTestVideoCall</li>
                <li>Session ID: {sessionId || 'test'}</li>
                <li>Current Time: {currentTime}</li>
                <li>Audio: {isMuted ? 'Muted' : 'Active'} (mock)</li>
                <li>Video: {isVideoOff ? 'Off' : 'On'} (mock)</li>
                <li>Screen Sharing: {isScreenSharing ? 'Active' : 'Inactive'} (mock)</li>
                <li>Browser: {navigator.userAgent}</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleTestVideoCall;
