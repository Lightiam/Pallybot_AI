import React from 'react';
import { useParams } from 'react-router-dom';

const StaticVideoTest: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  
  // Add event listener after component mounts
  React.useEffect(() => {
    console.log('StaticVideoTest mounted');
    
    // Get DOM elements
    const videoElement = document.getElementById('static-video') as HTMLVideoElement;
    const statusElement = document.getElementById('status-message');
    const startButton = document.getElementById('start-button');
    const stopButton = document.getElementById('stop-button');
    
    if (!videoElement || !statusElement || !startButton || !stopButton) {
      console.error('Required DOM elements not found');
      return;
    }
    
    // Function to update status
    const updateStatus = (message: string, isError = false) => {
      if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = isError ? 'text-red-500' : 'text-green-500';
      }
      console.log(isError ? `Error: ${message}` : message);
    };
    
    // Function to start video
    const startVideo = async () => {
      try {
        updateStatus('Requesting camera access...');
        
        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('getUserMedia is not supported in this browser');
        }
        
        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        
        // Set stream to video element
        videoElement.srcObject = stream;
        updateStatus('Camera access granted');
        
        // Enable stop button
        if (stopButton instanceof HTMLButtonElement) {
          stopButton.disabled = false;
        }
        if (startButton instanceof HTMLButtonElement) {
          startButton.disabled = true;
        }
      } catch (error) {
        updateStatus(`Failed to access camera: ${error instanceof Error ? error.message : String(error)}`, true);
      }
    };
    
    // Function to stop video
    const stopVideo = () => {
      if (videoElement.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        stream.getTracks().forEach(track => {
          track.stop();
        });
        videoElement.srcObject = null;
        updateStatus('Camera stopped');
        
        // Enable start button
        if (startButton instanceof HTMLButtonElement) {
          startButton.disabled = false;
        }
        if (stopButton instanceof HTMLButtonElement) {
          stopButton.disabled = true;
        }
      }
    };
    
    // Add event listeners
    startButton.addEventListener('click', startVideo);
    stopButton.addEventListener('click', stopVideo);
    
    // Initial state
    if (stopButton instanceof HTMLButtonElement) {
      stopButton.disabled = true;
    }
    updateStatus('Ready to start video');
    
    // Cleanup function
    return () => {
      console.log('StaticVideoTest unmounting');
      startButton.removeEventListener('click', startVideo);
      stopButton.removeEventListener('click', stopVideo);
      stopVideo();
    };
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 bg-indigo-600 text-white">
          <h2 className="text-xl font-bold">Static Video Test</h2>
          <p className="text-sm">Session ID: {sessionId || 'test'}</p>
        </div>
        
        <div className="p-4">
          <p id="status-message" className="mb-4 text-center font-medium">Initializing...</p>
          
          <div className="bg-gray-800 rounded-lg overflow-hidden mb-4">
            <video 
              id="static-video"
              autoPlay 
              playsInline 
              muted
              className="w-full aspect-video bg-black"
            />
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              id="start-button"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              Start Camera
            </button>
            
            <button
              id="stop-button"
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              Stop Camera
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
                hasGetUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaticVideoTest;
