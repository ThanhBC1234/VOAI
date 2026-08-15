/**
 * Lớp lý thuyết cho vòng 1 VOAI (sơ loại trắc nghiệm trên máy).
 *
 * Tệp này chỉ định nghĩa *hình dạng* dữ liệu và các hằng số phân loại. Nội dung
 * câu hỏi nằm trong `section-*.ts`; phần lắp ráp đề và cổng kiểm tra dữ liệu nằm
 * trong `index.ts`.
 *
 * Ba trục phân loại được giữ tách bạch, vì một đề thi thật phân loại thí sinh
 * bằng cả ba chứ không chỉ bằng chủ đề:
 * - `syllabusId`: mục nào trong 60 mục Syllabus IOAI 2026 (nguồn:
 *   `IOAI_2026_SYLLABUS_COVERAGE` trong `content/curriculum.ts`);
 * - `difficulty`: bốn mức từ Nhận biết đến Vận dụng cao;
 * - `format`: dạng thao tác trên máy, quyết định cách chấm.
 *
 * Cảnh báo phạm vi: format, số câu, thang điểm và ngưỡng của VOAI 2027 vẫn là
 * TBD cho tới khi Ban Tổ chức công bố. Mọi con số trong lớp này là tham số
 * luyện tập nội bộ, không phải mô tả quy chế chính thức.
 */

export type TheorySection =
  | "Foundational Skills & Classical ML"
  | "Neural Networks & Deep Learning"
  | "Computer Vision"
  | "NLP & Audio";

export const THEORY_SECTIONS: readonly TheorySection[] = [
  "Foundational Skills & Classical ML",
  "Neural Networks & Deep Learning",
  "Computer Vision",
  "NLP & Audio",
];

/* ------------------------------------------------------------------ */
/* Trục 1 — mức độ                                                     */
/* ------------------------------------------------------------------ */

export const DIFFICULTY_LEVELS = ["recall", "understand", "apply", "advanced"] as const;
export type TheoryDifficulty = (typeof DIFFICULTY_LEVELS)[number];

export interface DifficultyProfile {
  label: string;
  /** Dấu hiệu nhận ra một câu thuộc mức này khi đọc đề. */
  signature: string;
  /** Việc người học phải làm được để trả lời đúng mà không đoán. */
  demand: string;
  points: number;
  timeBudgetSeconds: number;
}

export const DIFFICULTY_PROFILES: Readonly<Record<TheoryDifficulty, DifficultyProfile>> = {
  recall: {
    label: "Nhận biết",
    signature: "Hỏi định nghĩa, tên gọi, công thức hoặc phát biểu chuẩn đã học nguyên dạng.",
    demand: "Nhớ đúng và không nhầm với khái niệm lân cận.",
    points: 2,
    timeBudgetSeconds: 45,
  },
  understand: {
    label: "Thông hiểu",
    signature: "Hỏi vì sao, so sánh hai phương pháp, hoặc dự đoán hướng thay đổi khi đổi một tham số.",
    demand: "Giải thích được cơ chế bằng lời của mình, không chỉ nhắc lại công thức.",
    points: 3,
    timeBudgetSeconds: 75,
  },
  apply: {
    label: "Vận dụng",
    signature: "Cho số liệu, shape, ma trận nhỏ hoặc một tình huống dữ liệu cụ thể rồi yêu cầu ra kết quả.",
    demand: "Tính tay đúng hoặc suy luận đúng trên dữ liệu chưa từng thấy.",
    points: 4,
    timeBudgetSeconds: 120,
  },
  advanced: {
    label: "Vận dụng cao — câu phân loại",
    signature:
      "Ghép từ hai kiến thức trở lên, có bẫy hợp lý, hoặc yêu cầu chỉ ra chỗ hỏng trong một quy trình nghe có vẻ đúng.",
    demand: "Nhận ra giả định bị vi phạm và loại được phương án 'gần đúng' hấp dẫn nhất.",
    points: 6,
    timeBudgetSeconds: 180,
  },
};

