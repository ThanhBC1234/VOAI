# Bản giao việc cho AI: sửa toàn bộ lỗi sau audit VOAI Lab

> Mục đích: đây là tài liệu bàn giao trực tiếp cho một AI/kỹ sư khác để sửa
> toàn bộ lỗi đã được xác nhận trong đợt audit ngày 15/08/2026. Không được coi
> việc build xanh hiện tại là bằng chứng rằng các lỗi bên dưới đã hết.

## 1. Phạm vi và trạng thái ban đầu

- Kho mã: VOAI Lab.
- Nhánh được audit: `main`.
- Commit gốc: `cae07fc024ad4fd4b74bc211ec4eddad0196c9ae`.
- Stack chính: React 19, TypeScript, vinext/Vite, static GitHub Pages/OpenAI
  Sites, Python CLI grader, Pyodide Web Worker và 8 notebook Jupyter.
- Audit ban đầu không sửa mã nguồn.
- Mọi đường dẫn và số dòng trong tài liệu là mốc tại commit gốc. Hãy tìm lại
  symbol nếu số dòng dịch chuyển sau khi sửa.

Baseline đã đạt tại commit gốc:

```text
npm run lint                                      PASS
npm run typecheck                                 PASS
npm test                                          PASS (8/8)
npm run build:pages                               PASS
npm run test:pages                                PASS (4/4)
npm run test:grader                               PASS (3/3)
npm run validate:notebooks                        PASS nhưng validator thiếu schema check
npm audit --json                                  0 advisory đã biết
```

`validate:notebooks` đang cho kết quả dương tính giả đối với cell ID, còn test
grader hiện chưa đủ rộng. Vì vậy không được dùng các kết quả baseline này để
bỏ qua ticket tương ứng.

## 2. Quy tắc thực hiện

1. Sửa tất cả ticket có checkbox trong tài liệu này; không chỉ sửa nhóm P1.
2. Với lỗi có thể tự động hóa, trước tiên thêm test tái hiện thất bại, sau đó
   sửa để test chuyển sang đạt.
3. Không “sửa” bằng cách xóa yêu cầu, hạ ngưỡng, ẩn chức năng, giảm số phiên
   từ 290, hoặc đổi nội dung quảng bá cho dễ đạt nếu chức năng đã được cam kết.
4. Giữ tương thích cả build thường, GitHub Pages có base path và OpenAI Sites.
5. Không làm mất dữ liệu `localStorage` hiện có. Mọi thay đổi schema phải có
   version và migration/fallback không phá dữ liệu.
6. Không trộn output không tin cậy của bài nộp với giao thức nội bộ của grader.
7. Không sửa trực tiếp 8 notebook mà bỏ quên generator. Nếu notebook được sinh
   từ script, sửa nguồn sinh rồi tái tạo và kiểm tra diff nội dung.
8. Không làm yếu kiểm tra để test xanh. Test mới phải bao phủ đúng nguyên nhân
   gốc và ít nhất một case biên liên quan.
9. Sau mỗi nhóm lớn, chạy test hẹp; cuối cùng chạy toàn bộ Definition of Done ở
   cuối tài liệu.
10. Ghi rõ mọi quyết định kỹ thuật hoặc giới hạn còn lại trong báo cáo bàn giao.

## 3. Thứ tự triển khai đề nghị

1. P1: Roadmap, Theory Exam và Python grader.
2. P2: persistence, timeout/output quota, notebook schema và test contract.
3. P2: Lessons, Assessment, accessibility và nội dung học thuật.
4. P3: notebook curriculum, hiệu năng, CI, metadata, tài liệu và supply-chain.
5. Chạy toàn bộ test, build hai target, kiểm tra trình duyệt và lập bảng đối
   chiếu từng ticket.

---

## 4. Ticket P1 — bắt buộc sửa trước

### [ ] APP-P1-01 — Hiển thị đủ 3 phiên Finale và cho phép đạt 100% Roadmap

- Tệp liên quan:
  - `components/RoadmapExplorer.tsx:27-33`
  - `content/curriculum.ts:1227-1248`
- Hiện trạng: UI chỉ map 41 tuần và chỉ lấy session có `session.week ===
  week.week`. Ba phiên Finale có `week: null` nên không xuất hiện, nhưng mẫu số
  tiến độ vẫn là 290. Người học chỉ tương tác được với 287 phiên và tối đa đạt
  `287/290`, xấp xỉ 99%.
- Yêu cầu sửa:
  - Render một khu vực Finale rõ ràng sau tuần 41, giữ nguyên đủ 290 session.
  - Ba phiên Finale phải có cùng khả năng đánh dấu hoàn thành như phiên thường.
  - Bộ đếm, phần trăm, filter và trạng thái lưu phải dùng cùng một tập session.
  - Không đổi `week: null` thành một tuần giả chỉ để né logic nếu điều đó làm sai
    mô hình dữ liệu.
- Test bắt buộc:
  - Xác nhận đủ 290 session có thể được truy cập và toggle qua 41 accordion tuần
    cùng khu vực Finale; không bắt buộc cả 290 control tồn tại đồng thời trong DOM.
  - Đánh dấu đủ 290 session phải cho kết quả 100%.
  - Reload vẫn giữ trạng thái của ba phiên Finale.

