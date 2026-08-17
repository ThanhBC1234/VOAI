# Bàn giao phiên làm việc — sửa lỗi sau audit

> **Cập nhật 17/08/2026.** Phiên tiếp theo đã đóng nốt `PERF-P3-01`, bổ sung lớp
> Toán `/math`, pin băm Pyodide, và chạy rà a11y có cấu trúc trên cả 10 trang.
> Mục 2, 3 và 7 bên dưới đã được viết lại theo trạng thái thật hiện tại.

> Tài liệu này để chuyển sang một phiên làm việc mới. Nó ghi lại **trạng thái
> thật** của kho mã: đã sửa gì, còn gì chưa xong, và điều gì cần biết trước khi
> chạm vào từng phần. Không dùng nó thay cho `AI_FIX_ALL_ISSUES.md` — tài liệu
> đó vẫn là source of truth về phạm vi sửa.

## 1. Bối cảnh

- Kho mã: **VOAI Lab** — bộ học liệu tự học AI cho học sinh THPT luyện thi
  VOAI/IOAI. 290 phiên học từ 15/08/2026 đến 31/05/2027.
- Stack: React 19 RSC + vinext/Vite → static GitHub Pages, Python CLI grader,
  Pyodide Web Worker, 8 notebook Jupyter.
- Nhánh: `main`. Commit gốc lúc bắt đầu: `cae07fc`.
- **Toàn bộ thay đổi trong phiên này CHƯA COMMIT.**

Phiên này gồm hai phần việc nối tiếp nhau:

1. **Bổ sung lớp lý thuyết vòng 1** (ngân hàng 350 câu + trang `/theory`).
2. **Sửa lỗi theo `docs/AI_FIX_ALL_ISSUES.md`** — 25 ticket P1/P2/P3.

## 2. Trạng thái ticket: 25/25

| Nhóm | Xong | Chưa xong |
| --- | --- | --- |
| P1 | **7/7** | — |
| P2 | **12/12** | — |
| P3 | **6/6** | — |

### 2.1. Bảng đối chiếu từng ticket

| Ticket | Tệp chính | Test chứng minh | Trạng thái |
| --- | --- | --- | --- |
| APP-P1-01 | `lib/roadmap-groups.ts`, `RoadmapExplorer.tsx` | `roadmap exposes the three finale sessions…` | Xong |
| THEORY-P1-01 | `TheoryExam.tsx` | `theory exam isolates practice state…` | Xong |
| THEORY-P1-02 | `lib/theory-exam-state.ts` | 5 test gate trong `theory-exam-state.test.mjs` | Xong |
| THEORY-P1-03 | `lib/theory-exam-state.ts`, `TheoryExam.tsx` | 5 test persistence | Xong |
| GRADER-P1-01 | `grader/worker.py`, `grade.py` | 6 test envelope/MRO | Xong |
| GRADER-P1-02 | `grader/proc.py` | `test_timeout_kills_descendant_processes` | Xong |
| GRADER-P1-03 | `grader/worker.py`, `grade.py` | 3 test stdout isolation | Xong |
| THEORY-P2-01 | `lib/theory-exam-state.ts` | `clock is derived from an absolute deadline…` | Xong |
| NOTEBOOK-P2-01 | `scripts/generate-notebooks.mjs` | 3 test cell id | Xong |
| NOTEBOOK-P2-02 | `scripts/validate_notebooks.py` | `test_solo90_false_also_fails_under_python_dash_O` | Xong |
| ARENA-P2-01 | `CodePractice.tsx` | `code arena bounds pyodide boot time…` | Xong |
| ARENA-P2-02 | `pyodide-worker.js`, `grader/proc.py` | test trên + `test_huge_output_is_capped…` | Xong |
| GRADER-P2-01 | `grader/specs.json`, `test_grader.py` | 37 case + 8 bài vi phạm bị trượt | Xong |
| LESSON-P2-01 | `LessonsExplorer.tsx` | typecheck + lint | Xong |
| ASSESS-P2-01 | `AssessmentExplorer.tsx` | assertion `DRAFTS_STORAGE_KEY`, `draftsRef` | Xong |
| ASSESS-P2-02 | `AssessmentExplorer.tsx` | assertion `unreadableRef`, `rubricSnapshot` | Xong |
| STORAGE-P2-01 | `lib/local-storage.ts` | `tests/local-storage.test.mjs` — 10 test | Xong |
| A11Y-P2-01 | `TheoryExam.tsx`, `InteractiveLabs.tsx`, `globals.css` | quét tương phản 8 trang, 0 vi phạm | Xong |
| CONTENT-P2-01 | 7 tệp `content/` | `tests/theory-content.test.mjs` — 4 test | Xong |
| NOTEBOOK-P3-01 | `scripts/generate-notebooks.mjs` | 4 test nội dung notebook | Xong |
| PERF-P3-01 | `content/assessment-catalog.ts`, `lib/assessment-details.ts`, `scripts/emit-assessment-chunks.mjs` | `tests/assessment-chunks.test.mjs` — 8 test + 2 test hồi quy payload | Xong |
| CI-P3-01 | `.github/workflows/*.yml` | `git ls-remote` xác minh 6 SHA | Xong |
| SEO-P3-01 | `app/layout.tsx` | regex kiểm cấu trúc URL công khai | Xong |
| DOC-P3-01 | `docs/KIEN_TRUC_HE_THONG.md` | link check | Xong |
| SUPPLY-P3-01 | `public/pyodide-worker.js` | cấm `importScripts(`, buộc `sha384` | Xong |

