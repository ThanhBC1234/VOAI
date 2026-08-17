import type { ReactNode } from "react";
import type { GuideBlock, GuideSection } from "../content/user-guide";

/**
 * Hiển thị hướng dẫn sử dụng.
 *
 * Đây là **server component** có chủ đích: hướng dẫn là văn bản tĩnh thuần, nên
 * trang này không cần gửi thêm một byte JavaScript nào xuống trình duyệt.
 *
 * Vì vậy nó **không** dùng `RichText`: component đó là client component và kéo
 * theo cả KaTeX (~250 KB) để render `$…$`. Hướng dẫn không có công thức toán,
 * nên chỉ cần một bộ tách `**đậm**` và `` `mã` `` chạy phía server.
 */
function inline(text: string): ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code className="inline-code" key={index}>
            {part.slice(1, -1)}
          </code>
        );
      }
      return <span key={index}>{part}</span>;
    });
}

function RichText({ children }: { children: string }) {
  return <>{inline(children)}</>;
}
function Block({ block }: { block: GuideBlock }) {
  if (block.kind === "text") {
    return (
      <p className="guide-text">
        <RichText>{block.value}</RichText>
      </p>
    );
  }
  if (block.kind === "list") {
    return (
      <ul className="guide-list">
        {block.items.map((item) => (
          <li key={item}>
            <RichText>{item}</RichText>
          </li>
        ))}
      </ul>
    );
  }
  if (block.kind === "steps") {
    return (
      <ol className="guide-steps">
        {block.items.map((item) => (
          <li key={item}>
            <RichText>{item}</RichText>
          </li>
        ))}
      </ol>
    );
  }
  if (block.kind === "note") {
    return (
      <aside className={`guide-note guide-note-${block.tone}`}>
        <strong>{block.title}</strong>
        <p>
          <RichText>{block.value}</RichText>
        </p>
      </aside>
    );
  }
  return (
    <div className="guide-table-wrap">
      <table className="guide-table">
        <thead>
          <tr>
            {block.head.map((cell) => (
              <th key={cell} scope="col">
                <RichText>{cell}</RichText>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row) => (
            <tr key={row.join("|")}>
              {row.map((cell, index) => (
                <td key={`${index}-${cell}`}>
                  <RichText>{cell}</RichText>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function UserGuideView({ sections }: { sections: readonly GuideSection[] }) {
  return (
    <div className="guide-shell">
      <nav className="guide-toc" aria-label="Mục lục hướng dẫn">
        <p className="eyebrow">MỤC LỤC</p>
        <ol>
          {sections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`}>{section.title}</a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="guide-body">
        {sections.map((section) => (
          <section className="guide-section" id={section.id} key={section.id}>
            <h2>{section.title}</h2>
            <p className="guide-lead">{section.lead}</p>
            {section.blocks.map((block, index) => (
              <Block block={block} key={`${section.id}-${index}`} />
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
