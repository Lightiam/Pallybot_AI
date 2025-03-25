import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  MessageSquare,
  Users,
  Settings,
  X,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface Participant {
  id: string;
  name: string;
  role: 'trainer' | 'trainee';
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenSharing: boolean;
  speakingTime: number;
  chatMessages: number;
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
}

const VideoConference: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenShareRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    console.log('VideoConference component mounted with sessionId:', sessionId);
    
    // Initialize session with a slight delay to ensure component is fully mounted
    setTimeout(() => {
      initializeSession();
    }, 500);
    
    // Load existing messages
    const loadMessages = async () => {
      try {
        console.log('Loading messages for session:', sessionId);
        const { data, error } = await supabase
          .from('session_messages')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true });
          
        if (error) {
          console.error('Error fetching messages:', error);
          return; // Exit early on error
        }
        
        if (data) {
          console.log('Loaded messages:', data.length);
          try {
            // Transform to Message format
            const formattedMessages: Message[] = await Promise.all(data.map(async (msg) => {
              try {
                // Get user info
                const { data: userData } = await supabase
                  .from('profiles')
                  .select('username')
                  .eq('id', msg.user_id)
                  .single();
                  
                return {
                  id: msg.id,
                  userId: msg.user_id,
                  userName: userData?.username || 'Unknown User',
                  content: msg.content,
                  timestamp: msg.created_at
                };
              } catch (userError) {
                console.error('Error fetching user data for message:', userError);
                // Return message with default user info
                return {
                  id: msg.id,
                  userId: msg.user_id,
                  userName: 'Unknown User',
                  content: msg.content,
                  timestamp: msg.created_at
                };
              }
            }));
            
            setMessages(formattedMessages);
          } catch (formatError) {
            console.error('Error formatting messages:', formatError);
          }
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };
    
    // Subscribe to new messages with error handling
    let messageChannel: { unsubscribe: () => void } | null = null;
    try {
      messageChannel = supabase
        .channel(`messages:${sessionId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'session_messages',
          filter: `session_id=eq.${sessionId}`
        }, async (payload: any) => {
          console.log('New message received:', payload);
          
          try {
            // Get user info
            const { data: userData } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', payload.new.user_id)
              .single();
              
            const newMessage: Message = {
              id: payload.new.id,
              userId: payload.new.user_id,
              userName: userData?.username || 'Unknown User',
              content: payload.new.content,
              timestamp: payload.new.created_at
            };
            
            setMessages(prev => [...prev, newMessage]);
          } catch (error) {
            console.error('Error processing new message:', error);
            // Add message with default user info on error
            const fallbackMessage: Message = {
              id: payload.new.id || `temp-${Date.now()}`,
              userId: payload.new.user_id || 'unknown',
              userName: 'Unknown User',
              content: payload.new.content || '',
              timestamp: payload.new.created_at || new Date().toISOString()
            };
            setMessages(prev => [...prev, fallbackMessage]);
          }
        })
        .subscribe((status) => {
          console.log(`Message subscription status: ${status}`);
        });
    } catch (subError) {
      console.error('Error setting up message subscription:', subError);
      // Continue without real-time updates
    }
      
    // Load messages after a short delay to ensure component is mounted
    setTimeout(() => {
      loadMessages();
    }, 1000);
    
    return () => {
      console.log('VideoConference component unmounting, cleaning up resources');
      cleanupSession();
      if (messageChannel) {
        try {
          messageChannel.unsubscribe();
          console.log('Message channel unsubscribed');
        } catch (unsubError) {
          console.error('Error unsubscribing from message channel:', unsubError);
        }
      }
    };
  }, [sessionId]);

  const initializeSession = async () => {
    try {
      console.log('Initializing video call session:', sessionId);
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('Media devices not supported in this browser');
        toast.error('Your browser does not support video calls. Please try a different browser.');
        
        // Create empty stream as fallback
        const emptyStream = new MediaStream();
        streamRef.current = emptyStream;
        setIsAudioEnabled(false);
        setIsVideoEnabled(false);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = emptyStream;
        }
        return; // Exit early
      }
      
      // Check permissions explicitly
      try {
        const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName });
        console.log('Camera permission status:', permissions.state);
        
        if (permissions.state === 'denied') {
          console.error('Camera permissions denied by browser settings');
          toast.error('Camera access denied. Please enable camera permissions in your browser settings.');
        }
      } catch (permError) {
        console.log('Unable to check permissions, continuing anyway:', permError);
      }
      
      // Get user media with fallback options
      try {
        // First try with both video and audio
        console.log('Requesting camera and microphone access...');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        console.log('Successfully obtained media stream with video and audio');
        streamRef.current = stream;
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          console.log('Local video stream connected successfully');
          toast.success('Video call initialized successfully');
        } else {
          console.error('Video element reference is null');
          toast.error('Could not initialize video display');
        }
      } catch (mediaError) {
        console.error('Error accessing media devices:', mediaError);
        
        // Try with just audio if video fails
        try {
          console.log('Retrying with audio only...');
          const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true
          });
          
          console.log('Successfully obtained audio-only stream');
          streamRef.current = audioOnlyStream;
          setIsVideoEnabled(false);
          
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = audioOnlyStream;
            console.log('Audio-only stream connected');
            toast.success('Video unavailable. Using audio only.');
          } else {
            console.error('Video element reference is null');
            toast.error('Could not initialize audio display');
          }
        } catch (audioError) {
          console.error('Failed to access audio devices:', audioError);
          toast.error('Could not access camera or microphone. Please check permissions.');
          
          // Create empty stream as fallback
          console.log('Creating empty fallback stream');
          const emptyStream = new MediaStream();
          streamRef.current = emptyStream;
          setIsAudioEnabled(false);
          setIsVideoEnabled(false);
          
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = emptyStream;
            console.log('Empty stream connected to video element');
          }
        }
      }

      // Subscribe to session updates
      try {
        // Use realtime subscription if available
        console.log('Setting up realtime subscription for session updates...');
        supabase
          .channel(`session:${sessionId}`)
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'session_participants',
            filter: `session_id=eq.${sessionId}`
          }, (payload) => {
            console.log('Participant update:', payload);
            handleParticipantUpdate(payload.new);
          })
          .subscribe((status) => {
            console.log(`Participant subscription status: ${status}`);
          });
          
        console.log('Successfully subscribed to session updates');
      } catch (subError) {
        console.error('Error subscribing to session updates:', subError);
        // Continue without real-time updates if subscription fails
      }

      // Join session
      try {
        console.log('Joining session in database...');
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id || 'anonymous-user';
        
        await supabase
          .from('session_participants')
          .insert({
            session_id: sessionId,
            user_id: userId,
            joined_at: new Date().toISOString()
          });
          
        console.log('Successfully joined session in database');
        toast.success('Successfully joined the video call');
      } catch (joinError) {
        console.error('Error joining session in database:', joinError);
        // Continue even if database update fails
        toast.error('Connected to call but session data could not be saved');
      }
    } catch (error) {
      console.error('Fatal error initializing session:', error);
      toast.error('Failed to start video call. Please try again.');
    }
  };

  const cleanupSession = () => {
    console.log('Cleaning up video call session resources...');
    
    // Stop all media tracks
    if (streamRef.current) {
      console.log('Stopping local media tracks');
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
          console.log(`Stopped track: ${track.kind}`);
        } catch (error) {
          console.error(`Error stopping ${track.kind} track:`, error);
        }
      });
      streamRef.current = null;
    }
    
    // Stop recording if active
    if (mediaRecorderRef.current && isRecording) {
      console.log('Stopping active recording');
      try {
        mediaRecorderRef.current.stop();
      } catch (error) {
        console.error('Error stopping media recorder:', error);
      }
      mediaRecorderRef.current = null;
    }
    
    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    
    if (screenShareRef.current) {
      if (screenShareRef.current.srcObject) {
        (screenShareRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach(track => track.stop());
      }
      screenShareRef.current.srcObject = null;
    }
    
    console.log('Video call resources cleaned up');
  };

  const toggleAudio = () => {
    console.log('Audio toggle button clicked, current state:', isAudioEnabled);
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      console.log('Audio tracks found:', audioTracks.length);
      
      audioTracks.forEach(track => {
        track.enabled = !isAudioEnabled;
        console.log(`Audio track ${track.id} enabled set to:`, !isAudioEnabled);
      });
      
      setIsAudioEnabled(!isAudioEnabled);
      toast.success(isAudioEnabled ? 'Microphone muted' : 'Microphone unmuted');
    } else {
      console.error('No media stream available for audio toggle');
      toast.error('Cannot toggle audio: no media stream available');
    }
  };

  const toggleVideo = () => {
    console.log('Video toggle button clicked, current state:', isVideoEnabled);
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      console.log('Video tracks found:', videoTracks.length);
      
      if (videoTracks.length === 0) {
        toast.error('No video track available. Camera might not be accessible.');
        return;
      }
      
      videoTracks.forEach(track => {
        track.enabled = !isVideoEnabled;
        console.log(`Video track ${track.id} enabled set to:`, !isVideoEnabled);
      });
      
      setIsVideoEnabled(!isVideoEnabled);
      toast.success(isVideoEnabled ? 'Camera turned off' : 'Camera turned on');
    } else {
      console.error('No media stream available for video toggle');
      toast.error('Cannot toggle video: no media stream available');
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        console.log('Requesting screen sharing access...');
        
        // Request screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: 'always',
            displaySurface: 'monitor'
          } as MediaTrackConstraints,
          audio: false
        });
        
        if (screenShareRef.current) {
          screenShareRef.current.srcObject = screenStream;
          console.log('Screen sharing stream connected successfully');
        }
        
        // Handle when user stops sharing via browser UI
        screenStream.getVideoTracks()[0].onended = () => {
          console.log('Screen sharing stopped by user');
          setIsScreenSharing(false);
          
          // Clean up tracks
          screenStream.getTracks().forEach(track => track.stop());
          
          if (screenShareRef.current) {
            screenShareRef.current.srcObject = null;
          }
          
          toast.success('Screen sharing ended');
        };
        
        setIsScreenSharing(true);
        toast.success('Screen sharing started');
      } else {
        // User clicked stop sharing button
        console.log('Stopping screen sharing via button click');
        
        if (screenShareRef.current?.srcObject) {
          (screenShareRef.current.srcObject as MediaStream)
            .getTracks()
            .forEach(track => {
              track.stop();
              console.log('Screen sharing track stopped');
            });
            
          screenShareRef.current.srcObject = null;
        }
        
        setIsScreenSharing(false);
        toast.success('Screen sharing ended');
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
      
      // Handle user cancellation vs. actual errors
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        console.log('User denied screen sharing permission');
        toast.error('Screen sharing permission denied');
      } else if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('User aborted screen sharing');
        // Don't show error toast for user cancellation
      } else {
        toast.error('Failed to share screen. Please try again.');
      }
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        await uploadRecording(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Recording stopped');
    }
  };

  const uploadRecording = async (blob: Blob) => {
    try {
      const fileName = `${sessionId}/${Date.now()}.webm`;
      
      const { error: uploadError } = await supabase.storage
        .from('session_recordings')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('session_recordings')
        .getPublicUrl(fileName);

      // Save recording metadata
      await supabase
        .from('session_recordings')
        .insert({
          session_id: sessionId,
          file_url: publicUrl,
          created_at: new Date().toISOString()
        });

      toast.success('Recording uploaded successfully');
    } catch (error) {
      console.error('Error uploading recording:', error);
      toast.error('Failed to upload recording');
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const message = {
        session_id: sessionId,
        user_id: user.id,
        content: newMessage.trim(),
        created_at: new Date().toISOString()
      };

      await supabase
        .from('session_messages')
        .insert(message);

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleParticipantUpdate = (participant: any) => {
    setParticipants(prev => {
      const index = prev.findIndex(p => p.id === participant.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          ...participant
        };
        return updated;
      }
      return [...prev, participant];
    });
  };

  // Add debug info to help diagnose issues
  console.log('Rendering VideoConference component with state:', {
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    isRecording,
    hasStream: !!streamRef.current,
    sessionId
  });

  return (
    <div className="min-h-screen bg-gray-900">
      {!streamRef.current && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-70">
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
            <p className="text-white font-medium">Initializing video call...</p>
            <button 
              onClick={() => initializeSession()}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}
      <div className="flex h-screen">
        {/* Main Video Area */}
        <div className="flex-1 relative">
          <div className="grid grid-cols-2 gap-4 p-4">
            {/* Local Video */}
            <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {!isVideoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                  <VideoOff className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Screen Share */}
            {isScreenSharing && (
              <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
                <video
                  ref={screenShareRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
            <button
              onClick={toggleAudio}
              className={`p-4 rounded-full transition-colors ${
                isAudioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isAudioEnabled ? (
                <Mic className="h-6 w-6 text-white" />
              ) : (
                <MicOff className="h-6 w-6 text-white" />
              )}
            </button>

            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full transition-colors ${
                isVideoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isVideoEnabled ? (
                <Video className="h-6 w-6 text-white" />
              ) : (
                <VideoOff className="h-6 w-6 text-white" />
              )}
            </button>

            <button
              onClick={toggleScreenShare}
              className={`p-4 rounded-full transition-colors ${
                isScreenSharing ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <Monitor className="h-6 w-6 text-white" />
            </button>

            <button
              onClick={toggleRecording}
              className={`p-4 rounded-full transition-colors ${
                isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <div className={`h-3 w-3 rounded-full ${isRecording ? 'bg-red-500' : 'bg-white'}`} />
                {isRecording && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-6 w-6 rounded-full bg-red-500 opacity-30 animate-ping" />
                  </div>
                )}
              </div>
            </button>

            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              <MessageSquare className="h-6 w-6 text-white" />
            </button>

            <button
              onClick={() => setIsParticipantsOpen(!isParticipantsOpen)}
              className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              <Users className="h-6 w-6 text-white" />
            </button>

            <button className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors">
              <Settings className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>

        {/* Chat Sidebar */}
        {isChatOpen && (
          <div className="w-80 bg-gray-800 border-l border-gray-700">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-white font-medium">Chat</h2>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1 hover:bg-gray-700 rounded-full"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="flex flex-col h-[calc(100vh-8rem)]">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-300">
                        {message.userName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-gray-300 mt-1">{message.content}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={sendMessage} className="p-4 border-t border-gray-700">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </form>
            </div>
          </div>
        )}

        {/* Participants Sidebar */}
        {isParticipantsOpen && (
          <div className="w-80 bg-gray-800 border-l border-gray-700">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-white font-medium">Participants</h2>
              <button
                onClick={() => setIsParticipantsOpen(false)}
                className="p-1 hover:bg-gray-700 rounded-full"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
                      <span className="text-white text-sm">
                        {participant.name[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{participant.name}</p>
                      <p className="text-sm text-gray-400">{participant.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!participant.audioEnabled && (
                      <MicOff className="h-4 w-4 text-gray-400" />
                    )}
                    {!participant.videoEnabled && (
                      <VideoOff className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoConference;
