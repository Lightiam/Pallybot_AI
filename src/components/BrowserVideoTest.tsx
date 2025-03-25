import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const BrowserVideoTest: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  
  useEffect(() => {
    // Insert script directly into the DOM to avoid React's event handling
    const script = document.createElement('script');
    script.textContent = `
      // Log that script is running
      console.log('BrowserVideoTest script running');
      
      // Function to update status
      function updateStatus(message, isError = false) {
        const statusElement = document.getElementById('status-message');
        if (statusElement) {
          statusElement.textContent = message;
          statusElement.className = isError ? 'text-red-500' : 'text-green-500';
        }
        console.log(isError ? 'Error: ' + message : message);
      }
      
      // Function to start video
      async function startVideo() {
        try {
          updateStatus('Requesting camera access...');
          
          // Check if getUserMedia is supported
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('getUserMedia is not supported in this browser');
          }
          
          // Request camera access
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          
          // Set stream to video element
          const videoElement = document.getElementById('browser-video');
          if (videoElement) {
            videoElement.srcObject = stream;
            updateStatus('Camera access granted');
            
            // Enable stop button
            const stopButton = document.getElementById('stop-button');
            const startButton = document.getElementById('start-button');
            if (stopButton) stopButton.disabled = false;
            if (startButton) startButton.disabled = true;
          } else {
            throw new Error('Video element not found');
          }
        } catch (error) {
          updateStatus('Failed to access camera: ' + error.message, true);
        }
      }
      
      // Function to stop video
      function stopVideo() {
        const videoElement = document.getElementById('browser-video');
        if (videoElement && videoElement.srcObject) {
          const stream = videoElement.srcObject;
          stream.getTracks().forEach(track => {
            track.stop();
          });
          videoElement.srcObject = null;
          updateStatus('Camera stopped');
          
          // Enable start button
          const stopButton = document.getElementById('stop-button');
          const startButton = document.getElementById('start-button');
          if (startButton) startButton.disabled = false;
          if (stopButton) stopButton.disabled = true;
        }
      }
      
      // Add event listeners when DOM is loaded
      document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM loaded, setting up event listeners');
        
        const startButton = document.getElementById('start-button');
        const stopButton = document.getElementById('stop-button');
        
        if (startButton && stopButton) {
          startButton.addEventListener('click', startVideo);
          stopButton.addEventListener('click', stopVideo);
          
          // Initial state
          stopButton.disabled = true;
          updateStatus('Ready to start video');
        } else {
          console.error('Buttons not found');
        }
      });
      
      // Log browser information
      console.log('Browser info:', {
        userAgent: navigator.userAgent,
        hasMediaDevices: !!navigator.mediaDevices,
        hasGetUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
      });
    `;
    document.head.appendChild(script);
    
    return () => {
      // Clean up script
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      
      // Stop video if running
      const videoElement = document.getElementById('browser-video') as HTMLVideoElement;
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        stream.getTracks().forEach(track => {
          track.stop();
        });
      }
    };
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 bg-indigo-600 text-white">
          <h2 className="text-xl font-bold">Browser Video Test</h2>
          <p className="text-sm">Session ID: {sessionId || 'test'}</p>
        </div>
        
        <div className="p-4">
          <p id="status-message" className="mb-4 text-center font-medium">Initializing...</p>
          
          <div className="bg-gray-800 rounded-lg overflow-hidden mb-4">
            <video 
              id="browser-video"
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
            <pre id="debug-info" className="text-xs bg-gray-200 p-2 rounded overflow-auto max-h-40">
              Loading browser information...
            </pre>
            
            <script dangerouslySetInnerHTML={{ __html: `
              document.getElementById('debug-info').textContent = JSON.stringify({
                browserInfo: navigator.userAgent,
                timestamp: new Date().toISOString(),
                sessionId: '${sessionId || 'test'}',
                hasMediaDevices: !!navigator.mediaDevices,
                hasGetUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
              }, null, 2);
            `}} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowserVideoTest;
