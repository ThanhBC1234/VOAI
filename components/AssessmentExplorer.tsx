"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  AssessmentScoreWeights,
  DailyAssessment,
} from "../content/daily-assessments";

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

interface StoredAttempt extends AssessmentDraft {
  id: string;
  assessmentId: string;
  sessionId: string;
  timestamp: string;
  score: number;
  threshold: number;
  status: AttemptStatus;
}

type Props = {
  assessments: readonly DailyAssessment[];
  initialSessionId?: string;
};

const STORAGE_KEY = "voai-assessment-attempts-v1";
const kindLabels: Record<DailyAssessment["kind"], string> = {
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

function emptyDraft(assessment: DailyAssessment): AssessmentDraft {
  return {
    retrievalAnswers: assessment.retrievalQuestions.map(() => ""),
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

function evidenceCompleteFor(
  draft: AssessmentDraft,
  assessment: DailyAssessment,
): boolean {
  return Boolean(
    draft.retrievalAnswers.length === assessment.retrievalQuestions.length &&
      assessment.retrievalQuestions.every(
        (_, index) => Boolean(draft.retrievalAnswers[index]?.trim()),
      ) &&
      draft.codeEvidence.trim() &&
      draft.explanation.trim() &&
      draft.soloConfirmed &&
      draft.noAutomaticFailConfirmed,
  );
}

function missingSectionScoreCategories(
  scores: AssessmentScoreWeights,
  assessment: DailyAssessment,
): Array<keyof AssessmentScoreWeights> {
  return scoreCategories.filter(
    (category) => scores[category] < assessment.passRule.minimumSectionScores[category],
  );
}

function computedStatusFor(
  draft: AssessmentDraft,
  assessment: DailyAssessment,
): AttemptStatus {
  if (!evidenceCompleteFor(draft, assessment)) return "incomplete";
  const passesTotal = totalScoreFor(draft.scores) >= assessment.passRule.minimumScore;
  const passesSections = missingSectionScoreCategories(draft.scores, assessment).length === 0;
  return passesTotal && passesSections ? "passed" : "needs-revision";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isStoredAttempt(
  value: unknown,
  assessmentById: ReadonlyMap<string, DailyAssessment>,
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

  const assessment = assessmentById.get(value.assessmentId);
  if (!assessment || assessment.sessionId !== value.sessionId) return false;
  if (
    !Array.isArray(value.retrievalAnswers) ||
    value.retrievalAnswers.length !== assessment.retrievalQuestions.length ||
    !value.retrievalAnswers.every((answer) => typeof answer === "string")
  ) {
    return false;
  }
  const timestamp = Date.parse(value.timestamp);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString() !== value.timestamp) {
    return false;
  }
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
        score <= assessment.scoreWeights[category]
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
    value.threshold === assessment.passRule.minimumScore &&
    value.status === computedStatusFor(draft, assessment)
  );
}

function statusLabel(status: AttemptStatus): string {
  if (status === "passed") return "Pass tự đánh giá";
  if (status === "needs-revision") return "Cần sửa";
  return "Thiếu bằng chứng";
}

export function AssessmentExplorer({ assessments, initialSessionId }: Props) {
  const firstAssessment = assessments[0];
  const initialAssessment =
    assessments.find((assessment) => assessment.sessionId === initialSessionId) ??
    firstAssessment;
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
  const assessmentById = useMemo(
    () => new Map(assessments.map((assessment) => [assessment.id, assessment])),
    [assessments],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
        const candidates = Array.isArray(parsed) ? parsed : [];
        const seenAttemptIds = new Set<string>();
        const validAttempts = candidates.filter((candidate): candidate is StoredAttempt => {
          if (!isStoredAttempt(candidate, assessmentById)) return false;
          if (seenAttemptIds.has(candidate.id)) return false;
          seenAttemptIds.add(candidate.id);
          return true;
        });
        setAttempts(validAttempts);
        if (!Array.isArray(parsed) || validAttempts.length !== candidates.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(validAttempts));
        }
      } catch {
        setAttempts([]);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [assessmentById]);

  const domains = useMemo(
    () => Array.from(new Set(assessments.map((assessment) => assessment.domain))),
    [assessments],
  );
  const selected =
    assessments.find((assessment) => assessment.sessionId === selectedId) ??
    firstAssessment;
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("vi");
    return assessments.filter((assessment) => {
      const matchesKind = kind === "all" || assessment.kind === kind;
      const matchesDomain = domain === "all" || assessment.domain === domain;
      const haystack = `${assessment.sessionId} ${assessment.date} ${assessment.title} ${assessment.outcome} ${assessment.domain}`.toLocaleLowerCase("vi");
      return matchesKind && matchesDomain && (!normalized || haystack.includes(normalized));
    });
  }, [assessments, domain, kind, query]);

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
  const evidenceComplete = selected ? evidenceCompleteFor(draft, selected) : false;
  const missingScoreCategories = selected
    ? missingSectionScoreCategories(draft.scores, selected)
    : [];
  const projectedStatus: AttemptStatus = selected
    ? computedStatusFor(draft, selected)
    : "incomplete";
  const passedSessions = new Set(
    attempts.filter((attempt) => attempt.status === "passed").map((attempt) => attempt.sessionId),
  ).size;

  if (!selected) {
    return <p className="empty-state">Không có assessment để hiển thị.</p>;
  }

  function chooseAssessment(assessment: DailyAssessment) {
    setSelectedId(assessment.sessionId);
    setDraft(emptyDraft(assessment));
    setSaveMessage("");
    const url = new URL(window.location.href);
    url.searchParams.set("session", assessment.sessionId);
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
      threshold: selected.passRule.minimumScore,
      status: projectedStatus,
    };
    const nextAttempts = [attempt, ...attempts];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAttempts));
      setAttempts(nextAttempts);
      setSaveMessage(
        projectedStatus === "passed"
          ? `Đã lưu pass tự đánh giá lúc ${new Date(timestamp).toLocaleString("vi-VN")}.`
          : `Đã lưu attempt ở trạng thái “${statusLabel(projectedStatus)}”.`,
      );
    } catch {
      setSaveMessage("Không thể ghi attempt vào bộ nhớ trình duyệt này.");
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
          <strong>{assessments.length}/{assessments.length} phiên</strong>
        </div>
        <div>
          <span>PASS TỰ ĐÁNH GIÁ</span>
          <strong>{passedSessions}/{assessments.length}</strong>
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
            <p>{filtered.length}/{assessments.length} phiên khớp bộ lọc</p>
          </div>
          <div className="assessment-list">
            {filtered.map((assessment) => {
              const latestStatus = latestStatusBySession.get(assessment.sessionId);
              const active = assessment.sessionId === selected.sessionId;
              return (
                <button
                  type="button"
                  key={assessment.id}
                  data-assessment-item={assessment.sessionId}
                  className={active ? "active" : ""}
                  aria-current={active ? "true" : undefined}
                  onClick={() => chooseAssessment(assessment)}
                >
                  <span>
                    #{assessment.ordinal} · {assessment.date}
                  </span>
                  <strong>{assessment.title}</strong>
                  <small>
                    {assessment.domain} · {kindLabels[assessment.kind]}
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

          <section className="assessment-brief" aria-labelledby="coding-task-title">
            <p className="eyebrow">NHIỆM VỤ TỰ CODE</p>
            <h3 id="coding-task-title">Coding task</h3>
            <p>{selected.codingTask}</p>
            <div className="assessment-criteria-grid">
              <details open>
                <summary>Tiêu chí công khai ({selected.visibleCriteria.length})</summary>
                <ul>
                  {selected.visibleCriteria.map((criterion) => (
                    <li key={criterion}>{criterion}</li>
                  ))}
                </ul>
              </details>
              <details>
                <summary>Nhóm test ẩn ({selected.hiddenTestCategories.length})</summary>
                <p>
                  Chỉ công bố nhóm rủi ro; trang này không nhận test case, input hay expected
                  output ẩn.
                </p>
                <ul>
                  {selected.hiddenTestCategories.map((category) => (
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
                {selected.retrievalQuestions.map((question, index) => (
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
                  <p>{selected.explainPrompt}</p>
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
                    Đây là self-score thủ công. Tổng phải đạt {selected.passRule.minimumScore}/100
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
                        {selected.passRule.minimumSectionScores[category]}
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
                  {selected.passRule.requiredSections.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <h4>Tự động trượt</h4>
                <ul>
                  {selected.passRule.automaticFailConditions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p>
                  <strong>Thi lại:</strong> {selected.passRule.retryRule}
                </p>
                <p>
                  <strong>Mastery {selected.mastery.minimumScore}/100:</strong>{" "}
                  {selected.mastery.delayedTransferCheck}
                </p>
              </details>

              <div className="attempt-submit">
                <div>
                  <span>TỔNG ĐIỂM TỰ CHẤM</span>
                  <strong>
                    {totalScore}/100 · {statusLabel(projectedStatus)}
                  </strong>
                  {!evidenceComplete && <small>Điền đủ bằng chứng và hai xác nhận để xét pass.</small>}
                  {evidenceComplete && totalScore < selected.passRule.minimumScore && (
                    <small>Còn thiếu {selected.passRule.minimumScore - totalScore} điểm để xét pass.</small>
                  )}
                  {evidenceComplete && missingScoreCategories.length > 0 && (
                    <small>
                      Chưa đạt sàn: {missingScoreCategories.map((category) =>
                        `${scoreLabels[category]} ${draft.scores[category]}/${selected.passRule.minimumSectionScores[category]}`,
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
