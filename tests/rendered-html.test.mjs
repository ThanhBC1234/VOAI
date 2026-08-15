import assert from "node:assert/strict";
import { access, readFile, readdir, stat } from "node:fs/promises";
import test from "node:test";

const clean = (html) => html.replaceAll("<!-- -->", "");
const socialImage = /http:\/\/localhost(?::\d+)?\/og\.png/;

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the finished VOAI Lab home without starter markers", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = clean(await response.text());
  assert.match(html, /<title>VOAI Lab — Lộ trình AI từ nền tảng đến thi đấu<\/title>/i);
  assert.match(html, /Đi từ dòng Python đầu tiên/);
  assert.match(html, /41 tuần, một đích đến rõ ràng/);
  assert.match(html, /90%/);
  assert.match(html, socialImage);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|Your site is taking shape|react-loading-skeleton/i);
});

test("all learning routes render their product-specific surface", async () => {
  const routes = [
    ["/roadmap", /Lộ trình 290 ngày — VOAI Lab/, /290 ngày được chia nhỏ/],
    ["/assessments", /Đánh giá 290 phiên — VOAI Lab/, /Mỗi ngày học kết thúc/],
    ["/lessons", /78 bài giảng thuật toán — VOAI Lab/, /CATALOG IOAI 2026/],
    ["/labs", /Phòng lab tương tác — VOAI Lab/, /Đừng chỉ đọc công thức/],
    ["/practice", /Tự code &amp; chấm bài — VOAI Lab/, /SOLO·90 CODE ARENA/],
    ["/resources", /Tài nguyên học hợp pháp — VOAI Lab/, /Không sách lậu, không link rác/],
  ];
  for (const [path, title, copy] of routes) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    const html = clean(await response.text());
    assert.match(html, title, `${path} title`);
    assert.match(html, copy, `${path} content`);
    assert.match(html, socialImage, `${path} social image`);
  }
});

test("roadmap and lesson evidence match the requested scope", async () => {
  const [roadmapResponse, lessonsResponse] = await Promise.all([render("/roadmap"), render("/lessons")]);
  const roadmap = clean(await roadmapResponse.text());
  const lessons = clean(await lessonsResponse.text());
  assert.match(roadmap, />205<\/strong><span>bài học/);
  assert.match(roadmap, />41<\/strong><span>phòng lab/);
  assert.match(roadmap, />41<\/strong><span>checkpoint/);
  assert.match(roadmap, />60<\/strong><span>mục IOAI/);
  assert.match(roadmap, /href="\/assessments\?session=w01-lesson-1"/);
  assert.match(lessons, /78\/78 bài/);
  assert.doesNotMatch(lessons, /hiddenTestIdeas/i);
});

test("assessment bank renders all 290 records and honors a session deep-link", async () => {
  const [response, largeModelResponse, assessmentSource, explorerSource] = await Promise.all([
    render("/assessments?session=w01-lab"),
    render("/assessments?session=w25-lesson-4"),
    readFile(new URL("../content/daily-assessments.ts", import.meta.url), "utf8"),
    readFile(new URL("../components/AssessmentExplorer.tsx", import.meta.url), "utf8"),
  ]);
  assert.equal(response.status, 200);
  const html = clean(await response.text());
  const largeModelHtml = clean(await largeModelResponse.text());
  assert.equal((html.match(/data-assessment-item=/g) ?? []).length, 290);
  assert.match(html, /290\/290 phiên/);
  assert.match(html, /id="assessment-w01-lab"/);
  assert.match(html, /Lab · Mini EDA thuần Python/);
  assert.match(html, /Bằng chứng code\/test bắt buộc/);
  assert.match(html, /Formative\/manual evidence/);
  assert.match(html, /self-score thủ công/);
  assert.match(html, /\/ 10 · sàn 4/);
  assert.match(html, /\/ 50 · sàn 20/);
  assert.match(html, /\/ 25 · sàn 10/);
  assert.match(html, /\/ 15 · sàn 6/);
  assert.match(html, /Xuất attempts JSON/);
  assert.doesNotMatch(html, /hiddenTestIdeas|expectedOutput|correctIndex/i);
  assert.match(largeModelHtml, /Được phép dùng thư viện và model\/pretrained weights phù hợp/);
  assert.match(largeModelHtml, /pipeline, evaluation và ít nhất một ablation/);
  assert.match(assessmentSource, /minimumSectionScoreTotal > assessment\.passRule\.minimumScore/);
  assert.match(explorerSource, /value\.status === computedStatusFor\(draft, assessment\)/);
  assert.match(explorerSource, /score <= assessment\.scoreWeights\[category\]/);
});

test("ships notebooks, local grader, worker, and social card", async () => {
  const [notebooks, packageJson, og] = await Promise.all([
    readdir(new URL("../notebooks/", import.meta.url)),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    stat(new URL("../public/og.png", import.meta.url)),
  ]);
  assert.equal(notebooks.filter((name) => name.endsWith(".ipynb")).length, 8);
  assert.doesNotMatch(packageJson, /react-loading-skeleton|codex-preview/i);
  assert.ok(og.size > 100_000);
  await Promise.all([
    access(new URL("../grader/grade.py", import.meta.url)),
    access(new URL("../grader/specs.json", import.meta.url)),
    access(new URL("../public/pyodide-worker.js", import.meta.url)),
    access(new URL("../docs/LO_TRINH_41_TUAN.md", import.meta.url)),
  ]);
  await assert.rejects(access(new URL("../app/_sites-preview/", import.meta.url)));
});

test("runtime learning tools state their timing and visibility boundaries honestly", async () => {
  const [homeResponse, practiceResponse, resourcesResponse, labSource, workerSource, practiceSource, roadmapSource] = await Promise.all([
    render("/"),
    render("/practice"),
    render("/resources"),
    readFile(new URL("../components/InteractiveLabs.tsx", import.meta.url), "utf8"),
    readFile(new URL("../public/pyodide-worker.js", import.meta.url), "utf8"),
    readFile(new URL("../components/CodePractice.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/RoadmapExplorer.tsx", import.meta.url), "utf8"),
  ]);
  const home = clean(await homeResponse.text());
  const practice = clean(await practiceResponse.text());
  const resources = clean(await resourcesResponse.text());

  assert.match(home, /BUỔI KHỞI ĐỘNG · NGÀY 01/);
  assert.doesNotMatch(home, /HÔM NAY · NGÀY 01/);
  assert.match(labSource, /128 mẫu · 64 mẫu\/giây · 2,0 giây · độ phân giải phổ 0,5 Hz/);
  assert.match(labSource, /sampleRate=64,sampleCount=128/);
  assert.match(labSource, /oneSidedBins=sampleCount\/2\+1/);
  assert.match(practice, /có thể xem qua source\/bundle/);
  assert.doesNotMatch(practice, /sandbox/i);
  assert.match(resources, /chưa có bảng ánh xạ từng bài sang chương sách/);
  assert.match(workerSource, /event\.data\.type === "init"/);
  assert.match(workerSource, /pyodide\.runPython\("dict\(\)"\)/);
  assert.match(practiceSource, /worker\.postMessage\(\{type:"run"/);
  assert.match(practiceSource, /Thời gian tải Python không tính vào giới hạn này/);
  assert.match(roadmapSource, /Asia\/Ho_Chi_Minh/);
  assert.doesNotMatch(roadmapSource, /toISOString\(\)\.slice/);
  assert.match(roadmapSource, /Deep \{session\.deepMinutes\}:/);
  assert.doesNotMatch(roadmapSource, /Deep 60:/);
});