### [ ] THEORY-P1-01 — Tách hoàn toàn đáp án Luyện tập và Thi thử

- Tệp liên quan: `components/TheoryExam.tsx:351-352,497-507,554-557,672-674`.
- Hiện trạng: hai chế độ dùng chung `responses`. Có thể bắt đầu thi, chuyển sang
  luyện tập, xem/trả lời cùng câu rồi quay lại thi với câu đã được điền và HUD đã
  tăng số câu trả lời.
- Yêu cầu sửa:
  - Dùng state riêng cho practice và exam, hoặc một state được namespace bằng
    mode/attempt ID.
  - Khi bắt đầu attempt mới, tạo snapshot cố định của danh sách câu thi và state
    câu trả lời mới; dữ liệu practice không được nhập vào attempt.
  - Khi còn active exam, không cho mở Practice/reveal. Muốn vào Practice, người
    dùng phải xác nhận bỏ attempt; Cancel phải quay lại đúng bài thi và deadline,
    Confirm mới được xóa active attempt. Không chỉ ẩn câu trùng ID vì người dùng
    vẫn có thể suy ra/tra câu theo nội dung.
- Test bắt buộc:
  - Reproduce chuỗi Thi → Luyện → reveal/trả lời → Thi; số câu đã trả lời trong
    bài thi phải không đổi.
  - Với active exam, cùng question ID không thể được mở/reveal qua Practice;
    Cancel thao tác rời bài không làm mất state.
  - Đáp án practice không ảnh hưởng điểm thi.
  - Hai attempt thi liên tiếp không dùng lại câu trả lời cũ.

### [ ] THEORY-P1-02 — Áp dụng đầy đủ các gate khi kết luận đậu/rớt

- Tệp liên quan:
  - `components/TheoryExam.tsx:581-585,620-623`
  - `content/theory/types.ts:254-258`
- Hiện trạng: UI công bố tổng điểm ≥75%, từng section ≥60% và Advanced ≥50%,
  nhưng verdict chỉ kiểm tra `latest.scorePercent >= passPercent`.
- Yêu cầu sửa:
  - Tạo một hàm thuần duy nhất tính verdict từ tổng điểm, breakdown theo section
    và cấu hình gate; UI và test cùng dùng hàm này.
  - Hiển thị rõ gate nào chưa đạt, không chỉ hiển thị một boolean chung.
  - Không nhân bản các con số 75/60/50 ở nhiều component.
- Test bắt buộc:
  - `266/344` điểm tổng nhưng Advanced 0% phải trượt.
  - Tổng ≥75% nhưng một section <60% phải trượt.
  - Chỉ khi tổng, mọi section và Advanced cùng đạt thì mới đậu.
  - Kiểm tra biên đúng bằng 75%, 60% và 50%.

### [ ] THEORY-P1-03 — Khôi phục bài thi đang làm sau reload

- Tệp liên quan: `components/TheoryExam.tsx:347-360,368-378,433-445`.
- Hiện trạng: mode, câu hỏi của attempt, responses, `examStarted` và thời gian
  còn lại chỉ nằm trong RAM. Reload làm bài thi trở về trạng thái chưa bắt đầu.
- Yêu cầu sửa:
  - Thêm schema persistence có version cho active attempt: attempt ID, question
    IDs/order, responses, startedAt, deadline và trạng thái submit.
  - Khôi phục đúng attempt sau reload; không tạo lại bộ câu hỏi khác.
  - Dùng deadline tuyệt đối, không tin một `secondsLeft` cũ.
  - Nếu reload sau deadline, tự chốt/nộp đúng một lần; chống double-submit.
  - JSON hỏng hoặc schema cũ phải fallback an toàn và không làm crash trang.
  - Xóa active attempt chỉ sau submit thành công hoặc khi người dùng xác nhận bỏ.
- Test bắt buộc:
  - Trả lời ít nhất một câu, reload và kiểm tra câu trả lời + thứ tự câu còn nguyên.
  - Giả lập reload trước/sau deadline.
  - Dữ liệu storage hỏng không làm trang trắng.

### [ ] GRADER-P1-01 — Phân biệt exception của bài nộp với lỗi của harness

- Tệp liên quan:
  - `grader/worker.py:30-34`
  - `grader/grade.py:52-54`
- Hiện trạng:
  - Lời gọi hàm và `json.dumps(result)` nằm trong cùng `try`, nên lỗi serialize
    bị báo như exception do hàm người học ném.
  - Grader so `errorType` với tên chuỗi tuyệt đối, nên subclass hợp lệ bị loại.
- Case đã tái hiện:
  - Hàm trả list tự tham chiếu làm `json.dumps` ném `ValueError`; case mong
    `ValueError` bị chấm đậu sai.
  - `class EmptyInputError(ValueError)` bị chấm trượt khi contract mong
    `ValueError`.
- Yêu cầu sửa:
  - Envelope kết quả phải phân biệt tối thiểu `returned`, `raised` và
    `harness_error`.
  - Chỉ exception phát sinh trong lời gọi hàm mới được so với `raises`.
  - Worker phải cung cấp MRO hoặc thông tin type đủ để nhận subclass đúng; không
    đánh đồng hai class chỉ vì trùng `__name__` ở module khác nếu contract cần
    định danh đầy đủ.
  - Lỗi serialize, import, protocol và setup phải là lỗi grader/runtime, không
    bao giờ thỏa `raises` của bài.
