export enum Mode {
  Dashboard = 'Dashboard',
  Paraphraser = 'Paraphraser',
  Summarizer = 'Summarizer',
  ContentWriter = 'Content Writer',
  GrammarChecker = 'Grammar Checker',
  AIHumanizer = 'AI Humanizer',
  Translate = 'Translate',
  AIDetector = 'AI Detector',
  PlagiarismChecker = 'Plagiarism Checker',
  Researcher = 'Researcher',
  EssayGrader = 'Essay Grader',
  PracticeQuestions = 'Practice Questions',
  FlashcardGenerator = 'Flashcard Generator',
  CitationGenerator = 'Citation Generator',
  AIChat = 'AI Chat',
  IllbotFlow = 'ILLBOT Flow',
}

export type ParaphraseMode = 'Simpler' | 'Balanced' | 'Formal' | 'Creative' | 'Expand' | 'Shorten';
export type SummarizerFormat = 'Paragraph' | 'Bullet Points';
export type AIHumanizerTone = 'Neutral' | 'Friendly' | 'Professional' | 'Confident';
export type CitationMode = 'Manual' | 'From URL';
export type CitationStyle = 'APA' | 'MLA' | 'Chicago';

export type GrammarCorrection = {
  original: string;
  corrected: string;
};

export type EssayGrade = {
  score: number;
  strengths: string;
  areasForImprovement: string;
  detailedFeedback: string;
};

export type Flashcard = {
  term: string;
  definition: string;
};

export type PracticeQuestion = {
  question: string;
  answer: string;
};

export type ContentWriterTone = 'Casual' | 'Professional' | 'Enthusiastic';
export type ContentWriterLength = 'Short' | 'Medium' | 'Long';

export type AnalyticsResult = {
  readability: string;
  tone: string;
  wordCount: number;
};

export type ResearchSource = {
  uri: string;
  title: string;
};

export type ResearchResult = {
  summary: string;
  sources: ResearchSource[];
};

export type ActivityLog = {
  action: string;
  mode: Mode;
  timestamp: Date;
};

export type AppStats = {
  wordsProcessed: number;
  tasksCompleted: number;
  toolsUsed: number;
};