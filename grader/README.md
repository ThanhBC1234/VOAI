# Bộ chấm cục bộ VOAI Lab

Bộ chấm này chạy bài Python trong một tiến trình con, giới hạn thời gian và chỉ
hiện tên test công khai. Đây là công cụ học trên máy cá nhân, **không phải
sandbox bảo mật cho mã không đáng tin**.

```powershell
python grader/grade.py vector-mean duong-dan/bai_lam.py --public
python grader/grade.py vector-mean duong-dan/bai_lam.py
python -m unittest grader/tests/test_grader.py
```

- `--public`: chỉ chạy test công khai để tự sửa.
- Không có `--public`: chạy cả test ẩn và chỉ báo nhóm lỗi.
- Điểm tự động tối đa 45/100. Phần giải thích, test tự viết, độ phức tạp, chất
  lượng code và sổ lỗi được chấm theo rubric trong `docs/QUY_TAC_SOLO_90.md`.
- Test ẩn trong bản phát hành cục bộ là một **rào cản học tập**, không thể chống
  người học chủ động mở mã nguồn. Khi dùng trong lớp, giáo viên nên giữ riêng
  `specs.json`.