- Test bắt buộc: thêm vào `grader/tests/test_grader.py` các case circular return,
  subclass hợp lệ, exception sai type, import lỗi và kết quả không JSON-serializable.

### [ ] GRADER-P1-02 — Timeout phải dừng toàn bộ process tree

- Tệp liên quan: `grader/grade.py:36-45`.
- Hiện trạng: timeout chỉ dừng worker trực tiếp. Tiến trình con do bài nộp tạo ra
  có thể tiếp tục chạy hoặc giữ pipe. Trên Windows, timeout 0,2 giây đã mất 1,08
  giây và child vẫn ghi marker sau timeout.
- Yêu cầu sửa:
  - Thay luồng `subprocess.run` bằng quản lý `Popen` có process group/session.
  - POSIX: tạo session/process group và kill cả group khi timeout.
  - Windows: dùng Job Object hoặc cơ chế tương đương bảo đảm terminate tree;
    không chỉ gửi tín hiệu cho PID cha.
  - Sau kill phải drain/đóng pipe có giới hạn và cleanup file tạm chắc chắn.
  - Giới hạn tổng thời gian với một khoảng cleanup nhỏ, có tài liệu rõ.
- Test bắt buộc:
  - Bài nộp spawn child ngủ rồi ghi marker. Sau timeout, marker không bao giờ
    được tạo và không còn descendant.
  - Thời gian thực không vượt quá timeout cộng ngưỡng cleanup hợp lý.
  - Test chạy được trên Windows và POSIX, hoặc có nhánh kiểm tra riêng rõ ràng.

### [ ] GRADER-P1-03 — Tách giao thức kết quả khỏi stdout/stderr của bài nộp

- Tệp liên quan:
  - `grader/worker.py:32`
  - `grader/grade.py:46-57`
- Hiện trạng: stdout vừa là output tùy ý của bài nộp vừa là kênh JSON. Một
  `print("debug", end="")` làm bài đúng bị báo runtime; output `atexit` có thể phá
  JSON hoặc giả mạo protocol. Return code cũng chưa được xử lý chặt.
- Yêu cầu sửa:
  - Dùng kênh riêng cho envelope: dedicated pipe/file descriptor hoặc result
    file riêng trong thư mục tạm. Không parse “dòng stdout cuối cùng”.
  - stdout/stderr của bài nộp chỉ là log được giới hạn dung lượng.
  - Kiểm tra return code và phân biệt crash, timeout, protocol error, harness
    error, student exception và returned value.
  - Result channel phải chống ghi đè/giả mạo từ output thông thường của bài.
- Test bắt buộc:
  - `print` có/không newline, nhiều dòng, stderr và `atexit` không làm đổi điểm.
  - Worker crash hoặc envelope thiếu/hỏng phải thành runtime/harness error.
  - Output cố giả JSON không được điều khiển kết quả.

---

## 5. Ticket P2 — correctness, dữ liệu và độ ổn định

### [ ] THEORY-P2-01 — Sửa timer drift bằng deadline tuyệt đối

- Tệp liên quan: `components/TheoryExam.tsx:456-470`.
- Hiện trạng: mỗi callback `setInterval` chỉ trừ một giây. Khi tab nền, browser
  throttle hoặc máy sleep, 180 phút thực tế có thể kéo dài hơn và auto-submit
  muộn.
- Yêu cầu sửa: lưu `deadlineEpochMs`; mỗi tick tính
  `max(0, ceil((deadline-now)/1000))`. Lắng nghe resume/visibility nếu cần và bảo
  đảm submit đúng một lần khi hết hạn.
- Test bắt buộc: giả lập nhảy đồng hồ vài phút, tab pause/resume và deadline đã
  qua; thời gian hiển thị và submit phải theo thời gian thực.

### [ ] NOTEBOOK-P2-01 — Sinh cell ID hợp lệ và schema-validate cả 8 notebook

- Tệp liên quan:
  - `scripts/generate-notebooks.mjs:4-5,121`
  - `scripts/validate_notebooks.py`
  - `notebooks/*.ipynb`
- Hiện trạng: cả 8 notebook khai `nbformat_minor: 5` nhưng mọi cell thiếu `id`.
  Theo nbformat 4.5, ID phải là chuỗi hợp lệ, dài 1–64 ký tự và duy nhất trong
  notebook: <https://nbformat.readthedocs.io/en/latest/format_description.html#cell-ids>.
- Yêu cầu sửa:
  - Generator sinh ID xác định, ổn định giữa hai lần chạy và không trùng.
  - Dùng schema validation chính thức (`nbformat.validate`) hoặc kiểm tra tương
    đương đầy đủ; bổ sung dependency Python có pin nếu cần.
  - Tái sinh cả 8 notebook nhưng không làm mất nội dung/TODO/test hiện có.
- Test bắt buộc:
  - Mỗi cell có ID đúng pattern/độ dài và duy nhất trong notebook.
  - Chạy generator hai lần không tạo diff.
  - Một fixture thiếu/trùng ID phải làm validator exit khác 0.

### [ ] NOTEBOOK-P2-02 — Loại bỏ `assert` khỏi validator sản xuất

- Tệp liên quan: `scripts/validate_notebooks.py:20,26-29,40-47`.
- Hiện trạng: `python -O` loại bỏ `assert`; notebook sai metadata vẫn được báo
  hợp lệ.