## 3. PERF-P3-01 — đã đóng

**Cách làm.** Payload đầu của `/assessments` chỉ còn **catalog nhẹ**
(`ASSESSMENT_CATALOG`). Phần chi tiết nằm trong 42 chunk JSON tĩnh dưới
`public/data/assessments/`, sinh bởi `scripts/emit-assessment-chunks.mjs` trong
mọi chế độ chạy của `scripts/run-vinext.mjs` và **không commit**.

Điều đã chặn lần thử trước — catalog thiếu `outcome`, `retrievalQuestions`,
`scoreWeights`, `passRule` — được giải bằng cách đưa vào catalog đúng ba nhóm
trường mà component thật sự cần: `outcome` (chuỗi tìm kiếm), `retrievalCount`
(thay cho nội dung câu hỏi khi dựng nháp rỗng), và
`scoreWeights`/`minimumScore`/`minimumSectionScores` (kiểm định attempt). Nhờ
vậy **bản nháp và lịch sử attempt không phụ thuộc vào mạng**.

`isStoredAttempt()` đồng thời được viết lại theo `ASSESS-P2-02`: attempt được
chấm lại bằng `rubricSnapshot` **của chính nó**, chỉ lùi về rubric hiện hành với
attempt cũ chưa có snapshot.

**Cạm bẫy đã dính và đã sửa:** `lib/assessment-details.ts` ban đầu import từ
`content/assessment-catalog.ts`, kéo theo `daily-assessments.ts` →
`curriculum.ts` vào **bundle client** (chunk `curriculum` 80,8 KB xuất hiện
trong `modulepreload` của `/assessments`). Nay hằng số và kiểu nằm ở
`content/assessment-chunk-format.ts` — module **không mang dữ liệu**.

**Kết quả đo** (`npm run measure:payload`, cùng một cách đo; phần JS giữ nguyên
giá trị đo sau khi sửa cho cả hai cột nên con số là ước lượng **bảo thủ**):

| Route | raw trước → sau | gzip trước → sau | brotli trước → sau |
| --- | --- | --- | --- |
| `/assessments` | 3 708,8 → **786,3 KB** (−78,8%) | 373,2 → **176,2 KB** (−52,8%) | 209,4 → **141,0 KB** (−32,7%) |
| `/theory` | 1 275,3 KB (không đổi) | 337,8 KB | 275,9 KB |
| `/roadmap` | 1 327,0 KB (không đổi) | 265,7 KB | 196,6 KB |
| `/lessons` | 1 319,2 KB (không đổi) | 397,1 KB | 333,7 KB |

Riêng phần tài liệu (HTML + RSC) của `/assessments`: brotli 107,8 → **37,7 KB**
(−65,0%).

**Chỗ chưa đạt ngưỡng và lý do.** Tiêu chí ≥50% đạt ở raw và gzip nhưng
**không** đạt ở brotli (−32,7%). Nguyên nhân là số học chứ không phải thiếu sót
nội dung: sau khi bỏ 290 bản ghi, phần còn lại bị chi phối bởi JS khung
(`framework` 190 KB + entry RSC 199 KB), tổng **106,6 KB brotli**. Mốc 50% của
baseline là 104,7 KB — tức **ngay cả một tài liệu 0 byte cũng không thể đạt**.
Muốn đi tiếp phải động vào tầng framework, nằm ngoài phạm vi một ticket về
payload nội dung.

