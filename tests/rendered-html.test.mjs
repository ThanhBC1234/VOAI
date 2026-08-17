import assert from "node:assert/strict";
import { access, readFile, readdir, stat } from "node:fs/promises";
import test from "node:test";
import { REPOSITORY_NAME } from "../site.config.mjs";

const clean = (html) => html.replaceAll("<!-- -->", "");
// SEO-P3-01: ảnh OG phải nằm trên một origin công khai (không cần đăng nhập)
// và luôn đi kèm base path của bản dựng.
//
// Tên repository có thể chứa chữ hoa nên lớp ký tự phải nhận cả hai. Dấu chấm
// của ".png" cần hai dấu gạch chéo: đây là template literal, nên một dấu sẽ bị
// chuỗi nuốt mất và regex thành "og.png" với dấu chấm khớp mọi ký tự.
const socialImage = new RegExp(`https://[A-Za-z0-9.-]+/(?:${REPOSITORY_NAME}/)?og\\.png`);

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
    ["/theory", /Lý thuyết vòng 1 — VOAI Lab/, /Vòng 1 hỏi lý thuyết/],
    ["/practice", /Tự code &amp; chấm bài — VOAI Lab/, /SOLO·90 CODE ARENA/],
    ["/resources", /Tài nguyên học hợp pháp — VOAI Lab/, /Không sách lậu, không link rác/],
    ["/notebooks", /Notebook Colab — VOAI Lab/, /Tám notebook có khung/],
    ["/math", /Toán cho VOAI — VOAI Lab/, /Toán không phải môn phụ ở đây/],
    ["/huong-dan", /Hướng dẫn sử dụng — VOAI Lab/, /Tất cả trong một trang/],
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
  const [roadmapResponse, lessonsResponse, lessonExplorerSource] = await Promise.all([
    render("/roadmap"),
    render("/lessons"),
    readFile(new URL("../components/LessonsExplorer.tsx", import.meta.url), "utf8"),
  ]);
  const roadmap = clean(await roadmapResponse.text());
  const lessons = clean(await lessonsResponse.text());
  assert.match(roadmap, />205<\/strong><span>bài học/);
  assert.match(roadmap, />41<\/strong><span>phòng lab/);
  assert.match(roadmap, />41<\/strong><span>checkpoint/);
  assert.match(roadmap, />60<\/strong><span>mục IOAI/);
  assert.match(roadmap, /href="\/assessments\?session=w01-lesson-1"/);
  assert.match(roadmap, /href="\/lessons\?lesson=foundation-python"/);
  assert.match(lessons, /78\/78 bài/);
  assert.doesNotMatch(lessons, /hiddenTestIdeas/i);
  assert.match(lessonExplorerSource, /new URLSearchParams\(window\.location\.search\)\.get\("lesson"\)/);
});

// APP-P1-01: ba phiên Finale có `week: null` từng bị bỏ khỏi UI, khiến người học
// chỉ đạt tối đa 287/290. Khối Finale phải hiện và toggle được như phiên thường.
test("roadmap exposes the three finale sessions so 290/290 is reachable", async () => {
  const [roadmapResponse, groupsSource] = await Promise.all([
    render("/roadmap"),
    readFile(new URL("../lib/roadmap-groups.ts", import.meta.url), "utf8"),
  ]);
  const roadmap = clean(await roadmapResponse.text());

  // Mẫu số tiến độ vẫn là toàn bộ 290 phiên.
  assert.match(roadmap, /0\/290 phiên/);
  // Khối Finale được render sau 41 tuần.
  assert.match(roadmap, /data-roadmap-group="finale"/);
  assert.match(roadmap, /Ba ngày tổng kết và bảo vệ/);
  // Khối thu gọn nên chỉ hiện đồng hồ 0/3; ba phiên bên trong được kiểm bằng trình duyệt.
  assert.match(roadmap, /<strong>0\/3<\/strong>/);
  // Cổng bất biến phải tồn tại để bản dựng gãy nếu roadmap lại làm rơi phiên.
  assert.match(groupsSource, /ROADMAP_GROUPS_VALIDATION/);
  assert.match(groupsSource, /chỉ hiển thị \$\{seen\.size\}\/\$\{sessions\.length\} phiên/);
});

