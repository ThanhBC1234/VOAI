# Quy tắc SOLO-90

SOLO-90 là hợp đồng học tập: người học tự đọc, suy luận, cài đặt, kiểm thử và
debug; AI chỉ đóng vai trò **bộ kiểm chứng giới hạn** sau khi đã có một lần thử
thật. Mục tiêu không phải đạt streak đẹp mà là tạo bằng chứng rằng người học có
thể làm lại từ trang trắng và giải thích được code.

## 1. Quy tắc không thương lượng

1. Trong vùng lời giải, toàn bộ code và test phải do người học tự gõ và hiểu.
2. “90” mô tả tối thiểu 90% chu trình học là lao động độc lập. Tối đa 10% còn
   lại chỉ được dùng cho kiểm chứng, không dùng để sinh lời giải.
3. Không gửi nguyên đề cho AI để xin code, pseudocode, checklist thuật toán,
   diff, dòng cần sửa hoặc lời giải từng bước.
4. Chỉ hỏi AI sau khi đã ghi giả thuyết, chạy ít nhất một test và tự thử sửa.
5. Nếu đã nhìn thấy code/pseudocode lời giải, lần nộp đó không còn là bằng chứng
   SOLO-90. Đóng đáp án, ghi sự việc vào nhật ký và làm một biến thể mới từ
   trang trắng.
6. Không qua bài nếu không giải thích được code hoặc không tái lập được kết quả,
   kể cả khi mọi test đều xanh.

Các import, chữ ký hàm và starter code do hệ thống cung cấp không tính là code
do AI viết. Mọi quyết định thuật toán trong phần `TODO` vẫn phải do người học
tạo ra.

## 2. Được phép và không được phép hỏi AI

| Được phép sau khi đã tự chạy | Không được phép |
| --- | --- |
| “Kết luận về độ phức tạp O(nd) của em đúng không?” | “Viết hàm này cho em” |
| “Theo traceback và giả thuyết này, em đang sai nhóm shape hay dtype?” | “Hãy sửa dòng 17” |
| “Test biên em đề xuất có thật sự kiểm tra mutation không?” | “Cho em các test ẩn” |
| “Lập luận về leakage của split này đúng hay chưa?” | “Cho pseudocode thuật toán” |
| “Chỉ hỏi em một câu để em tự phát hiện lỗi” | “Tối ưu toàn bộ notebook này” |

Tra tài liệu chính thức về cú pháp hoặc API là được phép, nhưng phải ghi nguồn
và không sao chép một lời giải trùng bài. Khi học thuật toán “from scratch”,
không được gọi hàm thư viện triển khai sẵn chính thuật toán đang học.

## 3. Cổng trước khi hỏi AI

Chỉ mở AI khi cả sáu ô sau đã có nội dung:

- [ ] Tôi đã viết input, output, shape/dtype và ràng buộc.
- [ ] Tôi đã nêu ít nhất hai edge case trước khi code.
- [ ] Tôi đã tự viết một bản chạy được hoặc một bản lỗi cụ thể.
- [ ] Tôi đã chạy test và giữ nguyên thông báo lỗi/kết quả quan sát được.
- [ ] Tôi đã viết một giả thuyết có thể bác bỏ, không chỉ nói “code không chạy”.
- [ ] Tôi đã thử một thay đổi do chính mình nghĩ ra và ghi kết quả.

Nếu thiếu một ô, quay lại tự làm. “Em không biết bắt đầu từ đâu” chưa phải câu
hỏi kiểm chứng; hãy thu nhỏ bài về một ví dụ 1–3 phần tử, tính tay rồi mới code.

## 4. Prompt AI verifier

Chỉ điền dữ liệu do chính người học tạo vào mẫu sau. Không gửi dữ liệu cá nhân,
secret, đề thi đang được bảo mật hoặc private test.

```text
Bạn là bộ kiểm chứng SOLO-90, không phải người giải bài.

Bài toán được phép chia sẻ: [mô tả ngắn]
Input/output và ràng buộc tôi tự ghi: [nội dung]
Giả thuyết của tôi: [một phát biểu có thể đúng hoặc sai]
Test tôi đã tự chạy: [input, expected, actual hoặc traceback]
Đoạn code tôi tự viết cần kiểm chứng: [chỉ phần tối thiểu, nếu thật sự cần]

Câu hỏi duy nhất: Lập luận của tôi đúng hay chưa?

Quy tắc trả lời bắt buộc:
1. Không viết code, pseudocode, đáp án, thuật toán từng bước, diff hoặc chỉ ra
   dòng cần thay.
2. Không tiết lộ thêm test hoặc kết quả đúng hoàn chỉnh.
3. Chỉ trả đúng ba dòng ngắn:
   KẾT LUẬN: ĐÚNG | CHƯA ĐỦ BẰNG CHỨNG | SAI
   NHÓM LỖI: [shape/dtype/logic/edge case/numerical/leakage/complexity/khác]
   CÂU HỎI GỢI MỞ: [duy nhất một câu để tôi tự kiểm tra tiếp]
4. Nếu thiếu dữ kiện, dùng CHƯA ĐỦ BẰNG CHỨNG và hỏi đúng một dữ kiện; không
   tự điền phần còn thiếu.
```

