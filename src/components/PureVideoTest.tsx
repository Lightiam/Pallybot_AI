import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const PureVideoTest: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [status, setStatus] = useState('Initializing...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  useEffect(() => {
    // Log component mount
    console.log('PureVideoTest component mounted');
    document.title = 'Pure Video Test';
    
    // Create a mock video element
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
    
    // Create a canvas for mock video
    try {
      console.log('Creating canvas for mock video');
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }
      
      // Draw something on the canvas
      ctx.fillStyle = '#1e40af';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = '30px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText('Pure Video Test', canvas.width/2, canvas.height/2 - 40);
      ctx.fillText(`Session: ${sessionId || 'test'}`, canvas.width/2, canvas.height/2);
      ctx.fillText(new Date().toLocaleTimeString(), canvas.width/2, canvas.height/2 + 40);
      
      // Update the canvas every second
      const interval = setInterval(() => {
        ctx.fillStyle = '#1e40af';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = '30px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('Pure Video Test', canvas.width/2, canvas.height/2 - 40);
        ctx.fillText(`Session: ${sessionId || 'test'}`, canvas.width/2, canvas.height/2);
        ctx.fillText(new Date().toLocaleTimeString(), canvas.width/2, canvas.height/2 + 40);
      }, 1000);
      
      // Create a stream from the canvas
      console.log('Creating stream from canvas');
      try {
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
            })
            .catch(err => {
              console.error('Error playing video:', err);
              setErrorMessage(`Error playing video: ${err.message}`);
            });
        };
      } catch (streamError) {
        console.error('Error creating stream:', streamError);
        setErrorMessage(`Error creating stream: ${streamError instanceof Error ? streamError.message : String(streamError)}`);
      }
      
      // Cleanup function
      return () => {
        console.log('PureVideoTest component unmounting');
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
      };
    } catch (error) {
      console.error('Error in PureVideoTest:', error);
      setErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
      return () => {};
    }
  }, [sessionId]);
  
  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{
        fontSize: '24px',
        marginBottom: '16px',
        color: '#333'
      }}>Pure Video Test</h1>
      
      <p style={{
        marginBottom: '16px',
        color: '#666'
      }}>Session ID: {sessionId || 'test'}</p>
      
      <p style={{
        marginBottom: '16px',
        color: errorMessage ? '#dc2626' : '#4b5563'
      }}>Status: {errorMessage || status}</p>
      
      <div 
        id="video-container"
        style={{
          marginTop: '20px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#000',
          aspectRatio: '16/9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Video element will be inserted here by JavaScript */}
        <p style={{color: 'white'}}>Loading video...</p>
      </div>
      
      <div style={{
        marginTop: '20px',
        padding: '16px',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px'
      }}>
        <h2 style={{
          fontSize: '18px',
          marginBottom: '8px',
          color: '#333'
        }}>Debug Information:</h2>
        <pre style={{
          fontSize: '14px',
          backgroundColor: '#e5e7eb',
          padding: '12px',
          borderRadius: '4px',
          overflow: 'auto',
          maxHeight: '200px'
        }}>
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
  );
};

export default PureVideoTest;
