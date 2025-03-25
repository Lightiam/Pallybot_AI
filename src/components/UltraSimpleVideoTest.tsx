import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

const UltraSimpleVideoTest: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [status, setStatus] = useState<string>("Initializing...");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  useEffect(() => {
    console.log("UltraSimpleVideoTest mounted");
    
    // Create a canvas for mock video
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error("Failed to get canvas context");
      setStatus("Error: Failed to get canvas context");
      return;
    }
    
    // Draw something on the canvas
    ctx.fillStyle = 'blue';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '30px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('Test Video', canvas.width/2, canvas.height/2);
    
    try {
      // Create a stream from the canvas
      console.log("Creating canvas stream");
      const stream = canvas.captureStream(30);
      streamRef.current = stream;
      
      console.log("Stream created:", stream);
      console.log("Video tracks:", stream.getVideoTracks().length);
      
      // Set the stream to the video element
      if (videoRef.current) {
        console.log("Setting stream to video element");
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded");
          videoRef.current?.play()
            .then(() => {
              console.log("Video playing");
              setStatus("Video playing");
            })
            .catch(err => {
              console.error("Error playing video:", err);
              setStatus(`Error playing video: ${err.message}`);
            });
        };
      } else {
        console.error("Video ref is null");
        setStatus("Error: Video element not found");
      }
      
      // Update the canvas every second to show it's working
      const interval = setInterval(() => {
        if (ctx) {
          ctx.fillStyle = 'blue';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.font = '30px Arial';
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.fillText('Test Video', canvas.width/2, canvas.height/2);
          ctx.fillText(new Date().toLocaleTimeString(), canvas.width/2, canvas.height/2 + 40);
        }
      }, 1000);
      
      return () => {
        console.log("UltraSimpleVideoTest unmounting");
        clearInterval(interval);
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => {
            track.stop();
            console.log(`Track ${track.kind} stopped`);
          });
        }
        
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };
    } catch (err) {
      console.error("Error creating stream:", err);
      setStatus(`Error creating stream: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [sessionId]);
  
  return (
    <div style={{padding: '20px', maxWidth: '800px', margin: '0 auto'}}>
      <h1>Ultra Simple Video Test</h1>
      <p>Session ID: {sessionId}</p>
      <p>Status: {status}</p>
      
      <div style={{marginTop: '20px', border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden'}}>
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          muted
          style={{width: '100%', height: 'auto'}}
        />
      </div>
      
      <div style={{marginTop: '20px'}}>
        <button 
          onClick={() => console.log("Video element:", videoRef.current)}
          style={{padding: '8px 16px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
        >
          Log Video Element
        </button>
      </div>
    </div>
  );
};

export default UltraSimpleVideoTest;
