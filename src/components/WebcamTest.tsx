import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const WebcamTest: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [status, setStatus] = useState('Initializing...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [isCameraMuted, setIsCameraMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    console.log('WebcamTest component mounted with sessionId:', sessionId);
    
    // Function to initialize camera
    const initCamera = async () => {
      try {
        console.log('Checking for getUserMedia support');
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('getUserMedia is not supported in this browser');
        }
        
        console.log('Requesting camera access');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true,
          audio: false
        });
        
        console.log('Camera access granted:', stream);
        console.log('Video tracks:', stream.getVideoTracks().length);
        
        if (videoRef.current) {
          console.log('Setting stream to video element');
          videoRef.current.srcObject = stream;
          setHasCamera(true);
          setStatus('Camera initialized');
          toast.success('Camera initialized successfully');
        } else {
          console.error('Video element reference is null');
          setErrorMessage('Error: Video element not found');
          toast.error('Video element not found');
        }
      } catch (error) {
        console.error('Error initializing camera:', error);
        setErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
        toast.error(`Failed to initialize camera: ${error instanceof Error ? error.message : String(error)}`);
        
        // Create a fallback colored div
        setStatus('Using fallback display');
      }
    };
    
    // Initialize camera
    initCamera();
    
    // Cleanup function
    return () => {
      console.log('WebcamTest component unmounting');
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => {
          console.log(`Stopping track: ${track.kind}`);
          track.stop();
        });
      }
    };
  }, [sessionId]);
  
  const toggleCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const videoTracks = stream.getVideoTracks();
      
      if (videoTracks.length > 0) {
        const isEnabled = videoTracks[0].enabled;
        videoTracks[0].enabled = !isEnabled;
        setIsCameraMuted(isEnabled);
        console.log(`Camera ${isEnabled ? 'muted' : 'unmuted'}`);
        toast.success(`Camera ${isEnabled ? 'turned off' : 'turned on'}`);
      }
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 bg-indigo-600 text-white">
          <h2 className="text-xl font-bold">Webcam Test</h2>
          <p className="text-sm">Session ID: {sessionId || 'test'}</p>
          <p className="text-sm">Status: {errorMessage || status}</p>
        </div>
        
        <div className="p-4">
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="p-2 bg-gray-700 text-white text-sm flex justify-between items-center">
              <span>Camera Feed:</span>
              <button
                onClick={toggleCamera}
                className={`px-3 py-1 rounded text-xs ${isCameraMuted ? 'bg-red-500' : 'bg-green-500'}`}
              >
                {isCameraMuted ? 'Show Camera' : 'Hide Camera'}
              </button>
            </div>
            
            <div className="relative">
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted
                className="w-full aspect-video bg-black"
                style={{ display: hasCamera ? 'block' : 'none' }}
              />
              
              {!hasCamera && (
                <div className="w-full aspect-video bg-gray-900 flex items-center justify-center">
                  <p className="text-white">Waiting for camera...</p>
                </div>
              )}
              
              {hasCamera && isCameraMuted && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                  <p className="text-white text-lg">Camera Off</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <button
              onClick={toggleCamera}
              className={`p-2 rounded ${isCameraMuted ? 'bg-red-500' : 'bg-green-500'} text-white`}
            >
              {isCameraMuted ? 'Turn Camera On' : 'Turn Camera Off'}
            </button>
            
            <button
              onClick={() => {
                console.log('Video element:', videoRef.current);
                console.log('Has camera:', hasCamera);
                console.log('Is camera muted:', isCameraMuted);
                if (videoRef.current && videoRef.current.srcObject) {
                  const stream = videoRef.current.srcObject as MediaStream;
                  console.log('Video tracks:', stream.getVideoTracks().length);
                  console.log('Video track settings:', stream.getVideoTracks()[0]?.getSettings());
                }
                toast.success('Debug info logged to console');
              }}
              className="p-2 rounded bg-blue-500 text-white"
            >
              Log Debug Info
            </button>
          </div>
          
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Debug Information:</h3>
            <pre className="text-xs bg-gray-200 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify({
                browserInfo: navigator.userAgent,
                timestamp: new Date().toISOString(),
                sessionId: sessionId || 'test',
                hasMediaDevices: !!navigator.mediaDevices,
                hasGetUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
                hasCamera,
                isCameraMuted
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebcamTest;
