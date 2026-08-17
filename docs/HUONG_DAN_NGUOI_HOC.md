# Hướng dẫn người học VOAI Lab

Hướng dẫn này dành cho học sinh lớp 11 đã biết C++ và đọc được tài liệu tiếng
Anh, nhưng mới bắt đầu AI. Mỗi ngày chỉ cần một phiên Core 30 phút; khi có thời
gian hoặc gặp phần cần thực nghiệm, dùng phiên Deep tối đa 60 phút. Không tăng
thời lượng để bù cho việc bỏ qua nền tảng. Chỉ hai checkpoint readiness đã đặt
trước là ngoại lệ: mock 180 phút ở tuần 32 và mock 6 giờ ở tuần 38.

## 1. Đích đến và bằng chứng

Đến cuối lộ trình, mục tiêu không phải “đã xem hết 78 bài giảng” mà là có thể:

- giải thích cơ chế, giả định, failure mode và độ phức tạp của thuật toán;
- tự cài phần lõi của thuật toán nhỏ trước khi dùng thư viện; với model
  pretrained lớn, tự viết pipeline, evaluation và ablation thay vì huấn luyện
  lại toàn bộ model từ đầu;
- dựng pipeline không leakage cho ML, DL, CV, NLP, Audio và multimodal;
- đọc đề lạ, làm baseline sớm, ghi experiment và tạo submission tái lập;
- hoàn thành ít nhất các dự án tabular, CV, NLP/Audio, hai mock readiness, các
  block remediation và capstone;
- code đóng tài liệu, tự viết test và bảo vệ miệng.

Bằng chứng là tệp chạy được, test, commit, bảng experiment, báo cáo lỗi và phần
giải thích. Dấu tick trên website chỉ giúp theo dõi, không thay thế bằng chứng.

## 2. Chuẩn bị một lần trước phiên đầu

### Website

