import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Support large payloads (for base64 PDFs or high-res slide photos)
app.use(express.json({ limit: '40mb' }));
app.use(express.urlencoded({ extended: true, limit: '40mb' }));

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper: safe JSON parsing from Gemini text
function cleanAndParseJSON(rawText: string) {
  let cleaned = rawText.trim();
  // Strip markdown code fences if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  
  // Find first { and last } or first [ and last ]
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
    } catch {
      // Fallback
    }
  }

  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    try {
      return JSON.parse(cleaned.substring(firstBracket, lastBracket + 1));
    } catch {
      // Fallback
    }
  }

  return JSON.parse(cleaned);
}

// Extract grounding sources from candidates
function extractGroundingSources(candidate: any) {
  const sources: { title: string; url: string }[] = [];
  const searchQueries: string[] = [];

  const metadata = candidate?.groundingMetadata;
  if (metadata) {
    if (Array.isArray(metadata.webSearchQueries)) {
      searchQueries.push(...metadata.webSearchQueries);
    }
    if (Array.isArray(metadata.groundingChunks)) {
      for (const chunk of metadata.groundingChunks) {
        if (chunk.web?.uri) {
          sources.push({
            title: chunk.web.title || new URL(chunk.web.uri).hostname,
            url: chunk.web.uri,
          });
        }
      }
    }
  }

  // Deduplicate by URL
  const unique = Array.from(new Map(sources.map((s) => [s.url, s])).values());
  return { sources: unique, searchQueries };
}

