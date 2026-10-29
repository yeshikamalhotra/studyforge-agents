import React from 'react';
import { Sparkles, BookOpen, Brain, Sun, Moon, HelpCircle, Layers, RotateCcw } from 'lucide-react';
import { AgentRole, AgentStatus } from '../types';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  activeAgent: AgentRole | null;
  agentStatuses: Record<AgentRole, AgentStatus>;
  onOpenHowItWorks: () => void;
  onOpenAbout: () => void;
  onReset: () => void;
  hasActiveSession: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  setDarkMode,
  activeAgent,
  agentStatuses,
  onOpenHowItWorks,
  onOpenAbout,
  onReset,
  hasActiveSession,
}) => {
  const agents: { role: AgentRole; label: string; icon: string; color: string }[] = [
    { role: 'reader', label: 'Reader', icon: '🔍', color: 'from-blue-500 to-cyan-500' },
    { role: 'quiz', label: 'Quiz', icon: '⚡', color: 'from-amber-500 to-orange-500' },
    { role: 'tutor', label: 'Tutor', icon: '🎓', color: 'from-emerald-500 to-teal-500' },
    { role: 'planner', label: 'Planner', icon: '📅', color: 'from-purple-500 to-indigo-500' },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-200 bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                StudyForge <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Agents</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Gemini 3.8
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Multi-Agent AI Study Engine for College Students
            </p>
          </div>
        </div>

        {/* Live Agent Pills (Visible Pipeline Status) */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-full border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 px-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            Pipeline:
          </span>
          {agents.map((agent) => {
            const isActive = activeAgent === agent.role;
            const status = agentStatuses[agent.role];
            return (
              <div
                key={agent.role}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30 scale-105'
                    : status === 'completed'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{agent.icon}</span>
                <span>{agent.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
                {status === 'completed' && !isActive && (
                  <span className="text-emerald-500 font-bold">✓</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions & Utilities */}
        <div className="flex items-center gap-2">
          {hasActiveSession && (
            <button
              onClick={onReset}
              title="Reset study session"
              className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden md:inline">New Session</span>
            </button>
          )}

          <button
            onClick={onOpenHowItWorks}
            className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-medium"
            title="How the 4 agents collaborate"
          >
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Pipeline</span>
          </button>

          <button
            onClick={onOpenAbout}
            className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-medium"
            title="About StudyForge Agents & Google Gemini tools"
          >
            <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">About</span>
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle color theme"
            className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