Nếu AI không tuân thủ và đưa code/lời giải, dừng đọc ngay, ghi “AI vượt ranh
giới” vào nhật ký và chuyển sang biến thể khác. Không được chép lại dù chỉ đổi
tên biến.

## 5. Nhịp một phiên 30 phút

| Phút | Việc làm | Bằng chứng |
| ---: | --- | --- |
| 0–4 | Nhớ lại bài trước, không mở tài liệu | 3 gạch đầu dòng từ trí nhớ |
| 4–10 | Đọc mục tiêu, dự đoán output/công thức | Một dự đoán có thể kiểm tra |
| 10–24 | Tự code và tự viết test | Commit/tệp hoặc cell có lịch sử thử |
| 24–28 | Giải thích bằng lời, tính complexity | Ghi âm ngắn hoặc nhật ký |
| 28–30 | Exit ticket và đặt lịch ôn | Mục +1/+7/+21/+60 |

AI verifier không phải bước bắt buộc. Nếu thật sự cần, lấy tối đa vài phút từ
khối tự kiểm cuối; không kéo dài phiên chỉ để trò chuyện với AI.

## 6. Nhịp một phiên 60 phút

| Phút | Việc làm | Bằng chứng |
| ---: | --- | --- |
| 0–5 | Closed-book recall | Công thức/invariant tự viết |
| 5–15 | Đọc trực giác và trace ví dụ nhỏ | Bảng tính tay hoặc sơ đồ shape |
| 15–40 | Cài từ đầu, chạy visible tests | Code và ít nhất 3 test tự viết |
| 40–50 | Edge cases, numerical stability, complexity | Bảng lỗi và phép đo nhỏ |
| 50–56 | Chạy lại sạch, giải thích miệng | Fresh run + phần giải thích |
| 56–60 | Nhật ký, điểm rubric, lịch ôn | Một record hoàn chỉnh |

Trong ngày checkpoint hoặc mock, không hỏi AI cho tới sau khi đã nộp và khóa
kết quả. Phần phản tư sau thi vẫn phải tuân thủ prompt verifier.

## 7. Rubric 100 điểm cho một bài code

Rubric này dùng cho bài code/notebook cá nhân. Checkpoint tuần có thể đặt ngưỡng
cao hơn; khi đó ngưỡng và gate hiển thị trong lộ trình được ưu tiên.

| Nhóm | Điểm tối đa | Cách chấm |
| --- | ---: | --- |
| Correctness tự động | 45 | Lấy `correctnessPoints` từ CLI; nếu không có CLI, chấm tỷ lệ test bắt buộc đã đạt |
| Giải thích cơ chế | 20 | 5 điểm input/output và invariant; 5 điểm trace cơ chế; 5 điểm failure/edge case; 5 điểm nối kết quả với metric |
| Test tự viết | 10 | Case thường 2; biên 3; property/invariant 3; test chống mutation/leakage hoặc seed 2 |
| Độ phức tạp | 10 | Time 4; memory 3; liên hệ với constraint và bottleneck 3 |
| Chất lượng và tái lập | 10 | Hàm/hợp đồng 3; tên/type/shape rõ 2; không side effect và quản lý seed 3; fresh run 2 |
| Sổ lỗi và phản tư | 5 | Có symptom 1; giả thuyết 1; thí nghiệm tối thiểu 1; nguyên nhân thật 1; quy tắc tránh lặp 1 |
| **Tổng** | **100** | Không làm tròn bù giữa các nhóm |

### Cách chấm phần 45 điểm correctness

- Với CLI, dùng đúng số mà grader in ra; grader tính tỷ lệ trên các case đã
  chọn. Điểm public chỉ là tạm thời, điểm full mới dùng để khóa bài.
- Với notebook, lập danh sách test bắt buộc trước khi nhìn kết quả và tính
  `45 × số test đạt / tổng test`; không tự thêm test dễ sau khi thất bại để tăng
  mẫu số.
- Một test chỉ có giá trị khi fresh kernel/process vẫn đạt.

### Gate bắt buộc

Bài **không được tính hoàn thành**, bất kể tổng điểm, nếu có một trong các điều
sau:

- không giải thích được từng khối code;
- không chạy lại được từ trạng thái sạch;
- dùng test/validation/test split bị leakage;
- dùng code hoặc pseudocode do AI sinh;
- vi phạm ràng buộc cốt lõi của đề;
- chỉ pass nhờ state còn sót từ cell/lần chạy trước.

Mức đánh giá:

- dưới 70: chưa đạt, thu nhỏ bài và làm lại phần yếu;
- 70–74: đạt checkpoint chỉ khi checkpoint cho phép, nhưng chưa đạt chuẩn bài
  SOLO-90;