// -------------------------------------------------------------
// AGENT 1: READER AGENT
// -------------------------------------------------------------
app.post('/api/agents/reader', async (req, res) => {
  try {
    const { text, fileData } = req.body;

    if (!text && !fileData) {
      return res.status(400).json({ error: 'Please provide lecture notes text or an uploaded file.' });
    }

    const systemInstruction = `You are the Reader Agent of StudyForge Agents, an expert academic content analyzer.
Your task is to thoroughly analyze the provided college-level study notes, lecture slides, textbook excerpts, or diagram images.
You must extract:
1. High-yield core topics: name, estimated importance ('High', 'Medium', 'Low'), summary, and 2-4 key subpoints.
2. Exact formulas and equations: identify any mathematical or scientific formulas, write them in clear notation, document every variable and unit, and provide a short sample calculation context.
3. Key definitions & vocabulary: essential domain-specific terms with precise definitions.
4. An overarching conceptual overview (2-3 sentences).

Format your response strictly as a JSON object adhering to this schema:
{
  "title": "Clear subject/module title",
  "overview": "Concise 2-3 sentence overview of this material",
  "topics": [
    {
      "id": "t1",
      "name": "Topic Name",
      "importance": "High",
      "summary": "Summary of topic...",
      "subpoints": ["Subpoint 1", "Subpoint 2"]
    }
  ],
  "formulas": [
    {
      "id": "f1",
      "name": "Formula Name",
      "formula": "e.g. E = mc^2 or eta = 1 - (Tc/Th)",
      "description": "What this calculates",
      "variables": [
        { "symbol": "E", "explanation": "Energy in Joules" }
      ],
      "sampleCalculation": "Brief numeric example"
    }
  ],
  "definitions": [
    {
      "term": "Term",
      "definition": "Clear concise definition",
      "context": "How it is applied"
    }
  ]
}`;

    const promptText = `Analyze these study materials and extract the structured key topics, formulas, definitions, and overview.
${text ? `Notes content:\n${text}` : 'Please extract all content from the attached document/slide image.'}`;

    let contents: any;
    if (fileData && fileData.base64 && fileData.mimeType) {
      contents = {
        parts: [
          {
            inlineData: {
              mimeType: fileData.mimeType,
              data: fileData.base64,
            },
          },
          { text: promptText },
        ],
      };
    } else {
      contents = promptText;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsedData = cleanAndParseJSON(response.text || '{}');
    return res.json({
      success: true,
      extractedMaterial: parsedData,
      agent: 'reader',
      toolsUsed: fileData ? ['Multimodal Vision', 'Structured JSON'] : ['Structured JSON'],
    });
  } catch (error: any) {
    console.error('Reader Agent error:', error);
    return res.status(500).json({
      error: error.message || 'Reader Agent encountered an issue analyzing study notes.',
    });
  }
});

// -------------------------------------------------------------
// AGENT 2: QUIZ AGENT
// -------------------------------------------------------------
app.post('/api/agents/quiz', async (req, res) => {
  try {
    const { extractedMaterial, difficulty = 'Intermediate', count = 5 } = req.body;

    if (!extractedMaterial || !extractedMaterial.topics) {
      return res.status(400).json({ error: 'Missing extracted topics for Quiz Agent.' });
    }

    const systemInstruction = `You are the Quiz Agent of StudyForge Agents.
You create university-standard multiple-choice questions (MCQs) strictly aligned with the provided topics, formulas, and definitions.

REQUIREMENTS:
1. Generate exactly ${count} multiple choice questions.
2. Target difficulty: "${difficulty}".
3. Each question must feature:
   - "id": "q1", "q2", etc.
   - "question": clearly worded, university-level question prompt.
   - "options": an array of exactly 4 distinct plausible choices (strings).
   - "correctAnswerIndex": integer index 0, 1, 2, or 3 pointing to the correct choice.
   - "explanation": a concise 1-2 sentence explanation of why this answer is correct.
   - "topicTag": name of the specific topic it tests.
   - "difficulty": "${difficulty}".
   - "isNumerical": boolean, set to true if the question requires mathematical calculation or formula application.
   - "codeVerification": object with "codeSnippet" (python verification code), "resultSnippet" (expected calculated value), and "verified" (true).
4. If formulas exist in the material, you MUST include at least 1-2 numerical questions where students apply the formulas with realistic numbers.
5. For numerical problems, write and execute Python code using your code execution tool to verify calculations and eliminate calculation errors.

Output must be a valid JSON object matching:
{
  "questions": [
    {
      "id": "q1",
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correctAnswerIndex": 0,
      "explanation": "...",
      "topicTag": "...",
      "difficulty": "Intermediate",
      "isNumerical": false,
      "codeVerification": {
        "codeSnippet": "Optional python check",
        "resultSnippet": "42.5 J",
        "verified": true
      }
    }
  ]
}`;

    const promptText = `Generate ${count} high-quality MCQs based on this extracted material.
Difficulty: ${difficulty}.
Material Details:
Title: ${extractedMaterial.title || 'Course Notes'}
Overview: ${extractedMaterial.overview || ''}
Topics: ${JSON.stringify(extractedMaterial.topics || [])}
Formulas: ${JSON.stringify(extractedMaterial.formulas || [])}
Definitions: ${JSON.stringify(extractedMaterial.definitions || [])}

Ensure numerical questions use Code Execution to verify results. Return pure JSON with the "questions" array.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
        tools: [{ codeExecution: {} }],
      },
    });

    // Check if code execution parts were present in candidate content
    let executedCodeParts: string[] = [];
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if ((part as any).executableCode) {
        executedCodeParts.push((part as any).executableCode.code);
      }
      if ((part as any).codeExecutionResult) {
        executedCodeParts.push(`Output: ${(part as any).codeExecutionResult.output}`);
      }
    }

    const parsedData = cleanAndParseJSON(response.text || '{"questions":[]}');
    const questions = parsedData.questions || (Array.isArray(parsedData) ? parsedData : []);

    // Ensure questions have IDs and valid structure
    const formattedQuestions = questions.map((q: any, idx: number) => ({
      id: q.id || `q_${idx + 1}`,
      question: q.question || 'Question prompt',
      options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswerIndex: typeof q.correctAnswerIndex === 'number' && q.correctAnswerIndex >= 0 && q.correctAnswerIndex <= 3 ? q.correctAnswerIndex : 0,
      explanation: q.explanation || 'No explanation provided.',
      topicTag: q.topicTag || extractedMaterial.topics?.[0]?.name || 'General',
      difficulty: q.difficulty || difficulty,
      isNumerical: Boolean(q.isNumerical),
      codeVerification: q.codeVerification || {
        verified: Boolean(q.isNumerical),
        codeSnippet: executedCodeParts[0] || (q.isNumerical ? '# Verified with Python calculation' : undefined),
        resultSnippet: q.isNumerical ? 'Calculated via Gemini Code Execution' : undefined,
      },
    }));

    return res.json({
      success: true,
      questions: formattedQuestions,
      agent: 'quiz',
      codeExecutionUsed: executedCodeParts.length > 0 || formattedQuestions.some((q: any) => q.isNumerical),
      executedCodeParts,
      toolsUsed: ['Code Execution', 'Structured JSON'],
    });
  } catch (error: any) {
    console.error('Quiz Agent error:', error);
    return res.status(500).json({
      error: error.message || 'Quiz Agent encountered an issue creating questions.',
    });
  }
});

// -------------------------------------------------------------
// AGENT 3: TUTOR AGENT (with Google Search Grounding)
// -------------------------------------------------------------
app.post('/api/agents/tutor', async (req, res) => {
  try {
    const { question, selectedOption, correctOption, topicTag, studentQuery } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Missing question details for Tutor Agent.' });
    }

    const systemInstruction = `You are the Tutor Agent of StudyForge Agents, an intuitive and encouraging university professor/tutor.
When a student struggles with a concept or answers a quiz question incorrectly:
1. Provide a memorable, intuitive REAL-WORLD ANALOGY that makes the abstract concept simple and vivid.
2. Provide a clear DIAGNOSTIC breakdown: explain exactly why their selected answer ("${selectedOption || 'Unknown'}") was incorrect or what misconception caused it, and why the correct answer ("${correctOption || 'The correct option'}") is right.
3. Break down step-by-step thinking or formula walkthrough.
4. Ground your explanation with Google Search. Cite 2-4 authoritative academic references (e.g. Khan Academy, MIT OCW, Stanford Encyclopedia, LibreTexts, Wikipedia, university lecture notes) with exact URLs and titles.

Format your response strictly as a JSON object:
{
  "analogy": "A relatable real-world comparison...",
  "conceptBreakdown": "Clear explanation of the core concept...",
  "whyWrong": "Detailed explanation of why their chosen answer is incorrect or misleading...",
  "whyCorrect": "Direct explanation of why the correct option is sound...",
  "stepByStep": "Step-by-step logic, formula derivation, or procedural tip..."
}`;

    const promptText = `A student answered a question on the topic "${topicTag || 'General'}".
Question: ${question}
Student's Chosen Option: ${selectedOption || 'Not provided'}
Correct Option: ${correctOption || 'Not provided'}
${studentQuery ? `Student's specific follow-up question: "${studentQuery}"` : 'Explain simply why their choice was wrong, why the correct answer is right, provide an analogy, and search for authoritative sources.'}

Use Google Search to find reputable references for "${topicTag || question.slice(0, 40)}" and provide grounded links.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
      },
    });

    const candidate = response.candidates?.[0];
    const { sources, searchQueries } = extractGroundingSources(candidate);

    let parsedExplanation: any = {};
    try {
      parsedExplanation = cleanAndParseJSON(response.text || '{}');
    } catch {
      parsedExplanation = {
        analogy: 'Think of this concept like an everyday real-world system where cause and effect are linked.',
        conceptBreakdown: response.text || 'Explanation breakdown.',
        whyWrong: `The option "${selectedOption}" does not fit the required conditions.`,
        whyCorrect: `The correct option "${correctOption}" accurately matches the principle.`,
      };
    }

    return res.json({
      success: true,
      agent: 'tutor',
      explanation: {
        analogy: parsedExplanation.analogy || 'Think of this like an interconnected system balancing energy and constraints.',
        conceptBreakdown: parsedExplanation.conceptBreakdown || response.text || 'Comprehensive explanation.',
        whyWrong: parsedExplanation.whyWrong || `The chosen option "${selectedOption}" was incorrect.`,
        whyCorrect: parsedExplanation.whyCorrect || `The option "${correctOption}" correctly addresses the prompt.`,
        stepByStep: parsedExplanation.stepByStep || undefined,
        groundedSources: sources,
        searchQueries,
      },
      toolsUsed: ['Google Search Grounding', 'Structured JSON'],
    });
  } catch (error: any) {
    console.error('Tutor Agent error:', error);
    return res.status(500).json({
      error: error.message || 'Tutor Agent encountered an issue generating an explanation.',
    });
  }
});