**Hành vi đã kiểm trong trình duyệt thật:** trước tương tác có **0 request**
chunk; chọn một phiên tuần 20 → đúng **1** request `week-20.json`; chọn phiên
khác cùng tuần → **không** phát sinh request; quay lại phiên đầu → **bản nháp
còn nguyên**, không tải lại chunk. Khi ép `fetch` hỏng: đúng một lần thử, tiêu
đề và lịch sử attempt **vẫn render**, biểu mẫu khoá kèm nút thử lại, và bấm thử
lại sau khi mạng hồi phục thì tải thành công.

## 4. Những quyết định kỹ thuật cần biết trước khi sửa tiếp

### 4.1. Grader — giao thức kết quả

Kết quả **không còn đi qua stdout**. Worker ghi một tệp JSON vào đường dẫn do
grader chỉ định, kèm `nonce` ngẫu nhiên chống giả mạo. Envelope phân biệt ba kết
cục: `returned` / `raised` / `harness_error`. **Chỉ `raised` mới được so với
`raises`** trong spec. Khớp exception theo **MRO đã định danh đầy đủ**
(`builtins.ValueError`), nên subclass hợp lệ được nhận còn class trùng tên ở
module khác bị từ chối.

`grader/proc.py` quản lý cây tiến trình: POSIX dùng `killpg` trên session mới,
Windows dùng **Job Object** với cờ `KILL_ON_JOB_CLOSE` (lùi về `taskkill /F /T`
nếu không tạo được). Output đọc bằng luồng riêng, cắt ở 64 KB mỗi kênh.

`grade.py` có fallback `sys.path` để chạy được cả hai kiểu:
`python -m unittest grader/tests/test_grader.py` và `python grader/grade.py …`
như README hướng dẫn. **Đừng bỏ fallback này.**

### 4.2. Theory — logic thuần tách khỏi UI

`lib/theory-exam-state.ts` giữ ba thứ, UI và test dùng chung:

- `evaluateGates()` — **verdict duy nhất** của dự án. Ba ngưỡng 75/60/50 chỉ tồn
  tại ở `MOCK_INTERNAL_GATES`; không nhân bản chúng ở nơi khác.
- `secondsLeftUntil()` — đồng hồ suy từ **deadline tuyệt đối**, không trừ dần.
- `ActiveAttempt` — schema có version, `parseActiveAttempt()` fallback `null` an
  toàn với mọi dữ liệu hỏng.

`TheoryExam.tsx` giữ `practiceResponses` và `examResponses` **tách hẳn**. Rời bài
thi đang chạy phải qua `window.confirm`.

### 4.3. localStorage

Mọi truy cập đi qua `lib/local-storage.ts`. Nguyên tắc: đọc/ghi **không bao giờ
ném**; dữ liệu chưa hiểu được thì **giữ nguyên trong storage**, không ghi đè.

- Roadmap: id không còn trong curriculum được archive (`partitionKnownIds`) và
  ghi lại kèm; không tính vào phần trăm nhưng không bị xoá.
- Assessment: attempt không nhận diện được nằm trong `unreadableRef` và luôn
  được ghi lại cùng attempt mới. Attempt mới mang `rubricSnapshot` bất biến.

### 4.4. Notebook

**Không sửa trực tiếp 8 notebook** — chúng được sinh từ
`scripts/generate-notebooks.mjs`. Sửa generator rồi chạy lại:

```bash
node scripts/generate-notebooks.mjs
```

Cell id sinh tất định từ `sha1(file:index)` nên chạy hai lần không tạo diff.
Validator (`scripts/validate_notebooks.py`) **không còn dùng `assert`** và phải
fail cả dưới `python -O`. Có biến môi trường `VOAI_NOTEBOOK_DIR` để test trỏ
sang thư mục fixture.

### 4.5. Tương phản màu — cái bẫy đã sập một lần

Nhiều selector dùng chung cho **cả nút thường (nền sáng) lẫn nút active (nền
tối)**: `.exercise-list button`, `.assessment-list>button`, `.catalog-list
button`, `.progress-strip`, `.eyebrow`, `.content-index`.

Trong phiên này tôi đã **làm hỏng** bốn chỗ vì tính màu thay thế theo giả định
"mọi chữ đều trên nền sáng" — tương phản tụt xuống 2.74:1. Cách sửa đúng là
**tách quy tắc theo trạng thái**, không đổi một màu chung.

**Bắt buộc:** khi đụng vào màu, đo bằng nền **render thật** trong trình duyệt
(đi ngược cây DOM tìm nền hiệu dụng), không đọc CSS tĩnh. Trạng thái hiện tại:
**0 vi phạm trên cả 8 trang** với ngưỡng 4.5:1 (3.0:1 cho chữ lớn).

