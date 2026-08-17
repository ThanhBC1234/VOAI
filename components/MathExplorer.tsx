"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import katex from "katex";
import { RichText } from "./RichText";
import { describeWriteStatus, partitionKnownIds, readJson, writeJson } from "../lib/local-storage";
import { checkDrillAnswer } from "../content/math/check-answer";
import {
  MATH_LEVEL_PROFILES,
  type MathDrill,
  type MathLevel,
  type MathModule,
  type MathTopic,
} from "../content/math/types";

const PROGRESS_STORAGE_KEY = "voai-math-mastered-v1";

/**
 * Kết xuất văn bản có `$…$`, `**đậm**` và `` `mã` `` — xem `RichText`.
 *
 * Giữ tên cũ để phần thân component không phải đổi. Cổng dữ liệu ở
 * `content/math/index.ts` đã bảo đảm mọi `$` đều đóng.
 */
const MathText = RichText;

function BlockFormula({ latex, reading }: { latex: string; reading: string }) {
  return (
    <div className="math-formula-card">
      <div
        className="math-formula-body"
        aria-label={latex}
        dangerouslySetInnerHTML={{
          __html: katex.renderToString(latex, {
            displayMode: true,
            throwOnError: false,
            strict: "warn",
            trust: false,
          }),
        }}
      />
      <p>{reading}</p>
    </div>
  );
}

/**
 * Một bài luyện. Đáp án chỉ được đối chiếu **sau khi** người học nhập số của
 * mình: mở lời giải trước khi thử là cách chắc chắn nhất để tưởng mình đã hiểu.
 */
function DrillCard({ drill, index }: { drill: MathDrill; index: number }) {
  const [entry, setEntry] = useState("");
  const [revealed, setRevealed] = useState(false);
  const verdict = checkDrillAnswer(entry, drill);
  const inputId = `${drill.id}-input`;

  return (
    <article
      className={`math-drill ${revealed ? (verdict === true ? "correct" : "incorrect") : ""}`}
    >
      <span className="math-drill-index">BÀI {index + 1}</span>
      <p className="math-drill-prompt">
        <MathText>{drill.prompt}</MathText>
      </p>
      <div className="math-drill-row">
        <label htmlFor={inputId}>Đáp án của bạn</label>
        <input
          id={inputId}
          inputMode="decimal"
          value={entry}
          onChange={(event) => {
            setEntry(event.target.value);
            setRevealed(false);
          }}
          placeholder="Nhập số…"
        />
        {drill.unit ? <span className="math-drill-unit">{drill.unit}</span> : null}
        <button type="button" disabled={verdict === null} onClick={() => setRevealed(true)}>
          Đối chiếu
        </button>
      </div>
      {verdict === null && entry.trim().length > 0 && (
        <p className="math-drill-hint">Chưa đọc được số. Dùng dấu chấm hoặc dấu phẩy thập phân.</p>
      )}
      {revealed && (
        <div className="math-drill-answer">
          <b>{verdict === true ? "✓ Đúng" : "× Chưa đúng"}</b>
          <p>
            Đáp án: {drill.answer}
            {drill.unit ? ` ${drill.unit}` : ""}
            {drill.tolerance > 0 ? ` (chấp nhận sai số ±${drill.tolerance})` : ""}
          </p>
          <ol>
            {drill.solution.map((line) => (
              <li key={line}>
                <MathText>{line}</MathText>
              </li>
            ))}
          </ol>
        </div>
      )}
    </article>
  );
}

