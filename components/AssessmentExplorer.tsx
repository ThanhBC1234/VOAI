"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { describeWriteStatus, readJson, writeJson } from "../lib/local-storage";
import { loadAssessmentChunk, type AssessmentDetailMap } from "../lib/assessment-details";
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
  /** Attempt cũ chưa diễn giải được bằng rubric hiện tại; luôn được ghi lại kèm. */
  const unreadableRef = useRef<unknown[]>([]);
  /** Chunk đã ghép vào `details`; chặn cả tải trùng lẫn vòng lặp effect. */
  const mergedChunksRef = useRef<Set<string>>(new Set());
  const entryById = useMemo(
    () => new Map(catalog.map((entry) => [entry.id, entry])),
    [catalog],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const requestedSession = new URLSearchParams(window.location.search).get("session");
      const requestedAssessment = catalog.find(
        (entry) => entry.sessionId === requestedSession,
      );
      // Khôi phục kho nháp trước, để deep link không ghi đè bản đang gõ dở.
      const stored = readJson<Record<string, AssessmentDraft>>(
        DRAFTS_STORAGE_KEY,
        (value) => {
          if (typeof value !== "object" || value === null) return null;
          const record = value as { version?: unknown; drafts?: unknown };
          if (record.version !== 1) return null;
          if (typeof record.drafts !== "object" || record.drafts === null) return null;
          return record.drafts as Record<string, AssessmentDraft>;
        },
        {},
      );
      draftsRef.current = stored;
      const target = requestedAssessment ?? initialAssessment;
      if (!target) return;
      setSelectedId(target.sessionId);
      setDraft(draftsRef.current[target.sessionId] ?? emptyDraft(target));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [catalog, initialAssessment]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      // ASSESS-P2-02: chỉ *đọc* ở đây. Bản ghi không nhận diện được (ví dụ vì
      // rubric đã đổi giữa hai lần phát hành) được giữ nguyên trong storage và
      // cất vào `unreadableRef`, thay vì bị lọc rồi ghi đè mất vĩnh viễn.
      const candidates = readJson<unknown[]>(
        STORAGE_KEY,
        (value) => (Array.isArray(value) ? value : null),
        [],
      );
      const seenAttemptIds = new Set<string>();
      const validAttempts: StoredAttempt[] = [];
      const unreadable: unknown[] = [];
      for (const candidate of candidates) {
        if (isStoredAttempt(candidate, entryById) && !seenAttemptIds.has(candidate.id)) {
          seenAttemptIds.add(candidate.id);
          validAttempts.push(candidate);
        } else {
          unreadable.push(candidate);
        }
      }
      unreadableRef.current = unreadable;
      setAttempts(validAttempts);
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

  if (!selected) {
    return <p className="empty-state">Không có assessment để hiển thị.</p>;
  }

  /**
   * Chuyển assessment **không** được xoá bản nháp đang gõ. Nháp của bài hiện tại
   * được cất vào kho theo sessionId, rồi nạp lại nháp của bài đích nếu có.
   */
  function chooseAssessment(entry: AssessmentCatalogEntry) {
    draftsRef.current = { ...draftsRef.current, [selectedId]: draft };
    writeJson(DRAFTS_STORAGE_KEY, { version: 1, drafts: draftsRef.current });
    setSelectedId(entry.sessionId);
    setDraft(draftsRef.current[entry.sessionId] ?? emptyDraft(entry));
    setSaveMessage("");
    const url = new URL(window.location.href);
    url.searchParams.set("session", entry.sessionId);
    window.history.replaceState({}, "", url);
  }

  function updateRetrieval(index: number, value: string) {
    setDraft((current) => {
      const retrievalAnswers = [...current.retrievalAnswers];
      retrievalAnswers[index] = value;
      return { ...current, retrievalAnswers };
    });
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
    setDraft((current) => ({
      ...current,
      scores: { ...current.scores, [category]: score },
    }));
  }

  function saveAttempt(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const timestamp = new Date().toISOString();
    const attempt: StoredAttempt = {
      ...draft,
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${selected.sessionId}-${timestamp}-${attempts.length}`,
      assessmentId: selected.id,
      sessionId: selected.sessionId,
      timestamp,
      score: totalScore,
      threshold: selected.minimumScore,
      status: projectedStatus,
      // Snapshot bất biến của rubric tại thời điểm nộp: lịch sử không bao giờ
      // bị diễn giải lại bằng rubric của một phiên bản nội dung khác.
      rubricSnapshot: {
        version: 1,
        weights: { ...selected.scoreWeights },
        minimumScore: selected.minimumScore,
        minimumSectionScores: { ...selected.minimumSectionScores },
      },
    };
    const nextAttempts = [attempt, ...attempts];
    // Ghi kèm cả bản ghi chưa đọc được để không xoá lịch sử của người học.
    const status = writeJson(STORAGE_KEY, [...nextAttempts, ...unreadableRef.current]);
    if (status === "ok") {
      setAttempts(nextAttempts);
      setSaveMessage(
        projectedStatus === "passed"
          ? `Đã lưu pass tự đánh giá lúc ${new Date(timestamp).toLocaleString("vi-VN")}.`
          : `Đã lưu attempt ở trạng thái “${statusLabel(projectedStatus)}”.`,
      );
      // Nộp xong thì bản nháp của bài này không còn cần giữ.
      const remaining = { ...draftsRef.current };
      delete remaining[selected.sessionId];
      draftsRef.current = remaining;
      writeJson(DRAFTS_STORAGE_KEY, { version: 1, drafts: remaining });
    } else {
      setSaveMessage(
        describeWriteStatus(status) ?? "Không thể ghi attempt vào bộ nhớ trình duyệt này.",
      );
    }
  }

  function exportAttempts() {
    const payload = {
      format: "voai-assessment-attempts",
      version: 1,
      exportedAt: new Date().toISOString(),
      note: "Bằng chứng formative/manual; trạng thái pass tự chấm không tự động chứng minh tính đúng của code.",
      attempts,
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "voai-assessment-attempts.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return (
    <section className="assessment-app" aria-label="Hệ thống assessment 290 phiên">
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
        <button type="button" onClick={exportAttempts} disabled={attempts.length === 0}>
          Xuất attempts JSON
        </button>
      </div>

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

              <form className="assessment-form" onSubmit={saveAttempt}>
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
                          value={draft.retrievalAnswers[index] ?? ""}
                          onChange={(event) => updateRetrieval(index, event.target.value)}
                          rows={4}
                          placeholder="Câu trả lời của mình…"
                        />
                      </label>
                    ))}
                  </div>
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
                      value={draft.codeEvidence}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, codeEvidence: event.target.value }))
                      }
                      placeholder="File/hàm đã viết, lệnh chạy, test đã tạo và kết quả…"
                    />
                  </label>
                  <label className="wide-field">
                    <span>Link notebook/repository/commit (không bắt buộc)</span>
                    <input
                      type="url"
                      value={draft.evidenceLink}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, evidenceLink: event.target.value }))
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
                      value={draft.explanation}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, explanation: event.target.value }))
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
                          setDraft((current) => ({
                            ...current,
                            soloConfirmed: event.target.checked,
                          }))
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
                          setDraft((current) => ({
                            ...current,
                            noAutomaticFailConfirmed: event.target.checked,
                          }))
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
                    <button type="submit">Lưu attempt trên thiết bị</button>
                  </div>
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
