/**
 * Ngân hàng câu hỏi lý thuyết vòng 1 VOAI — điểm vào duy nhất.
 *
 * Tệp này gộp các section, chạy cổng kiểm tra dữ liệu lúc import (cùng phong
 * cách với `content/daily-assessments.ts`) và cung cấp bộ lắp đề mock tất định.
 *
 * Phạm vi cần hiểu đúng: số câu, tỷ trọng và thang điểm ở đây là **tham số
 * luyện tập nội bộ** của dự án, hiệu chỉnh theo các nguồn công khai ghi trong
 * `docs/LY_THUYET_VONG_1.md`. Thông số chính thức của VOAI 2027 vẫn là TBD cho
 * tới khi Ban Tổ chức công bố.
 */

import { IOAI_2026_SYLLABUS_COVERAGE } from "../curriculum";
import { sectionA1Questions } from "./section-a1-toolchain";
import { sectionA2Questions } from "./section-a2-supervised";
import { sectionA3Questions } from "./section-a3-unsupervised-eval";
import { sectionB1Questions } from "./section-b1-neural-basics";
import { sectionB2Questions } from "./section-b2-architectures";
import { sectionCQuestions } from "./section-c-vision";
import { sectionDQuestions } from "./section-d-nlp-audio";
import { sectionEQuestions } from "./section-e-foundations";
import {
  DIFFICULTY_LEVELS,
  FOUNDATION_SECTION,
  MOCK_DURATION_MINUTES,
  MOCK_PAPER_BLUEPRINT,
  MOCK_PAPER_QUESTION_COUNT,
  PAPER_SECTIONS,
  isFoundationTopic,
  pointsFor,
  timeBudgetFor,
  type PaperSection,
  type TheoryDifficulty,
  type TheoryQuestion,
} from "./types";

export * from "./types";

export const THEORY_BANK: readonly TheoryQuestion[] = [
  ...sectionEQuestions,
  ...sectionA1Questions,
  ...sectionA2Questions,
  ...sectionA3Questions,
  ...sectionB1Questions,
  ...sectionB2Questions,
  ...sectionCQuestions,
  ...sectionDQuestions,
];

/* ------------------------------------------------------------------ */
/* Ánh xạ câu hỏi → khối của đề                                        */
/* ------------------------------------------------------------------ */

const SYLLABUS_SECTION_BY_ID = new Map(
  IOAI_2026_SYLLABUS_COVERAGE.map((item) => [item.id, item.section]),
);

export function paperSectionOf(question: TheoryQuestion): PaperSection {
  if (isFoundationTopic(question.syllabusId)) return FOUNDATION_SECTION;
  const section = SYLLABUS_SECTION_BY_ID.get(question.syllabusId);
  if (!section) {
    throw new Error(`Câu ${question.id} tham chiếu syllabusId không hợp lệ: ${question.syllabusId}.`);
  }
  return section;
}

/* ------------------------------------------------------------------ */
/* Cổng kiểm tra dữ liệu                                               */
/* ------------------------------------------------------------------ */

export interface TheoryBankSummary {
  total: number;
  bySection: Readonly<Record<PaperSection, number>>;
  byDifficulty: Readonly<Record<TheoryDifficulty, number>>;
  byFormat: Readonly<Record<string, number>>;
  /** Số mục syllabus IOAI (trong 60 mục) đã có ít nhất một câu hỏi. */
  syllabusItemsCovered: number;
  syllabusItemsTotal: number;
  calibratedQuestions: number;
}

