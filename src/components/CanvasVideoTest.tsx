import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const CanvasVideoTest: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [status, setStatus] = useState('Initializing...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<number | null>(null);
  
  useEffect(() => {
    console.log('CanvasVideoTest component mounted with sessionId:', sessionId);
    document.title = 'Canvas Video Test';
    
    // Draw on canvas
    const drawOnCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Clear canvas
      ctx.fillStyle = '#1e40af';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw text
      ctx.font = '24px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText('Canvas Video Test', canvas.width/2, canvas.height/2 - 40);
      ctx.fillText(`Session: ${sessionId || 'test'}`, canvas.width/2, canvas.height/2);
      ctx.fillText(new Date().toLocaleTimeString(), canvas.width/2, canvas.height/2 + 40);
    };
    
    // Set up canvas
    if (canvasRef.current) {
      console.log('Setting up canvas');
      canvasRef.current.width = 640;
      canvasRef.current.height = 480;
      
      // Initial draw
      drawOnCanvas();
      
      // Update canvas every second
      intervalRef.current = window.setInterval(drawOnCanvas, 1000);
      
      try {
        // Create stream from canvas
        console.log('Creating stream from canvas');
        const stream = canvasRef.current.captureStream(30);
        console.log('Stream created:', stream);
        console.log('Video tracks:', stream.getVideoTracks().length);
        
        // Set stream to video element
        if (videoRef.current) {
          console.log('Setting stream to video element');
          videoRef.current.srcObject = stream;
          
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded');
            videoRef.current?.play()
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
        } else {
          console.error('Video ref is null');
          setErrorMessage('Video element not found');
        }
      } catch (error) {
        console.error('Error creating stream:', error);
        setErrorMessage(`Error creating stream: ${error instanceof Error ? error.message : String(error)}`);
        toast.error('Failed to create video stream');
      }
    }
    
    return () => {
      console.log('CanvasVideoTest component unmounting');
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
      
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => {
          track.stop();
          console.log(`Track ${track.kind} stopped`);
        });
        videoRef.current.srcObject = null;
      }
    };
  }, [sessionId]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 bg-indigo-600 text-white">
          <h2 className="text-xl font-bold">Canvas Video Test</h2>
          <p className="text-sm">Session ID: {sessionId || 'test'}</p>
          <p className="text-sm">Status: {errorMessage || status}</p>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <p className="p-2 text-white text-sm">Canvas Source:</p>
              <canvas 
                ref={canvasRef} 
                className="w-full aspect-video bg-black"
              />
            </div>
            
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <p className="p-2 text-white text-sm">Video Output:</p>
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted
                className="w-full aspect-video bg-black"
              />
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

export default CanvasVideoTest;
