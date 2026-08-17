# Hướng dẫn đưa VOAI Lab lên GitHub và chạy đủ mọi tính năng

Tài liệu này đi từ máy trắng đến một website chạy thật trên GitHub Pages, với
**tất cả** tính năng hoạt động: lộ trình 290 phiên, 78 bài giảng, lớp Toán,
ngân hàng 350 câu lý thuyết, hệ thống assessment, 6 phòng lab, Code Arena chạy
Python trong trình duyệt, 8 notebook và CLI grader.

Mỗi phần ghi rõ **cần cài gì**, **chạy lệnh nào**, và **dấu hiệu nào cho biết
đã đúng**. Nếu một bước không cho đúng dấu hiệu đó, đừng đi tiếp — mục 9 liệt kê
cách xử lý từng lỗi thường gặp.

> **Điều kiện chốt cứng:** repository phải tên đúng `voai-lab`, để chế độ
> **public**, nhánh chính `main`. Đường dẫn cơ sở `/voai-lab` được ghi cứng ở
> năm nơi (`next.config.ts`, `scripts/run-vinext.mjs`, `scripts/prepare-pages.mjs`,
> `tests/pages-export.test.mjs`, `components/NotebookHub.tsx`). Đặt tên khác mà
> chưa sửa cả năm chỗ thì **toàn bộ CSS, JavaScript và ảnh sẽ trả 404**.

---

## 1. Cần cài những gì

### 1.1. Bắt buộc — không có thì không chạy được

| Phần mềm | Phiên bản tối thiểu | Vì sao cần | Kiểm tra |
| --- | --- | --- | --- |
| **Git** | 2.30 trở lên | Đưa mã nguồn lên GitHub | `git --version` |
| **Node.js** | **22.13.0** trở lên | Chạy website, build bản tĩnh, chạy test | `node --version` |
| **npm** | Đi kèm Node | Cài thư viện từ `package-lock.json` | `npm --version` |
| **Python** | **3.11** trở lên | CLI grader, validator notebook | `python --version` |
| **Trình duyệt hiện đại** | Chrome/Edge/Firefox bản mới | Code Arena cần WebAssembly và Web Worker | — |
| **Tài khoản GitHub** | — | Chứa repository và chạy Actions | — |

Bản Node dùng cho CI được ghi trong `.nvmrc` là `22.13.0`. Cài đúng dòng 22 LTS
là an toàn nhất; Node 24 cũng chạy được nhưng CI sẽ dùng 22.

> **Cài Node trên Windows:** tải bản LTS tại <https://nodejs.org/> và chọn
> installer `.msi`. Sau khi cài xong phải **mở lại** PowerShell thì `node` mới
> có trong PATH.
>
> **Cài Python trên Windows:** tải tại <https://www.python.org/downloads/> và
> **nhớ tích ô “Add python.exe to PATH”** ở màn hình đầu tiên. Quên tích ô này là
> nguyên nhân số một của lỗi `python: command not found`.

### 1.2. Thư viện Python cho notebook và grader

Chạy đúng một lần trong thư mục dự án:

```bash
python -m pip install --disable-pip-version-check -r requirements-notebooks.txt
```

Lệnh này cài `ipykernel`, `numpy` và `scikit-learn` — đủ cho 8 notebook và cho
bộ test của grader. **PyTorch không bắt buộc**: các bài lõi đều viết bằng NumPy.
Nếu muốn làm notebook `03_mlp_backprop_pytorch.ipynb` bằng PyTorch thật, hãy cài
riêng theo hướng dẫn tại <https://pytorch.org/get-started/locally/> — hoặc đơn
giản hơn là mở notebook đó trên Google Colab, nơi PyTorch có sẵn.

### 1.3. Không cần cài

- **Không cần** cơ sở dữ liệu, backend hay máy chủ riêng. Website là tệp tĩnh.
- **Không cần** Docker (trừ khi bạn tự chọn dùng Dev Container).
- **Không cần** khoá API, token hay biến bí mật nào. Nếu có ai bảo bạn thêm
  secret để deploy được, đó là dấu hiệu sai.
- **Không cần** tải sẵn Pyodide. Code Arena tự tải runtime Python từ CDN ở lần
  chạy đầu (xem mục 6.3).

