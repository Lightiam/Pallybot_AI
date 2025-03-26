/**
 * Media utility functions for video call handling
 */

// Check for media device support
export const checkMediaSupport = async (): Promise<{
  hasMediaDevices: boolean;
  hasGetUserMedia: boolean;
  hasAudioDevices: boolean;
  hasVideoDevices: boolean;
  secureContext: boolean;
  videoDeviceCount: number;
  audioDeviceCount: number;
}> => {
  const result = {
    hasMediaDevices: false,
    hasGetUserMedia: false,
    hasAudioDevices: false,
    hasVideoDevices: false,
    secureContext: false,
    videoDeviceCount: 0,
    audioDeviceCount: 0
  };
  
  // Check secure context
  result.secureContext = window.isSecureContext || false;
  
  // Check media devices API
  result.hasMediaDevices = !!navigator.mediaDevices;
  result.hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  
  // Check for available devices
  if (result.hasMediaDevices) {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      const audioDevices = devices.filter(device => device.kind === 'audioinput');
      
      result.videoDeviceCount = videoDevices.length;
      result.audioDeviceCount = audioDevices.length;
      
      result.hasVideoDevices = videoDevices.length > 0;
      result.hasAudioDevices = audioDevices.length > 0;
    } catch (error) {
      console.error('Error enumerating devices:', error);
    }
  }
  
  return result;
};

// Create a canvas fallback stream
export const createCanvasFallbackStream = (
  text1 = 'Camera Unavailable',
  text2 = 'Using Fallback Mode'
): { stream: MediaStream | null; update: () => void; cleanup: () => void } => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return { stream: null, update: () => {}, cleanup: () => {} };
    }
    
    // Initial drawing
    const draw = () => {
      if (!ctx) return;
      ctx.fillStyle = '#1e40af';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = '24px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText(text1, canvas.width/2, canvas.height/2 - 20);
      ctx.fillText(text2, canvas.width/2, canvas.height/2 + 20);
      ctx.font = '16px Arial';
      ctx.fillText(new Date().toLocaleTimeString(), canvas.width/2, canvas.height/2 + 60);
    };
    
    draw();
    
    // Create stream
    const stream = canvas.captureStream(30);
    
    // Update function to refresh canvas
    const interval = setInterval(draw, 1000);
    
    return {
      stream,
      update: draw,
      cleanup: () => {
        clearInterval(interval);
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
    };
  } catch (error) {
    console.error('Error creating canvas fallback:', error);
    return { stream: null, update: () => {}, cleanup: () => {} };
  }
};