- Yêu cầu sửa: thay tất cả assertion kiểm dữ liệu bằng validation chủ động ném
  exception/thu lỗi, in đường dẫn + nguyên nhân và trả exit code khác 0.
- Test bắt buộc: chạy validator bằng cả Python thường và `python -O` trên fixture
  có `solo90=false`; cả hai phải thất bại.

### [ ] ARENA-P2-01 — Thêm timeout và retry cho quá trình khởi động Pyodide

- Tệp liên quan:
  - `components/CodePractice.tsx:84-96`
  - `public/pyodide-worker.js:8-10`
- Hiện trạng: timeout thực thi chỉ được đặt sau event `ready`. Nếu
  `importScripts`/`loadPyodide` treo, UI loading vô hạn và nút bị khóa.
- Yêu cầu sửa:
  - Bắt đầu boot timeout ngay khi tạo Worker, tách khỏi execution timeout.
  - Khi boot lỗi/quá hạn: terminate worker, hủy timer/listener, hiển thị lỗi rõ
    và cho phép thử lại bằng worker mới.
  - Không để response của worker cũ cập nhật state của lần chạy mới.
- Test bắt buộc: worker không gửi `ready`, gửi `error`, ready muộn và retry thành
  công; UI không bao giờ kẹt vĩnh viễn.

### [ ] ARENA-P2-02 — Giới hạn stdout/stderr ở browser và CLI grader

- Tệp liên quan:
  - `public/pyodide-worker.js:29,33-34,46`
  - `components/CodePractice.tsx:146`
  - `grader/grade.py:36-41`
- Hiện trạng: cả browser và Python CLI buffer output không giới hạn. Một bài
  infinite-print có thể hết RAM trước timeout hoặc gửi một message quá lớn về
  main thread.
- Yêu cầu sửa:
  - Đặt quota byte/ký tự và số dòng có hằng số chung/documented.
  - Sau quota, ngừng lưu thêm; thêm đúng một marker `[output truncated]`.
  - Không `join`/structured-clone payload vượt quota.
  - Cân nhắc terminate sớm khi output abuse; kết quả phải nhất quán và giải thích
    được cho người học.
- Test bắt buộc: output lớn hơn quota nhiều lần không làm memory tăng tuyến tính,
  chỉ có một marker truncate và UI/grader vẫn hoàn tất trong giới hạn thời gian.

### [ ] GRADER-P2-01 — Phủ đủ edge case của toàn bộ contract

- Tệp liên quan:
  - `grader/specs.json`
  - `grader/tests/test_grader.py`
  - public/blind cases trong `components/CodePractice.tsx`
- Bổ sung tối thiểu:
  - k-NN: tie thứ hai theo thứ tự từ điển, `k=0`, `k>len`, dữ liệu rỗng/sai shape.
  - Linear predict: ragged ở hàng sau, sai kích thước, input rỗng và không mutate.
  - Binary metrics: độ dài khác nhau, nhãn ngoài 0/1, rỗng và zero-positive.
  - Conv2d: input/kernel rỗng, hàng ragged, kernel lớn hơn input và input không
    mutate.
  - Vector mean: ragged ở vị trí không đầu tiên, input rỗng/sai type nếu contract
    có quy định.
- Yêu cầu sửa:
  - Đồng bộ contract giữa UI, `specs.json`, notebook/tài liệu và grader.
  - Mỗi yêu cầu viết trong mô tả phải có ít nhất một test chấp nhận và một test
    từ chối khi phù hợp.
  - Test phải có ít nhất một triển khai cố ý vi phạm từng rule và chứng minh bị
    chấm trượt.

### [ ] LESSON-P2-01 — Đồng bộ filter, reader và query URL

- Tệp liên quan: `components/LessonsExplorer.tsx:43-46`.
- Hiện trạng:
  - Sau khi đổi filter, reader có thể giữ bài không còn trong catalog đã lọc.
  - Chọn bài mới không cập nhật `?lesson=`, nên refresh/chia sẻ URL quay về bài
    cũ hoặc bài đầu.
- Yêu cầu sửa:
  - Selected lesson luôn thuộc tập filtered hiện tại; nếu không, chọn fallback
    xác định và cập nhật UI/URL đồng bộ.
  - Khi chọn bài, cập nhật query bằng API router/history phù hợp mà không làm mất
    GitHub Pages base path hoặc query khác.
  - Back/forward, refresh và deep link phải hoạt động.
- Test bắt buộc: tái hiện CV → filter Nền tảng; kiểm tra reader/catalog khớp,
  URL thay đổi, refresh và browser back/forward giữ đúng bài. Khi filter/search
  trả 0 kết quả phải có empty state, không render reader với `undefined`; xóa
  filter phải khôi phục một lựa chọn hợp lệ và URL tương ứng.

### [ ] ASSESS-P2-01 — Không làm mất draft khi chuyển assessment

- Tệp liên quan: `components/AssessmentExplorer.tsx:301-304`.
- Hiện trạng: `chooseAssessment` luôn gọi `setDraft(emptyDraft(...))`, xóa dữ
  liệu vừa nhập không cảnh báo.
