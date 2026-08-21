"use client";

import { useMemo, useState, type CSSProperties } from "react";
import type {
  LessonPractice,
  PracticalIllustration,
  PracticalScalar,
} from "../content/lesson-practice/types";
import { InternalLink } from "./InternalLink";
import { practicalBarGeometry } from "../lib/lesson-practice-visual";

function pythonLiteral(value: PracticalScalar): string {
  if (typeof value === "boolean") return value ? "True" : "False";
  if (typeof value === "number") return String(value);
  return JSON.stringify(value);
}

function renderCode(template: string, parameters: Record<string, PracticalScalar>): string {
  return template.replace(/\{\{([a-z][a-z0-9_]*)\}\}/g, (token, key: string) =>
    Object.hasOwn(parameters, key) ? pythonLiteral(parameters[key]) : token,
  );
}

function CopyCodeButton({ code }: { code: string }) {
  const [status, setStatus] = useState("Sao chép code");
  const copy = async () => {
    try {
      if (!navigator.clipboard) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(code);
      setStatus("Đã sao chép");
    } catch {
      setStatus("Không sao chép được");
    }
  };

  return <button type="button" className="practice-copy" onClick={copy}>{status}</button>;
}

function toneClass(tone: string | undefined): string {
  return ` tone-${tone ?? "base"}`;
}