---

## 2. Lấy mã nguồn về máy và cài thư viện

```bash
cd C:/VOAI
npm ci
```

Dùng `npm ci` chứ không phải `npm install`: `ci` cài đúng phiên bản đã khoá
trong `package-lock.json`, nên máy bạn và máy CI chạy cùng một bộ thư viện.

**Dấu hiệu đúng:** lệnh kết thúc không có dòng `npm error`, và thư mục
`node_modules/` xuất hiện.

---

## 3. Kiểm tra toàn bộ trước khi đẩy lên GitHub

Chạy lần lượt. Mỗi lệnh phải kết thúc **không có lỗi**; nếu một lệnh đỏ thì dừng
lại sửa, đừng push.

| # | Lệnh | Kiểm cái gì | Kết quả đúng |
| --- | --- | --- | --- |
| 1 | `npm run lint` | Quy tắc mã nguồn và React | Không in ra lỗi nào |
| 2 | `npm exec tsc -- --noEmit` | Kiểu TypeScript | Không in ra gì |
| 3 | `npm test` | Build rồi chạy 53 test Node | `pass 53`, `fail 0` |
| 4 | `npm run build:pages` | Dựng bản tĩnh cho Pages | `Prepared GitHub Pages artifact for /voai-lab/ (10 pages + 404)` |
| 5 | `npm run test:pages` | Artifact tĩnh đúng hợp đồng | `pass 5`, `fail 0` |
| 6 | `npm run test:grader` | CLI grader | `Ran 17 tests … OK` |
| 7 | `npm run test:notebooks` | Bộ test của chính validator | `Ran 12 tests … OK` |
| 8 | `npm run validate:notebooks` | Cấu trúc 8 notebook | `Validated 8 notebooks` |
| 9 | `npm audit --audit-level=high` | Lỗ hổng thư viện | `found 0 vulnerabilities` |

Có thể chạy gọn cả chuỗi:

```bash
npm run lint && npm exec tsc -- --noEmit && npm test && npm run build:pages && npm run test:pages
```

```bash
npm run test:grader && npm run test:notebooks && npm run validate:notebooks && npm audit --audit-level=high
```

### 3.1. Thư mục sinh tự động — đừng commit

`public/data/assessments/` chứa 42 tệp JSON được **sinh ra** từ
`content/daily-assessments.ts` mỗi lần chạy `npm run dev`, `npm run build` hay
`npm run build:pages`. Thư mục này đã nằm trong `.gitignore` và **không được
commit**: commit vào sẽ tạo hai nguồn sự thật, và bản trên GitHub sẽ lệch với nội
dung nguồn ngay lần sửa đầu tiên. CI tự sinh lại khi build.

Cùng lý do đó, `dist/`, `node_modules/`, `.next/`, `.vinext/` và `outputs/` cũng
không được commit.

---

## 4. Đưa lên GitHub

### 4.1. Tạo repository trống

1. Mở <https://github.com/new>.
2. **Owner:** chọn đúng tài khoản của bạn.
3. **Repository name:** gõ chính xác `voai-lab`.
4. Chọn **Public**.
5. **Không** tích tạo sẵn `README`, `.gitignore` hay `LICENSE` — chúng sẽ tạo một
   commit đầu tiên xung đột với lịch sử Git trên máy bạn.
6. Bấm **Create repository**.

### 4.2. Xem lại rồi đẩy lên

```bash
git status --short
```

Đọc kỹ danh sách. Đừng `git add .` một cách mù quáng nếu trong thư mục còn bài
làm cá nhân, ghi chú riêng hay tệp nháp.

```bash
git add -A
git commit -m "VOAI Lab: bản đầy đủ"
git branch -M main
git remote add origin https://github.com/<TÊN_TÀI_KHOẢN>/voai-lab.git
git push -u origin main
```

Thay `<TÊN_TÀI_KHOẢN>` bằng owner thật. **Tuyệt đối không** đưa token, mật khẩu,
tệp `.env` hay khoá API vào Git.

