"use client";

import { NOTEBOOKS } from "../content/notebooks";

const configuredRepository = process.env.NEXT_PUBLIC_GITHUB_REPOSITORY ?? "";
/**
 * Tên repository suy từ base path đã cấu hình (`site.config.mjs` → biến môi
 * trường `NEXT_PUBLIC_BASE_PATH`). Chỉ dùng khi workflow chưa truyền
 * `NEXT_PUBLIC_GITHUB_REPOSITORY`, ví dụ bản dựng cục bộ.
 */
const repositoryNameFromBasePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/^\//, "");

function repositoryFromPage(): string | null {
  if (configuredRepository.includes("/")) return configuredRepository;
  if (typeof window === "undefined") return null;
  const match = window.location.hostname.match(/^([^.]+)\.github\.io$/i);
  if (!match || !repositoryNameFromBasePath) return null;
  return `${match[1]}/${repositoryNameFromBasePath}`;
}

function openNotebook(file: string) {
  const repository = repositoryFromPage();
  const url = repository
    ? `https://colab.research.google.com/github/${repository}/blob/main/notebooks/${encodeURIComponent(file)}`
    : "https://colab.research.google.com/github/";
  window.open(url, "_blank", "noopener,noreferrer");
}

function openSource(file: string) {
  const repository = repositoryFromPage();
  const url = repository
    ? `https://github.com/${repository}/blob/main/notebooks/${encodeURIComponent(file)}`
    : "https://github.com/";
  window.open(url, "_blank", "noopener,noreferrer");
}

export function NotebookHub() {
  return (
    <section className="notebook-hub" aria-label="Danh sách notebook Colab">
      <div className="notebook-notice">
        <strong>Mở trực tiếp từ GitHub Pages</strong>
        <p>Hai nút bên dưới tự dùng tên chủ repository khi website chạy tại <code>owner.github.io/&lt;repo&gt;</code>. Ở bản local hoặc bản xem trước chưa biết repository, Colab mở bộ chọn GitHub còn nút nguồn mở trang GitHub.</p>
      </div>
      <div className="notebook-grid">
        {NOTEBOOKS.map((notebook, index) => (
          <article className="notebook-card" key={notebook.file}>
            <div className="notebook-meta">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span>{notebook.domain}</span>
              <span>{notebook.duration}</span>
            </div>
            <h2>{notebook.title}</h2>
            <p>{notebook.purpose}</p>
            <code>{notebook.file}</code>
            <div className="notebook-actions">
              <button type="button" onClick={() => openNotebook(notebook.file)}>Mở bằng Colab ↗</button>
              <button className="ghost" type="button" onClick={() => openSource(notebook.file)}>Xem trên GitHub ↗</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
