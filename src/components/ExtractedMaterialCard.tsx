import React, { useState } from 'react';
import { ExtractedStudyMaterial } from '../types';
import {
  FileText,
  Calculator,
  BookOpen,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Share2,
  Bookmark,
  Layers,
} from 'lucide-react';

interface ExtractedMaterialCardProps {
  material: ExtractedStudyMaterial;
  onProceedToQuiz?: () => void;
}

export const ExtractedMaterialCard: React.FC<ExtractedMaterialCardProps> = ({
  material,
  onProceedToQuiz,
}) => {
  const [activeTab, setActiveTab] = useState<'topics' | 'formulas' | 'definitions'>('topics');

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
              Reader Agent Output
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Structured JSON Synthesis
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {material.title || 'Course Study Material'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            {material.overview}
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start sm:self-center">
          <button
            onClick={() => setActiveTab('topics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'topics'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Topics ({material.topics?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('formulas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'formulas'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Formulas ({material.formulas?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('definitions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'definitions'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Definitions ({material.definitions?.length || 0})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Topics */}
      {activeTab === 'topics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {material.topics?.map((topic, i) => (
            <div
              key={topic.id || i}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850/50 border border-slate-200/80 dark:border-slate-800"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[11px] font-bold text-slate-400">
                  TOPIC #{i + 1}
                </span>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    topic.importance === 'High'
                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                      : topic.importance === 'Medium'
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {topic.importance} Yield
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">
                {topic.name}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                {topic.summary}
              </p>
              {topic.subpoints && topic.subpoints.length > 0 && (
                <ul className="space-y-1 pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
                  {topic.subpoints.map((pt, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5"
                    >
                      <span className="text-blue-500 font-bold">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Formulas & Calculations */}
      {activeTab === 'formulas' && (
        <div className="space-y-3.5">
          {material.formulas && material.formulas.length > 0 ? (
            material.formulas.map((form, i) => (
              <div
                key={form.id || i}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850/50 border border-slate-200/80 dark:border-slate-800"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-amber-500" />
                    {form.name}
                  </h4>
                  <div className="px-3 py-1.5 rounded-lg bg-slate-900 text-cyan-400 font-mono text-xs sm:text-sm font-bold shadow-inner">
                    {form.formula}
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                  {form.description}
                </p>

                {form.variables && form.variables.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-xs mb-2.5">
                    {form.variables.map((v, idx) => (
                      <div key={idx} className="flex items-baseline gap-1.5">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                          {v.symbol}:
                        </span>
                        <span className="text-slate-600 dark:text-slate-300">
                          {v.explanation}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {form.sampleCalculation && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono bg-blue-50/60 dark:bg-blue-950/40 p-2 rounded-lg border border-blue-200/50 dark:border-blue-900/40">
                    <span className="font-bold text-blue-700 dark:text-blue-300">Sample Application: </span>
                    {form.sampleCalculation}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              No mathematical formulas found in this set of notes. The Quiz Agent will focus on conceptual logic.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Key Definitions */}
      {activeTab === 'definitions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {material.definitions && material.definitions.length > 0 ? (
            material.definitions.map((def, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850/50 border border-slate-200/80 dark:border-slate-800"
              >
                <h4 className="font-bold text-sm text-blue-600 dark:text-blue-400 mb-1">
                  {def.term}
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 mb-2 leading-relaxed">
                  {def.definition}
                </p>
                {def.context && (
                  <span className="inline-block text-[11px] text-slate-500 dark:text-slate-400 italic">
                    Context: {def.context}
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              No isolated definitions extracted.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