- 75–84: đạt bài;
- 85–94: vững ở lần làm hiện tại;
- 95–100: có thể giải thích, phản biện và tạo biến thể mới.

## 8. Nhật ký bắt buộc

Mỗi phiên tạo một record; không cần văn dài nhưng không được bỏ bằng chứng.

```markdown
### YYYY-MM-DD · Wxx/Dx · [tên bài]
- Mục tiêu một câu:
- Thời lượng Core/Deep:
- Commit/tệp/notebook:
- Input/output, shape và invariant:
- Dự đoán trước khi chạy:
- Test công khai: .../...; test đầy đủ: .../...
- Lỗi đầu tiên quan sát được:
- Giả thuyết của tôi:
- Thí nghiệm tôi tự làm:
- Nguyên nhân thật và quy tắc tránh lặp:
- AI verifier: không dùng | đã dùng ... phút
- Câu hỏi đã gửi AI:
- Kết luận AI (không chép lời giải):
- Hành động tiếp theo do tôi tự chọn:
- Điểm: correctness __/45; giải thích __/20; test __/10;
  complexity __/10; chất lượng __/10; sổ lỗi __/5; tổng __/100
- Lịch ôn: +1 __/__/__; +7 __/__/__; +21 __/__/__; +60 __/__/__
```

Không ghi “đã hiểu” như bằng chứng. Ghi thứ có thể mở lại: tệp, commit, ảnh
output, test, bảng trace hoặc phần giải thích.

## 9. Mastery và lịch ôn +1/+7/+21/+60

`T0` là ngày bài đạt gate lần đầu. Đừng đánh dấu “vững” ngay tại T0.

| Mốc | Bài ôn đóng tài liệu | Điều kiện đạt |
| --- | --- | --- |
| `+1` | 5 phút nhớ lại cơ chế; tự tạo 2 edge case; sửa lại phần từng sai | Nói đúng 3 ý cốt lõi và cả 2 test hợp lệ |
| `+7` | Code lõi từ trang trắng trong 20–30 phút, không AI | Fresh run đạt public tests và ít nhất 1 test mới |
| `+21` | Làm biến thể chuyển giao: dữ liệu/shape/constraint khác | Rubric ít nhất 80, không vi phạm gate |
| `+60` | Bài trộn hoặc mock 45–60 phút, chỉ mở tài liệu sau khi nộp | Rubric ít nhất 85 và giải thích miệng đạt |

Trạng thái theo dõi:

- **Đạt bài:** T0 đạt ít nhất 75 và qua gate.
- **Vững:** đạt liên tiếp `+1`, `+7`, `+21`.
- **Bền:** đạt `+60` trong một bài trộn hoặc dự án.

Nếu trượt một mốc, không xóa thất bại. Ghi lỗi, sửa độc lập, thi lại vào ngày
kế tiếp và lấy ngày thi lại đạt làm mốc mới cho các lần ôn sau. Không dồn hai
lần ôn thành một phiên dài để bù lịch.

Ví dụ, T0 là 20/08/2026 thì lịch dự kiến là 21/08, 27/08, 10/09 và 19/10.
Nếu trượt +7 ngày 27/08 và đạt lại ngày 28/08, lịch chuyển giao tiếp theo được
neo từ 28/08; nhật ký vẫn giữ cả lần trượt.

## 10. Quy trình khi bị kẹt

1. Thu nhỏ input về một ví dụ tính tay được.
2. Ghi expected trước khi chạy.
3. In shape, dtype, min/max hoặc invariant; không in toàn bộ tensor lớn.
4. Chia pipeline và tìm bước đầu tiên làm invariant sai.
5. Viết một test chỉ tái hiện lỗi đó.
6. Đọc traceback từ dòng cuối lên và tra tài liệu API chính thức nếu cần.
7. Chỉ sau đó mới dùng prompt verifier.

Nếu vẫn không tiến triển sau hai phiên, quay lại prerequisite được chỉ trong
[lộ trình](LO_TRINH_41_TUAN.md). Việc quay lại nền tảng là một quyết định kỹ
thuật, không phải thất bại.

## 11. Checklist khóa bài

- [ ] Full tests/fresh run đạt và không dựa state ẩn.
- [ ] Tôi có thể trace một ví dụ nhỏ bằng tay.
- [ ] Tôi giải thích được vì sao thuật toán đúng và khi nào nó sai.
- [ ] Tôi nêu được time/memory complexity theo kích thước input.
- [ ] Tôi có test thường, test biên và property/invariant.
- [ ] Nhật ký ghi cả lỗi, không chỉ kết quả đẹp.
- [ ] Nếu dùng AI, câu hỏi và thời lượng nằm trong ranh giới verifier.
- [ ] Đã đặt đủ lịch +1/+7/+21/+60.

Quy trình dùng website, notebook và grader nằm trong
[Hướng dẫn người học](HUONG_DAN_NGUOI_HOC.md); giới hạn kỹ thuật của test ẩn và
worker nằm trong [Kiến trúc hệ thống](KIEN_TRUC_HE_THONG.md).
