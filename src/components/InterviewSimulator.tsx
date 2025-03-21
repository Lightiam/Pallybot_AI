import React, { useState } from 'react';
import { Mic, MessageSquare, Send } from 'lucide-react';

const InterviewSimulator: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement actual recording logic
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement answer submission logic
    setCurrentAnswer('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Current Question</h2>
          <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm">
            Technical Interview
          </span>
        </div>
        <p className="text-lg text-gray-700 mb-4">
          Can you explain the difference between React's useState and useEffect hooks, and provide an example of when you would use each?
        </p>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleRecording}
            className={`p-3 rounded-full ${
              isRecording
                ? 'bg-red-100 text-red-600'
                : 'bg-gray-100 text-gray-600'
            } hover:bg-opacity-80 transition-colors`}
          >
            <Mic className="h-6 w-6" />
          </button>
          <span className="text-sm text-gray-500">
            {isRecording ? 'Recording...' : 'Click to start recording'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
        <div className="mb-4">
          <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
            Your Answer
          </label>
          <textarea
            id="answer"
            rows={6}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Type your answer here..."
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
          >
            <Send className="h-4 w-4 mr-2" />
            Submit Answer
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Previous Feedback</h3>
        <div className="space-y-4">
          {previousFeedback.map((feedback, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <MessageSquare className="h-6 w-6 text-indigo-600 mt-1" />
              <div>
                <p className="text-gray-700">{feedback.message}</p>
                <div className="mt-2 flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${feedback.scoreColor}`}>
                    Score: {feedback.score}
                  </span>
                  <span className="text-sm text-gray-500">{feedback.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const previousFeedback = [
  {
    message: "Good explanation of useState, but could elaborate more on useEffect's dependency array. Consider mentioning cleanup functions.",
    score: "85%",
    scoreColor: "bg-green-100 text-green-800",
    timestamp: "2 minutes ago"
  },
  {
    message: "Clear explanation with good examples. Try to speak more confidently and maintain a steady pace.",
    score: "92%",
    scoreColor: "bg-green-100 text-green-800",
    timestamp: "5 minutes ago"
  }
];

export default InterviewSimulator;