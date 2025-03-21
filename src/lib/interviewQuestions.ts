// Enhanced questions with more structured follow-ups and evaluation criteria
export const questions = {
  technical: {
    javascript: [
      {
        question: "Can you explain how closures work in JavaScript and provide a practical example?",
        followUps: [
          "How do closures help in data privacy?",
          "What are the memory implications of using closures?",
          "Can you describe a real-world scenario where closures solved a specific problem?"
        ],
        difficulty: "medium",
        keyPoints: [
          "Lexical scoping",
          "Data privacy",
          "Memory management",
          "Practical applications"
        ]
      },
      {
        question: "Explain the event loop in JavaScript and how it handles asynchronous operations.",
        followUps: [
          "How does the microtask queue differ from the macrotask queue?",
          "Can you explain how promises interact with the event loop?",
          "What potential issues might arise with event loop blocking?"
        ],
        difficulty: "hard",
        keyPoints: [
          "Call stack",
          "Callback queue",
          "Microtasks vs Macrotasks",
          "Promise handling"
        ]
      },
      {
        question: "Describe the differences between var, let, and const in JavaScript.",
        followUps: [
          "How does hoisting affect each declaration?",
          "What are the implications for block scope?",
          "When would you choose one over the others?"
        ],
        difficulty: "medium",
        keyPoints: [
          "Scope differences",
          "Hoisting behavior",
          "Temporal dead zone",
          "Best practices"
        ]
      }
    ],
    react: [
      {
        question: "Explain React's virtual DOM and its role in performance optimization.",
        followUps: [
          "How does the reconciliation process work?",
          "What are the key differences between virtual DOM and shadow DOM?",
          "Can you describe scenarios where virtual DOM might not be beneficial?"
        ],
        difficulty: "medium",
        keyPoints: [
          "Reconciliation process",
          "Performance benefits",
          "Diffing algorithm",
          "Real DOM updates"
        ]
      }
    ]
  },
  behavioral: [
    {
      question: "Tell me about a challenging technical problem you solved recently.",
      followUps: [
        "What was your approach to solving this problem?",
        "How did you collaborate with others?",
        "What would you do differently next time?"
      ],
      difficulty: "medium",
      keyPoints: [
        "Problem identification",
        "Solution approach",
        "Collaboration",
        "Lessons learned"
      ]
    }
  ]
};

export type QuestionType = {
  question: string;
  followUps: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  keyPoints: string[];
};

// Enhanced sentiment analysis thresholds
export const SENTIMENT_THRESHOLDS = {
  CONFIDENCE: 0.7,
  CLARITY: 0.65,
  TECHNICAL_DEPTH: 0.7,
  COMMUNICATION: 0.75
};

// Comprehensive evaluation criteria
export const EVALUATION_CRITERIA = {
  TECHNICAL: {
    KNOWLEDGE: [
      'Accuracy of technical concepts',
      'Depth of understanding',
      'Use of terminology',
      'Current best practices'
    ],
    IMPLEMENTATION: [
      'Practical examples',
      'Code quality considerations',
      'Performance awareness',
      'Security considerations'
    ],
    PROBLEM_SOLVING: [
      'Analytical approach',
      'Solution efficiency',
      'Edge case handling',
      'Alternative solutions'
    ]
  },
  BEHAVIORAL: {
    STRUCTURE: [
      'STAR method usage',
      'Clear narrative flow',
      'Relevant details',
      'Concise delivery'
    ],
    COMMUNICATION: [
      'Clarity of expression',
      'Confidence level',
      'Active listening',
      'Follow-up handling'
    ],
    SOFT_SKILLS: [
      'Team collaboration',
      'Leadership qualities',
      'Conflict resolution',
      'Initiative taking'
    ]
  }
};