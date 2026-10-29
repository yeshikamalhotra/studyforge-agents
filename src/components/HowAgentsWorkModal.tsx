import React from 'react';
import {
  X,
  FileSearch,
  Code2,
  GraduationCap,
  CalendarDays,
  ArrowRight,
  Sparkles,
  Search,
  Cpu,
  Layers,
  Database,
  ShieldCheck,
} from 'lucide-react';

interface HowAgentsWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowAgentsWorkModal: React.FC<HowAgentsWorkModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const agents = [
    {
      num: '1',
      title: 'Reader Agent',
      badge: 'Multimodal Vision & JSON Schema',
      icon: FileSearch,
      color: 'from-blue-600 to-cyan-500',
      description:
        'Reads raw lecture notes, PDF slides, or whiteboard images. Extracts core topics, importance tags, math formulas with variable definitions, and vocabulary into structured JSON.',
      handoff: 'Hands off structured study topics and formulas to the Quiz Agent.',
      geminiTool: 'Gemini 3.8 Flash + Response Schema + InlineData',
    },
    {
      num: '2',
      title: 'Quiz Agent',
      badge: 'Code Execution (Python)',
      icon: Code2,
      color: 'from-amber-500 to-orange-500',
      description:
        'Generates university-level MCQs targeting selected difficulty. When mathematical formulas are present, it invokes Python Code Execution to calculate exact values and prevent arithmetic hallucinations.',
      handoff: 'Hands off student answer errors and weak topics to the Tutor Agent.',
      geminiTool: 'Gemini Code Execution + Structured Output',
    },
    {
      num: '3',
      title: 'Tutor Agent',
      badge: 'Google Search Grounding',
      icon: GraduationCap,
      color: 'from-emerald-500 to-teal-500',
      description:
        'Activates instantly when a student misses a question or asks for explanation. Formulates an intuitive real-world analogy and grounds explanations with Google Search to cite academic articles and university resources.',
      handoff: 'Passes diagnostic error logs and student weak spots to the Planner Agent.',
      geminiTool: 'Google Search Grounding + System Instructions',
    },
    {
      num: '4',
      title: 'Planner Agent',
      badge: 'Grounded Revision Timetable',
      icon: CalendarDays,
      color: 'from-purple-600 to-indigo-600',
      description:
        'Aggregates topic mastery statistics, missed questions, and your exam date. Produces an adaptive day-by-day revision schedule with Google Search grounded practice problem sets, cheat sheets, and flashcards.',
      handoff: 'Delivers the complete revision timetable and downloadable PDF study sheet.',
      geminiTool: 'Google Search Grounding + Structured Schema',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 mb-2">
            <Layers className="w-3.5 h-3.5" />
            Autonomous Multi-Agent Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            How the 4 Specialized Agents Collaborate
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Each agent has its own specialized system instruction, tools, and structured interface, running in a seamless sequential pipeline.
          </p>
        </div>

        {/* Pipeline Diagram */}
        <div className="space-y-4 mb-6">
          {agents.map((agent, i) => {
            const Icon = agent.icon;
            return (
              <div
                key={agent.num}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 relative transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${agent.color} text-white font-black text-sm flex items-center justify-center shadow-sm`}
                    >
                      {agent.num}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                        {agent.title}
                      </h4>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        {agent.badge}
                      </span>
                    </div>
                  </div>

                  <span className="self-start sm:self-center text-[10px] font-mono px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 font-bold">
                    {agent.geminiTool}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mb-3 leading-relaxed">
                  {agent.description}
                </p>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  <span>Pipeline Handoff: {agent.handoff}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Got it, Let&apos;s Study
          </button>
        </div>
      </div>
    </div>
  );
};