test("all 41 week lecture maps point to and cover the 78-lesson catalog", async () => {
  const [weekMapSource, coreSource, multimodalSource, roadmapExplorerSource] = await Promise.all([
    readFile(new URL("../content/week-lectures.ts", import.meta.url), "utf8"),
    readFile(new URL("../content/lessons-core.ts", import.meta.url), "utf8"),
    readFile(new URL("../content/lessons-multimodal.ts", import.meta.url), "utf8"),
    readFile(new URL("../components/RoadmapExplorer.tsx", import.meta.url), "utf8"),
  ]);
  const weekKeys = [...weekMapSource.matchAll(/^\s*(\d+):\s*\[/gm)]
    .map((match) => Number(match[1]));
  assert.deepEqual(weekKeys, Array.from({ length: 41 }, (_, index) => index + 1));

  const catalogIds = [...`${coreSource}\n${multimodalSource}`.matchAll(/^\s+id:\s*"([^"]+)",/gm)]
    .map((match) => match[1]);
  assert.equal(catalogIds.length, 78);
  assert.equal(new Set(catalogIds).size, 78);

  const lectureEntries = [...weekMapSource.matchAll(/\{\s*id:\s*"([^"]+)",\s*label:\s*"([^"]+)"\s*\}/g)]
    .map((match) => ({ id: match[1], label: match[2] }));
  assert.ok(lectureEntries.every((entry) => entry.label.trim().length > 0));
  assert.deepEqual(
    [...new Set(lectureEntries.map((entry) => entry.id))].sort(),
    [...catalogIds].sort(),
  );
  assert.match(roadmapExplorerSource, /href=\{`\/lessons\?lesson=\$\{encodeURIComponent\(item\.id\)\}`\}/);
});

test("assessment bank renders all 290 records and defers static deep-link selection to the client", async () => {
  const [response, deepLinkResponse, assessmentSource, explorerSource] = await Promise.all([
    render("/assessments"),
    render("/assessments?session=w01-lab"),
    readFile(new URL("../content/daily-assessments.ts", import.meta.url), "utf8"),
    readFile(new URL("../components/AssessmentExplorer.tsx", import.meta.url), "utf8"),
  ]);
  assert.equal(response.status, 200);
  assert.equal(deepLinkResponse.status, 200);
  const html = clean(await response.text());
  const deepLinkHtml = clean(await deepLinkResponse.text());
  assert.equal((html.match(/data-assessment-item=/g) ?? []).length, 290);
  assert.equal((deepLinkHtml.match(/data-assessment-item=/g) ?? []).length, 290);
  assert.match(html, /290\/290 phiên/);
  assert.match(html, /id="assessment-w01-lesson-1"/);
  assert.match(deepLinkHtml, /id="assessment-w01-lesson-1"/);
  assert.match(html, /Bằng chứng code\/test bắt buộc/);
  assert.match(html, /Formative\/manual evidence/);
  assert.match(html, /self-score thủ công/);
  assert.match(html, /\/ 20 · sàn 8/);
  assert.match(html, /\/ 50 · sàn 20/);
  assert.match(html, /\/ 10 · sàn 4/);
  assert.match(html, /Xuất attempts JSON/);
  assert.doesNotMatch(html, /hiddenTestIdeas|expectedOutput|correctIndex/i);
  assert.match(assessmentSource, /Được phép dùng thư viện và model\/pretrained weights phù hợp/);
  assert.match(assessmentSource, /pipeline, evaluation và ít nhất một ablation/);
  assert.match(assessmentSource, /minimumSectionScoreTotal > assessment\.passRule\.minimumScore/);
  assert.match(explorerSource, /new URLSearchParams\(window\.location\.search\)\.get\("session"\)/);
  assert.match(explorerSource, /const target = requestedAssessment \?\? initialAssessment/);
  assert.match(explorerSource, /setSelectedId\(target\.sessionId\)/);
  // ASSESS-P2-01/02: nháp giữ theo sessionId, loader không được ghi đè storage.
  assert.match(explorerSource, /DRAFTS_STORAGE_KEY/);
  assert.match(explorerSource, /draftsRef\.current\[entry\.sessionId\] \?\? emptyDraft\(entry\)/);
  assert.match(explorerSource, /unreadableRef/);
  assert.match(explorerSource, /rubricSnapshot/);
  assert.doesNotMatch(
    explorerSource,
    /localStorage\.setItem\(STORAGE_KEY/,
    "loader/ghi vẫn dùng localStorage trực tiếp thay vì helper an toàn",
  );
  // ASSESS-P2-02: attempt được chấm lại bằng rubric của chính nó, không phải
  // rubric hiện hành, nên đổi trọng số không làm lịch sử biến mất khỏi màn hình.
  assert.match(explorerSource, /value\.status === computedStatusFor\(draft, rubric, entry\.retrievalCount\)/);
  assert.match(explorerSource, /score <= rubric\.weights\[category\]/);
  assert.match(explorerSource, /function rubricForAttempt/);
});

// PERF-P3-01: payload đầu chỉ được mang catalog. Nếu ai đó truyền lại toàn bộ
// `DAILY_ASSESSMENTS` vào component client, test này phải đỏ ngay.
test("assessment initial payload carries only the catalog, not 290 detail records", async () => {
  const [response, pageSource] = await Promise.all([
    render("/assessments"),
    readFile(new URL("../app/assessments/page.tsx", import.meta.url), "utf8"),
  ]);
  const html = clean(await response.text());

  assert.match(pageSource, /ASSESSMENT_CATALOG/);
  assert.doesNotMatch(
    pageSource,
    /assessments=\{DAILY_ASSESSMENTS\}/,
    "trang vẫn truyền toàn bộ ngân hàng vào component client",
  );

  // Đề bài của bài đầu tiên có mặt (màn hình đầu không chờ mạng)…
  assert.match(html, /Coding task/);
  assert.match(html, /Bằng chứng code\/test bắt buộc/);
  // …nhưng chỉ đúng **một** đề bài, không phải 290. Mỗi chuỗi xuất hiện tối đa
  // hai lần: một lần trong markup và một lần trong flight payload nhúng kèm.
  const codingTaskMarkers = html.match(/NHIỆM VỤ TỰ CODE/g) ?? [];
  assert.ok(codingTaskMarkers.length <= 2, `có ${codingTaskMarkers.length} đề bài trong payload đầu`);

  // Câu retrieval là phần nặng nhất của mỗi bản ghi; chúng dùng chung một khuôn
  // câu chữ nên đếm được. Payload đầu chỉ được chứa của một phiên.
  const retrievalMarkers = html.match(/Không mở tài liệu: với/g) ?? [];
  assert.ok(
    retrievalMarkers.length > 0 && retrievalMarkers.length <= 2,
    `có ${retrievalMarkers.length} khối câu retrieval trong payload đầu`,
  );

  // Ngân sách cứng: HTML của /assessments phải dưới 500 KB. Baseline trước khi
  // tách là ~1,73 MB.
  const bytes = Buffer.byteLength(html, "utf8");
  assert.ok(bytes < 500_000, `/assessments HTML vẫn nặng ${bytes} byte`);
});

// Lớp Toán: trang phải render đủ nội dung học được ngay từ HTML (không chờ JS),
// và tuyệt đối không lộ đáp án của bài luyện trước khi người học tự trả lời.
test("math page renders every module, formula and drill without leaking answers", async () => {
  const [response, explorerSource] = await Promise.all([
    render("/math"),
    readFile(new URL("../components/MathExplorer.tsx", import.meta.url), "utf8"),
  ]);
  assert.equal(response.status, 200);
  const html = clean(await response.text());

  // Năm module bắt buộc, mỗi module hiện trong danh mục.
  for (const moduleId of [
    "linear-algebra",
    "calculus",
    "probability",
    "optimization",
    "measurement",
  ]) {
    assert.match(html, new RegExp(`data-math-module="${moduleId}"`), `thiếu module ${moduleId}`);
  }

  // Mọi chủ đề đều liệt kê được, không chỉ chủ đề đang mở.
  const topicButtons = html.match(/data-math-topic=/g) ?? [];
  assert.ok(topicButtons.length >= 20, `chỉ có ${topicButtons.length} chủ đề trong danh mục`);

  // Công thức được render sẵn bằng KaTeX ở phía server.
  assert.match(html, /class="katex/);
  assert.match(html, /Công thức phải thuộc/);
  assert.match(html, /Ví dụ giải mẫu/);
  assert.match(html, /Bẫy thường gặp/);
  assert.match(html, /Tự luyện/);

  // Đáp án chỉ hiện sau khi người học nhập số và bấm đối chiếu.
  assert.doesNotMatch(html, /Đáp án: /, "trang lộ đáp án bài luyện ngay trong HTML");
  assert.match(explorerSource, /const verdict = checkDrillAnswer\(entry, drill\)/);
  assert.match(explorerSource, /disabled=\{verdict === null\}/);
  // Nội dung đi qua RSC props; component client không được import cả lớp Toán.
  assert.match(explorerSource, /from "\.\.\/content\/math\/check-answer"/);
  assert.doesNotMatch(
    explorerSource,
    /from "\.\.\/content\/math"/,
    "component client kéo cả nội dung Toán vào bundle JS",
  );
});

test("ships notebooks, local grader, worker, and social card", async () => {
  const [notebooks, packageJson, og, notebookHubSource] = await Promise.all([
    readdir(new URL("../notebooks/", import.meta.url)),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    stat(new URL("../public/og.png", import.meta.url)),
    readFile(new URL("../components/NotebookHub.tsx", import.meta.url), "utf8"),
  ]);
  assert.equal(notebooks.filter((name) => name.endsWith(".ipynb")).length, 8);
  assert.doesNotMatch(packageJson, /react-loading-skeleton|codex-preview/i);
  assert.ok(og.size > 100_000);
  assert.match(notebookHubSource, /process\.env\.NEXT_PUBLIC_GITHUB_REPOSITORY/);
  assert.match(notebookHubSource, /window\.location\.hostname\.match\(\/\^\(\[\^\.\]\+\)\\\.github\\\.io\$\/i\)/);
  assert.match(notebookHubSource, /https:\/\/colab\.research\.google\.com\/github\/\$\{repository\}\/blob\/main\/notebooks\//);
  assert.equal((notebookHubSource.match(/window\.open\(url, "_blank", "noopener,noreferrer"\)/g) ?? []).length, 2);
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
  assert.match(practice, /không phải sandbox cho mã thù địch/);
  assert.match(resources, /chưa có bảng ánh xạ từng bài sang chương sách/);
  assert.match(workerSource, /event\.data\.type === "init"/);
  assert.match(workerSource, /pyodide\.runPython\("dict\(\)"\)/);
  assert.match(practice, /Mỗi lượt chạy dùng một Web Worker và Python runtime mới/);
  assert.match(practiceSource, /workerRef\.current\?\.terminate\(\)/);
  assert.match(practiceSource, /new Worker\(sitePath\("\/pyodide-worker\.js"\)\)/);
  assert.match(practiceSource, /worker\.postMessage\(\{type:"run"/);
  assert.doesNotMatch(practiceSource, /inspect\.getsource/);
  assert.match(practiceSource, /Thời gian tải Python không tính vào giới hạn này/);
  assert.match(roadmapSource, /Asia\/Ho_Chi_Minh/);
  assert.doesNotMatch(roadmapSource, /toISOString\(\)\.slice/);
  assert.match(roadmapSource, /Deep \{session\.deepMinutes\}:/);
  assert.doesNotMatch(roadmapSource, /Deep 60:/);
});

test("theory mock auto-submits at zero and offers a clean retry", async () => {
  const source = await readFile(new URL("../components/TheoryExam.tsx", import.meta.url), "utf8");
  assert.match(source, /function hasCompleteResponse\(/);
  assert.match(source, /question\.statements\.every/);
  assert.match(source, /const answered = hasCompleteResponse\(question, response\)/);
  // THEORY-P2-01: đồng hồ suy ra từ deadline tuyệt đối, không trừ dần mỗi giây.
  assert.match(source, /secondsLeftUntil\(attempt\.deadlineEpochMs, nowMs\)/);
  assert.doesNotMatch(source, /current - 1/, "vẫn còn cách trừ dần từng giây");
  assert.match(source, /examRunning && secondsLeft === 0.*submitExamRef\.current\(\)/s);
  assert.match(source, /function discardAttempt\(\)/);
  assert.match(source, /Làm lại đề mẫu/);
});

// ARENA-P2-01/02: Code Arena không được kẹt vĩnh viễn ở bước tải Python, và
// output khổng lồ phải bị cắt theo hạn ngạch thay vì gửi nguyên về main thread.
test("code arena bounds pyodide boot time and caps worker output", async () => {
  const [component, worker] = await Promise.all([
    readFile(new URL("../components/CodePractice.tsx", import.meta.url), "utf8"),
    readFile(new URL("../public/pyodide-worker.js", import.meta.url), "utf8"),
  ]);

  // Boot timeout tách khỏi execution timeout và bắt đầu ngay khi tạo worker.
  assert.match(component, /const BOOT_TIMEOUT_MS = /);
  assert.match(component, /bootTimeoutRef\.current=setTimeout\(/);
  assert.match(component, /Không tải được Python trong \$\{BOOT_TIMEOUT_MS\/1000\} giây/);
  // Worker cũ bị gỡ listener nên không cập nhật state của lần chạy mới.
  assert.match(component, /worker\.onmessage=null;worker\.onerror=null;/);
  // Worker phải đi qua sitePath để không 404 dưới base path của GitHub Pages.
  assert.match(component, /new Worker\(sitePath\("\/pyodide-worker\.js"\)\)/);

  // Hạn ngạch output với đúng một marker cắt.
  assert.match(worker, /OUTPUT_LIMIT_CHARS/);
  assert.equal((worker.match(/\[output truncated\]/g) ?? []).length, 2);
  assert.doesNotMatch(worker, /batched: \(text\) => output\.push\(text\)/, "vẫn buffer output không giới hạn");
});

// THEORY-P1-01/02/03: các bất biến bị audit chỉ ra, khóa lại ở mức mã nguồn.
test("theory exam isolates practice state, gates the verdict, and persists attempts", async () => {
  const source = await readFile(new URL("../components/TheoryExam.tsx", import.meta.url), "utf8");

  // P1-01: hai chế độ có state riêng, và rời bài thi phải xác nhận.
  assert.match(source, /const \[practiceResponses, setPracticeResponses\]/);
  assert.match(source, /const \[examResponses, setExamResponses\]/);
  assert.doesNotMatch(source, /const \[responses, setResponses\]/, "vẫn dùng chung một state đáp án");
  assert.match(source, /function requestPracticeMode\(\)[\s\S]{0,400}window\.confirm/);

  // P1-02: verdict đi qua hàm thuần duy nhất, không so tay với passPercent.
  assert.match(source, /evaluateGates\(\{/);
  assert.doesNotMatch(
    source,
    /scorePercent >= MOCK_INTERNAL_GATES\.passPercent/,
    "verdict vẫn chỉ kiểm tổng điểm",
  );
  assert.match(source, /data-theory-verdict=/);

  // P1-03: attempt đang làm dở được ghi và khôi phục theo schema có version.
  assert.match(source, /parseActiveAttempt\(raw\)/);
  assert.match(source, /createActiveAttempt\(/);
  assert.match(source, /activeAttemptIsUsable\(restored, knownIds\)/);
});

/**
 * Nội dung trong `content/` viết theo lối văn bản kỹ thuật: `**nhấn mạnh**`,
 * `` `định danh` `` và `$công thức$`. Ba trang Toán, Bài giảng và Lý thuyết
 * từng in thẳng chuỗi thô, nên người học đọc được nguyên ký tự đánh dấu — ví dụ
 * "thành **một** số đo" hay "`axis=k` là chiều bị triệt tiêu". Sau khi gom về
 * `components/RichText.tsx`, khóa lại để markup không rò ra giao diện lần nữa.
 */
test("inline markup in content renders as elements instead of leaking raw characters", async () => {
  // Bỏ mọi <script>: RSC payload chứa chuỗi nguồn chưa kết xuất, đó là dữ liệu
  // chứ không phải chữ người học nhìn thấy.
  const visibleTextOf = (html) => html.replace(/<script[\s\S]*?<\/script>/gi, "");

  for (const route of ["/", "/math", "/theory", "/lessons", "/roadmap", "/assessments"]) {
    const visible = visibleTextOf(clean(await (await render(route)).text()));
    assert.deepEqual(
      visible.match(/\*\*[^*<>]{1,80}\*\*/g) ?? [],
      [],
      `${route} còn lộ dấu ** của markdown`,
    );
    assert.deepEqual(
      visible.match(/`[^`<>]{1,60}`/g) ?? [],
      [],
      `${route} còn lộ dấu backtick của markdown`,
    );
    assert.deepEqual(visible.match(/\$[^$<>]{1,60}\$/g) ?? [], [], `${route} còn lộ công thức $…$`);
  }

  // Kiểm tra ngược: markup phải thật sự được kết xuất, không phải bị xóa trắng.
  const math = visibleTextOf(clean(await (await render("/math")).text()));
  assert.match(math, /<strong>/, "trang Toán không còn phần nhấn mạnh nào — nghi bị nuốt chữ");
  const theory = visibleTextOf(clean(await (await render("/theory")).text()));
  assert.match(theory, /class="inline-code"/, "trang Lý thuyết không kết xuất mã inline nào");
});
