# VOAI Lab

VOAI Lab là bộ học liệu tự học AI dành cho học sinh THPT đã có nền tảng lập
trình, được thiết kế cho nhịp học **30–60 phút mỗi ngày** từ 15/08/2026 đến
31/05/2027. Hai checkpoint mô phỏng có chủ đích là ngoại lệ: R1 kéo dài 180
phút và R2 kéo dài 360 phút. Mục tiêu kép của dự án là hiểu cơ chế của các thuật toán AI và tạo
được sản phẩm có thể chạy, đồng thời hình thành kỷ luật làm bài thực hành kiểu
VOAI/IOAI.

Đây là dự án học tập độc lập, **không phải website chính thức của VOAI hoặc
IOAI**. Quy chế và đề cương chính thức luôn có quyền ưu tiên; xem các nguồn đang
được tuyển chọn tại `/resources`.

> **Bắt đầu ở đây:** làm theo [Hướng dẫn đăng GitHub và sử dụng VOAI Lab](docs/BAT_DAU_SU_DUNG.md).
> Tài liệu đi từ lúc tạo repository đến buổi học đầu tiên trên Pages, Codespaces
> và Colab.

## Trong kho mã có gì?

| Thành phần | Nội dung hiện có |
| --- | --- |
| Website vinext | Trang chủ, lộ trình 41 tuần, 78 bài giảng, ngân hàng lý thuyết vòng 1, 290 phiếu đánh giá, 6 lab tương tác, 5 bài code mẫu và thư viện tài nguyên |
| Lộ trình | 290 phiên liên tục: 205 bài, 41 lab, 41 checkpoint và 3 phiên tổng kết |
| Giáo trình thuật toán | 47 bài lõi + 31 bài đa phương thức: trực giác, toán, phần lõi from-scratch khi phù hợp, pipeline/eval cho pretrained model, lỗi thường gặp, quiz và thử thách code |
| Lý thuyết vòng 1 | 350 câu phủ 60/60 mục syllabus IOAI và 5 nhóm nền tảng bổ sung, với bốn mức độ và bốn dạng câu hiện có; kèm blueprint đề mock 100 câu trong 180 phút |
| Notebook | 8 notebook có ô trống và visible tests; không chứa lời giải hoàn chỉnh |
| Bộ đánh giá | 290 phiếu lưu minh chứng và rubric thủ công; phòng code Pyodide cùng CLI Python có 5 bài luyện mẫu |
| Tài liệu vận hành | Quy tắc SOLO-90, hướng dẫn người học, kiến trúc và lộ trình chi tiết |

Lộ trình 41 tuần nêu nhiều deliverable mà người học phải tự tạo. Tám notebook
trong kho mã là các checkpoint thực hành đã tuyển chọn, **không phải 41 notebook
lời giải dựng sẵn**.

Phạm vi chấm được tách rõ: chỉ **5 task mẫu** hiện có test executable trong Code
Arena/CLI; **290 assessment** là phiếu formative/manual để lưu retrieval,
evidence, giải thích và điểm tự chấm. Chúng không chạy code và không phải 290
auto-grader.

## Khởi chạy website trên Windows

### Yêu cầu

- Windows PowerShell;
- Node.js `>=22.13.0` như khai báo trong `package.json`;
- kết nối mạng khi cài dependency và khi phòng code tải Pyodide lần đầu.

Từ thư mục gốc của dự án:

```powershell
node --version
npm --version
npm ci
npm run dev
```

Mở địa chỉ mà terminal in ra. Dừng máy chủ bằng `Ctrl+C`. Không nên đoán cổng
vì công cụ phát triển có thể chọn cổng khác nếu cổng mặc định đang bận.

Để kiểm tra bản dựng trước khi phát hành:

```powershell
npm run lint
npm run build
```

Chỉ chạy máy chủ production cục bộ sau khi `npm run build` kết thúc thành công:

```powershell
npm start
```

