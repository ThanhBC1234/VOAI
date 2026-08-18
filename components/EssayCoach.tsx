"use client";

import { useEffect, useRef, useState } from "react";
import { InternalLink } from "./InternalLink";
import { loadCoachIndex } from "../lib/coach-index";
import { searchCoach, socraticChallenge, type CoachHit } from "../lib/coach-search";
import type { SearchableCoachIndex } from "../lib/coach-search";

/**
 * Trợ giảng cho phần tự luận — tra cứu giáo trình, **không** trả lời thay.
 *
 * Ba quyết định thiết kế đều bắt nguồn từ một điều: đây là công cụ luyện thi,
 * người học chưa đủ nền để phát hiện một câu trả lời sai.
 *
 * 1. **Không có mô hình ngôn ngữ.** Mọi câu chữ hiện ra đều là nguyên văn nội
 *    dung đã kiểm định trong repo (350 câu lý thuyết, 78 bài giảng, lớp Toán),
 *    được xếp hạng bằng BM25 chạy tại chỗ. Không có đường nào để nó bịa. Đổi
 *    lại, nó không chấm được bài tự luận — và như thế là đúng vai.
 * 2. **Cổng SOLO-90.** Trợ giảng khoá cho tới khi người học tự viết xong phần
 *    retrieval. Hợp đồng học tập của dự án nói rõ: "COACH-10 chỉ được dùng sau
 *    khi đã lưu giả thuyết, code và test của mình". Mở sẵn từ đầu là biến một
 *    bài kiểm tra trí nhớ thành một bài tra cứu.
 * 3. **Mỗi kết quả kèm một câu phản biện**, không kèm kết luận. Xem
 *    `socraticChallenge` trong `lib/coach-search.ts`.
 */

/** Số ký tự tối thiểu để một câu trả lời được tính là "đã tự viết". */
const MINIMUM_ANSWER_LENGTH = 40;

export interface EssayCoachProps {
  /** Bài retrieval người học đang viết, theo đúng thứ tự câu hỏi. */
  retrievalAnswers: readonly string[];
}

/** Đếm số câu retrieval đã có bài đủ dài của chính người học. */
export function countOwnAnswers(answers: readonly string[]): number {
  return answers.filter((answer) => answer.trim().length >= MINIMUM_ANSWER_LENGTH).length;
}

type LoadState = "loading" | "ready" | "error";

export function EssayCoach({ retrievalAnswers }: EssayCoachProps) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [hits, setHits] = useState<CoachHit[] | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [attempt, setAttempt] = useState(0);
  const index = useRef<SearchableCoachIndex | null>(null);

  const answered = countOwnAnswers(retrievalAnswers);
  const required = retrievalAnswers.length;
  const unlocked = required > 0 && answered === required;

  /**
   * Tải chỉ mục ngay khi bảng mở, chứ không đợi tới lúc bấm tìm: người học vừa
   * gõ xong câu hỏi là có kết quả luôn, không phải chờ 130 KB tải về.
   *
   * `state` **không** được nằm trong danh sách phụ thuộc. Trước đây nó nằm ở
   * đó cùng với một `setState("loading")` ngay trong thân effect, nên chính lần
   * đặt state ấy làm danh sách phụ thuộc đổi → cleanup chạy → `cancelled` bật
   * lên → kết quả tải về bị vứt đi và nút "Tra" kẹt ở "Đang tải…" vĩnh viễn,
   * dù request đã trả 200. Việc đổi trạng thái chỉ xảy ra trong callback bất
   * đồng bộ hoặc trong trình xử lý sự kiện.
   */
  useEffect(() => {
    if (!open || !unlocked || index.current) return;
    let cancelled = false;
    loadCoachIndex()
      .then((value) => {
        if (cancelled) return;
        index.current = value;
        setState("ready");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [open, unlocked, attempt]);

  function retry() {
    setState("loading");
    setAttempt((value) => value + 1);
  }

  function ask() {
    if (!index.current) return;
    setHits(searchCoach(index.current, question, 4));
  }

  if (!unlocked) {
    return (
      <div className="coach-locked">
        <strong>Trợ giảng đang khoá — SOLO-90</strong>
        <p>
          Viết xong câu trả lời của chính bạn cho cả {required} câu retrieval (mỗi câu từ{" "}
          {MINIMUM_ANSWER_LENGTH} ký tự) thì trợ giảng mới mở. Đây là quy tắc tự bảo vệ: mở sẵn từ
          đầu sẽ biến bài kiểm tra trí nhớ thành bài tra cứu.
        </p>
        <p className="coach-progress">
          Đã tự viết <strong>{answered}</strong>/{required} câu.
        </p>
      </div>
    );
  }

  return (
    <div className="coach-panel">
      <button type="button" className="coach-toggle" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        {open ? "Đóng trợ giảng" : "Mở trợ giảng tra cứu"}
      </button>

      {open ? (
        <div className="coach-body">
          <p className="coach-contract">
            Trợ giảng chỉ tra <strong>nguyên văn</strong> giáo trình của bạn — 350 câu lý thuyết, 78
            bài giảng và lớp Toán. Nó không viết code, không chấm bài và không kết luận thay bạn.
          </p>

          {/* Cố ý **không** dùng <form>: bảng này nằm bên trong phiếu nộp bài,
              mà <form> lồng <form> là HTML không hợp lệ — trình duyệt bỏ form
              trong, nên nút "Tra" sẽ nộp luôn cả bài làm của người học. Nút để
              type="button" và phím Enter được xử lý riêng. */}
          <div className="coach-form">
            <label htmlFor="coach-question">Hỏi một ý nhỏ</label>
            <div className="coach-input-row">
              <input
                id="coach-question"
                type="search"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return;
                  event.preventDefault();
                  ask();
                }}
                placeholder="ví dụ: vì sao MSE nhạy với ngoại lai"
              />
              <button
                type="button"
                onClick={ask}
                disabled={state !== "ready" || question.trim().length === 0}
              >
                {state === "loading" ? "Đang tải…" : "Tra"}
              </button>
            </div>
          </div>

          {state === "error" ? (
            <p className="coach-empty" role="alert">
              Không tải được chỉ mục tra cứu. Kiểm tra mạng rồi{" "}
              <button type="button" className="coach-retry" onClick={retry}>
                thử lại
              </button>
              . Lần tải hỏng không bị ghi nhớ, nên lần thử sau vẫn tải thật.
            </p>
          ) : null}

          <div className="coach-results" aria-live="polite">
            {hits === null ? null : hits.length === 0 ? (
              <p className="coach-empty">
                Không có trong giáo trình. Trợ giảng chỉ trả lời từ nội dung đã kiểm định của dự án —
                nếu câu này nằm ngoài phạm vi, hãy tự tra nguồn gốc rồi ghi lại vào nhật ký.
              </p>
            ) : (
              <ol className="coach-hit-list">
                {hits.map((hit) => (
                  <li key={`${hit.record.kind}-${hit.record.title}`}>
                    <span className="coach-kind">{KIND_LABELS[hit.record.kind]}</span>
                    <strong>{hit.record.title}</strong>
                    <p>{hit.record.body}</p>
                    <p className="coach-challenge">{socraticChallenge(hit.record.kind)}</p>
                    <InternalLink href={hit.record.href}>Mở nguồn đầy đủ →</InternalLink>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

const KIND_LABELS: Record<CoachHit["record"]["kind"], string> = {
  theory: "Lý thuyết",
  lesson: "Bài giảng",
  failure: "Lỗi thường gặp",
  complexity: "Độ phức tạp",
  math: "Toán",
  pitfall: "Bẫy",
};
