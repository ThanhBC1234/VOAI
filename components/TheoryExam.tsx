"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RichText } from "./RichText";
import {
  DIFFICULTY_LEVELS,
  DIFFICULTY_PROFILES,
  FORMAT_LABELS,
  MOCK_DURATION_MINUTES,
  MOCK_INTERNAL_GATES,
  PAPER_SECTIONS,
  pointsFor,
  type PaperSection,
  type TheoryQuestion,
} from "../content/theory/types";
import {
  ACTIVE_ATTEMPT_STORAGE_KEY,
  activeAttemptIsUsable,
  createActiveAttempt,
  evaluateGates,
  formatClock,
  parseActiveAttempt,
  parseStoredAttempt,
  secondsLeftUntil,
  type ActiveAttempt,
  type StoredAttempt,
} from "../lib/theory-exam-state";
import { DRAFT_FLUSH_DELAY_MS } from "../lib/draft-storage";
import {
  buildMockPaperQuestionIds,
  isValidMockPaperQuestionIds,
  MAX_PAPER_SEED,
  nextPaperSeed,
  normalisePaperSeed,
} from "../lib/theory-paper";
import {
  canPersistTheoryPracticeStorage,
  createTheoryPracticeState,
  EMPTY_THEORY_PRACTICE_STATE,
  hasCompleteTrueFalseResponse,
  inspectTheoryPracticeStorage,
  isTheoryPracticeStateWritable,
  matchesTheoryPracticeReviewMode,
  MAX_RESPONSE_TEXT_LENGTH,
  mergeTheoryPracticeDelta,
  sanitiseTheoryPracticeReveals,
  THEORY_PRACTICE_STORAGE_KEY,
  type TheoryPracticeResponse,
  type TheoryPracticeState,
} from "../lib/theory-practice-state";
import { describeWriteStatus, readJson, readRaw, removeKey, writeJson } from "../lib/local-storage";

const STORAGE_KEY = "voai-theory-attempts-v1";
const INVALID_PRACTICE_STORAGE_NOTICE =
  "Không đọc được dữ liệu luyện lý thuyết đã lưu. Dữ liệu cũ vẫn được giữ nguyên; thay đổi mới trong phiên này sẽ không được lưu để tránh ghi đè.";
const FULL_PRACTICE_STORAGE_NOTICE =
  "Tiến độ luyện lý thuyết đã đạt giới hạn lưu trữ. Dữ liệu cũ vẫn được giữ nguyên; thay đổi mới trong phiên này sẽ không được lưu.";

type Response = TheoryPracticeResponse;
type Props = {
  questions: readonly TheoryQuestion[];
  sectionOf: Readonly<Record<string, PaperSection>>;
  paperIds: readonly string[];
};

const PRACTICE_PAGE_SIZE = 40;
const REVIEW_MODES = ["all", "unanswered", "wrong", "correct"] as const;
type ReviewMode = (typeof REVIEW_MODES)[number];
const REVIEW_LABELS: Readonly<Record<ReviewMode, string>> = {
  all: "Tất cả trạng thái",
  unanswered: "Chưa đối chiếu",
  wrong: "Đã đối chiếu · sai",
  correct: "Đã đối chiếu · đúng",
};

function freshBrowserSeed(): number {
  try {
    const value = new Uint32Array(1);
    globalThis.crypto.getRandomValues(value);
    return value[0];
  } catch {
    return Date.now() >>> 0;
  }
}

/* ---------------- chấm điểm ---------------- */

function hasCompleteResponse(question: TheoryQuestion, response: Response): boolean {
  if (response === null || response === undefined) return false;
  switch (question.format) {
    case "single-choice":
      return (
        typeof response === "number" &&
        Number.isInteger(response) &&
        response >= 0 &&
        response < question.choices.length
      );
    case "multi-select":
      return (
        Array.isArray(response) &&
        response.length > 0 &&
        response.every(
          (index) =>
            typeof index === "number" &&
            Number.isInteger(index) &&
            index >= 0 &&
            index < question.choices.length,
        ) &&
        new Set(response as readonly unknown[]).size === response.length
      );
    case "true-false-set":
      return hasCompleteTrueFalseResponse(response, question.statements.length);
    case "numeric": {
      const text = String(response).trim().replace(",", ".");
      return text.length > 0 && Number.isFinite(Number(text));
    }
    case "short-text":
      return typeof response === "string" && response.trim().length > 0;
    default:
      return false;
  }
}

function isCorrect(question: TheoryQuestion, response: Response): boolean {
  if (response === null || response === undefined) return false;
  switch (question.format) {
    case "single-choice":
      return response === question.answerIndex;
    case "multi-select": {
      if (!Array.isArray(response)) return false;
      const picked = [...(response as number[])].sort((a, b) => a - b);
      const expected = [...question.answerIndexes].sort((a, b) => a - b);
      return picked.length === expected.length && picked.every((v, i) => v === expected[i]);
    }
    case "true-false-set": {
      if (!Array.isArray(response)) return false;
      const picked = response as Array<boolean | null>;
      return question.statements.every((s, i) => picked[i] === s.answer);
    }
    case "numeric": {
      const value = Number(String(response).trim().replace(",", "."));
      if (!Number.isFinite(value)) return false;
      return Math.abs(value - question.answer) <= Math.max(question.tolerance, 1e-9);
    }
    case "short-text": {
      const normalise = (text: string) => text.trim().toLowerCase().replace(/\s+/g, " ");
      return question.acceptedAnswers.some((a) => normalise(a) === normalise(String(response)));
    }
    default:
      return false;
  }
}

