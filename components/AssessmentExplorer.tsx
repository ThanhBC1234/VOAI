"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EssayCoach } from "./EssayCoach";
import { describeWriteStatus, readRaw, writeJson } from "../lib/local-storage";
import { loadAssessmentChunk, type AssessmentDetailMap } from "../lib/assessment-details";
import {
  ASSESSMENT_TRANSFER_FORMAT,
  ASSESSMENT_TRANSFER_VERSION,
  MAX_ASSESSMENT_IMPORT_BYTES,

  MAX_OPAQUE_STRING_LENGTH,
  assessmentInteractionLocks,
  assessmentOpaqueFingerprint,
  capAssessmentString,
  inspectAssessmentAttemptsStoreRaw,
  inspectAssessmentDraftStoreRaw,
  isAssessmentAttemptsStoreValueSafe,
  mergeAssessmentAttemptStoreValues,
  mergeAssessmentDraftStoreDelta,
  parseAssessmentTransferJson,
  partitionAssessmentDraftStore,
  serializeAssessmentTransferPayload,
  shouldAcceptImportedAssessmentDraft,
  type AssessmentDraftStoreDelta,
} from "../lib/assessment-transfer";
import {
  describeLearningProgressWriteResult,
  markSessionCompleted,
  mergeLearningProgress,
} from "../lib/learning-progress";
import type {
  AssessmentCatalogEntry,
  AssessmentDetail,
} from "../content/assessment-chunk-format";
import type { AssessmentScoreWeights } from "../content/daily-assessments";

type AttemptStatus = "passed" | "needs-revision" | "incomplete";

interface AssessmentDraft {
  retrievalAnswers: string[];
  codeEvidence: string;
  evidenceLink: string;
  explanation: string;
  scores: AssessmentScoreWeights;
  soloConfirmed: boolean;
  noAutomaticFailConfirmed: boolean;
}

/**
 * Rubric dùng để chấm một attempt. Với attempt mới đây là `rubricSnapshot` của
 * chính nó; với attempt cũ (trước ASSESS-P2-02) là rubric hiện hành.
 */
interface AssessmentRubric {
  weights: AssessmentScoreWeights;
  minimumScore: number;
  minimumSectionScores: AssessmentScoreWeights;
}

interface StoredAttempt extends AssessmentDraft {
  id: string;
  assessmentId: string;
  sessionId: string;
  timestamp: string;
  score: number;
  threshold: number;
  status: AttemptStatus;
  /**
   * Rubric tại thời điểm nộp. Attempt cũ (trước ASSESS-P2-02) không có trường
   * này nên nó là tuỳ chọn; chúng vẫn hiển thị được và không bị xoá.
   */
  rubricSnapshot?: {
    version: number;
    weights: AssessmentScoreWeights;
    minimumScore: number;
    minimumSectionScores: AssessmentScoreWeights;
  };
}

type Props = {
  /** Danh mục nhẹ đủ để liệt kê, lọc, dựng nháp và kiểm định lịch sử attempt. */
  catalog: readonly AssessmentCatalogEntry[];
  /** Chi tiết của bài được chọn khi render lần đầu; các bài khác tải theo tuần. */
  initialDetail: AssessmentDetail;
};

const STORAGE_KEY = "voai-assessment-attempts-v1";
/** Bản nháp đang gõ, tách khỏi lịch sử attempt và có version riêng (ASSESS-P2-01). */
const DRAFTS_STORAGE_KEY = "voai-assessment-drafts-v1";
const ASSESSMENT_DRAFT_FLUSH_DELAY_MS = 600;
const DRAFT_WRITE_LIMIT_MESSAGE =
  "Bản nháp chưa được lưu: kho đã đạt giới hạn an toàn 1.000 draft, 5 MiB hoặc 120.000 node. Dữ liệu local cũ vẫn nguyên.";
const DRAFT_LIVE_INVALID_MESSAGE =
  "Kho bản nháp vừa thay đổi ở tab khác nhưng không còn hydrate an toàn. Trang đã khóa ghi và giữ nguyên dữ liệu local.";
const ATTEMPT_LIVE_INVALID_MESSAGE =
  "Kho attempt vừa thay đổi ở tab khác nhưng không còn hydrate an toàn. Trang đã khóa ghi và giữ nguyên dữ liệu local.";
const CROSS_TAB_DRAFT_WARNING =
  "Bản nháp của phiên này vừa thay đổi ở tab khác. Nội dung của tab lưu sau cùng sẽ được giữ.";
const kindLabels: Record<AssessmentCatalogEntry["kind"], string> = {
  lesson: "Bài học",
  lab: "Lab",
  checkpoint: "Checkpoint",
  finale: "Tổng kết",
};
const scoreLabels: Record<keyof AssessmentScoreWeights, string> = {
  retrieval: "Truy hồi",
  coding: "Tự code",
  validation: "Kiểm chứng",
  explanation: "Giải thích",
};
const scoreCategories = ["retrieval", "coding", "validation", "explanation"] as const;

function rubricOf(entry: AssessmentCatalogEntry): AssessmentRubric {
  return {
    weights: entry.scoreWeights,
    minimumScore: entry.minimumScore,
    minimumSectionScores: entry.minimumSectionScores,
  };
}

function emptyDraft(entry: AssessmentCatalogEntry): AssessmentDraft {
  return {
    retrievalAnswers: Array.from({ length: entry.retrievalCount }, () => ""),
    codeEvidence: "",
    evidenceLink: "",
    explanation: "",
    scores: { retrieval: 0, coding: 0, validation: 0, explanation: 0 },
    soloConfirmed: false,
    noAutomaticFailConfirmed: false,
  };
}

function totalScoreFor(scores: AssessmentScoreWeights): number {
  return scoreCategories.reduce((sum, category) => sum + scores[category], 0);
}

function evidenceCompleteFor(draft: AssessmentDraft, retrievalCount: number): boolean {
  return Boolean(
    draft.retrievalAnswers.length === retrievalCount &&
      draft.retrievalAnswers.every((answer) => Boolean(answer.trim())) &&
      draft.codeEvidence.trim() &&
      draft.explanation.trim() &&
      draft.soloConfirmed &&
      draft.noAutomaticFailConfirmed,
  );
}

function missingSectionScoreCategories(
  scores: AssessmentScoreWeights,
  rubric: AssessmentRubric,
): Array<keyof AssessmentScoreWeights> {
  return scoreCategories.filter(
    (category) => scores[category] < rubric.minimumSectionScores[category],
  );
}

function computedStatusFor(
  draft: AssessmentDraft,
  rubric: AssessmentRubric,
  retrievalCount: number,
): AttemptStatus {
  if (!evidenceCompleteFor(draft, retrievalCount)) return "incomplete";
  const passesTotal = totalScoreFor(draft.scores) >= rubric.minimumScore;
  const passesSections = missingSectionScoreCategories(draft.scores, rubric).length === 0;
  return passesTotal && passesSections ? "passed" : "needs-revision";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isScoreWeights(value: unknown): value is AssessmentScoreWeights {
  if (!isRecord(value)) return false;
  if (Object.keys(value).length !== scoreCategories.length) return false;
  return scoreCategories.every((category) => {
    const score = value[category];
    return typeof score === "number" && Number.isFinite(score) && score >= 0;
  });
}

/**
 * ASSESS-P2-02: lịch sử **không** được diễn giải lại bằng rubric hiện tại.
 * Attempt mang `rubricSnapshot` hợp lệ thì được chấm lại đúng bằng rubric của
 * chính nó, nên đổi trọng số trong nội dung không làm attempt cũ đột nhiên
 * "không đọc được" rồi biến mất khỏi màn hình.
 */
function rubricForAttempt(
  value: Record<string, unknown>,
  entry: AssessmentCatalogEntry,
): AssessmentRubric {
  const snapshot = value.rubricSnapshot;
  if (
    isRecord(snapshot) &&
    snapshot.version === 1 &&
    isScoreWeights(snapshot.weights) &&
    isScoreWeights(snapshot.minimumSectionScores) &&
    typeof snapshot.minimumScore === "number" &&
    Number.isFinite(snapshot.minimumScore)
  ) {
    return {
      weights: snapshot.weights,
      minimumScore: snapshot.minimumScore,
      minimumSectionScores: snapshot.minimumSectionScores,
    };
  }
  return rubricOf(entry);
}

function isStoredAttempt(
  value: unknown,
  entryById: ReadonlyMap<string, AssessmentCatalogEntry>,
): value is StoredAttempt {
  if (!isRecord(value)) return false;
  if (
    typeof value.id !== "string" ||
    value.id.trim().length === 0 ||
    typeof value.assessmentId !== "string" ||
    typeof value.sessionId !== "string" ||
    typeof value.timestamp !== "string" ||
    typeof value.codeEvidence !== "string" ||
    typeof value.evidenceLink !== "string" ||
    typeof value.explanation !== "string" ||
    typeof value.soloConfirmed !== "boolean" ||
    typeof value.noAutomaticFailConfirmed !== "boolean" ||
    typeof value.score !== "number" ||
    !Number.isFinite(value.score) ||
    typeof value.threshold !== "number" ||
    !Number.isFinite(value.threshold) ||
    (value.status !== "passed" &&
      value.status !== "needs-revision" &&
      value.status !== "incomplete")
  ) {
    return false;
  }

  const entry = entryById.get(value.assessmentId);
  if (!entry || entry.sessionId !== value.sessionId) return false;
  if (
    !Array.isArray(value.retrievalAnswers) ||
    value.retrievalAnswers.length !== entry.retrievalCount ||
    !value.retrievalAnswers.every((answer) => typeof answer === "string")
  ) {
    return false;
  }
  const timestamp = Date.parse(value.timestamp);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString() !== value.timestamp) {
    return false;
  }
  const rubric = rubricForAttempt(value, entry);
  const rawScores = value.scores;
  if (!isRecord(rawScores)) return false;
  if (
    Object.keys(rawScores).length !== scoreCategories.length ||
    !scoreCategories.every((category) => {
      const score = rawScores[category];
      return (
        typeof score === "number" &&
        Number.isFinite(score) &&
        score >= 0 &&
        score <= rubric.weights[category]
      );
    })
  ) {
    return false;
  }

  const scores: AssessmentScoreWeights = {
    retrieval: rawScores.retrieval as number,
    coding: rawScores.coding as number,
    validation: rawScores.validation as number,
    explanation: rawScores.explanation as number,
  };
  const draft: AssessmentDraft = {
    retrievalAnswers: value.retrievalAnswers,
    codeEvidence: value.codeEvidence,
    evidenceLink: value.evidenceLink,
    explanation: value.explanation,
    scores,
    soloConfirmed: value.soloConfirmed,
    noAutomaticFailConfirmed: value.noAutomaticFailConfirmed,
  };
  const computedScore = totalScoreFor(scores);
  return (
    Math.abs(value.score - computedScore) < Number.EPSILON &&
    value.threshold === rubric.minimumScore &&
    value.status === computedStatusFor(draft, rubric, entry.retrievalCount)
  );
}