function TopicPanel({
  topic,
  mastered,
  onToggleMastered,
}: {
  topic: MathTopic;
  mastered: boolean;
  onToggleMastered: () => void;
}) {
  const level = MATH_LEVEL_PROFILES[topic.level];
  return (
    <article className="math-topic" id={topic.id}>
      <header className="math-topic-head">
        <div>
          <p className="eyebrow">{level.label.toUpperCase()}</p>
          <h2>
            <MathText>{topic.title}</MathText>
          </h2>
          <p className="math-topic-use">
            <MathText>{topic.examUse}</MathText>
          </p>
          <p className="math-level-meaning">{level.meaning}</p>
        </div>
        <button
          type="button"
          className={`math-mastery-toggle ${mastered ? "done" : ""}`}
          aria-pressed={mastered}
          onClick={onToggleMastered}
        >
          {mastered ? "Đã nắm ✓" : "Đánh dấu đã nắm"}
        </button>
      </header>

      <section aria-labelledby={`${topic.id}-ideas`}>
        <h3 id={`${topic.id}-ideas`}>Ý cốt lõi</h3>
        <ul className="math-idea-list">
          {topic.keyIdeas.map((idea) => (
            <li key={idea}>
              <MathText>{idea}</MathText>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby={`${topic.id}-formulas`}>
        <h3 id={`${topic.id}-formulas`}>Công thức phải thuộc</h3>
        <div className="math-formula-grid">
          {topic.formulas.map((formula) => (
            <BlockFormula key={formula.latex} latex={formula.latex} reading={formula.reading} />
          ))}
        </div>
      </section>

      <section aria-labelledby={`${topic.id}-worked`}>
        <h3 id={`${topic.id}-worked`}>Ví dụ giải mẫu</h3>
        <p className="math-worked-prompt">
          <MathText>{topic.worked.prompt}</MathText>
        </p>
        <ol className="math-worked-steps">
          {topic.worked.steps.map((step) => (
            <li key={step}>
              <MathText>{step}</MathText>
            </li>
          ))}
        </ol>
        <p className="math-worked-answer">
          <strong>Kết quả: </strong>
          <MathText>{topic.worked.answer}</MathText>
        </p>
      </section>

      <section aria-labelledby={`${topic.id}-pitfalls`}>
        <h3 id={`${topic.id}-pitfalls`}>Bẫy thường gặp</h3>
        <ul className="math-pitfall-list">
          {topic.pitfalls.map((pitfall) => (
            <li key={pitfall}>
              <MathText>{pitfall}</MathText>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby={`${topic.id}-drills`}>
        <h3 id={`${topic.id}-drills`}>Tự luyện ({topic.drills.length} bài)</h3>
        <div className="math-drill-list">
          {topic.drills.map((drill, index) => (
            <DrillCard drill={drill} index={index} key={drill.id} />
          ))}
        </div>
      </section>

      <section aria-labelledby={`${topic.id}-appears`}>
        <h3 id={`${topic.id}-appears`}>Gặp lại ở đâu trong lộ trình</h3>
        <ul className="math-appears-list">
          {topic.appearsIn.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </article>
  );
}

function acceptIdList(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  return value.every((item) => typeof item === "string") ? (value as string[]) : null;
}

export function MathExplorer({ modules }: { modules: readonly MathModule[] }) {
  const topics = useMemo(() => modules.flatMap((group) => group.topics), [modules]);
  const topicIds = useMemo(() => new Set(topics.map((topic) => topic.id)), [topics]);
  const moduleOfTopic = useMemo(() => {
    const map = new Map<string, MathModule>();
    for (const group of modules) {
      for (const topic of group.topics) map.set(topic.id, group);
    }
    return map;
  }, [modules]);

  const defaultTopicId = topics[0]?.id ?? "";
  const [selectedId, setSelectedId] = useState(defaultTopicId);
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<MathLevel | "all">("all");
  const [mastered, setMastered] = useState<string[]>([]);
  const [storageNotice, setStorageNotice] = useState<string | null>(null);
  /** Id đã lưu nhưng không còn trong nội dung; giữ lại để không xoá tiến độ cũ. */
  const archivedRef = useRef<string[]>([]);

  const syncUrl = useCallback((id: string, mode: "push" | "replace") => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("topic") === id) return;
    url.searchParams.set("topic", id);
    window.history[mode === "push" ? "pushState" : "replaceState"]({ topic: id }, "", url);
  }, []);

  /**
   * Deep link lúc vào trang và nút back/forward của trình duyệt.
   *
   * Khi lùi về một mục lịch sử **không** có `?topic`, phải quay lại chủ đề mặc
   * định. Nếu chỉ xử lý trường hợp có tham số, thanh địa chỉ sẽ nói một đằng
   * còn nội dung hiển thị một nẻo sau lần bấm Back đầu tiên.
   */
  useEffect(() => {
    const apply = () => {
      const requested = new URLSearchParams(window.location.search).get("topic");
      if (requested === null) {
        setSelectedId(defaultTopicId);
        return;
      }
      if (topicIds.has(requested)) setSelectedId(requested);
    };
    const timer = window.setTimeout(apply, 0);
    window.addEventListener("popstate", apply);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("popstate", apply);
    };
  }, [defaultTopicId, topicIds]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = readJson(PROGRESS_STORAGE_KEY, acceptIdList, [] as string[]);
      const { active, archived } = partitionKnownIds(stored, topicIds);
      archivedRef.current = archived;
      setMastered(active);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [topicIds]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("vi");
    return topics.filter((topic) => {
      if (level !== "all" && topic.level !== level) return false;
      if (!normalized) return true;
      const haystack =
        `${topic.title} ${topic.examUse} ${topic.keyIdeas.join(" ")}`.toLocaleLowerCase("vi");
      return haystack.includes(normalized);
    });
  }, [level, query, topics]);

  const selected = topics.find((topic) => topic.id === selectedId) ?? topics[0];
  const masteredSet = useMemo(() => new Set(mastered), [mastered]);

  if (!selected) {
    return <p className="empty-state">Chưa có chủ đề toán nào.</p>;
  }

  function chooseTopic(id: string) {
    setSelectedId(id);
    syncUrl(id, "push");
  }

  function toggleMastered(id: string) {
    const next = masteredSet.has(id)
      ? mastered.filter((item) => item !== id)
      : [...mastered, id];
    setMastered(next);
    // Ghi kèm phần archived: đổi nội dung không được xoá tiến độ đã có.
    setStorageNotice(
      describeWriteStatus(writeJson(PROGRESS_STORAGE_KEY, [...next, ...archivedRef.current])),
    );
  }

  const percent = topics.length === 0 ? 0 : Math.round((mastered.length / topics.length) * 100);

  return (
    <section className="math-app" aria-label="Lớp Toán cho VOAI">
      <div className="math-progress-strip">
        <div>
          <span>TIẾN ĐỘ CỤC BỘ</span>
          <strong>
            {mastered.length}/{topics.length} chủ đề · {percent}%
          </strong>
        </div>
        <div className="progress-track">
          <i style={{ width: `${percent}%` }} />
        </div>
        <p>
          Tiến độ chỉ nằm trên thiết bị này. Đánh dấu “đã nắm” sau khi làm đúng bài luyện mà
          không mở lời giải.
        </p>
      </div>
      {storageNotice && (
        <p className="save-message" role="status">
          {storageNotice}
        </p>
      )}

      <div className="math-shell">
        <aside className="math-catalog" aria-label="Danh mục chủ đề toán">
          <div className="math-filters">
            <label>
              <span>Tìm chủ đề</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="gradient, Bayes, entropy…"
              />
            </label>
            <label>
              <span>Mức độ</span>
              <select
                value={level}
                onChange={(event) => setLevel(event.target.value as MathLevel | "all")}
              >
                <option value="all">Tất cả</option>
                <option value="core">Bắt buộc thuộc</option>
                <option value="applied">Vận dụng</option>
                <option value="advanced">Câu phân loại</option>
              </select>
            </label>
            <p>
              {filtered.length}/{topics.length} chủ đề khớp bộ lọc
            </p>
          </div>

          {modules.map((group) => {
            const visible = group.topics.filter((topic) =>
              filtered.some((item) => item.id === topic.id),
            );
            if (visible.length === 0) return null;
            const done = group.topics.filter((topic) => masteredSet.has(topic.id)).length;
            return (
              <div className="math-module-group" key={group.id} data-math-module={group.id}>
                <div className="math-module-head">
                  <strong>{group.title}</strong>
                  <span>
                    {done}/{group.topics.length}
                  </span>
                  <p>
                    <MathText>{group.purpose}</MathText>
                  </p>
                  <small>
                    Cần trước: <MathText>{group.prerequisite}</MathText>
                  </small>
                </div>
                <div className="math-topic-list">
                  {visible.map((topic) => {
                    const active = topic.id === selected.id;
                    return (
                      <button
                        type="button"
                        key={topic.id}
                        data-math-topic={topic.id}
                        className={active ? "active" : ""}
                        aria-current={active ? "true" : undefined}
                        onClick={() => chooseTopic(topic.id)}
                      >
                        <strong>{topic.title}</strong>
                        <small>
                          {MATH_LEVEL_PROFILES[topic.level].label} · {topic.drills.length} bài luyện
                          {masteredSet.has(topic.id) ? " · đã nắm" : ""}
                        </small>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <p className="empty-state">Không có chủ đề nào khớp bộ lọc.</p>}
        </aside>

        <div className="math-workspace">
          <p className="math-breadcrumb">
            {moduleOfTopic.get(selected.id)?.title ?? "Toán"} → {selected.title}
          </p>
          <TopicPanel
            topic={selected}
            mastered={masteredSet.has(selected.id)}
            onToggleMastered={() => toggleMastered(selected.id)}
          />
        </div>
      </div>
    </section>
  );
}