> **Nếu Git hỏi mật khẩu:** GitHub đã bỏ đăng nhập bằng mật khẩu từ 2021. Dùng
> **Personal Access Token** (Settings → Developer settings → Personal access
> tokens) và dán token vào ô mật khẩu, hoặc cài **GitHub CLI** rồi chạy
> `gh auth login`.

### 4.3. Bật GitHub Pages — bước dễ quên nhất

1. Mở repository → tab **Settings**.
2. Menu bên trái → **Pages**.
3. Mục **Build and deployment** → **Source** → chọn **GitHub Actions**.

Nếu bỏ qua bước này, workflow `Deploy GitHub Pages` sẽ chạy tới bước `deploy` rồi
**hỏng**, kèm thông báo đại ý “Pages chưa được bật cho repository này”.

### 4.4. Chờ workflow và mở website

1. Mở tab **Actions**. Sẽ thấy hai workflow: `CI` và `Deploy GitHub Pages`.
2. Nếu bạn bật Pages *sau* khi push, hãy mở `Deploy GitHub Pages` →
   **Re-run all jobs**.
3. Khi cả hai đều có dấu ✓ (thường 5–10 phút), mở:

```text
https://<TÊN_TÀI_KHOẢN>.github.io/voai-lab/
```

**Dấu hiệu đúng:** trang chủ hiện đủ màu và bố cục, không phải chữ đen trên nền
trắng trơ trọi. Chữ trơ trọi nghĩa là CSS bị 404 — xem mục 9.1.

---

## 5. Kiểm tra website đã lên: đi hết 9 trang

Mở lần lượt và đối chiếu:

| Đường dẫn | Phải thấy gì | Thử ngay tại chỗ |
| --- | --- | --- |
| `/voai-lab/` | Trang chủ, tiêu đề “Đi từ dòng Python đầu tiên…” | Bấm **Bắt đầu Ngày 1** |
| `/voai-lab/roadmap/` | 41 tuần + khối Tổng kết, thanh tiến độ `0/290 phiên` | Mở một tuần, tích một phiên, tải lại trang — dấu tích còn nguyên |
| `/voai-lab/lessons/` | `78/78 bài`, bộ lọc theo lĩnh vực | Chọn một bài, mở tab **Toán**, làm một câu quiz |
| `/voai-lab/math/` | 5 module · 23 chủ đề · 69 bài luyện | Nhập đáp án một bài luyện rồi bấm **Đối chiếu** |
| `/voai-lab/theory/` | Ngân hàng 350 câu, nút vào đề mock 180 phút | Bắt đầu đề mock, tải lại trang — đồng hồ và đáp án còn nguyên |
| `/voai-lab/assessments/` | `290/290 phiên`, phiếu đầu tiên hiện đủ đề bài | Bấm sang một phiên ở tuần khác — đề bài hiện sau chưa tới một giây |
| `/voai-lab/labs/` | 6 phòng lab có canvas vẽ được | Kéo thanh trượt, hình phải đổi theo |
| `/voai-lab/notebooks/` | 8 notebook kèm nút mở Colab | Bấm **Mở trên Colab** ở notebook 00 |
| `/voai-lab/practice/` | Code Arena với 5 bài | Xem mục 6.3 |

Tiến độ ở Roadmap, Toán, Lý thuyết, Assessment và Code Arena được lưu trong
**localStorage của chính trình duyệt đó**. Đổi máy, đổi trình duyệt hoặc xoá dữ
liệu website là mất. Muốn giữ lâu dài thì bấm nút **Xuất … JSON** ở từng trang.

---

## 6. Chạy đầy đủ tính năng ở máy cá nhân

### 6.1. Chạy website ở chế độ phát triển

```bash
npm run dev
```

Mở <http://localhost:3000>. Ở chế độ này **không có** tiền tố `/voai-lab`, nên
địa chỉ là `http://localhost:3000/math` chứ không phải `/voai-lab/math`.

Dừng bằng `Ctrl` + `C`.

### 6.2. Xem thử đúng bản sẽ lên GitHub Pages

```bash
npm run build:pages
```

Bản tĩnh nằm ở `dist/client/`. Muốn mở thử, phải phục vụ nó **dưới đúng thư mục
`voai-lab`**, nếu không mọi đường dẫn sẽ lệch:

