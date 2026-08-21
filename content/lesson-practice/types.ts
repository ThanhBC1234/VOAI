export type PracticalInputFormat = "python" | "json" | "csv" | "text";
export type PracticalTone = "base" | "good" | "warn" | "accent";
export type PracticalScalar = string | number | boolean;

export interface PracticalInput {
  label: string;
  format: PracticalInputFormat;
  value: string;
}

export interface PracticalExplanationStep {
  title: string;
  text: string;
}

export interface PracticalSequenceItem {
  label: string;
  value?: string;
  detail?: string;
  tone?: PracticalTone;
}

export interface PracticalBarItem {
  label: string;
  value: number;
  display?: string;
  tone?: PracticalTone;
}

export interface PracticalPlotPoint {
  x: number;
  y: number;
  label?: string;
}

export interface PracticalPlotSeries {
  label: string;
  tone?: PracticalTone;
  points: PracticalPlotPoint[];
}

export type PracticalIllustration =
  | {
      kind: "sequence";
      layout: "pipeline" | "cards" | "timeline";
      title: string;
      caption: string;
      items: PracticalSequenceItem[];
    }
  | {
      kind: "bars";
      title: string;
      caption: string;
      min?: number;
      max?: number;
      items: PracticalBarItem[];
    }
  | {
      kind: "matrix";
      title: string;
      caption: string;
      rows: string[];
      columns: string[];
      values: number[][];
      displayValues?: string[][];
      scale?: "sequential" | "diverging";
    }
  | {
      kind: "plot";
      title: string;
      caption: string;
      xLabel: string;
      yLabel: string;
      connect?: boolean;
      series: PracticalPlotSeries[];
    }
  | {
      kind: "tokens";
      title: string;
      caption: string;
      items: Array<{ label: string; weight?: number; tone?: PracticalTone }>;
    };

export interface PracticalVariant {
  id: string;
  label: string;
  parameters: Record<string, PracticalScalar>;
  expectedOutput: string;
  observation: string;
  illustration: PracticalIllustration;
}

export interface LessonPractice {
  lessonId: string;
  scenario: {
    title: string;
    context: string;
    goal: string;
  };
  inputs: PracticalInput[];
  python: {
    title: string;
    filename: string;
    codeTemplate: string;
  };
  explanation: PracticalExplanationStep[];
  experiment: {
    question: string;
    parameterLabels: Record<string, string>;
    defaultVariantId: string;
    variants: PracticalVariant[];
  };
  transferQuestion: string;
}

export type LessonPracticeMap = Record<string, LessonPractice>;
