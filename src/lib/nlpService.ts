import { SENTIMENT_THRESHOLDS, EVALUATION_CRITERIA } from './interviewQuestions';

class NLPService {
  private static instance: NLPService;
  private context: string[] = [];
  private confidenceScore: number = 0;
  private interviewHistory: any[] = [];

  private constructor() {}

  public static getInstance(): NLPService {
    if (!NLPService.instance) {
      NLPService.instance = new NLPService();
    }
    return NLPService.instance;
  }

  public async analyzeResponse(response: string): Promise<{
    sentiment: number;
    confidence: number;
    technicalDepth: number;
    suggestions: string[];
    evaluation: string;
  }> {
    // Enhanced NLP analysis with more sophisticated heuristics
    const words = response.toLowerCase().split(' ');
    const technicalTerms = new Set([
      'function', 'class', 'async', 'promise', 'component', 'state',
      'closure', 'scope', 'prototype', 'inheritance', 'event loop',
      'virtual dom', 'hooks', 'middleware', 'api', 'database'
    ]);
    
    // Calculate technical depth with weighted scoring
    const technicalCount = words.filter(word => technicalTerms.has(word)).length;
    const technicalDepth = this.calculateTechnicalDepth(words, technicalCount);
    
    // Enhanced sentiment and confidence analysis
    const sentiment = this.calculateSentiment(words);
    const confidence = this.calculateConfidence(words);
    
    // Generate detailed evaluation
    const evaluation = this.generateDetailedEvaluation(response, {
      technicalDepth,
      sentiment,
      confidence
    });

    return {
      sentiment,
      confidence,
      technicalDepth,
      suggestions: this.generateSuggestions(sentiment, confidence, technicalDepth),
      evaluation
    };
  }

  private calculateTechnicalDepth(words: string[], technicalCount: number): number {
    // Enhanced technical depth calculation
    const sentenceStructure = this.analyzeSentenceStructure(words);
    const conceptualUnderstanding = this.evaluateConceptualUnderstanding(words);
    
    return (
      (technicalCount / words.length) * 0.4 +
      sentenceStructure * 0.3 +
      conceptualUnderstanding * 0.3
    );
  }

  private analyzeSentenceStructure(words: string[]): number {
    // Analyze sentence complexity and structure
    const complexityMarkers = new Set([
      'because', 'therefore', 'however', 'moreover',
      'furthermore', 'consequently', 'although'
    ]);
    
    const markerCount = words.filter(word => complexityMarkers.has(word)).length;
    return Math.min(markerCount / 3, 1);
  }

  private evaluateConceptualUnderstanding(words: string[]): number {
    // Evaluate understanding based on key concept relationships
    const conceptPairs = [
      ['closure', 'scope'],
      ['promise', 'async'],
      ['component', 'state'],
      ['virtual', 'dom']
    ];
    
    let pairsFound = 0;
    conceptPairs.forEach(([concept1, concept2]) => {
      if (words.includes(concept1) && words.includes(concept2)) {
        pairsFound++;
      }
    });
    
    return pairsFound / conceptPairs.length;
  }

  private calculateSentiment(words: string[]): number {
    // Enhanced sentiment analysis
    const positiveWords = new Set([
      'clearly', 'effectively', 'successfully', 'efficiently',
      'excellent', 'optimal', 'robust', 'innovative'
    ]);
    const negativeWords = new Set([
      'unfortunately', 'however', 'but', 'though',
      'difficult', 'problematic', 'challenging', 'complex'
    ]);
    
    const positiveCount = words.filter(word => positiveWords.has(word)).length;
    const negativeCount = words.filter(word => negativeWords.has(word)).length;
    
    return (positiveCount - negativeCount * 0.5) / words.length + 0.5;
  }

