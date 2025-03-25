import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Mic, MicOff, Video, VideoOff, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TestVideoCall: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [useMockStream, setUseMockStream] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Function to create a mock video stream when real devices aren't available
  const createMockStream = () => {
    console.log('Creating mock video stream');
    
    // Create a canvas element to generate mock video
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    
    // Get the canvas context and draw something
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw a gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#6366f1');
      gradient.addColorStop(1, '#8b5cf6');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw text
      ctx.fillStyle = 'white';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Mock Camera - No Device Available', canvas.width / 2, canvas.height / 2 - 20);
      ctx.fillText(`Session: ${sessionId || 'test'}`, canvas.width / 2, canvas.height / 2 + 20);
      
      // Add timestamp that updates
      setInterval(() => {
        if (ctx && useMockStream) {
          // Redraw background
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Redraw text
          ctx.fillStyle = 'white';
          ctx.font = '24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Mock Camera - No Device Available', canvas.width / 2, canvas.height / 2 - 20);
          ctx.fillText(`Session: ${sessionId || 'test'}`, canvas.width / 2, canvas.height / 2 + 20);
          
          // Add timestamp
          const now = new Date();
          ctx.fillText(now.toLocaleTimeString(), canvas.width / 2, canvas.height / 2 + 60);
        }
      }, 1000);
    }
    
    // Create a stream from the canvas
    // @ts-ignore - captureStream may not be recognized by TypeScript
    const stream = canvas.captureStream ? canvas.captureStream(30) : null;
    
    if (!stream) {
      console.error('Canvas.captureStream not supported');
      return null;
    }
    
    console.log('Mock video stream created successfully');
    return stream;
  };

  // Function to initialize media devices
  const initializeMedia = async () => {
    try {
      console.log('Initializing media devices...');
      setIsLoading(true);
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('Media devices not supported in this browser');
        setErrorMessage('Your browser does not support video calls');
        setHasError(true);
        setIsLoading(false);
        return;
      }
      
      // Try to get user media with more detailed constraints
      console.log('Requesting camera and microphone access...');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true
          }
        });
        
        console.log('Successfully obtained media stream:', stream);
        console.log('Video tracks:', stream.getVideoTracks().length);
        console.log('Audio tracks:', stream.getAudioTracks().length);
        
        streamRef.current = stream;
        setUseMockStream(false);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          console.log('Local video stream connected to video element');
          
          // Add event listener to confirm video is playing
          localVideoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded');
            localVideoRef.current?.play()
              .then(() => {
                console.log('Video playback started successfully');
                toast.success('Video initialized successfully');
                setIsLoading(false);
              })
              .catch(err => {
                console.error('Error starting video playback:', err);
                setErrorMessage('Could not start video playback. Please try again.');
                setHasError(true);
                setIsLoading(false);
              });
          };
        } else {
          console.error('Video element reference is null');
          setErrorMessage('Could not initialize video display');
          setHasError(true);
          setIsLoading(false);
        }
      } catch (mediaError: any) {
        console.error('Media access error:', mediaError);
        
        // For NotFoundError, try to use mock stream instead of showing error
        if (mediaError.name === 'NotFoundError') {
          console.log('No camera/microphone found, using mock stream instead');
          const mockStream = createMockStream();
          
          if (mockStream && localVideoRef.current) {
            streamRef.current = mockStream;
            localVideoRef.current.srcObject = mockStream;
            setUseMockStream(true);
            
            localVideoRef.current.onloadedmetadata = () => {
              localVideoRef.current?.play()
                .then(() => {
                  console.log('Mock video playback started successfully');
                  toast.success('Using simulated camera (no device found)');
                  setIsLoading(false);
                })
                .catch(err => {
                  console.error('Error starting mock video playback:', err);
                  setErrorMessage('Could not start video playback. Please try again.');
                  setHasError(true);
                  setIsLoading(false);
                });
            };
            return;
          } else {
            setErrorMessage('No camera or microphone found and mock stream creation failed.');
          }
        } else if (mediaError.name === 'NotAllowedError') {
          setErrorMessage('Camera or microphone access denied. Please allow access in your browser settings.');
        } else if (mediaError.name === 'NotReadableError') {
          setErrorMessage('Could not access your camera or microphone. They might be in use by another application.');
        } else {
          setErrorMessage(`Could not access camera or microphone: ${mediaError.message || 'Unknown error'}`);
        }
        
        setHasError(true);
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error('Unexpected error during initialization:', error);
      setErrorMessage(`An unexpected error occurred: ${error.message || 'Unknown error'}`);
      setHasError(true);
      setIsLoading(false);
    }
  };

  // Function to toggle audio
  const toggleAudio = () => {
    if (useMockStream) {
      // For mock stream, just toggle the state without affecting real tracks
      setIsAudioEnabled(!isAudioEnabled);
      toast.success(`Microphone ${!isAudioEnabled ? 'unmuted' : 'muted'} (simulated)`);
      return;
    }
    
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      console.log('Toggling audio. Current tracks:', audioTracks.length);
      
      if (audioTracks.length > 0) {
        const newState = !isAudioEnabled;
        audioTracks.forEach(track => {
          track.enabled = newState;
          console.log(`Audio track ${track.id} ${newState ? 'enabled' : 'disabled'}`);
        });
        
        setIsAudioEnabled(newState);
        toast.success(`Microphone ${newState ? 'unmuted' : 'muted'}`);
      } else {
        console.warn('No audio tracks available to toggle');
        toast.error('No microphone detected');
      }
    } else {
      console.error('No media stream available');
      toast.error('Media not initialized');
    }
  };

  // Function to toggle video
  const toggleVideo = () => {
    if (useMockStream) {
      // For mock stream, just toggle the state without affecting real tracks
      setIsVideoEnabled(!isVideoEnabled);
      toast.success(`Camera ${!isVideoEnabled ? 'enabled' : 'disabled'} (simulated)`);
      return;
    }
    
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      console.log('Toggling video. Current tracks:', videoTracks.length);
      
      if (videoTracks.length > 0) {
        const newState = !isVideoEnabled;
        videoTracks.forEach(track => {
          track.enabled = newState;
          console.log(`Video track ${track.id} ${newState ? 'enabled' : 'disabled'}`);
        });
        
        setIsVideoEnabled(newState);
        toast.success(`Camera ${newState ? 'enabled' : 'disabled'}`);
      } else {
        console.warn('No video tracks available to toggle');
        toast.error('No camera detected');
      }
    } else {
      console.error('No media stream available');
      toast.error('Media not initialized');
    }
  };

  useEffect(() => {
    console.log('TestVideoCall component mounted with sessionId:', sessionId);
    
    // Initialize with a slight delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      initializeMedia();
    }, 1000);
    
    // Cleanup function
    return () => {
      console.log('TestVideoCall component unmounting');
      clearTimeout(timer);
      
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        console.log(`Stopping ${tracks.length} media tracks`);
        
        tracks.forEach(track => {
          try {
            track.stop();
            console.log(`Track stopped: ${track.kind} (${track.id})`);
          } catch (error) {
            console.error('Error stopping track:', error);
          }
        });
        
        streamRef.current = null;
      }
    };
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <h1 className="text-white text-2xl font-bold mb-6">Test Video Call</h1>
      
      {isLoading ? (
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
          <p className="text-white font-medium">Initializing video call...</p>
          <p className="text-white text-sm opacity-75">Please allow camera and microphone access when prompted</p>
        </div>
      ) : hasError ? (
        <div className="bg-red-900 p-6 rounded-lg max-w-md">
          <h2 className="text-white text-xl font-semibold mb-2">Error</h2>
          <p className="text-white mb-4">{errorMessage}</p>
          <button 
            onClick={() => {
              setHasError(false);
              setIsLoading(true);
              initializeMedia();
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-2xl aspect-video bg-black rounded-lg overflow-hidden mb-4 border-2 border-purple-600">
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            />
            {!isVideoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                <p className="text-white font-medium">Camera disabled</p>
              </div>
            )}
            
            {useMockStream && (
              <div className="absolute top-2 right-2 bg-yellow-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Simulated Camera
              </div>
            )}
          </div>
          
          <p className="text-white text-center mb-4">
            Session ID: <span className="font-mono bg-gray-800 px-2 py-1 rounded">{sessionId || 'No session ID provided'}</span>
          </p>
          
          {useMockStream && (
            <div className="bg-yellow-900 p-3 rounded-lg mb-4 max-w-md">
              <p className="text-white text-sm">
                No camera or microphone detected. Using simulated video for testing purposes.
              </p>
            </div>
          )}
          
          <div className="flex space-x-4">
            <button 
              onClick={toggleAudio}
              className={`px-4 py-2 rounded-md transition-colors flex items-center space-x-2 ${
                isAudioEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isAudioEnabled ? (
                <>
                  <Mic className="h-5 w-5" />
                  <span>Mute</span>
                </>
              ) : (
                <>
                  <MicOff className="h-5 w-5" />
                  <span>Unmute</span>
                </>
              )}
            </button>
            <button 
              onClick={toggleVideo}
              className={`px-4 py-2 rounded-md transition-colors flex items-center space-x-2 ${
                isVideoEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isVideoEnabled ? (
                <>
                  <Video className="h-5 w-5" />
                  <span>Disable Camera</span>
                </>
              ) : (
                <>
                  <VideoOff className="h-5 w-5" />
                  <span>Enable Camera</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestVideoCall;
