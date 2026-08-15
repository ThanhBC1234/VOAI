# Hệ thống đánh giá hằng ngày VOAI — 290 phiên, SOLO-90 / COACH-10

## 1. Mục đích

Hệ thống này biến **mỗi ngày trong lộ trình 15/08/2026–31/05/2027** thành một lần chứng minh năng lực, thay vì chỉ đánh dấu “đã đọc bài”. Nguồn dữ liệu thực thi nằm ở `content/daily-assessments.ts` và được sinh 1:1 từ `CURRICULUM_SESSIONS` trong `content/curriculum.ts`.

Mỗi assessment buộc người học làm đủ bốn việc:

1. **Retrieval:** tự nhớ lại và dự đoán trước khi xem tài liệu hoặc chạy code.
2. **Coding:** tự viết phần cài đặt cốt lõi, test và debug.
3. **Validation:** dùng bằng chứng để kiểm tra tính đúng, tính tái lập và giới hạn.
4. **Explanation:** bảo vệ code, giả định, shape/data flow, metric và failure mode bằng lời của mình.

Hệ thống chỉ cung cấp đề bài, tiêu chí công khai và tên nhóm test ẩn. Nó **không cung cấp lời giải, pseudocode hoàn chỉnh, test case ẩn, expected output ẩn hoặc code mẫu có thể chép**.

## 2. Phạm vi và bất biến dữ liệu

Một lần import `content/daily-assessments.ts` phải tạo đúng:

| Loại phiên | Số assessment | Vai trò |
|---|---:|---|
| Lesson | 205 | Hiểu một cơ chế và tự cài một lát cắt nhỏ |
| Lab | 41 | Ghép kiến thức thành vertical slice đầu-cuối |
| Checkpoint | 41 | Chứng minh closed-book bằng biến thể mới |
| Finale | 3 | Audit, bảo vệ và đóng bản phát hành cuối |
| **Tổng** | **290** | **Mỗi ngày đúng một assessment** |

Các bất biến bắt buộc:

- Mỗi `CurriculumSession.id` có đúng một `DailyAssessment.sessionId` tương ứng.
- ID assessment chuẩn là `assessment-${session.id}`.
- Không trùng `id`, `sessionId` hoặc `date`.
- `ordinal`, `date`, `week`, `kind`, `domain`, `title` và `outcome` phải khớp phiên nguồn.
- Câu retrieval, coding task và explain prompt đều nhắc trực tiếp **cả title lẫn outcome** của chính phiên đó.
- Mỗi assessment có ít nhất hai câu retrieval; mọi chuỗi và mọi danh sách bắt buộc đều không rỗng.
- `aiMode` luôn theo thứ tự `SOLO-90`, rồi `COACH-10`.
- Bốn trọng số điểm luôn cộng thành 100.
- Mỗi hạng mục retrieval/coding/validation/explanation có điểm sàn riêng bằng `ceil(40% × trọng số)`; sàn nằm trong `[0, trọng số]` và tổng bốn sàn không vượt điểm pass.
- Điểm mastery không được thấp hơn điểm pass.

`DAILY_ASSESSMENTS_VALIDATION` chạy ngay khi module được import. Nếu một bất biến bị phá vỡ, module ném lỗi thay vì âm thầm đưa dữ liệu sai lên website hoặc grader.

## 3. Hợp đồng làm bài mỗi ngày

### 3.1. SOLO-90 — phần người học phải tự làm

Người học tự thực hiện:

- nhớ lại khái niệm và viết dự đoán;
- xác định input, output, invariant và acceptance criteria;
- viết pseudocode ngắn bằng ngôn ngữ của mình;
- code tối thiểu 90% bài;
- tự tạo visible tests, test biên và failing test;
- debug, ghi hypothesis, thử nghiệm và kết quả;
- diễn giải metric, error analysis, giới hạn và bước tiếp theo.

Với thuật toán được yêu cầu from-scratch, không được thay phần cốt lõi bằng một lệnh thư viện đã cài sẵn thuật toán đó. Thư viện vẫn được dùng cho I/O, biểu đồ hoặc đối chiếu kết quả nếu bài cho phép và người học ghi rõ.