### 4.6. Pyodide

Worker **không còn `importScripts`**. Nó ưu tiên bản cùng origin ở
`public/pyodide/v<version>/`, lùi về jsDelivr, và trong cả hai trường hợp đều
**fetch → băm SHA-384 → mới thực thi**.

`PYODIDE_LOADER_SHA384` **đã được pin** (cập nhật 17/08/2026):
`sha384-90so5tCKvl0xs9agU29IMKlAVzhfzFX7QO//YxQkRhJG58bBZrFN+2ZTRB026X5X`.
Giá trị lấy trùng khớp từ **hai CDN độc lập** (jsDelivr và unpkg, cùng 14 913
byte) và được xác nhận lần thứ ba từ chính trình duyệt, sau đó chạy Code Arena
end-to-end để chắc chắn runtime vẫn boot. `tests/pages-export.test.mjs` có
assertion chặn việc để lại chuỗi rỗng.

**Khi đổi `PYODIDE_VERSION` phải tính lại băm** — lệnh nằm trong chú thích của
chính hằng số đó. Quên là Code Arena từ chối chạy, đúng theo thiết kế.

Boot timeout (`BOOT_TIMEOUT_MS = 60s`) tách hẳn khỏi timeout thực thi 8 giây.

## 5. Tệp đã thay đổi

**37 tệp sửa:** 2 workflow, `.gitignore`, `package.json`, 6 component, 7 tệp
`content/`, 4 tệp `grader/`, 8 notebook, 2 script, 2 tệp test, `app/globals.css`,
`app/layout.tsx`, `docs/KIEN_TRUC_HE_THONG.md`, `public/pyodide-worker.js`.

**12 tệp mới:**

```
grader/proc.py                      quản lý cây tiến trình + hạn ngạch output
lib/local-storage.ts                lớp truy cập localStorage an toàn
lib/roadmap-groups.ts               nhóm 290 phiên + cổng bất biến
lib/theory-exam-state.ts            gate/deadline/persistence của bài thi
scripts/tests/                      test cho validator notebook
tests/helpers/load-module.mjs       nạp TS vào node:test bằng esbuild
tests/local-storage.test.mjs        10 test
tests/theory-content.test.mjs       4 test (26 đáp án số tính lại độc lập)
tests/theory-exam-state.test.mjs    11 test
```

### Bổ sung phiên 17/08/2026

```
content/assessment-chunk-format.ts   hằng số + kiểu chunk, KHÔNG mang dữ liệu
content/assessment-catalog.ts        catalog nhẹ + dựng chunk
lib/assessment-details.ts            loader chunk có cache, chống tải trùng
scripts/emit-assessment-chunks.mjs   sinh 42 chunk vào public/data/assessments/
scripts/measure-payload.mjs          đo tổng transfer ban đầu raw/gzip/brotli
tests/assessment-chunks.test.mjs     8 test cho catalog/chunk/loader
content/math/                        5 module Toán (types, check-answer, index)
components/MathExplorer.tsx          giao diện lớp Toán
app/math/page.tsx                    route /math
tests/math-content.test.mjs          7 test, tính lại độc lập 69 đáp án số
docs/HUONG_DAN_TRIEN_KHAI_GITHUB.md  hướng dẫn triển khai (nguồn)
scripts/build-guide-docx.py          dựng bản .docx từ tài liệu trên
```

Ba tệp chưa track và **chưa quyết định**: `.codex-build-docx.py`,
`docs/AI_FIX_ALL_ISSUES.docx`, `docs/AI_FIX_ALL_ISSUES.md`.

## 6. Nghiệm thu — kết quả thật lần chạy cuối (17/08/2026)

```text
npm run lint                 PASS
npm exec tsc -- --noEmit     exit 0
npm test                     53/53
npm run test:pages           5/5
npm run test:grader          17/17
npm run test:notebooks       12/12
npm run validate:notebooks   PASS (cả `python` và `python -O`)
npm run build:pages          PASS (10 trang + 404)
npm audit --audit-level=high 0 lỗ hổng
git diff --check             exit 0
```

Số test tăng từ **8** (baseline audit) lên **94**.

Kiểm tra bổ sung đã chạy:

- Quét tương phản 10 trang bằng nền render thật → **0 vi phạm** (3 074 nút văn bản).
- Rà a11y có cấu trúc 10 trang × 21 trạng thái panel → **0 vi phạm**.
- 10/10 route trả HTTP 200, đúng tiêu đề, **0** lỗi KaTeX, **0** chuỗi
  `undefined`/`NaN` lọt vào markup, **0** lỗi console khi tải sạch.