`npm run build` chỉ chứng minh dự án dựng được trong môi trường hiện tại; nó
không tự chứng minh website đã được deploy. Kho mã có cấu hình build cho OpenAI
Sites/Cloudflare và GitHub Pages, nhưng chỉ được gọi là đã phát hành khi job
deploy tương ứng thành công và có URL từ môi trường đó. `.openai/hosting.json`
để D1/R2 ở `null` vì phiên bản này không dùng cơ sở dữ liệu hay object storage
phía máy chủ.

## Học online bằng GitHub

Kho mã đã có cấu hình cho bốn luồng:

- GitHub Pages phục vụ website tĩnh dưới prefix `/voai-lab/`;
- Codespaces tạo VS Code trên web với Node 22 và Python 3.11; CI dùng bản Node
  ghi trong `.nvmrc`;
- trang `/notebooks/` mở tám notebook từ repository public bằng Colab;
- GitHub Actions chạy lint, type-check, test, notebook/grader checks và build
  Pages; workflow có thể khởi chạy ngay, nhưng chỉ deploy thành công sau khi
  Pages được bật cho repository.

Sự tồn tại của workflow không chứng minh một repository hoặc URL công khai đã
được triển khai. Cần tạo repository public tên chính xác `voai-lab`, bật
`Settings → Pages → Source: GitHub Actions` và đợi job **Deploy GitHub Pages**
thành công. Xem lệnh, URL dự kiến và giới hạn của từng môi trường trong
[Hướng dẫn học online bằng GitHub](docs/GITHUB_ONLINE.md).

## Dùng website

| Đường dẫn | Cách dùng |
| --- | --- |
| `/` | Bắt đầu và xem triết lý học 30–60 phút/ngày |
| `/roadmap` | Lọc 41 tuần, mở kế hoạch từng phiên, đánh dấu hoàn thành, xem ma trận IOAI và xuất tiến độ JSON |
| `/lessons` | Tìm và đọc 78 bài thuật toán; mỗi bài đi từ trực giác tới thử thách tự code |
| `/theory` | Luyện 350 câu lý thuyết theo khối và mức độ, hoặc làm đề mock 100 câu có đồng hồ 180 phút và bóc tách điểm theo khối |
| `/assessments` | Làm và lưu minh chứng thủ công cho từng phiên; pass dựa trên trường bắt buộc và điểm tự nhập, không tự chứng minh code đúng |
| `/labs` | Dự đoán trước rồi thay tham số trong 6 mô phỏng: gradient descent, k-NN, convolution, attention, DFT và metrics |
| `/notebooks` | Mở 8 notebook trên GitHub hoặc Colab; link chỉ trỏ đúng repository khi biến/repository Pages đã được xác định |
| `/practice` | Viết Python, chạy test công khai rồi thử kiểm tra mù trong giao diện; các case vẫn xem được nếu đọc source/bundle |
| `/resources` | Mở quy chế, đề cương, sách mở và tài liệu chính thức |

`/roadmap` được dựng từ `content/curriculum.ts`; `/lessons` chuẩn hóa 47 bài lõi
và 31 bài đa phương thức từ hai catalog TypeScript. Bản đọc dài tương ứng là
[lộ trình đầy đủ](docs/LO_TRINH_41_TUAN.md). Không đánh dấu hoàn thành chỉ vì đã
đọc tiêu đề; bằng chứng là code, test, giải thích và nhật ký.

`content/week-lectures.ts` ánh xạ mỗi trong 41 tuần tới các bài giảng khuyến
nghị và `/roadmap` mở thẳng bài bằng `/lessons?lesson=<id>`. Đây là ánh xạ
theo tuần, không phải quan hệ 1:1 giữa 205 phiên loại `lesson` và 78 bài giảng;
outcome/kế hoạch của từng phiên vẫn là hợp đồng công việc cụ thể.

Tiến độ và các attempt đánh giá nằm trong `localStorage` của đúng trình duyệt và origin đang
dùng. Hãy bấm **Xuất tiến độ** tại `/roadmap` và **Xuất attempts JSON** tại
`/assessments` định kỳ. Xóa dữ liệu website, đổi
trình duyệt hoặc đổi origin có thể làm mất bản đang lưu. Mã đang gõ tại
`/practice` không được lưu tự động; hãy chép bài làm sang tệp cá nhân trước khi
đổi bài hoặc tải lại trang.

