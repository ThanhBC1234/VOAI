# Bắt đầu sử dụng VOAI Lab

Đây là hướng dẫn ngắn nhất để đưa VOAI Lab lên GitHub rồi bắt đầu học. Cấu hình
hiện tại giả định repository **public**, tên chính xác `voai-lab`, nhánh chính
`main`. Không đổi tên repository nếu chưa sửa lại cấu hình Pages và liên kết
Colab trong mã nguồn.

## Bạn sẽ dùng bốn nơi như thế nào?

| Nơi | Việc nên làm ở đó |
| --- | --- |
| GitHub Pages | Học hằng ngày: lộ trình, 78 bài giảng, 350 câu lý thuyết, assessment, lab và 5 bài Code Arena |
| GitHub Codespaces | Viết code thật, chạy website, notebook và CLI grader trong VS Code trên trình duyệt |
| Google Colab | Chạy 8 notebook, đặc biệt khi cần môi trường Python mà không muốn cài trên máy |
| GitHub Actions | Tự kiểm tra mã nguồn và tự triển khai Pages sau mỗi lần push lên `main` |

**Luồng khuyên dùng:** mở Pages để biết hôm nay học gì; chuyển sang Codespaces
hoặc Colab khi cần code; quay lại Pages để làm assessment và đánh dấu hoàn thành.

---

## Phần A — Đăng sản phẩm lên GitHub

### Bước 1. Tạo repository trống

1. Đăng nhập GitHub và mở <https://github.com/new>.
2. Chọn đúng tài khoản ở mục **Owner**.
3. Đặt **Repository name** là `voai-lab`.
4. Chọn **Public**.
5. Không chọn tạo sẵn `README`, `.gitignore` hoặc `LICENSE`, vì tạo initial
   commit trên GitHub có thể gây xung đột với lịch sử Git đã có trên máy. Kho
   hiện chưa có `LICENSE`; repository public không tự cấp quyền tái sử dụng và
   owner cần chọn giấy phép riêng khi muốn phát hành mã nguồn mở.
6. Nhấn **Create repository**.

### Bước 2. Kiểm tra bản sẽ upload

Mở PowerShell trong `C:\VOAI`, rồi chạy:

```powershell
git status --short
git branch --show-current
git log -1 --oneline
```

Nhánh phải là `main`. `git status --short` không nên hiện tệp sản phẩm chưa
commit. Không dùng `git add .` một cách mù quáng nếu bạn đang để bài làm cá nhân,
notebook đã giải hoặc dữ liệu riêng trong thư mục dự án.

Nếu `git status --short` có kết quả, **chưa push**. Xem thay đổi rồi chỉ stage
đúng các tệp sản phẩm bạn muốn công khai:

```powershell
git diff --stat
git diff
# Thay hai đường dẫn ví dụ bằng đúng các tệp bạn đã kiểm tra:
git add -- "duong-dan\tep-1" "duong-dan\tep-2"
git diff --cached --name-status
git diff --cached --check
git commit -m "Mo ta thay doi"
git status --short
```

Không đưa `.env`, token, dữ liệu cá nhân, notebook đã giải hoặc bài làm riêng
lên repository public. Với bản bàn giao đã chốt của VOAI Lab, phần lý thuyết và
hướng dẫn phải nằm sẵn trong commit; bạn không cần tạo thêm commit nếu
`git status --short` không in gì.

### Bước 3. Kết nối và push

Thay `<GITHUB_OWNER>` bằng đúng giá trị **Owner** đã chọn ở bước tạo repository
(tài khoản cá nhân hoặc organization):

```powershell
git remote add origin https://github.com/<GITHUB_OWNER>/voai-lab.git
git branch -M main
git push -u origin main
```

Nếu Git báo `remote origin already exists`, không thêm lần nữa; dùng:

```powershell
git remote set-url origin https://github.com/<GITHUB_OWNER>/voai-lab.git
git push -u origin main
```

GitHub không nhận mật khẩu tài khoản cho lệnh Git qua HTTPS. Git for Windows
thường mở cửa sổ trình duyệt của Git Credential Manager để bạn đăng nhập; hãy
dùng luồng trình duyệt đó. Nếu máy không có Credential Manager, dùng GitHub CLI
hoặc personal access token theo hướng dẫn xác thực chính thức, không ghi token
vào mã nguồn hay tệp tài liệu.

Sau khi push, mở repository trên GitHub và kiểm tra có các tệp
`app/theory/page.tsx`, `content/theory/index.ts`, thư mục `notebooks/` và hai
workflow trong `.github/workflows/`. Nếu thiếu phần lý thuyết, nghĩa là bạn đã
push một commit cũ.

### Bước 4. Bật GitHub Pages

1. Trong repository, mở **Settings**.
2. Ở thanh bên, chọn **Pages**.
3. Trong **Build and deployment**, tại **Source**, chọn **GitHub Actions**.
4. Mở tab **Actions** của repository.
5. Chọn workflow **Deploy GitHub Pages** → **Run workflow** → nhánh `main`.
6. Chờ cả **CI** và **Deploy GitHub Pages** chuyển sang màu xanh.

