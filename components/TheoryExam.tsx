"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const STORAGE_KEY = "voai-theory-attempts-v1";

type Response = number | number[] | boolean[] | string | null;
type Props = {
  questions: readonly TheoryQuestion[];
  sectionOf: Readonly<Record<string, PaperSection>>;
  paperIds: readonly string[];
};

type StoredAttempt = {
  seed: number;
  finishedAt: string;
  scorePercent: number;
  correct: number;
  total: number;
  bySection: Record<string, { correct: number; total: number }>;
  byDifficulty: Record<string, { correct: number; total: number }>;
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
    case "single-choice":
      return (
        <div className="theory-choices">
          {question.choices.map((choice, index) => (
            <button
              type="button"
              key={choice}
              disabled={locked}
              className={response === index ? "picked" : ""}
              onClick={() => onChange(index)}
            >
              <span>{String.fromCharCode(65 + index)}</span>
              <em>{choice}</em>
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
              <span>{picked.includes(index) ? "✓" : ""}</span>
              <em>{choice}</em>
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
              <p>
                <b>{String.fromCharCode(97 + index)})</b> {statement.text}
              </p>
              <div>
                <button
                  type="button"
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
                <b>{String.fromCharCode(65 + index)}.</b> {question.choiceNotes[index]}
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
              {statement.note}
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
            <li key={step}>{step}</li>
          ))}
        </ol>
      ) : null}

      <p>{question.explanation}</p>
      {question.trap ? (
        <p className="theory-trap">
          <b>Bẫy:</b> {question.trap}
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
      <h3>{question.stem}</h3>
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
  const [responses, setResponses] = useState<Record<string, Response>>({});
  const responsesRef = useRef<Record<string, Response>>({});
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(MOCK_DURATION_MINUTES * 60);
  const [attempts, setAttempts] = useState<StoredAttempt[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submittedRef = useRef(false);

  const byId = useMemo(() => new Map(questions.map((q) => [q.id, q])), [questions]);
  const paper = useMemo(
    () => paperIds.map((id) => byId.get(id)).filter((q): q is TheoryQuestion => Boolean(q)),
    [paperIds, byId],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
        if (Array.isArray(parsed)) setAttempts(parsed as StoredAttempt[]);
      } catch {
        setAttempts([]);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

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

  const setResponse = (id: string, value: Response) =>
    setResponses((current) => {
      const next = { ...current, [id]: value };
      responsesRef.current = next;
      return next;
    });

  const reveal = (id: string) =>
    setRevealed((current) => {
      const next = new Set(current);
      next.add(id);
      return next;
    });

  const submitExam = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setExamSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const bySection: Record<string, { correct: number; total: number }> = {};
    const byDifficulty: Record<string, { correct: number; total: number }> = {};
    let earned = 0;
    let possible = 0;
    let correctCount = 0;

    for (const question of paper) {
      const ok = isCorrect(question, responsesRef.current[question.id] ?? null);
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

    const attempt: StoredAttempt = {
      seed: 1,
      finishedAt: new Date().toISOString(),
      scorePercent: possible > 0 ? Math.round((earned / possible) * 100) : 0,
      correct: correctCount,
      total: paper.length,
      bySection,
      byDifficulty,
    };
    const next = [attempt, ...attempts].slice(0, 20);
    setAttempts(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* localStorage đầy hoặc bị chặn: kết quả vẫn hiển thị trong phiên này. */
    }
  }, [attempts, paper, sectionOf]);

  const submitExamRef = useRef(submitExam);
  useEffect(() => {
    submitExamRef.current = submitExam;
  }, [submitExam]);

  useEffect(() => {
    if (!examStarted || examSubmitted) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.setTimeout(() => submitExamRef.current(), 0);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examStarted, examSubmitted]);

  function restartExam() {
    if (timerRef.current) clearInterval(timerRef.current);
    submittedRef.current = false;
    setResponses((current) => {
      const next = { ...current };
      for (const question of paper) delete next[question.id];
      responsesRef.current = next;
      return next;
    });
    setExamStarted(false);
    setExamSubmitted(false);
    setSecondsLeft(MOCK_DURATION_MINUTES * 60);
  }

  const latest = attempts[0];
  const clock = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(
    secondsLeft % 60,
  ).padStart(2, "0")}`;
  const answeredCount = paper.filter((q) =>
    hasCompleteResponse(q, responses[q.id] ?? null),
  ).length;

  return (
    <section className="theory-app">
      <div className="theory-modes">
        <button
          type="button"
          className={mode === "practice" ? "active" : ""}
          onClick={() => setMode("practice")}
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
                response={responses[question.id] ?? null}
                onChange={(value) => setResponse(question.id, value)}
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
          {!examStarted ? (
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
              <button type="button" className="primary-button" onClick={() => setExamStarted(true)}>
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
                {!examSubmitted ? (
                  <button type="button" onClick={submitExam}>
                    Nộp bài
                  </button>
                ) : (
                  <b>Đã nộp</b>
                )}
              </div>

              {examSubmitted && latest ? (
                <div className="theory-result">
                  <div className="theory-score">
                    <strong>{latest.scorePercent}%</strong>
                    <span>
                      {latest.correct}/{latest.total} câu đúng
                    </span>
                    <em>
                      {latest.scorePercent >= MOCK_INTERNAL_GATES.passPercent
                        ? "Đạt ngưỡng nội bộ"
                        : "Chưa đạt ngưỡng nội bộ"}
                    </em>
                  </div>
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
                  <button type="button" className="theory-reveal" onClick={restartExam}>
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
                    response={responses[question.id] ?? null}
                    onChange={(value) => setResponse(question.id, value)}
                    revealed={examSubmitted}
                    onReveal={() => undefined}
                    examMode={!examSubmitted}
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
