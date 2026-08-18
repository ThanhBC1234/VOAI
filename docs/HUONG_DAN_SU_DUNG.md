# Hướng dẫn sử dụng VOAI Lab

Tất cả những gì người học cần, gộp trong một trang: mở gì trước, mỗi ngày làm gì, dùng AI tới đâu, tự chấm thế nào và tiến độ được lưu ở đâu.

> Bản này được **sinh tự động** từ `content/user-guide.ts`. Đừng sửa trực tiếp;
> sửa tệp nguồn rồi chạy lại `node scripts/emit-user-guide.mjs`.
> Bản đọc trên web: mục **Hướng dẫn** trên thanh điều hướng.

## Mục lục

- [1. VOAI Lab là gì và dành cho ai](#voai-lab-la-gi)
- [2. Bắt đầu trong 5 phút](#bat-dau)
- [3. Bản đồ 11 trang — dùng trang nào khi nào](#ban-do-trang)
- [4. Một phiên học diễn ra thế nào](#mot-phien-hoc)
- [5. Nhịp một tuần](#nhip-tuan)
- [6. Dùng AI tới đâu — quy tắc SOLO-90](#solo-90)
- [7. Tự chấm một bài](#tu-cham)
- [8. Code Arena, Notebook và chấm bài](#cong-cu)
- [9. Tiến độ được lưu ở đâu](#tien-do)
- [10. Xử lý sự cố thường gặp](#su-co)
- [11. Câu hỏi thường gặp](#faq)

---

<a id="voai-lab-la-gi"></a>

## 1. VOAI Lab là gì và dành cho ai

*Đọc 1 phút để biết bạn có đúng đối tượng không.*

VOAI Lab là bộ học liệu **tự học AI** cho học sinh THPT đã biết lập trình cơ bản, hướng tới kỳ thi VOAI/IOAI. Toàn bộ chạy trong trình duyệt — **không cần cài gì**.

- **290 phiên học** trải từ 15/08/2026 đến 31/05/2027, mỗi ngày 30–60 phút.
- **78 bài giảng** thuật toán, **5 module Toán** (23 chủ đề · 69 bài luyện có đáp án).
- **350 câu lý thuyết** cho vòng 1, kèm đề thi thử 100 câu trong 180 phút.
- **6 phòng lab** tương tác, **5 bài Code Arena** chạy Python ngay trong trình duyệt.
- **8 notebook** thực hành mở thẳng trên Google Colab.

> ℹ️ **Nguyên tắc xuyên suốt: SOLO-90**
>
> Tối thiểu 90% việc học phải do bạn tự làm. AI chỉ được dùng để **kiểm chứng**, không dùng để sinh lời giải. Chi tiết ở mục 6.

---

<a id="bat-dau"></a>

## 2. Bắt đầu trong 5 phút

*Làm đúng 4 bước này là xong buổi học đầu tiên.*

1. Mở trang **Lộ trình**. Tìm phiên có ngày hôm nay (hoặc phiên chưa tích gần nhất) rồi bấm mở tuần chứa nó.
2. Đọc mục tiêu và phần `soloBuild` của phiên — đây là thứ bạn phải tự làm được, không phải thứ để đọc cho biết.
3. Mở **Đánh giá** ở tab khác, tìm đúng phiên đó, và trả lời phần truy hồi **khi tài liệu còn đóng**.
4. Code phần nhỏ nhất chạy được + ít nhất một test biên. Quay lại phiếu đánh giá, ghi bằng chứng, tự chấm, bấm lưu.

> ⚠️ **Đừng tích hoàn thành khi chưa có sản phẩm**
>
> Dấu tích chỉ để theo dõi. Nếu chưa có tệp chạy được, test, hay phần giải thích thì phiên đó **chưa xong** — dù bạn đã đọc hết bài giảng.

---

<a id="ban-do-trang"></a>

## 3. Bản đồ 11 trang — dùng trang nào khi nào

*Mỗi trang có một việc. Đây là bảng tra nhanh.*

| Trang | Dùng để làm gì | Khi nào mở |
| --- | --- | --- |
| Trang chủ | Giới thiệu và lối vào nhanh | Lần đầu vào web |
| **Hướng dẫn** | Chính trang bạn đang đọc | Khi quên cách dùng gì đó |
| Lộ trình | 290 phiên theo ngày, mục tiêu, tích hoàn thành | **Mở đầu tiên mỗi ngày** |
| Bài giảng | 78 bài: trực giác, công thức, lỗi thường gặp, quiz | Khi cần hiểu cơ chế |
| Toán | 5 module toán thi, có ví dụ mẫu và bài luyện tự chấm | Khi hổng nền toán |
| Lý thuyết | 350 câu vòng 1 + đề thi thử tính giờ | Luyện trắc nghiệm, thi thử |
| Đánh giá | Phiếu 1:1 cho từng phiên: bằng chứng + tự chấm | **Cuối mỗi phiên học** |
| Phòng lab | 6 mô phỏng kéo–thả để thấy thuật toán chuyển động | Khi khái niệm còn mơ hồ |
| Chấm bài | Code Arena: viết Python, chạy test ngay trên web | Khi cần luyện code |
| Notebook | 8 notebook mở trên Colab | Bài thực hành dài |
| Tài nguyên | Nguồn học hợp pháp đã kiểm | Khi muốn học thêm |

> ℹ️ **Nền sáng hay nền tối tuỳ bạn**
>
> Nút đổi nền nằm ở góc phải thanh điều hướng. Lựa chọn được nhớ lại cho những lần sau, và mặc định đi theo cài đặt sáng/tối của máy bạn.

---

<a id="mot-phien-hoc"></a>

## 4. Một phiên học diễn ra thế nào

*Phiên chuẩn 30 phút; có thời gian thì thêm 30 phút nữa.*

**Phiên Core — 30 phút:**

1. **5 phút truy hồi.** Mở phiếu đánh giá, trả lời khi chưa mở tài liệu. Viết sai cũng ghi — đó là dữ liệu về chỗ hổng.
2. **10 phút hiểu.** Đọc bài giảng tương ứng trong tuần, tính tay một ví dụ nhỏ. Không đọc lướt.
3. **15 phút tự làm.** Code lát cắt nhỏ nhất trong `soloBuild` + một test biên. Ghi bằng chứng và tự chấm trước khi hết giờ.

Kết thúc bằng một câu tự hỏi: **“Đổi input hay ràng buộc nào thì cách làm hiện tại sẽ sai?”** Trả lời được câu đó mới thật sự hiểu.

**Phiên Deep — thêm 30 phút:** làm đủ Core rồi thêm ít nhất một trong các việc sau.

- Mở rộng từ ví dụ đồ chơi sang batch hoặc dữ liệu thật nhỏ.
- So sánh bản tự viết với thư viện trên cùng seed; hoặc làm một ablation.
- Thêm property test, gradient check hoặc kiểm tra rò rỉ dữ liệu.
- Đo thời gian/bộ nhớ thật thay vì chỉ nói Big-O.
- Chạy lại từ đầu (restart & run all) trước khi khóa phiên.

> ⚠️ **Deep không phải là xem thêm video**
>
> Phần 30 phút thêm phải tạo ra **bằng chứng kỹ thuật mới**, nếu không thì nó không tính.

---

<a id="nhip-tuan"></a>

## 5. Nhịp một tuần

*Mỗi tuần đúng 7 phiên, lặp lại cố định suốt 41 tuần.*

| Ngày | Loại phiên | Kết quả tối thiểu |
| --- | --- | --- |
| 1–5 | Năm bài khái niệm | Mỗi ngày một hàm/trace nhỏ kèm test |
| 6 | Lab tích hợp | Sản phẩm đạt đúng tiêu chí đề ra |
| 7 | Checkpoint | Bài đóng tài liệu + tự chấm + kế hoạch sửa |

**Không đi tiếp chỉ vì đã sang ngày mới.** Checkpoint trượt thì dùng quy tắc làm lại của tuần đó và làm lại phần yếu **từ trang trắng**, không sửa vá bài cũ.

---

<a id="solo-90"></a>

## 6. Dùng AI tới đâu — quy tắc SOLO-90

*Phần quan trọng nhất. Vi phạm là bài nộp mất giá trị làm bằng chứng.*

| Được phép hỏi AI (sau khi đã tự chạy) | Không được phép |
| --- | --- |
| “Kết luận độ phức tạp O(nd) của em đúng không?” | “Viết hàm này cho em” |
| “Theo traceback này, em sai nhóm shape hay dtype?” | “Sửa dòng 17 giúp em” |
| “Test biên em đề xuất có kiểm được mutation không?” | “Cho em pseudocode thuật toán” |
| “Lập luận về rò rỉ dữ liệu của em đúng chưa?” | “Tối ưu toàn bộ notebook này” |

**Cổng 6 ô — chỉ mở AI khi cả sáu ô đều đã có nội dung do bạn tự viết:**

- Đã viết input, output, shape/dtype và ràng buộc.
- Đã nêu ít nhất hai trường hợp biên **trước khi** code.
- Đã có một bản chạy được, hoặc một lỗi cụ thể.
- Đã chạy test và giữ nguyên thông báo lỗi quan sát được.
- Đã viết một giả thuyết có thể bác bỏ (không phải “code không chạy”).
- Đã tự thử một cách sửa do mình nghĩ ra và ghi lại kết quả.

> ⚠️ **Nếu đã lỡ nhìn thấy lời giải**
>
> Lần nộp đó không còn là bằng chứng SOLO-90. Đóng đáp án lại, ghi vào nhật ký, và làm **một biến thể mới từ trang trắng**. Đây là quy tắc tự bảo vệ, không phải hình phạt.

**Trợ giảng ngay trong phiếu Đánh giá.** Ở mục 01 của phiếu có một ô tra cứu nhỏ. Nó **không phải** một con AI biết nói: nó chỉ tìm trong chính giáo trình của dự án — 350 câu lý thuyết, 78 bài giảng và lớp Toán — rồi trả về nguyên văn đoạn liên quan kèm một câu hỏi phản biện. Vì không có mô hình sinh chữ nào ở đây nên nó **không bịa được**; đổi lại, nó không chấm bài và không kết luận thay bạn.

> ℹ️ **Trợ giảng khoá cho tới khi bạn viết xong phần retrieval**
>
> Phải tự trả lời **cả** các câu retrieval (mỗi câu từ 40 ký tự) thì ô tra cứu mới mở. Mở sẵn từ đầu sẽ biến một bài kiểm tra trí nhớ thành một bài tra cứu — đúng thứ mà SOLO-90 sinh ra để chặn. Hỏi xong mà không thấy gì, trợ giảng sẽ nói thẳng “không có trong giáo trình” chứ không đưa một đoạn na ná cho có.

---

<a id="tu-cham"></a>

## 7. Tự chấm một bài

*Thang 100 điểm, và sáu điều kiện khiến bài bị loại bất kể điểm số.*

| Hạng mục | Điểm | Chấm cái gì |
| --- | --- | --- |
| Tính đúng | 45 | Tỷ lệ test bắt buộc đã đạt (fresh run mới tính) |
| Giải thích cơ chế | 20 | Input/output, trace, failure mode, nối với metric |
| Test tự viết | 10 | Case thường, biên, property, chống rò rỉ |
| Độ phức tạp | 10 | Thời gian, bộ nhớ, liên hệ ràng buộc |
| Chất lượng & tái lập | 10 | Hợp đồng hàm, seed, chạy lại được |
| Sổ lỗi & phản tư | 5 | Triệu chứng → giả thuyết → thí nghiệm → nguyên nhân |

**Mức đánh giá:** dưới 70 là chưa đạt (thu nhỏ bài, làm lại) · 75–84 đạt · 85–94 vững · 95–100 giải thích và tạo biến thể được.

> ⚠️ **Sáu điều làm bài bị loại dù đủ điểm**
>
> Không giải thích được từng khối code · không chạy lại được từ trạng thái sạch · dùng dữ liệu bị rò rỉ · dùng code do AI sinh · vi phạm ràng buộc đề · chỉ pass nhờ trạng thái sót lại từ lần chạy trước.

---

<a id="cong-cu"></a>

## 8. Code Arena, Notebook và chấm bài

*Ba công cụ thực hành, mỗi cái có giới hạn riêng cần biết trước.*

**Code Arena** (trang Chấm bài): viết Python và chạy test ngay trong trình duyệt, không cần cài Python. Lần chạy đầu tiên **cần mạng** và mất khoảng 15–30 giây để tải bộ chạy Python; các lần sau nhanh hơn. Mỗi lần chạy giới hạn 8 giây.

**Notebook**: bấm nút mở thẳng trên Google Colab, không cần cài gì. Luôn **Restart & Run All** trước khi coi là xong — kết quả chỉ đáng tin khi chạy lại từ đầu vẫn ra như vậy.

> ℹ️ **Điểm trên web không phải điểm chấm tự động**
>
> Phiếu đánh giá là **tự chấm dựa trên bằng chứng**. Nó không chạy code của bạn và không kiểm tra link. Muốn chấm tự động thật thì dùng bộ chấm dòng lệnh trong mã nguồn (cần cài Python trên máy).

---

<a id="tien-do"></a>

## 9. Tiến độ được lưu ở đâu

*Đọc kỹ mục này, nếu không bạn sẽ mất tiến độ mà không hiểu vì sao.*

Toàn bộ tiến độ lưu **ngay trong trình duyệt của bạn**, không có tài khoản và không đồng bộ lên máy chủ. Những thứ sau được **tự động lưu**, không cần bấm nút nào:

- Phiên đã tích hoàn thành ở Lộ trình.
- **Bản nháp phiếu đánh giá** — đổi phiên hay tải lại trang đều không mất.
- **Code bạn viết trong Code Arena** — lưu riêng cho từng bài, còn nguyên sau khi tải lại trang.
- Lịch sử tự chấm, chủ đề Toán đã đánh dấu, và bài thi thử đang làm dở (giữ cả đồng hồ).

> ℹ️ **Lỡ tay thì sao?**
>
> Các thao tác xoá đều **hỏi lại trước khi thực hiện**: nút “Khôi phục” trong Code Arena và việc rời khỏi bài thi thử đang chạy. Bấm nhầm rồi chọn Huỷ thì bài làm vẫn còn nguyên.

- Đổi máy hoặc đổi trình duyệt = **không thấy tiến độ cũ** (dữ liệu không theo bạn sang máy khác).
- Dùng chế độ ẩn danh = mất hết khi đóng cửa sổ.
- Xóa dữ liệu duyệt web = mất tiến độ.

> ⚠️ **Cách giữ tiến độ lâu dài**
>
> Bấm **Xuất tiến độ** ở trang Lộ trình và **Xuất attempts JSON** ở trang Đánh giá theo định kỳ (ví dụ mỗi tuần), rồi lưu tệp đó vào máy hoặc cloud. Đây là cách duy nhất mang dữ liệu sang thiết bị khác.

---

<a id="su-co"></a>

## 10. Xử lý sự cố thường gặp

*Bốn lỗi hay gặp nhất và cách xử lý.*

| Hiện tượng | Cách xử lý |
| --- | --- |
| Trang hiện chữ trơ trọi, mất màu và bố cục | Trình duyệt còn nhớ bản cũ. Nhấn **Ctrl + F5** để tải lại bỏ bộ nhớ đệm. |
| Code Arena báo không tải được Python | Kiểm tra mạng → tắt trình chặn quảng cáo cho trang này → thử trình duyệt khác. |
| Code chạy quá 8 giây rồi dừng | Gần như luôn là vòng lặp vô hạn hoặc độ phức tạp quá cao. Thu nhỏ đầu vào rồi thử lại. |
| Trang Đánh giá hiện tiêu đề nhưng thiếu đề bài | Mạng chập chờn khi tải chi tiết. Bấm **Thử tải lại** — bản nháp của bạn không bị mất. |

---

<a id="faq"></a>

## 11. Câu hỏi thường gặp

*Những câu người mới hay hỏi nhất.*

| Câu hỏi | Trả lời |
| --- | --- |
| Có cần cài phần mềm gì không? | **Không.** Chỉ cần trình duyệt và mạng. Chỉ khi muốn dùng bộ chấm dòng lệnh mới cần cài Python. |
| Có cần đăng ký tài khoản không? | Không. Không có đăng nhập, và cũng không có dữ liệu nào của bạn gửi lên máy chủ. |
| Có tốn phí không? | Không. Website và notebook trên Colab đều miễn phí. |
| Học trên điện thoại được không? | Đọc thì được, nhưng phần viết code và phòng lab cần màn hình lớn để làm tử tế. |
| Bỏ lỡ vài ngày thì sao? | Đừng học dồn. Bỏ phần mở rộng, giữ phần lõi + một test, rồi đi tiếp theo lịch. |
| Bài quá khó thì làm gì? | Thu nhỏ về ví dụ 1–3 phần tử, tính tay, rồi mới code lại. Vẫn kẹt thì ghi giả thuyết và dùng cổng 6 ô ở mục 6. |

---
