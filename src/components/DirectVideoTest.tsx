import React, { useEffect, useRef, useState } from 'react';

const DirectVideoTest: React.FC = () => {
  const [status, setStatus] = useState('Initializing...');
  const [hasVideo, setHasVideo] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    console.log('DirectVideoTest component mounted');
    
    // Function to initialize video
    const initVideo = async () => {
      try {
        console.log('Checking for getUserMedia support');
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('getUserMedia is not supported in this browser');
        }
        
        console.log('Requesting video stream');
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        console.log('Stream obtained:', stream);
        
        if (videoRef.current) {
          console.log('Setting stream to video element');
          videoRef.current.srcObject = stream;
          setHasVideo(true);
          setStatus('Video initialized successfully');
        } else {
          console.error('Video element reference is null');
          setStatus('Error: Video element not found');
        }
      } catch (error) {
        console.error('Error initializing video:', error);
        setStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    
    // Initialize video
    initVideo();
    
    // Cleanup function
    return () => {
      console.log('DirectVideoTest component unmounting');
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => {
          console.log(`Stopping track: ${track.kind}`);
          track.stop();
        });
      }
    };
  }, []);
  
  const toggleVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const videoTracks = stream.getVideoTracks();
      
      if (videoTracks.length > 0) {
        const isEnabled = videoTracks[0].enabled;
        videoTracks[0].enabled = !isEnabled;
        setIsVideoMuted(isEnabled);
        console.log(`Video ${isEnabled ? 'muted' : 'unmuted'}`);
      }
    }
  };
  
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Direct Video Test</h1>
      <p style={{ marginBottom: '16px' }}>Status: {status}</p>
      
      <div style={{ 
        border: '1px solid #ccc', 
        borderRadius: '8px', 
        overflow: 'hidden',
        marginBottom: '16px',
        backgroundColor: '#000'
      }}>
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          muted
          style={{ 
            width: '100%', 
            height: 'auto',
            display: hasVideo ? 'block' : 'none'
          }}
        />
        
        {!hasVideo && (
          <div style={{ 
            height: '300px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#fff'
          }}>
            Waiting for video...
          </div>
        )}
        
        {hasVideo && isVideoMuted && (
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            color: '#fff',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: '8px 16px',
            borderRadius: '4px'
          }}>
            Video Muted
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '8px' }}>
        <button 
          onClick={toggleVideo}
          style={{
            padding: '8px 16px',
            backgroundColor: isVideoMuted ? '#f44336' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isVideoMuted ? 'Show Video' : 'Hide Video'}
        </button>
        
        <button
          onClick={() => console.log('Video element:', videoRef.current)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Log Video Info
        </button>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>Debug Info:</h2>
        <pre style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '12px', 
          borderRadius: '4px',
          overflow: 'auto',
          fontSize: '14px'
        }}>
          {JSON.stringify({
            hasVideo,
            isVideoMuted,
            browserInfo: navigator.userAgent,
            timestamp: new Date().toISOString()
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default DirectVideoTest;