Tại thư mục dự án, làm theo phần
[Khởi chạy website trên Windows](../README.md#khởi-chạy-website-trên-windows).
Đừng cài thêm dependency ngẫu nhiên nếu `npm ci` và `npm run dev` chưa báo lỗi
cần nó.

Nếu học hoàn toàn online, làm theo
[Hướng dẫn GitHub Pages, Codespaces, Colab và Actions](GITHUB_ONLINE.md).
Chỉ dùng URL Pages sau khi workflow **Deploy GitHub Pages** của chính repository
đã thành công; tệp workflow có sẵn không tự chứng minh website đang online.
Codespaces phù hợp để chạy website/grader, còn Colab phù hợp cho notebook và có
runtime tạm thời.

### Không gian bài làm cá nhân

Không viết lời giải trực tiếp đè lên notebook mẫu nếu muốn giữ một bản sạch.
Tạo một thư mục học riêng, ví dụ:

```text
C:\VOAI-hoc-vien\
├── nhat-ky.md
├── notebook-lam-bai\
├── bai-nop-cli\
├── du-an\
├── on-tap\
└── progress-backup\
```

Sao chép notebook cần làm từ `C:\VOAI\notebooks` sang
`C:\VOAI-hoc-vien\notebook-lam-bai`. `scripts/generate-notebooks.mjs` là công
cụ sinh lại template và có thể ghi đè tệp cùng tên; người học không chạy nó trên
bản đang làm.

### Nhật ký

Chép mẫu record từ [Quy tắc SOLO-90](QUY_TAC_SOLO_90.md#8-nhật-ký-bắt-buộc)
vào `nhat-ky.md`. Đặt bốn ngày ôn +1, +7, +21, +60 ngay khi một bài đạt lần đầu.

### Kiểm tra khởi động

1. Mở `00_khoi_dong_va_diagnostic.ipynb` từ bản sao cá nhân.
2. Restart kernel và Run All khi TODO còn trống để biết cell nào dự kiến chưa
   đạt; đây không phải lỗi cài đặt nếu assertion của phần bài làm thất bại.
3. Tự hoàn thiện `stable_unique`, không dùng `dict.fromkeys`.
4. Chạy lại từ kernel sạch.
5. Giải thích mutation và complexity của cách dùng list so với set.

Kết quả chẩn đoán dùng để chọn Core hay Deep trong tuần 1, không dùng để bỏ qua
tuần nền tảng.

## 3. Bản đồ công cụ

| Công cụ | Dùng khi nào | Không dùng để làm gì |
| --- | --- | --- |
| `/roadmap` | Chọn phiên hôm nay, đọc mục tiêu, đánh dấu và export tiến độ | Chứng minh đã thành thạo |
| `/assessments` | Ghi retrieval, bằng chứng, giải thích và rubric thủ công cho từng phiên | Chạy code hoặc tự động xác nhận correctness |
| `/lessons` | Học 78 bài chi tiết, quiz retrieval và lấy coding challenge | Chép đáp án hoặc thay thực nghiệm |
| `/labs` | Tạo trực giác bằng dự đoán và thay một tham số | Kết luận model thật sẽ hoạt động tương tự |
| `/notebooks` | Mở tám notebook từ repository public bằng Colab/GitHub | Giữ runtime, output hoặc dữ liệu riêng tư sau khi phiên Colab kết thúc |
| `/practice` | Làm 5 bài code nhỏ và nhận feedback nhanh | Chấm toàn bộ 41 tuần hoặc giữ code lâu dài |
| Notebook | Thí nghiệm, biểu đồ, pipeline và report có thể Run All | Chạy cell tùy thứ tự rồi gọi là tái lập |
| Grader CLI | Chấm từ tiến trình sạch, public/private cases | Sandbox mã không tin cậy hoặc chống xem specs |
| `/resources` | Tra nguồn chính thức/sách mở sau khi tự thử | Sao chép notebook mẫu thành bài của mình |

## 4. Cách học một phiên Core 30 phút

1. **5 phút truy hồi:** từ phiên trên `/roadmap`, mở assessment tương ứng trong
   tab riêng và trả lời khi tài liệu còn đóng. Không đóng tab trước khi lưu vì
   draft chưa nộp không được autosave.
2. **10 phút hiểu:** mở một bài trong nhóm **Bài giảng nên đọc trong tuần** của
   `/roadmap`, rồi đối chiếu với outcome của phiên và đọc mục tiêu, trực giác,
   công thức. Tính tay một ví dụ nhỏ. Đây là ánh xạ theo tuần, không phải mỗi
   phiên trong 205 phiên bài học có riêng một bài giảng 1:1.
3. **15 phút tự làm:** hoàn thành lát cắt nhỏ nhất trong `soloBuild` của
   `/roadmap`; code và ít nhất một test biên. Trước khi hết phiên, ghi bằng
   chứng, giải thích ngắn, tự chấm rubric và lưu attempt trên `/assessments`.

Kết thúc bằng một câu: “Nếu đổi input/ràng buộc nào thì cách hiện tại sai?” Ghi
câu trả lời và lịch ôn vào nhật ký. Nếu chưa có artifact, không tick phiên.

## 5. Cách học một phiên Deep 60 phút

Thực hiện đủ Core, sau đó thêm 30 phút:

- mở rộng từ toy input sang batch/dữ liệu thật nhỏ;
- với thuật toán nhỏ phù hợp, so sánh bản from-scratch với thư viện trên cùng
  seed; với model pretrained, so sánh pipeline/metric hoặc làm một ablation;
- thêm property test, gradient check hoặc leakage check;
- đo time/memory thay vì chỉ nêu Big-O;
- làm error analysis hoặc một ablation duy nhất;
- restart và Run All trước khi khóa phiên.

Deep không có nghĩa là xem thêm video. Nó phải tạo thêm bằng chứng kỹ thuật.

## 6. Nhịp cố định của một tuần

Mỗi tuần trong `/roadmap` có đúng 7 phiên:

| Ngày | Loại phiên | Kết quả tối thiểu |
| ---: | --- | --- |
| 1 | Bài khái niệm 1 | Trace hoặc hàm nhỏ + test |
| 2 | Bài khái niệm 2 | Bản cài/so sánh thứ hai |
| 3 | Bài khái niệm 3 | Hợp đồng hàm và edge cases |
| 4 | Bài khái niệm 4 | Lỗi thường gặp/benchmark nhỏ |
| 5 | Bài khái niệm 5 | Tích hợp và fresh run |
| 6 | Lab | Artifact đúng acceptance criteria |
| 7 | Checkpoint | Bài đóng tài liệu + rubric + kế hoạch sửa |

Mở tuần trong `/roadmap` để lấy đúng mục tiêu, `soloBuild`, thời lượng `Deep`,
cách tự kiểm và deliverable. Deep là 60 phút ở ngày thường; R1/R2 hiển thị lần
lượt 180/360 phút. Bản mô tả dài nằm trong
[Lộ trình 41 tuần](LO_TRINH_41_TUAN.md).

Mỗi phiên trong bảy phiên có đúng một phiếu trên `/assessments`. Phiếu lưu bằng
chứng và rubric thủ công; nó không thay thế test executable của artifact.

Không đi tiếp chỉ vì đã đến ngày lịch. Nếu checkpoint trượt, dùng retry rule của
tuần và làm lại phần yếu từ trang trắng.

## 7. Tuần 1 cụ thể

Tuần 1 chuyển tư duy C++ sang Python có kiểm thử:

1. **Cú pháp và kiểu dữ liệu:** ánh xạ `vector/map/set/tuple` sang cấu trúc
   Python; dự đoán output trước khi chạy.
2. **Điều khiển luồng:** loop, comprehension, `enumerate`, `zip`; test input rỗng,
   trùng và số âm.
3. **Hàm, scope, type hints:** viết ba hàm thuần, mỗi hàm ít nhất ba assert.
4. **File, CSV/JSON và lỗi:** parser nhỏ phải báo lỗi rõ, không nuốt exception.
5. **Notebook tái lập:** seed, thứ tự cell; Restart → Run All không lỗi.
6. **Lab Mini EDA:** notebook đọc dữ liệu, thống kê, test và README ngắn.
7. **Checkpoint Python bridge:** quiz, hai hàm trong 20 phút và giải thích một
   bug stateful notebook.

`00_khoi_dong_va_diagnostic.ipynb` phù hợp cho ngày 1; các deliverable còn lại
do người học tự tạo theo tuần, không chờ một notebook dựng sẵn.

## 8. Dùng `/roadmap` đúng cách

1. Lọc domain hoặc tìm chủ đề.
2. Mở tuần đang học và đọc **mục tiêu**, **đầu ra tuần**, **điều kiện qua**.
3. Mở kế hoạch của đúng phiên; chép outcome thành mục tiêu một câu trong nhật ký.
4. Dùng link **Làm assessment phiên này** để mở đúng phiếu 1:1 với session.
5. Chỉ tick sau khi đã có artifact, self-check và một attempt thủ công đã lưu.
6. Cuối mỗi tuần bấm **Xuất tiến độ**, chuyển file JSON vào
   `progress-backup` và thêm ngày vào tên file.
7. Mỗi bốn tuần mở tab **Ma trận IOAI** và chọn ngẫu nhiên một artifact để kiểm
   chứng; không tự suy ra rằng “được ánh xạ” nghĩa là “đã biết”.

Website không import snapshot trở lại và không đồng bộ thiết bị. Nhật ký và
artifact cá nhân là nguồn khôi phục chính.

### Ghi assessment thủ công của phiên

`/assessments` có 290 phiếu ánh xạ 1:1 tới 290 session. Đây là sổ lưu bằng
chứng formative/manual, không phải 290 chương trình chấm tự động.

1. Mở phiếu từ link trong `/roadmap` hoặc tìm theo session, ngày, domain và loại
   phiên.
2. Trả lời toàn bộ câu retrieval trước khi mở tài liệu. Giao diện hiện không
   khóa ô retrieval, không ẩn coding task trước bước này và không ghi timestamp
   bắt đầu; kỷ luật closed-book do người học tự giữ. Nếu cần rời trang, ghi câu
   trả lời vào nhật ký vì draft chưa bấm lưu chỉ nằm trong React state.
3. Tự làm code/notebook bên ngoài form; sau đó dán mô tả file/commit, lệnh chạy,
   test và kết quả vào **Bằng chứng code**. Link repository là tùy chọn.
4. Viết phần giải thích bắt buộc bằng lời của mình: data flow/shape, lựa chọn,
   test biên, chi phí và failure mode theo prompt của phiếu.
5. Tự nhập điểm cho bốn phần trong giới hạn rubric, xác nhận SOLO-90 và đã rà
   automatic-fail, rồi bấm lưu attempt.
6. Trạng thái `passed`, `needs-revision` hoặc `incomplete` được suy ra từ trường
   bắt buộc và điểm tự nhập. Trang không chạy code, không mở link bằng chứng và
   không tự xác nhận correctness; cần grader, review hoặc oral defense riêng.
7. Nhiều lần nộp của cùng session đều được giữ trên thiết bị. Cuối tuần bấm
   **Xuất attempts JSON** và sao lưu cùng progress JSON.

Attempts nằm trong localStorage key `voai-assessment-attempts-v1`, độc lập với
dấu tick `/roadmap` và trạng thái 5 bài executable ở `/practice`. Pass tự đánh
giá không tự đánh dấu hai nơi còn lại.

## 9. Dùng `/lessons` theo năm lượt

Mỗi bài có năm tab; không đọc tất cả một lượt rồi mới code.

1. **Hiểu:** kiểm tra prerequisite; tự viết lại ký hiệu và tính tay ví dụ toy.
2. **Tự làm:** với thuật toán nhỏ, đi theo trace rồi tự cài phần lõi; với model
   pretrained lớn, tự viết data/inference hoặc training pipeline, metric, kiểm
   tra shape/schema, error analysis và ít nhất một ablation. Không đặt lời giảng
   cạnh editor để chép và không coi huấn luyện lại model lớn từ đầu là mục tiêu.
3. **Lỗi & độ phức tạp:** trước khi đọc, tự đoán hai failure mode và Big-O; sau
   đó đối chiếu.
4. **Kiểm tra:** trả lời closed-book rồi mới bấm đối chiếu. Câu tự luận dùng đáp
   án tham chiếu để tự chấm, không phải máy chấm semantic.
5. **Bài code:** chép chữ ký hàm và acceptance criteria sang tệp cá nhân; tự
   thiết kế test trước khi mở Code Arena/CLI.

Câu trả lời quiz chỉ nằm trong state của trang và mất khi reload. Ghi câu sai
vào nhật ký; không bấm lại tới khi nhớ đáp án mà không hiểu.

## 10. Dùng lab tương tác

Một lượt lab đúng có bốn bước:

1. đọc câu hỏi và **khóa dự đoán** trước khi thao tác;
2. chỉ đổi một biến, ví dụ learning rate hoặc `k`;
3. ghi before/after và giải thích cơ chế gây thay đổi;
4. tự code phép tính lõi bằng NumPy/Python rồi đối chiếu.

Thử tối thiểu một cấu hình bình thường, một biên và một cấu hình cố ý làm thuật
toán thất bại. Reload đặt lại lab; dự đoán không được lưu. Sáu lab hiện có là mô
phỏng trọng điểm, không phải simulator cho mọi bài trong catalog.

## 11. Dùng Code Arena trong trình duyệt

1. Chọn bài và chép starter vào tệp cá nhân để tránh mất code.
2. Viết ít nhất ba test riêng trên giấy/tệp trước.
3. Tự cài trong editor.
4. Chạy **Test công khai**; đọc loại lỗi, không dò ca kiểm tra mù.
5. Sửa nguyên nhân gốc và chạy lại.
6. Chỉ bấm **Nộp kiểm tra mù** khi test công khai và test tự viết đã đạt.
7. Chép phiên bản đạt ra tệp rồi chấm lại bằng CLI từ process sạch.

Mỗi lần bấm chạy/nộp, giao diện terminate worker cũ nếu còn và tạo một Web
Worker mới. Worker tải/khởi tạo Pyodide từ CDN trong trạng thái bootstrap riêng;
cache HTTP có thể giảm lượng tải mạng nhưng mỗi lượt vẫn là runtime mới. Bộ đếm
thực thi 8 giây chỉ bắt đầu sau khi runtime báo sẵn sàng, và worker bị terminate
sau kết quả, lỗi hoặc timeout. Fresh Worker vẫn không phải mức cô lập
process/container. Dùng CLI khi cần một process Python mới cho từng case.

Các ca kiểm tra mù trên web chỉ không hiện trước trong giao diện; chúng vẫn nằm
trong client source/bundle và có thể đọc được. Đây là rào cản luyện tập, không
phải bảo mật đề. Code Arena chỉ có 5 bài executable mẫu, không phải ngân hàng
chấm tự động cho 78 bài hay 290 assessment.

## 12. Dùng notebook đúng cách

Có thể mở notebook từ bản sao cá nhân trên máy/Codespaces hoặc từ
`/notebooks/` bằng Colab. Link Colab chỉ xác định đúng kho khi website biết
`owner/VOAI`; runtime Colab là tạm thời, vì vậy phải lưu bản làm vào nơi
mình kiểm soát và không commit token/dữ liệu riêng tư.

### Trước khi code

- mở bản sao, không mở bản template để làm trực tiếp;
- ghi seed, dependency và phiên bản quan trọng;
- viết expected shape/output trước cell;
- chia cell theo data → transform → model → evaluation, không tạo state ẩn.

### Trong khi code

- mỗi TODO phải có test gần nó;
- không dùng test set để chọn threshold/hyperparameter;
- in shape và summary, không dump tensor/dataset lớn;
- một thử nghiệm chỉ thay một giả thuyết;
- ghi seed, config, metric, thời gian và quyết định giữ/bỏ.

### Trước khi nộp

1. lưu notebook;
2. Restart kernel;
3. Run All theo thứ tự;
4. kiểm tra mọi output có nghĩa, không có path bí mật/cục bộ tuyệt đối;
5. đóng notebook, mở lại và đọc report như người chấm;
6. hoàn thành exit ticket bằng lời của mình.

Lệnh `py scripts/validate_notebooks.py` kiểm tra đúng bộ 8 tên tệp,
JSON/metadata, AST Python của từng code cell, execution history/output phải
trống và các marker `TODO`/`Visible tests`/`Exit ticket`. Dấu
`Validated 8 notebooks` vẫn không chứng minh cell đã chạy, dependency hoạt
động, test đạt hoặc bài làm đúng.

## 13. Dùng grader CLI đúng cách

Giữ mỗi bài trong một tệp Python có đúng chữ ký hàm. Ví dụ:

```powershell
py grader/grade.py vector-mean "C:\VOAI-hoc-vien\bai-nop-cli\vector_mean.py" --public
py grader/grade.py vector-mean "C:\VOAI-hoc-vien\bai-nop-cli\vector_mean.py"
```

Quy trình:

1. chạy test do mình viết;
2. chạy `--public`;
3. sửa và fresh run;
4. ghi prediction về edge cases private;
5. chạy full grader;
6. lấy `correctnessPoints` làm phần 45 điểm của rubric;
7. không mở `grader/specs.json` để dò private case.

`wrong-answer` nghĩa là output không tương đương expected; `exception` liên quan
case mong đợi lỗi; `runtime` gồm lỗi import/chạy/JSON; `timeout` thường là vòng
lặp hoặc độ phức tạp quá lớn. Đây là nhóm chẩn đoán, không phải lời giải.

Grader thực thi top-level code của tệp ở mỗi case. Đặt demo/training dài dưới
`if __name__ == "__main__":` và giữ module import nhanh. Chỉ chạy bài của chính
bạn vì grader không phải sandbox bảo mật.

## 14. Chấm bài và khóa mastery

Sau full run, dùng [rubric 100 điểm](QUY_TAC_SOLO_90.md#7-rubric-100-điểm-cho-một-bài-code).
Một bài đạt tối thiểu 75 và qua toàn bộ gate. Checkpoint tuần có thể yêu cầu
70–85 tùy nội dung; nếu threshold thấp hơn 75, checkpoint có thể cho phép đi
tiếp nhưng bài vẫn cần ôn để đạt chuẩn SOLO-90.

Phiếu `/assessments` giúp lưu câu trả lời, evidence và điểm tự chấm theo ngưỡng
của đúng session. Trạng thái pass tại đây vẫn là formative/manual: form không
thực thi code và không xác minh link, test log hay lời giải thích. Chỉ kết hợp
artifact fresh-run với grader/review/oral defense mới tạo bằng chứng correctness.

Một bài chỉ chuyển từ **đạt** sang **vững** sau khi qua +1, +7 và +21; chuyển
sang **bền** sau +60. Đặt lịch và cách thi lại theo
[mục mastery](QUY_TAC_SOLO_90.md#9-mastery-và-lịch-ôn-172160).

## 15. Khi bị chậm tiến độ

Lịch là thứ tự học, không phải lý do tick bài chưa làm. Nếu nghỉ:

- tiếp tục phiên còn thiếu, không nhảy thẳng tới ngày trên lịch;
- không ghép hai phiên thành một buổi 2 giờ;
- ưu tiên 30 phút Core liên tục hơn một buổi dài cuối tuần;
- R1 180 phút và R2 360 phút là hai ngoại lệ sức bền đã định trước; nếu bận hoặc
  không khỏe, dời nguyên khối thay vì chẻ nhỏ rồi vẫn ghi là full mock;
- nếu trượt prerequisite, chuyển 2–3 phiên Deep thành phiên sửa nợ;
- nếu chậm hơn 7 phiên, dừng bài mới trong một tuần, xử lý hàng đợi theo thứ tự;
- nếu vẫn không đạt gate, lùi ngày capstone thay vì nén nền tảng.

Vì mục tiêu cho phép tăng thời gian khi cần, chất lượng checkpoint quan trọng
hơn việc khớp tuyệt đối 31/05/2027. Tuy nhiên, mọi thay đổi phải ghi ngày mới và
lý do trong nhật ký, không kéo dài vô hạn vì tuning.

## 16. Khi một bài quá khó

Đi theo thứ tự phục hồi:

1. thu input về ví dụ tính tay;
2. quay lại shape/axis nếu lỗi tensor;
3. quay lại gradient/chain rule nếu gradient check sai;
4. quay lại split/leakage trước mọi competition pipeline;
5. quay lại PyTorch loop trước model modality;
6. quay lại mask trước attention/transformer/audio batching;
7. dùng prompt AI verifier sau khi có giả thuyết và test.

Không xin AI “gợi ý cách làm” chung chung; dùng đúng ranh giới trong
[SOLO-90](QUY_TAC_SOLO_90.md#4-prompt-ai-verifier).

## 17. Dự án và mock VOAI

Mỗi dự án phải có baseline sớm, split hợp lệ, experiment ledger, error analysis
và fresh-run. Dùng cấu trúc deliverable chuẩn tại
[Lộ trình 41 tuần](LO_TRINH_41_TUAN.md#10-cấu-trúc-deliverable-chuẩn).

Trong mock:

- khóa tài liệu và AI tới sau khi nộp;
- đọc metric, schema và ngân sách trước model;
- tạo baseline trong giới hạn đã đặt;
- một submission tương ứng một hypothesis có log;
- không dò leaderboard vô hướng;
- giữ test/mock-test kín;
- tái chạy raw data → prediction → submission bằng một lệnh/notebook Run All.

Hai mốc phải hoàn thành trước giai đoạn thi dự kiến nhưng không được giả vờ biết
quy chế 2027:

- **R1, 26/03/2027:** mock trắc nghiệm trên máy 180 phút theo format VOAI 2026
  chỉ để luyện; lập scorecard theo miền và error ledger;
- **R2, 07/05/2027:** mock lập trình 6 giờ ML/CV/NLP theo format VOAI 2026 chỉ
  để luyện; lưu submission, notebook sạch, report và ledger;
- lịch, số bài, luật, cách chấm, ngưỡng chọn và thời lượng VOAI 2027 đều là
  `TBD` tới khi Ban Tổ chức công bố. Khi có nguồn mới, cập nhật `rules-diff.md`
  rồi mới đổi runbook; không sửa lịch theo suy đoán.

Tuần 40 là remediation từ lỗi thật của R1/R2, không phải lần mock đầu tiên.

Capstone chỉ được công bố khi demo hoạt động, report khớp code/config và mọi
claim có bằng chứng. Package/demo output không tự chứng minh model tốt ngoài dữ
liệu đã đánh giá.

## 18. Xử lý lỗi thường gặp

### Website không khởi động

Kiểm tra đang ở thư mục có `package.json`, Node đủ phiên bản và `npm ci` đã kết
thúc. Chạy `npm run build` để lấy lỗi đầy đủ; không cài package khác chỉ để che
lỗi import.

### `/practice` treo ở tải Python hoặc timeout

Nếu đang ở trạng thái **Đang tải Python**, kiểm tra mạng tới jsDelivr; thời gian
này không tính vào timeout thực thi. Nếu báo mã chạy quá 8 giây sau khi runtime
đã sẵn sàng, kiểm tra vòng lặp và độ phức tạp. Thử lại bài ngắn; mỗi lượt thử
vốn đã tạo worker mới nên reload không phải bước bắt buộc để làm sạch runtime.
Nếu vẫn lỗi, dùng grader CLI và ghi rõ đây là fallback.

### Kết quả notebook đổi sau Run All

Kiểm tra seed, cell phụ thuộc thứ tự, mutation và split. Xóa output không sửa
được state; phải Restart kernel.

### CLI báo runtime

Chạy trực tiếp tệp, kiểm tra import/top-level code, tên hàm và kiểu output có thể
serialize. Thu nhỏ tới case công khai trước khi nghĩ tới private test.

### Mất tiến độ web

Tìm cả progress JSON từ `/roadmap` và attempts JSON từ `/assessments`. Giao diện
hiện chưa import hai snapshot này tự động, vì vậy dùng file để đối chiếu và nhập
lại thủ công; artifact/nhật ký vẫn là nguồn thật.

## 19. Checklist cuối ngày và cuối tuần

### Cuối ngày

- [ ] Có artifact mở được.
- [ ] Có ít nhất một test biên.
- [ ] Ghi được một failure mode hoặc invariant.
- [ ] Fresh run phần đã làm.
- [ ] Assessment thủ công của phiên đã lưu với evidence và điểm tự chấm trung thực.
- [ ] Nhật ký và lịch ôn đã cập nhật.
- [ ] Chỉ tick phiên sau các mục trên.

### Cuối tuần

- [ ] Năm bài có bằng chứng riêng.
- [ ] Lab đạt acceptance criteria.
- [ ] Checkpoint làm đóng tài liệu.
- [ ] Bảy assessment attempts tương ứng bảy phiên đã được lưu trung thực.
- [ ] Rubric và gate được chấm trung thực.
- [ ] Deliverable mở được từ đường dẫn đã ghi.
- [ ] Progress JSON được export và sao lưu.
- [ ] Attempts JSON từ `/assessments` được export và sao lưu.
- [ ] Lịch ôn tuần tới không xung đột quá tải.

## 20. Bắt đầu ngay hôm nay

1. Chạy website theo [README](../README.md).
2. Mở `/roadmap`, tuần 1, phiên đầu và chép mục tiêu vào nhật ký.
3. Mở assessment của phiên trong tab riêng, trả lời retrieval khi tài liệu còn đóng.
4. Mở `/lessons`, bài Python nền tảng, chỉ đọc tab **Hiểu**.
5. Làm bản sao notebook `00_khoi_dong_va_diagnostic.ipynb`.
6. Đặt timer 30 phút và tự hoàn thành lát cắt nhỏ nhất.
7. Fresh run, lưu evidence/rubric trên assessment, ghi exit ticket, đặt lịch +1
   và mới tick phiên.

Ngày mai bắt đầu bằng việc code lại phần lõi trong 5 phút mà không mở notebook.