- Yêu cầu sửa: lưu draft theo assessment ID và autosave cục bộ bằng schema có
  version. Chuyển assessment không được xóa draft; chỉ một thao tác “Xóa bản
  nháp” riêng có xác nhận mới được xóa.
- Test bắt buộc: nhập nhiều trường ở assessment A, chuyển B rồi quay A; dữ liệu A
  vẫn nguyên. Reload phải khôi phục đúng draft; Confirm xóa thì mất draft còn
  Cancel phải giữ nguyên.

### [ ] ASSESS-P2-02 — Migration lịch sử không được âm thầm xóa attempt cũ

- Tệp liên quan: `components/AssessmentExplorer.tsx:106-183,234-249`.
- Hiện trạng: loader bắt buộc score/threshold/status của attempt trùng rubric
  hiện tại, lọc các record khác rồi ghi đè `localStorage`. Deployment đổi rubric
  có thể xóa vĩnh viễn lịch sử hợp lệ.
- Yêu cầu sửa:
  - Version hóa schema attempt.
  - Mỗi attempt lưu snapshot bất biến của rubric/weights/threshold tại thời điểm
    nộp; không tái diễn giải lịch sử bằng rubric mới.
  - Migration phải giữ record cũ. Record chưa hiểu được cần được archive/hiển thị
    read-only hoặc bỏ qua mà không ghi đè dữ liệu gốc.
  - Chỉ ghi storage sau parse + migration thành công hoàn toàn.
- Test bắt buộc: lưu attempt bằng rubric A, đổi content sang rubric B rồi load;
  attempt A vẫn tồn tại và giữ nguyên điểm/trạng thái. JSON hỏng một phần không
  được xóa các record còn lại hoặc crash trang.

### [ ] STORAGE-P2-01 — Xử lý lỗi `localStorage` nhất quán

- Tệp liên quan:
  - `components/CodePractice.tsx:109-113`
  - `components/RoadmapExplorer.tsx:23-24`
  - các helper persistence mới của Theory/Assessment.
- Hiện trạng: `JSON.parse`/`setItem` có thể ném khi dữ liệu hỏng, storage bị chặn
  hoặc quota đầy.
- Yêu cầu sửa:
  - Tạo helper đọc/ghi có validation, version và `try/catch` dùng chung hoặc cùng
    quy ước.
  - Ghi thất bại phải báo trạng thái dễ hiểu và giữ state trong phiên; không tạo
    uncaught handler error.
  - ID tiến độ không còn tồn tại trong curriculum không được tính vào phần trăm,
    nhưng phải được giữ/archive trong migration; không lọc rồi ghi đè làm mất dữ
    liệu chỉ vì content hiện tại không nhận ra ID đó.
- Test bắt buộc: malformed JSON, `getItem`/`setItem` ném, quota error, stale ID và
  schema version lạ.

### [ ] A11Y-P2-01 — Sửa semantics, focus, keyboard và contrast

- Tệp liên quan:
  - `components/TheoryExam.tsx:104-180`
  - `components/LessonsExplorer.tsx:34-36`
  - `components/InteractiveLabs.tsx:111`
  - `app/globals.css:75,91,93,103,140-146`
- Yêu cầu sửa:
  1. Dùng semantics theo đúng loại câu: single-choice dùng radio/radiogroup;
     multi-select dùng checkbox; true/false-set dùng một radiogroup Có/Không cho
     từng mệnh đề. Trạng thái chọn và disabled/revealed phải được đọc đúng.
  2. Code textarea phải có focus indicator nhìn thấy rõ; không chỉ dựa vào màu
     nền mơ hồ.
  3. Lab k-NN phải có đường thao tác bàn phím tương đương. Nếu canvas không thể
     nhập tọa độ thuận tiện, cung cấp control/form thay thế có label.
  4. Điều chỉnh các màu metadata để text thường đạt tối thiểu 4.5:1. Baseline đã
     đo được các cặp chỉ 2.64:1, 2.98:1, 3.41:1 và 4.02:1.
  5. Giữ nguyên khả năng dùng chuột/cảm ứng và phong cách tổng thể.
- Test bắt buộc:
  - Keyboard-only cho chọn đáp án và lab.
  - Accessibility tree thể hiện đúng role/name/state cho single-choice,
    multi-select và từng mệnh đề true/false-set.
  - Focus indicator xuất hiện khi tab tới editor.
  - Chạy axe hoặc kiểm tra tương đương và không còn violation mức serious hoặc
    critical trong các luồng đã audit; ghi lại tỷ lệ contrast sau sửa.

### [ ] CONTENT-P2-01 — Sửa 11 lỗi kiến thức/công thức đã xác nhận

Không đổi đáp án đúng nếu đáp án hiện đã đúng; sửa statement, explanation và ví
dụ liên quan sao cho nhất quán toàn dự án.

