# StudyForge Agents

## THE PROBLEM
College students often have long lecture slides and notes but no quick way to test themselves, understand their mistakes, or plan revision before exams. Private tutoring is expensive, and generic study apps don't work from a student's own material.

## THE SOLUTION
StudyForge Agents is a multi-agent AI study assistant. A student uploads notes or slides (PDF, image or text), and four specialised Gemini agents work together to prepare them for the exam:

```
[ Lecture Notes / PDF Slides / Images ]
                  │
                  ▼
         1. READER AGENT
   (Extracts Topics, Formulas & Definitions)
                  │
                  ▼
          2. QUIZ AGENT
   (Generates MCQs + Python Code Execution)
                  │
                  ▼
          3. TUTOR AGENT
   (Real-world Analogies + Search Grounding)
                  │
                  ▼
         4. PLANNER AGENT
   (Day-by-Day Timetable to Exam Date)
```

1. **Reader Agent**: reads the material (including PDF slides and diagram images) and extracts key topics, formulas, variables, and definitions as structured data.
2. **Quiz Agent**: generates university-standard MCQs with answers and explanations, and verifies numerical questions using Gemini code execution (Python).
3. **Tutor Agent**: explains wrong answers simply with intuitive real-world analogies, and adds trusted references through Google Search grounding.
4. **Planner Agent**: analyzes student quiz results and exam date, finds weak topics, and builds a day-by-day revision plan up to the exam date, complete with curated external study resources.

A live **Agent Activity** panel shows which agent is working, the tools in action, and how the agents hand off to each other in real time.

## KEY FEATURES
- **"Try with sample notes"** demo presets (Machine Learning, Physics Thermodynamics, Cellular Biology) for instant 1-click testing
- **Multimodal file ingestion**: Upload PDF slides, textbook photos, whiteboard notes, or paste raw text
- **Customizable assessment**: Select difficulty (Foundation, Intermediate, Advanced, Exam Prep) and question count
- **Interactive Quiz Mode**: One-question-at-a-time quiz with progress bar, active timer, and instant feedback
- **Python Code Verification**: Automatic verification badges for numerical and calculation-based problems
- **Results Dashboard**: Topic-wise accuracy bar chart and automatic weak-topic detection
- **Personalized Revision Planner**: Adaptive day-by-day study timetable based on target exam date and hours available per day
- **Download as PDF**: Printable study sheet featuring all questions, correct answers, formulas, explanations, and revision schedule
- **Modern UI**: Clean blue and white palette, dark/light mode toggle, and mobile-friendly responsive design

## GOOGLE TOOLS USED
- **Google AI Studio (Build)**: Designed and generated the full-stack application
- **Gemini 3.8 Flash (`gemini-3.8-flash`)**: High-speed, high-reasoning model powering all four agents
- **System Instructions**: Dedicated pedagogical personas and constraint boundaries per agent
- **Structured JSON Output**: Schema-enforced outputs for deterministic inter-agent communication
- **Gemini Code Execution**: Python sandbox execution to guarantee accurate mathematical calculations
- **Google Search Grounding**: Live web search integration for verified academic citations (MIT OCW, Khan Academy, Wikipedia)
- **Multimodal Document Vision**: Direct processing of lecture slide photos and PDF documents via inline data

## IMPACT
It helps students study from their own material, understand mistakes immediately, and revise efficiently, making personalised exam preparation accessible to anyone for free.

## FUTURE SCOPE
Voice-based doubt solving, support for regional languages, progress tracking across subjects, and sharing quizzes with classmates.

## BUILT BY
Yeshika Malhotra, Electrical Engineering, NIT Hamirpur
