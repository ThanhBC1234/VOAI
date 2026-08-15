# Học VOAI Lab trực tuyến bằng GitHub

Tài liệu này dành cho repository công khai có tên chính xác là `voai-lab`. Bộ mã
nguồn dùng bốn môi trường bổ sung cho nhau:

| Môi trường | Dùng cho việc gì | Giới hạn cần nhớ |
| --- | --- | --- |
| GitHub Pages | Đọc lộ trình, bài giảng, assessment, dùng phòng lab và Code Arena | Chỉ phục vụ tệp tĩnh; không chạy grader Python phía máy chủ |
| GitHub Codespaces | Sửa mã, chạy website, notebook và grader trong VS Code trên web | Tính vào hạn mức Codespaces của tài khoản |
| Google Colab | Chạy tám notebook mà không cần cài Python trên máy | Runtime tạm thời; tài nguyên và phiên chạy không được bảo đảm |
| GitHub Actions | Tự kiểm tra và triển khai mỗi lần cập nhật `main` | Workflow có thể chạy ngay; bước deploy chỉ thành công sau khi repository bật GitHub Pages |

## 1. Đưa mã nguồn lên repository public

Tạo một repository **public**, để trống, tên chính xác `voai-lab`. Trước khi
thêm remote, kiểm tra commit sẽ phát hành; không dùng `git add .` một cách mù
quáng nếu thư mục còn draft hoặc bài làm cá nhân:

```powershell
git status --short
git log -1 --oneline
```

Sau khi các thay đổi cần phát hành đã nằm trong commit, thay
`<GITHUB_USERNAME>` bằng tên tài khoản rồi chạy:

```powershell
git remote add origin https://github.com/<GITHUB_USERNAME>/voai-lab.git
git branch -M main
git push -u origin main
```

Không đưa token, mật khẩu, `.env` hoặc khóa API vào Git. Dự án không cần secret
để build hoặc triển khai GitHub Pages.

Kho hiện chưa có tệp `LICENSE` vì chủ sở hữu chưa chọn giấy phép. Chế độ
`public` đủ để Pages/Colab đọc repository nhưng không tự cấp quyền cho người
khác sửa, phân phối hoặc tái sử dụng học liệu. Hãy chọn giấy phép riêng trước
khi gọi dự án là mã nguồn mở; không thêm một giấy phép ngẫu nhiên chỉ để đủ tệp.

## 2. Bật GitHub Pages một lần

1. Mở `Settings` → `Pages` của repository.
2. Trong `Build and deployment`, chọn `Source: GitHub Actions`.
3. Mở tab `Actions` và chạy lại workflow `Deploy GitHub Pages` nếu lần push đầu
   diễn ra trước khi Pages được bật.

Khi workflow thành công, địa chỉ mặc định là:

```text
https://<GITHUB_USERNAME>.github.io/voai-lab/
```

Artifact chứa HTML thật cho trang chủ và từng route. Nó không dùng mẹo chuyển
hướng `404.html` để giả lập SPA. Vì vậy các địa chỉ như
`/voai-lab/roadmap/`, `/voai-lab/lessons/` và
`/voai-lab/assessments/?session=w01-lab` vẫn mở được sau khi tải lại trang.

Workflow triển khai lấy URL thật từ `actions/configure-pages`, đặt đúng metadata
chia sẻ, build với prefix `/voai-lab`, kiểm artifact rồi mới phát hành. Các
GitHub Action trong repository được khóa theo commit SHA đã đối chiếu với tag
chính thức; Dependabot theo dõi cả npm, pip và GitHub Actions.

## 3. Học trong Codespaces

1. Mở repository → `Code` → `Codespaces` → `Create codespace on main`.
2. Chờ bước khởi tạo cài dependency npm và môi trường notebook Python.
3. Trong terminal, chạy `npm run dev`.
4. Mở preview của cổng `3000` khi Codespaces thông báo.

Dev container dùng Node 22, Python 3.11 đúng với metadata notebook và giữ cổng
preview ở chế độ private. CI đọc phiên bản Node chính xác từ `.nvmrc`.

Các lệnh kiểm tra quan trọng:

```bash
npm run lint
npm exec tsc -- --noEmit
npm test
python scripts/validate_notebooks.py
python -m unittest grader/tests/test_grader.py -v
npm run build:pages
node --test tests/pages-export.test.mjs
```

