import React from 'react';
import {
  X,
  Brain,
  Sparkles,
  HelpCircle,
  Code2,
  Search,
  Cpu,
  Layers,
  GraduationCap,
  Calendar,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand & Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Brain className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              About StudyForge Agents
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Multi-Agent College Study Assistant powered by Google Gemini API
            </p>
          </div>
        </div>

        <div className="space-y-6 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
          {/* The Problem */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              The College Student Problem
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              College students are routinely inundated with 50+ slide decks, dense textbook readings, and handwritten notes without personal tutors to test their recall, explain nuances when they make errors, or construct a disciplined day-by-day revision schedule before exams.
            </p>
          </div>

          {/* The 4-Agent Pipeline Solution */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              The Multi-Agent Architecture
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-xs text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1.5">
                  <span>🔍</span> Reader Agent
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Performs structured content extraction from pasted notes or uploaded PDFs/slide images, isolating key topics, formulas, variables, and definitions.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-xs text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1.5">
                  <span>⚡</span> Quiz Agent
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Formulates university-grade MCQs targeting configured difficulty. Executes Python code to calculate formulas and ensure zero math hallucinations.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-xs text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1.5">
                  <span>🎓</span> Tutor Agent
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Explains errors using memorable real-world analogies and searches the live web using Google Search grounding for peer-reviewed academic sources.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-xs text-purple-600 dark:text-purple-400 mb-1 flex items-center gap-1.5">
                  <span>📅</span> Planner Agent
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Audits quiz accuracy per topic, isolates weak spots, and builds a day-by-day revision roadmap with Google Search grounded practice links.
                </p>
              </div>
            </div>
          </div>

          {/* Gemini API Capabilities Showcased */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              Google Gemini API Features Showcased
            </h3>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-850">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Dedicated System Instructions:</strong> Each agent runs with tailored pedagogical instructions, strict tone boundaries, and schemas.
                </span>
              </li>
              <li className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-850">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Gemini Code Execution (Python):</strong> Quiz Agent runs Python code in a secure sandbox to verify complex mathematical formulas and numerical results.
                </span>
              </li>
              <li className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-850">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Google Search Grounding:</strong> Both Tutor and Planner Agents ground responses with live Google Search, returning citations from Khan Academy, MIT OCW, and university portals.
                </span>
              </li>
              <li className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-850">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Multimodal OCR & Vision:</strong> Direct processing of lecture slide photos and PDF documents using Gemini multimodal inline data.
                </span>
              </li>
              <li className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-850">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Structured JSON Output:</strong> Enforces JSON schemas for reliable inter-agent pipelines and error-free UI rendering.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
