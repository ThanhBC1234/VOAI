/**
 * Sinh chỉ mục tra cứu cho trợ giảng ở module tự luận → `public/data/coach/`.
 *
 * Vì sao là chỉ mục chứ không phải mô hình ngôn ngữ: đây là công cụ luyện thi,
 * và người học **chưa đủ nền để phát hiện một câu trả lời sai**. Một mô hình
 * nhỏ đủ chạy trong trình duyệt sẽ bịa rất tự tin — được nó gật đầu cho một
 * lập luận sai còn tệ hơn không có trợ giảng. Chỉ mục thì chỉ trả về **nguyên
 * văn** nội dung đã qua kiểm định trong repo, nên không có đường nào bịa ra
 * một khẳng định mới.
 *
 * Cùng lý do đó, đầu ra ở đây là JSON tĩnh: chạy được trên GitHub Pages, không
 * backend, không API key, không tốn chi phí theo lượt hỏi, và vẫn nằm trong
 * HTTP cache của trình duyệt.
 *
 * Chạy tự động trong `scripts/run-vinext.mjs` trước mọi chế độ, nên không có
 * đường nào phát hành trang mà thiếu chỉ mục. Đầu ra **tất định**: cùng nội
 * dung nguồn thì cùng byte.
 */

import { build } from "esbuild";
import fs from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(".");
const OUTPUT_DIRECTORY = path.join(ROOT, "public", "data", "coach");

/** Tăng khi đổi *hình dạng* bản ghi, để bản cũ còn trong cache bị từ chối. */
export const COACH_INDEX_VERSION = 1;

