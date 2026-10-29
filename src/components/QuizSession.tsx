import React, { useState, useEffect } from 'react';
import { QuizQuestion, UserQuizAttempt, TutorExplanation } from '../types';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Send,
  Loader2,
  Code2,
  Search,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

interface QuizSessionProps {
  questions: QuizQuestion[];
  onCompleteQuiz: (attempts: UserQuizAttempt[]) => void;
  onRequestTutorExplanation: (payload: {
    question: string;
    selectedOption: string;
    correctOption: string;
    topicTag: string;
    studentQuery?: string;
  }) => Promise<TutorExplanation | null>;
  isTutorLoading: boolean;
}

export const QuizSession: React.FC<QuizSessionProps> = ({
  questions,
  onCompleteQuiz,
  onRequestTutorExplanation,
  isTutorLoading,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [attempts, setAttempts] = useState<UserQuizAttempt[]>([]);
  const [currentTutorExplanation, setCurrentTutorExplanation] = useState<TutorExplanation | null>(null);
  const [followUpQuery, setFollowUpQuery] = useState('');
  const [isFollowUpLoading, setIsFollowUpLoading] = useState(false);

  // Per-question timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const currentQ = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + (isAnswerSubmitted ? 1 : 0)) / questions.length) * 100);

  // Timer effect
  useEffect(() => {
    if (isAnswerSubmitted) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [currentIndex, isAnswerSubmitted]);

  // Handle option selection
  const handleSelectOption = async (optionIndex: number) => {
    if (isAnswerSubmitted) return;

    setSelectedOptionIndex(optionIndex);
    setIsAnswerSubmitted(true);

    const isCorrect = optionIndex === currentQ.correctAnswerIndex;
    const selectedText = currentQ.options[optionIndex];
    const correctText = currentQ.options[currentQ.correctAnswerIndex];

    let tutorResult: TutorExplanation | null = null;

    // Automatically invoke Tutor Agent when user answers incorrectly!
    if (!isCorrect) {
      tutorResult = await onRequestTutorExplanation({
        question: currentQ.question,
        selectedOption: selectedText,
        correctOption: correctText,
        topicTag: currentQ.topicTag,
      });
      setCurrentTutorExplanation(tutorResult);
    } else {
      setCurrentTutorExplanation(null);
    }

    const newAttempt: UserQuizAttempt = {
      questionId: currentQ.id,
      selectedOptionIndex: optionIndex,
      isCorrect,
      timeSpentSeconds: secondsElapsed,
      tutorExplanation: tutorResult || undefined,
    };

    setAttempts((prev) => [...prev, newAttempt]);
  };

  // Manual trigger: Student clicks "Explain this" even if correct or wanting deeper insight
  const handleManualExplain = async () => {
    if (!isAnswerSubmitted || selectedOptionIndex === null) return;
    const selectedText = currentQ.options[selectedOptionIndex];
    const correctText = currentQ.options[currentQ.correctAnswerIndex];

    const result = await onRequestTutorExplanation({
      question: currentQ.question,
      selectedOption: selectedText,
      correctOption: correctText,
      topicTag: currentQ.topicTag,
    });
    setCurrentTutorExplanation(result);
  };

  // Student asks follow-up query to Tutor Agent
  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpQuery.trim() || isFollowUpLoading || selectedOptionIndex === null) return;

    setIsFollowUpLoading(true);
    const selectedText = currentQ.options[selectedOptionIndex];
    const correctText = currentQ.options[currentQ.correctAnswerIndex];

    const result = await onRequestTutorExplanation({
      question: currentQ.question,
      selectedOption: selectedText,
      correctOption: correctText,
      topicTag: currentQ.topicTag,
      studentQuery: followUpQuery.trim(),
    });

    if (result) {
      setCurrentTutorExplanation(result);
      setFollowUpQuery('');
    }
    setIsFollowUpLoading(false);
  };

  // Advance to next question or complete
  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
      setIsAnswerSubmitted(false);
      setCurrentTutorExplanation(null);
      setSecondsElapsed(0);
      setFollowUpQuery('');
    } else {
      onCompleteQuiz(attempts);
    }
  };

  const isCurrentCorrect = selectedOptionIndex !== null && selectedOptionIndex === currentQ.correctAnswerIndex;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Quiz Progress & Timer Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-extrabold flex items-center justify-center text-sm">
            {currentIndex + 1}/{questions.length}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {currentQ.topicTag}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                {currentQ.difficulty}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-48 sm:w-64 h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Live Timer and Numerical Code Execution Tag */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {currentQ.isNumerical && (
            <div
              title="Verified by Gemini Python Code Execution"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/70"
            >
              <Cpu className="w-3.5 h-3.5 text-amber-600" />
              <span>Python Verified</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {Math.floor(secondsElapsed / 60)}:
              {String(secondsElapsed % 60).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        {/* Question Text */}
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed mb-6">
          {currentQ.question}
        </h3>

        {/* Options Grid */}
        <div className="space-y-3 mb-6">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOptionIndex === idx;
            const isCorrect = idx === currentQ.correctAnswerIndex;
            const letter = String.fromCharCode(65 + idx);

            let optionStyle =
              'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-950/20';

            if (isAnswerSubmitted) {
              if (isCorrect) {
                optionStyle =
                  'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/20';
              } else if (isSelected && !isCorrect) {
                optionStyle =
                  'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100 ring-2 ring-rose-500/20';
              } else {
                optionStyle = 'opacity-40 border-slate-200 dark:border-slate-800';
              }
            } else if (isSelected) {
              optionStyle =
                'border-blue-600 bg-blue-50 dark:bg-blue-950/40 ring-2 ring-blue-500/30';
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isAnswerSubmitted}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer ${optionStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
                      isAnswerSubmitted && isCorrect
                        ? 'bg-emerald-600 text-white'
                        : isAnswerSubmitted && isSelected && !isCorrect
                        ? 'bg-rose-600 text-white'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100">
                    {option}
                  </span>
                </div>

                {isAnswerSubmitted && (
                  <div className="shrink-0">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : isSelected ? (
                      <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    ) : null}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Immediate Feedback Box after Answer */}
        {isAnswerSubmitted && (
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            {/* Quick Answer Banner */}
            <div
              className={`p-4 rounded-2xl flex items-start justify-between gap-3 ${
                isCurrentCorrect
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {isCurrentCorrect ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-sm sm:text-base">
                    {isCurrentCorrect ? 'Spot on! Correct answer.' : 'Not quite right.'}
                  </h4>
                  <p className="text-xs sm:text-sm mt-1 opacity-90">
                    {currentQ.explanation}
                  </p>
                </div>
              </div>

              {/* If user answered correctly, option to still consult Tutor */}
              {isCurrentCorrect && !currentTutorExplanation && (
                <button
                  onClick={handleManualExplain}
                  disabled={isTutorLoading}
                  className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100/50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask Tutor Deeper</span>
                </button>
              )}
            </div>

            {/* Python Code Verification Snippet (for numerical problems) */}
            {currentQ.codeVerification && currentQ.codeVerification.codeSnippet && (
              <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 font-mono text-xs">
                <div className="flex items-center justify-between text-[11px] text-amber-400 font-bold mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5" />
                    Quiz Agent Code Execution Verification:
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 text-[10px]">
                    Verified
                  </span>
                </div>
                <pre className="text-emerald-400 overflow-x-auto text-[11px] leading-relaxed">
                  {currentQ.codeVerification.codeSnippet}
                </pre>
                {currentQ.codeVerification.resultSnippet && (
                  <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-slate-400 text-[11px]">
                    Result: <span className="text-white font-bold">{currentQ.codeVerification.resultSnippet}</span>
                  </div>
                )}
              </div>
            )}

            {/* Tutor Agent Loading State */}
            {isTutorLoading && (
              <div className="p-6 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 text-center space-y-2">
                <Loader2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto" />
                <p className="text-xs sm:text-sm font-bold text-indigo-900 dark:text-indigo-200">
                  Tutor Agent is formulating an intuitive analogy & grounding with Google Search...
                </p>
                <p className="text-xs text-indigo-600/80 dark:text-indigo-400">
                  Fetching trusted academic citations for {currentQ.topicTag}
                </p>
              </div>
            )}

            {/* Tutor Agent Explanation Card */}
            {currentTutorExplanation && (
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-indigo-50/90 to-blue-50/90 dark:from-indigo-950/40 dark:to-slate-900 border border-indigo-200 dark:border-indigo-800/80 shadow-sm space-y-4">
                {/* Tutor Header */}
                <div className="flex items-center justify-between pb-3 border-b border-indigo-100 dark:border-indigo-900/60">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      🎓
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Tutor Agent Diagnostic
                      </h4>
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                        Analogy Breakdown + Google Search Grounded Sources
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200 flex items-center gap-1">
                    <Search className="w-3 h-3" />
                    Search Grounded
                  </span>
                </div>

                {/* The Analogy */}
                <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-indigo-100 dark:border-indigo-900/40">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
                    💡 The Mental Model / Analogy
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed italic">
                    "{currentTutorExplanation.analogy}"
                  </p>
                </div>

                {/* Diagnostic: Why Wrong & Why Correct */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 text-xs">
                    <span className="font-bold text-rose-700 dark:text-rose-300 block mb-1">
                      ⚠️ Why the selected option failed:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {currentTutorExplanation.whyWrong}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-xs">
                    <span className="font-bold text-emerald-700 dark:text-emerald-300 block mb-1">
                      ✅ Why the correct option is sound:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {currentTutorExplanation.whyCorrect}
                    </p>
                  </div>
                </div>

                {/* Step-by-step logic if available */}
                {currentTutorExplanation.stepByStep && (
                  <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-slate-900 dark:text-white block mb-1">
                      🔢 Step-by-Step Logic:
                    </span>
                    <p className="font-mono text-[11px] leading-relaxed">
                      {currentTutorExplanation.stepByStep}
                    </p>
                  </div>
                )}

                {/* Grounded Web Sources */}
                {currentTutorExplanation.groundedSources && currentTutorExplanation.groundedSources.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2 flex items-center gap-1.5">
                      <Search className="w-3 h-3 text-blue-500" />
                      Google Search Grounded Academic Sources & Readings:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {currentTutorExplanation.groundedSources.map((source, sIdx) => (
                        <a
                          key={sIdx}
                          href={source.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:border-blue-400 shadow-xs transition-all"
                        >
                          <BookOpen className="w-3 h-3 text-indigo-500" />
                          <span className="max-w-[200px] truncate">{source.title}</span>
                          <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Follow-up question input */}
                <form onSubmit={handleFollowUpSubmit} className="pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={followUpQuery}
                      onChange={(e) => setFollowUpQuery(e.target.value)}
                      placeholder="Ask the Tutor a follow-up doubt on this question..."
                      className="flex-1 px-3.5 py-2 rounded-xl border border-indigo-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    />
                    <button
                      type="submit"
                      disabled={!followUpQuery.trim() || isFollowUpLoading}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {isFollowUpLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span className="hidden sm:inline">Ask</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Next Question / Finish Quiz Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNextQuestion}
                className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>
                  {currentIndex + 1 < questions.length ? 'Next Question' : 'View Performance Dashboard'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