| # | Vị trí | Nội dung phải sửa |
| --- | --- | --- |
| 1 | `content/theory/section-a2-supervised.ts:395` | Với weighted k-NN `1/d`: A = `1/0.1 = 10`, B = `1/0.2 + 1/0.3 ≈ 8.333`; A thắng, không phải A thua. |
| 2 | `content/theory/section-e-foundations.ts:740,747` | `10^10 / (1.7×10^6) ≈ 5.88×10^3`, khoảng 3.77 bậc, gần 4 bậc; không phải 6 bậc/hàng triệu lần. |
| 3 | `content/theory/section-b1-neural-basics.ts:837` | Adam không bias correction ở bước đầu có hệ số `(1-0.9)/sqrt(1-0.999) ≈ 3.162`, nên update mặc định thường lớn hơn, không phải quá nhỏ. |
| 4 | `content/theory/section-e-foundations.ts:196` | `det(X^T X)=0` làm công thức nghịch đảo không dùng được và nghiệm có thể không duy nhất; không có nghĩa least-squares không có nghiệm. |
| 5 | `content/theory/section-c-vision.ts:482` | Residual giúp đường truyền gradient nhưng không bảo đảm gradient không thể triệt tiêu; `I + J_F` có thể bằng 0. |
| 6 | `content/theory/section-b1-neural-basics.ts:618,630` | Convolution cơ bản là translation-equivariant, không phải translation-invariant; đồng bộ với `content/lessons-multimodal.ts:99`. |
| 7 | `content/theory/section-a1-toolchain.ts:578` | `Tensor.view()` cần shape tương thích với size/stride; không phải mọi tensor non-contiguous đều không view được. |
| 8 | `content/lessons-core.ts:362` | Với `n` mẫu, `d` feature, thử `n` threshold và quét `n` mẫu cho mỗi feature là `O(d n^2)`, không phải `O(n d^2)`. |
| 9 | `content/theory/section-e-foundations.ts:184` | Cosine similarity đã tự chia hai norm; L2-normalize trước không bắt buộc, chỉ hữu ích khi thay cosine bằng dot product/tối ưu truy vấn. |
| 10 | `content/theory/section-b2-architectures.ts:360` và `content/lessons-core.ts:1983` | Self-attention không positional information là permutation-equivariant đối với output theo token, không phải permutation-invariant; đồng bộ với `content/lessons-multimodal.ts:1143`. |
| 11 | `content/theory/section-c-vision.ts:391` | `Dice = 2IoU/(1+IoU)`; Dice chỉ lớn hơn khi `0 < IoU < 1`, bằng IoU tại 0 và 1. |

Test/kiểm tra bắt buộc:

- Thêm test hoặc script bắt các phát biểu/công thức quan trọng có thể kiểm máy.
- Rà lại câu hỏi, đáp án, explanation và lesson khác có cùng phát biểu để tránh
  sửa một nơi nhưng còn mâu thuẫn ở nơi khác.
- Chạy lại validator 350 câu và toàn bộ 47 câu numeric.

---

## 6. Ticket P3 — nội dung, hiệu năng, CI và hardening

### [ ] NOTEBOOK-P3-01 — Làm nội dung notebook khớp lời cam kết

- Tệp liên quan:
  - `content/notebooks.ts:46-50`
  - `README.md:163`
  - `notebooks/03_mlp_backprop_pytorch.ipynb`
  - `notebooks/05_nlp_attention.ipynb`
  - `notebooks/06_audio_stft_mel.ipynb`
  - `notebooks/07_mock_voai_end_to_end.ipynb`
  - generator tương ứng trong `scripts/generate-notebooks.mjs`.
- Yêu cầu sửa:
  1. Notebook 05: triển khai attention mask thật, gồm contract, broadcast/shape,
     mask trước softmax và test mask.
  2. Notebook 06: bổ sung Mel filterbank và MFCC thực tế, không dừng ở framing +
     STFT; có shape/numeric test cơ bản.
  3. Notebook 07: không cho `model=object(); validation_score=0` vượt checkpoint.
     Kiểm tra fit/predict interface, split không leakage, seed/reproducibility,
     metric hợp lệ và artifact/submission tối thiểu.
  4. Notebook 03: định nghĩa rõ loss, hidden activation, cache và gradient shape
     cho `backward`; visible test phải thực sự gọi backward và nên có numerical
     gradient check nhỏ.
- Không được giải quyết bằng cách chỉ xóa các từ “mask”, “Mel/MFCC”, “backprop”
  hoặc “audit” khỏi mô tả nếu mục tiêu học tập đã cam kết các kỹ năng này.
- Test bắt buộc: generator idempotent, validator đạt, mỗi notebook chạy được từ
  đầu đến cuối trong môi trường sạch với lời giải/reference fixture phù hợp.

### [ ] PERF-P3-01 — Giảm initial payload của Assessment và các content page

- Tệp liên quan:
  - `app/assessments/page.tsx:44-46`
  - `components/AssessmentExplorer.tsx:441`
  - `content/daily-assessments.ts`
- Baseline Pages:
  - `assessments/index.html`: khoảng 1,763,066 byte.
  - `assessments/index.rsc`: khoảng 1,618,604 byte.
  - `roadmap/index.html`: khoảng 459.5 KB.
  - `theory/index.html`: khoảng 466.7 KB; RSC khoảng 396.9 KB.
  - `lessons/index.html`: khoảng 360 KB; RSC khoảng 314.8 KB; client chunk của
    LessonsExplorer đã đo khoảng 260 KB.
