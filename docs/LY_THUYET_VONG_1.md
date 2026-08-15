# Lý thuyết vòng 1 VOAI — ngân hàng 350 câu

Tài liệu này mô tả lớp lý thuyết được bổ sung cho VOAI Lab: vì sao nó tồn tại,
nó bám nguồn nào, phân loại câu hỏi ra sao, và dùng thế nào trong 290 phiên học.

Vòng 1 (sơ loại) của VOAI là **vòng thi lý thuyết trắc nghiệm trên máy**. Trước
khi có lớp này, kho mã chỉ có quiz gắn rời theo từng bài giảng (95 câu trong
`content/lessons-core.ts` và 63 câu tự luận ngắn trong
`content/lessons-multimodal.ts`) — đủ để tự kiểm sau mỗi bài, nhưng **không** đủ
để luyện một đề đủ dài, đủ rộng và có phân loại như phòng thi thật.

## 1. Phạm vi xác minh — đọc trước khi dùng

Đây là phần quan trọng nhất của tài liệu.

- Những gì **đã xác minh từ nguồn công khai**: vòng sơ loại VOAI thi trắc nghiệm
  trên máy, thời lượng **180 phút**; đề VOAI 2025 được mô tả gồm **100 câu** với
  **8 mã đề**, phạm vi bám Syllabus IOAI và tập trung vào Machine Learning,
  Computer Vision, NLP.
- Những gì **không** được khẳng định ở đây: số câu, cấu trúc, thang điểm, cách
  chấm, ngưỡng chọn và lịch thi của **VOAI 2027**. Tất cả mang trạng thái `TBD`
  cho tới khi Ban Tổ chức công bố. Blueprint trong kho mã là **tham số luyện tập
  nội bộ**, không phải mô tả quy chế.
- Ngân hàng câu hỏi là **bản gốc do dự án soạn**. Không có câu nào chép nguyên
  văn từ đề thi. Với các câu được hiệu chỉnh theo một nguồn công khai, trường
  `calibratedFrom` ghi rõ nguồn đó; nội dung câu hỏi vẫn do dự án viết mới.
- Trước giai đoạn mock cuối, phải đối chiếu lại nguồn chính thức và lập bảng
  khác biệt, theo đúng quy trình đã nêu trong [Lộ trình 41 tuần](LO_TRINH_41_TUAN.md).

## 2. Nguồn hiệu chỉnh

