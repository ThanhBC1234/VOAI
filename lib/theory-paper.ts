import {
  DIFFICULTY_LEVELS,
  MOCK_PAPER_BLUEPRINT,
  MOCK_PAPER_QUESTION_COUNT,
  PAPER_SECTIONS,
  type PaperSection,
  type TheoryQuestion,
} from "../content/theory/types";

/** Seed của đề được lưu dưới dạng số nguyên 32-bit không dấu để dễ chia sẻ. */
export const MAX_PAPER_SEED = 0xffff_ffff;

export function normalisePaperSeed(value: number, fallback = 1): number {
  if (!Number.isFinite(value)) return normalisePaperSeed(fallback, 1);
  return Math.min(MAX_PAPER_SEED, Math.max(0, Math.trunc(value)));
}

/** Seed kế tiếp tạo một đề mới nhưng vẫn có thể nhập lại để tái tạo chính xác. */
export function nextPaperSeed(seed: number): number {
  return (normalisePaperSeed(seed) + 1) >>> 0;
}

/** Mulberry32 giống hệt bộ lắp đề phía server trong `content/theory/index.ts`. */
function createRandom(seed: number): () => number {
  let state = normalisePaperSeed(seed) >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function pickDeterministic<T>(pool: readonly T[], count: number, random: () => number): T[] {
  if (pool.length < count) {
    throw new Error(`Không đủ câu để lắp đề: cần ${count}, chỉ có ${pool.length}.`);
  }
  const remaining = [...pool];
  const chosen: T[] = [];
  for (let index = 0; index < count; index += 1) {
    const position = Math.floor(random() * remaining.length);
    chosen.push(remaining.splice(position, 1)[0]);
  }
  return chosen;
}

/**
 * Bản client-safe của bộ lắp đề: chỉ nhận ngân hàng và bảng phân khối đã được
 * server truyền xuống, không kéo toàn bộ `content/theory/index.ts` vào bundle.
 */
export function buildMockPaperQuestionIds(
  seed: number,
  questions: readonly TheoryQuestion[],
  sectionOf: Readonly<Record<string, PaperSection>>,
): string[] {
  const random = createRandom(seed);
  const result: string[] = [];

  for (const section of PAPER_SECTIONS) {
    for (const difficulty of DIFFICULTY_LEVELS) {
      const count = MOCK_PAPER_BLUEPRINT[section][difficulty];
      if (count === 0) continue;
      const pool = questions.filter(
        (question) =>
          sectionOf[question.id] === section && question.difficulty === difficulty,
      );
      result.push(...pickDeterministic(pool, count, random).map((question) => question.id));
    }
  }

  return result;
}
/**
 * Kiểm định snapshot đề trước khi khôi phục: đủ số câu, không trùng và đúng
 * chính xác số lượng của từng ô khối × độ khó trong blueprint.
 */
export function isValidMockPaperQuestionIds(
  questionIds: readonly string[],
  questions: readonly TheoryQuestion[],
  sectionOf: Readonly<Record<string, PaperSection>>,
): boolean {
  if (
    questionIds.length !== MOCK_PAPER_QUESTION_COUNT ||
    new Set(questionIds).size !== questionIds.length
  ) {
    return false;
  }

  const questionsById = new Map(questions.map((question) => [question.id, question]));
  const bucketCounts = new Map<string, number>();

  for (const id of questionIds) {
    const question = questionsById.get(id);
    if (!question) return false;

    const section = sectionOf[id] as PaperSection | undefined;
    if (!section || !PAPER_SECTIONS.includes(section)) return false;
    const key = `${section}\u0000${question.difficulty}`;
    bucketCounts.set(key, (bucketCounts.get(key) ?? 0) + 1);
  }

  for (const section of PAPER_SECTIONS) {
    for (const difficulty of DIFFICULTY_LEVELS) {
      const key = `${section}\u0000${difficulty}`;
      if ((bucketCounts.get(key) ?? 0) !== MOCK_PAPER_BLUEPRINT[section][difficulty]) {
        return false;
      }
    }
  }

  return true;
}