Không chọn **Deploy from a branch** và không tạo thêm workflow Pages mẫu; dự án
đã có workflow riêng. Lần chạy đầu có thể lỗi nếu push xảy ra trước khi bật
Pages. Trong trường hợp đó, bật Pages rồi chạy lại workflow.

Nếu tab **Actions** không chạy workflow, mở **Settings → Actions → General →
Actions permissions**, cho phép chạy Actions rồi lưu. Repository thuộc
organization có thể bị policy của organization ghi đè; khi đó owner/admin của
organization phải bật quyền phù hợp.

Khi deploy thành công, website mặc định là:

```text
https://<GITHUB_OWNER>.github.io/voai-lab/
```

Mở thêm đường dẫn sau để xác nhận phần lý thuyết mới đã lên đúng bản:

```text
https://<GITHUB_OWNER>.github.io/voai-lab/theory/
```

---

## Phần B — Buổi học đầu tiên trên website

### 1. Mở lộ trình

Từ website Pages, chọn **Lộ trình**:

1. tìm tuần chứa ngày bạn đang học;
2. mở tuần và đọc **Mục tiêu**, **Đầu ra tuần**, **Điều kiện qua**;
3. mở phiên của ngày đó;
4. chỉ đánh dấu hoàn thành sau khi đã lưu bằng chứng học tập.

Lộ trình có 290 phiên từ 15/08/2026 đến 31/05/2027. Ngày bình thường học
30–60 phút; hai checkpoint mock 180 và 360 phút là ngoại lệ có chủ đích.

### 2. Học một phiên 30 phút

Quy trình tối thiểu:

1. **3 phút — nhớ lại:** đóng tài liệu và viết những gì mình còn nhớ về chủ đề;
2. **7 phút — bài giảng:** mở bài được đề xuất, tập trung vào mục tiêu, trực giác
   và phần thuật toán cần dùng ngay;
3. **15 phút — tự code:** tự viết phần lõi, ví dụ nhỏ và ít nhất một test; không
   để AI viết thay. Đây là bằng chứng code bắt buộc của assessment;
4. **5 phút — assessment:** ghi retrieval, dán đường dẫn/đoạn bằng chứng code,
   giải thích và điểm tự chấm.

Với phiên thiên về lý thuyết, dùng một phần 7 phút bài giảng để làm 3–5 câu ở
trang **Lý thuyết**. Nếu muốn vừa đọc kỹ, vừa code, vừa luyện 5–10 câu thì chọn
phiên 45–60 phút thay vì cắt bỏ 15 phút tự code.

### 3. Nếu có đủ 60 phút

Dùng 30 phút còn lại cho đúng một hoạt động:

- **Phòng lab:** dự đoán kết quả trước, sau đó mới thay tham số;
- **Chấm bài** (`/practice`, giao diện Code Arena): tự viết lời giải cho một
  trong 5 task mẫu;
- **Notebook:** hoàn thiện một nhóm `TODO` và chạy lại visible tests;
- **Dự án cá nhân:** lưu code của bạn trong `work/` để không vô tình đưa lời giải
  hoặc dữ liệu riêng lên repository công khai.

### 4. Dùng trang Lý thuyết

Trang **Lý thuyết** có hai chế độ:

- **Luyện theo chủ đề:** dùng hằng ngày; lọc theo khối và mức độ, trả lời rồi mới
  xem lời giải;
- **Thi thử 100 câu:** dùng ở checkpoint; đóng tài liệu, không hỏi AI và dành đủ
  180 phút.

Các tham số đề mock là chuẩn luyện tập nội bộ, không phải quy chế VOAI 2027.
Luôn đối chiếu trang **Tài nguyên** khi Ban Tổ chức công bố quy chế mới.

### 5. Quy tắc dùng AI

- Tự code và tự trả lời khoảng 90% thời gian.
- Chỉ hỏi AI sau khi đã có code, dự đoán, test và giải thích của riêng mình.
- Không yêu cầu AI viết trọn lời giải đang làm.
- Nên hỏi theo dạng: “Đây là lập luận/code/test của mình; chỉ chỉ ra chỗ sai và
  đặt một câu hỏi gợi ý, đừng đưa đáp án hoàn chỉnh.”

---

## Phần C — Dùng Codespaces để code online

### Tạo Codespace

1. Mở repository `voai-lab` trên GitHub.
2. Chọn **Code** → **Codespaces** → **Create codespace on main**.
3. Chờ quá trình cài Node và Python hoàn tất.
4. Trong terminal của Codespaces, chạy:

```bash
node --version
python --version
npm run dev
```

Cổng `3000` đã được cấu hình tự chuyển tiếp. Nếu website không tự mở, chọn tab
**Ports**, tìm cổng `3000` rồi chọn mở preview.

### Các lệnh thường dùng

```bash
npm run lint
npm run typecheck
npm test
python scripts/validate_notebooks.py
python -m unittest grader/tests/test_grader.py -v
```

Ví dụ chấm một bài do bạn tự viết:

```bash
python grader/grade.py vector-mean work/bai_lam.py --public
python grader/grade.py vector-mean work/bai_lam.py
```

