export type AgentRole = 'reader' | 'quiz' | 'tutor' | 'planner';

export type AgentStatus = 'idle' | 'working' | 'completed' | 'error';

export interface AgentActivityLog {
  id: string;
  timestamp: string;
  agent: AgentRole;
  agentName: string;
  action: string;
  details?: string;
  toolsUsed?: ('Structured JSON' | 'Code Execution' | 'Google Search Grounding' | 'Multimodal Vision')[];
  handoffTo?: AgentRole;
  status: 'working' | 'success' | 'info' | 'error';
}

export interface ExtractedTopic {
  id: string;
  name: string;
  importance: 'High' | 'Medium' | 'Low';
  summary: string;
  subpoints: string[];
}

export interface ExtractedFormula {
  id: string;
  name: string;
  formula: string;
  description: string;
  variables: { symbol: string; explanation: string }[];
  sampleCalculation?: string;
}

export interface ExtractedDefinition {
  term: string;
  definition: string;
  context?: string;
}

export interface ExtractedStudyMaterial {
  title: string;
  overview: string;
  topics: ExtractedTopic[];
  formulas: ExtractedFormula[];
  definitions: ExtractedDefinition[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  topicTag: string;
  difficulty: 'Foundation' | 'Intermediate' | 'Advanced' | 'Exam Prep';
  isNumerical: boolean;
  codeVerification?: {
    codeSnippet?: string;
    resultSnippet?: string;
    verified: boolean;
  };
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface TutorExplanation {
  analogy: string;
  conceptBreakdown: string;
  whyWrong: string;
  whyCorrect: string;
  stepByStep?: string;
  groundedSources: GroundingSource[];
  searchQueries?: string[];
}

export interface DayRevisionPlan {
  dayNumber: number;
  dateStr: string;
  focusTopic: string;
  priority: 'Urgent' | 'High' | 'Medium';
  durationMinutes: number;
  objectives: string[];
  suggestedTasks: string[];
  groundedResources: GroundingSource[];
}

export interface RevisionPlan {
  summary: string;
  weakTopicsFocus: string[];
  examDate: string;
  daysRemaining: number;
  dailyHours: number;
  studyStrategy: string;
  dailySchedule: DayRevisionPlan[];
  groundedSources: GroundingSource[];
}

export interface UserQuizAttempt {
  questionId: string;
  selectedOptionIndex: number;
  isCorrect: boolean;
  timeSpentSeconds: number;
  tutorExplanation?: TutorExplanation;
}

export interface QuizSessionSummary {
  totalQuestions: number;
  correctAnswers: number;
  accuracyPercentage: number;
  topicBreakdown: {
    topic: string;
    total: number;
    correct: number;
    accuracy: number;
  }[];
  weakTopics: string[];
  strongTopics: string[];
  totalTimeSeconds: number;
}