/**
 * Draft nhập từ file không được ép kiểu thẳng. Mọi trường đều được kiểm tra
 * theo assessment tương ứng, rồi component chỉ sao chép các trường đã biết.
 */
function parseAssessmentDraft(
  value: unknown,
  entry: AssessmentCatalogEntry,
): AssessmentDraft | null {
  if (!isRecord(value)) return null;
  if (
    !Array.isArray(value.retrievalAnswers) ||
    value.retrievalAnswers.length !== entry.retrievalCount ||
    !value.retrievalAnswers.every((answer) => typeof answer === "string") ||
    typeof value.codeEvidence !== "string" ||
    typeof value.evidenceLink !== "string" ||
    typeof value.explanation !== "string" ||
    typeof value.soloConfirmed !== "boolean" ||
    typeof value.noAutomaticFailConfirmed !== "boolean"
  ) {
    return null;
  }
  const rawScores = value.scores;
  if (
    !isRecord(rawScores) ||
    Object.keys(rawScores).length !== scoreCategories.length ||
    !scoreCategories.every((category) => {
      const score = rawScores[category];
      return (
        typeof score === "number" &&
        Number.isFinite(score) &&
        score >= 0 &&
        score <= entry.scoreWeights[category]
      );
    })
  ) {
    return null;
  }

  return {
    retrievalAnswers: [...value.retrievalAnswers],
    codeEvidence: value.codeEvidence,
    evidenceLink: value.evidenceLink,
    explanation: value.explanation,
    scores: {
      retrieval: rawScores.retrieval as number,
      coding: rawScores.coding as number,
      validation: rawScores.validation as number,
      explanation: rawScores.explanation as number,
    },
    soloConfirmed: value.soloConfirmed,
    noAutomaticFailConfirmed: value.noAutomaticFailConfirmed,
  };
}

function createUnknownRecord(): Record<string, unknown> {
  return Object.create(null) as Record<string, unknown>;
}

function assessmentAttemptIdentity(
  value: unknown,
  entryById: ReadonlyMap<string, AssessmentCatalogEntry>,
): string | null {
  if (isStoredAttempt(value, entryById)) return `known:${value.id}`;
  const fingerprint = assessmentOpaqueFingerprint(value);
  return fingerprint === null ? null : `opaque:${fingerprint}`;
}

function partitionAssessmentAttempts(
  candidates: readonly unknown[],
  entryById: ReadonlyMap<string, AssessmentCatalogEntry>,
): { known: StoredAttempt[]; opaque: unknown[] } {
  const known: StoredAttempt[] = [];
  const opaque: unknown[] = [];
  const seen = new Set<string>();
  for (const candidate of candidates) {
    const identity = assessmentAttemptIdentity(candidate, entryById);
    if (identity === null || seen.has(identity)) continue;
    seen.add(identity);
    if (isStoredAttempt(candidate, entryById)) known.push(candidate);
    else opaque.push(candidate);
  }
  known.sort((left, right) => Date.parse(right.timestamp) - Date.parse(left.timestamp));
  return { known, opaque };
}

interface AssessmentDraftDeltaWriterCore {
  schedule: (delta: AssessmentDraftStoreDelta) => void;
  flush: () => void;
  dispose: () => void;
  pendingSession: () => string | null;
}

function createAssessmentDraftDeltaWriterCore(
  onWrite: (delta: AssessmentDraftStoreDelta) => void,
): AssessmentDraftDeltaWriterCore {
  let pending: AssessmentDraftStoreDelta | null = null;
  let timer: number | null = null;
  const cancelTimer = () => {
    if (timer !== null) {
      globalThis.clearTimeout(timer);
      timer = null;
    }
  };
  const flush = () => {
    cancelTimer();
    if (!pending) return;
    const delta = pending;
    pending = null;
    onWrite(delta);
  };
  return {
    schedule(delta) {
      pending = delta;
      cancelTimer();
      timer = globalThis.setTimeout(
        flush,
        ASSESSMENT_DRAFT_FLUSH_DELAY_MS,
      ) as unknown as number;
    },
    flush,
    dispose() {
      cancelTimer();
      pending = null;
    },
    pendingSession: () => pending?.sessionId ?? null,
  };
}

function useAssessmentDraftDeltaWriter(
  persist: (delta: AssessmentDraftStoreDelta) => string | null,
): {
  schedule: (delta: AssessmentDraftStoreDelta) => void;
  flush: () => void;
  notice: string | null;
  pendingSession: () => string | null;
} {
  const [notice, setNotice] = useState<string | null>(null);
  const [core] = useState(() =>
    createAssessmentDraftDeltaWriterCore((delta) => setNotice(persist(delta))),
  );
  useEffect(() => {
    const flushNow = () => core.flush();
    const flushWhenHidden = () => {
      if (document.visibilityState === "hidden") core.flush();
    };
    window.addEventListener("pagehide", flushNow);
    document.addEventListener("visibilitychange", flushWhenHidden);
    return () => {
      window.removeEventListener("pagehide", flushNow);
      document.removeEventListener("visibilitychange", flushWhenHidden);
      core.flush();
      core.dispose();
    };
  }, [core]);
  return useMemo(
    () => ({
      schedule: core.schedule,
      flush: core.flush,
      notice,
      pendingSession: core.pendingSession,
    }),
    [core, notice],
  );
}

function progressSyncWarning(status: ReturnType<typeof markSessionCompleted>["status"]): string {
  const reason = describeWriteStatus(status);
  return (
    " Cảnh báo: attempt đã được lưu nhưng chưa đồng bộ sang tiến độ Lộ trình." +
    (reason ? ` ${reason}` : "")
  );
}

function statusLabel(status: AttemptStatus): string {
  if (status === "passed") return "Pass tự đánh giá";
  if (status === "needs-revision") return "Cần sửa";
  return "Thiếu bằng chứng";
}

