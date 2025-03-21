import { toast } from 'react-hot-toast';

interface PeerConnection {
  connection: RTCPeerConnection;
  dataChannel: RTCDataChannel | null;
}

class WebRTCHelper {
  private static instance: WebRTCHelper;
  private peerConnections: Map<string, PeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private onTrackCallback: ((stream: MediaStream, peerId: string) => void) | null = null;
  private onDataCallback: ((data: any, peerId: string) => void) | null = null;

  private constructor() {}

  public static getInstance(): WebRTCHelper {
    if (!WebRTCHelper.instance) {
      WebRTCHelper.instance = new WebRTCHelper();
    }
    return WebRTCHelper.instance;
  }

  public async initializeMedia(constraints: MediaStreamConstraints = { video: true, audio: true }): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw new Error('Failed to access media devices');
    }
  }

  public async createPeerConnection(peerId: string): Promise<RTCPeerConnection> {
    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        {
          urls: 'turn:your-turn-server.com',
          username: 'username',
          credential: 'credential'
        }
      ],
      iceCandidatePoolSize: 10
    };

    const connection = new RTCPeerConnection(config);
    const dataChannel = connection.createDataChannel('messageChannel');

    // Add local tracks to connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        if (this.localStream) {
          connection.addTrack(track, this.localStream);
        }
      });
    }

    // Handle incoming tracks
    connection.ontrack = (event) => {
      if (this.onTrackCallback) {
        this.onTrackCallback(event.streams[0], peerId);
      }
    };

    // Handle ICE candidates
    connection.onicecandidate = (event) => {
      if (event.candidate) {
        // Send candidate to signaling server
        this.sendSignalingMessage({
          type: 'candidate',
          candidate: event.candidate,
          peerId
        });
      }
    };

    // Handle connection state changes
    connection.onconnectionstatechange = () => {
      switch (connection.connectionState) {
        case 'connected':
          toast.success('Peer connected successfully');
          break;
        case 'disconnected':
          toast.error('Peer disconnected');
          break;
        case 'failed':
          toast.error('Connection failed');
          this.handleConnectionFailure(peerId);
          break;
      }
    };

    // Handle data channel
    dataChannel.onmessage = (event) => {
      if (this.onDataCallback) {
        try {
          const data = JSON.parse(event.data);
          this.onDataCallback(data, peerId);
        } catch (error) {
          console.error('Error parsing data channel message:', error);
        }
      }
    };

    this.peerConnections.set(peerId, { connection, dataChannel });
    return connection;
  }

  public async createOffer(peerId: string): Promise<RTCSessionDescriptionInit> {
    const peerConnection = await this.getPeerConnection(peerId);
    const offer = await peerConnection.connection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    });
    
    await peerConnection.connection.setLocalDescription(offer);
    return offer;
  }

  public async handleAnswer(peerId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const peerConnection = await this.getPeerConnection(peerId);
    await peerConnection.connection.setRemoteDescription(new RTCSessionDescription(answer));
  }

  public async handleOffer(peerId: string, offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    const peerConnection = await this.getPeerConnection(peerId);
    await peerConnection.connection.setRemoteDescription(new RTCSessionDescription(offer));
    
    const answer = await peerConnection.connection.createAnswer();
    await peerConnection.connection.setLocalDescription(answer);
    return answer;
  }

  public async handleIceCandidate(peerId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const peerConnection = await this.getPeerConnection(peerId);
    await peerConnection.connection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  public sendData(peerId: string, data: any): void {
    const peer = this.peerConnections.get(peerId);
    if (peer?.dataChannel?.readyState === 'open') {
      peer.dataChannel.send(JSON.stringify(data));
    }
  }

  public setOnTrack(callback: (stream: MediaStream, peerId: string) => void): void {
    this.onTrackCallback = callback;
  }

  public setOnData(callback: (data: any, peerId: string) => void): void {
    this.onDataCallback = callback;
  }

  private async getPeerConnection(peerId: string): Promise<PeerConnection> {
    let peer = this.peerConnections.get(peerId);
    if (!peer) {
      await this.createPeerConnection(peerId);
      peer = this.peerConnections.get(peerId);
      if (!peer) throw new Error('Failed to create peer connection');
    }
    return peer;
  }

  private handleConnectionFailure(peerId: string): void {
    const peer = this.peerConnections.get(peerId);
    if (peer) {
      peer.connection.close();
      this.peerConnections.delete(peerId);
    }
  }

  private sendSignalingMessage(message: any): void {
    // Implement signaling server communication
    console.log('Sending signaling message:', message);
  }

  public cleanup(): void {
    this.peerConnections.forEach(peer => {
      peer.connection.close();
    });
    this.peerConnections.clear();
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }
}

export const webRTCHelper = WebRTCHelper.getInstance();