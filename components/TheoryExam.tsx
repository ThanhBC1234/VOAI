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
import { readJson, readRaw, removeKey, writeJson } from "../lib/local-storage";

const STORAGE_KEY = "voai-theory-attempts-v1";

type Response = number | number[] | boolean[] | string | null;
type Props = {
  questions: readonly TheoryQuestion[];
  sectionOf: Readonly<Record<string, PaperSection>>;
  paperIds: readonly string[];
};

/* ---------------- chấm điểm ---------------- */

function hasCompleteResponse(question: TheoryQuestion, response: Response): boolean {
  if (response === null || response === undefined) return false;
  switch (question.format) {
    case "single-choice":
      return typeof response === "number";
    case "multi-select":
      return Array.isArray(response) && response.length > 0;
    case "true-false-set":
      return (
        Array.isArray(response) &&
        question.statements.every((_, index) => typeof response[index] === "boolean")
      );
    case "numeric": {
      const text = String(response).trim().replace(",", ".");
      return text.length > 0 && Number.isFinite(Number(text));
    }
    case "short-text":
      return String(response).trim().length > 0;
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
      const picked = response as boolean[];
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
            <button
              type="button"
              key={choice}
              role="radio"
              aria-checked={response === index}
              aria-disabled={locked || undefined}
              disabled={locked}
              className={response === index ? "picked" : ""}
              onClick={() => onChange(index)}
            >
              <span aria-hidden="true">{String.fromCharCode(65 + index)}</span>
              <em>
                <RichText>{choice}</RichText>
              </em>
            </button>
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
      const picked = Array.isArray(response) ? (response as boolean[]) : [];
      return (
        <div className="theory-tf">
          {question.statements.map((statement, index) => (
            <div key={statement.text}>
              <p id={`tf-${question.id}-${index}`}>
                <b>{String.fromCharCode(97 + index)})</b> <RichText>{statement.text}</RichText>
              </p>
              {/* Mỗi mệnh đề là một radiogroup Đúng/Sai riêng, gắn nhãn bằng
                  chính nội dung mệnh đề để trình đọc màn hình đọc đủ ngữ cảnh. */}
              <div role="radiogroup" aria-labelledby={`tf-${question.id}-${index}`}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={picked[index] === true}
                  aria-disabled={locked || undefined}
                  disabled={locked}
                  className={picked[index] === true ? "picked" : ""}
                  onClick={() => {
                    const next = [...picked];
                    next[index] = true;
                    onChange(next);
                  }}
                >
                  Đúng
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={picked[index] === false}
                  aria-disabled={locked || undefined}
                  disabled={locked}
                  className={picked[index] === false ? "picked" : ""}
                  onClick={() => {
                    const next = [...picked];
                    next[index] = false;
                    onChange(next);
                  }}
                >
                  Sai
                </button>
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
            value={response === null ? "" : String(response)}
            onChange={(event) => onChange(event.target.value)}
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
            value={response === null ? "" : String(response)}
            onChange={(event) => onChange(event.target.value)}
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
}: {
  question: TheoryQuestion;
  index: number;
  section: PaperSection;
  response: Response;
  onChange: (value: Response) => void;
  revealed: boolean;
  onReveal: () => void;
  examMode: boolean;
}) {
  const answered = hasCompleteResponse(question, response);
  /**
   * Cấp heading phải khớp ngữ cảnh, không cố định.
   *
   * Chế độ Luyện đặt thẻ câu hỏi ngay dưới `<h1>` của trang, nên đề bài là
   * `h2`. Chế độ Thi thử có thêm `<h2>Đề mock …</h2>` bao ngoài, nên đề bài
   * xuống `h3`. Cố định một cấp sẽ tạo bước nhảy h1→h3 ở chế độ Luyện — trình
   * đọc màn hình hiểu là có một mục cha bị thiếu.
   */
  const Stem = examMode ? "h3" : "h2";
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
  // THEORY-P1-01: hai chế độ giữ đáp án riêng biệt. Trước đây dùng chung một
  // `responses`, nên trả lời ở Luyện tập sẽ tự điền vào bài thi đang mở.
  const [practiceResponses, setPracticeResponses] = useState<Record<string, Response>>({});
  const [examResponses, setExamResponses] = useState<Record<string, Response>>({});
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const [attempt, setAttempt] = useState<ActiveAttempt | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [attempts, setAttempts] = useState<StoredAttempt[]>([]);
  const examResponsesRef = useRef<Record<string, Response>>({});
  const submittingRef = useRef(false);
  /** Bản ghi lịch sử chưa diễn giải được; luôn được ghi lại kèm, không vứt đi. */
  const unreadableRef = useRef<unknown[]>([]);
  /** Bản sao của `attempts` để `submitExam` ghi storage mà không cần phụ thuộc state. */
  const attemptsRef = useRef<StoredAttempt[]>([]);

  const byId = useMemo(() => new Map(questions.map((q) => [q.id, q])), [questions]);
  const knownIds = useMemo(() => new Set(questions.map((q) => q.id)), [questions]);
  // Đề của attempt là snapshot cố định lúc bắt đầu; ngoài attempt thì dùng đề mẫu.
  const paper = useMemo(() => {
    const ids = attempt ? attempt.questionIds : paperIds;
    return ids.map((id) => byId.get(id)).filter((q): q is TheoryQuestion => Boolean(q));
  }, [attempt, paperIds, byId]);

  // Đi qua `lib/local-storage.ts` như mọi màn hình khác: các hàm ở đó không bao
  // giờ ném, kể cả khi storage bị chặn hoặc đầy.
  const persistAttempt = useCallback((next: ActiveAttempt | null) => {
    if (next) writeJson(ACTIVE_ATTEMPT_STORAGE_KEY, next);
    else removeKey(ACTIVE_ATTEMPT_STORAGE_KEY);
  }, []);

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

      const restored = parseActiveAttempt(readRaw(ACTIVE_ATTEMPT_STORAGE_KEY));
      if (restored && !restored.submitted && activeAttemptIsUsable(restored, knownIds)) {
        setAttempt(restored);
        const responses = restored.responses as Record<string, Response>;
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
  }, [knownIds, persistAttempt]);

  const filtered = useMemo(
    () =>
      questions.filter(
        (q) =>
          (section === "Tất cả" || sectionOf[q.id] === section) &&
          (level === "Tất cả" || q.difficulty === level) &&
          `${q.stem} ${q.syllabusId}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [questions, section, level, query, sectionOf],
  );

  const setPracticeResponse = (id: string, value: Response) =>
    setPracticeResponses((current) => ({ ...current, [id]: value }));

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

  const reveal = (id: string) =>
    setRevealed((current) => {
      const next = new Set(current);
      next.add(id);
      return next;
    });

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
      seed: 1,
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
  }, [paper, sectionOf, persistAttempt]);

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
      paperIds,
      Date.now(),
      `attempt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo nội dung hoặc mã chủ đề…"
              aria-label="Tìm câu hỏi"
            />
            <select
              value={section}
              onChange={(event) => setSection(event.target.value)}
              aria-label="Lọc theo khối"
            >
              {["Tất cả", ...PAPER_SECTIONS].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <select
              value={level}
              onChange={(event) => setLevel(event.target.value)}
              aria-label="Lọc theo mức độ"
            >
              <option value="Tất cả">Tất cả mức độ</option>
              {DIFFICULTY_LEVELS.map((item) => (
                <option key={item} value={item}>
                  {DIFFICULTY_PROFILES[item].label}
                </option>
              ))}
            </select>
            <span className="theory-count">
              {filtered.length}/{questions.length} câu
            </span>
          </div>
          <div className="theory-list">
            {filtered.slice(0, 40).map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                section={sectionOf[question.id]}
                response={practiceResponses[question.id] ?? null}
                onChange={(value) => setPracticeResponse(question.id, value)}
                revealed={revealed.has(question.id)}
                onReveal={() => reveal(question.id)}
                examMode={false}
              />
            ))}
            {filtered.length > 40 ? (
              <p className="theory-hint">
                Đang hiển thị 40 câu đầu. Thu hẹp bộ lọc để xem phần còn lại.
              </p>
            ) : null}
            {filtered.length === 0 ? (
              <p className="empty-state">Không có câu nào khớp bộ lọc.</p>
            ) : null}
          </div>
        </>
      ) : (
        <div className="theory-exam">
          {!attempt ? (
            <div className="theory-start">
              <h2>Đề mock {paper.length} câu · {MOCK_DURATION_MINUTES} phút</h2>
              <p>
                Website hiện dùng đề mẫu được lắp tất định với seed nội bộ 1, nên các lần
                làm có cùng bộ câu để đối chiếu tiến bộ. Làm một mạch, đóng tài liệu,
                không hỏi AI — đó là điều kiện để con số thu được có ý nghĩa.
              </p>
              <p className="theory-hint">
                Ngưỡng nội bộ để tự đánh giá: tổng ≥ {MOCK_INTERNAL_GATES.passPercent}%, mỗi
                khối ≥ {MOCK_INTERNAL_GATES.perSectionPercent}%, riêng nhóm câu phân loại ≥{" "}
                {MOCK_INTERNAL_GATES.advancedPercent}%. Đây là gate học tập của dự án, không
                phải ngưỡng chọn của VOAI.
              </p>
              {latest ? (
                <p className="theory-last">
                  Lần gần nhất: <b>{latest.scorePercent}%</b> ({latest.correct}/{latest.total}{" "}
                  câu) — {new Date(latest.finishedAt).toLocaleString("vi-VN")}
                </p>
              ) : null}
              <button type="button" className="primary-button" onClick={startExam}>
                Bắt đầu tính giờ →
              </button>
            </div>
          ) : (
            <>
              <div className="theory-hud">
                <span className={secondsLeft < 600 ? "urgent" : ""}>{clock}</span>
                <span>
                  Đã trả lời {answeredCount}/{paper.length}
                </span>
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
                  <button type="button" className="theory-reveal" onClick={discardAttempt}>
                    Làm lại đề mẫu
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
