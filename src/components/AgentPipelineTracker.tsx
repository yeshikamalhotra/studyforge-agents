import React, { useState } from 'react';
import { AgentActivityLog, AgentRole, AgentStatus } from '../types';
import {
  FileSearch,
  Code2,
  GraduationCap,
  CalendarDays,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Terminal,
  Search,
  Cpu,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
} from 'lucide-react';

interface AgentPipelineTrackerProps {
  activeAgent: AgentRole | null;
  agentStatuses: Record<AgentRole, AgentStatus>;
  activityLogs: AgentActivityLog[];
}

export const AgentPipelineTracker: React.FC<AgentPipelineTrackerProps> = ({
  activeAgent,
  agentStatuses,
  activityLogs,
}) => {
  const [logsExpanded, setLogsExpanded] = useState(true);

  const agentDefinitions = [
    {
      role: 'reader' as AgentRole,
      name: 'Reader Agent',
      icon: FileSearch,
      toolLabel: 'Structured JSON & OCR',
      toolIcon: Sparkles,
      color: 'blue',
      description: 'Parses lecture notes/slides into topics, formulas & definitions',
    },
    {
      role: 'quiz' as AgentRole,
      name: 'Quiz Agent',
      icon: Code2,
      toolLabel: 'Code Execution (Python)',
      toolIcon: Cpu,
      color: 'amber',
      description: 'Drafts MCQs & validates numerical formulas with Python execution',
    },
    {
      role: 'tutor' as AgentRole,
      name: 'Tutor Agent',
      icon: GraduationCap,
      toolLabel: 'Google Search Grounding',
      toolIcon: Search,
      color: 'emerald',
      description: 'Explains errors with real-world analogies & verified web citations',
    },
    {
      role: 'planner' as AgentRole,
      name: 'Planner Agent',
      icon: CalendarDays,
      toolLabel: 'Search-Grounded Timetable',
      toolIcon: Search,
      color: 'purple',
      description: 'Maps weak topics to exam date with curated study links',
    },
  ];

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm mb-6 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Multi-Agent Collaboration Pipeline
              {activeAgent && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                  Agent Active
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Visible pipeline with Gemini System Instructions, Code Execution & Search Grounding
            </p>
          </div>
        </div>

        <button
          onClick={() => setLogsExpanded(!logsExpanded)}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Terminal className="w-3.5 h-3.5 text-blue-500" />
          <span>Activity Log ({activityLogs.length})</span>
          {logsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 4-Agent Pipeline Visual Stepper */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
        {agentDefinitions.map((agent, index) => {
          const isActive = activeAgent === agent.role;
          const status = agentStatuses[agent.role];
          const isCompleted = status === 'completed';
          const isError = status === 'error';
          const IconComponent = agent.icon;
          const ToolIconComponent = agent.toolIcon;

          return (
            <div key={agent.role} className="relative group">
              <div
                className={`relative flex flex-col justify-between p-3.5 rounded-xl border transition-all duration-300 h-full ${
                  isActive
                    ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/30'
                    : isCompleted
                    ? 'border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20'
                    : isError
                    ? 'border-rose-400 bg-rose-50/50 dark:bg-rose-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 opacity-80'
                }`}
              >
                {/* Agent Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isActive
                          ? 'bg-blue-600 text-white animate-bounce'
                          : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                        Agent #{index + 1}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        {agent.name}
                      </h4>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div>
                    {isActive ? (
                      <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 inline-block" />
                    )}
                  </div>
                </div>

                {/* Purpose description */}
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-2.5 line-clamp-2">
                  {agent.description}
                </p>

                {/* Gemini Tool Badge */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="inline-flex items-center gap-1 font-medium text-slate-500 dark:text-slate-400">
                    <ToolIconComponent className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                    <span className="truncate max-w-[130px]">{agent.toolLabel}</span>
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : isCompleted
                        ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {isActive ? 'Active' : isCompleted ? 'Ready' : 'Idle'}
                  </span>
                </div>
              </div>

              {/* Handoff Arrow on larger screens */}
              {index < 3 && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 items-center justify-center text-slate-400 shadow-sm">
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Collapsible Live Agent Activity Log Feed */}
      {logsExpanded && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-mono">
              <Terminal className="w-3.5 h-3.5 text-blue-500" />
              Live Multi-Agent Event Stream:
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Autonomous handoffs & Gemini tool execution
            </span>
          </div>

          <div className="bg-slate-900 text-slate-200 rounded-xl p-3 font-mono text-xs max-h-48 overflow-y-auto space-y-2 border border-slate-800 shadow-inner">
            {activityLogs.length === 0 ? (
              <div className="text-slate-500 py-3 text-center italic">
                Awaiting study notes. Launch pipeline to see real-time agent handoffs and tool execution...
              </div>
            ) : (
              activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2.5 pb-1.5 border-b border-slate-800/80 last:border-0"
                >
                  <span className="text-slate-500 text-[10px] whitespace-nowrap">
                    [{log.timestamp}]
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        log.agent === 'reader'
                          ? 'bg-blue-900/80 text-blue-300 border border-blue-700/50'
                          : log.agent === 'quiz'
                          ? 'bg-amber-900/80 text-amber-300 border border-amber-700/50'
                          : log.agent === 'tutor'
                          ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700/50'
                          : 'bg-purple-900/80 text-purple-300 border border-purple-700/50'
                      }`}
                    >
                      {log.agentName}
                    </span>

                    {log.toolsUsed?.map((tool) => (
                      <span
                        key={tool}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-indigo-300 border border-indigo-900/60 flex items-center gap-1"
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        {tool}
                      </span>
                    ))}
                  </div>

                  <span className="text-slate-300 flex-1">{log.action}</span>

                  {log.handoffTo && (
                    <span className="text-cyan-400 text-[11px] font-semibold flex items-center gap-1">
                      ➔ Handoff to {log.handoffTo.toUpperCase()} AGENT
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