`grader/grade.py` chỉ là grader cục bộ có timeout, không phải sandbox an toàn để
chạy mã của người lạ. Chỉ chấm code của chính bạn trong Codespaces hoặc máy cá
nhân.

## 4. Mở notebook bằng Colab

Trang `/notebooks/` trên GitHub Pages tạo liên kết Colab từ chính biến
`github.repository`, nên không phải sửa cứng tên tài khoản. Mẫu URL chính thức
của Colab là:

```text
https://colab.research.google.com/github/<GITHUB_USERNAME>/voai-lab/blob/main/notebooks/<TEN_NOTEBOOK>.ipynb
```

Google lưu ý rằng máy ảo Colab không đi kèm khi chia sẻ notebook. Nếu notebook
cần thư viện ngoài baseline, hãy thêm cell cài đặt rõ phiên bản. Không lưu token
hoặc dữ liệu riêng tư trong output notebook trước khi commit.

## 5. CI và triển khai kiểm tra những gì

Workflow `CI` chạy trên push, pull request và khi bấm chạy thủ công:

- cài đúng `package-lock.json` bằng `npm ci`;
- cài baseline notebook đã khóa phiên bản;
- lint, type-check, build và kiểm HTML render;
- kiểm cấu trúc tám notebook và unit test grader;
- audit toàn bộ dependency, gồm cả build tool, ở mức `high` trở lên;
- build lại artifact Pages từ thư mục `dist` sạch và kiểm mọi route/asset.

Workflow `Deploy GitHub Pages` lặp lại các cổng chất lượng này trước khi upload
`dist/client`, sau đó deploy bằng environment `github-pages` với quyền tối thiểu
`pages: write` và `id-token: write`. Pull request từ bên ngoài không được cấp
quyền triển khai.

## 6. Ranh giới vận hành

- Tiến độ và attempt nằm trong `localStorage`. GitHub Pages, website Sites và
  trình duyệt khác không tự đồng bộ; hãy xuất JSON định kỳ.
- Mỗi lần chạy, Code Arena tạo Worker/Pyodide runtime mới từ bản 0.27.7 trên
  jsDelivr. Lượt đầu hoặc cache miss cần Internet và có thể tải khoảng 10 MB;
  cache HTTP có thể giảm tải lại nhưng không tái sử dụng state Python. Thời gian
  bootstrap runtime không nằm trong giới hạn chạy code 8 giây.
- “Kiểm tra mù” phía trình duyệt vẫn có thể đọc trong source/bundle. Đây là công
  cụ luyện tập, không phải bí mật chấm thi.
- GitHub Pages không chạy `grader/grade.py`. Hãy dùng Code Arena cho năm bài mẫu,
  Codespaces cho grader đầy đủ và Colab cho notebook.
- Nếu đổi tên repository, phải đổi đồng thời prefix `/voai-lab` trong cấu hình,
  workflow, test và tài liệu trước khi triển khai lại.

## 7. Xử lý lỗi thường gặp

| Hiện tượng | Kiểm tra |
| --- | --- |
| Pages báo 404 toàn site | Repository có tên `voai-lab`; Pages Source là GitHub Actions; workflow deploy đã xanh |
| Trang mở nhưng CSS/JS lỗi 404 | Artifact test phải xanh và URL phải chứa đúng một lần `/voai-lab/` |
| Tải lại route con bị 404 | Kiểm workflow đã upload bản build mới có `route/index.html`, không phải `dist` cũ |
| Code Arena không tải Python | Kiểm tra mạng có truy cập `cdn.jsdelivr.net`; thử tải lại sau khi hủy cache lỗi |
| Colab không mở notebook | Repository phải public; nhánh là `main`; tên file trong URL phải khớp chính xác |
| Codespace không hiện preview | Chạy `npm run dev`, mở tab `Ports` và kiểm cổng `3000` |

## Nguồn chính thức

- [GitHub Pages với custom workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Thiết lập dự án Node.js cho Codespaces](https://docs.github.com/en/codespaces/setting-up-your-project-for-codespaces/adding-a-dev-container-configuration/setting-up-your-nodejs-project-for-codespaces)
- [Build và test Node.js bằng GitHub Actions](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs)
- [`npm ci`](https://docs.npmjs.com/cli/v11/commands/npm-ci/)
- [Google Colab FAQ](https://research.google.com/colaboratory/faq.html)
- [Cơ chế URL GitHub của Open in Colab](https://github.com/googlecolab/open_in_colab)