```bash
mkdir -p .preview/voai-lab && cp -r dist/client/* .preview/voai-lab/ && python -m http.server 8080 --directory .preview
```

Rồi mở <http://localhost:8080/voai-lab/>. Xong thì xoá `.preview`.

### 6.3. Code Arena — Python chạy thẳng trong trình duyệt

Mở `/practice`, chọn bài **01 · Trung bình an toàn**, viết lời giải rồi bấm
**Chạy test ▶**.

- **Lần đầu cần Internet** và mất khoảng 15–30 giây: trình duyệt tải runtime
  Pyodide 0.27.7 (vài chục MB). Có hạn chờ 60 giây; quá hạn sẽ báo lỗi rõ ràng
  chứ không treo.
- Runtime được **tải xuống, băm SHA-384, đối chiếu với giá trị đã ghim, rồi mới
  chạy**. Băm sai thì bị từ chối hẳn — đây là lớp bảo vệ chống CDN bị can thiệp.
- Thời gian tải runtime **không** tính vào giới hạn 8 giây của phần thực thi.

**Muốn chạy được cả khi không có Internet?** Tải bản phát hành Pyodide 0.27.7 và
đặt vào `public/pyodide/v0.27.7/` (phải có `pyodide.js` và các tệp đi kèm).
Worker sẽ ưu tiên bản cùng máy chủ trước khi nghĩ tới CDN. Bước này **không bắt
buộc**.

> **Khi nâng phiên bản Pyodide:** sửa `PYODIDE_VERSION` trong
> `public/pyodide-worker.js` thì **bắt buộc** phải tính lại băm và thay vào
> `PYODIDE_LOADER_SHA384`. Lệnh tính nằm ngay trong chú thích của hằng số đó.
> Quên bước này thì Code Arena sẽ từ chối chạy — đúng như thiết kế.

### 6.4. CLI grader — chấm bài bằng Python thật

Grader chạy **cục bộ**, không có trên website tĩnh.

```bash
python grader/grade.py --help
```

Chạy bộ test của chính grader:

```bash
npm run test:grader
```

Grader chạy từng bài nộp trong tiến trình con tách biệt, có hạn thời gian, hạ cả
cây tiến trình con khi quá giờ và cắt output ở 64 KB mỗi luồng. Kết quả trả về
qua tệp JSON có `nonce`, không đi qua `stdout`, nên bài nộp in bậy không giả mạo
được điểm.

### 6.5. Notebook

**Cách dễ nhất — Google Colab:** mở `/notebooks` trên website rồi bấm nút Colab.
Không cần cài gì trên máy.

**Chạy tại máy:**

```bash
python -m pip install --disable-pip-version-check -r requirements-notebooks.txt
python -m pip install jupyterlab
python -m jupyterlab
```

> **Không sửa trực tiếp 8 tệp `.ipynb`.** Chúng được sinh ra từ
> `scripts/generate-notebooks.mjs`. Sửa generator rồi chạy lại:
> ```bash
> node scripts/generate-notebooks.mjs
> ```
> ID của từng cell sinh tất định, nên chạy hai lần không tạo khác biệt vô nghĩa
> trong Git.

### 6.6. Đo lại khối lượng tải của từng trang

```bash
npm run build:pages && npm run measure:payload
```

In ra bảng HTML / RSC / JS và tổng ở ba dạng: thô, gzip, brotli.

---

## 7. Học trên GitHub Codespaces (không cần cài gì trên máy)

1. Mở repository → nút **Code** → tab **Codespaces** → **Create codespace on main**.
2. Chờ container dựng xong. Cấu hình `.devcontainer/devcontainer.json` tự cài
   Node 22, Python 3.11, thư viện npm và thư viện Python.
3. Trong terminal của Codespace: `npm run dev`.
4. Cổng 3000 tự chuyển tiếp; bấm **Open in Browser**.

Codespaces tính vào hạn mức miễn phí hằng tháng của tài khoản. Nhớ **Stop
codespace** khi học xong.

---

## 8. Điều gì xảy ra tự động sau mỗi lần push