- Yêu cầu sửa:
  - Initial payload chỉ chứa catalog/metadata cần để liệt kê; tải chi tiết theo
    tuần, nhóm hoặc assessment bằng static JSON/dynamic chunk tương thích Pages.
  - Theory/Lessons/Roadmap cũng phải được profile; không chuyển nguyên ngân hàng
    nội dung từ HTML/RSC sang một JS bundle hoặc eager JSON khác rồi gọi là giảm.
    Nội dung chưa cần cho màn hình đầu nên được chunk/lazy-load theo ranh giới ổn
    định, có cache và không gây layout/state race.
  - Vẫn truy cập đủ 290 assessment, deep link/filter và offline behavior đã công
    bố; không làm lộ loading race hoặc mất draft.
  - Không đổi sang dịch vụ backend bắt buộc chỉ để giảm bundle.
- Tiêu chí nghiệm thu:
  - Initial HTML/RSC không còn chứa toàn bộ nội dung chi tiết của 290 assessment.
  - Ngân sách phải tính tổng transfer ban đầu gồm HTML, RSC, JS và mọi JSON/fetch
    tự chạy trước tương tác, ở cả raw và gzip/brotli. Không chỉ đo hai file HTML.
  - Trước khi người dùng chọn assessment, Network không được tải chi tiết của cả
    290 assessment. Tổng initial transfer của route Assessment phải giảm tối thiểu
    50% so với cùng cách đo ở baseline.
  - Ghi bảng trước/sau cho Assessment, Theory, Roadmap và Lessons; không tăng số
    request vô hạn, không tải lại cùng chunk và chứng minh cache/offline theo
    behavior dự án đã công bố.

### [ ] CI-P3-01 — Nâng GitHub Actions khỏi runtime Node 20

- Tệp liên quan:
  - `.github/workflows/ci.yml:37`
  - `.github/workflows/pages.yml:35,43,79,97`
- Hiện trạng: còn dùng `setup-python@v5`, `configure-pages@v5`,
  `upload-pages-artifact@v4`, `deploy-pages@v4`. GitHub đã chuyển runtime mặc
  định sang Node 24 từ 16/06/2026:
  <https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/>.
- Yêu cầu sửa:
  - Nâng lên major tương thích Node 24 và vẫn pin full commit SHA.
  - SHA ứng viên đã được audit ngày 15/08/2026, nhưng phải `git ls-remote` xác
    minh lại tag trước khi dùng:
    - `actions/setup-python@v6`:
      `ece7cb06caefa5fff74198d8649806c4678c61a1`
    - `actions/configure-pages@v6`:
      `45bfe0192ca1faeb007ade9deae92b16b8254a0d`
    - `actions/upload-pages-artifact@v5`:
      `fc324d3547104276b827a68afc52ff2a11cc49c9`
    - `actions/deploy-pages@v5`:
      `cd2ce8fcbc39b97be8ca5fce6e763baed58fa128`
  - Cập nhật chú thích/tài liệu nói về SHA nếu cần; không nới permissions.
- Test bắt buộc: parse YAML/actionlint nếu có, chạy CI và Pages workflow thật,
  xác nhận artifact/deploy thành công và không còn cảnh báo Node 20.

### [ ] SEO-P3-01 — Fallback Open Graph phải truy cập công khai

- Tệp liên quan:
  - `app/layout.tsx:13-15,31-33`
  - `tests/rendered-html.test.mjs:6,28,49`
- Hiện trạng: khi thiếu `NEXT_PUBLIC_SITE_URL`, metadata trỏ tới
  `https://VOAI-2027.dixmilsapin.chatgpt.site/og.png`; kiểm tra ẩn danh ngày
  15/08/2026 nhận HTTP 401. Test chỉ kiểm chuỗi nên vẫn xanh. Pages không bị vì
  workflow truyền URL riêng.
- Yêu cầu sửa:
  - Chọn fallback canonical công khai đúng môi trường hoặc tạo URL ảnh cùng origin
    theo cấu hình deploy; không dùng endpoint cần đăng nhập cho social crawler.
  - Test phải kiểm cấu trúc URL theo từng target. Trong smoke/deploy test có mạng,
    xác nhận anonymous GET/HEAD ảnh trả 200 và content type ảnh.
  - Không làm sai canonical/base path GitHub Pages.

### [ ] DOC-P3-01 — Sửa tài liệu đường dẫn Pyodide Worker

- Tệp liên quan:
  - `docs/KIEN_TRUC_HE_THONG.md:278-280`
  - `components/CodePractice.tsx:84`
- Hiện trạng: tài liệu ghi `new Worker("/pyodide-worker.js")`, trong khi code đúng
  dùng `sitePath("/pyodide-worker.js")`. URL root trong tài liệu sẽ 404 trên
  `/VOAI/` của GitHub Pages.
- Yêu cầu sửa: cập nhật snippet và giải thích base path; snippet trong docs phải
  phản ánh code thực tế và vượt link/render check.

### [ ] SUPPLY-P3-01 — Loại bỏ CDN thành điểm tin cậy duy nhất của Pyodide

- Tệp liên quan: `public/pyodide-worker.js:8-10` và cấu hình build/deploy.
- Hiện trạng: classic worker chạy script trực tiếp từ jsDelivr. Version đã pin
  nhưng `importScripts` không có SRI; CDN là trust boundary và single point of
  failure.
- Yêu cầu sửa:
  - Ưu tiên self-host các asset Pyodide cần thiết cùng origin, có manifest/hash
    được pin và quy trình cập nhật rõ.
  - Nếu dùng cơ chế fetch + verify thay vì self-host hoàn toàn, phải kiểm hash
    trước khi thực thi và có failure UI; không fallback âm thầm sang script chưa
    xác minh.
  - CSP/deploy phải cho worker chạy ở cả Sites và Pages.
  - Ghi rõ kích thước bổ sung và cache strategy.