/* ---------------- ô trả lời ---------------- */

function AnswerFields({
  question,
  response,
  onChange,
  locked,
}: {
  question: TheoryQuestion;
  response: Response;
  onChange: (value: Response) => void;
  locked: boolean;
}) {
  switch (question.format) {
    // A11Y-P2-01: một đáp án đúng ⇒ radiogroup, nhiều đáp án ⇒ checkbox. Trước
    // đây tất cả đều là <button>, nên trình đọc màn hình không đọc được trạng
    // thái chọn lẫn quan hệ nhóm.
    case "single-choice":
      return (
        <div className="theory-choices" role="radiogroup" aria-label="Chọn một đáp án">
          {question.choices.map((choice, index) => (
            <label key={choice} className={response === index ? "picked" : ""}>
              <input
                className="theory-native-radio"
                type="radio"
                name={`single-${question.id}`}
                checked={response === index}
                disabled={locked}
                onChange={() => onChange(index)}
              />
              <span aria-hidden="true">{String.fromCharCode(65 + index)}</span>
              <em>
                <RichText>{choice}</RichText>
              </em>
            </label>
          ))}
        </div>
      );
    case "multi-select": {
      const picked = Array.isArray(response) ? (response as number[]) : [];
      return (
        <div className="theory-choices">
          <p className="theory-hint">Chọn tất cả phương án đúng. Chấm trọn gói.</p>
          {question.choices.map((choice, index) => (
            <button
              type="button"
              key={choice}
              role="checkbox"
              aria-checked={picked.includes(index)}
              aria-disabled={locked || undefined}
              disabled={locked}
              className={picked.includes(index) ? "picked" : ""}
              onClick={() =>
                onChange(
                  picked.includes(index)
                    ? picked.filter((v) => v !== index)
                    : [...picked, index],
                )
              }
            >
              <span aria-hidden="true">{picked.includes(index) ? "✓" : ""}</span>
              <em>
                <RichText>{choice}</RichText>
              </em>
            </button>
          ))}
        </div>
      );
    }
    case "true-false-set": {
      const picked = Array.isArray(response) ? (response as Array<boolean | null>) : [];
      return (
        <div className="theory-tf">
          {question.statements.map((statement, index) => (
            <div key={statement.text}>
              <p id={`tf-${question.id}-${index}`}>
                <b>{String.fromCharCode(97 + index)})</b> <RichText>{statement.text}</RichText>
              </p>
              {/* Radio native tự xử lý mũi tên và roving focus trong từng nhóm. */}
              <div role="radiogroup" aria-labelledby={`tf-${question.id}-${index}`}>
                <label className={picked[index] === true ? "picked" : ""}>
                  <input
                    className="theory-native-radio"
                    type="radio"
                    name={`tf-${question.id}-${index}`}
                    checked={picked[index] === true}
                    disabled={locked}
                    onChange={() => {
                      const next = [...picked];
                      next[index] = true;
                      onChange(next);
                    }}
                  />
                  <span>Đúng</span>
                </label>
                <label className={picked[index] === false ? "picked" : ""}>
                  <input
                    className="theory-native-radio"
                    type="radio"
                    name={`tf-${question.id}-${index}`}
                    checked={picked[index] === false}
                    disabled={locked}
                    onChange={() => {
                      const next = [...picked];
                      next[index] = false;
                      onChange(next);
                    }}
                  />
                  <span>Sai</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      );
    }
    case "numeric":
      return (
        <div className="theory-input">
          <input
            inputMode="decimal"
            disabled={locked}
            maxLength={MAX_RESPONSE_TEXT_LENGTH}
            value={response === null ? "" : String(response)}
            onChange={(event) =>
              onChange(event.target.value.slice(0, MAX_RESPONSE_TEXT_LENGTH))
            }
            placeholder="Nhập đáp án bằng số…"
            aria-label="Đáp án dạng số"
          />
          {question.unit ? <span>{question.unit}</span> : null}
        </div>
      );
    case "short-text":
      return (
        <div className="theory-input">
          <input
            disabled={locked}
            maxLength={MAX_RESPONSE_TEXT_LENGTH}
            value={response === null ? "" : String(response)}
            onChange={(event) =>
              onChange(event.target.value.slice(0, MAX_RESPONSE_TEXT_LENGTH))
            }
            placeholder="Nhập thuật ngữ…"
            aria-label="Đáp án dạng chữ"
          />
        </div>
      );
    default:
      return null;
  }
}

/* ---------------- phần đối chiếu ---------------- */

function Review({ question, response }: { question: TheoryQuestion; response: Response }) {
  const correct = isCorrect(question, response);
  return (
    <div className={`theory-review ${correct ? "ok" : "no"}`}>
      <strong>{correct ? "✓ Đúng" : "× Chưa đúng"}</strong>

      {question.format === "single-choice" || question.format === "multi-select" ? (
        <ul className="theory-notes">
          {question.choices.map((choice, index) => {
            const isAnswer =
              question.format === "single-choice"
                ? index === question.answerIndex
                : question.answerIndexes.includes(index);
            return (
              <li key={choice} className={isAnswer ? "is-answer" : ""}>
                <b>{String.fromCharCode(65 + index)}.</b>{" "}
                <RichText>{question.choiceNotes[index]}</RichText>
              </li>
            );
          })}
        </ul>
      ) : null}

      {question.format === "true-false-set" ? (
        <ul className="theory-notes">
          {question.statements.map((statement, index) => (
            <li key={statement.text} className="is-answer">
              <b>
                {String.fromCharCode(97 + index)}) {statement.answer ? "Đúng" : "Sai"} —
              </b>{" "}
              <RichText>{statement.note}</RichText>
            </li>
          ))}
        </ul>
      ) : null}

      {question.format === "numeric" ? (
        <p className="theory-answer-line">
          Đáp án: <b>{question.answer}</b>
          {question.tolerance > 0 ? ` (sai số ±${question.tolerance})` : ""}
        </p>
      ) : null}

      {question.format === "short-text" ? (
        <p className="theory-answer-line">
          Đáp án chấp nhận: <b>{question.acceptedAnswers.join(" / ")}</b>
        </p>
      ) : null}

      {question.calculation ? (
        <ol className="theory-calc">
          {question.calculation.map((step) => (
            <li key={step}>
              <RichText>{step}</RichText>
            </li>
          ))}
        </ol>
      ) : null}

      <p>
        <RichText>{question.explanation}</RichText>
      </p>
      {question.trap ? (
        <p className="theory-trap">
          <b>Bẫy:</b> <RichText>{question.trap}</RichText>
        </p>
      ) : null}
      {question.calibratedFrom ? <small>{question.calibratedFrom}</small> : null}
    </div>
  );
}

/* ---------------- thẻ câu hỏi ---------------- */

function QuestionCard({
  question,
  index,
  section,
  response,
  onChange,
  revealed,
  onReveal,
  examMode,
  nestedHeading,
}: {
  question: TheoryQuestion;
  index: number;
  section: PaperSection;
  response: Response;
  onChange: (value: Response) => void;
  revealed: boolean;
  onReveal: () => void;
  examMode: boolean;
  nestedHeading: boolean;
}) {
  const answered = hasCompleteResponse(question, response);
  // Đề thi có một h2 bao toàn bộ attempt; câu luyện nằm trực tiếp dưới h1.
  const Stem = nestedHeading ? "h3" : "h2";
  return (
    <article className="theory-card" id={`theory-${question.id}`}>
      <div className="theory-meta">
        <span className="theory-index">{String(index + 1).padStart(3, "0")}</span>
        <span className={`theory-level lv-${question.difficulty}`}>
          {DIFFICULTY_PROFILES[question.difficulty].label}
        </span>
        <span>{section}</span>
        <span>{FORMAT_LABELS[question.format]}</span>
        <span className="theory-points">{pointsFor(question)} điểm</span>
      </div>
      <Stem>
        <RichText>{question.stem}</RichText>
      </Stem>
      <AnswerFields
        question={question}
        response={response}
        onChange={onChange}
        locked={revealed}
      />
      {!examMode ? (
        <>
          <button
            type="button"
            className="theory-reveal"
            disabled={!answered || revealed}
            onClick={onReveal}
          >
            {revealed ? "Đã đối chiếu" : "Đối chiếu sau khi trả lời"}
          </button>
          {revealed ? <Review question={question} response={response} /> : null}
        </>
      ) : null}
    </article>
  );
}

/* ---------------- component chính ---------------- */

export function TheoryExam({ questions, sectionOf, paperIds }: Props) {
  const [mode, setMode] = useState<"practice" | "exam">("practice");
  const [section, setSection] = useState<string>("Tất cả");
  const [level, setLevel] = useState<string>("Tất cả");
  const [query, setQuery] = useState("");
  const [reviewMode, setReviewMode] = useState<ReviewMode>("all");
  const [practicePage, setPracticePage] = useState(1);
  const [practiceHydrated, setPracticeHydrated] = useState(false);
  const [practiceRestoreNotice, setPracticeRestoreNotice] = useState<string | null>(null);
  // THEORY-P1-01: hai chế độ giữ đáp án riêng biệt. Trước đây dùng chung một
  // `responses`, nên trả lời ở Luyện tập sẽ tự điền vào bài thi đang mở.
  const [practiceResponses, setPracticeResponses] = useState<Record<string, Response>>({});
  const [examResponses, setExamResponses] = useState<Record<string, Response>>({});
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const [attempt, setAttempt] = useState<ActiveAttempt | null>(null);
  const [practiceStorageNotice, setPracticeStorageNotice] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [paperSeed, setPaperSeed] = useState(1);
  const [attempts, setAttempts] = useState<StoredAttempt[]>([]);
  const examResponsesRef = useRef<Record<string, Response>>({});
  const submittingRef = useRef(false);
  /** Bản ghi lịch sử chưa diễn giải được; luôn được ghi lại kèm, không vứt đi. */
  const unreadableRef = useRef<unknown[]>([]);
  /** Bản sao của `attempts` để `submitExam` ghi storage mà không cần phụ thuộc state. */
  const attemptsRef = useRef<StoredAttempt[]>([]);
  const practiceResponsesRef = useRef<Record<string, Response>>({});
  const practiceRevealedRef = useRef<Set<string>>(new Set());
  const dirtyPracticeResponseIdsRef = useRef<Set<string>>(new Set());
  const dirtyPracticeRevealIdsRef = useRef<Set<string>>(new Set());
  const practiceWriteTimerRef = useRef<number | null>(null);
  /** Invalid raw hoặc state vượt trần sẽ khóa cả schedule lẫn flush. */
  const practiceStorageWritableRef = useRef(true);

  const byId = useMemo(() => new Map(questions.map((q) => [q.id, q])), [questions]);
  const knownIds = useMemo(() => new Set(questions.map((q) => q.id)), [questions]);
  const previewPaperIds = useMemo(
    () =>
      paperSeed === 1
        ? [...paperIds]
        : buildMockPaperQuestionIds(paperSeed, questions, sectionOf),
    [paperIds, paperSeed, questions, sectionOf],
  );
  // Đề của attempt là snapshot cố định lúc bắt đầu; ngoài attempt thì lắp theo seed đang chọn.
  const paper = useMemo(() => {
    const ids = attempt ? attempt.questionIds : previewPaperIds;
    return ids.map((id) => byId.get(id)).filter((q): q is TheoryQuestion => Boolean(q));
  }, [attempt, previewPaperIds, byId]);

  // Đi qua `lib/local-storage.ts` như mọi màn hình khác: các hàm ở đó không bao
  // giờ ném, kể cả khi storage bị chặn hoặc đầy.
  const persistAttempt = useCallback((next: ActiveAttempt | null) => {
    if (next) writeJson(ACTIVE_ATTEMPT_STORAGE_KEY, next);
    else removeKey(ACTIVE_ATTEMPT_STORAGE_KEY);
  }, []);

  const sanitisePracticeState = useCallback(
    (state: TheoryPracticeState) =>
      sanitiseTheoryPracticeReveals(state, knownIds, (id, response) => {
        const question = byId.get(id);
        return Boolean(question && hasCompleteResponse(question, response));
      }),
    [byId, knownIds],
  );

  const currentPracticeState = useCallback(
    () => createTheoryPracticeState(practiceResponsesRef.current, practiceRevealedRef.current),
    [],
  );

  const cancelPracticeWrite = useCallback(() => {
    if (practiceWriteTimerRef.current === null) return;
    window.clearTimeout(practiceWriteTimerRef.current);
    practiceWriteTimerRef.current = null;
  }, []);

  const lockPracticeStorage = useCallback(
    (notice: string) => {
      practiceStorageWritableRef.current = false;
      cancelPracticeWrite();
      setPracticeRestoreNotice(notice);
    },
    [cancelPracticeWrite],
  );

  const applyPracticeSessionState = useCallback(
    (state: TheoryPracticeState) => {
      const safeState = sanitisePracticeState(state);
      practiceResponsesRef.current = safeState.responses;
      practiceRevealedRef.current = new Set(safeState.revealed);
      setPracticeResponses(safeState.responses);
      setRevealed(new Set(safeState.revealed));
    },
    [sanitisePracticeState],
  );

  const flushPractice = useCallback(() => {
    cancelPracticeWrite();
    if (!practiceStorageWritableRef.current) return;

    const dirtyResponses = new Set(dirtyPracticeResponseIdsRef.current);
    const dirtyReveals = new Set(dirtyPracticeRevealIdsRef.current);
    if (dirtyResponses.size === 0 && dirtyReveals.size === 0) return;

    const liveInspection = inspectTheoryPracticeStorage(
      readRaw(THEORY_PRACTICE_STORAGE_KEY),
    );
    if (liveInspection.status === "invalid") {
      lockPracticeStorage(INVALID_PRACTICE_STORAGE_NOTICE);
      return;
    }

    const liveState =
      liveInspection.status === "valid"
        ? liveInspection.state
        : EMPTY_THEORY_PRACTICE_STATE;
    const merged = mergeTheoryPracticeDelta(
      liveState,
      currentPracticeState(),
      dirtyResponses,
      dirtyReveals,
    );
    if (!isTheoryPracticeStateWritable(merged)) {
      lockPracticeStorage(FULL_PRACTICE_STORAGE_NOTICE);
      return;
    }

    const status = writeJson(THEORY_PRACTICE_STORAGE_KEY, merged);
    setPracticeStorageNotice(describeWriteStatus(status));
    if (status !== "ok") return;

    dirtyPracticeResponseIdsRef.current.clear();
    dirtyPracticeRevealIdsRef.current.clear();
    applyPracticeSessionState(merged);
  }, [applyPracticeSessionState, cancelPracticeWrite, currentPracticeState, lockPracticeStorage]);

  const schedulePracticeWrite = useCallback(() => {
    if (!practiceStorageWritableRef.current) return;
    if (!isTheoryPracticeStateWritable(currentPracticeState())) {
      lockPracticeStorage(FULL_PRACTICE_STORAGE_NOTICE);
      return;
    }
    cancelPracticeWrite();
    practiceWriteTimerRef.current = window.setTimeout(
      flushPractice,
      DRAFT_FLUSH_DELAY_MS,
    );
  }, [cancelPracticeWrite, currentPracticeState, flushPractice, lockPracticeStorage]);
  // Khôi phục lịch sử và attempt đang làm dở (THEORY-P1-03).
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const candidates = readJson<unknown[]>(
        STORAGE_KEY,
        (value) => (Array.isArray(value) ? value : null),
        [],
      );
      const readable: StoredAttempt[] = [];
      const unreadable: unknown[] = [];
      for (const candidate of candidates) {
        const attempt = parseStoredAttempt(candidate);
        if (attempt) readable.push(attempt);
        else unreadable.push(candidate);
      }
      unreadableRef.current = unreadable;
      attemptsRef.current = readable;
      setAttempts(readable);
      const practiceInspection = inspectTheoryPracticeStorage(
        readRaw(THEORY_PRACTICE_STORAGE_KEY),
      );
      practiceStorageWritableRef.current = canPersistTheoryPracticeStorage(practiceInspection);
      setPracticeRestoreNotice(
        practiceInspection.status === "invalid" ? INVALID_PRACTICE_STORAGE_NOTICE : null,
      );
      setPracticeStorageNotice(null);
      const storedPractice =
        practiceInspection.status === "valid"
          ? practiceInspection.state
          : EMPTY_THEORY_PRACTICE_STATE;
      cancelPracticeWrite();
      dirtyPracticeResponseIdsRef.current.clear();
      dirtyPracticeRevealIdsRef.current.clear();
      applyPracticeSessionState(storedPractice);
      setPracticeHydrated(true);

      setPaperSeed(readable[0] ? nextPaperSeed(readable[0].seed) : freshBrowserSeed());
      const restored = parseActiveAttempt(readRaw(ACTIVE_ATTEMPT_STORAGE_KEY));
      if (
        restored &&
        !restored.submitted &&
        activeAttemptIsUsable(restored, knownIds) &&
        isValidMockPaperQuestionIds(restored.questionIds, questions, sectionOf)
      ) {
        setAttempt(restored);
        const responses = restored.responses as Record<string, Response>;
        setPaperSeed(restored.seed);
        setExamResponses(responses);
        examResponsesRef.current = responses;
        setMode("exam");
      } else if (restored) {
        // Attempt đã nộp hoặc tham chiếu câu không còn tồn tại: dọn, không crash.
        persistAttempt(null);
      }
      setNowMs(Date.now());
    }, 0);
    return () => window.clearTimeout(timer);
  }, [
    applyPracticeSessionState,
    cancelPracticeWrite,
    knownIds,
    persistAttempt,
    questions,
    sectionOf,
  ]);

  useEffect(() => {
    if (!practiceHydrated) return;

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== THEORY_PRACTICE_STORAGE_KEY) return;
      const inspection = inspectTheoryPracticeStorage(event.newValue);
      if (inspection.status === "invalid") {
        lockPracticeStorage(INVALID_PRACTICE_STORAGE_NOTICE);
        return;
      }
      if (!practiceStorageWritableRef.current) return;

      const incoming =
        inspection.status === "valid" ? inspection.state : EMPTY_THEORY_PRACTICE_STATE;
      const merged = mergeTheoryPracticeDelta(
        incoming,
        currentPracticeState(),
        dirtyPracticeResponseIdsRef.current,
        dirtyPracticeRevealIdsRef.current,
      );
      if (!isTheoryPracticeStateWritable(merged)) {
        lockPracticeStorage(FULL_PRACTICE_STORAGE_NOTICE);
        return;
      }
      setPracticeStorageNotice(null);
      applyPracticeSessionState(merged);
    };
    const flushWhenHidden = () => {
      if (document.visibilityState === "hidden") flushPractice();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("pagehide", flushPractice);
    document.addEventListener("visibilitychange", flushWhenHidden);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("pagehide", flushPractice);
      document.removeEventListener("visibilitychange", flushWhenHidden);
      flushPractice();
      cancelPracticeWrite();
    };
  }, [
    applyPracticeSessionState,
    cancelPracticeWrite,
    currentPracticeState,
    flushPractice,
    lockPracticeStorage,
    practiceHydrated,
  ]);

  const wrongCount = useMemo(
    () => questions.filter((q) => revealed.has(q.id) && !isCorrect(q, practiceResponses[q.id] ?? null)).length,
    [practiceResponses, questions, revealed],
  );
  const filtered = useMemo(
    () =>
      questions.filter((q) => {
        const response = practiceResponses[q.id] ?? null;
        const isRevealed = revealed.has(q.id);
        const matchesReview = matchesTheoryPracticeReviewMode(
          reviewMode,
          isRevealed,
          isCorrect(q, response),
        );
        return (
          (section === "Tất cả" || sectionOf[q.id] === section) &&
          (level === "Tất cả" || q.difficulty === level) &&
          `${q.stem} ${q.syllabusId}`.toLowerCase().includes(query.toLowerCase()) &&
          matchesReview
        );
      }),
    [practiceResponses, query, questions, revealed, reviewMode, section, sectionOf, level],
  );

  const practicePageCount = Math.max(1, Math.ceil(filtered.length / PRACTICE_PAGE_SIZE));
  const activePracticePage = Math.min(practicePage, practicePageCount);
  const practicePageStart = (activePracticePage - 1) * PRACTICE_PAGE_SIZE;
  const pagedQuestions = filtered.slice(practicePageStart, practicePageStart + PRACTICE_PAGE_SIZE);

  function resetPracticePage() {
    setPracticePage(1);
  }

  const setPracticeResponse = (id: string, value: Response) => {
    const next = { ...practiceResponsesRef.current, [id]: value };
    practiceResponsesRef.current = next;
    dirtyPracticeResponseIdsRef.current.add(id);
    setPracticeResponses(next);
    schedulePracticeWrite();
  };

  const setExamResponse = (id: string, value: Response) =>
    setExamResponses((current) => {
      const next = { ...current, [id]: value };
      examResponsesRef.current = next;
      setAttempt((activeAttempt) => {
        if (!activeAttempt || activeAttempt.submitted) return activeAttempt;
        const updated = { ...activeAttempt, responses: next as Record<string, unknown> };
        persistAttempt(updated);
        return updated;
      });
      return next;
    });

  const reveal = (id: string) => {
    const next = new Set(practiceRevealedRef.current);
    next.add(id);
    practiceRevealedRef.current = next;
    dirtyPracticeRevealIdsRef.current.add(id);
    setRevealed(next);
    schedulePracticeWrite();
  };

  const submitExam = useCallback(() => {
    // Chống nộp hai lần khi hết giờ trùng lúc người dùng bấm nộp.
    if (submittingRef.current) return;
    submittingRef.current = true;
    setAttempt((current) => {
      if (!current) return current;
      const closed = { ...current, submitted: true };
      persistAttempt(closed);
      return closed;
    });

    const bySection: Record<string, { correct: number; total: number }> = {};
    const byDifficulty: Record<string, { correct: number; total: number }> = {};
    let earned = 0;
    let possible = 0;
    let correctCount = 0;

    for (const question of paper) {
      const ok = isCorrect(question, examResponsesRef.current[question.id] ?? null);
      const sectionKey = sectionOf[question.id];
      bySection[sectionKey] ??= { correct: 0, total: 0 };
      byDifficulty[question.difficulty] ??= { correct: 0, total: 0 };
      bySection[sectionKey].total += 1;
      byDifficulty[question.difficulty].total += 1;
      possible += pointsFor(question);
      if (ok) {
        correctCount += 1;
        earned += pointsFor(question);
        bySection[sectionKey].correct += 1;
        byDifficulty[question.difficulty].correct += 1;
      }
    }

    const finished: StoredAttempt = {
      seed: attempt?.seed ?? paperSeed,
      finishedAt: new Date().toISOString(),
      scorePercent: possible > 0 ? Math.round((earned / possible) * 100) : 0,
      correct: correctCount,
      total: paper.length,
      bySection,
      byDifficulty,
    };
    // Ghi **ngoài** hàm cập nhật state: React được phép gọi hàm đó nhiều lần cho
    // cùng một lần cập nhật, nên để tác dụng phụ bên trong là ghi thừa.
    const next = [finished, ...attemptsRef.current].slice(0, 20);
    attemptsRef.current = next;
    setAttempts(next);
    // Kèm cả bản ghi chưa đọc được, để một lần nộp bài không xoá mất lịch sử.
    writeJson(STORAGE_KEY, [...next, ...unreadableRef.current]);
  }, [attempt?.seed, paper, paperSeed, sectionOf, persistAttempt]);

  const submitExamRef = useRef(submitExam);
  useEffect(() => {
    submitExamRef.current = submitExam;
  }, [submitExam]);

  // Đồng hồ chỉ *đọc* thời gian thực; deadline tuyệt đối nằm trong attempt nên
  // tab bị throttle hay máy sleep không làm bài thi dài thêm (THEORY-P2-01).
  const examRunning = Boolean(attempt) && !attempt?.submitted;
  useEffect(() => {
    if (!examRunning) return;
    const tick = () => setNowMs(Date.now());
    const timer = window.setInterval(tick, 500);
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("focus", tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
      window.removeEventListener("focus", tick);
    };
  }, [examRunning]);

  const secondsLeft = attempt
    ? secondsLeftUntil(attempt.deadlineEpochMs, nowMs)
    : MOCK_DURATION_MINUTES * 60;

  // Hết giờ thì tự chốt đúng một lần, kể cả khi vừa reload sau deadline.
  useEffect(() => {
    if (examRunning && secondsLeft === 0) submitExamRef.current();
  }, [examRunning, secondsLeft]);

  function startExam() {
    submittingRef.current = false;
    const fresh = createActiveAttempt(
      previewPaperIds,
      Date.now(),
      `attempt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      paperSeed,
    );
    setExamResponses({});
    examResponsesRef.current = {};
    setAttempt(fresh);
    persistAttempt(fresh);
    setNowMs(Date.now());
  }

  function discardAttempt() {
    submittingRef.current = false;
    setAttempt(null);
    setExamResponses({});
    examResponsesRef.current = {};
    persistAttempt(null);
  }

  function prepareNextPaper() {
    const completedSeed = attempt?.seed ?? paperSeed;
    discardAttempt();
    setPaperSeed(nextPaperSeed(completedSeed));
  }

  /** Rời bài thi đang chạy phải có xác nhận; Cancel giữ nguyên bài và deadline. */
  function requestPracticeMode() {
    if (examRunning) {
      const confirmed = window.confirm(
        "Bạn đang có một bài thi chưa nộp. Chuyển sang Luyện tập sẽ hủy bài thi này và xóa mọi câu đã trả lời. Tiếp tục?",
      );
      if (!confirmed) return;
      discardAttempt();
    }
    setMode("practice");
  }

  const latest = attempts[0];
  const verdict = latest
    ? evaluateGates({
        scorePercent: latest.scorePercent,
        bySection: latest.bySection,
        byDifficulty: latest.byDifficulty,
      })
    : null;
  const clock = formatClock(secondsLeft);
  const answeredCount = paper.filter((q) =>
    hasCompleteResponse(q, examResponses[q.id] ?? null),
  ).length;

  return (
    <section className="theory-app">
      <div className="theory-modes">
        <button
          type="button"
          className={mode === "practice" ? "active" : ""}
          onClick={requestPracticeMode}
        >
          Luyện theo chủ đề
        </button>
        <button
          type="button"
          className={mode === "exam" ? "active" : ""}
          onClick={() => setMode("exam")}
        >
          Thi thử {paper.length} câu
        </button>
      </div>

      {mode === "practice" ? (
        <>
          <div className="theory-toolbar">
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                resetPracticePage();
              }}
              placeholder="Tìm theo nội dung hoặc mã chủ đề…"
              aria-label="Tìm câu hỏi"
            />
            <select
              value={section}
              onChange={(event) => {
                setSection(event.target.value);
                resetPracticePage();
              }}
              aria-label="Lọc theo khối"
            >
              {["Tất cả", ...PAPER_SECTIONS].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <select
              value={level}
              onChange={(event) => {
                setLevel(event.target.value);
                resetPracticePage();
              }}
              aria-label="Lọc theo mức độ"
            >
              <option value="Tất cả">Tất cả mức độ</option>
              {DIFFICULTY_LEVELS.map((item) => (
                <option key={item} value={item}>
                  {DIFFICULTY_PROFILES[item].label}
                </option>
              ))}
            </select>
            <select
              value={reviewMode}
              onChange={(event) => {
                setReviewMode(event.target.value as ReviewMode);
                resetPracticePage();
              }}
              aria-label="Lọc theo trạng thái làm bài"
            >
              {REVIEW_MODES.map((item) => (
                <option key={item} value={item}>
                  {REVIEW_LABELS[item]}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="theory-wrong-review"
              disabled={wrongCount === 0}
              onClick={() => {
                setSection("Tất cả");
                setLevel("Tất cả");
                setQuery("");
                setReviewMode("wrong");
                resetPracticePage();
              }}
            >
              Ôn câu sai ({wrongCount})
            </button>
            <span className="theory-count">
              {filtered.length}/{questions.length} câu
            </span>
          </div>
          {practiceRestoreNotice ? (
            <p className="theory-storage-notice" role="alert">
              {practiceRestoreNotice}
            </p>
          ) : practiceStorageNotice ? (
            <p className="theory-storage-notice" role="status">{practiceStorageNotice}</p>
          ) : null}
          <div className="theory-list" id="theory-practice-results">
            {pagedQuestions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={practicePageStart + index}
                section={sectionOf[question.id]}
                response={practiceResponses[question.id] ?? null}
                onChange={(value) => setPracticeResponse(question.id, value)}
                revealed={revealed.has(question.id)}
                onReveal={() => reveal(question.id)}
                examMode={false}
                nestedHeading={false}
              />
            ))}
            {filtered.length === 0 ? (
              <p className="empty-state">Không có câu nào khớp bộ lọc.</p>
            ) : null}
          </div>
          {filtered.length > 0 ? (
            <nav className="theory-pagination" aria-label="Phân trang câu hỏi luyện tập">
              <button
                type="button"
                disabled={activePracticePage <= 1}
                onClick={() => setPracticePage(activePracticePage - 1)}
                aria-controls="theory-practice-results"
              >
                ← Trang trước
              </button>
              <span aria-live="polite">
                Câu {practicePageStart + 1}–
                {Math.min(practicePageStart + PRACTICE_PAGE_SIZE, filtered.length)} / {filtered.length}
                {" · "}Trang {activePracticePage}/{practicePageCount}
              </span>
              <button
                type="button"
                disabled={activePracticePage >= practicePageCount}
                onClick={() => setPracticePage(activePracticePage + 1)}
                aria-controls="theory-practice-results"
              >
                Trang sau →
              </button>
            </nav>
          ) : null}
        </>
      ) : (
        <div className="theory-exam">
          {!attempt ? (
            <div className="theory-start">
              <h2>Đề mock {paper.length} câu · {MOCK_DURATION_MINUTES} phút</h2>
              <p>
                Mỗi lượt được lắp tất định từ một seed riêng. Cùng seed sẽ tái tạo đúng bộ
                câu để đối chiếu; đổi seed sẽ có đề lạ để đo năng lực chuyển giao. Khi thi,
                hãy làm một mạch, đóng tài liệu và không hỏi AI.
              </p>
              <div className="theory-seed-controls">
                <label htmlFor="theory-paper-seed">
                  <span>Seed đề</span>
                  <input
                    id="theory-paper-seed"
                    type="number"
                    min={0}
                    max={MAX_PAPER_SEED}
                    step={1}
                    value={paperSeed}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      if (!Number.isFinite(value)) return;
                      setPaperSeed(normalisePaperSeed(value, paperSeed));
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setPaperSeed(nextPaperSeed(paperSeed))}
                >
                  Tạo đề khác
                </button>
                <small>
                  Ghi lại seed nếu bạn muốn tái tạo và đối chiếu đúng đề này.
                </small>
              </div>
              <p className="theory-hint">
                Ngưỡng nội bộ để tự đánh giá: tổng ≥ {MOCK_INTERNAL_GATES.passPercent}%, mỗi
                khối ≥ {MOCK_INTERNAL_GATES.perSectionPercent}%, riêng nhóm câu phân loại ≥{" "}
                {MOCK_INTERNAL_GATES.advancedPercent}%. Đây là gate học tập của dự án, không
                phải ngưỡng chọn của VOAI.
              </p>
              {latest ? (
                <p className="theory-last">
                  Lần gần nhất: <b>{latest.scorePercent}%</b> ({latest.correct}/{latest.total}{" "}
                  câu) — {new Date(latest.finishedAt).toLocaleString("vi-VN")} · seed {latest.seed}
                </p>
              ) : null}
              <button type="button" className="primary-button" onClick={startExam}>
                Bắt đầu tính giờ →
              </button>
            </div>
          ) : (
            <>
              <h2 className="theory-sr-only">Đề mock · seed {attempt.seed}</h2>
              <div className="theory-hud">
                <span className={secondsLeft < 600 ? "urgent" : ""}>{clock}</span>
                <span>
                  Đã trả lời {answeredCount}/{paper.length}
                </span>
                <span>Seed {attempt.seed}</span>
                {!attempt.submitted ? (
                  <button type="button" onClick={submitExam}>
                    Nộp bài
                  </button>
                ) : (
                  <b>Đã nộp</b>
                )}
              </div>

              {attempt.submitted && latest && verdict ? (
                <div className="theory-result">
                  <div className="theory-score">
                    <strong>{latest.scorePercent}%</strong>
                    <span>
                      {latest.correct}/{latest.total} câu đúng
                    </span>
                    <em data-theory-verdict={verdict.passed ? "pass" : "fail"}>
                      {verdict.passed ? "Đạt ngưỡng nội bộ" : "Chưa đạt ngưỡng nội bộ"}
                    </em>
                  </div>
                  {verdict.failures.length > 0 ? (
                    <ul className="theory-gate-failures" aria-label="Các ngưỡng chưa đạt">
                      {verdict.failures.map((failure) => (
                        <li key={`${failure.gate}-${failure.label}`}>
                          <b>{failure.label}</b> đạt {Math.round(failure.actualPercent)}%, cần ≥{" "}
                          {failure.requiredPercent}%
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="theory-breakdown">
                    <h3>Theo khối</h3>
                    {Object.entries(latest.bySection).map(([key, value]) => {
                      const percent = Math.round((value.correct / value.total) * 100);
                      return (
                        <p key={key} className={percent < MOCK_INTERNAL_GATES.perSectionPercent ? "weak" : ""}>
                          <span>{key}</span>
                          <b>
                            {value.correct}/{value.total} · {percent}%
                          </b>
                        </p>
                      );
                    })}
                    <h3>Theo mức độ</h3>
                    {DIFFICULTY_LEVELS.filter((d) => latest.byDifficulty[d]).map((d) => {
                      const value = latest.byDifficulty[d];
                      const percent = Math.round((value.correct / value.total) * 100);
                      const threshold =
                        d === "advanced" ? MOCK_INTERNAL_GATES.advancedPercent : 0;
                      return (
                        <p key={d} className={percent < threshold ? "weak" : ""}>
                          <span>{DIFFICULTY_PROFILES[d].label}</span>
                          <b>
                            {value.correct}/{value.total} · {percent}%
                          </b>
                        </p>
                      );
                    })}
                  </div>
                  <p className="theory-hint">
                    Ghi error ledger cho từng câu sai: mã câu, chủ đề, loại lỗi (chưa thuộc /
                    hiểu sai / tính sai / sập bẫy) và câu sửa lại bằng lời của mình.
                  </p>
                  <button type="button" className="theory-reveal" onClick={prepareNextPaper}>
                    Làm lại đề mẫu với seed mới
                  </button>
                </div>
              ) : null}

              <div className="theory-list">
                {paper.map((question, index) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    index={index}
                    section={sectionOf[question.id]}
                    response={examResponses[question.id] ?? null}
                    onChange={(value) => setExamResponse(question.id, value)}
                    revealed={Boolean(attempt?.submitted)}
                    onReveal={() => undefined}
                    examMode={!attempt?.submitted}
                    nestedHeading
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