- Code Arena end-to-end với băm Pyodide đã pin: lời giải đúng → **Đạt**.
- Assessment lazy-load: 0 request trước tương tác, 1 request/tuần, không tải
  trùng, nháp không mất, đường lỗi + thử lại hoạt động.
- Toán: 69 đáp án số **tính lại độc lập** đều khớp; bài luyện chấm đúng/sai/chưa
  trả lời; deep link `?topic=` và back/forward khớp nội dung.
- Roadmap: 42 nhóm, **290/290 phiên · 100%**, giữ nguyên sau reload.
- Theory: đáp án practice không rò sang exam; reload giữ đáp án + thứ tự câu +
  deadline; quá hạn tự chốt **đúng một lần**; storage hỏng không làm trắng trang.
- 92 import tương đối trong 67 tệp nguồn **không có sai hoa/thường** (điều kiện
  sống còn cho CI Ubuntu).

## 7. Việc còn treo

1. **Ngưỡng brotli của `PERF-P3-01`** — đạt −78,8% raw và −52,8% gzip nhưng
   −32,7% brotli. Không thể đi tiếp nếu không đụng tầng framework (mục 3).
2. **Chưa chạy CI thật.** Mọi lệnh mới chạy trên Windows; workflow đã sửa nhưng
   chưa có lần push nào để xác nhận trên Ubuntu. Đã chạy kiểm hoa/thường cho 92
   import tương đối trong 67 tệp — 0 lỗi — nên rủi ro còn lại là thấp.
3. **Job Object trên Windows** còn khe hở lý thuyết ~30 ms giữa lúc `Popen` trả
   về và lúc gán job. Đóng hẳn cần `CreateProcess` ở trạng thái suspended, mà
   `subprocess.Popen` không lộ `hThread`. Rủi ro thực tế gần bằng 0 vì riêng
   thời gian khởi động CPython đã dài hơn khe hở này. `restype`/`argtypes` của
   sáu hàm kernel32 **đã được khai báo đúng** (17/08) — trước đó HANDLE 64 bit bị
   ctypes cắt về `c_int`.

### Đã đóng trong phiên 17/08/2026

- `PERF-P3-01` (mục 3).
- `PYODIDE_LOADER_SHA384` đã pin và đã kiểm end-to-end (mục 4.6).
- **Rà a11y có cấu trúc** trên 10 trang × 21 trạng thái panel: thứ tự heading,
  đúng một `h1`, landmark `main`/`nav`, nhãn cho mọi ô nhập, tên cho mọi
  nút/liên kết, `alt` ảnh, `id` trùng, `lang`. Ba lỗi thật đã sửa: `/lessons` có
  hai `h1` và một `<select>` không nhãn, `/theory` nhảy cấp h1→h3 ở chế độ
  Luyện, `/labs` có hai ô nhập không nhãn. Kết quả cuối: **0 vi phạm**.
- Quét tương phản lại trên 10 trang bằng nền render thật: **0 vi phạm**
  (3 074 nút văn bản).
- Sửa lỗi xuất tiến độ ở `RoadmapExplorer`: thẻ `<a>` chưa gắn vào DOM và
  `revokeObjectURL` gọi đồng bộ ngay sau `click()` — Firefox có thể không tải
  được tệp.

## 8. Trước khi đẩy lên GitHub

- Repo **phải đặt tên đúng `voai-lab`**. Base path bị chốt cứng ở 5 chỗ
  (`next.config.ts`, `run-vinext.mjs`, `prepare-pages.mjs`,
  `pages-export.test.mjs`, `NotebookHub.tsx`); tên khác sẽ 404 toàn bộ asset.
- **Settings → Pages → Source = "GitHub Actions"**, nếu không job `deploy` sẽ lỗi.
- Cả 6 action đã pin SHA và đã đối chiếu với upstream bằng `git ls-remote`; đều
  chạy trên runtime Node 24.
- **`public/data/assessments/` không được commit.** Thư mục này sinh lại ở mọi
  chế độ chạy của `scripts/run-vinext.mjs` và đã nằm trong `.gitignore`; commit
  vào là tạo nguồn sự thật thứ hai.
- Bản hướng dẫn đầy đủ cho người vận hành: `docs/HUONG_DAN_TRIEN_KHAI_GITHUB.md`
  (và bản Word cùng tên). Dựng lại bản Word bằng
  `python scripts/build-guide-docx.py`.
