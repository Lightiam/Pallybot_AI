import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Mic, MicOff, Video, VideoOff, ScreenShare, Phone, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const SimpleTestVideoCall: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  // const navigate = useNavigate(); // Uncomment if navigation is needed
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Store debug info for logging and troubleshooting
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});
  // Use debugInfo in the debug section of the UI
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize media devices
  const initializeMediaDevices = async () => {
    console.log('Initializing media devices for test video call');
    
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('Media devices not supported in this browser');
        setErrorMessage('Your browser does not support video calls');
        setIsLoading(false);
        return;
      }
      
      // Check if we're in a secure context (required for getUserMedia)
      if (!window.isSecureContext) {
        console.error('Not in a secure context, getUserMedia may not work');
        setErrorMessage('Video calls require a secure connection (HTTPS)');
        setIsLoading(false);
        return;
      }
      
      // List available devices to debug
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        const audioDevices = devices.filter(device => device.kind === 'audioinput');
        
        console.log(`Available devices: ${devices.length} total`);
        console.log(`Video devices: ${videoDevices.length}`);
        console.log(`Audio devices: ${audioDevices.length}`);
        
        setDebugInfo(prev => ({
          ...prev,
          availableDevices: {
            video: videoDevices.length,
            audio: audioDevices.length,
            total: devices.length
          }
        }));
        
        if (videoDevices.length === 0) {
          console.warn('No video devices detected');
        }
        
        if (audioDevices.length === 0) {
          console.warn('No audio devices detected');
        }
      } catch (enumError) {
        console.error('Failed to enumerate devices:', enumError);
      }
      
      // Try to get user media with more detailed constraints and error handling
      try {
        console.log('Requesting camera and microphone access...');
        
        // Create constraints with specific settings for better compatibility
        const constraints = {
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          },
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          }
        };
        
        console.log('Using constraints:', JSON.stringify(constraints));
        
        // Request permissions with a timeout to detect hanging requests
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Media access request timed out')), 10000);
        });
        
        const stream = await Promise.race([
          navigator.mediaDevices.getUserMedia(constraints),
          timeoutPromise
        ]) as MediaStream;
        
        console.log('Media access granted:', stream.getTracks().map(t => `${t.kind} (${t.label})`).join(', '));
        streamRef.current = stream;
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          console.log('Stream connected to video element');
          
          // Add event listeners to video element for better debugging
          localVideoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded');
            localVideoRef.current?.play().catch(e => console.error('Error playing video:', e));
          };
          
          localVideoRef.current.onplay = () => console.log('Video playback started');
          localVideoRef.current.onerror = (e) => console.error('Video element error:', e);
        }
        
        // Update debug info
        setDebugInfo(prev => ({
          ...prev,
          hasStream: true,
          videoTracks: stream.getVideoTracks().length,
          audioTracks: stream.getAudioTracks().length,
          videoTrackLabels: stream.getVideoTracks().map(t => t.label),
          audioTrackLabels: stream.getAudioTracks().map(t => t.label),
          browserInfo: navigator.userAgent,
          constraints: constraints
        }));
        
        toast.success('Camera and microphone connected successfully');
      } catch (mediaError: any) {
        console.error('Error accessing media devices:', mediaError);
        
        // Provide more specific error messages based on the error
        let errorMsg = 'Failed to access camera or microphone';
        
        if (mediaError.name === 'NotAllowedError' || mediaError.name === 'PermissionDeniedError') {
          errorMsg = 'Camera or microphone access denied. Please allow access in your browser settings.';
        } else if (mediaError.name === 'NotFoundError' || mediaError.name === 'DevicesNotFoundError') {
          errorMsg = 'No camera or microphone found. Please connect a device and try again.';
        } else if (mediaError.name === 'NotReadableError' || mediaError.name === 'TrackStartError') {
          errorMsg = 'Camera or microphone is already in use by another application.';
        } else if (mediaError.name === 'OverconstrainedError') {
          errorMsg = 'Camera constraints cannot be satisfied. Try a different camera.';
        } else if (mediaError.message && mediaError.message.includes('timed out')) {
          errorMsg = 'Media access request timed out. Check your device connections.';
        }
        
        setErrorMessage(errorMsg);
        console.log(`Setting error message: ${errorMsg}`);
        
        // Try audio only as fallback
        try {
          console.log('Trying audio only as fallback');
          const audioConstraints = {
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            },
            video: false
          };
          
          const audioStream = await navigator.mediaDevices.getUserMedia(audioConstraints);
          
          streamRef.current = audioStream;
          setIsVideoOff(true);
          
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = audioStream;
          }
          
          setDebugInfo(prev => ({
            ...prev,
            hasStream: true,
            videoTracks: 0,
            audioTracks: audioStream.getAudioTracks().length,
            audioTrackLabels: audioStream.getAudioTracks().map(t => t.label),
            browserInfo: navigator.userAgent,
            fallbackMode: 'audio-only',
            constraints: audioConstraints
          }));
          
          toast.error('Video unavailable. Using audio only.');
        } catch (audioError: any) {
          console.error('Failed to access audio devices:', audioError);
          
          // Create a mock stream as a last resort
          try {
            console.log('Creating mock media stream as last resort');
            const mockCanvas = document.createElement('canvas');
            mockCanvas.width = 640;
            mockCanvas.height = 480;
            const ctx = mockCanvas.getContext('2d');
            
            if (ctx) {
              // Draw a placeholder image
              ctx.fillStyle = '#1e40af'; // Indigo background
              ctx.fillRect(0, 0, mockCanvas.width, mockCanvas.height);
              ctx.font = '24px Arial';
              ctx.fillStyle = 'white';
              ctx.textAlign = 'center';
              ctx.fillText('Camera Unavailable', mockCanvas.width/2, mockCanvas.height/2 - 20);
              ctx.fillText('Test Mode Active', mockCanvas.width/2, mockCanvas.height/2 + 20);
              
              // Create a stream from the canvas
              const mockStream = mockCanvas.captureStream(30); // 30 FPS
              streamRef.current = mockStream;
              
              if (localVideoRef.current) {
                localVideoRef.current.srcObject = mockStream;
              }
              
              setDebugInfo(prev => ({
                ...prev,
                hasStream: true,
                videoTracks: mockStream.getVideoTracks().length,
                audioTracks: 0,
                mockMode: true,
                browserInfo: navigator.userAgent,
                error: String(audioError)
              }));
              
              toast.error('Using mock video stream for testing');
            }
          } catch (mockError) {
            console.error('Failed to create mock stream:', mockError);
            setDebugInfo(prev => ({
              ...prev,
              hasStream: false,
              error: String(audioError),
              mockError: String(mockError),
              browserInfo: navigator.userAgent
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error in media initialization:', error);
      setErrorMessage('Failed to initialize media devices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('SimpleTestVideoCall component mounted with sessionId:', sessionId);
    
    // Show a success toast to confirm the component is working
    toast.success('Test video call page loaded successfully');
    
    // Create a fallback canvas stream immediately to ensure something is visible
    const createFallbackStream = () => {
      try {
        console.log('Creating initial fallback canvas stream');
        const mockCanvas = document.createElement('canvas');
        mockCanvas.width = 640;
        mockCanvas.height = 480;
        const ctx = mockCanvas.getContext('2d');
        
        if (ctx) {
          // Draw a placeholder image
          ctx.fillStyle = '#1e40af'; // Indigo background
          ctx.fillRect(0, 0, mockCanvas.width, mockCanvas.height);
          ctx.font = '24px Arial';
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.fillText('Initializing Camera...', mockCanvas.width/2, mockCanvas.height/2 - 20);
          ctx.fillText('Please grant camera access', mockCanvas.width/2, mockCanvas.height/2 + 20);
          
          // Create a stream from the canvas
          const mockStream = mockCanvas.captureStream(30); // 30 FPS
          streamRef.current = mockStream;
          
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = mockStream;
            console.log('Fallback stream connected to video element');
          }
          
          // Update canvas with time
          const updateCanvas = () => {
            if (ctx && mockCanvas) {
              ctx.fillStyle = '#1e40af';
              ctx.fillRect(0, 0, mockCanvas.width, mockCanvas.height);
              ctx.font = '24px Arial';
              ctx.fillStyle = 'white';
              ctx.textAlign = 'center';
              ctx.fillText('Camera Initializing', mockCanvas.width/2, mockCanvas.height/2 - 40);
              ctx.fillText('Session: ' + (sessionId || 'test'), mockCanvas.width/2, mockCanvas.height/2);
              ctx.fillText(new Date().toLocaleTimeString(), mockCanvas.width/2, mockCanvas.height/2 + 40);
            }
          };
          
          // Update canvas every second
          const canvasInterval = setInterval(updateCanvas, 1000);
          
          return { mockStream, canvasInterval };
        }
      } catch (error) {
        console.error('Error creating fallback stream:', error);
      }
      
      return { mockStream: null, canvasInterval: null };
    };
    
    // Create initial fallback stream
    const { canvasInterval } = createFallbackStream();
    
    // Initialize media devices
    initializeMediaDevices();
    
    // Update the time every second to show the component is alive
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    
    // Cleanup function
    return () => {
      console.log('SimpleTestVideoCall component unmounting');
      
      // Clean up media streams
      if (streamRef.current) {
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
        localVideoRef.current.srcObject = null;
      }
      
      // Clear intervals
      clearInterval(timeInterval);
      if (canvasInterval) clearInterval(canvasInterval);
    };
  }, [sessionId]);

  // Toggle audio function
  const toggleAudio = () => {
    try {
      console.log('Toggling audio, current state:', isMuted);
      
      if (!streamRef.current) {
        console.error('No media stream available');
        toast.error('Cannot toggle audio: No media stream available');
        return;
      }
      
      const audioTracks = streamRef.current.getAudioTracks();
      
      if (audioTracks.length === 0) {
        console.error('No audio tracks available');
        toast.error('No microphone detected');
        return;
      }
      
      audioTracks.forEach(track => {
        track.enabled = isMuted;
        console.log(`Audio track ${track.id} enabled:`, isMuted);
      });
      
      setIsMuted(!isMuted);
      toast.success(isMuted ? 'Microphone unmuted' : 'Microphone muted');
    } catch (error) {
      console.error('Error toggling audio:', error);
      toast.error('Failed to toggle microphone');
    }
  };

  // Toggle video function
  const toggleVideo = () => {
    try {
      console.log('Toggling video, current state:', isVideoOff);
      
      if (!streamRef.current) {
        console.error('No media stream available');
        toast.error('Cannot toggle video: No media stream available');
        return;
      }
      
      const videoTracks = streamRef.current.getVideoTracks();
      
      if (videoTracks.length === 0) {
        console.error('No video tracks available');
        toast.error('No camera detected');
        return;
      }
      
      videoTracks.forEach(track => {
        track.enabled = isVideoOff;
        console.log(`Video track ${track.id} enabled:`, isVideoOff);
      });
      
      setIsVideoOff(!isVideoOff);
      toast.success(isVideoOff ? 'Camera turned on' : 'Camera turned off');
    } catch (error) {
      console.error('Error toggling video:', error);
      toast.error('Failed to toggle camera');
    }
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
            {errorMessage && (
              <div className="mt-2 flex items-center text-red-200 bg-red-800 bg-opacity-50 p-2 rounded">
                <AlertCircle size={16} className="mr-2" />
                {errorMessage}
              </div>
            )}
          </div>
          
          <div className="p-6">
            <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg overflow-hidden aspect-video mb-6">
              {/* Actual video element */}
              <video 
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Overlay when no video is available */}
              {(!streamRef.current || isVideoOff) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-gray-800 bg-opacity-70">
                  <div className="text-2xl font-bold mb-2">Camera {isVideoOff ? 'Off' : 'Unavailable'}</div>
                  <div className="mb-4">{isVideoOff ? 'Click camera button to enable' : 'No device available'}</div>
                  <div className="text-xl font-mono">{currentTime}</div>
                  <div className="mt-4 text-sm">Session: {sessionId || 'test'}</div>
                </div>
              )}
            </div>
            
            <div className="flex justify-center space-x-4 mb-6">
              <button 
                onClick={toggleAudio}
                className={`p-3 rounded-full ${isMuted ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
                title={isMuted ? 'Unmute' : 'Mute'}
                disabled={!streamRef.current || streamRef.current.getAudioTracks().length === 0}
              >
                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
              
              <button 
                onClick={toggleVideo}
                className={`p-3 rounded-full ${isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
                title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                disabled={!streamRef.current || streamRef.current.getVideoTracks().length === 0}
              >
                {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
              </button>
              
              <button 
                onClick={() => {
                  setIsScreenSharing(!isScreenSharing);
                  toast.success(isScreenSharing ? 'Screen sharing stopped' : 'Screen sharing not implemented in test component');
                  console.log('Screen sharing toggled:', isScreenSharing ? 'stopped' : 'started');
                }}
                className={`p-3 rounded-full ${isScreenSharing ? 'bg-indigo-500 text-white' : 'bg-gray-200'}`}
                title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
              >
                <ScreenShare size={24} />
              </button>
              
              <button 
                onClick={() => {
                  // Clean up media streams
                  if (streamRef.current) {
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
                  
                  toast.error('Call ended');
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
                <li>Audio: {isMuted ? 'Muted' : 'Active'} {streamRef.current?.getAudioTracks().length ? `(${streamRef.current.getAudioTracks().length} tracks)` : '(no tracks)'}</li>
                <li>Video: {isVideoOff ? 'Off' : 'On'} {streamRef.current?.getVideoTracks().length ? `(${streamRef.current.getVideoTracks().length} tracks)` : '(no tracks)'}</li>
                <li>Screen Sharing: {isScreenSharing ? 'Active' : 'Inactive'} (test mode)</li>
                <li>Stream Active: {streamRef.current ? 'Yes' : 'No'}</li>
                <li>Browser: {navigator.userAgent}</li>
                <li>Media Devices API: {navigator.mediaDevices ? 'Available' : 'Not Available'}</li>
                {Object.entries(debugInfo).length > 0 && (
                  <>
                    <li className="mt-2 font-medium">Additional Debug Info:</li>
                    {Object.entries(debugInfo).map(([key, value]) => (
                      <li key={key} className="ml-2">
                        {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </li>
                    ))}
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleTestVideoCall;