function requireText(value: string, label: string): void {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} phải là chuỗi không rỗng.`);
  }
}

export function validateTheoryBank(
  questions: readonly TheoryQuestion[] = THEORY_BANK,
): TheoryBankSummary {
  const seenIds = new Set<string>();
  const coveredSyllabusItems = new Set<string>();
  const bySection = Object.fromEntries(PAPER_SECTIONS.map((s) => [s, 0])) as Record<
    PaperSection,
    number
  >;
  const byDifficulty = Object.fromEntries(DIFFICULTY_LEVELS.map((d) => [d, 0])) as Record<
    TheoryDifficulty,
    number
  >;
  const byFormat: Record<string, number> = {};
  let calibratedQuestions = 0;

  for (const question of questions) {
    const label = `Câu ${question.id}`;
    requireText(question.id, `${label} id`);
    if (seenIds.has(question.id)) throw new Error(`Trùng id câu hỏi: ${question.id}.`);
    seenIds.add(question.id);

    requireText(question.stem, `${label} stem`);
    requireText(question.explanation, `${label} explanation`);

    // Ném lỗi nếu syllabusId không thuộc 60 mục IOAI lẫn danh mục nền tảng.
    const section = paperSectionOf(question);
    if (!isFoundationTopic(question.syllabusId)) coveredSyllabusItems.add(question.syllabusId);

    if (!DIFFICULTY_LEVELS.includes(question.difficulty)) {
      throw new Error(`${label} có mức độ không hợp lệ: ${question.difficulty}.`);
    }
    // Câu phân loại bắt buộc nêu rõ bẫy, nếu không nó chỉ là câu khó ngẫu nhiên.
    if (question.difficulty === "advanced") {
      requireText(question.trap ?? "", `${label} trap (bắt buộc với mức advanced)`);
    }

    switch (question.format) {
      case "single-choice": {
        if (question.choices.length !== 4) {
          throw new Error(`${label} phải có đúng 4 phương án.`);
        }
        if (question.choiceNotes.length !== question.choices.length) {
          throw new Error(`${label} phải có ghi chú cho từng phương án.`);
        }
        if (question.answerIndex < 0 || question.answerIndex >= question.choices.length) {
          throw new Error(`${label} có answerIndex ngoài phạm vi.`);
        }
        question.choices.forEach((choice, index) => requireText(choice, `${label} phương án ${index}`));
        break;
      }
      case "multi-select": {
        if (question.choices.length < 3) {
          throw new Error(`${label} multi-select cần ít nhất 3 phương án.`);
        }
        if (question.choiceNotes.length !== question.choices.length) {
          throw new Error(`${label} phải có ghi chú cho từng phương án.`);
        }
        if (question.answerIndexes.length < 2) {
          throw new Error(`${label} multi-select phải có ít nhất 2 đáp án đúng.`);
        }
        if (question.answerIndexes.length >= question.choices.length) {
          throw new Error(`${label} multi-select không được chọn tất cả phương án.`);
        }
        if (new Set(question.answerIndexes).size !== question.answerIndexes.length) {
          throw new Error(`${label} có answerIndexes trùng lặp.`);
        }
        for (const index of question.answerIndexes) {
          if (index < 0 || index >= question.choices.length) {
            throw new Error(`${label} có answerIndexes ngoài phạm vi.`);
          }
        }
        break;
      }
      case "true-false-set": {
        if (question.statements.length !== 4) {
          throw new Error(`${label} phải có đúng 4 ý đúng/sai.`);
        }
        // Bốn ý cùng đúng hoặc cùng sai làm câu hỏi mất khả năng phân loại.
        const trueCount = question.statements.filter((s) => s.answer).length;
        if (trueCount === 0 || trueCount === 4) {
          throw new Error(`${label} phải có cả ý đúng lẫn ý sai.`);
        }
        question.statements.forEach((statement, index) => {
          requireText(statement.text, `${label} ý ${index}`);
          requireText(statement.note, `${label} ghi chú ý ${index}`);
        });
        break;
      }
      case "numeric": {
        if (!Number.isFinite(question.answer)) {
          throw new Error(`${label} có đáp án số không hợp lệ.`);
        }
        if (!Number.isFinite(question.tolerance) || question.tolerance < 0) {
          throw new Error(`${label} có sai số chấp nhận không hợp lệ.`);
        }
        break;
      }
      case "short-text": {
        if (question.acceptedAnswers.length === 0) {
          throw new Error(`${label} phải có ít nhất một đáp án chấp nhận được.`);
        }
        question.acceptedAnswers.forEach((answer, index) =>
          requireText(answer, `${label} đáp án ${index}`),
        );
        break;
      }
      default: {
        const exhaustive: never = question;
        throw new Error(`Câu hỏi có format không hợp lệ: ${JSON.stringify(exhaustive)}`);
      }
    }

    bySection[section] += 1;
    byDifficulty[question.difficulty] += 1;
    byFormat[question.format] = (byFormat[question.format] ?? 0) + 1;
    if (question.calibratedFrom) calibratedQuestions += 1;
  }

  // Ngân hàng phải đủ câu cho từng ô của blueprint, nếu không đề mock không lắp được.
  for (const section of PAPER_SECTIONS) {
    for (const difficulty of DIFFICULTY_LEVELS) {
      const required = MOCK_PAPER_BLUEPRINT[section][difficulty];
      if (required === 0) continue;
      const available = questions.filter(
        (q) => paperSectionOf(q) === section && q.difficulty === difficulty,
      ).length;
      if (available < required) {
        throw new Error(
          `Không đủ câu cho ô [${section} / ${difficulty}]: cần ${required}, có ${available}.`,
        );
      }
    }
  }

  return {
    total: questions.length,
    bySection,
    byDifficulty,
    byFormat,
    syllabusItemsCovered: coveredSyllabusItems.size,
    syllabusItemsTotal: IOAI_2026_SYLLABUS_COVERAGE.length,
    calibratedQuestions,
  };
}

// Cổng lúc import: dữ liệu sai sẽ không âm thầm đi vào web hoặc vào đề mock.
export const THEORY_BANK_VALIDATION = validateTheoryBank();

/* ------------------------------------------------------------------ */
/* Lắp đề mock tất định                                                */
/* ------------------------------------------------------------------ */

/** PRNG tất định (mulberry32) để cùng một seed luôn cho cùng một đề. */
function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickDeterministic<T>(pool: readonly T[], count: number, random: () => number): T[] {
  const remaining = [...pool];
  const chosen: T[] = [];
  for (let index = 0; index < count; index += 1) {
    const position = Math.floor(random() * remaining.length);
    chosen.push(remaining.splice(position, 1)[0]);
  }
  return chosen;
}

export interface MockPaper {
  seed: number;
  durationMinutes: number;
  questions: readonly TheoryQuestion[];
  totalPoints: number;
  /** Tổng thời lượng khuyến nghị của các câu, dùng để kiểm tra đề có vừa giờ không. */
  budgetedSeconds: number;
}

/**
 * Lắp một đề mock theo `MOCK_PAPER_BLUEPRINT`. Cùng `seed` luôn cho cùng đề, nên
 * người học và người chấm đối chiếu được kết quả.
 */
export function buildMockPaper(seed = 1, bank: readonly TheoryQuestion[] = THEORY_BANK): MockPaper {
  const random = createRandom(seed);
  const questions: TheoryQuestion[] = [];

  for (const section of PAPER_SECTIONS) {
    for (const difficulty of DIFFICULTY_LEVELS) {
      const count = MOCK_PAPER_BLUEPRINT[section][difficulty];
      if (count === 0) continue;
      const pool = bank.filter(
        (q) => paperSectionOf(q) === section && q.difficulty === difficulty,
      );
      questions.push(...pickDeterministic(pool, count, random));
    }
  }

  return {
    seed,
    durationMinutes: MOCK_DURATION_MINUTES,
    questions,
    totalPoints: questions.reduce((sum, q) => sum + pointsFor(q), 0),
    budgetedSeconds: questions.reduce((sum, q) => sum + timeBudgetFor(q), 0),
  };
}

/** Đề mẫu dùng để kiểm chứng blueprint lắp được và vừa thời lượng. */
export const REFERENCE_MOCK_PAPER = buildMockPaper(1);

if (REFERENCE_MOCK_PAPER.questions.length !== MOCK_PAPER_QUESTION_COUNT) {
  throw new Error(
    `Đề mock lắp ra ${REFERENCE_MOCK_PAPER.questions.length} câu, khác blueprint ${MOCK_PAPER_QUESTION_COUNT}.`,
  );
}
if (REFERENCE_MOCK_PAPER.budgetedSeconds > MOCK_DURATION_MINUTES * 60) {
  throw new Error(
    `Ngân sách thời gian của đề mock (${REFERENCE_MOCK_PAPER.budgetedSeconds}s) vượt quá ${MOCK_DURATION_MINUTES} phút.`,
  );
}