function Illustration({ visual }: { visual: PracticalIllustration }) {
  if (visual.kind === "sequence") {
    return (
      <figure className={`practice-visual practice-sequence is-${visual.layout}`}>
        <figcaption><strong>{visual.title}</strong><span>{visual.caption}</span></figcaption>
        <ol>
          {visual.items.map((item, index) => (
            <li className={toneClass(item.tone)} key={`${index}-${item.label}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item.label}</strong>
              {item.value && <code>{item.value}</code>}
              {item.detail && <small>{item.detail}</small>}
            </li>
          ))}
        </ol>
      </figure>
    );
  }

  if (visual.kind === "bars") {
    const min = visual.min ?? Math.min(0, ...visual.items.map((item) => item.value));
    const max = visual.max ?? Math.max(0, ...visual.items.map((item) => item.value));
    return (
      <figure className="practice-visual practice-bars">
        <figcaption><strong>{visual.title}</strong><span>{visual.caption}</span></figcaption>
        <div>
          {visual.items.map((item) => {
            const geometry = practicalBarGeometry(item.value, min, max);
            return <div className={toneClass(item.tone)} key={item.label}><span>{item.label}</span><i style={{ "--practice-bar-left": `${geometry.left}%`, "--practice-bar": `${geometry.width}%`, "--practice-zero": `${geometry.zero}%` } as CSSProperties}/><strong>{item.display ?? item.value}</strong></div>;
          })}
        </div>
      </figure>
    );
  }

  if (visual.kind === "matrix") {
    const flat = visual.values.flat();
    const maxAbs = Math.max(1e-9, ...flat.map((value) => Math.abs(value)));
    const scale = visual.scale ?? "sequential";
    return (
      <figure className={`practice-visual practice-matrix is-${scale}`}>
        <figcaption><strong>{visual.title}</strong><span>{visual.caption}</span></figcaption>
        <div className="practice-table-scroll"><table><thead><tr><th scope="col">×</th>{visual.columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead><tbody>{visual.rows.map((row, rowIndex) => <tr key={row}><th scope="row">{row}</th>{visual.values[rowIndex].map((value, columnIndex) => {
          const polarity = scale === "diverging"
            ? value < 0
              ? "is-negative"
              : value > 0
                ? "is-positive"
                : "is-zero"
            : undefined;
          return (
            <td
              className={polarity}
              key={`${rowIndex}-${columnIndex}`}
              style={{ "--practice-cell": `${Math.min(1, Math.abs(value) / maxAbs) * 72}%` } as CSSProperties}
            >
              {visual.displayValues?.[rowIndex]?.[columnIndex] ?? value}
            </td>
          );
        })}</tr>)}</tbody></table></div>
      </figure>
    );
  }

  if (visual.kind === "plot") {
    const allPoints = visual.series.flatMap((series) => series.points);
    const xs = allPoints.map((point) => point.x); const ys = allPoints.map((point) => point.y);
    const minX = Math.min(...xs); const maxX = Math.max(...xs); const minY = Math.min(...ys); const maxY = Math.max(...ys);
    const xSpan = maxX - minX || 1; const ySpan = maxY - minY || 1;
    return (
      <figure className="practice-visual practice-plot">
        <figcaption><strong>{visual.title}</strong><span>{visual.caption}</span></figcaption>
        <div className="practice-plot-stage" aria-hidden="true">
          {visual.connect && (
            <svg className="practice-plot-lines" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
              {visual.series.map((series, seriesIndex) => (
                <polyline
                  className={toneClass(series.tone)}
                  key={`${seriesIndex}-${series.label}`}
                  points={series.points.map((point) => {
                    const x = ((point.x - minX) / xSpan) * 100;
                    const y = 100 - ((point.y - minY) / ySpan) * 100;
                    return `${x},${y}`;
                  }).join(" ")}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
          )}
          {visual.series.flatMap((series, seriesIndex) => series.points.map((point, pointIndex) => <i className={toneClass(series.tone)} key={`${seriesIndex}-${pointIndex}`} style={{ left: `${((point.x - minX) / xSpan) * 100}%`, bottom: `${((point.y - minY) / ySpan) * 100}%` }}/>) )}
        </div>
        <details><summary>Xem dữ liệu biểu đồ</summary><div className="practice-table-scroll"><table><thead><tr><th>Chuỗi</th><th>{visual.xLabel}</th><th>{visual.yLabel}</th></tr></thead><tbody>{visual.series.flatMap((series) => series.points.map((point, index) => <tr key={`${series.label}-${index}`}><th scope="row">{point.label ?? series.label}</th><td>{point.x}</td><td>{point.y}</td></tr>))}</tbody></table></div></details>
      </figure>
    );
  }

  const maxWeight = Math.max(1, ...visual.items.map((item) => Math.abs(item.weight ?? 0)));
  return (
    <figure className="practice-visual practice-tokens">
      <figcaption><strong>{visual.title}</strong><span>{visual.caption}</span></figcaption>
      <div>{visual.items.map((item, index) => <span className={toneClass(item.tone)} style={{ "--practice-token": `${Math.abs(item.weight ?? 0) / maxWeight * 60}%` } as CSSProperties} key={`${index}-${item.label}`}><strong>{item.label}</strong>{item.weight !== undefined && <small>{item.weight.toFixed(2)}</small>}</span>)}</div>
    </figure>
  );
}

export function LessonPracticalContent({ practice }: { practice: LessonPractice }) {
  const [variantId, setVariantId] = useState(practice.experiment.defaultVariantId);
  const variant = practice.experiment.variants.find((item) => item.id === variantId) ?? practice.experiment.variants[0];
  const code = useMemo(() => renderCode(practice.python.codeTemplate, variant.parameters), [practice.python.codeTemplate, variant.parameters]);
  const headingId = `practice-heading-${practice.lessonId}`;

  return (
    <div className="lesson-content practical-lesson" key={practice.lessonId}>
      <section className="practice-scenario" aria-labelledby={headingId}>
        <span className="content-index">01 · TÌNH HUỐNG THỰC TẾ</span>
        <p className="practice-kicker">CASE STUDY · DỮ LIỆU NHỎ · OUTPUT KIỂM CHỨNG ĐƯỢC</p>
        <h3 id={headingId}>{practice.scenario.title}</h3>
        <p>{practice.scenario.context}</p>
        <div><strong>Mục tiêu cần giao</strong><p>{practice.scenario.goal}</p></div>
      </section>

      <section>
        <span className="content-index">02 · INPUT CỤ THỂ</span>
        <div className="practice-inputs">{practice.inputs.map((input) => <article key={input.label}><span>{input.format.toUpperCase()}</span><strong>{input.label}</strong><pre>{input.value}</pre></article>)}</div>
      </section>

      <section>
        <span className="content-index">03 · THỬ THAY THAM SỐ</span>
        <div className="practice-experiment">
          <h3>{practice.experiment.question}</h3>
          <div className="practice-variant-buttons" aria-label="Chọn biến thể thí nghiệm">{practice.experiment.variants.map((item) => <button type="button" aria-pressed={item.id === variant.id} className={item.id === variant.id ? "active" : ""} onClick={() => setVariantId(item.id)} key={item.id}>{item.label}</button>)}</div>
          <dl>{Object.entries(variant.parameters).map(([key, value]) => <div key={key}><dt>{practice.experiment.parameterLabels[key]}</dt><dd><code>{String(value)}</code></dd></div>)}</dl>
          <Illustration visual={variant.illustration}/>
          <p className="practice-observation"><strong>Quan sát:</strong> {variant.observation}</p>
        </div>
      </section>

      <section>
        <span className="content-index">04 · CODE CHẠY ĐƯỢC</span>
        <div className="practice-code-grid">
          <article className="practice-code-card"><header><div><span>PYTHON</span><strong>{practice.python.filename}</strong></div><CopyCodeButton key={variant.id} code={code}/></header><h3>{practice.python.title}</h3><pre aria-label={`Code Python: ${practice.python.title}`}><code>{code}</code></pre></article>
          <article className="practice-output-card"><span>OUTPUT MONG ĐỢI</span><h3>Kết quả để tự đối chiếu</h3><pre><output aria-live="polite">{variant.expectedOutput}</output></pre><p>Chạy lại cùng input và tham số phải cho đúng output này.</p><InternalLink href="/practice">Mở Code Arena để tự viết lại →</InternalLink></article>
        </div>
      </section>

      <section>
        <span className="content-index">05 · CODE ĐANG LÀM GÌ?</span>
        <ol className="practice-explanation">{practice.explanation.map((step, index) => <li key={step.title}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{step.title}</strong><p>{step.text}</p></div></li>)}</ol>
      </section>

      <section className="practice-transfer"><span className="content-index">TỰ BIẾN ĐỔI BÀI TOÁN</span><p>{practice.transferQuestion}</p></section>
    </div>
  );
}
