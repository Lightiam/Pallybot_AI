import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import natural from 'natural';

const app = express();
const port = 5005;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize NLP tools
const tokenizer = new natural.WordTokenizer();
const classifier = new natural.BayesClassifier();

// Train the classifier
classifier.addDocument('function closure variable scope algorithm', 'technical');
classifier.addDocument('team project challenge solution collaboration', 'behavioral');
classifier.train();

// Store active sessions
const sessions = new Map();

// Interview questions
const questions = {
  technical: {
    javascript_closures: {
      question: "Can you explain how closures work in JavaScript and provide a practical example?",
      followUps: [
        "How do closures help in data privacy?",
        "What are the memory implications of using closures?",
        "Can you describe a real-world scenario where closures solved a specific problem?"
      ]
    }
  },
  behavioral: {
    problem_solving: {
      question: "Tell me about a challenging technical problem you solved recently.",
      followUps: [
        "What was your approach to solving this problem?",
        "How did you collaborate with others?",
        "What would you do differently next time?"
      ]
    }
  }
};

// Enhanced response evaluation
function evaluateResponse(response, type) {
  const tokens = tokenizer.tokenize(response.toLowerCase());
  const technicalTerms = new Set([
    'function', 'closure', 'scope', 'variable', 'const', 'let',
    'algorithm', 'complexity', 'performance', 'optimization'
  ]);
  
  const technicalScore = type === 'technical' 
    ? tokens.filter(token => technicalTerms.has(token)).length / tokens.length
    : 0.7;

  return {
    confidence: technicalScore,
    evaluation: generateEvaluation(technicalScore),
    suggestions: generateSuggestions(technicalScore, type)
  };
}

function generateEvaluation(confidence) {
  if (confidence > 0.8) {
    return "Excellent response! Your explanation was clear, detailed, and well-structured.";
  } else if (confidence > 0.6) {
    return "Good response. You covered the main points, but there's room for more detail.";
  } else {
    return "Your response could be more comprehensive. Try to include more specific examples and technical details.";
  }
}

function generateSuggestions(confidence, type) {
  const suggestions = [];
  
  if (confidence < 0.8) {
    if (type === 'technical') {
      suggestions.push(
        "Include more technical terminology",
        "Provide concrete code examples",
        "Explain the underlying concepts in more detail",
        "Discuss potential trade-offs and edge cases"
      );
    } else {
      suggestions.push(
        "Share more specific examples from your experience",
        "Quantify the impact of your actions",
        "Describe your decision-making process",
        "Explain how you handled challenges"
      );
    }
  }
  
  return suggestions;
}

// Routes
app.get('/', (req, res) => {
  res.json({ status: 'Interview service is running' });
});

app.post('/start-session', (req, res) => {
  const sessionId = uuidv4();
  const { settings } = req.body;
  
  sessions.set(sessionId, {
    settings,
    currentTopic: null,
    responses: []
  });
  
  res.json({ sessionId, message: "Session started successfully" });
});

app.post('/ask-question', (req, res) => {
  const { sessionId, topic } = req.body;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(400).json({ error: 'Invalid session' });
  }
  
  const questionSet = questions[session.settings.interviewType][topic];
  if (!questionSet) {
    return res.status(400).json({ error: 'Invalid topic' });
  }
  
  session.currentTopic = topic;
  res.json({ question: questionSet.question });
});

app.post('/evaluate-response', (req, res) => {
  const { sessionId, response } = req.body;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(400).json({ error: 'Invalid session' });
  }
  
  const evaluation = evaluateResponse(response, session.settings.interviewType);
  res.json(evaluation);
});

app.post('/submit-response', (req, res) => {
  const { sessionId, response } = req.body;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(400).json({ error: 'Invalid session' });
  }
  
  const questionSet = questions[session.settings.interviewType][session.currentTopic];
  const followUpIndex = session.responses.length;
  const followUp = questionSet.followUps[followUpIndex];
  
  session.responses.push(response);
  
  res.json({
    message: "Response recorded",
    followUpQuestion: followUp || "Thank you for your responses."
  });
});

app.post('/end-session', (req, res) => {
  const { sessionId } = req.body;
  sessions.delete(sessionId);
  res.json({ message: "Session ended successfully" });
});

// Start server
app.listen(port, () => {
  console.log(`Interview service running at http://localhost:${port}`);
});