CLI grader chạy mã Python thật nhưng không phải sandbox an toàn. Chỉ chạy code
của chính bạn hoặc code đã tin cậy. Khi học xong, dừng Codespace để tránh tiếp
tục dùng hạn mức tính toán.

---

## Phần D — Dùng notebook bằng Google Colab

1. Trên website Pages, chọn **Notebook**.
2. Chọn notebook phù hợp rồi bấm **Mở bằng Colab ↗**.
3. Lưu một bản sao cá nhân vào Google Drive trước khi sửa.
4. Chạy cell từ trên xuống, tự hoàn thiện `TODO`, chạy visible tests.
5. Cuối buổi: **Restart runtime → Run all** để chắc notebook không phụ thuộc
   trạng thái cũ.

Không commit notebook đã giải hoặc notebook còn output/execution history vào
nhánh `main`; bộ kiểm tra repository cố ý yêu cầu 8 notebook mẫu phải sạch. Nếu
dùng Codespaces, hãy tạo bản làm riêng trong `work/`. Nếu dùng Colab, giữ bản cá
nhân trong Drive.

---

## Phần E — Tiến độ và sao lưu

Website lưu tiến độ trong trình duyệt hiện tại, không có tài khoản và không tự
đồng bộ giữa máy tính, điện thoại, Pages, Codespaces hoặc trình duyệt khác.

- Ở **Lộ trình**, bấm **Xuất tiến độ** mỗi tuần.
- Ở **Đánh giá**, bấm **Xuất attempts JSON** sau checkpoint.
- Lịch sử đề mock lý thuyết hiện chỉ nằm trong bộ nhớ trình duyệt, giữ tối đa 20
  lượt và giao diện chỉ hiện lượt gần nhất; chưa có nút export. Vì vậy hãy ghi
  điểm mock vào error ledger hoặc nhật ký học tập riêng.
- Trang **Chấm bài** không tự lưu nội dung code: trước khi đổi task hoặc tải lại
  trang, hãy sao chép code vào tệp cá nhân; trong Codespaces nên lưu dưới
  `work/`. Dấu pass của 5 task cũng là một key trình duyệt riêng và không nằm
  trong hai tệp export trên.
- Hai tệp JSON hiện là bản sao lưu để đọc/đối chiếu; website chưa có nút import
  để tự khôi phục dữ liệu sang trình duyệt khác.
- Không xóa dữ liệu website/trình duyệt trước khi xuất các tệp cần giữ.

---

## Xử lý lỗi thường gặp

| Hiện tượng | Cách kiểm tra |
| --- | --- |
| Pages báo 404 toàn bộ | Tên repository phải là `voai-lab`; Pages Source phải là **GitHub Actions**; workflow deploy phải xanh |
| Có website nhưng thiếu **Lý thuyết** | Kiểm tra `app/theory/` và `content/theory/` đã có trong commit trên GitHub; chạy lại deploy |
| Action đầu tiên màu đỏ | Bật Pages trước, sau đó chạy lại **Deploy GitHub Pages**; mở log nếu CI cũng đỏ |
| Codespaces không mở website | Chạy `npm run dev`, vào tab **Ports**, mở cổng `3000` |
| Nút Colab mở sai repository | Dùng bản GitHub Pages, giữ đúng tên repo `voai-lab`, chế độ public và nhánh `main` |
| Code Arena tải lâu | Cần mạng để tải Pyodide; mỗi lượt chạy dùng runtime mới để tránh trạng thái Python bẩn |
| Tiến độ biến mất ở máy khác | Đây là dữ liệu `localStorage`; dùng các nút export và lưu file sao lưu |

## Checklist hoàn tất

- [ ] Repository `voai-lab` ở chế độ public.
- [ ] Nhánh `main` có route `app/theory/` và đủ 8 notebook.
- [ ] Workflow **CI** màu xanh.
- [ ] Workflow **Deploy GitHub Pages** màu xanh.
- [ ] Mở được `/voai-lab/roadmap/` và `/voai-lab/theory/`.
- [ ] Tạo được Codespace và chạy `npm run dev`.
- [ ] Mở được một notebook bằng Colab.
- [ ] Hoàn thành phiên đầu tiên và xuất thử tệp tiến độ.

## Tài liệu liên quan

- [Hướng dẫn GitHub online chi tiết](GITHUB_ONLINE.md)
- [Hướng dẫn người học](HUONG_DAN_NGUOI_HOC.md)
- [Quy tắc SOLO-90](QUY_TAC_SOLO_90.md)
- [Lý thuyết vòng 1](LY_THUYET_VONG_1.md)
- [Lộ trình 41 tuần](LO_TRINH_41_TUAN.md)
- [GitHub: tạo repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository)
- [GitHub: xác thực khi dùng Git](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github)
- [GitHub: cấu hình nguồn xuất bản Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [GitHub: tạo Codespace cho repository](https://docs.github.com/en/codespaces/developing-in-a-codespace/creating-a-codespace-for-a-repository)
- [Google Colab FAQ](https://research.google.com/colaboratory/faq.html)
