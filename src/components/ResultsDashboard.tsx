import React, { useState } from 'react';
import {
  QuizSessionSummary,
  RevisionPlan,
  QuizQuestion,
  UserQuizAttempt,
  ExtractedStudyMaterial,
} from '../types';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Sparkles,
  Search,
  BookOpen,
  ArrowRight,
  Download,
  RotateCcw,
  AlertTriangle,
  Flame,
  Printer,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Target,
  Sliders,
  Loader2,
} from 'lucide-react';

interface ResultsDashboardProps {
  summary: QuizSessionSummary;
  questions: QuizQuestion[];
  attempts: UserQuizAttempt[];
  extractedMaterial: ExtractedStudyMaterial;
  revisionPlan: RevisionPlan | null;
  onGenerateRevisionPlan: (examDate: string, hoursPerDay: number) => void;
  isPlannerLoading: boolean;
  onRetakeQuiz: () => void;
  onNewSession: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  summary,
  questions,
  attempts,
  extractedMaterial,
  revisionPlan,
  onGenerateRevisionPlan,
  isPlannerLoading,
  onRetakeQuiz,
  onNewSession,
}) => {
  // Default exam date: 7 days from now formatted YYYY-MM-DD
  const defaultDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const [examDate, setExamDate] = useState(defaultDate);
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [showQuestionsBreakdown, setShowQuestionsBreakdown] = useState(true);

  // Print/Download PDF handler
  const handlePrintPDF = () => {
    window.print();
  };

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 90) return { title: 'Exceptional Mastery! 🌟', sub: 'You have a solid command of these concepts and formulas.' };
    if (percentage >= 70) return { title: 'Good Solid Foundation! 🚀', sub: 'Great work. A quick targeted review on weak areas will get you to an A.' };
    if (percentage >= 50) return { title: 'Promising Start! 📚', sub: 'Several misconceptions identified. The Planner Agent can target these.' };
    return { title: 'Study Priority Needed! ⚡', sub: 'Key topics need revision. Let the Planner Agent build your recovery timetable.' };
  };

  const scoreInfo = getScoreMessage(summary.accuracyPercentage);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Printable Sheet styling is handled via print media queries */}

      {/* Top Banner: Score & Diagnostic Card */}
      <div className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 inline-block">
              Quiz Completed • Results Analysis
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {scoreInfo.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl">
              {scoreInfo.sub}
            </p>
          </div>

          {/* Score Badge */}
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="text-center">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400 block">
                Your Score
              </span>
              <div className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-blue-400">
                {summary.correctAnswers}/{summary.totalQuestions}
              </div>
            </div>

            <div className="h-10 w-px bg-slate-200 dark:bg-slate-700" />

            <div className="text-center">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400 block">
                Accuracy
              </span>
              <div className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400">
                {summary.accuracyPercentage}%
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown Row: Topic Chart & Weak Topics Identified */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {/* Topic Accuracy Bar Chart */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-blue-500" />
              Mastery by Topic
            </h4>
            <div className="space-y-3">
              {summary.topicBreakdown.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[220px]">
                      {item.topic}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 font-mono">
                      {item.correct}/{item.total} ({item.accuracy}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.accuracy >= 80
                          ? 'bg-emerald-500'
                          : item.accuracy >= 50
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${item.accuracy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weak Topics Focus */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Priority Weak Topics Detected
            </h4>

            {summary.weakTopics.length > 0 ? (
              <div className="space-y-2">
                {summary.weakTopics.map((topic, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {topic}
                      </span>
                    </div>
                    <span className="text-amber-700 dark:text-amber-300 font-semibold">
                      Target for Revision
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 inline mr-1.5" />
                No critical weak topics flagged! You performed consistently across all tested areas.
              </div>
            )}

            {/* Quick Actions Bar */}
            <div className="pt-2 flex flex-wrap gap-2">
              <button
                onClick={handlePrintPDF}
                className="py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Download study sheet as PDF"
              >
                <Printer className="w-3.5 h-3.5 text-blue-500" />
                <span>Download as PDF</span>
              </button>

              <button
                onClick={onRetakeQuiz}
                className="py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Quiz</span>
              </button>

              <button
                onClick={onNewSession}
                className="py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>New Notes</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PLANNER AGENT SECTION: Revision Schedule */}
      <div className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 mb-2">
              <Calendar className="w-3.5 h-3.5" />
              Planner Agent: Day-by-Day Revision Timetable
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Personalized Revision Plan
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              The Planner Agent analyzes your weak areas and exam date, synthesizing a strategic schedule with Google Search grounded practice resources.
            </p>
          </div>

          {/* Form to configure Planner Agent */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Target Exam Date
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Study Time / Day
              </label>
              <select
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Number(e.target.value))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              >
                <option value={1}>1 Hour / day</option>
                <option value={2}>2 Hours / day</option>
                <option value={3}>3 Hours / day</option>
                <option value={4}>4 Hours / day</option>
                <option value={6}>6 Hours / day (Cram)</option>
              </select>
            </div>

            <div className="self-end">
              <button
                onClick={() => onGenerateRevisionPlan(examDate, hoursPerDay)}
                disabled={isPlannerLoading}
                className="py-2 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isPlannerLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Planning...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{revisionPlan ? 'Regenerate Plan' : 'Generate Revision Plan'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Revision Plan Content */}
        {revisionPlan ? (
          <div className="space-y-5">
            {/* Strategy Banner */}
            <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/80">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  📅
                </div>
                <div>
                  <h4 className="font-bold text-sm text-purple-900 dark:text-purple-200">
                    Strategy: {revisionPlan.studyStrategy}
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                    {revisionPlan.summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Daily Schedule Cards */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-500" />
                Day-by-Day Focus Timetable
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {revisionPlan.dailySchedule?.map((day, dIdx) => (
                  <div
                    key={dIdx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/50 border border-slate-200 dark:border-slate-800 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {day.dateStr || `Day ${day.dayNumber}`}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          day.priority === 'Urgent'
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                            : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                        }`}
                      >
                        {day.priority} Focus • {day.durationMinutes} min
                      </span>
                    </div>

                    <h5 className="font-bold text-sm text-blue-600 dark:text-blue-400">
                      Topic: {day.focusTopic}
                    </h5>

                    {day.objectives && day.objectives.length > 0 && (
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          Key Objectives:
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                          {day.objectives.map((obj, i) => (
                            <li key={i}>{obj}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {day.suggestedTasks && day.suggestedTasks.length > 0 && (
                      <div className="text-xs text-slate-600 dark:text-slate-400 pt-1.5 border-t border-slate-200/60 dark:border-slate-800">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          Tasks:
                        </span>
                        <ul className="space-y-1 text-[11px]">
                          {day.suggestedTasks.map((task, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-purple-500 font-bold">✓</span>
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Google Search Grounded Extra Study Resources */}
            {revisionPlan.groundedSources && revisionPlan.groundedSources.length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2.5 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-blue-500" />
                  Planner Curated External Resources (Google Search Grounded):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {revisionPlan.groundedSources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 border border-slate-200 dark:border-slate-800 hover:border-blue-300 transition-all flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <BookOpen className="w-4 h-4 text-purple-500 shrink-0" />
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                          {source.title}
                        </span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50/50 dark:bg-slate-850/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
            <Calendar className="w-8 h-8 text-purple-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No Revision Plan Generated Yet
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Select your exam date and daily study availability above, then click &quot;Generate Revision Plan&quot; to have the Planner Agent create an adaptive study schedule.
            </p>
          </div>
        )}
      </div>

      {/* DETAILED QUESTION BREAKDOWN (With Correct Answers & Tutor Explanations for Printing / Review) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Questions & Detailed Answer Key
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete review of all questions with correct answers, formulas, and Tutor diagnostics
            </p>
          </div>

          <button
            onClick={() => setShowQuestionsBreakdown(!showQuestionsBreakdown)}
            className="no-print p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {showQuestionsBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showQuestionsBreakdown && (
          <div className="space-y-4">
            {questions.map((q, idx) => {
              const attempt = attempts.find((a) => a.questionId === q.id);
              const isCorrect = attempt?.isCorrect;
              const selectedIndex = attempt?.selectedOptionIndex ?? -1;

              return (
                <div
                  key={q.id || idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/40 border border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                        {q.question}
                      </h4>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {q.topicTag}
                      </span>
                      {attempt && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isCorrect
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}
                        >
                          {isCorrect ? 'Correct' : 'Missed'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Options List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, oIdx) => {
                      const isOptionCorrect = oIdx === q.correctAnswerIndex;
                      const wasUserSelected = oIdx === selectedIndex;
                      const letter = String.fromCharCode(65 + oIdx);

                      return (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-xl border flex items-center justify-between ${
                            isOptionCorrect
                              ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-semibold'
                              : wasUserSelected && !isOptionCorrect
                              ? 'border-rose-400 bg-rose-50/80 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 opacity-80'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-400">
                              {letter}.
                            </span>
                            <span>{opt}</span>
                          </span>
                          {isOptionCorrect && (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              ✓ Answer
                            </span>
                          )}
                          {wasUserSelected && !isOptionCorrect && (
                            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                              Your Choice
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation box */}
                  <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-900/40 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    <span className="font-bold text-blue-700 dark:text-blue-300 block">
                      💡 Correct Logic / Formula:
                    </span>
                    <p>{q.explanation}</p>
                    {attempt?.tutorExplanation?.analogy && (
                      <p className="italic text-indigo-700 dark:text-indigo-300 text-[11px] pt-1">
                        Analogy: &quot;{attempt.tutorExplanation.analogy}&quot;
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
