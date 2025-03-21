// Mock interview API for development
export interface InterviewSettings {
  interviewerStyle: 'professional' | 'casual' | 'friendly';
  interviewType: 'technical' | 'behavioral' | 'general';
}

export interface InterviewResponse {
  text: string;
  confidence?: number;
  evaluation?: string;
  followUpQuestion?: string;
  suggestions?: string[];
}

class InterviewApi {
  private static instance: InterviewApi;
  private sessionId: string | null = null;

  private constructor() {
    this.sessionId = localStorage.getItem('interview_session_id');
  }

  public static getInstance(): InterviewApi {
    if (!InterviewApi.instance) {
      InterviewApi.instance = new InterviewApi();
    }
    return InterviewApi.instance;
  }

  public async startSession(settings: InterviewSettings): Promise<void> {
    this.sessionId = `session_${Date.now()}`;
    localStorage.setItem('interview_session_id', this.sessionId);
  }

  public async askQuestion(topic: string): Promise<InterviewResponse> {
    return {
      text: "Can you explain how closures work in JavaScript and provide a practical example?"
    };
  }

  public async submitResponse(response: string): Promise<InterviewResponse> {
    return {
      text: "Response recorded",
      followUpQuestion: "How do closures help in data privacy?"
    };
  }

  public async evaluateResponse(response: string): Promise<InterviewResponse> {
    return {
      text: "Good response! You explained the concept well.",
      confidence: 0.8,
      evaluation: "Your explanation was clear and included good examples.",
      suggestions: [
        "Consider discussing memory implications",
        "Add more real-world examples"
      ]
    };
  }

  public async endSession(): Promise<void> {
    localStorage.removeItem('interview_session_id');
    this.sessionId = null;
  }

  public isSessionActive(): boolean {
    return !!this.sessionId;
  }
}

export const interviewApi = InterviewApi.getInstance();