/* ------------------------------------------------------------------ */
/* Trục 2 — dạng câu                                                   */
/* ------------------------------------------------------------------ */

export const THEORY_FORMATS = [
  "single-choice",
  "multi-select",
  "true-false-set",
  "numeric",
  "short-text",
] as const;
export type TheoryFormat = (typeof THEORY_FORMATS)[number];

export const FORMAT_LABELS: Readonly<Record<TheoryFormat, string>> = {
  "single-choice": "Trắc nghiệm 4 phương án, một đáp án đúng",
  "multi-select": "Chọn nhiều phương án đúng",
  "true-false-set": "Đúng/Sai bốn ý a–d",
  numeric: "Trả lời ngắn bằng số",
  "short-text": "Trả lời ngắn bằng thuật ngữ",
};

/**
 * Các mảng nền tảng mà Syllabus IOAI 2026 không tách thành mục riêng, nhưng
 * chiếm tỷ trọng rất lớn trong đề trắc nghiệm vòng 1 đã công bố công khai của
 * các olympiad AI quốc gia. Xem `docs/LY_THUYET_VONG_1.md` mục nguồn hiệu chỉnh.
 */
export const FOUNDATION_TOPICS = {
  "math-linear-algebra": "Đại số tuyến tính",
  "math-calculus": "Giải tích và đạo hàm",
  "math-probability": "Xác suất và thống kê",
  "computing-python": "Tin học và Python",
  "genai": "AI tạo sinh",
} as const;

export type FoundationTopicId = keyof typeof FOUNDATION_TOPICS;

export function isFoundationTopic(id: string): id is FoundationTopicId {
  return Object.prototype.hasOwnProperty.call(FOUNDATION_TOPICS, id);
}

interface TheoryQuestionBase {
  /** Quy ước: `${syllabusId}-${số thứ tự hai chữ số}`. */
  id: string;
  /**
   * Một trong 60 id của `IOAI_2026_SYLLABUS_COVERAGE`, hoặc một id trong
   * `FOUNDATION_TOPICS` với các câu nền tảng nằm ngoài bảng syllabus.
   */
  syllabusId: string;
  difficulty: TheoryDifficulty;
  stem: string;
  /** Vì sao đáp án đúng là đúng. Không được rỗng. */
  explanation: string;
  /** Bẫy chính của câu. Bắt buộc với mức `advanced`. */
  trap?: string;
  /** Các bước tính tay, dùng cho câu có số liệu. */
  calculation?: readonly string[];
  /**
   * Nguồn công khai đã dùng để hiệu chỉnh dạng/chủ đề của câu hỏi. Câu hỏi là
   * bản gốc do dự án soạn; đây **không** phải trích dẫn nguyên văn đề thi.
   */
  calibratedFrom?: string;
}

export interface SingleChoiceQuestion extends TheoryQuestionBase {
  format: "single-choice";
  choices: readonly [string, string, string, string];
  answerIndex: 0 | 1 | 2 | 3;
  /** Ghi chú cho *từng* phương án theo đúng thứ tự, kể cả phương án đúng. */
  choiceNotes: readonly [string, string, string, string];
}

export interface MultiSelectQuestion extends TheoryQuestionBase {
  format: "multi-select";
  choices: readonly string[];
  answerIndexes: readonly number[];
  choiceNotes: readonly string[];
  /** Đề thi máy thường chấm trọn gói; `partial` dành cho lúc tự luyện. */
  scoring: "all-or-nothing" | "partial";
}

export interface TrueFalseStatement {
  text: string;
  answer: boolean;
  note: string;
}

export interface TrueFalseSetQuestion extends TheoryQuestionBase {
  format: "true-false-set";
  statements: readonly [
    TrueFalseStatement,
    TrueFalseStatement,
    TrueFalseStatement,
    TrueFalseStatement,
  ];
}