| Workflow | Khi nào chạy | Làm gì |
| --- | --- | --- |
| `CI` | Push hoặc pull request vào `main` | lint → typecheck → 53 test → validate notebook → test grader → audit → build Pages → kiểm artifact |
| `Deploy GitHub Pages` | Push vào `main` | Chạy lại toàn bộ kiểm tra rồi phát hành `dist/client` lên Pages |

Cả sáu action đều được ghim theo mã SHA đầy đủ thay vì theo nhãn phiên bản, nên
một bản cập nhật của bên thứ ba không thể âm thầm đổi hành vi bản dựng của bạn.

Nếu `CI` đỏ, **đừng bỏ qua**. Bản trên Pages sẽ giữ nguyên phiên bản tốt trước
đó, nhưng lỗi sẽ tích lại.

---

## 9. Xử lý sự cố

### 9.1. Website lên nhưng không có định dạng, hoặc ảnh 404

Repository không tên `voai-lab`. Hoặc đổi lại tên repository, hoặc sửa cả năm
chỗ ghi cứng `/voai-lab` đã liệt kê ở đầu tài liệu. Đổi tên repository là cách
nhanh và ít rủi ro hơn nhiều.

### 9.2. Workflow `Deploy GitHub Pages` hỏng ở bước `deploy`

Chưa bật Pages. Làm lại mục 4.3 rồi **Re-run all jobs**.

### 9.3. `npm ci` báo lỗi phiên bản Node

Node đang dùng thấp hơn 22.13.0. Kiểm tra bằng `node --version`, cài lại bản LTS
mới, **mở lại** cửa sổ terminal rồi chạy lại.

### 9.4. `python: command not found` trên Windows

Python chưa vào PATH. Cài lại và tích ô **Add python.exe to PATH**, hoặc thử
`py` thay cho `python`.

### 9.5. Code Arena báo “Không tải được Python”

Theo thứ tự: kiểm tra Internet → tắt trình chặn quảng cáo cho trang này → thử
trình duyệt khác. Nếu bạn vừa đổi `PYODIDE_VERSION`, hãy xem lại mục 6.3: gần
như chắc chắn bạn quên cập nhật băm.

### 9.6. Trang Assessment hiện tiêu đề nhưng thiếu đề bài

Chi tiết của 290 phiếu được tải theo tuần dưới dạng tệp JSON tĩnh. Nếu chúng
không lên được bản deploy, giao diện sẽ báo lỗi kèm nút **Thử tải lại** và
**không** làm mất bản nháp đang gõ. Kiểm tra bằng:

```bash
npm run build:pages && npm run test:pages
```

Bài kiểm tra `Pages export ships every assessment detail chunk…` phải xanh, và
`dist/client/data/assessments/` phải có đúng 42 tệp.

### 9.7. Mất tiến độ học

Tiến độ nằm trong localStorage của một trình duyệt cụ thể. Chế độ ẩn danh, xoá
dữ liệu website hoặc đổi máy đều làm mất. Hãy xuất JSON định kỳ từ trang Roadmap
và trang Assessment.

### 9.8. Git cảnh báo `LF will be replaced by CRLF`

Chỉ là cảnh báo về ký tự xuống dòng trên Windows, không phải lỗi, không ảnh
hưởng tới bản dựng.

---

## 10. Bảng kiểm cuối cùng

- [ ] Node ≥ 22.13.0, Python ≥ 3.11, Git đã cài và gọi được từ terminal
- [ ] `npm ci` chạy xong không lỗi
- [ ] `python -m pip install -r requirements-notebooks.txt` chạy xong
- [ ] Cả 9 lệnh ở mục 3 đều xanh
- [ ] Repository tên chính xác `voai-lab`, để **public**, nhánh `main`
- [ ] `public/data/assessments/`, `dist/`, `node_modules/` **không** bị commit
- [ ] Settings → Pages → Source = **GitHub Actions**
- [ ] Cả hai workflow trong tab Actions đều ✓
- [ ] Mở được `https://<tài-khoản>.github.io/voai-lab/` và trang có định dạng đầy đủ
- [ ] Đi hết 9 trang ở mục 5, mỗi trang thử được ít nhất một thao tác
- [ ] Code Arena chạy được một bài và báo “Đạt”
