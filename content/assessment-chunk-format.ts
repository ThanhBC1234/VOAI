/**
 * Định dạng chunk assessment — **hình dạng dữ liệu, không có dữ liệu**.
 *
 * Vì sao tách khỏi `assessment-catalog.ts` (PERF-P3-01): loader ở client cần
 * hằng số phiên bản và cách dựng đường dẫn chunk. Nếu nó import thẳng từ
 * `assessment-catalog.ts`, bundler sẽ kéo theo `daily-assessments.ts` →
 * `curriculum.ts` và **toàn bộ 290 phiên lại chui vào bundle client** — đúng
 * thứ vừa được đẩy ra khỏi HTML/RSC. Lần đo đầu tiên sau khi tách đã dính đúng
 * cái bẫy này: chunk `curriculum` 80,8 KB xuất hiện trong danh sách
 * `modulepreload` của `/assessments`.
 *
 * Quy tắc cho tệp này: **không import giá trị runtime từ `content/`**. Chỉ
 * `import type` (bị xoá hoàn toàn lúc biên dịch) và hằng số tự khai báo.
 */

import type { SessionKind } from "./curriculum";
import type {
  AssessmentMasteryRule,
  AssessmentPassRule,
  AssessmentScoreWeights,
  DailyAssessment,
} from "./daily-assessments";

/** Thư mục chứa chunk tĩnh trong `public/`, tính từ gốc site. */
export const ASSESSMENT_CHUNK_DIRECTORY = "/data/assessments";
/** Đổi khi *hình dạng* chunk đổi, để bản cũ trong HTTP cache không bị hiểu nhầm. */
export const ASSESSMENT_CHUNK_VERSION = 1;

export interface AssessmentCatalogEntry {
  id: string;
  sessionId: string;
  ordinal: number;
  date: string;
  week: number | null;
  kind: SessionKind;
  domain: DailyAssessment["domain"];
  title: string;
  /** Giữ trong payload đầu vì bộ lọc tìm kiếm trên chuỗi này. */
  outcome: string;
  /** Khoá chunk chứa phần chi tiết của bài này. */
  chunk: string;
  /** Số ô nhập retrieval; đủ để dựng nháp rỗng mà không cần nội dung câu hỏi. */
  retrievalCount: number;
  scoreWeights: AssessmentScoreWeights;
  minimumScore: number;
  minimumSectionScores: AssessmentScoreWeights;
}

/** Phần chỉ cần khi người học đã *chọn* một bài. */
export interface AssessmentDetail {
  sessionId: string;
  retrievalQuestions: readonly string[];
  codingTask: string;
  visibleCriteria: readonly string[];
  hiddenTestCategories: readonly string[];
  explainPrompt: string;
  aiBoundary: string;
  passRule: AssessmentPassRule;
  mastery: AssessmentMasteryRule;
}

export interface AssessmentChunk {
  version: number;
  chunk: string;
  details: readonly AssessmentDetail[];
}

/**
 * Một chunk cho mỗi tuần, cộng một chunk `finale` cho ba phiên tổng kết có
 * `week: null`. Ranh giới theo tuần ổn định vì lịch 41 tuần là bất biến đã
 * được `content/curriculum.ts` kiểm ở thời điểm import — đổi nội dung một
 * tuần không làm mọi chunk khác đổi tên và mất cache.
 */
export function assessmentChunkKey(week: number | null): string {
  if (week === null) return "finale";
  if (!Number.isInteger(week) || week < 1) {
    throw new Error(`Không dựng được khoá chunk cho tuần: ${String(week)}`);
  }
  return `week-${String(week).padStart(2, "0")}`;
}

export function assessmentChunkPath(chunk: string): string {
  if (!/^(?:week-\d{2}|finale)$/.test(chunk)) {
    throw new Error(`Khoá chunk không hợp lệ: ${chunk}`);
  }
  return `${ASSESSMENT_CHUNK_DIRECTORY}/${chunk}.json`;
}