async function loadModule(entry) {
  const scratch = fs.mkdtempSync(path.join(tmpdir(), "voai-coach-"));
  const outfile = path.join(scratch, "bundle.mjs");
  try {
    await build({
      entryPoints: [path.join(ROOT, entry)],
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

const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const join = (values) => (Array.isArray(values) ? values.map(clean).filter(Boolean).join(" · ") : "");

/**
 * Mỗi bản ghi phải là **một đơn vị trả lời trọn vẹn**, không phải một mẩu cắt
 * ngang câu. Người học đọc thẳng phần `body` và phải hiểu được ngay mà không
 * cần mở thêm trang nào.
 */
function collectTheory(bank) {
  return bank.map((question) => ({
    kind: "theory",
    title: clean(question.stem),
    body: clean(question.explanation),
    note: join(question.choiceNotes),
    topic: clean(question.syllabusId),
    href: "/theory",
  }));
}

function collectCoreLessons(lessons) {
  const records = [];
  for (const lesson of lessons) {
    const title = clean(lesson.title);
    records.push({
      kind: "lesson",
      title: `${title} — Trực giác`,
      body: clean(lesson.intuition),
      note: join(lesson.outcomes),
      topic: clean(lesson.syllabusTopic),
      href: "/lessons",
    });
    records.push({
      kind: "lesson",
      title: `${title} — Khi nào dùng`,
      body: join(lesson.whenToUse),
      note: join(lesson.math),
      topic: clean(lesson.syllabusTopic),
      href: "/lessons",
    });
    if (lesson.complexity) {
      records.push({
        kind: "complexity",
        title: `${title} — Độ phức tạp`,
        body:
          `Thời gian ${clean(lesson.complexity.time)}. ` +
          `Bộ nhớ ${clean(lesson.complexity.space)}. ${clean(lesson.complexity.notes)}`,
        note: "",
        topic: clean(lesson.syllabusTopic),
        href: "/lessons",
      });
    }
    // Failure mode là thứ đáng giá nhất cho một người đang mắc kẹt: nó được
    // viết theo *triệu chứng quan sát được*, đúng ngôn ngữ mà người học dùng
    // để hỏi, chứ không theo tên khái niệm.
    for (const failure of lesson.failureModes ?? []) {
      records.push({
        kind: "failure",
        title: clean(failure.symptom),
        body: `Nguyên nhân: ${clean(failure.cause)} Cách sửa: ${clean(failure.fix)}`,
        note: title,
        topic: clean(lesson.syllabusTopic),
        href: "/lessons",
      });
    }
    for (const quiz of lesson.miniQuiz ?? []) {
      records.push({
        kind: "theory",
        title: clean(quiz.question),
        body: clean(quiz.explanation),
        note: title,
        topic: clean(lesson.syllabusTopic),
        href: "/lessons",
      });
    }
  }
  return records;
}

function collectMultimodalLessons(lessons) {
  const records = [];
  for (const lesson of lessons) {
    const title = clean(lesson.title);
    records.push({
      kind: "lesson",
      title: `${title} — Trực giác`,
      body: clean(lesson.intuition),
      note: join(lesson.outcomes),
      topic: clean(lesson.domain),
      href: "/lessons",
    });
    // Ở giáo trình multimodal, failureModes và complexity là mảng chuỗi chứ
    // không phải object — cùng ý nghĩa, khác hình dạng.
    if (lesson.failureModes?.length) {
      records.push({
        kind: "failure",
        title: `${title} — Hỏng ở đâu`,
        body: join(lesson.failureModes),
        note: title,
        topic: clean(lesson.domain),
        href: "/lessons",
      });
    }
    if (lesson.complexity?.length) {
      records.push({
        kind: "complexity",
        title: `${title} — Độ phức tạp`,
        body: join(lesson.complexity),
        note: "",
        topic: clean(lesson.domain),
        href: "/lessons",
      });
    }
    for (const quiz of lesson.miniQuiz ?? []) {
      records.push({
        kind: "theory",
        title: clean(quiz.question),
        body: clean(quiz.explanation),
        note: title,
        topic: clean(lesson.domain),
        href: "/lessons",
      });
    }
  }
  return records;
}

function collectMath(modules) {
  const records = [];
  for (const mathModule of modules) {
    for (const topic of mathModule.topics) {
      const title = clean(topic.title);
      records.push({
        kind: "math",
        title,
        body: `${join(topic.keyIdeas)} ${topic.formulas.map((formula) => clean(formula.reading)).join(" ")}`,
        note: clean(topic.examUse),
        topic: clean(mathModule.title),
        href: "/math",
      });
      records.push({
        kind: "pitfall",
        title: `${title} — Bẫy thường gặp`,
        body: join(topic.pitfalls),
        note: clean(topic.examUse),
        topic: clean(mathModule.title),
        href: "/math",
      });
    }
  }
  return records;
}

export async function emitCoachIndex() {
  const [theory, core, multimodal, math] = await Promise.all([
    loadModule(path.join("content", "theory", "index.ts")),
    loadModule(path.join("content", "lessons-core.ts")),
    loadModule(path.join("content", "lessons-multimodal.ts")),
    loadModule(path.join("content", "math", "index.ts")),
  ]);

  const records = [
    ...collectTheory(theory.THEORY_BANK),
    ...collectCoreLessons(core.coreLessons),
    ...collectMultimodalLessons(multimodal.multimodalLessons),
    ...collectMath(math.MATH_MODULES),
  ]
    // Bản ghi không có phần thân thì không trả lời được gì; giữ lại chỉ làm
    // loãng kết quả tìm kiếm.
    .filter((record) => record.title && record.body);

  // Thứ tự tất định: cùng nội dung nguồn thì cùng byte, chạy lại không tạo diff.
  records.sort((left, right) => `${left.kind}${left.title}`.localeCompare(`${right.kind}${right.title}`, "vi"));

  const payload = `${JSON.stringify({ version: COACH_INDEX_VERSION, records })}\n`;
  fs.mkdirSync(OUTPUT_DIRECTORY, { recursive: true });
  const target = path.join(OUTPUT_DIRECTORY, "index.json");
  // Chỉ ghi khi khác: giữ nguyên mtime để watcher của dev server không rebuild
  // vòng lặp mỗi lần khởi động.
  const current = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : null;
  if (current !== payload) fs.writeFileSync(target, payload, "utf8");

  return { records: records.length, bytes: Buffer.byteLength(payload, "utf8"), directory: OUTPUT_DIRECTORY };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await emitCoachIndex();
  console.log(
    `Đã sinh chỉ mục trợ giảng: ${result.records} bản ghi ` +
      `(${(result.bytes / 1024).toFixed(1)} KB raw) tại public/data/coach/.`,
  );
}
