import React, { useState, useRef } from 'react';
import { SAMPLE_NOTES, SampleNotePreset } from '../data/sampleNotes';
import {
  Upload,
  FileText,
  FileCheck,
  Sparkles,
  Zap,
  Sliders,
  Check,
  AlertCircle,
  FileUp,
  Image as ImageIcon,
  BookOpen,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

interface InputSectionProps {
  onStartPipeline: (payload: {
    notesText: string;
    fileData?: { mimeType: string; base64: string; fileName: string };
    difficulty: 'Foundation' | 'Intermediate' | 'Advanced' | 'Exam Prep';
    questionCount: number;
  }) => void;
  isLoading: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({
  onStartPipeline,
  isLoading,
}) => {
  const [tab, setTab] = useState<'sample' | 'paste' | 'upload'>('sample');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('ml_neural_nets');
  const [customText, setCustomText] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<{
    file: File;
    base64: string;
    mimeType: string;
    previewUrl?: string;
  } | null>(null);

  const [difficulty, setDifficulty] = useState<
    'Foundation' | 'Intermediate' | 'Advanced' | 'Exam Prep'
  >('Intermediate');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [validationError, setValidationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/webp',
      'text/plain',
      'text/markdown',
    ];

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
      setValidationError('Please upload a PDF document, slide image (PNG/JPG/WEBP), or text notes file.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setValidationError('File size must be under 20MB for processing.');
      return;
    }

    const reader = new FileReader();

    if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCustomText(text);
        setTab('paste');
      };
      reader.readAsText(file);
    } else {
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const base64 = result.split(',')[1];
        setUploadedFile({
          file,
          base64,
          mimeType: file.type || 'application/pdf',
          previewUrl: file.type.startsWith('image/') ? result : undefined,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLaunch = () => {
    setValidationError(null);

    let finalNotes = '';
    let finalFileData: { mimeType: string; base64: string; fileName: string } | undefined = undefined;

    if (tab === 'sample') {
      const preset = SAMPLE_NOTES.find((p) => p.id === selectedPresetId);
      if (!preset) {
        setValidationError('Please select a sample preset.');
        return;
      }
      finalNotes = preset.content;
    } else if (tab === 'paste') {
      if (!customText.trim()) {
        setValidationError('Please paste your study notes, syllabus or lecture summary.');
        return;
      }
      finalNotes = customText.trim();
    } else if (tab === 'upload') {
      if (!uploadedFile) {
        setValidationError('Please select or drag-and-drop a PDF or slide photo.');
        return;
      }
      finalFileData = {
        mimeType: uploadedFile.mimeType,
        base64: uploadedFile.base64,
        fileName: uploadedFile.file.name,
      };
    }

    onStartPipeline({
      notesText: finalNotes,
      fileData: finalFileData,
      difficulty,
      questionCount,
    });
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
      {/* Title & Tagline */}
      <div className="max-w-3xl mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          Multi-Agent Academic Engine
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Transform Your Notes into an Interactive Exam Tutor
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          The Reader Agent analyzes concepts and formulas, the Quiz Agent tests you with Python-verified problems, the Tutor Agent explains mistakes using Google Search grounding, and the Planner Agent maps your revision timetable.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-850 rounded-2xl mb-6 max-w-xl">
        <button
          onClick={() => {
            setTab('sample');
            setValidationError(null);
          }}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            tab === 'sample'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Demo Presets</span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-extrabold">
            Instant
          </span>
        </button>

        <button
          onClick={() => {
            setTab('paste');
            setValidationError(null);
          }}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            tab === 'paste'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Paste Notes</span>
        </button>

        <button
          onClick={() => {
            setTab('upload');
            setValidationError(null);
          }}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            tab === 'upload'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileUp className="w-4 h-4" />
          <span>Upload PDF/Slides</span>
        </button>
      </div>

      {/* Tab 1: Sample Notes Presets (Instant Demo) */}
      {tab === 'sample' && (
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {SAMPLE_NOTES.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => setSelectedPresetId(preset.id)}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 relative ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/30 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-850/40 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {preset.badge}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                    {preset.title}
                  </h4>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-2">
                    {preset.course}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {preset.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Selected sample preview preview snippet */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span>
                Loaded notes include formulas for calculations, definitions, and high-yield concepts.
              </span>
            </span>
            <span className="font-mono text-slate-400 text-[11px]">
              Ready for Reader Agent
            </span>
          </div>
        </div>
      )}

      {/* Tab 2: Paste Custom Notes */}
      {tab === 'paste' && (
        <div className="space-y-3 mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Paste Lecture Notes, Summary or Textbook Section
          </label>
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            rows={8}
            placeholder="Paste your course notes, slides transcription, or study guide here... e.g., formulas, mechanisms, key theorems..."
            className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/60 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-mono transition-all"
          />
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Tip: Include equations or key terms so the Quiz Agent can formulate numerical and conceptual problems.</span>
            <span>{customText.length} characters</span>
          </div>
        </div>
      )}

      {/* Tab 3: Upload PDF / Slide Image */}
      {tab === 'upload' && (
        <div className="space-y-4 mb-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md"
            className="hidden"
          />

          {!uploadedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl p-8 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-850/30 transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                Drop your lecture slide PDF or photo here, or browse files
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Supports PDF slides, textbook photos (PNG/JPG), and handwritten whiteboard snaps (up to 20MB)
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                <Sparkles className="w-3 h-3" />
                Gemini Multimodal Vision will extract formulas and diagrams directly
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {uploadedFile.previewUrl ? (
                  <img
                    src={uploadedFile.previewUrl}
                    alt="Upload Preview"
                    className="w-14 h-14 object-cover rounded-xl border border-blue-200 dark:border-blue-800"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    <FileCheck className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {uploadedFile.file.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {(uploadedFile.file.size / (1024 * 1024)).toFixed(2)} MB • {uploadedFile.mimeType}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setUploadedFile(null)}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                Change File
              </button>
            </div>
          )}
        </div>
      )}

      {/* Configuration Controls: Difficulty & Question Count */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/40 border border-slate-200 dark:border-slate-800 mb-6">
        {/* Difficulty */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-blue-500" />
            Target Quiz Rigor / Difficulty
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {(['Foundation', 'Intermediate', 'Advanced', 'Exam Prep'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setDifficulty(lvl)}
                className={`py-2 px-2 text-xs font-bold rounded-xl transition-all ${
                  difficulty === lvl
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Question Count */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Number of Questions
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[3, 5, 10].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setQuestionCount(num)}
                className={`py-2 px-3 text-xs font-bold rounded-xl transition-all ${
                  questionCount === num
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {num} Questions
                {num === 5 && (
                  <span className="block text-[10px] opacity-80">Recommended</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Big Action Button */}
      <button
        onClick={handleLaunch}
        disabled={isLoading}
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:via-indigo-700 hover:to-cyan-700 text-white font-extrabold text-base shadow-lg shadow-blue-500/25 flex items-center justify-center gap-3 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isLoading ? (
          <>
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Agents Cooperating in Pipeline...</span>
          </>
        ) : (
          <>
            <span>Launch Multi-Agent Pipeline</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </div>
  );
};