- Test bắt buộc: chạy Code Arena khi CDN bị chặn nhưng asset cùng origin còn hoạt
  động; asset sai hash phải bị từ chối với lỗi có thể retry.

---

## 7. Test hồi quy tối thiểu cần bổ sung

AI thực hiện có thể chọn framework phù hợp, nhưng cuối cùng repository phải có
test tự động cho các nhóm sau:

- Roadmap: 290/290, Finale render/persist và 100%.
- Theory: state isolation, đầy đủ gate, persistence/reload, absolute deadline,
  expired attempt và malformed storage.
- Grader: result envelope, subclass exception, serialization failure, stdout
  contamination, return code, process-tree timeout và output quota.
- Notebook: schema 4.5, ID duy nhất/ổn định, validator dưới `python -O`, nội dung
  bổ sung mask/Mel/MFCC/backward/mock audit.
- Lessons: filter/reader/query/deep-link/back-forward.
- Assessment: draft switching, schema migration và giữ lịch sử rubric cũ.
- Accessibility: semantics câu trả lời, keyboard lab, focus editor và contrast.
- Deploy: Pages base path, Worker URL, metadata URL và action major.
- Performance: một guard chống tái nhúng toàn bộ 290 assessment vào initial page.
- Content: invariant hoặc numeric checks cho các công thức đã sửa.

Không nhất thiết mọi kiểm tra UI phải là snapshot. Ưu tiên test hành vi, hàm thuần
cho scoring/migration/deadline, và browser integration cho reload, URL, focus.

## 8. Definition of Done

Chỉ được báo “đã sửa hết” khi đáp ứng đồng thời tất cả điều kiện:

### 8.1. Checklist chức năng

- [ ] Tất cả checkbox ticket trong tài liệu đã hoàn thành.
- [ ] Mỗi P1 có test tái hiện nguyên nhân gốc và test đã đạt.
- [ ] Không còn cách mang response từ Practice sang Exam.
- [ ] Reload không làm mất active exam; deadline không drift.
- [ ] 290 session đều xuất hiện và có thể đạt 100%.
- [ ] Grader không nhầm student exception, harness error hay stdout.
- [ ] Timeout không để lại descendant process.
- [ ] Notebook hợp lệ theo schema 4.5 và chạy generator hai lần không tạo diff.
- [ ] Dữ liệu localStorage cũ không bị xóa sau migration.
- [ ] Nội dung học thuật và notebook đã được rà chéo sau sửa.

### 8.2. Lệnh bắt buộc

Chạy từ root repository trong môi trường sạch:

```powershell
npm ci
npm run lint
npm run typecheck
npm test
npm run build:pages
npm run test:pages
npm run validate:notebooks
npm run test:grader
npm audit --json
git diff --check
```

Ngoài ra:

- Chạy test UI/browser mới cho Theory, Roadmap, Lessons, Assessment, Code Arena
  và accessibility.
- Chạy notebook validator bằng cả `python` và `python -O` trên fixture sai.
- Chạy grader process-tree test trên Windows và POSIX trong CI.
- Đo tổng initial transfer raw/gzip/brotli của Assessment, Theory, Roadmap và
  Lessons, gồm HTML/RSC/JS/eager JSON; xác nhận chưa tải đủ 290 assessment trước
  tương tác.
- Kiểm tra browser console không có error/warning trên các route chính.
- Kiểm tra anonymous URL của Open Graph trả 200.
- Kiểm tra GitHub Pages thật với base path, không chỉ localhost root.

### 8.3. Báo cáo bàn giao cuối

Báo cáo của AI sửa lỗi phải gồm:

1. Bảng `Ticket | File đã đổi | Test chứng minh | Trạng thái` cho mọi ticket.
2. Danh sách command đã chạy và kết quả thực, không chỉ nói “đã test”.
3. Kết quả browser repro trước/sau cho các lỗi P1.
4. Số liệu payload Assessment trước/sau.
5. Kết quả chạy trên Windows/POSIX của timeout process tree.
6. Mọi thay đổi schema storage và cách migration dữ liệu cũ.
7. Bất kỳ ticket nào chưa hoàn thành phải ghi rõ là chưa hoàn thành; không được
   gộp thành “known limitation” rồi tuyên bố sửa hết.

## 9. Các kiểm tra không được bỏ qua vì baseline đang xanh

- `npm test` cũ không phát hiện state leak, reload loss hay verdict thiếu gate.
- `npm run test:grader` cũ chỉ có ba case vector mean.
- `npm run validate:notebooks` cũ không phát hiện cell ID thiếu và bị vô hiệu bởi
  `python -O`.
- Test metadata cũ chỉ so chuỗi URL, không kiểm ảnh có truy cập công khai.
- Build Pages thành công không chứng minh đủ 290 session được render hoặc Worker
  có boot timeout.
- Không có console error không đồng nghĩa semantics accessibility đúng.

Hãy dùng tài liệu này làm source of truth cho phạm vi sửa. Khi code thực tế và số
dòng thay đổi, giữ nguyên mục tiêu hành vi và tiêu chí nghiệm thu của ticket.
