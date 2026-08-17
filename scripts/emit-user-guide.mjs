/**
 * Sinh `docs/HUONG_DAN_SU_DUNG.md` từ `content/user-guide.ts`.
 *
 * Một nguồn, ba đầu ra: trang web `/huong-dan`, tệp Markdown này, và bản Word
 * sinh tiếp từ nó. Nhờ vậy hướng dẫn trên web và hướng dẫn gửi cho người học
 * không bao giờ lệch nhau — thứ đã xảy ra với 5 tệp hướng dẫn rời rạc trước đây.
 *
 * Chạy: `node scripts/emit-user-guide.mjs`
 */

import { build } from "esbuild";
import fs from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(".");
const OUTPUT = path.join(ROOT, "docs", "HUONG_DAN_SU_DUNG.md");

async function loadGuide() {
  const scratch = fs.mkdtempSync(path.join(tmpdir(), "voai-guide-"));
  const outfile = path.join(scratch, "user-guide.mjs");
  try {
    await build({
      entryPoints: [path.join(ROOT, "content", "user-guide.ts")],
      outfile,
      bundle: true,
      format: "esm",
      platform: "node",
      target: "node22",
      logLevel: "silent",
    });
    return await import(pathToFileURL(outfile).href);
  } finally {
    fs.rmSync(scratch, { recursive: true, force: true });
  }
}

function renderBlock(block) {
  if (block.kind === "text") return `${block.value}\n`;
  if (block.kind === "list") return `${block.items.map((item) => `- ${item}`).join("\n")}\n`;
  if (block.kind === "steps") {
    return `${block.items.map((item, index) => `${index + 1}. ${item}`).join("\n")}\n`;
  }
  if (block.kind === "note") {
    const label = block.tone === "warn" ? "⚠️" : "ℹ️";
    return `> ${label} **${block.title}**\n>\n> ${block.value}\n`;
  }
  const head = `| ${block.head.join(" | ")} |`;
  const divider = `| ${block.head.map(() => "---").join(" | ")} |`;
  const rows = block.rows.map((row) => `| ${row.join(" | ")} |`).join("\n");
  return `${head}\n${divider}\n${rows}\n`;
}

async function main() {
  const guide = await loadGuide();
  const parts = [
    `# ${guide.USER_GUIDE_TITLE}`,
    "",
    guide.USER_GUIDE_LEAD,
    "",
    "> Bản này được **sinh tự động** từ `content/user-guide.ts`. Đừng sửa trực tiếp;",
    "> sửa tệp nguồn rồi chạy lại `node scripts/emit-user-guide.mjs`.",
    "> Bản đọc trên web: mục **Hướng dẫn** trên thanh điều hướng.",
    "",
    "## Mục lục",
    "",
    ...guide.USER_GUIDE_SECTIONS.map(
      (section) => `- [${section.title}](#${section.id})`,
    ),
    "",
    "---",
    "",
  ];

  for (const section of guide.USER_GUIDE_SECTIONS) {
    parts.push(`<a id="${section.id}"></a>`, "", `## ${section.title}`, "", `*${section.lead}*`, "");
    for (const block of section.blocks) {
      parts.push(renderBlock(block), "");
    }
    parts.push("---", "");
  }

  const markdown = `${parts.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd()}\n`;
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, markdown, "utf8");
  console.log(
    `Đã ghi docs/HUONG_DAN_SU_DUNG.md — ${guide.USER_GUIDE_VALIDATION.sections} mục, ` +
      `${guide.USER_GUIDE_VALIDATION.blocks} khối, ${(markdown.length / 1024).toFixed(1)} KB.`,
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