Ngoại lệ có chủ đích: với **Whisper, Qwen-Audio, Voxtral, HuBERT, CLIP, diffusion, BERT, YOLO, DETR và SSD**, người học được phép dùng thư viện, pretrained weights và model implementation chuẩn. Không yêu cầu tự viết hoặc tự huấn luyện toàn bộ model lớn từ đầu. SOLO-90 trong các bài này nằm ở phần tự thiết kế và viết pipeline dữ liệu/inference hoặc training, metric/evaluation, kiểm tra shape/schema, ablation, error analysis và quy trình tái lập. Quy tắc from-scratch chỉ áp dụng cho thuật toán nhỏ phù hợp với thời lượng và mục tiêu cơ chế của bài.

### 3.2. COACH-10 — AI chỉ được kiểm tra sau khi đã có bằng chứng tự làm

Chỉ mở COACH-10 sau khi đã lưu:

1. giả thuyết của mình;
2. đoạn code mình đã viết;
3. ít nhất một test và kết quả chạy;
4. câu hỏi cụ thể cần kiểm tra.

Prompt mặc định:

> Đây là giả thuyết, test và kết quả em tự làm. Hãy chỉ nói ĐÚNG/CHƯA ĐÚNG, nêu một phản ví dụ hoặc một câu hỏi gợi mở; không viết code thay em.

AI được phép:

- xác nhận lập luận đúng/chưa đúng;
- nêu một phản ví dụ;
- đặt một câu hỏi gợi mở;
- chỉ tên khái niệm hoặc tài liệu cần tự tra;
- soát checklist sau khi người học đã tự chấm.

AI không được phép:

- viết lời giải, code hoàn chỉnh hoặc phần thân hàm cốt lõi;
- đưa pseudocode chi tiết đủ để chép thành code;
- sinh test ẩn hay tiết lộ expected output;
- thay người học chọn metric, kết luận hoặc viết phần giải thích;
- sửa toàn bộ notebook khi người học chưa cô lập lỗi.

Nếu AI trả code ngoài ranh giới, không chép phần đó. Đóng câu trả lời, quay lại failing test và ghi sự cố vào nhật ký học.

## 4. Cấu trúc một `DailyAssessment`

| Trường | Ý nghĩa | Hiển thị cho người học? |
|---|---|---|
| `id` | ID assessment chuẩn, dẫn xuất từ session | Có |
| `sessionId`, `ordinal`, `date`, `week` | Khóa liên kết lịch học | Có |
| `kind`, `domain`, `title`, `outcome` | Ngữ cảnh riêng của phiên | Có |
| `retrievalQuestions` | Ít nhất hai câu nhớ lại/dự đoán cụ thể | Có, trước khi mở tài liệu |
| `codingTask` | Sản phẩm code phải tự tạo, không có lời giải | Có |
| `visibleCriteria` | Điều kiện công khai để tự kiểm tra | Có |
| `hiddenTestCategories` | Chỉ tên nhóm rủi ro được chấm, không lộ input/output | Có thể hiển thị tên nhóm |
| `explainPrompt` | Khung bảo vệ code bằng lời | Có |
| `aiMode`, `aiBoundary` | Quy tắc SOLO-90 / COACH-10 | Có |
| `scoreWeights` | Trọng số retrieval/coding/validation/explanation | Có |
| `passRule` | Điểm tổng tối thiểu, `minimumSectionScores`, phần bắt buộc, auto-fail, thi lại | Có |
| `mastery` | Ngưỡng cao hơn và kiểm tra chuyển giao trì hoãn | Có |

### 4.1. Vì sao prompt phải gắn với title và outcome?

Câu hỏi chung như “Em hiểu bài chưa?” không tạo được bằng chứng. Mỗi record đưa tên bài và mục tiêu cụ thể vào retrieval, coding task và oral defense. Khi lộ trình đổi title hoặc outcome, assessment được sinh lại và validator sẽ bắt mọi record bị lệch.

### 4.2. Vì sao chỉ lưu nhóm test ẩn?

Người học cần biết mình sẽ được kiểm tra về tính đúng, test biên, leakage hay reproducibility để học đúng chuẩn kỹ thuật. Tuy nhiên, nếu biết dữ liệu cụ thể và expected output, bài có thể bị hard-code. Vì vậy `hiddenTestCategories` chỉ mô tả **loại rủi ro**, còn test case thật phải thuộc grader và không nằm trong tệp nội dung.

## 5. Nhịp làm một assessment 30 phút