export interface NumericQuestion extends TheoryQuestionBase {
  format: "numeric";
  answer: number;
  /** Sai số tuyệt đối chấp nhận được; đặt 0 khi đáp án là số nguyên đúng tuyệt đối. */
  tolerance: number;
  unit?: string;
}

export interface ShortTextQuestion extends TheoryQuestionBase {
  format: "short-text";
  /** So khớp sau khi hạ chữ thường, bỏ dấu cách thừa. Ít nhất một dạng chấp nhận. */
  acceptedAnswers: readonly string[];
}

export type TheoryQuestion =
  | SingleChoiceQuestion
  | MultiSelectQuestion
  | TrueFalseSetQuestion
  | NumericQuestion
  | ShortTextQuestion;

export function pointsFor(question: TheoryQuestion): number {
  return DIFFICULTY_PROFILES[question.difficulty].points;
}

export function timeBudgetFor(question: TheoryQuestion): number {
  return DIFFICULTY_PROFILES[question.difficulty].timeBudgetSeconds;
}

/* ------------------------------------------------------------------ */
/* Blueprint đề mock 180 phút                                          */
/* ------------------------------------------------------------------ */

export const MOCK_DURATION_MINUTES = 180;

/** Phần nền tảng Toán & Tin được tính như một khối riêng khi lắp đề. */
export const FOUNDATION_SECTION = "Nền tảng Toán & Tin" as const;
export type PaperSection = TheorySection | typeof FOUNDATION_SECTION;

export const PAPER_SECTIONS: readonly PaperSection[] = [
  FOUNDATION_SECTION,
  ...THEORY_SECTIONS,
];

/**
 * Số câu mỗi ô (khối × mức độ) của một đề mock 100 câu / 180 phút.
 *
 * Tỷ trọng bám hai mốc công khai: thông báo VOAI cho biết vòng sơ loại gồm 100
 * câu trắc nghiệm trong 180 phút, tập trung ML/CV/NLP; còn các đề trắc nghiệm
 * vòng 1 đã công bố của olympiad AI quốc gia khác cho thấy khối Toán nền tảng
 * và Tin học chiếm tỷ trọng rất lớn. Vì vậy khối nền tảng được tách riêng và
 * giữ trọng số cao nhất.
 *
 * Cảnh báo: đây là tham số luyện tập nội bộ. Số câu, tỷ trọng và thang điểm
 * chính thức của VOAI 2027 vẫn là TBD.
 */
export const MOCK_PAPER_BLUEPRINT: Readonly<
  Record<PaperSection, Readonly<Record<TheoryDifficulty, number>>>
> = {
  [FOUNDATION_SECTION]: { recall: 10, understand: 10, apply: 8, advanced: 2 },
  "Foundational Skills & Classical ML": { recall: 7, understand: 9, apply: 8, advanced: 4 },
  "Neural Networks & Deep Learning": { recall: 5, understand: 7, apply: 7, advanced: 3 },
  "Computer Vision": { recall: 2, understand: 3, apply: 4, advanced: 2 },
  "NLP & Audio": { recall: 1, understand: 3, apply: 3, advanced: 2 },
};

export const MOCK_PAPER_QUESTION_COUNT = PAPER_SECTIONS.reduce(
  (total, section) =>
    total + DIFFICULTY_LEVELS.reduce((sum, level) => sum + MOCK_PAPER_BLUEPRINT[section][level], 0),
  0,
);

/**
 * Ngưỡng nội bộ để tự đánh giá sau một đề mock. Đây là gate học tập của dự án,
 * **không phải** ngưỡng chọn của VOAI.
 */
export const MOCK_INTERNAL_GATES = {
  passPercent: 75,
  perSectionPercent: 60,
  /** Dưới mức này ở câu phân loại nghĩa là chưa sẵn sàng cho vòng 1 dù tổng điểm đạt. */
  advancedPercent: 50,
} as const;
