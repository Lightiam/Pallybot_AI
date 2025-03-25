import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

const MinimalVideoTest: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [debugInfo, setDebugInfo] = useState<any>({});
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Create a mock video stream using canvas
  const createMockStream = () => {
    console.log('Creating mock video stream');
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get canvas context');
      return null;
    }
    
    // Initial drawing
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '24px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('Test Video Call', canvas.width/2, canvas.height/2 - 40);
    ctx.fillText(`Session: ${sessionId || 'unknown'}`, canvas.width/2, canvas.height/2);
    ctx.fillText(new Date().toLocaleTimeString(), canvas.width/2, canvas.height/2 + 40);
    
    // Create stream from canvas
    try {
      const stream = canvas.captureStream(30); // 30 FPS
      
      // Update the canvas every second
      const updateCanvas = () => {
        if (ctx) {
          ctx.fillStyle = '#1e40af';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.font = '24px Arial';
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.fillText('Test Video Call', canvas.width/2, canvas.height/2 - 40);
          ctx.fillText(`Session: ${sessionId || 'unknown'}`, canvas.width/2, canvas.height/2);
          ctx.fillText(new Date().toLocaleTimeString(), canvas.width/2, canvas.height/2 + 40);
        }
      };
      
      const interval = setInterval(updateCanvas, 1000);
      
      return { stream, interval };
    } catch (error) {
      console.error('Failed to create canvas stream:', error);
      return null;
    }
  };
  
  useEffect(() => {
    console.log('MinimalVideoTest component mounted with sessionId:', sessionId);
    
    try {
      // Create mock stream
      console.log('Creating mock video stream...');
      const mockStreamData = createMockStream();
      
      if (mockStreamData) {
        console.log('Mock stream created successfully');
        const { stream, interval } = mockStreamData;
        streamRef.current = stream;
        
        console.log('Setting stream to video element');
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          console.log('Stream set to video element');
          
          localVideoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded, playing video');
            localVideoRef.current?.play()
              .then(() => console.log('Video playback started'))
              .catch(e => console.error('Error playing video:', e));
          };
        } else {
          console.error('localVideoRef is null, cannot set stream');
        }
        
        const debugData = {
          hasStream: true,
          mockMode: true,
          videoTracks: stream.getVideoTracks().length,
          audioTracks: 0,
          browserInfo: navigator.userAgent,
          timestamp: new Date().toISOString()
        };
        
        console.log('Debug info:', debugData);
        setDebugInfo(debugData);
        
        // Update the time every second
        console.log('Setting up time interval');
        const timeInterval = setInterval(() => {
          setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);
        
        // Set loading to false after a short delay
        console.log('Setting timeout to hide loading indicator');
        setTimeout(() => {
          console.log('Hiding loading indicator');
          setIsLoading(false);
        }, 1500);
        
        // Cleanup function
        return () => {
          console.log('MinimalVideoTest component unmounting');
          
          // Clean up media streams
          if (streamRef.current) {
            console.log('Cleaning up media tracks');
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
            console.log('Clearing video element');
            localVideoRef.current.srcObject = null;
          }
          
          console.log('Clearing intervals');
          clearInterval(timeInterval);
          clearInterval(interval);
        };
      } else {
        console.error('Failed to create mock stream');
        setErrorMessage('Failed to create mock video stream');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error in MinimalVideoTest useEffect:', error);
      setErrorMessage(`Error initializing video test: ${error instanceof Error ? error.message : String(error)}`);
      setIsLoading(false);
    }
  }, [sessionId]);
  
  // Toggle audio function (mock)
  const toggleAudio = () => {
    setIsAudioMuted(!isAudioMuted);
    console.log(`Audio ${isAudioMuted ? 'unmuted' : 'muted'}`);
  };
  
  // Toggle video function (mock)
  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    console.log(`Video ${isVideoOff ? 'enabled' : 'disabled'}`);
  };
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      backgroundColor: '#f3f4f6', 
      padding: '1rem' 
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '800px', 
        backgroundColor: 'white', 
        borderRadius: '0.5rem', 
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
        overflow: 'hidden' 
      }}>
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#4f46e5', 
          color: 'white' 
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Minimal Video Test</h2>
          <p style={{ fontSize: '0.875rem' }}>Session ID: {sessionId || 'test-session'}</p>
          <p style={{ fontSize: '0.875rem' }}>Current Time: {currentTime}</p>
        </div>
        
        {isLoading ? (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '2rem', 
            height: '20rem' 
          }}>
            <div style={{ 
              height: '3rem', 
              width: '3rem', 
              border: '4px solid #4f46e5', 
              borderTopColor: 'transparent', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite' 
            }}></div>
            <p style={{ marginTop: '1rem', color: '#4b5563' }}>Initializing video test...</p>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : errorMessage ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626' }}>
            <p style={{ fontWeight: 'bold' }}>Error:</p>
            <p>{errorMessage}</p>
          </div>
        ) : (
          <div style={{ padding: '1rem' }}>
            <div style={{ 
              position: 'relative', 
              backgroundColor: 'black', 
              borderRadius: '0.5rem', 
              overflow: 'hidden', 
              aspectRatio: '16/9' 
            }}>
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  visibility: isVideoOff ? 'hidden' : 'visible' 
                }}
              />
              
              {isVideoOff && (
                <div style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  backgroundColor: '#1f2937' 
                }}>
                  <p style={{ color: 'white' }}>Video Off</p>
                </div>
              )}
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '1rem', 
              marginTop: '1rem' 
            }}>
              <button
                onClick={toggleAudio}
                style={{ 
                  padding: '0.5rem', 
                  borderRadius: '0.25rem', 
                  border: '1px solid #d1d5db', 
                  backgroundColor: isAudioMuted ? '#fee2e2' : '#dcfce7' 
                }}
              >
                <span>{isAudioMuted ? 'Unmute' : 'Mute'} Audio</span>
              </button>
              
              <button
                onClick={toggleVideo}
                style={{ 
                  padding: '0.5rem', 
                  borderRadius: '0.25rem', 
                  border: '1px solid #d1d5db', 
                  backgroundColor: isVideoOff ? '#fee2e2' : '#dcfce7' 
                }}
              >
                <span>{isVideoOff ? 'Show' : 'Hide'} Video</span>
              </button>
            </div>
          </div>
        )}
        
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#f3f4f6', 
          borderTop: '1px solid #e5e7eb' 
        }}>
          <h3 style={{ fontWeight: 'semibold', marginBottom: '0.5rem' }}>Debug Information:</h3>
          <pre style={{ 
            fontSize: '0.75rem', 
            backgroundColor: '#e5e7eb', 
            padding: '0.5rem', 
            borderRadius: '0.25rem', 
            overflow: 'auto', 
            maxHeight: '10rem' 
          }}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default MinimalVideoTest;