| Phút | Hoạt động | Bằng chứng cần lưu |
|---:|---|---|
| 0–5 | Trả lời retrieval, không mở tài liệu | Câu trả lời có timestamp |
| 5–8 | Viết hợp đồng input/output/invariant | 3–6 dòng ghi chú |
| 8–23 | Tự code và tự debug | Code, commit/draft và test log |
| 23–27 | Chạy visible tests, đối chiếu criteria | Kết quả test và metric |
| 27–30 | Trả lời explain prompt, tự chấm | Giải thích ngắn + lỗi gốc |

Nếu học 60 phút, giữ nguyên 30 phút đầu rồi dùng 30 phút thêm cho **một** trong bốn việc: property test, phản ví dụ, benchmark/ablation hoặc error analysis. Không dùng toàn bộ phần Deep chỉ để xem video.

## 6. Blueprint theo từng loại phiên

### 6.1. Lesson — hiểu cơ chế và cài một lát cắt

Mục tiêu của lesson là chứng minh người học hiểu một cơ chế nhỏ, chưa phải xây cả dự án.

Assessment lesson yêu cầu:

- tự giải thích cơ chế của chính bài đang học;
- tạo ví dụ nhỏ và dự đoán output/shape trước khi chạy;
- nêu ít nhất một edge case;
- cài một lát cắt chạy được;
- viết test và giải thích invariant/complexity;
- chạy từ runtime sạch, không phụ thuộc state cell cũ.

Trọng số:

| Retrieval | Coding | Validation | Explanation |
|---:|---:|---:|---:|
| 20 | 50 | 20 | 10 |

Điểm pass mặc định là 70/100; ngưỡng mastery tối thiểu là 80/100. Sau 7 ngày, người học phải giải một ví dụ mới từ trang trắng để chứng minh khả năng nhớ và chuyển giao.

### 6.2. Lab — vertical slice đầu-cuối

Lab không chỉ cộng các file code rời rạc. Nó cần một luồng nhỏ từ input tới output, chạy được và có evidence.

Assessment lab yêu cầu:

- viết hypothesis và acceptance tests trước khi code;
- xác định input, output, metric và nguy cơ leakage/tích hợp;
- hoàn thành artifact đã ghi trong curriculum;
- có vertical slice đầu-cuối;
- fresh-run với seed, dữ liệu và cấu hình rõ ràng;
- có error analysis hoặc ablation nhỏ;
- lưu evidence cho từng acceptance criterion công khai.

Trọng số:

| Retrieval | Coding | Validation | Explanation |
|---:|---:|---:|---:|
| 10 | 50 | 25 | 15 |

Điểm pass mặc định là 75/100; ngưỡng mastery tối thiểu là 80/100. Kiểm tra chuyển giao sau 7–14 ngày thay seed, split hoặc constraint phù hợp rồi yêu cầu giải thích ảnh hưởng lên metric.

### 6.3. Checkpoint — closed-book và biến thể mới

Checkpoint đo năng lực độc lập, không đo khả năng mở lại notebook cũ.

Assessment checkpoint yêu cầu:

- làm phần retrieval và coding closed-book;
- code một biến thể mới, không chép nguyên bài luyện;
- nộp visible tests, điểm tự chấm và lỗi gốc;
- bảo vệ một dòng code/shape/metric/failure mode ngẫu nhiên;
- thực hiện đúng task và retry rule của tuần;
- qua cả code lẫn oral defense, không dùng điểm phần mạnh để bù cho một phần bằng 0.

Trọng số:

| Retrieval | Coding | Validation | Explanation |
|---:|---:|---:|---:|
| 20 | 45 | 20 | 15 |

Điểm pass được đọc trực tiếp từ outcome/assessment của checkpoint trong curriculum (70–85 tùy cổng). Mastery là ít nhất 80 và thường cao hơn điểm pass 5 điểm, tối đa 100. Kiểm tra chuyển giao được gài vào checkpoint kế tiếp bằng một câu liên kết không báo trước dạng cụ thể.

### 6.4. Finale — audit, bảo vệ và release

Ba finale kiểm tra toàn bộ chuỗi bằng chứng, không chỉ giao diện portfolio.

Assessment finale yêu cầu:

- lập bản đồ claim → artifact → test/metric/commit;
- fresh-run hoặc release check từ môi trường sạch;
- audit liên kết và evidence;
- bảo vệ ngẫu nhiên một phần của sản phẩm;
- ghi giới hạn và claim có nguy cơ vượt bằng chứng;
- sửa nhỏ trực tiếp khi được yêu cầu để chứng minh quyền sở hữu hiểu biết.

