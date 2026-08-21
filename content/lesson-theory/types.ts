export interface DeepTheorySection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
  formulas?: string[];
}

export interface TheoryTraceStep {
  state: string;
  explanation: string;
}

export interface TheoryWorkedExample {
  title: string;
  problem: string;
  steps: TheoryTraceStep[];
  conclusion: string;
  sanityChecks: string[];
}

export interface TheoryGlossaryItem {
  term: string;
  definition: string;
}

export interface TheorySource {
  id: TheorySourceId;
  title: string;
  authorsOrOwner: string;
  url: string;
  localPath?: string;
  license: string;
  note: string;
}

/** Nguồn sự thật runtime duy nhất cho ID nguồn; type union được suy ra từ đây. */
export const THEORY_SOURCE_IDS = [
  "ioai-2026",
  "d2l-vi",
  "d2l-en",
  "mml",
  "pml-intro",
  "pml-advanced",
  "vision-book",
  "nlp-principles",
  "nlp-representation",
  "speech-processing",
  "hubert-paper",
  "whisper-paper",
  "qwen-audio-official",
  "voxtral-official",
  "think-dsp",
] as const;

export type TheorySourceId = (typeof THEORY_SOURCE_IDS)[number];


export interface LessonDeepTheory {
  lessonId: string;
  readingMinutes: number;
  openingQuestions: string[];
  sections: DeepTheorySection[];
  workedExamples: TheoryWorkedExample[];
  implementationChecklist: string[];
  masteryChecklist: string[];
  glossary: TheoryGlossaryItem[];
  sourceIds: TheorySourceId[];
}

export type LessonTheoryMap = Record<string, LessonDeepTheory>;