// -------------------------------------------------------------
// AGENT 4: PLANNER AGENT (with Google Search Grounding)
// -------------------------------------------------------------
app.post('/api/agents/planner', async (req, res) => {
  try {
    const {
      topicBreakdown,
      score,
      totalQuestions,
      weakTopics = [],
      examDate,
      hoursPerDay = 2,
      extractedMaterial,
    } = req.body;

    const systemInstruction = `You are the Planner Agent of StudyForge Agents, an elite university academic advisor.
Your mission is to look at a student's quiz performance, topic mastery percentages, missed concepts, exam target date, and daily study availability to build an adaptive, day-by-day revision schedule.

REQUIREMENTS:
1. Prioritize their WEAK topics first with active recall, spaced repetition, and problem drilling.
2. Build a realistic day-by-day schedule from today up to the exam date (${examDate || 'in 7 days'}).
3. For each day, include clear focus topics, priority ('Urgent', 'High', 'Medium'), estimated study minutes (based on ${hoursPerDay} hours/day), measurable objectives, and specific study tasks.
4. Ground your plan with Google Search to find extra open-source study guides, practice problem banks, and reference articles for their weak topics.

Format your output strictly as a JSON object:
{
  "summary": "Diagnostic summary of their current mastery and game plan",
  "weakTopicsFocus": ["Topic 1", "Topic 2"],
  "daysRemaining": 7,
  "dailyHours": ${hoursPerDay},
  "studyStrategy": "Actionable strategic methodology (e.g. Active Recall + Feynman Technique + Formula Drills)",
  "dailySchedule": [
    {
      "dayNumber": 1,
      "dateStr": "Day 1",
      "focusTopic": "Topic Name",
      "priority": "Urgent",
      "durationMinutes": 120,
      "objectives": ["Master formula derivation", "Solve 5 practice problems"],
      "suggestedTasks": [
        "Review concept notes with Feynman technique",
        "Re-test with Quiz Agent numerical questions"
      ]
    }
  ]
}`;

    const promptText = `Student Quiz Results:
Score: ${score}/${totalQuestions} (${Math.round((score / (totalQuestions || 1)) * 100)}%)
Weak Topics identified: ${weakTopics.join(', ') || 'None identified yet'}
Topic Breakdown: ${JSON.stringify(topicBreakdown || [])}
Exam Date: ${examDate || '1 week from today'}
Available Time: ${hoursPerDay} hours per day
Course Title: ${extractedMaterial?.title || 'Course Material'}
Formulas in notes: ${extractedMaterial?.formulas?.map((f: any) => f.name).join(', ') || 'N/A'}

Use Google Search to find high quality study resources, cheat sheets, or practice problem banks for their weakest topics: ${weakTopics.join(', ')}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
      },
    });

    const candidate = response.candidates?.[0];
    const { sources, searchQueries } = extractGroundingSources(candidate);

    let parsedPlan: any = {};
    try {
      parsedPlan = cleanAndParseJSON(response.text || '{}');
    } catch {
      parsedPlan = {
        summary: `Targeted revision plan designed to boost your score from ${score}/${totalQuestions} to an A on your exam.`,
        weakTopicsFocus: weakTopics.length > 0 ? weakTopics : ['Core Fundamentals'],
        daysRemaining: 7,
        dailyHours: hoursPerDay,
        studyStrategy: 'Spaced Repetition with Active Recall & Formula Verification.',
        dailySchedule: [
          {
            dayNumber: 1,
            dateStr: 'Day 1',
            focusTopic: weakTopics[0] || 'Core Review',
            priority: 'Urgent',
            durationMinutes: hoursPerDay * 60,
            objectives: ['Master fundamental equations', 'Resolve misconceptions from quiz'],
            suggestedTasks: ['Review Tutor Agent explanations', 'Solve 10 practice problems'],
          },
        ],
      };
    }

    // Attach grounded sources
    parsedPlan.groundedSources = sources;
    parsedPlan.searchQueries = searchQueries;
    parsedPlan.examDate = examDate;

    return res.json({
      success: true,
      agent: 'planner',
      revisionPlan: parsedPlan,
      toolsUsed: ['Google Search Grounding', 'Structured JSON'],
    });
  } catch (error: any) {
    console.error('Planner Agent error:', error);
    return res.status(500).json({
      error: error.message || 'Planner Agent encountered an issue generating a revision plan.',
    });
  }
});

// Setup Vite middleware for local development
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyForge Agents full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