Trọng số:

| Retrieval | Coding | Validation | Explanation |
|---:|---:|---:|---:|
| 10 | 40 | 30 | 20 |

Điểm pass mặc định là 85/100 hoặc lấy điểm được khai báo trực tiếp trong phiên. Mastery tối thiểu 90/100 và cần một lần tái lập/bảo vệ do người khác chọn ngẫu nhiên artifact.

## 7. Cách chấm điểm

### 7.1. Retrieval

Chấm theo bằng chứng trước khi mở tài liệu:

- nêu đúng cơ chế, không chỉ lặp tên thuật toán;
- dự đoán có thể kiểm tra được;
- chỉ ra giả định và edge case;
- không sửa câu trả lời ban đầu sau khi thấy kết quả; phần sửa phải ghi riêng.

### 7.2. Coding

Chấm theo:

- tính đúng và đầy đủ của phần cốt lõi;
- hợp đồng input/output rõ ràng;
- code người học tự viết;
- khả năng đọc, cấu trúc và xử lý lỗi;
- không hard-code visible tests;
- tuân thủ ràng buộc from-scratch khi có.

### 7.3. Validation

Chấm theo:

- visible tests và edge cases;
- fresh-run/reproducibility;
- metric, split và phòng leakage;
- error analysis/ablation phù hợp quy mô phiên;
- evidence có thể kiểm tra lại;
- kết quả hidden tests do grader trả về.

### 7.4. Explanation

Người học phải trả lời được:

1. Dữ liệu đi qua những bước nào, shape thay đổi ra sao?
2. Vì sao cách làm này hợp lệ cho mục tiêu phiên?
3. Test biên nào quan trọng và nó bắt lỗi gì?
4. Độ phức tạp hoặc chi phí chính nằm ở đâu?
5. Failure mode, giới hạn bằng chứng và thử nghiệm tiếp theo là gì?

Không cần câu chữ học thuật hoa mỹ. Cần lời giải thích nhất quán với code và kết quả thật.

### 7.5. Điểm sàn theo hạng mục

Tổng điểm cao không được che một hạng mục bằng 0 hoặc quá yếu. Mỗi assessment sinh `passRule.minimumSectionScores` bằng cách làm tròn lên 40% trọng số của từng phần. Ví dụ lesson có trọng số `20/50/20/10` thì sàn retrieval/coding/validation/explanation là `8/20/8/4`. Muốn ghi pass tự đánh giá phải đồng thời:

- đủ toàn bộ evidence bắt buộc và hai xác nhận liêm chính;
- tổng self-score đạt `passRule.minimumScore`;
- cả bốn self-score đạt hoặc vượt sàn tương ứng.

Các con số vẫn là **manual self-score**, không phải kết quả correctness tự động.

## 8. Pass không đồng nghĩa mastery

> **Giới hạn hiện tại:** website ghi nhận formative/manual evidence và điểm do người học tự nhập trong `localStorage`. Trạng thái `passed` chỉ có nghĩa là form đã đủ trường bắt buộc, hai xác nhận liêm chính đã được chọn, tổng self-score đạt ngưỡng và từng hạng mục đạt điểm sàn. Nó **không tự động chứng minh correctness**, không thay grader, code review, test mù hay oral defense độc lập.

### Pass

`passRule` trả lời câu hỏi: “Hôm nay em có đủ bằng chứng để đi tiếp có điều kiện không?”

- đạt tối thiểu `minimumScore`;
- đạt mọi sàn trong `minimumSectionScores`, không chỉ bù điểm giữa các phần;
- không bỏ trống phần bắt buộc của loại phiên;
- không phạm automatic-fail;
- nếu trượt, sửa đúng lỗ hổng rồi làm biến thể mới.

### Mastery

`mastery` trả lời câu hỏi: “Sau một khoảng trễ, em còn tự dùng được nguyên lý trong tình huống mới không?”

Mastery chỉ được ghi nhận khi:

- đã pass phiên gốc;
- đạt ngưỡng mastery;
- tự code lại hoặc thích nghi được cho dữ liệu/constraint mới;
- giải thích được giới hạn;
- qua delayed transfer check.

Điểm cao ngay sau khi vừa học không tự động là mastery. Dashboard nên hiển thị hai trạng thái riêng: `passed` và `mastered`.

## 9. Automatic-fail và xử lý thi lại

