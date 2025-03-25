import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const FallbackVideoTest: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [status, setStatus] = useState('Initializing...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  useEffect(() => {
    // Log component mount
    console.log('FallbackVideoTest component mounted with sessionId:', sessionId);
    document.title = 'Fallback Video Test';
    
    // Show toast notification to confirm component is working
    toast.success('Fallback Video Test component loaded');
    
    // Create a video element
    const videoElement = document.createElement('video');
    videoElement.autoplay = true;
    videoElement.muted = true;
    videoElement.playsInline = true;
    videoElement.style.width = '100%';
    videoElement.style.height = 'auto';
    videoElement.style.backgroundColor = '#000';
    videoElement.style.borderRadius = '8px';
    
    // Add video element to the DOM
    const videoContainer = document.getElementById('video-container');
    if (videoContainer) {
      videoContainer.appendChild(videoElement);
      console.log('Video element added to DOM');
    } else {
      console.error('Video container not found');
      setErrorMessage('Video container not found');
    }
    
    // Create a mock video stream
    try {
      // Create a canvas for mock video
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }
      
      // Draw something on the canvas
      const drawCanvas = () => {
        if (!ctx) return;
        
        ctx.fillStyle = '#1e40af';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = '30px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('Fallback Video Test', canvas.width/2, canvas.height/2 - 40);
        ctx.fillText(`Session: ${sessionId || 'test'}`, canvas.width/2, canvas.height/2);
        ctx.fillText(new Date().toLocaleTimeString(), canvas.width/2, canvas.height/2 + 40);
      };
      
      // Initial draw
      drawCanvas();
      
      // Update the canvas every second
      const interval = setInterval(drawCanvas, 1000);
      
      // Add canvas to the DOM for debugging
      const canvasContainer = document.getElementById('canvas-container');
      if (canvasContainer) {
        canvasContainer.appendChild(canvas);
        console.log('Canvas element added to DOM');
      }
      
      // Create a stream from the canvas
      console.log('Creating stream from canvas');
      try {
        // Check if captureStream is supported
        if (!('captureStream' in canvas)) {
          throw new Error('Canvas captureStream not supported in this browser');
        }
        
        // @ts-ignore - TypeScript doesn't recognize captureStream on canvas
        const stream = canvas.captureStream(30);
        console.log('Stream created:', stream);
        console.log('Video tracks:', stream.getVideoTracks().length);
        
        // Set the stream to the video element
        videoElement.srcObject = stream;
        console.log('Stream set to video element');
        
        videoElement.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          videoElement.play()
            .then(() => {
              console.log('Video playing');
              setStatus('Video playing');
              toast.success('Video initialized successfully');
            })
            .catch(err => {
              console.error('Error playing video:', err);
              setErrorMessage(`Error playing video: ${err.message}`);
              toast.error('Failed to play video');
            });
        };
      } catch (streamError) {
        console.error('Error creating stream:', streamError);
        setErrorMessage(`Error creating stream: ${streamError instanceof Error ? streamError.message : String(streamError)}`);
        toast.error('Failed to create video stream');
        
        // Fallback to static image
        setStatus('Using static image fallback');
        const img = document.createElement('img');
        img.src = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
            <rect width="640" height="480" fill="#1e40af"/>
            <text x="320" y="200" font-family="Arial" font-size="30" fill="white" text-anchor="middle">Fallback Video Test</text>
            <text x="320" y="240" font-family="Arial" font-size="30" fill="white" text-anchor="middle">Session: ${sessionId || 'test'}</text>
            <text x="320" y="280" font-family="Arial" font-size="30" fill="white" text-anchor="middle">${new Date().toLocaleTimeString()}</text>
          </svg>
        `);
        img.style.width = '100%';
        img.style.height = 'auto';
        
        if (videoContainer) {
          // Remove video element
          if (videoElement.parentNode === videoContainer) {
            videoContainer.removeChild(videoElement);
          }
          // Add image
          videoContainer.appendChild(img);
          console.log('Fallback image added to DOM');
        }
      }
      
      // Cleanup function
      return () => {
        console.log('FallbackVideoTest component unmounting');
        clearInterval(interval);
        
        if (videoElement.srcObject) {
          const stream = videoElement.srcObject as MediaStream;
          stream.getTracks().forEach(track => {
            track.stop();
            console.log(`Track ${track.kind} stopped`);
          });
        }
        
        if (videoContainer && videoElement.parentNode === videoContainer) {
          videoContainer.removeChild(videoElement);
        }
        
        if (canvasContainer && canvas.parentNode === canvasContainer) {
          canvasContainer.removeChild(canvas);
        }
      };
    } catch (error) {
      console.error('Error in FallbackVideoTest:', error);
      setErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
      toast.error('An error occurred during initialization');
      return () => {};
    }
  }, [sessionId]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 bg-indigo-600 text-white">
          <h2 className="text-xl font-bold">Fallback Video Test</h2>
          <p className="text-sm">Session ID: {sessionId || 'test'}</p>
          <p className="text-sm">Status: {errorMessage || status}</p>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <p className="p-2 text-white text-sm">Canvas Source:</p>
              <div 
                id="canvas-container" 
                className="w-full aspect-video bg-black flex items-center justify-center"
              >
                <p className="text-white">Canvas loading...</p>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <p className="p-2 text-white text-sm">Video Output:</p>
              <div 
                id="video-container" 
                className="w-full aspect-video bg-black flex items-center justify-center"
              >
                <p className="text-white">Video loading...</p>
              </div>
            </div>
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
                canvasSupported: !!document.createElement('canvas').getContext('2d'),
                captureStreamSupported: 'captureStream' in HTMLCanvasElement.prototype
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FallbackVideoTest;