  private calculateConfidence(words: string[]): number {
    // Enhanced confidence analysis
    const confidenceWords = new Set([
      'definitely', 'certainly', 'always', 'know',
      'understand', 'confident', 'sure', 'expert'
    ]);
    const uncertainWords = new Set([
      'maybe', 'perhaps', 'might', 'could',
      'possibly', 'probably', 'guess', 'think'
    ]);
    
    const confidentCount = words.filter(word => confidenceWords.has(word)).length;
    const uncertainCount = words.filter(word => uncertainWords.has(word)).length;
    
    return (confidentCount - uncertainCount * 0.7) / words.length + 0.5;
  }

  private generateDetailedEvaluation(
    response: string,
    metrics: { technicalDepth: number; sentiment: number; confidence: number }
  ): string {
    let evaluation = '';
    
    // Technical evaluation
    if (metrics.technicalDepth > 0.7) {
      evaluation += 'Excellent technical depth with clear understanding of concepts. ';
    } else if (metrics.technicalDepth > 0.4) {
      evaluation += 'Good technical knowledge but could be more detailed. ';
    } else {
      evaluation += 'Consider including more technical specifics in your response. ';
    }

    // Communication evaluation
    if (metrics.confidence > 0.7) {
      evaluation += 'Very confident delivery. ';
    } else if (metrics.confidence > 0.4) {
      evaluation += 'Reasonably confident but could be more assertive. ';
    } else {
      evaluation += 'Try to speak more confidently about your knowledge. ';
    }

    // Overall impression
    const overallScore = (metrics.technicalDepth + metrics.confidence + metrics.sentiment) / 3;
    if (overallScore > 0.7) {
      evaluation += 'Overall, an excellent response!';
    } else if (overallScore > 0.4) {
      evaluation += 'Overall, a good response with room for improvement.';
    } else {
      evaluation += 'Consider practicing more to improve your responses.';
    }

    return evaluation;
  }

  private generateSuggestions(
    sentiment: number,
    confidence: number,
    technicalDepth: number
  ): string[] {
    const suggestions: string[] = [];

    if (confidence < SENTIMENT_THRESHOLDS.CONFIDENCE) {
      suggestions.push(
        'Use more assertive language when explaining technical concepts',
        'Back up your statements with specific examples'
      );
    }

    if (technicalDepth < SENTIMENT_THRESHOLDS.TECHNICAL_DEPTH) {
      suggestions.push(
        'Include more specific technical terminology',
        'Explain the underlying principles behind your examples',
        'Discuss potential trade-offs or alternatives'
      );
    }

    if (sentiment < SENTIMENT_THRESHOLDS.CLARITY) {
      suggestions.push(
        'Structure your response with clear beginning, middle, and end',
        'Use transition words to connect your ideas',
        'Summarize key points at the end of your response'
      );
    }

    return suggestions;
  }

  public generateFollowUpQuestion(
    currentQuestion: string,
    response: string,
    previousQuestions: string[]
  ): string {
    // Enhanced follow-up question generation
    const words = response.toLowerCase().split(' ');
    const context = this.context.join(' ').toLowerCase();
    
    // Check for technical terms to dive deeper
    if (words.includes('closure')) {
      return "Can you explain how closures help prevent memory leaks?";
    }
    
    if (words.includes('async')) {
      return "How would you handle error cases in asynchronous operations?";
    }
    
    if (words.includes('component')) {
      return "What strategies do you use for component optimization?";
    }
    
    // Check response completeness
    if (response.length < 100) {
      return "Could you expand on your answer with more details?";
    }
    
    // Check for practical application
    if (!words.includes('example')) {
      return "Can you provide a practical example from your experience?";
    }
    
    // Default follow-ups based on context
    return "How would you handle edge cases in this scenario?";
  }

  public updateContext(question: string, response: string) {
    this.context.push(`Q: ${question}`);
    this.context.push(`A: ${response}`);
    
    // Store interaction in history
    this.interviewHistory.push({
      question,
      response,
      timestamp: new Date().toISOString()
    });
    
    // Keep only the last 4 interactions for context
    if (this.context.length > 8) {
      this.context = this.context.slice(-8);
    }
  }

  public getInterviewHistory() {
    return this.interviewHistory;
  }
}

export const nlpService = NLPService.getInstance();