Ở `/practice`, mỗi lần bấm chạy/nộp tạo một Web Worker mới và khởi tạo Pyodide
từ CDN trong trạng thái bootstrap riêng; cache HTTP của trình duyệt có thể giảm
lượng tải lại nhưng không biến nó thành cùng runtime. Thời gian bootstrap không
tính vào giới hạn thực thi 8 giây. Worker bị terminate sau kết quả, lỗi hoặc
timeout. Fresh Worker vẫn không cô lập mã thù địch như process/container. Các ca
kiểm tra mù chỉ được giấu khỏi giao diện trước khi chạy và vẫn có thể đọc trong
client source/bundle.

Chi tiết quy trình học: [Hướng dẫn người học](docs/HUONG_DAN_NGUOI_HOC.md).

## Chạy 8 notebook

Metadata của notebook dùng kernel Python 3.11. Cách dựng môi trường tối thiểu
trên Windows mà không cần kích hoạt virtual environment:

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install jupyter numpy scikit-learn
.\.venv\Scripts\python.exe -m jupyter lab notebooks
```

Nếu máy không có lệnh `py -3.11`, hãy cài Python 3.11 hoặc chọn một Python gần
đây và tự kiểm tra tương thích. PyTorch và librosa chỉ cần cho phần mở rộng tương
ứng; nên cài theo hướng dẫn chính thức phù hợp CPU/GPU thay vì sao chép một lệnh
không đúng phần cứng.

| Notebook | Trọng tâm |
| --- | --- |
| `00_khoi_dong_va_diagnostic.ipynb` | Chuyển từ C++ sang Python, mutation và assert |
| `01_numpy_linear_regression.ipynb` | NumPy, MSE, gradient và linear regression |
| `02_classical_ml_pipeline.ipynb` | Split, pipeline tabular, leakage và metric |
| `03_mlp_backprop_pytorch.ipynb` | MLP, backprop; phần mở rộng dùng PyTorch |
| `04_computer_vision_cnn.ipynb` | Convolution và cầu nối tới CNN/transfer learning |
| `05_nlp_attention.ipynb` | TF-IDF, embedding và scaled dot-product attention |
| `06_audio_stft_mel.ipynb` | Waveform, framing, STFT, Mel và MFCC |
| `07_mock_voai_end_to_end.ipynb` | Mock đầu-cuối, chia thành 6 phiên 60 phút |

Mỗi notebook có ô `TODO`, visible tests và exit ticket. Quy trình đúng là
**Restart kernel → Run All → tự hoàn thiện TODO → Run All lại từ đầu**. Lệnh sau
kiểm tra đúng bộ 8 tên tệp, JSON/metadata, cú pháp Python của từng code cell,
không có execution history/output lưu sẵn và đủ các marker bài tập. Nó không
thực thi cell, import dependency hay xác nhận đáp án/kết quả số:

```powershell
py scripts/validate_notebooks.py
```

## Chấm bài bằng CLI

CLI phù hợp khi cần một lần chạy sạch, tách khỏi trạng thái của trình duyệt.
Tệp bài làm phải định nghĩa đúng hàm mà task yêu cầu.

| Task ID | Hàm cần có |
| --- | --- |
| `vector-mean` | `safe_mean(values)` |
| `linear-predict` | `linear_predict(X, weights, bias)` |
| `knn-vote` | `knn_vote(neighbors, k)` |
| `binary-metrics` | `binary_metrics(y_true, y_pred)` |
| `conv-valid` | `conv2d_valid(image, kernel)` |

Ví dụ, thay đường dẫn bằng tệp do chính người học tạo:

```powershell
py grader/grade.py vector-mean "C:\duong-dan\bai_lam.py" --public
py grader/grade.py vector-mean "C:\duong-dan\bai_lam.py"
py grader/grade.py vector-mean "C:\duong-dan\bai_lam.py" --timeout 8
```

- `--public` chỉ chạy test công khai để debug;
- không có `--public` thì chạy cả public/private cases và che tên test private;
- timeout mặc định là 5 giây **cho mỗi case**;
- tiến trình trả exit code `0` chỉ khi mọi case được chọn đều đạt;
- điểm tự động tối đa là 45/100; 55 điểm còn lại được chấm theo
  [rubric SOLO-90](docs/QUY_TAC_SOLO_90.md).

Kiểm tra unit test hiện có của grader:

```powershell
py -m unittest grader.tests.test_grader
```

Grader cục bộ thực thi tệp Python được nộp. Chỉ chạy mã của chính bạn hoặc mã
đã tin cậy; `-I`, subprocess và timeout **không biến nó thành sandbox bảo mật**.
Private cases cũng nằm trong bản phát hành cục bộ nên chỉ là rào cản học tập,
không chống được việc cố ý xem đáp án. Xem thêm
[Kiến trúc hệ thống](docs/KIEN_TRUC_HE_THONG.md).

## Các lệnh kiểm tra

```powershell
npm run lint
npm run build
npm test
py scripts/validate_notebooks.py
py -m unittest grader.tests.test_grader
```

Mỗi lệnh kiểm tra một phạm vi khác nhau. Chỉ ghi “đã xác minh” khi chính lệnh đó
trả exit code `0` trong phiên hiện tại; không dùng lint hoặc kiểm tra cấu trúc
notebook để suy ra rằng toàn bộ bài học, cell notebook hay website đã chạy đúng.

## Bản đồ tài liệu

- [Lộ trình 41 tuần](docs/LO_TRINH_41_TUAN.md): nội dung, checkpoint và
  deliverable từ 15/08/2026 đến 31/05/2027.
- [Hướng dẫn người học](docs/HUONG_DAN_NGUOI_HOC.md): cách vận hành một ngày,
  một tuần, notebook, lab và mock.
- [Quy tắc SOLO-90](docs/QUY_TAC_SOLO_90.md): ranh giới dùng AI, rubric 100
  điểm, nhật ký và lịch ôn.
- [Lý thuyết vòng 1](docs/LY_THUYET_VONG_1.md): ngân hàng 350 câu, ba trục phân
  loại, blueprint đề mock 100 câu và nguồn hiệu chỉnh theo đề công khai.
- [Bàn giao sau audit](docs/BAN_GIAO_SAU_AUDIT.md): trạng thái 24/25 ticket đã
  sửa, các quyết định kỹ thuật cần biết trước khi đụng vào grader/theory/storage,
  và danh sách việc còn treo.
- [Hệ thống đánh giá](docs/HE_THONG_DANH_GIA.md): 290 phiếu 1:1, điều kiện
  pass/mastery, minh chứng và ranh giới giữa chấm thủ công với test tự động.
- [Kiến trúc hệ thống](docs/KIEN_TRUC_HE_THONG.md): luồng dữ liệu, lưu tiến độ,
  Pyodide worker, CLI grader và giới hạn bảo mật.
- [Tài nguyên hợp pháp](docs/TAI_NGUYEN_HOP_PHAP.md): nguồn chính thức, sách
  mở và checklist giấy phép cho code, model và dataset.
- [Học online bằng GitHub](docs/GITHUB_ONLINE.md): repository public, Pages,
  Codespaces, Colab, Actions và cách phân biệt cấu hình với deploy thật.

## Phạm vi xác minh cần hiểu đúng

- Ma trận IOAI trên website là **bản đồ kế hoạch bao phủ**, không phải bằng chứng
  người học đã thành thạo 60 mục.
- Kiểm tra mù phía client là công cụ rèn kỷ luật, không phải hệ thống bảo mật
  hoặc chống gian lận.
- Notebook không có output sẵn; từng người học phải chạy lại trên môi trường của
  mình.
- Các link ngoài, quy chế và đề cương có thể thay đổi. Trước giai đoạn mock cuối,
  phải đối chiếu lại nguồn chính thức.
