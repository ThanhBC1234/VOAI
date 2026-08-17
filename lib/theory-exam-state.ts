/**
 * Logic thuần của bài thi thử lý thuyết: chấm gate, đồng hồ theo deadline tuyệt
 * đối, và schema lưu attempt đang làm dở.
 *
 * Tách khỏi component để UI và test dùng **cùng một** nguồn sự thật:
 *
 * - THEORY-P1-02: verdict đậu/rớt phải xét đủ ba gate (tổng, từng khối, nhóm câu
 *   phân loại). Trước đây UI công bố ba ngưỡng nhưng chỉ kiểm tổng điểm.
 * - THEORY-P1-03: bài thi đang làm phải sống sót qua reload, nên cần schema có
 *   version + fallback an toàn khi dữ liệu hỏng.
 * - THEORY-P2-01: đồng hồ phải tính từ deadline tuyệt đối, không trừ dần mỗi
 *   giây — tab nền bị throttle hoặc máy sleep sẽ làm cách trừ dần chạy sai.
 */

import { MOCK_DURATION_MINUTES, MOCK_INTERNAL_GATES } from "../content/theory/types";

/* ------------------------------------------------------------------ */
/* Chấm gate                                                           */
/* ------------------------------------------------------------------ */

export interface ScoreBucket {
  correct: number;
  total: number;
}

export interface AttemptScore {
  /** Điểm tổng theo trọng số, đã quy về thang 100. */
  scorePercent: number;
  bySection: Record<string, ScoreBucket>;
  byDifficulty: Record<string, ScoreBucket>;
}

export interface GateFailure {
  gate: "total" | "section" | "advanced";
  label: string;
  actualPercent: number;
  requiredPercent: number;
}

export interface GateVerdict {
  passed: boolean;
  failures: readonly GateFailure[];
}

export type GateConfig = typeof MOCK_INTERNAL_GATES;

/** Tỷ lệ phần trăm chính xác (không làm tròn) để so biên cho đúng. */
export function bucketPercent(bucket: ScoreBucket | undefined): number {
  if (!bucket || bucket.total <= 0) return 0;
  return (bucket.correct / bucket.total) * 100;
}

/**
 * Verdict duy nhất của toàn dự án. Đậu chỉ khi **mọi** gate cùng đạt; trả về
 * danh sách gate chưa đạt để UI nói rõ hỏng ở đâu thay vì một boolean chung.
 *
 * So sánh dùng `>=` trên tỷ lệ chính xác, nên đúng biên 75/60/50 được tính là đạt.
 */
export function evaluateGates(
  score: AttemptScore,
  gates: GateConfig = MOCK_INTERNAL_GATES,
): GateVerdict {
  const failures: GateFailure[] = [];

  if (score.scorePercent < gates.passPercent) {
    failures.push({
      gate: "total",
      label: "Tổng điểm",
      actualPercent: score.scorePercent,
      requiredPercent: gates.passPercent,
    });
  }

  for (const [section, bucket] of Object.entries(score.bySection)) {
    const percent = bucketPercent(bucket);
    if (percent < gates.perSectionPercent) {
      failures.push({
        gate: "section",
        label: section,
        actualPercent: percent,
        requiredPercent: gates.perSectionPercent,
      });
    }
  }

  const advanced = score.byDifficulty.advanced;
  if (advanced && advanced.total > 0) {
    const percent = bucketPercent(advanced);
    if (percent < gates.advancedPercent) {
      failures.push({
        gate: "advanced",
        label: "Nhóm câu phân loại",
        actualPercent: percent,
        requiredPercent: gates.advancedPercent,
      });
    }
  }

  return { passed: failures.length === 0, failures };
}

/* ------------------------------------------------------------------ */
/* Đồng hồ theo deadline tuyệt đối                                     */
/* ------------------------------------------------------------------ */

export const MOCK_DURATION_MS = MOCK_DURATION_MINUTES * 60 * 1000;

/** Số giây còn lại, luôn suy ra từ deadline nên không trôi khi tab bị throttle. */
export function secondsLeftUntil(deadlineEpochMs: number, nowEpochMs: number): number {
  if (!Number.isFinite(deadlineEpochMs)) return 0;
  return Math.max(0, Math.ceil((deadlineEpochMs - nowEpochMs) / 1000));
}

export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/* Lưu attempt đang làm dở                                             */
/* ------------------------------------------------------------------ */

export const ACTIVE_ATTEMPT_STORAGE_KEY = "voai-theory-active-attempt-v1";
export const ACTIVE_ATTEMPT_SCHEMA_VERSION = 1;

export interface ActiveAttempt {
  version: number;
  attemptId: string;
  /** Thứ tự câu được chốt lúc bắt đầu; khôi phục phải giữ nguyên thứ tự này. */
  questionIds: string[];
  responses: Record<string, unknown>;
  startedAtEpochMs: number;
  deadlineEpochMs: number;
  submitted: boolean;
}

export function createActiveAttempt(
  questionIds: readonly string[],
  nowEpochMs: number,
  attemptId: string,
): ActiveAttempt {
  return {
    version: ACTIVE_ATTEMPT_SCHEMA_VERSION,
    attemptId,
    questionIds: [...questionIds],
    responses: {},
    startedAtEpochMs: nowEpochMs,
    deadlineEpochMs: nowEpochMs + MOCK_DURATION_MS,
    submitted: false,
  };
}

/**
 * Đọc attempt đang làm dở. Mọi dữ liệu hỏng, thiếu trường hoặc sai version đều
 * trả `null` thay vì ném — trang trắng vì JSON hỏng là lỗi nghiêm trọng hơn việc
 * mất một attempt.
 */
export function parseActiveAttempt(raw: string | null | undefined): ActiveAttempt | null {
  if (!raw) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof value !== "object" || value === null) return null;
  const candidate = value as Partial<ActiveAttempt>;
  if (candidate.version !== ACTIVE_ATTEMPT_SCHEMA_VERSION) return null;
  if (typeof candidate.attemptId !== "string" || candidate.attemptId.length === 0) return null;
  if (!Array.isArray(candidate.questionIds) || candidate.questionIds.length === 0) return null;
  if (!candidate.questionIds.every((id) => typeof id === "string")) return null;
  if (typeof candidate.startedAtEpochMs !== "number" || !Number.isFinite(candidate.startedAtEpochMs)) return null;
  if (typeof candidate.deadlineEpochMs !== "number" || !Number.isFinite(candidate.deadlineEpochMs)) return null;
  if (typeof candidate.submitted !== "boolean") return null;
  const responses =
    typeof candidate.responses === "object" && candidate.responses !== null
      ? (candidate.responses as Record<string, unknown>)
      : {};
  return {
    version: ACTIVE_ATTEMPT_SCHEMA_VERSION,
    attemptId: candidate.attemptId,
    questionIds: candidate.questionIds as string[],
    responses,
    startedAtEpochMs: candidate.startedAtEpochMs,
    deadlineEpochMs: candidate.deadlineEpochMs,
    submitted: candidate.submitted,
  };
}

/** Attempt khôi phục chỉ dùng được khi mọi câu vẫn còn trong ngân hàng hiện tại. */
export function activeAttemptIsUsable(
  attempt: ActiveAttempt,
  knownQuestionIds: ReadonlySet<string>,
): boolean {
  return attempt.questionIds.every((id) => knownQuestionIds.has(id));
}
