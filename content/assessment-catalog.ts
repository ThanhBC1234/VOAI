/**
 * Tách lớp đánh giá 290 phiên thành **catalog nhẹ** và **chi tiết theo tuần**.
 *
 * Vì sao (PERF-P3-01): `/assessments` từng đẩy toàn bộ 290 bản ghi đầy đủ vào
 * HTML *và* RSC payload — hơn 3,3 MB raw trước khi người học bấm bất cứ thứ gì,
 * trong khi màn hình đầu chỉ cần danh sách và đúng một bài.
 *
 * Ranh giới tách được chọn theo *nhu cầu thật của component*, không theo cảm
 * tính. Catalog phải đủ để làm được ba việc mà không chạm tới chi tiết:
 *
 * 1. **Liệt kê và lọc** — cần `sessionId`, `date`, `title`, `outcome`, `domain`,
 *    `kind`, `ordinal`.
 * 2. **Dựng bản nháp rỗng** — chỉ cần *số* ô retrieval (`retrievalCount`),
 *    không cần nội dung câu hỏi.
 * 3. **Kiểm định attempt đã lưu** — cần `scoreWeights`, `minimumScore` và
 *    `minimumSectionScores`.
 *
 * Đúng ba nhóm trường đó là lý do lần refactor trước phải hoàn nguyên: catalog
 * khi ấy thiếu chúng nên lịch sử attempt không kiểm định được khi chunk chưa
 * tải. Ở đây chúng nằm sẵn trong catalog, nên **lịch sử và bản nháp không bao
 * giờ phụ thuộc vào mạng**.
 *
 * Tệp này **có** dữ liệu, nên chỉ được import từ phía server (`app/…/page.tsx`)
 * và từ script build. Phía client dùng `assessment-chunk-format.ts`.
 */

import { DAILY_ASSESSMENTS, type DailyAssessment } from "./daily-assessments";
import {
  ASSESSMENT_CHUNK_VERSION,
  assessmentChunkKey,
  assessmentChunkPath,
  type AssessmentCatalogEntry,
  type AssessmentChunk,
  type AssessmentDetail,
} from "./assessment-chunk-format";

export {
  ASSESSMENT_CHUNK_DIRECTORY,
  ASSESSMENT_CHUNK_VERSION,
  assessmentChunkKey,
  assessmentChunkPath,
} from "./assessment-chunk-format";
export type {
  AssessmentCatalogEntry,
  AssessmentChunk,
  AssessmentDetail,
} from "./assessment-chunk-format";

export function catalogEntryOf(assessment: DailyAssessment): AssessmentCatalogEntry {
  return {
    id: assessment.id,
    sessionId: assessment.sessionId,
    ordinal: assessment.ordinal,
    date: assessment.date,
    week: assessment.week,
    kind: assessment.kind,
    domain: assessment.domain,
    title: assessment.title,
    outcome: assessment.outcome,
    chunk: assessmentChunkKey(assessment.week),
    retrievalCount: assessment.retrievalQuestions.length,
    scoreWeights: { ...assessment.scoreWeights },
    minimumScore: assessment.passRule.minimumScore,
    minimumSectionScores: { ...assessment.passRule.minimumSectionScores },
  };
}

export function detailOf(assessment: DailyAssessment): AssessmentDetail {
  return {
    sessionId: assessment.sessionId,
    retrievalQuestions: assessment.retrievalQuestions,
    codingTask: assessment.codingTask,
    visibleCriteria: assessment.visibleCriteria,
    hiddenTestCategories: assessment.hiddenTestCategories,
    explainPrompt: assessment.explainPrompt,
    aiBoundary: assessment.aiBoundary,
    passRule: assessment.passRule,
    mastery: assessment.mastery,
  };
}

export const ASSESSMENT_CATALOG: readonly AssessmentCatalogEntry[] =
  DAILY_ASSESSMENTS.map(catalogEntryOf);

/** Dùng bởi `scripts/emit-assessment-chunks.mjs`; không đi vào bundle client. */
export function buildAssessmentChunks(): readonly AssessmentChunk[] {
  const grouped = new Map<string, AssessmentDetail[]>();
  for (const assessment of DAILY_ASSESSMENTS) {
    const key = assessmentChunkKey(assessment.week);
    const bucket = grouped.get(key);
    if (bucket) bucket.push(detailOf(assessment));
    else grouped.set(key, [detailOf(assessment)]);
  }
  return [...grouped]
    .map(([chunk, details]) => ({ version: ASSESSMENT_CHUNK_VERSION, chunk, details }))
    .sort((left, right) => left.chunk.localeCompare(right.chunk));
}

export function detailBySessionId(sessionId: string): AssessmentDetail | null {
  const assessment = DAILY_ASSESSMENTS.find((item) => item.sessionId === sessionId);
  return assessment ? detailOf(assessment) : null;
}

/**
 * Cổng bất biến chạy lúc import: mọi bài phải nằm trong đúng một chunk và mọi
 * chunk phải có tên hợp lệ. Nếu lịch đổi mà quy ước chunk không đổi theo, bản
 * dựng gãy ngay thay vì phát hành một trang tải 404 im lặng.
 */
export const ASSESSMENT_CATALOG_VALIDATION = (() => {
  const seen = new Set<string>();
  const chunkSizes = new Map<string, number>();
  for (const entry of ASSESSMENT_CATALOG) {
    if (seen.has(entry.sessionId)) {
      throw new Error(`Catalog assessment trùng sessionId: ${entry.sessionId}`);
    }
    seen.add(entry.sessionId);
    if (entry.retrievalCount < 2) {
      throw new Error(`${entry.sessionId} phải có ít nhất 2 câu retrieval.`);
    }
    // Ném nếu khoá chunk không hợp lệ.
    assessmentChunkPath(entry.chunk);
    chunkSizes.set(entry.chunk, (chunkSizes.get(entry.chunk) ?? 0) + 1);
  }
  if (seen.size !== DAILY_ASSESSMENTS.length) {
    throw new Error(
      `Catalog chỉ phủ ${seen.size}/${DAILY_ASSESSMENTS.length} phiên đánh giá.`,
    );
  }
  return {
    total: seen.size,
    chunks: chunkSizes.size,
    largestChunk: Math.max(...chunkSizes.values()),
  };
})();