Một assessment tự động trượt nếu xảy ra một trong các trường hợp:

- người học không giải thích được code, test, metric hoặc data flow mình nộp;
- notebook/code không fresh-run, artifact sai schema hoặc không tái lập mà không có giải trình;
- có leakage, tuning trên test hoặc làm sai quy tắc dữ liệu;
- claim vượt bằng chứng;
- AI hoặc người khác viết lời giải/phần cốt lõi;
- người học không chứng minh được quyền sở hữu bài làm.

Quy trình thi lại:

1. Ghi triệu chứng và lỗi gốc, không chỉ ghi “sai test”.
2. Thu nhỏ về failing case nhỏ nhất.
3. Tự sửa phần trượt.
4. Làm **biến thể mới**, không làm lại đúng test cũ để học thuộc.
5. Fresh-run và bảo vệ lại đúng phần từng trượt.
6. Giữ cả lần đầu và lần thi lại trong history.

## 10. Chính sách hidden tests

### Người học được biết

- nhóm lỗi sẽ được kiểm tra;
- hợp đồng hàm, schema, dtype/shape và giới hạn tài nguyên công khai;
- cách tính điểm và điều kiện auto-fail;
- test của mình đã qua hay chưa;
- sau khi nộp: nhóm lỗi nào trượt, nhưng không nhất thiết nhận input cụ thể.

### Người học không được biết trước

- dữ liệu test cụ thể;
- seed cụ thể;
- expected output cụ thể;
- thứ tự test;
- câu hỏi oral defense cụ thể;
- implementation oracle.

### Nhóm test theo loại phiên

- **Lesson:** correctness, edge/input contract, state/determinism, numerical invariant, complexity và cấm lối tắt.
- **Lab:** fresh-run, integration contract, robustness theo modality, leakage và evidence reproducibility.
- **Checkpoint:** unseen variant, counterexample/invariant, fresh implementation, artifact consistency và oral defense.
- **Finale:** evidence traceability, clean release, cross-topic transfer, claim audit và random defense.

Không đưa test case thật vào `content/daily-assessments.ts`. Tệp content có thể được gửi tới trình duyệt; test thật phải ở phía grader/server.

## 11. Dữ liệu cần lưu cho một lần nộp

Một attempt tối thiểu nên lưu:

- `assessmentId`, `sessionId`, `attemptNumber`;
- thời điểm bắt đầu retrieval và thời điểm nộp;
- câu trả lời retrieval ban đầu;
- hash hoặc commit của code;
- visible-test log;
- hidden-test category results, không lưu secret input ở client;
- câu trả lời explain prompt;
- điểm từng phần và tổng điểm;
- automatic-fail flags;
- câu hỏi COACH-10, thời điểm hỏi và phản hồi dạng đúng/chưa đúng;
- root cause và retry link nếu trượt;
- trạng thái `passed`, `mastery_due`, `mastered`.

Không dùng “thời gian gõ phím” hay detector AI mơ hồ làm bằng chứng duy nhất. Bằng chứng mạnh hơn là lịch sử draft, test tự viết, fresh implementation và oral defense nhất quán.

## 12. Luồng tích hợp website và grader

Phiên bản website hiện có tại `/assessments` thực hiện phần formative ở phía trình duyệt: tìm/lọc đủ 290 phiên, mở sâu bằng `?session=<sessionId>`, thu retrieval/code evidence/link/explanation, tự chấm rubric, lưu từng attempt kèm timestamp/score/status và xuất JSON. Dữ liệu này riêng trên thiết bị; xóa dữ liệu trình duyệt sẽ làm mất attempts nếu chưa export.

Khi đọc `localStorage`, website không tin trực tiếp dữ liệu đã lưu. Mỗi record phải tham chiếu assessment/session hiện còn tồn tại; có đúng số retrieval answers; mọi chuỗi, mảng và boolean phải đúng kiểu; bốn score phải hữu hạn và nằm trong trọng số; tổng, threshold và status phải được tính lại khớp assessment hiện tại. Record bị sửa tay, lỗi schema, trùng ID hoặc đã lỗi thời bị loại khỏi thống kê và bản dữ liệu cục bộ được làm sạch.

Luồng đề xuất:

1. Website chọn assessment theo ngày hoặc `sessionId`.
2. UI khóa retrieval answer trước khi hiện tài liệu/runner.
3. UI hiện `codingTask`, `visibleCriteria`, `aiBoundary` và đồng hồ SOLO-90.
4. Code runner chạy visible tests tại trình duyệt hoặc sandbox.
5. Khi nộp, server/grader chạy test thật theo các nhóm đã công bố.
6. UI yêu cầu explain prompt và có thể chọn câu oral defense.
7. Scorer áp `scoreWeights`, `passRule` và automatic-fail.
8. Nếu pass, hệ thống lên lịch `delayedTransferCheck` từ `mastery`.
9. Nếu trượt, hệ thống tạo attempt mới và giữ nguyên evidence cũ.

Không tin điểm, cờ `passed` hoặc kết quả hidden tests do client gửi lên. Server phải tính lại từ submission và grader output.

## 13. API sử dụng

Các export chính:

```ts
import {
  DAILY_ASSESSMENTS,
  DAILY_ASSESSMENTS_VALIDATION,
  generateDailyAssessments,
  validateDailyAssessments,
} from "./content/daily-assessments";
```

- `DAILY_ASSESSMENTS`: 290 record đã sinh.
- `DAILY_ASSESSMENTS_VALIDATION`: tóm tắt audit chạy khi import.
- `generateDailyAssessments(sessions?)`: sinh dữ liệu từ session nguồn; hữu ích cho test fixture.
- `validateDailyAssessments(assessments?, sessions?)`: ném lỗi khi vi phạm bất biến; trả summary nếu hợp lệ.

Ví dụ kiểm tra chỉ đọc metadata, không chứa lời giải:

```ts
const summary = validateDailyAssessments();

console.log(summary.total);      // phải là 290
console.log(summary.uniqueDates); // phải là 290
console.log(summary.byKind);      // lesson/lab/checkpoint/finale
```

## 14. Checklist audit trước khi phát hành

### Dữ liệu

- [ ] Có đúng 290 assessment.
- [ ] Có đúng 290 assessment ID, session ID và ngày duy nhất.
- [ ] Mỗi session nguồn được ánh xạ đúng một lần.
- [ ] Kind counts là 205/41/41/3.
- [ ] Title/outcome của assessment khớp curriculum.
- [ ] Mọi câu hỏi và tiêu chí bắt buộc không rỗng.

### Sư phạm

- [ ] Mỗi assessment có ít nhất hai retrieval questions cụ thể.
- [ ] Coding task yêu cầu sản phẩm quan sát được nhưng không đưa cách giải.
- [ ] Lesson, lab, checkpoint và finale có hành vi chấm khác nhau.
- [ ] Pass và mastery là hai cổng riêng.
- [ ] Retry dùng biến thể mới.
- [ ] COACH-10 chỉ mở sau evidence tự làm.

### Bảo mật bài chấm

- [ ] Client chỉ nhận tên nhóm test ẩn.
- [ ] Không có input, seed, oracle hoặc expected output ẩn trong content bundle.
- [ ] Server tính lại score/pass.
- [ ] Không ghi secret test vào log trả về trình duyệt.
- [ ] Có cơ chế đổi test theo attempt mà vẫn giữ cùng nguyên lý.

### Kỹ thuật

- [ ] TypeScript typecheck thành công.
- [ ] Import-time validation thành công.
- [ ] Tổng score weights của từng record bằng 100.
- [ ] Mỗi section floor nằm trong `[0, weight]`, tổng floors không vượt điểm pass và dữ liệu sinh ra có floor dương.
- [ ] Mastery threshold không thấp hơn pass threshold.
- [ ] Website render Unicode tiếng Việt đúng.

## 15. Lệnh kiểm chứng dành cho người duy trì

Typecheck toàn dự án:

```powershell
npx tsc --noEmit
```

Runtime audit độc lập có thể import module TypeScript bằng loader phù hợp của môi trường dự án, sau đó kiểm tra `DAILY_ASSESSMENTS_VALIDATION`. Những giá trị bắt buộc cần thấy:

```text
total = 290
uniqueAssessmentIds = 290
uniqueSessionIds = 290
uniqueDates = 290
byKind = lesson 205, lab 41, checkpoint 41, finale 3
firstDate = 2026-08-15
lastDate = 2027-05-31
```

Mọi lần thay curriculum phải chạy lại validator. Không sửa tay 290 record vì điều đó dễ tạo lệch ngày, ID và outcome; thay đổi nguồn session rồi để generator tạo lại assessment tương ứng.