| Nguồn | Dùng để hiệu chỉnh điều gì |
| --- | --- |
| Thông báo và tin bài công khai về vòng sơ loại VOAI 2025/2026 | Thời lượng 180 phút, quy mô 100 câu, ba lĩnh vực trọng tâm |
| [Syllabus IOAI 2026](https://ioai-official.org/republic-of-kazakhstan/syllabus-2026/) | 60 mục nội dung và ba mức Theory/Practice/Both |
| Đề trắc nghiệm vòng sơ loại NOAI 2026 (AI Singapore) công bố công khai | Phân bố chủ đề, độ dài đề dẫn, dạng 4 phương án, tỷ trọng Toán nền tảng |
| [IOAI 2024/2025 tasks](https://ioai-official.org/resources/) | Phạm vi kiến thức thực tế được kiểm tra ở cấp quốc tế |

**Phát hiện quan trọng nhất từ việc đối chiếu nguồn:** đề trắc nghiệm vòng 1 của
các olympiad AI **không** phân bố theo tỷ lệ của bảng syllabus. Trong đề NOAI
2026 đã công bố, các mảng nền tảng — đại số tuyến tính, giải tích, xác suất,
ngữ nghĩa Python và API PyTorch — chiếm phần lớn số câu, còn các chủ đề chuyên
sâu về CV/NLP chỉ chiếm thiểu số. Bảng 60 mục của Syllabus IOAI lại **không tách
riêng** toán nền tảng thành mục độc lập.

Vì vậy ngân hàng có thêm **Section E — Nền tảng Toán & Tin**, là phần mà cách
ánh xạ thuần theo syllabus sẽ bỏ sót hoàn toàn.

## 3. Ba trục phân loại

Mỗi câu hỏi được phân loại đồng thời theo ba trục độc lập, vì một đề thi thật
phân loại thí sinh bằng cả ba chứ không chỉ bằng chủ đề.

### 3.1. Chủ đề (`syllabusId`)

Một trong **60 mã** của `IOAI_2026_SYLLABUS_COVERAGE` trong
[content/curriculum.ts](../content/curriculum.ts), hoặc một trong **5 mã nền
tảng** (`math-linear-algebra`, `math-calculus`, `math-probability`,
`computing-python`, `genai`). Cổng kiểm tra dữ liệu từ chối mọi mã nằm ngoài hai
tập này, nên ngân hàng không thể trôi khỏi phạm vi syllabus.

### 3.2. Mức độ (`difficulty`)

| Mã | Nhãn | Dấu hiệu nhận ra khi đọc đề | Điểm | Thời lượng |
| --- | --- | --- | --- | --- |
| `recall` | Nhận biết | Hỏi định nghĩa, công thức, phát biểu chuẩn | 2 | 45 giây |
| `understand` | Thông hiểu | Hỏi vì sao, so sánh, dự đoán hướng thay đổi | 3 | 75 giây |
| `apply` | Vận dụng | Cho số liệu/shape/tình huống cụ thể, yêu cầu ra kết quả | 4 | 120 giây |
| `advanced` | Vận dụng cao — **câu phân loại** | Ghép ≥ 2 kiến thức, có bẫy hợp lý, hoặc yêu cầu chỉ ra chỗ hỏng trong quy trình nghe có vẻ đúng | 6 | 180 giây |

Mức `advanced` **bắt buộc** có trường `trap` mô tả rõ bẫy chính. Đây là ràng
buộc được cổng kiểm tra dữ liệu cưỡng chế: một câu khó mà không nêu được bẫy thì
chỉ là câu khó ngẫu nhiên, không phải câu phân loại.

Ba kiểu bẫy được dùng nhiều nhất:

1. **Bẫy quán tính ở dạng đúng/sai bốn ý** — ba ý đầu đúng, ý thứ tư sai nhưng
   nghe thuận tai (ví dụ [`sgd-05`], [`language-modeling-05`], [`genai-10`]).
2. **Bẫy chỉ số đẹp** — kết quả đo trông rất tốt nhưng che một lỗi nghiêm trọng
   (ví dụ [`cross-validation-05`], [`segmentation-05`], [`vision-ssl-05`]).
3. **Bẫy quy tắc học thuộc áp sai ngữ cảnh** — một quy tắc đúng ở bài toán này
   bị áp máy móc sang bài toán khác (ví dụ [`pooling-05`], [`visualization-05`],
   [`vision-encoders-05`]).

### 3.3. Dạng câu (`format`)

| Mã | Mô tả | Số câu |
| --- | --- | --- |
| `single-choice` | Trắc nghiệm 4 phương án, một đáp án đúng | 277 |
| `numeric` | Trả lời ngắn bằng số, có sai số chấp nhận | 47 |
| `true-false-set` | Đúng/Sai bốn ý a–d | 15 |
| `multi-select` | Chọn nhiều phương án đúng, chấm trọn gói | 11 |
| `short-text` | Dạng schema dự phòng; ngân hàng hiện chưa dùng | 0 |

`single-choice` chiếm đa số vì đó là dạng của đề thật. Ba dạng còn lại đang có
trong ngân hàng phục vụ những gì trắc nghiệm một đáp án khó kiểm tra: tính tay
ra số, phân biệt nhiều mệnh đề gần đúng, và nhận diện đúng một tập hợp thay vì
một phương án. `short-text` đã có trong schema để mở rộng sau này nhưng chưa có
câu nào trong bộ 350 câu hiện tại.

## 4. Quy mô và độ phủ

```
Tổng:                                350 câu
├─ Nền tảng Toán & Tin                50
├─ Foundational Skills & Classical ML 125
├─ Neural Networks & Deep Learning     90
├─ Computer Vision                     50
└─ NLP & Audio                         35

Theo mức độ:  Nhận biết 76 · Thông hiểu 76 · Vận dụng 134 · Vận dụng cao 64
Độ phủ syllabus: 60/60 mục IOAI, mỗi mục ≥ 5 câu và ≥ 1 câu phân loại
```

64 câu mức `advanced` chiếm khoảng 18% — tỷ lệ đủ để một đề phân loại được nhóm
đầu, đúng như yêu cầu "thêm một số câu nâng cao".

Mỗi câu đều có `explanation`; câu có số liệu có thêm `calculation` ghi từng bước
tính tay; câu trắc nghiệm có `choiceNotes` giải thích **từng** phương án, kể cả
phương án đúng. Mục đích là để người học sai một câu vẫn biết chính xác mình
hiểu sai chỗ nào, thay vì chỉ biết mình sai.

## 5. Blueprint đề mock 100 câu / 180 phút

| Khối | Nhận biết | Thông hiểu | Vận dụng | Vận dụng cao | Tổng |
| --- | --- | --- | --- | --- | --- |
| Nền tảng Toán & Tin | 10 | 10 | 8 | 2 | **30** |
| Foundational & Classical ML | 7 | 9 | 8 | 4 | **28** |
| Neural Networks & Deep Learning | 5 | 7 | 7 | 3 | **22** |
| Computer Vision | 2 | 3 | 4 | 2 | **11** |
| NLP & Audio | 1 | 3 | 3 | 2 | **9** |
| **Tổng** | **25** | **32** | **30** | **13** | **100** |

Ngân sách thời gian của đề: **158 phút**, chừa 22 phút để rà soát trong khung
180 phút. Tổng điểm thô 344, quy về thang 100 khi chấm.

Khối nền tảng giữ trọng số cao nhất vì đó là điều các đề vòng 1 công khai cho
thấy, chứ không phải vì nó chiếm nhiều mục syllabus nhất.

Ngưỡng nội bộ để tự đánh giá (`MOCK_INTERNAL_GATES`) — **không phải** ngưỡng
chọn của VOAI:

- tổng ≥ 75/100;
- mỗi khối ≥ 60%;
- riêng nhóm câu phân loại ≥ 50%. Đạt tổng điểm nhưng dưới mốc này nghĩa là đang
  chắc phần nền và hổng phần phân loại — đây là tình huống cần xử lý trước.

## 6. Cách dùng

### Trên website

`/theory` có hai chế độ:

- **Luyện theo chủ đề** — lọc theo khối, mức độ, dạng câu; trả lời rồi mới mở
  được phần đối chiếu. Dùng xen kẽ trong các phiên Core 30 phút.
- **Thi thử 100 câu** — lắp đề theo blueprint, có đồng hồ đếm ngược 180 phút,
  chấm tự động và bóc tách điểm theo khối và theo mức độ.

Đề được lắp **tất định theo seed**: cùng một seed luôn cho cùng một đề, nên người
học và người kèm đối chiếu được kết quả. Website hiện cố định đề mẫu ở seed 1 và
chưa có điều khiển đổi seed; hàm `buildMockPaper(seed)` trong mã nguồn hỗ trợ tạo
đề khác khi tính năng này được mở rộng.

### Trong lộ trình 290 phiên

- **Hằng ngày:** sau phần retrieval của assessment, làm 5–10 câu đúng chủ đề của
  phiên. Trả lời closed-book trước, đối chiếu sau.
- **Cuối tuần:** làm 20 câu trộn từ các tuần đã học để chống quên, ưu tiên các
  mục syllabus đã lâu chưa ôn.
- **Trước R1 (tuần 32, 26/03/2027):** làm trọn một đề 100 câu trong đúng 180
  phút, đóng tài liệu, một mạch không nghỉ.
- **Sau mỗi đề:** ghi error ledger theo mẫu trong [Quy tắc SOLO-90](QUY_TAC_SOLO_90.md)
  — mỗi câu sai ghi lại *mã câu*, *chủ đề*, *loại lỗi* (chưa thuộc / hiểu sai /
  tính sai / sập bẫy) và *câu sửa lại bằng lời của mình*.

### Ranh giới SOLO-90 / COACH-10

Ngân hàng này **có sẵn đáp án và lời giải trong mã nguồn**. Đó là lựa chọn có
chủ đích để tự học, nhưng nó đặt toàn bộ kỷ luật lên người học:

- không mở phần đối chiếu trước khi đã viết ra câu trả lời của mình;
- không đọc `content/theory/*.ts` trực tiếp khi đang luyện;
- khi làm đề mock, coi như phòng thi thật: không tra cứu, không hỏi AI.

Giống mọi phần khác của dự án, kiểm tra mù ở đây là **công cụ rèn kỷ luật, không
phải hệ thống chống gian lận**. Đáp án vẫn đọc được trong client bundle.

## 7. Cấu trúc mã nguồn

```
content/theory/
├── types.ts                       Schema, ba trục phân loại, blueprint, ngưỡng
├── section-e-foundations.ts        50 câu — Toán, Tin, GenAI, đạo đức AI
├── section-a1-toolchain.ts         45 câu — Python, NumPy/Pandas, sklearn, PyTorch, GPU
├── section-a2-supervised.ts        35 câu — hồi quy, phân loại, cây, ensemble, SVM
├── section-a3-unsupervised-eval.ts 45 câu — phân cụm, PCA, chỉ số, CV, tuning
├── section-b1-neural-basics.ts     45 câu — perceptron → backprop → optimizer
├── section-b2-architectures.ts     45 câu — embedding, attention, transformer, BN, finetune
├── section-c-vision.ts             50 câu — conv, detection, segmentation, CLIP, diffusion
├── section-d-nlp-audio.ts          35 câu — TF-IDF, BERT, LM, seq2seq, LLM, Whisper
└── index.ts                        Gộp, cổng kiểm tra dữ liệu, bộ lắp đề
```

`index.ts` chạy `validateTheoryBank()` **ngay lúc import**, theo đúng khuôn mẫu
của `content/daily-assessments.ts`. Dữ liệu sai sẽ làm hỏng bản dựng thay vì âm
thầm đi vào website. Cổng này kiểm tra:

- id không trùng; `syllabusId` nằm trong 60 mục IOAI hoặc 5 mã nền tảng;
- `single-choice` đúng 4 phương án, `answerIndex` hợp lệ, có ghi chú cho từng phương án;
- `multi-select` có ≥ 2 đáp án đúng và không chọn hết mọi phương án;
- `true-false-set` đúng 4 ý và phải có cả ý đúng lẫn ý sai;
- `numeric` có sai số chấp nhận hợp lệ;
- mọi câu `advanced` đều khai báo `trap`;
- **mỗi ô của blueprint có đủ câu để lắp đề**;
- đề mẫu lắp ra đúng 100 câu và không vượt quá 180 phút.

## 8. Mở rộng ngân hàng

Thêm câu mới vào đúng tệp section theo chủ đề, giữ quy ước `id` là
`${syllabusId}-${số thứ tự hai chữ số}`. Sau đó chạy:

```bash
npx tsc --noEmit
```

Nếu vi phạm bất kỳ ràng buộc nào ở mục 7, quá trình dựng sẽ dừng với thông báo
chỉ đúng câu gây lỗi.

Khi bổ sung câu hiệu chỉnh theo một đề công khai mới, ghi nguồn vào
`calibratedFrom` và **viết câu mới** thay vì chép lại — cả vì bản quyền, và vì
chép nguyên đề cũ không luyện được năng lực đọc đề lạ.