export function AssessmentExplorer({ catalog, initialDetail }: Props) {
  const firstAssessment = catalog[0];
  const initialAssessment =
    catalog.find((entry) => entry.sessionId === initialDetail.sessionId) ?? firstAssessment;
  const [selectedId, setSelectedId] = useState(initialAssessment?.sessionId ?? "");
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [domain, setDomain] = useState("all");
  const [attempts, setAttempts] = useState<StoredAttempt[]>([]);
  const [draft, setDraft] = useState<AssessmentDraft>(() =>
    initialAssessment
      ? emptyDraft(initialAssessment)
      : {
          retrievalAnswers: [],
          codeEvidence: "",
          evidenceLink: "",
          explanation: "",
          scores: { retrieval: 0, coding: 0, validation: 0, explanation: 0 },
          soloConfirmed: false,
          noAutomaticFailConfirmed: false,
        },
  );
  const [saveMessage, setSaveMessage] = useState("");
  const [transferMessage, setTransferMessage] = useState("");
  const [attemptStoreLocked, setAttemptStoreLocked] = useState(false);
  const [draftStoreLocked, setDraftStoreLocked] = useState(false);
  const [attemptStoreReady, setAttemptStoreReady] = useState(false);
  const [draftStoreReady, setDraftStoreReady] = useState(false);
  const [draftPayloadBlocked, setDraftPayloadBlocked] = useState(false);
  const [draftWriteLimitMessage, setDraftWriteLimitMessage] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  /**
   * Chi tiết đã có trên client. Bài đầu tiên nằm sẵn trong payload đầu nên
   * màn hình đầu không phải chờ mạng; các tuần khác được nạp vào đây theo chunk.
   */
  const [details, setDetails] = useState<AssessmentDetailMap>(() => ({
    [initialDetail.sessionId]: initialDetail,
  }));
  const [detailError, setDetailError] = useState("");
  const [retryToken, setRetryToken] = useState(0);
  /** Kho bản nháp theo sessionId; tồn tại qua cả việc chuyển bài lẫn reload. */
  const draftsRef = useRef<Record<string, AssessmentDraft>>({});
  const draftPayloadBlockedRef = useRef(false);
  /**
   * Chặn ghi trước khi đọc xong. Lần render đầu `draft` mới chỉ là biểu mẫu
   * rỗng; nếu bộ theo dõi bên dưới ghi ngay giá trị đó thì nó sẽ **đè mất** bản
   * nháp đang nằm trong storage trước khi kịp khôi phục.
   */
  const hydratedRef = useRef(false);
  /** Chỉ bật sau khi xác nhận kho tương ứng đang thiếu hoặc hydrate hợp lệ. */
  const attemptWritesAllowedRef = useRef(false);
  const draftWritesAllowedRef = useRef(false);
  /** Snapshot đồng bộ để import async không dùng closure attempts đã cũ. */
  const attemptsRef = useRef<StoredAttempt[]>([]);
  /** Attempt cũ chưa diễn giải được bằng rubric hiện tại; luôn được ghi lại kèm. */
  const unreadableRef = useRef<unknown[]>([]);
  /** Draft thuộc assessment đã rời catalog; chỉ lưu/tái xuất, không đưa vào form. */
  const opaqueDraftsRef = useRef<Record<string, unknown>>(createUnknownRecord());
  const importInputRef = useRef<HTMLInputElement>(null);
  /** Khóa đồng bộ ngay trước await; state chỉ phục vụ render/disable UI. */
  const importInFlightRef = useRef(false);
  /** Chunk đã ghép vào `details`; chặn cả tải trùng lẫn vòng lặp effect. */
  const mergedChunksRef = useRef<Set<string>>(new Set());
  const entryById = useMemo(
    () => new Map(catalog.map((entry) => [entry.id, entry])),
    [catalog],
  );
  const entryBySession = useMemo(
    () => new Map(catalog.map((entry) => [entry.sessionId, entry])),
    [catalog],
  );
  const {
    schedule: scheduleDraftWrite,
    flush: flushDraftWrite,
    notice: draftNotice,
    pendingSession: pendingDraftSession,
  } = useAssessmentDraftDeltaWriter(persistDraftDelta);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const requestedSession = new URLSearchParams(window.location.search).get("session");
      const requestedAssessment = catalog.find(
        (entry) => entry.sessionId === requestedSession,
      );
      const target = requestedAssessment ?? initialAssessment;
      const inspection = inspectAssessmentDraftStoreRaw(readRaw(DRAFTS_STORAGE_KEY));

      if (inspection.status === "invalid") {
        // Không diễn giải được không đồng nghĩa với rỗng: khóa ghi để dữ liệu
        // nguyên bản trong localStorage tuyệt đối không bị form mới đè lên.
        draftWritesAllowedRef.current = false;
        hydratedRef.current = false;
        draftsRef.current = Object.create(null) as Record<string, AssessmentDraft>;
        opaqueDraftsRef.current = createUnknownRecord();
        setDraftStoreLocked(true);
        setDraftStoreReady(false);
        draftPayloadBlockedRef.current = true;
        setDraftPayloadBlocked(true);
        if (target) {
          setSelectedId(target.sessionId);
          setDraft(emptyDraft(target));
        }
        return;
      }

      const stored =
        inspection.status === "valid" ? inspection.value : createUnknownRecord();
      const partition = partitionAssessmentDraftStore<AssessmentDraft>(
        stored,
        (sessionId, candidate) => {
          const entry = entryBySession.get(sessionId);
          if (!entry) return { kind: "unknown" };
          const validDraft = parseAssessmentDraft(candidate, entry);
          return validDraft
            ? { kind: "known", value: validDraft }
            : { kind: "invalid" };
        },
      );
      if (partition.status === "invalid-known") {
        // Draft của session hiện hành sai schema vẫn là dữ liệu người học. Khóa
        // toàn bộ kho, không thay nó bằng form rỗng rồi autosave đè lên.
        draftWritesAllowedRef.current = false;
        hydratedRef.current = false;
        draftsRef.current = Object.create(null) as Record<string, AssessmentDraft>;
        opaqueDraftsRef.current = createUnknownRecord();
        setDraftStoreLocked(true);
        setDraftStoreReady(false);
        draftPayloadBlockedRef.current = true;
        setDraftPayloadBlocked(true);
        if (target) {
          setSelectedId(target.sessionId);
          setDraft(emptyDraft(target));
        }
        return;
      }
      draftsRef.current = partition.known;
      opaqueDraftsRef.current = partition.opaque;
      draftWritesAllowedRef.current = true;
      hydratedRef.current = true;
      setDraftStoreLocked(false);
      setDraftStoreReady(true);
      draftPayloadBlockedRef.current = false;
      setDraftPayloadBlocked(false);
      setDraftWriteLimitMessage("");
      if (!target) return;
      setSelectedId(target.sessionId);
      setDraft(draftsRef.current[target.sessionId] ?? emptyDraft(target));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [catalog, entryBySession, initialAssessment]);

  /**
   * Lưu bản nháp **trong lúc gõ** (ASSESS-P1-01).
   *
   * Trước đây kho nháp chỉ được ghi lúc đổi bài, nên gõ xong rồi tải lại trang
   * hay đóng tab là mất sạch phần tự đánh giá. Theo dõi thẳng `draft` ở đây
   * phủ được **mọi** đường sửa — kể cả những ô nhập thêm về sau — thay vì phải
   * nhớ gọi thủ công trong từng hàm `update*`.
   */

  useEffect(() => {
    const timer = window.setTimeout(() => {
      // Kho tồn tại nhưng hỏng/quá giới hạn phải được giữ nguyên byte-for-byte;
      // tuyệt đối không biến nó thành [] rồi ghi đè ở lần lưu kế tiếp.
      const inspection = inspectAssessmentAttemptsStoreRaw(readRaw(STORAGE_KEY));
      if (inspection.status === "invalid") {
        attemptWritesAllowedRef.current = false;
        attemptsRef.current = [];
        unreadableRef.current = [];
        setAttempts([]);
        setAttemptStoreLocked(true);
        setAttemptStoreReady(false);
        return;
      }

      const candidates = inspection.status === "valid" ? inspection.value : [];
      const seenAttemptIds = new Set<string>();
      const seenOpaque = new Set<string>();
      const validAttempts: StoredAttempt[] = [];
      const unreadable: unknown[] = [];
      for (const candidate of candidates) {
        if (isStoredAttempt(candidate, entryById)) {
          if (seenAttemptIds.has(candidate.id)) continue;
          seenAttemptIds.add(candidate.id);
          validAttempts.push(candidate);
          continue;
        }
        const fingerprint = assessmentOpaqueFingerprint(candidate);
        if (fingerprint === null || seenOpaque.has(fingerprint)) continue;
        seenOpaque.add(fingerprint);
        unreadable.push(candidate);
      }
      attemptsRef.current = validAttempts;
      unreadableRef.current = unreadable;
      attemptWritesAllowedRef.current = true;
      setAttempts(validAttempts);
      setAttemptStoreLocked(false);
      setAttemptStoreReady(true);

      // PROGRESS-MIGRATION-ASSESSMENT-START
      // Chỉ attempt đã qua `isStoredAttempt` mới được phép nối sang tiến độ.
      // Đây là kho canonical riêng, không nới khóa ghi của Assessment.
      const passedSessionIds = [
        ...new Set(
          validAttempts
            .filter((attempt) => attempt.status === "passed")
            .map((attempt) => attempt.sessionId),
        ),
      ];
      if (passedSessionIds.length > 0) {
        const progressResult = mergeLearningProgress(passedSessionIds);
        if (progressResult.status !== "ok") {
          const reason = describeLearningProgressWriteResult(progressResult);
          setTransferMessage(
            "Cảnh báo: các attempt pass cũ vẫn được giữ nguyên, nhưng chưa đồng bộ sang tiến độ Lộ trình." +
              (reason ? ` ${reason}` : ""),
          );
        }
      }
      // PROGRESS-MIGRATION-ASSESSMENT-END
    }, 0);
    return () => window.clearTimeout(timer);
  }, [entryById]);

  const domains = useMemo(
    () => Array.from(new Set(catalog.map((entry) => entry.domain))),
    [catalog],
  );
  const selected =
    catalog.find((entry) => entry.sessionId === selectedId) ?? firstAssessment;
  const selectedChunk = selected?.chunk;
  const selectedDetail = selected ? details[selected.sessionId] : undefined;

  /**
   * Nạp chunk của bài đang chọn. Cả chunk được ghép vào `details` một lần, nên
   * chuyển sang bài khác trong cùng tuần **không** phát sinh request mới; module
   * cache còn chặn cả trường hợp quay lại tuần đã xem.
   *
   * `mergedChunksRef` là chốt chặn vòng lặp: nếu một chunk đã ghép mà bài đang
   * chọn vẫn thiếu chi tiết (dữ liệu lệch giữa catalog và chunk), effect phải
   * dừng và báo lỗi thay vì gọi lại `setDetails` vô hạn.
   */
  useEffect(() => {
    const syncFromStorage = (event: StorageEvent) => {
      const lockLiveDrafts = () => {
        draftWritesAllowedRef.current = false;
        hydratedRef.current = false;
        setDraftStoreLocked(true);
        setDraftStoreReady(false);
        draftPayloadBlockedRef.current = true;
        setDraftPayloadBlocked(true);
        setDraftWriteLimitMessage(DRAFT_LIVE_INVALID_MESSAGE);
      };
      if (event.key === STORAGE_KEY) {
        const inspection = inspectAssessmentAttemptsStoreRaw(event.newValue);
        if (inspection.status === "invalid") {
          attemptWritesAllowedRef.current = false;
          setAttemptStoreLocked(true);
          setAttemptStoreReady(false);
          setTransferMessage(ATTEMPT_LIVE_INVALID_MESSAGE);
          return;
        }
        const candidates = inspection.status === "valid" ? inspection.value : [];
        const partition = partitionAssessmentAttempts(candidates, entryById);
        attemptsRef.current = partition.known;
        unreadableRef.current = partition.opaque;
        attemptWritesAllowedRef.current = true;
        setAttempts(partition.known);
        setAttemptStoreLocked(false);
        setAttemptStoreReady(true);
        return;
      }
      if (event.key !== DRAFTS_STORAGE_KEY) return;

      const inspection = inspectAssessmentDraftStoreRaw(event.newValue);
      if (inspection.status === "invalid") {
        lockLiveDrafts();
        return;
      }
      const liveDrafts =
        inspection.status === "valid" ? inspection.value : createUnknownRecord();
      const partition = partitionAssessmentDraftStore<AssessmentDraft>(
        liveDrafts,
        (sessionId, candidate) => {
          const entry = entryBySession.get(sessionId);
          if (!entry) return { kind: "unknown" };
          const validDraft = parseAssessmentDraft(candidate, entry);
          return validDraft
            ? { kind: "known", value: validDraft }
            : { kind: "invalid" };
        },
      );
      if (partition.status === "invalid-known") {
        lockLiveDrafts();
        return;
      }

      const previousSelected = draftsRef.current[selectedId];
      const nextSelected = partition.known[selectedId];
      const selectedChanged =
        assessmentOpaqueFingerprint(previousSelected) !==
        assessmentOpaqueFingerprint(nextSelected);
      draftsRef.current = partition.known;
      opaqueDraftsRef.current = partition.opaque;
      draftWritesAllowedRef.current = true;
      hydratedRef.current = true;
      setDraftStoreLocked(false);
      setDraftStoreReady(true);

      const hasPendingSelected = pendingDraftSession() === selectedId;
      if (draftPayloadBlockedRef.current && selected) {
        const retryPayload = mergeAssessmentDraftStoreDelta(liveDrafts, {
          sessionId: selectedId,
          kind: "replace",
          value: draft,
        });
        if (retryPayload) {
          draftPayloadBlockedRef.current = false;
          setDraftPayloadBlocked(false);
          setDraftWriteLimitMessage("");
          scheduleDraftWrite({
            sessionId: selectedId,
            kind: "replace",
            value: draft,
          });
          return;
        }
      }
      if (hasPendingSelected) {
        if (selectedChanged) setDraftWriteLimitMessage(CROSS_TAB_DRAFT_WARNING);
        return;
      }
      draftPayloadBlockedRef.current = false;
      setDraftPayloadBlocked(false);
      setDraftWriteLimitMessage("");
      if (selected) setDraft(nextSelected ?? emptyDraft(selected));
    };
    window.addEventListener("storage", syncFromStorage);
    return () => window.removeEventListener("storage", syncFromStorage);
  }, [
    draft,
    entryById,
    entryBySession,
    pendingDraftSession,
    scheduleDraftWrite,
    selected,
    selectedId,
  ]);
  useEffect(() => {
    if (!selectedChunk || !selectedId || details[selectedId]) return;
    // Chunk đã ghép mà vẫn thiếu bài đang chọn nghĩa là dữ liệu lệch, không phải
    // chậm mạng. Dừng ở đây, nếu không effect sẽ gọi lại `setDetails` vô hạn.
    if (mergedChunksRef.current.has(selectedChunk)) return;
    let active = true;
    loadAssessmentChunk(selectedChunk)
      .then((loaded) => {
        // Ghép theo sessionId nên thứ tự phản hồi không quan trọng: hai chunk về
        // muộn/sớm khác nhau vẫn cho cùng một kết quả, không có state race.
        if (!active) return;
        mergedChunksRef.current.add(selectedChunk);
        setDetails((current) => ({ ...current, ...loaded }));
        setDetailError(
          loaded[selectedId]
            ? ""
            : "Dữ liệu tuần này không chứa phiên đang chọn. Hãy tải lại trang để lấy bản mới nhất.",
        );
      })
      .catch(() => {
        if (active) {
          setDetailError(
            "Không tải được nội dung chi tiết của tuần này. Bản nháp và lịch sử vẫn được giữ nguyên.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, [details, retryToken, selectedChunk, selectedId]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("vi");
    return catalog.filter((entry) => {
      const matchesKind = kind === "all" || entry.kind === kind;
      const matchesDomain = domain === "all" || entry.domain === domain;
      const haystack = `${entry.sessionId} ${entry.date} ${entry.title} ${entry.outcome} ${entry.domain}`.toLocaleLowerCase("vi");
      return matchesKind && matchesDomain && (!normalized || haystack.includes(normalized));
    });
  }, [catalog, domain, kind, query]);

  const latestStatusBySession = useMemo(() => {
    const result = new Map<string, AttemptStatus>();
    for (const attempt of attempts) {
      if (!result.has(attempt.sessionId)) result.set(attempt.sessionId, attempt.status);
    }
    return result;
  }, [attempts]);

  const selectedAttempts = selected
    ? attempts.filter((attempt) => attempt.sessionId === selected.sessionId)
    : [];
  const totalScore = totalScoreFor(draft.scores);
  const selectedRubric = selected ? rubricOf(selected) : null;
  const evidenceComplete = selected
    ? evidenceCompleteFor(draft, selected.retrievalCount)
    : false;
  const missingScoreCategories =
    selectedRubric ? missingSectionScoreCategories(draft.scores, selectedRubric) : [];
  const projectedStatus: AttemptStatus =
    selected && selectedRubric
      ? computedStatusFor(draft, selectedRubric, selected.retrievalCount)
      : "incomplete";
  const passedSessions = new Set(
    attempts.filter((attempt) => attempt.status === "passed").map((attempt) => attempt.sessionId),
  ).size;
  const interactionLocks = assessmentInteractionLocks(
    isImporting,
    attemptStoreReady,
    draftStoreReady && !draftPayloadBlocked,
  );

  if (!selected) {
    return <p className="empty-state">Không có assessment để hiển thị.</p>;
  }

  function setDraftBlocked(blocked: boolean, message = "") {
    draftPayloadBlockedRef.current = blocked;
    setDraftPayloadBlocked(blocked);
    setDraftWriteLimitMessage(message);
  }

  function lockDraftStore(message: string) {
    draftWritesAllowedRef.current = false;
    hydratedRef.current = false;
    setDraftStoreLocked(true);
    setDraftStoreReady(false);
    setDraftBlocked(true, message);
  }

  function readLiveDraftSnapshot(): {
    drafts: Readonly<Record<string, unknown>>;
    known: Record<string, AssessmentDraft>;
    opaque: Record<string, unknown>;
  } | null {
    const inspection = inspectAssessmentDraftStoreRaw(readRaw(DRAFTS_STORAGE_KEY));
    if (inspection.status === "invalid") {
      lockDraftStore(DRAFT_LIVE_INVALID_MESSAGE);
      return null;
    }
    const drafts = inspection.status === "valid" ? inspection.value : createUnknownRecord();
    const partition = partitionAssessmentDraftStore<AssessmentDraft>(
      drafts,
      (sessionId, candidate) => {
        const entry = entryBySession.get(sessionId);
        if (!entry) return { kind: "unknown" };
        const validDraft = parseAssessmentDraft(candidate, entry);
        return validDraft ? { kind: "known", value: validDraft } : { kind: "invalid" };
      },
    );
    if (partition.status === "invalid-known") {
      lockDraftStore(DRAFT_LIVE_INVALID_MESSAGE);
      return null;
    }
    draftWritesAllowedRef.current = true;
    hydratedRef.current = true;
    setDraftStoreLocked(false);
    setDraftStoreReady(true);
    draftsRef.current = partition.known;
    opaqueDraftsRef.current = partition.opaque;
    return { drafts, known: partition.known, opaque: partition.opaque };
  }

  function persistDraftDelta(delta: AssessmentDraftStoreDelta): string | null {
    const live = readLiveDraftSnapshot();
    if (!live) return DRAFT_LIVE_INVALID_MESSAGE;
    const payload = mergeAssessmentDraftStoreDelta(live.drafts, delta);
    if (!payload) {
      setDraftBlocked(true, DRAFT_WRITE_LIMIT_MESSAGE);
      return DRAFT_WRITE_LIMIT_MESSAGE;
    }
    const status = writeJson(DRAFTS_STORAGE_KEY, payload);
    if (status !== "ok") {
      const message = describeWriteStatus(status) ?? "Không lưu được bản nháp.";
      setDraftBlocked(true, message);
      return message;
    }
    const partition = partitionAssessmentDraftStore<AssessmentDraft>(
      payload.drafts,
      (sessionId, candidate) => {
        const entry = entryBySession.get(sessionId);
        if (!entry) return { kind: "unknown" };
        const validDraft = parseAssessmentDraft(candidate, entry);
        return validDraft ? { kind: "known", value: validDraft } : { kind: "invalid" };
      },
    );
    if (partition.status === "invalid-known") {
      lockDraftStore(DRAFT_LIVE_INVALID_MESSAGE);
      return DRAFT_LIVE_INVALID_MESSAGE;
    }
    draftsRef.current = partition.known;
    opaqueDraftsRef.current = partition.opaque;
    setDraftBlocked(false);
    return null;
  }

  function applyDraftUpdate(nextDraft: AssessmentDraft) {
    setDraft(nextDraft);
    if (importInFlightRef.current || !selectedId) return;
    const live = readLiveDraftSnapshot();
    if (!live) return;
    const delta: AssessmentDraftStoreDelta = {
      sessionId: selectedId,
      kind: "replace",
      value: nextDraft,
    };
    const payload = mergeAssessmentDraftStoreDelta(live.drafts, delta);
    if (!payload) {
      setDraftBlocked(true, DRAFT_WRITE_LIMIT_MESSAGE);
      return;
    }
    const partition = partitionAssessmentDraftStore<AssessmentDraft>(
      payload.drafts,
      (sessionId, candidate) => {
        const entry = entryBySession.get(sessionId);
        if (!entry) return { kind: "unknown" };
        const validDraft = parseAssessmentDraft(candidate, entry);
        return validDraft ? { kind: "known", value: validDraft } : { kind: "invalid" };
      },
    );
    if (partition.status === "invalid-known") {
      lockDraftStore(DRAFT_LIVE_INVALID_MESSAGE);
      return;
    }
    draftsRef.current = partition.known;
    opaqueDraftsRef.current = partition.opaque;
    setDraftBlocked(false);
    scheduleDraftWrite(delta);
  }

  /** Chuyển bài chỉ sau khi delta đang chờ đã được ghép vào snapshot live. */
  function chooseAssessment(entry: AssessmentCatalogEntry) {
    if (importInFlightRef.current) return;
    flushDraftWrite();
    if (draftPayloadBlockedRef.current) {
      setSaveMessage(
        "Không thể đổi phiên vì bản nháp hiện tại chưa lưu an toàn. Hãy thu gọn nội dung hoặc nộp attempt trước.",
      );
      return;
    }
    const live = readLiveDraftSnapshot();
    setSelectedId(entry.sessionId);
    setDraft(live?.known[entry.sessionId] ?? emptyDraft(entry));
    setSaveMessage("");
    const url = new URL(window.location.href);
    url.searchParams.set("session", entry.sessionId);
    window.history.replaceState({}, "", url);
  }

  function updateRetrieval(index: number, value: string) {
    const retrievalAnswers = [...draft.retrievalAnswers];
    retrievalAnswers[index] = capAssessmentString(value);
    applyDraftUpdate({ ...draft, retrievalAnswers });
  }

  function updateScore(
    category: keyof AssessmentScoreWeights,
    rawValue: string,
    maximum: number,
  ) {
    const numeric = Number(rawValue);
    const score = Number.isFinite(numeric)
      ? Math.min(maximum, Math.max(0, numeric))
      : 0;
    applyDraftUpdate({
      ...draft,
      scores: { ...draft.scores, [category]: score },
    });
  }

  function lockAttemptStore(message: string) {
    attemptWritesAllowedRef.current = false;
    setAttemptStoreLocked(true);
    setAttemptStoreReady(false);
    setTransferMessage(message);
  }

  function readLiveAttemptSnapshot(): readonly unknown[] | null {
    const inspection = inspectAssessmentAttemptsStoreRaw(readRaw(STORAGE_KEY));
    if (inspection.status === "invalid") {
      lockAttemptStore(ATTEMPT_LIVE_INVALID_MESSAGE);
      return null;
    }
    const candidates = inspection.status === "valid" ? inspection.value : [];
    const partition = partitionAssessmentAttempts(candidates, entryById);
    attemptsRef.current = partition.known;
    unreadableRef.current = partition.opaque;
    attemptWritesAllowedRef.current = true;
    setAttempts(partition.known);
    setAttemptStoreLocked(false);
    setAttemptStoreReady(true);
    return candidates;
  }

  function saveAttempt(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (importInFlightRef.current) {
      setSaveMessage("Đang nhập backup; hãy đợi hợp nhất xong rồi lưu attempt.");
      return;
    }
    const liveAttempts = readLiveAttemptSnapshot();
    if (!liveAttempts) {
      setSaveMessage(
        "Không lưu attempt: kho lịch sử live không hydrate an toàn nên trang đã khóa ghi để tránh mất dữ liệu.",
      );
      return;
    }

    const timestamp = new Date().toISOString();
    const attempt: StoredAttempt = {
      ...draft,
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${selected.sessionId}-${timestamp}-${liveAttempts.length}`,
      assessmentId: selected.id,
      sessionId: selected.sessionId,
      timestamp,
      score: totalScore,
      threshold: selected.minimumScore,
      status: projectedStatus,
      rubricSnapshot: {
        version: 1,
        weights: { ...selected.scoreWeights },
        minimumScore: selected.minimumScore,
        minimumSectionScores: { ...selected.minimumSectionScores },
      },
    };
    const merged = mergeAssessmentAttemptStoreValues(
      liveAttempts,
      [attempt],
      (candidate) => assessmentAttemptIdentity(candidate, entryById),
    );
    if (!merged) {
      setSaveMessage(
        "Không thể lưu thêm: kho Assessment sẽ vượt giới hạn 10.000 attempt, 5 MiB hoặc 120.000 node. Dữ liệu live vẫn nguyên.",
      );
      return;
    }
    if (merged.added.length === 0) {
      setSaveMessage("Attempt này đã tồn tại trong kho live nên không ghi hoặc cộng tiến độ lần nữa.");
      return;
    }

    const partition = partitionAssessmentAttempts(merged.value, entryById);
    const persistedPayload = [...partition.known, ...partition.opaque];
    if (!isAssessmentAttemptsStoreValueSafe(persistedPayload)) {
      setSaveMessage("Không lưu attempt: payload sau hợp nhất không còn nằm trong giới hạn an toàn.");
      return;
    }
    const status = writeJson(STORAGE_KEY, persistedPayload);
    if (status !== "ok") {
      setSaveMessage(
        describeWriteStatus(status) ?? "Không thể ghi attempt vào bộ nhớ trình duyệt này.",
      );
      return;
    }

    attemptsRef.current = partition.known;
    unreadableRef.current = partition.opaque;
    setAttempts(partition.known);
    let message =
      projectedStatus === "passed"
        ? `Đã lưu pass tự đánh giá lúc ${new Date(timestamp).toLocaleString("vi-VN")}.`
        : `Đã lưu attempt ở trạng thái “${statusLabel(projectedStatus)}”.`;
    if (attempt.status === "passed") {
      const progressResult = markSessionCompleted(attempt.sessionId);
      if (progressResult.status !== "ok") message += progressSyncWarning(progressResult.status);
    }

    if (draftWritesAllowedRef.current) {
      scheduleDraftWrite({ sessionId: selected.sessionId, kind: "remove" });
      flushDraftWrite();
      if (draftPayloadBlockedRef.current) {
        message += " Cảnh báo: attempt đã lưu nhưng bản nháp chưa được xóa an toàn.";
      }
    }
    setSaveMessage(message);
  }
  function exportAttempts() {
    if (importInFlightRef.current) return;
    flushDraftWrite();
    if (draftPayloadBlockedRef.current) {
      setTransferMessage(
        "Không thể xuất backup chuẩn vì có bản nháp chưa lưu an toàn. Dữ liệu local cũ vẫn nguyên.",
      );
      return;
    }
    const liveAttempts = readLiveAttemptSnapshot();
    const liveDrafts = readLiveDraftSnapshot();
    if (!liveAttempts || !liveDrafts) {
      setTransferMessage(
        "Không thể xuất backup chuẩn: một kho local live không hydrate an toàn. Dữ liệu local cũ vẫn còn nguyên và chưa bị ghi đè.",
      );
      return;
    }
    const payload = {
      format: ASSESSMENT_TRANSFER_FORMAT,
      version: ASSESSMENT_TRANSFER_VERSION,
      exportedAt: new Date().toISOString(),
      note: "Bằng chứng formative/manual; trạng thái pass tự chấm không tự động chứng minh tính đúng của code.",
      attempts: liveAttempts,
      drafts: liveDrafts.drafts,
    };
    const serialized = serializeAssessmentTransferPayload(payload);
    if (!serialized) {
      setTransferMessage(
        "Không thể xuất backup chuẩn: dữ liệu live vượt contract nhập lại an toàn. Dữ liệu local vẫn nguyên.",
      );
      return;
    }
    const url = URL.createObjectURL(
      new Blob([serialized], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "voai-assessment-backup.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }
  async function importBackup(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file || importInFlightRef.current) return;
    importInFlightRef.current = true;
    setIsImporting(true);
    setTransferMessage("Đang kiểm tra và hợp nhất backup…");
    flushDraftWrite();

    try {
      if (draftPayloadBlockedRef.current) {
        setTransferMessage(
          "Không thể nhập lúc này vì bản nháp đang gõ chưa lưu an toàn. Dữ liệu local và file backup đều chưa bị thay đổi.",
        );
        return;
      }
      if (file.size === 0 || file.size > MAX_ASSESSMENT_IMPORT_BYTES) {
        setTransferMessage(
          "Không nhập file: backup phải lớn hơn 0 B và nằm trong giới hạn dung lượng Assessment.",
        );
        return;
      }
      const envelope = parseAssessmentTransferJson(await file.text());
      if (!envelope) {
        setTransferMessage("Không nhập file: JSON không đúng định dạng backup Assessment v1/v2.");
        return;
      }

      // Đọc lại sau await để không dùng closure/snapshot trước khi tab khác vừa ghi.
      const liveAttemptValues = readLiveAttemptSnapshot();
      const liveDraftSnapshot = readLiveDraftSnapshot();
      if (!liveAttemptValues || !liveDraftSnapshot) {
        setTransferMessage(
          "Không thể hợp nhất: một kho local live không hydrate an toàn. Dữ liệu cũ và file nhập đều được giữ nguyên.",
        );
        return;
      }

      const incomingAttemptValues: unknown[] = [];
      const incomingAttemptSeen = new Set<string>();
      let rejectedAttempts = 0;
      let duplicateAttempts = 0;
      for (const candidate of envelope.attempts) {
        const identity = assessmentAttemptIdentity(candidate, entryById);
        if (identity === null) {
          rejectedAttempts += 1;
          continue;
        }
        if (incomingAttemptSeen.has(identity)) {
          duplicateAttempts += 1;
          continue;
        }
        incomingAttemptSeen.add(identity);
        incomingAttemptValues.push(candidate);
      }

      let attemptsStatus: ReturnType<typeof writeJson> = "ok";
      let persistedKnownAttempts: StoredAttempt[] = [];
      let persistedOpaqueAttempts = 0;
      if (incomingAttemptValues.length > 0) {
        const merged = mergeAssessmentAttemptStoreValues(
          liveAttemptValues,
          incomingAttemptValues,
          (candidate) => assessmentAttemptIdentity(candidate, entryById),
        );
        if (!merged) {
          attemptsStatus = "failed";
          rejectedAttempts += incomingAttemptValues.length;
        } else {
          duplicateAttempts += incomingAttemptValues.length - merged.added.length;
          const mergedPartition = partitionAssessmentAttempts(merged.value, entryById);
          const payload = [...mergedPartition.known, ...mergedPartition.opaque];
          if (!isAssessmentAttemptsStoreValueSafe(payload)) {
            attemptsStatus = "failed";
          } else if (merged.added.length > 0) {
            attemptsStatus = writeJson(STORAGE_KEY, payload);
            if (attemptsStatus === "ok") {
              attemptsRef.current = mergedPartition.known;
              unreadableRef.current = mergedPartition.opaque;
              setAttempts(mergedPartition.known);
              persistedKnownAttempts = merged.added.filter(
                (candidate): candidate is StoredAttempt =>
                  isStoredAttempt(candidate, entryById),
              );
              persistedOpaqueAttempts = merged.added.length - persistedKnownAttempts.length;
            }
          }
        }
      }

      // Chỉ pass mới, không trùng, và đã ghi thành công mới được nối sang Lộ trình.
      let progressSyncFailures = 0;
      if (attemptsStatus === "ok") {
        const passedImportedSessions = new Set(
          persistedKnownAttempts
            .filter((attempt) => attempt.status === "passed")
            .map((attempt) => attempt.sessionId),
        );
        for (const sessionId of passedImportedSessions) {
          const progressResult = markSessionCompleted(sessionId);
          if (progressResult.status !== "ok") progressSyncFailures += 1;
        }
      }

      let nextDraftPayload = {
        version: 1 as const,
        drafts: liveDraftSnapshot.drafts as Record<string, unknown>,
      };
      let importedDrafts = 0;
      let replacedEmptyDrafts = 0;
      let importedOpaqueDrafts = 0;
      let rejectedDrafts = 0;
      let duplicateDrafts = 0;
      let selectedDraftChanged = false;

      if (envelope.drafts) {
        for (const [sessionId, candidate] of Object.entries(envelope.drafts)) {
          const entry = entryBySession.get(sessionId);
          const hasLocal = Object.hasOwn(nextDraftPayload.drafts, sessionId);
          if (entry) {
            const validDraft = parseAssessmentDraft(candidate, entry);
            if (!validDraft) {
              rejectedDrafts += 1;
              continue;
            }
            const localCandidate = hasLocal ? nextDraftPayload.drafts[sessionId] : undefined;
            if (hasLocal && !shouldAcceptImportedAssessmentDraft(localCandidate, validDraft)) {
              duplicateDrafts += 1;
              continue;
            }
            const merged = mergeAssessmentDraftStoreDelta(nextDraftPayload.drafts, {
              sessionId,
              kind: "replace",
              value: validDraft,
            });
            if (!merged) {
              rejectedDrafts += 1;
              continue;
            }
            nextDraftPayload = merged;
            importedDrafts += 1;
            if (hasLocal) replacedEmptyDrafts += 1;
            if (sessionId === selected.sessionId) selectedDraftChanged = true;
            continue;
          }

          if (hasLocal) {
            duplicateDrafts += 1;
            continue;
          }
          const merged = mergeAssessmentDraftStoreDelta(nextDraftPayload.drafts, {
            sessionId,
            kind: "replace",
            value: candidate,
          });
          if (!merged) {
            rejectedDrafts += 1;
            continue;
          }
          nextDraftPayload = merged;
          importedOpaqueDrafts += 1;
        }
      }

      const draftAdditions = importedDrafts + importedOpaqueDrafts;
      let draftsStatus: ReturnType<typeof writeJson> = "ok";
      if (draftAdditions > 0) {
        draftsStatus = writeJson(DRAFTS_STORAGE_KEY, nextDraftPayload);
        if (draftsStatus === "ok") {
          const partition = partitionAssessmentDraftStore<AssessmentDraft>(
            nextDraftPayload.drafts,
            (sessionId, candidate) => {
              const entry = entryBySession.get(sessionId);
              if (!entry) return { kind: "unknown" };
              const validDraft = parseAssessmentDraft(candidate, entry);
              return validDraft
                ? { kind: "known", value: validDraft }
                : { kind: "invalid" };
            },
          );
          if (partition.status === "invalid-known") {
            draftsStatus = "failed";
            lockDraftStore(DRAFT_LIVE_INVALID_MESSAGE);
          } else {
            draftsRef.current = partition.known;
            opaqueDraftsRef.current = partition.opaque;
            setDraftBlocked(false);
            if (selectedDraftChanged) {
              setDraft(partition.known[selected.sessionId] ?? emptyDraft(selected));
            }
          }
        }
      }

      const persistedAttempts =
        attemptsStatus === "ok"
          ? persistedKnownAttempts.length + persistedOpaqueAttempts
          : 0;
      const persistedDrafts = draftsStatus === "ok" ? draftAdditions : 0;
      const failures: string[] = [];
      if (attemptsStatus !== "ok") {
        failures.push(
          `attempt chưa được lưu: ${describeWriteStatus(attemptsStatus) ?? "lỗi bộ nhớ"}`,
        );
      }
      if (draftsStatus !== "ok") {
        failures.push(
          `bản nháp chưa được lưu: ${describeWriteStatus(draftsStatus) ?? "lỗi bộ nhớ"}`,
        );
      }

      let message: string;
      if (failures.length > 0) {
        message =
          `Khôi phục chưa hoàn tất; đã lưu ${persistedAttempts} attempt và ${persistedDrafts} bản nháp. ` +
          failures.join("; ");
      } else if (persistedAttempts + persistedDrafts === 0) {
        message = "Không có dữ liệu mới để hợp nhất.";
      } else {
        message =
          `Đã hợp nhất ${persistedKnownAttempts.length} attempt nhận diện được, ` +
          `${importedDrafts} bản nháp hiện hành; giữ nguyên ${persistedOpaqueAttempts} attempt ` +
          `và ${importedOpaqueDrafts} bản nháp archived ở dạng chưa nhận diện.`;
      }
      if (replacedEmptyDrafts > 0 && draftsStatus === "ok") {
        message += ` Đã khôi phục ${replacedEmptyDrafts} bản nháp thật thay cho form rỗng tự tạo.`;
      }
      const ignoredCount =
        rejectedAttempts + duplicateAttempts + rejectedDrafts + duplicateDrafts;
      if (ignoredCount > 0) {
        message += ` Bỏ qua ${ignoredCount} mục hỏng, xung đột hoặc đã có.`;
      }
      if (progressSyncFailures > 0) {
        message +=
          ` Cảnh báo: ${progressSyncFailures} phiên pass đã lưu nhưng chưa đồng bộ sang tiến độ Lộ trình.`;
      }
      setTransferMessage(message);
    } catch {
      setTransferMessage("Không đọc được file backup. Dữ liệu hiện tại vẫn được giữ nguyên.");
    } finally {
      importInFlightRef.current = false;
      setIsImporting(false);
      input.value = "";
    }
  }
  return (
    <section
      className="assessment-app"
      aria-label="Hệ thống assessment 290 phiên"
      aria-busy={isImporting || undefined}
    >
      <div className="assessment-overview">
        <div>
          <span>NGÂN HÀNG ĐÁNH GIÁ</span>
          <strong>{catalog.length}/{catalog.length} phiên</strong>
        </div>
        <div>
          <span>PASS TỰ ĐÁNH GIÁ</span>
          <strong>{passedSessions}/{catalog.length}</strong>
        </div>
        <div>
          <span>ATTEMPT TRÊN THIẾT BỊ</span>
          <strong>{attempts.length}</strong>
        </div>
        <button type="button" onClick={exportAttempts} disabled={interactionLocks.exportLocked}>
          Xuất attempts JSON (kèm bản nháp)
        </button>
        <button
          type="button"
          onClick={() => importInputRef.current?.click()}
          aria-controls="assessment-import-input"
          disabled={isImporting}
        >
          Nhập &amp; hợp nhất JSON
        </button>
        <input
          ref={importInputRef}
          id="assessment-import-input"
          type="file"
          accept=".json,application/json"
          hidden
          disabled={isImporting}
          onChange={importBackup}
        />
      </div>
      {transferMessage && (
        <p
          className="save-message"
          id="assessment-transfer-message"
          role="status"
          aria-live="polite"
        >
          {transferMessage}
        </p>
      )}
      {(attemptStoreLocked || draftStoreLocked) && (
        <p className="storage-notice" role="alert" aria-live="assertive">
          Dữ liệu Assessment hiện có không đọc được hoặc vượt giới hạn. Trang đã khóa ghi
          {attemptStoreLocked && draftStoreLocked
            ? " lịch sử attempt và bản nháp"
            : attemptStoreLocked
              ? " lịch sử attempt"
              : " bản nháp"}
          {" "}để không ghi đè dữ liệu cũ. Dữ liệu local cũ vẫn còn nguyên, nhưng trang không
          thể xuất backup chuẩn cho đến khi kho này được xử lý. Hãy giữ nguyên dữ liệu trình duyệt
          và dùng backup gần nhất.
        </p>
      )}
      {draftWriteLimitMessage && (
        <p className="storage-notice" role="alert" aria-live="assertive">
          {draftWriteLimitMessage}
        </p>
      )}

      <div className="assessment-shell">
        <aside className="assessment-catalog" aria-label="Danh sách assessment">
          <div className="assessment-filters">
            <label>
              <span>Tìm phiên</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Thuật toán, mục tiêu, ID…"
              />
            </label>
            <div>
              <label>
                <span>Loại</span>
                <select value={kind} onChange={(event) => setKind(event.target.value)}>
                  <option value="all">Tất cả</option>
                  <option value="lesson">Bài học</option>
                  <option value="lab">Lab</option>
                  <option value="checkpoint">Checkpoint</option>
                  <option value="finale">Tổng kết</option>
                </select>
              </label>
              <label>
                <span>Lĩnh vực</span>
                <select value={domain} onChange={(event) => setDomain(event.target.value)}>
                  <option value="all">Tất cả</option>
                  {domains.map((item) => (
                    <option value={item} key={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p>{filtered.length}/{catalog.length} phiên khớp bộ lọc</p>
          </div>
          <div className="assessment-list">
            {filtered.map((entry) => {
              const latestStatus = latestStatusBySession.get(entry.sessionId);
              const active = entry.sessionId === selected.sessionId;
              return (
                <button
                  type="button"
                  key={entry.id}
                  data-assessment-item={entry.sessionId}
                  className={active ? "active" : ""}
                  aria-current={active ? "true" : undefined}
                  disabled={isImporting}
                  onClick={() => chooseAssessment(entry)}
                >
                  <span>
                    #{entry.ordinal} · {entry.date}
                  </span>
                  <strong>{entry.title}</strong>
                  <small>
                    {entry.domain} · {kindLabels[entry.kind]}
                    {latestStatus ? ` · ${statusLabel(latestStatus)}` : ""}
                  </small>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="empty-state">Không có phiên nào khớp bộ lọc.</p>
            )}
          </div>
        </aside>

        <article className="assessment-workspace" id={selected.id}>
          <header className="assessment-heading">
            <div className="assessment-tags">
              <span>Ngày {selected.ordinal}/290</span>
              <span>{selected.date}</span>
              <span>{selected.domain}</span>
              <span>{kindLabels[selected.kind]}</span>
            </div>
            <h2>{selected.title}</h2>
            <p>{selected.outcome}</p>
            <div className="manual-evidence-note" role="note">
              <strong>Formative/manual evidence</strong>
              <span>
                Điểm và pass ở đây là tự chấm dựa trên bằng chứng. Chúng không tự động chứng
                minh code đúng; correctness cần grader, review hoặc oral defense độc lập.
              </span>
            </div>
          </header>

          {!selectedDetail ? (
            <section className="assessment-detail-pending" aria-live="polite">
              {detailError ? (
                <>
                  <p className="save-message" role="status">
                    {detailError}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      // Mở lại cửa cho chunk này rồi kích hoạt effect: thất bại
                      // mạng không bị nhớ nên lần này sẽ fetch thật.
                      mergedChunksRef.current.delete(selected.chunk);
                      setRetryToken((token) => token + 1);
                    }}
                  >
                    Thử tải lại
                  </button>
                </>
              ) : (
                <p role="status">Đang tải đề bài và rubric chi tiết của phiên này…</p>
              )}
            </section>
          ) : (
            <>
              <section className="assessment-brief" aria-labelledby="coding-task-title">
                <p className="eyebrow">NHIỆM VỤ TỰ CODE</p>
                <h3 id="coding-task-title">Coding task</h3>
                <p>{selectedDetail.codingTask}</p>
                <div className="assessment-criteria-grid">
                  <details open>
                    <summary>Tiêu chí công khai ({selectedDetail.visibleCriteria.length})</summary>
                    <ul>
                      {selectedDetail.visibleCriteria.map((criterion) => (
                        <li key={criterion}>{criterion}</li>
                      ))}
                    </ul>
                  </details>
                  <details>
                    <summary>
                      Nhóm test ẩn ({selectedDetail.hiddenTestCategories.length})
                    </summary>
                    <p>
                      Chỉ công bố nhóm rủi ro; trang này không nhận test case, input hay expected
                      output ẩn.
                    </p>
                    <ul>
                      {selectedDetail.hiddenTestCategories.map((category) => (
                        <li key={category}>{category}</li>
                      ))}
                    </ul>
                  </details>
                </div>
              </section>

              <form
                className="assessment-form"
                onSubmit={saveAttempt}
                inert={interactionLocks.formLocked}
                aria-busy={interactionLocks.formLocked}
              >
                <section>
                  <div className="form-section-title">
                    <span>01</span>
                    <div>
                      <h3>Retrieval trước khi mở tài liệu</h3>
                      <p>Viết câu trả lời ban đầu; nếu sửa sau khi chạy code, ghi phần sửa riêng.</p>
                    </div>
                  </div>
                  <div className="retrieval-fields">
                    {selectedDetail.retrievalQuestions.map((question, index) => (
                      <label key={question}>
                        <span>
                          Câu {index + 1}. {question}
                        </span>
                        <textarea
                          required
                          maxLength={MAX_OPAQUE_STRING_LENGTH}
                          value={draft.retrievalAnswers[index] ?? ""}
                          onChange={(event) => updateRetrieval(index, event.target.value)}
                          rows={4}
                          placeholder="Câu trả lời của mình…"
                        />
                      </label>
                    ))}
                  </div>
                  <EssayCoach retrievalAnswers={draft.retrievalAnswers} />
                </section>

                <section>
                  <div className="form-section-title">
                    <span>02</span>
                    <div>
                      <h3>Bằng chứng code</h3>
                      <p>Dán mô tả commit/file, đoạn code cốt lõi hoặc test log do chính bạn tạo.</p>
                    </div>
                  </div>
                  <label className="wide-field">
                    <span>Bằng chứng code/test bắt buộc</span>
                    <textarea
                      required
                      rows={8}
                      maxLength={MAX_OPAQUE_STRING_LENGTH}
                      value={draft.codeEvidence}
                      onChange={(event) =>
                        applyDraftUpdate({
                          ...draft,
                          codeEvidence: capAssessmentString(event.target.value),
                        })
                      }
                      placeholder="File/hàm đã viết, lệnh chạy, test đã tạo và kết quả…"
                    />
                  </label>
                  <label className="wide-field">
                    <span>Link notebook/repository/commit (không bắt buộc)</span>
                    <input
                      type="url"
                      maxLength={MAX_OPAQUE_STRING_LENGTH}
                      value={draft.evidenceLink}
                      onChange={(event) =>
                        applyDraftUpdate({
                          ...draft,
                          evidenceLink: capAssessmentString(event.target.value),
                        })
                      }
                      placeholder="https://…"
                    />
                  </label>
                </section>

                <section>
                  <div className="form-section-title">
                    <span>03</span>
                    <div>
                      <h3>Giải thích bằng lời của bạn</h3>
                      <p>{selectedDetail.explainPrompt}</p>
                    </div>
                  </div>
                  <label className="wide-field">
                    <span>Phần bảo vệ bắt buộc</span>
                    <textarea
                      required
                      rows={8}
                      maxLength={MAX_OPAQUE_STRING_LENGTH}
                      value={draft.explanation}
                      onChange={(event) =>
                        applyDraftUpdate({
                          ...draft,
                          explanation: capAssessmentString(event.target.value),
                        })
                      }
                      placeholder="Data flow/shape, lý do, test biên, chi phí và failure mode…"
                    />
                  </label>
                </section>

                <section>
                  <div className="form-section-title">
                    <span>04</span>
                    <div>
                      <h3>Tự chấm theo rubric</h3>
                      <p>
                        Đây là self-score thủ công. Tổng phải đạt {selected.minimumScore}/100
                        và từng hạng mục phải đạt điểm sàn mới có thể ghi pass.
                      </p>
                    </div>
                  </div>
                  <div className="score-grid">
                    {(Object.keys(selected.scoreWeights) as Array<keyof AssessmentScoreWeights>).map(
                      (category) => (
                        <label key={category}>
                          <span>{scoreLabels[category]}</span>
                          <input
                            type="number"
                            min={0}
                            max={selected.scoreWeights[category]}
                            step={1}
                            value={draft.scores[category]}
                            onChange={(event) =>
                              updateScore(
                                category,
                                event.target.value,
                                selected.scoreWeights[category],
                              )
                            }
                          />
                          <small>
                            / {selected.scoreWeights[category]} · sàn{" "}
                            {selected.minimumSectionScores[category]}
                          </small>
                        </label>
                      ),
                    )}
                  </div>

                  <div className="assessment-confirmations">
                    <label>
                      <input
                        type="checkbox"
                        required
                        checked={draft.soloConfirmed}
                        onChange={(event) =>
                          applyDraftUpdate({
                            ...draft,
                            soloConfirmed: event.target.checked,
                          })
                        }
                      />
                      <span>Tôi đã tự làm phần cốt lõi theo SOLO-90; AI chỉ kiểm tra/gợi mở.</span>
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        required
                        checked={draft.noAutomaticFailConfirmed}
                        onChange={(event) =>
                          applyDraftUpdate({
                            ...draft,
                            noAutomaticFailConfirmed: event.target.checked,
                          })
                        }
                      />
                      <span>Tôi đã rà các điều kiện tự động trượt và chưa phát hiện vi phạm.</span>
                    </label>
                  </div>

                  <details className="pass-rules">
                    <summary>Quy tắc pass, auto-fail và mastery</summary>
                    <h4>Phần bắt buộc</h4>
                    <ul>
                      {selectedDetail.passRule.requiredSections.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <h4>Tự động trượt</h4>
                    <ul>
                      {selectedDetail.passRule.automaticFailConditions.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <p>
                      <strong>Thi lại:</strong> {selectedDetail.passRule.retryRule}
                    </p>
                    <p>
                      <strong>Mastery {selectedDetail.mastery.minimumScore}/100:</strong>{" "}
                      {selectedDetail.mastery.delayedTransferCheck}
                    </p>
                  </details>

                  <div className="attempt-submit">
                    <div>
                      <span>TỔNG ĐIỂM TỰ CHẤM</span>
                      <strong>
                        {totalScore}/100 · {statusLabel(projectedStatus)}
                      </strong>
                      {!evidenceComplete && <small>Điền đủ bằng chứng và hai xác nhận để xét pass.</small>}
                      {evidenceComplete && totalScore < selected.minimumScore && (
                        <small>Còn thiếu {selected.minimumScore - totalScore} điểm để xét pass.</small>
                      )}
                      {evidenceComplete && missingScoreCategories.length > 0 && (
                        <small>
                          Chưa đạt sàn: {missingScoreCategories.map((category) =>
                            `${scoreLabels[category]} ${draft.scores[category]}/${selected.minimumSectionScores[category]}`,
                          ).join("; ")}.
                        </small>
                      )}
                    </div>
                    <button type="submit" disabled={isImporting}>
                      {isImporting ? "Đang nhập backup…" : "Lưu attempt trên thiết bị"}
                    </button>
                  </div>
                  {draftNotice && (
                    <p className="storage-notice" role="status">
                      {draftNotice} Bản nháp đang gõ có thể mất khi bạn rời trang.
                    </p>
                  )}
                  {saveMessage && (
                    <p className="save-message" role="status">
                      {saveMessage}
                    </p>
                  )}
                </section>
              </form>
            </>
          )}

          <section className="attempt-history" aria-labelledby="attempt-history-title">
            <div>
              <p className="eyebrow">LỊCH SỬ CỤC BỘ</p>
              <h3 id="attempt-history-title">Attempts cho {selected.sessionId}</h3>
            </div>
            {selectedAttempts.length === 0 ? (
              <p>Chưa có attempt nào trên thiết bị này.</p>
            ) : (
              <ol>
                {selectedAttempts.map((attempt) => (
                  <li key={attempt.id}>
                    <span>{new Date(attempt.timestamp).toLocaleString("vi-VN")}</span>
                    <strong>
                      {attempt.score}/{attempt.threshold} · {statusLabel(attempt.status)}
                    </strong>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </article>
      </div>
    </section>
  );
}
