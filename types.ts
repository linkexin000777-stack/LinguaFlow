export enum AppStep {
  SELECTION = 'SELECTION',
  BLIND_LISTENING = 'BLIND_LISTENING',
  DICTATION = 'DICTATION',
  REVIEW = 'REVIEW',
  SHADOWING = 'SHADOWING',
  SUMMARY = 'SUMMARY'
}

export interface Material {
  id: string;
  title: string;
  category: string; // News, Textbook, Speech
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  content: string; // The full text
  source?: string;
}

export interface Sentence {
  id: number;
  text: string;
  userDraft?: string;
  isComplete: boolean;
}

export interface WordAnalysis {
  word: string;
  definition: string;
  partOfSpeech: string;
  example: string;
}

export interface GrammarAnalysis {
  sentence: string;
  explanation: string;
}

export interface UserProgress {
  materialId: string | null;
  sentences: Sentence[];
  recordedAudioBlobs: Blob[];
  totalScore: number;
}