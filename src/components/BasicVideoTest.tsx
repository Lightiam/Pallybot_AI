import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const BasicVideoTest: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [debugInfo, setDebugInfo] = useState<any>({});
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Create a mock video stream using canvas
  const createMockStream = () => {
    console.log('Creating mock video stream');
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get canvas context');
      return null;
    }
    
    // Initial drawing
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '24px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('Test Video Call', canvas.width/2, canvas.height/2 - 40);
    ctx.fillText(`Session: ${sessionId || 'unknown'}`, canvas.width/2, canvas.height/2);
    ctx.fillText(new Date().toLocaleTimeString(), canvas.width/2, canvas.height/2 + 40);
    
    // Create stream from canvas
    try {
      const stream = canvas.captureStream(30); // 30 FPS
      
      // Update the canvas every second
      const updateCanvas = () => {
        if (ctx) {
          ctx.fillStyle = '#1e40af';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.font = '24px Arial';
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.fillText('Test Video Call', canvas.width/2, canvas.height/2 - 40);
          ctx.fillText(`Session: ${sessionId || 'unknown'}`, canvas.width/2, canvas.height/2);
          ctx.fillText(new Date().toLocaleTimeString(), canvas.width/2, canvas.height/2 + 40);
        }
      };
      
      const interval = setInterval(updateCanvas, 1000);
      
      return { stream, interval };
    } catch (error) {
      console.error('Failed to create canvas stream:', error);
      return null;
    }
  };
  
  useEffect(() => {
    console.log('BasicVideoTest component mounted with sessionId:', sessionId);
    
    // Show a success toast to confirm the component is working
    toast.success('Basic video test loaded successfully');
    console.log('Toast notification should be visible');
    
    try {
      // Create mock stream
      console.log('Creating mock video stream...');
      const mockStreamData = createMockStream();
      
      if (mockStreamData) {
        console.log('Mock stream created successfully');
        const { stream, interval } = mockStreamData;
        streamRef.current = stream;
        
        console.log('Setting stream to video element');
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          console.log('Stream set to video element');
          
          localVideoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded, playing video');
            localVideoRef.current?.play()
              .then(() => console.log('Video playback started'))
              .catch(e => console.error('Error playing video:', e));
          };
        } else {
          console.error('localVideoRef is null, cannot set stream');
        }
        
        const debugData = {
          hasStream: true,
          mockMode: true,
          videoTracks: stream.getVideoTracks().length,
          audioTracks: 0,
          browserInfo: navigator.userAgent,
          timestamp: new Date().toISOString()
        };
        
        console.log('Debug info:', debugData);
        setDebugInfo(debugData);
        
        // Update the time every second
        console.log('Setting up time interval');
        const timeInterval = setInterval(() => {
          setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);
        
        // Set loading to false after a short delay
        console.log('Setting timeout to hide loading indicator');
        setTimeout(() => {
          console.log('Hiding loading indicator');
          setIsLoading(false);
        }, 1500);
        
        // Cleanup function
        return () => {
          console.log('BasicVideoTest component unmounting');
          
          // Clean up media streams
          if (streamRef.current) {
            console.log('Cleaning up media tracks');
            streamRef.current.getTracks().forEach(track => {
              try {
                track.stop();
                console.log(`Track ${track.id} (${track.kind}) stopped`);
              } catch (error) {
                console.error(`Error stopping track:`, error);
              }
            });
            streamRef.current = null;
          }
          
          // Clear video element
          if (localVideoRef.current) {
            console.log('Clearing video element');
            localVideoRef.current.srcObject = null;
          }
          
          console.log('Clearing intervals');
          clearInterval(timeInterval);
          clearInterval(interval);
        };
      } else {
        console.error('Failed to create mock stream');
        setErrorMessage('Failed to create mock video stream');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error in BasicVideoTest useEffect:', error);
      setErrorMessage(`Error initializing video test: ${error instanceof Error ? error.message : String(error)}`);
      setIsLoading(false);
    }
  }, [sessionId]);
  
  // Toggle audio function (mock)
  const toggleAudio = () => {
    setIsAudioMuted(!isAudioMuted);
    toast.success(`Audio ${isAudioMuted ? 'unmuted' : 'muted'}`);
  };
  
  // Toggle video function (mock)
  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    toast.success(`Video ${isVideoOff ? 'enabled' : 'disabled'}`);
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 bg-indigo-600 text-white">
          <h2 className="text-xl font-bold">Basic Video Test</h2>
          <p className="text-sm">Session ID: {sessionId || 'test-session'}</p>
          <p className="text-sm">Current Time: {currentTime}</p>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8 h-80">
            <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Initializing video test...</p>
          </div>
        ) : errorMessage ? (
          <div className="p-8 text-center text-red-600">
            <p className="font-bold">Error:</p>
            <p>{errorMessage}</p>
          </div>
        ) : (
          <div className="p-4">
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isVideoOff ? 'invisible' : 'visible'}`}
              />
              
              {isVideoOff && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <p className="text-white">Video Off</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-center space-x-4 mt-4">
              <button
                onClick={toggleAudio}
                className={`p-2 rounded border ${isAudioMuted ? 'bg-red-100' : 'bg-green-100'}`}
              >
                <span className="ml-2">{isAudioMuted ? 'Unmute' : 'Mute'} Audio</span>
              </button>
              
              <button
                onClick={toggleVideo}
                className={`p-2 rounded border ${isVideoOff ? 'bg-red-100' : 'bg-green-100'}`}
              >
                <span className="ml-2">{isVideoOff ? 'Show' : 'Hide'} Video</span>
              </button>
            </div>
          </div>
        )}
        
        <div className="p-4 bg-gray-100 border-t">
          <h3 className="font-semibold mb-2">Debug Information:</h3>
          <pre className="text-xs bg-gray-200 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default BasicVideoTest;
