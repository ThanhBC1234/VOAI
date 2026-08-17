/**
 * Lớp Toán cho VOAI — *chỉ* phần thật sự cần để đi thi.
 *
 * Nguyên tắc cắt phạm vi: mỗi chủ đề trong tệp này phải trả lời được câu hỏi
 * “kiến thức này xuất hiện ở đâu trong đề thi hoặc trong bài code phải viết?”.
 * Trường `examUse` là bắt buộc và cổng kiểm tra ở `index.ts` sẽ từ chối chủ đề
 * bỏ trống nó. Đây là lý do lớp Toán này **không** có chứng minh định lý, không
 * có giải tích nhiều biến tổng quát và không có đại số trừu tượng: chúng không
 * đổi được một điểm nào trong kỳ thi.
 *
 * Ba trục còn lại bám sát cách một đề thi thật phân loại thí sinh:
 * - `level`: từ “bắt buộc thuộc” đến “câu phân loại”;
 * - `drills`: bài luyện có **đáp án số**, để tự chấm không cần người khác;
 * - `pitfalls`: bẫy đã quan sát được, viết bằng ngôn ngữ của lỗi chứ không phải
 *   của định nghĩa.
 *
 * Cảnh báo phạm vi: cấu trúc đề VOAI 2027 vẫn là TBD. Mọi phân bổ ở đây là
 * tham số luyện tập nội bộ của dự án.
 */

export const MATH_LEVELS = ["core", "applied", "advanced"] as const;
export type MathLevel = (typeof MATH_LEVELS)[number];

export interface MathLevelProfile {
  label: string;
  meaning: string;
}

export const MATH_LEVEL_PROFILES: Readonly<Record<MathLevel, MathLevelProfile>> = {
  core: {
    label: "Bắt buộc thuộc",
    meaning:
      "Không nhớ được là mất điểm ngay ở câu dễ. Phải viết lại được công thức trong 10 giây, không tra cứu.",
  },
  applied: {
    label: "Vận dụng",
    meaning:
      "Đề cho số liệu hoặc shape cụ thể rồi bắt tính. Phải tính tay đúng, không chỉ nhận ra tên công thức.",
  },
  advanced: {
    label: "Câu phân loại",
    meaning:
      "Ghép từ hai ý trở lên, hoặc yêu cầu chỉ ra chỗ hỏng trong một lập luận nghe có vẻ đúng.",
  },
};

/** Một công thức. `latex` chỉ chứa phần trong `$…$` của KaTeX. */
export interface MathFormula {
  latex: string;
  /** Đọc công thức bằng lời: từng ký hiệu là gì, đơn vị/shape ra sao. */
  reading: string;
}

/** Một ví dụ giải mẫu, bày đủ các bước tính tay. */
export interface MathWorkedExample {
  prompt: string;
  steps: readonly [string, string, ...string[]];
  answer: string;
}

/**
 * Bài luyện có đáp án **số**. Chỉ nhận đáp án số vì đó là dạng tự chấm được
 * mà không cần người chấm — và vì `tests/math-content.test.mjs` tính lại độc
 * lập từng đáp án, nên một con số sai sẽ làm đỏ CI thay vì đi thẳng vào bài học.
 */
export interface MathDrill {
  id: string;
  prompt: string;
  answer: number;
  /** Sai số tuyệt đối chấp nhận được; 0 khi đáp án là số nguyên đúng tuyệt đối. */
  tolerance: number;
  unit?: string;
  solution: readonly [string, ...string[]];
}

export interface MathTopic {
  id: string;
  title: string;
  level: MathLevel;
  /** Vì sao chủ đề này nằm trong phạm vi thi. Không được rỗng. */
  examUse: string;
  /** Ý cốt lõi, mỗi ý một câu, đọc là hiểu ngay. */
  keyIdeas: readonly [string, string, ...string[]];
  formulas: readonly [MathFormula, ...MathFormula[]];
  worked: MathWorkedExample;
  /** Bẫy viết theo lỗi thực tế, không phải theo định nghĩa. */
  pitfalls: readonly [string, ...string[]];
  drills: readonly [MathDrill, ...MathDrill[]];
  /** Chỗ kiến thức này xuất hiện lại trong phần AI của lộ trình. */
  appearsIn: readonly [string, ...string[]];
}

export interface MathModule {
  id: string;
  title: string;
  /** Một câu mô tả module dùng để làm gì trong kỳ thi. */
  purpose: string;
  /** Thứ phải nắm trước khi mở module này. */
  prerequisite: string;
  topics: readonly [MathTopic, ...MathTopic[]];
}

export function drillCountOf(module: MathModule): number {
  return module.topics.reduce((total, topic) => total + topic.drills.length, 0);
}
