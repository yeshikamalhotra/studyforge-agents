import React, { useState, useEffect } from 'react';
import {
  AgentActivityLog,
  AgentRole,
  AgentStatus,
  ExtractedStudyMaterial,
  QuizQuestion,
  UserQuizAttempt,
  QuizSessionSummary,
  RevisionPlan,
  TutorExplanation,
} from './types';
import { Navbar } from './components/Navbar';
import { AgentPipelineTracker } from './components/AgentPipelineTracker';
import { InputSection } from './components/InputSection';
import { ExtractedMaterialCard } from './components/ExtractedMaterialCard';
import { QuizSession } from './components/QuizSession';
import { ResultsDashboard } from './components/ResultsDashboard';
import { HowAgentsWorkModal } from './components/HowAgentsWorkModal';
import { AboutModal } from './components/AboutModal';
import { triggerQuizCompletionConfetti } from './utils/confetti';
import {
  Sparkles,
  AlertCircle,
  Layers,
  GraduationCap,
  Calendar,
  CheckCircle2,
  FileSearch,
  Code2,
} from 'lucide-react';

function cleanErrorMessage(err: any): string {
  const msg = err?.message || String(err || 'An error occurred.');
  try {
    const parsed = JSON.parse(msg);
    if (parsed.error?.message) {
      if (parsed.error.code === 503 || parsed.error.message.includes('high demand') || parsed.error.status === 'UNAVAILABLE') {
        return 'The Gemini model is temporarily experiencing high demand. Please retry in a few moments.';
      }
      return parsed.error.message;
    }
  } catch {}
  if (msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE')) {
    return 'The Gemini model is temporarily experiencing high demand. Please retry in a few moments.';
  }
  return msg;
}

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('studyforge_theme') === 'dark' ||
        (!localStorage.getItem('studyforge_theme') &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
      );
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('studyforge_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('studyforge_theme', 'light');
    }
  }, [darkMode]);

  // Modals state
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Agent Pipeline States
  const [activeAgent, setActiveAgent] = useState<AgentRole | null>(null);
  const [agentStatuses, setAgentStatuses] = useState<Record<AgentRole, AgentStatus>>({
    reader: 'idle',
    quiz: 'idle',
    tutor: 'idle',
    planner: 'idle',
  });
  const [activityLogs, setActivityLogs] = useState<AgentActivityLog[]>([]);

  // Application session states
  const [phase, setPhase] = useState<'input' | 'quiz' | 'results'>('input');
  const [isPipelineLoading, setIsPipelineLoading] = useState(false);
  const [isTutorLoading, setIsTutorLoading] = useState(false);
  const [isPlannerLoading, setIsPlannerLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Extracted study data and questions
  const [extractedMaterial, setExtractedMaterial] = useState<ExtractedStudyMaterial | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<UserQuizAttempt[]>([]);
  const [quizSummary, setQuizSummary] = useState<QuizSessionSummary | null>(null);
  const [revisionPlan, setRevisionPlan] = useState<RevisionPlan | null>(null);

  // Helper: append to activity log feed
  const addLog = (
    agent: AgentRole,
    agentName: string,
    action: string,
    details?: string,
    toolsUsed?: ('Structured JSON' | 'Code Execution' | 'Google Search Grounding' | 'Multimodal Vision')[],
    handoffTo?: AgentRole,
    status: 'working' | 'success' | 'info' | 'error' = 'working'
  ) => {
    const timeStr = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const newLog: AgentActivityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: timeStr,
      agent,
      agentName,
      action,
      details,
      toolsUsed,
      handoffTo,
      status,
    };

    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // STEP 1 & 2: LAUNCH PIPELINE (Reader Agent -> Quiz Agent)
  const handleStartPipeline = async ({
    notesText,
    fileData,
    difficulty,
    questionCount,
  }: {
    notesText: string;
    fileData?: { mimeType: string; base64: string; fileName: string };
    difficulty: 'Foundation' | 'Intermediate' | 'Advanced' | 'Exam Prep';
    questionCount: number;
  }) => {
    setErrorMessage(null);
    setIsPipelineLoading(true);
    setActivityLogs([]);
    setRevisionPlan(null);

    // 1. Activate Reader Agent
    setActiveAgent('reader');
    setAgentStatuses((prev) => ({ ...prev, reader: 'working', quiz: 'idle', tutor: 'idle', planner: 'idle' }));

    addLog(
      'reader',
      'Reader Agent',
      fileData
        ? `Processing uploaded document "${fileData.fileName}" via Gemini Multimodal OCR...`
        : 'Parsing study notes text and isolating high-yield concepts...',
      undefined,
      fileData ? ['Multimodal Vision', 'Structured JSON'] : ['Structured JSON']
    );

    let extracted: ExtractedStudyMaterial;

    try {
      const readerRes = await fetch('/api/agents/reader', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: notesText,
          fileData,
        }),
      });

      const readerData = await readerRes.json();
      if (!readerRes.ok || !readerData.success) {
        throw new Error(readerData.error || 'Reader Agent failed to parse study notes.');
      }

      extracted = readerData.extractedMaterial;
      setExtractedMaterial(extracted);

      addLog(
        'reader',
        'Reader Agent',
        `Extracted ${extracted.topics?.length || 0} core topics, ${extracted.formulas?.length || 0} formulas, and ${extracted.definitions?.length || 0} key definitions.`,
        undefined,
        ['Structured JSON'],
        'quiz',
        'success'
      );
      setAgentStatuses((prev) => ({ ...prev, reader: 'completed' }));
    } catch (err: any) {
      console.error(err);
      setAgentStatuses((prev) => ({ ...prev, reader: 'error' }));
      setActiveAgent(null);
      setIsPipelineLoading(false);
      setErrorMessage(cleanErrorMessage(err));
      return;
    }

    // 2. Activate Quiz Agent
    setActiveAgent('quiz');
    setAgentStatuses((prev) => ({ ...prev, quiz: 'working' }));

    const hasFormulas = extracted.formulas && extracted.formulas.length > 0;

    addLog(
      'quiz',
      'Quiz Agent',
      `Designing ${questionCount} MCQs (${difficulty}). ${
        hasFormulas ? 'Using Gemini Code Execution (Python) to verify math formulas.' : 'Crafting conceptual scenario questions.'
      }`,
      undefined,
      hasFormulas ? ['Code Execution', 'Structured JSON'] : ['Structured JSON']
    );

    try {
      const quizRes = await fetch('/api/agents/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extractedMaterial: extracted,
          difficulty,
          count: questionCount,
        }),
      });

      const quizData = await quizRes.json();
      if (!quizRes.ok || !quizData.success) {
        throw new Error(quizData.error || 'Quiz Agent failed to generate questions.');
      }

      const generatedQuestions: QuizQuestion[] = quizData.questions || [];
      if (generatedQuestions.length === 0) {
        throw new Error('No quiz questions were returned by Quiz Agent.');
      }

      setQuestions(generatedQuestions);
      setAgentStatuses((prev) => ({ ...prev, quiz: 'completed' }));
      setActiveAgent(null);
      setIsPipelineLoading(false);

      const numCount = generatedQuestions.filter((q) => q.isNumerical).length;
      addLog(
        'quiz',
        'Quiz Agent',
        `Generated ${generatedQuestions.length} MCQs (${numCount} numerical questions verified via Python). Ready for Quiz mode.`,
        undefined,
        ['Code Execution'],
        undefined,
        'success'
      );

      // Transition to Quiz phase
      setPhase('quiz');
    } catch (err: any) {
      console.error(err);
      setAgentStatuses((prev) => ({ ...prev, quiz: 'error' }));
      setActiveAgent(null);
      setIsPipelineLoading(false);
      setErrorMessage(cleanErrorMessage(err));
    }
  };

  // STEP 3: TUTOR AGENT (Invoked automatically on mistakes or manual request)
  const handleRequestTutorExplanation = async ({
    question,
    selectedOption,
    correctOption,
    topicTag,
    studentQuery,
  }: {
    question: string;
    selectedOption: string;
    correctOption: string;
    topicTag: string;
    studentQuery?: string;
  }): Promise<TutorExplanation | null> => {
    setActiveAgent('tutor');
    setIsTutorLoading(true);
    setAgentStatuses((prev) => ({ ...prev, tutor: 'working' }));

    addLog(
      'tutor',
      'Tutor Agent',
      studentQuery
        ? `Answering student follow-up: "${studentQuery.slice(0, 40)}..."`
        : `Diagnostic active on missed concept: "${topicTag}". Grounding with Google Search...`,
      undefined,
      ['Google Search Grounding', 'Structured JSON']
    );

    try {
      const res = await fetch('/api/agents/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          selectedOption,
          correctOption,
          topicTag,
          studentQuery,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Tutor Agent failed to generate explanation.');
      }

      const explanation: TutorExplanation = data.explanation;
      const sourceCount = explanation.groundedSources?.length || 0;

      addLog(
        'tutor',
        'Tutor Agent',
        `Formulated real-world analogy and cited ${sourceCount} verified web sources via Google Search grounding.`,
        undefined,
        ['Google Search Grounding'],
        undefined,
        'success'
      );

      setAgentStatuses((prev) => ({ ...prev, tutor: 'completed' }));
      setActiveAgent(null);
      setIsTutorLoading(false);
      return explanation;
    } catch (err: any) {
      console.error(err);
      addLog(
        'tutor',
        'Tutor Agent',
        `Failed to generate explanation: ${err.message}`,
        undefined,
        undefined,
        undefined,
        'error'
      );
      setAgentStatuses((prev) => ({ ...prev, tutor: 'error' }));
      setActiveAgent(null);
      setIsTutorLoading(false);
      return null;
    }
  };

  // STEP 4: QUIZ COMPLETION & RESULTS CALCULATION
  const handleCompleteQuiz = (attempts: UserQuizAttempt[]) => {
    setQuizAttempts(attempts);

    const correctCount = attempts.filter((a) => a.isCorrect).length;
    const totalCount = attempts.length;
    const accuracy = Math.round((correctCount / totalCount) * 100);

    // Topic breakdown analysis
    const topicMap: Record<string, { total: number; correct: number }> = {};
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const attempt = attempts.find((a) => a.questionId === q.id);
      if (!topicMap[q.topicTag]) {
        topicMap[q.topicTag] = { total: 0, correct: 0 };
      }
      topicMap[q.topicTag].total += 1;
      if (attempt?.isCorrect) {
        topicMap[q.topicTag].correct += 1;
      }
    }

    const topicBreakdown = Object.entries(topicMap).map(([topic, stats]) => ({
      topic,
      total: stats.total,
      correct: stats.correct,
      accuracy: Math.round((stats.correct / stats.total) * 100),
    }));

    // Weak topics: accuracy < 70%
    const weakTopics = topicBreakdown
      .filter((t) => t.accuracy < 70)
      .map((t) => t.topic);

    const strongTopics = topicBreakdown
      .filter((t) => t.accuracy >= 70)
      .map((t) => t.topic);

    const totalSeconds = attempts.reduce((acc, a) => acc + a.timeSpentSeconds, 0);

    const summary: QuizSessionSummary = {
      totalQuestions: totalCount,
      correctAnswers: correctCount,
      accuracyPercentage: accuracy,
      topicBreakdown,
      weakTopics,
      strongTopics,
      totalTimeSeconds: totalSeconds,
    };

    setQuizSummary(summary);
    setPhase('results');

    // Trigger celebratory confetti if accuracy is good
    if (accuracy >= 60) {
      triggerQuizCompletionConfetti();
    }

    addLog(
      'quiz',
      'Quiz Agent',
      `Session finished. Overall score: ${correctCount}/${totalCount} (${accuracy}%). Weak topics: ${
        weakTopics.length > 0 ? weakTopics.join(', ') : 'None'
      }.`,
      undefined,
      undefined,
      'planner',
      'success'
    );
  };

  // STEP 5: PLANNER AGENT (Synthesizes Day-by-Day Revision Plan with Google Search Grounding)
  const handleGenerateRevisionPlan = async (examDate: string, hoursPerDay: number) => {
    if (!quizSummary) return;

    setActiveAgent('planner');
    setIsPlannerLoading(true);
    setAgentStatuses((prev) => ({ ...prev, planner: 'working' }));

    addLog(
      'planner',
      'Planner Agent',
      `Analyzing score (${quizSummary.accuracyPercentage}%) and ${quizSummary.weakTopics.length} weak topics. Synthesizing timetable for exam on ${examDate} (${hoursPerDay} hrs/day)...`,
      undefined,
      ['Google Search Grounding', 'Structured JSON']
    );

    try {
      const res = await fetch('/api/agents/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicBreakdown: quizSummary.topicBreakdown,
          score: quizSummary.correctAnswers,
          totalQuestions: quizSummary.totalQuestions,
          weakTopics: quizSummary.weakTopics,
          examDate,
          hoursPerDay,
          extractedMaterial,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Planner Agent failed to generate schedule.');
      }

      const plan: RevisionPlan = data.revisionPlan;
      setRevisionPlan(plan);

      addLog(
        'planner',
        'Planner Agent',
        `Synthesized ${plan.dailySchedule?.length || 7}-day adaptive revision schedule with ${
          plan.groundedSources?.length || 0
        } Google Search grounded study links.`,
        undefined,
        ['Google Search Grounding'],
        undefined,
        'success'
      );

      setAgentStatuses((prev) => ({ ...prev, planner: 'completed' }));
      setActiveAgent(null);
      setIsPlannerLoading(false);
    } catch (err: any) {
      console.error(err);
      addLog(
        'planner',
        'Planner Agent',
        `Failed to generate plan: ${err.message}`,
        undefined,
        undefined,
        undefined,
        'error'
      );
      setAgentStatuses((prev) => ({ ...prev, planner: 'error' }));
      setActiveAgent(null);
      setIsPlannerLoading(false);
    }
  };

  // Reset to start a new session
  const handleResetSession = () => {
    setPhase('input');
    setExtractedMaterial(null);
    setQuestions([]);
    setQuizAttempts([]);
    setQuizSummary(null);
    setRevisionPlan(null);
    setActiveAgent(null);
    setAgentStatuses({
      reader: 'idle',
      quiz: 'idle',
      tutor: 'idle',
      planner: 'idle',
    });
    setActivityLogs([]);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 selection:bg-blue-500 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeAgent={activeAgent}
        agentStatuses={agentStatuses}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onReset={handleResetSession}
        hasActiveSession={phase !== 'input'}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="no-print mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs sm:text-sm flex items-start justify-between gap-3 shadow-sm">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block">Agent Pipeline Warning</strong>
                <span>{errorMessage}</span>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 dark:text-rose-400 p-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Global Multi-Agent Pipeline & Live Activity Log (Visible to Judges!) */}
        <div className="no-print">
          <AgentPipelineTracker
            activeAgent={activeAgent}
            agentStatuses={agentStatuses}
            activityLogs={activityLogs}
          />
        </div>

        {/* Phase 1: Input / Landing Stage */}
        {phase === 'input' && (
          <div className="space-y-6">
            <InputSection
              onStartPipeline={handleStartPipeline}
              isLoading={isPipelineLoading}
            />

            {/* If user previously extracted material, display it */}
            {extractedMaterial && (
              <ExtractedMaterialCard material={extractedMaterial} />
            )}
          </div>
        )}

        {/* Phase 2: Interactive Quiz Session */}
        {phase === 'quiz' && questions.length > 0 && (
          <div className="space-y-6">
            {/* Collapsible Extracted Material Reference */}
            {extractedMaterial && (
              <details className="no-print group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 text-xs">
                <summary className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileSearch className="w-4 h-4 text-blue-500" />
                    <span>View Reader Agent Extracted Material Reference</span>
                  </span>
                  <span className="text-slate-400 text-[11px] group-open:hidden">
                    Click to inspect formulas & topics
                  </span>
                </summary>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <ExtractedMaterialCard material={extractedMaterial} />
                </div>
              </details>
            )}

            <QuizSession
              questions={questions}
              onCompleteQuiz={handleCompleteQuiz}
              onRequestTutorExplanation={handleRequestTutorExplanation}
              isTutorLoading={isTutorLoading}
            />
          </div>
        )}

        {/* Phase 3: Results Dashboard & Revision Planner */}
        {phase === 'results' && quizSummary && (
          <div className="space-y-6">
            <ResultsDashboard
              summary={quizSummary}
              questions={questions}
              attempts={quizAttempts}
              extractedMaterial={
                extractedMaterial || {
                  title: 'Study Session',
                  overview: '',
                  topics: [],
                  formulas: [],
                  definitions: [],
                }
              }
              revisionPlan={revisionPlan}
              onGenerateRevisionPlan={handleGenerateRevisionPlan}
              isPlannerLoading={isPlannerLoading}
              onRetakeQuiz={() => setPhase('quiz')}
              onNewSession={handleResetSession}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="no-print mt-auto border-t border-slate-200 dark:border-slate-800 py-6 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              StudyForge Agents
            </span>
            <span>•</span>
            <span>4 Specialized Gemini Agents in Autonomous Pipeline</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsHowItWorksOpen(true)}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              How Agents Work
            </button>
            <button
              onClick={() => setIsAboutOpen(true)}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Architecture & Tools
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <HowAgentsWorkModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
}
