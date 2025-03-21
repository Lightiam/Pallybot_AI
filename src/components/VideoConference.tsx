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
  X
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
    initializeSession();
    return () => {
      cleanupSession();
    };
  }, [sessionId]);

  const initializeSession = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      streamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Subscribe to session updates
      const { data: { subscription } } = await supabase
        .from('session_participants')
        .on('*', payload => {
          handleParticipantUpdate(payload.new);
        })
        .subscribe();

      // Join session
      await supabase
        .from('session_participants')
        .insert({
          session_id: sessionId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          joined_at: new Date().toISOString()
        });

      toast.success('Successfully joined the session');
    } catch (error) {
      console.error('Error initializing session:', error);
      toast.error('Failed to join session');
    }
  };

  const cleanupSession = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !isAudioEnabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !isVideoEnabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
        
        if (screenShareRef.current) {
          screenShareRef.current.srcObject = screenStream;
        }
        
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
        };
        
        setIsScreenSharing(true);
      } else {
        if (screenShareRef.current?.srcObject) {
          (screenShareRef.current.srcObject as MediaStream)
            .getTracks()
            .forEach(track => track.stop());
        }
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
      toast.error('Failed to share screen');
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

  return (
    <div className="min-h-screen bg-gray-900">
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
              <span className={`h-3 w-3 rounded-full ${isRecording ? 'bg-red-500' : 'bg-white'}`} />
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