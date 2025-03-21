import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  Send, 
  Clock, 
  ThumbsUp, 
  ThumbsDown,
  RotateCcw,
  X,
  Volume2,
  VolumeX,
  Settings,
  MessageSquare
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { nlpService } from '../lib/nlpService';
import { questions, QuestionType } from '../lib/interviewQuestions';

const InterviewSession: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionType | null>(null);
  const [feedback, setFeedback] = useState<{
    strengths: string[];
    improvements: string[];
    suggestions: string[];
  }>({
    strengths: [],
    improvements: [],
    suggestions: []
  });
  const [questionHistory, setQuestionHistory] = useState<string[]>([]);
  const navigate = useNavigate();

  const selectNextQuestion = useCallback(() => {
    // Simple question selection logic - can be enhanced based on performance
    const category = 'technical';
    const subcategory = 'javascript';
    const availableQuestions = questions[category][subcategory];
    
    const unaskedQuestions = availableQuestions.filter(
      q => !questionHistory.includes(q.question)
    );
    
    if (unaskedQuestions.length === 0) {
      toast.success('Interview completed! Great job!');
      navigate('/dashboard');
      return;
    }
    
    const nextQuestion = unaskedQuestions[0];
    setCurrentQuestion(nextQuestion);
    setQuestionHistory(prev => [...prev, nextQuestion.question]);
  }, [questionHistory, navigate]);

  useEffect(() => {
    if (!currentQuestion) {
      selectNextQuestion();
    }
  }, [currentQuestion, selectNextQuestion]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeElapsed(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAnswer.trim() || !currentQuestion) return;

    try {
      const analysis = await nlpService.analyzeResponse(currentAnswer);
      
      // Update feedback based on analysis
      setFeedback({
        strengths: [
          'Clear explanation of concepts',
          analysis.confidence > 0.7 ? 'Confident delivery' : '',
          analysis.technicalDepth > 0.6 ? 'Good technical depth' : '',
        ].filter(Boolean),
        improvements: [
          analysis.confidence < 0.7 ? 'Could be more confident' : '',
          analysis.technicalDepth < 0.6 ? 'Could include more technical details' : '',
        ].filter(Boolean),
        suggestions: analysis.suggestions
      });

      // Generate follow-up question or move to next question
      const followUp = nlpService.generateFollowUpQuestion(
        currentQuestion.question,
        currentAnswer,
        questionHistory
      );

      if (currentQuestion.followUps.length > 0) {
        setCurrentQuestion({
          ...currentQuestion,
          question: followUp,
          followUps: currentQuestion.followUps.slice(1)
        });
      } else {
        selectNextQuestion();
      }

      nlpService.updateContext(currentQuestion.question, currentAnswer);
      setCurrentAnswer('');
      toast.success('Answer submitted successfully!');
    } catch (error) {
      console.error('Error analyzing response:', error);
      toast.error('Failed to process your answer. Please try again.');
    }
  };

  const handleEndSession = () => {
    if (window.confirm('Are you sure you want to end this interview session?')) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-500" />
                <span className="font-mono text-gray-700">{formatTime(timeElapsed)}</span>
              </div>
              <div className="h-4 w-px bg-gray-300" />
              <span className="text-sm text-gray-600">Technical Interview</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-lg transition-colors ${
                  isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                } hover:bg-opacity-80`}
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
              <button
                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={handleEndSession}
                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Interview Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Question */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Current Question</h2>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Question {questionHistory.length}/5
                </span>
              </div>
              <p className="text-gray-700 mb-4">
                {currentQuestion?.question}
              </p>
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleRecording}
                  className={`p-3 rounded-full transition-colors ${
                    isRecording
                      ? 'bg-red-100 text-red-600 animate-pulse'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </button>
                <span className="text-sm text-gray-500">
                  {isRecording ? 'Recording in progress...' : 'Click to start recording'}
                </span>
              </div>
            </div>

            {/* Answer Input */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
              <div className="mb-4">
                <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Answer
                </label>
                <textarea
                  id="answer"
                  rows={6}
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Type or speak your answer here..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentAnswer('')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Clear</span>
                </button>
                <button
                  type="submit"
                  disabled={!currentAnswer.trim()}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Submit Answer</span>
                </button>
              </div>
            </form>
          </div>

          {/* Feedback Panel */}
          <div className="bg-white rounded-xl shadow-sm p-6 h-fit">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Feedback</h3>
            <div className="space-y-4">
              {feedback.strengths.length > 0 && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <ThumbsUp className="h-5 w-5 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-green-900">Strong Points</h4>
                      <ul className="mt-2 text-sm text-green-800 list-disc list-inside">
                        {feedback.strengths.map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {feedback.improvements.length > 0 && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <ThumbsDown className="h-5 w-5 text-red-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-red-900">Areas to Improve</h4>
                      <ul className="mt-2 text-sm text-red-800 list-disc list-inside">
                        {feedback.improvements.map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {feedback.suggestions.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <MessageSquare className="h-5 w-5 text-gray-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-900">Suggestions</h4>
                      <ul className="mt-2 text-sm text-gray-700 list-disc list-inside">
                        {feedback.suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;