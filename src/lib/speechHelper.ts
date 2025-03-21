class SpeechHelper {
  private static instance: SpeechHelper;
  private recognition: any;
  private synthesis: SpeechSynthesis;
  private isListening: boolean = false;

  private constructor() {
    this.synthesis = window.speechSynthesis;
    if ('webkitSpeechRecognition' in window) {
      // @ts-ignore
      this.recognition = new webkitSpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
    }
  }

  public static getInstance(): SpeechHelper {
    if (!SpeechHelper.instance) {
      SpeechHelper.instance = new SpeechHelper();
    }
    return SpeechHelper.instance;
  }

  public startListening(onResult: (text: string) => void): void {
    if (!this.recognition) {
      throw new Error('Speech recognition not supported');
    }

    this.recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      if (result.isFinal) {
        onResult(result[0].transcript);
      }
    };

    this.recognition.start();
    this.isListening = true;
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  public speak(text: string, onEnd?: () => void): void {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    if (onEnd) {
      utterance.onend = onEnd;
    }

    this.synthesis.speak(utterance);
  }

  public cancelSpeaking(): void {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
  }
}

export const speechHelper = SpeechHelper.getInstance();