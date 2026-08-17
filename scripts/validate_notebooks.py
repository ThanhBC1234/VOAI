"""Kiểm tra cấu trúc 8 notebook giảng dạy trước khi phát hành.

Hai điểm đã được sửa sau audit:

- NOTEBOOK-P2-02: script cũ dùng `assert` để kiểm dữ liệu. Chạy bằng `python -O`
  sẽ **loại bỏ toàn bộ assert**, nên notebook sai metadata vẫn được báo hợp lệ.
  Nay mọi kiểm tra đều là điều kiện tường minh, gom lỗi lại rồi thoát với mã
  khác 0.
- NOTEBOOK-P2-01: kiểm tra `id` của cell theo đúng nbformat 4.5 (chuỗi 1–64 ký
  tự thuộc [a-zA-Z0-9-_], duy nhất trong mỗi notebook). Nếu thư viện `nbformat`
  có mặt thì dùng luôn schema chính thức; nếu không thì các kiểm tra tương đương
  bên dưới vẫn chạy đầy đủ.

Script này chỉ kiểm *cấu trúc*: nó không thực thi cell và không xác nhận đáp án.
"""

from __future__ import annotations

import ast
import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
#: Cho phép trỏ sang thư mục khác để test validator trên fixture cố ý sai.
NOTEBOOK_DIR = Path(os.environ.get("VOAI_NOTEBOOK_DIR") or (ROOT / "notebooks"))

EXPECTED_NAMES = {
    "00_khoi_dong_va_diagnostic.ipynb",
    "01_numpy_linear_regression.ipynb",
    "02_classical_ml_pipeline.ipynb",
    "03_mlp_backprop_pytorch.ipynb",
    "04_computer_vision_cnn.ipynb",
    "05_nlp_attention.ipynb",
    "06_audio_stft_mel.ipynb",
    "07_mock_voai_end_to_end.ipynb",
}

#: nbformat 4.5: id là chuỗi 1–64 ký tự, chỉ gồm chữ, số, gạch ngang, gạch dưới.
CELL_ID_PATTERN = re.compile(r"^[a-zA-Z0-9\-_]{1,64}$")

REQUIRED_MARKERS = ("TODO", "Visible tests", "Exit ticket")


def validate_notebook(path: Path, errors: list[str]) -> None:
    label = path.name

    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        errors.append(f"{label}: không đọc được JSON — {error}")
        return

    if data.get("nbformat") != 4:
        errors.append(f"{label}: nbformat phải là 4, đang là {data.get('nbformat')!r}")

    minor = data.get("nbformat_minor")
    if not isinstance(minor, int) or minor < 0:
        errors.append(f"{label}: nbformat_minor không hợp lệ ({minor!r})")

    metadata = data.get("metadata") or {}
    voai = metadata.get("voai_lab") or {}
    if voai.get("solo90") is not True:
        errors.append(f"{label}: metadata.voai_lab.solo90 phải là true, đang là {voai.get('solo90')!r}")

    cells = data.get("cells")
    if not isinstance(cells, list):
        errors.append(f"{label}: thiếu danh sách cells")
        return
    if len(cells) < 10:
        errors.append(f"{label}: chỉ có {len(cells)} cell, cần tối thiểu 10")
    if not any(cell.get("cell_type") == "code" for cell in cells):
        errors.append(f"{label}: không có cell code nào")

    # nbformat >= 4.5 bắt buộc mọi cell có id hợp lệ và duy nhất.
    requires_ids = isinstance(minor, int) and minor >= 5
    seen_ids: set[str] = set()

    for index, cell in enumerate(cells):
        if requires_ids:
            cell_id = cell.get("id")
            if not isinstance(cell_id, str) or not CELL_ID_PATTERN.match(cell_id):
                errors.append(f"{label}: cell {index} có id không hợp lệ ({cell_id!r})")
            elif cell_id in seen_ids:
                errors.append(f"{label}: cell {index} có id trùng ({cell_id!r})")
            else:
                seen_ids.add(cell_id)

        if cell.get("cell_type") != "code":
            continue

        source = "".join(cell.get("source", []))
        try:
            ast.parse(source, filename=f"{label}:cell-{index}")
        except SyntaxError as error:
            errors.append(f"{label}: lỗi cú pháp Python ở cell {index} — {error}")

        if cell.get("execution_count") is not None:
            errors.append(f"{label}: cell {index} còn execution_count, notebook khởi đầu phải sạch")
        if cell.get("outputs", []):
            errors.append(f"{label}: cell {index} còn output đã lưu, notebook khởi đầu phải sạch")

    text = "".join("".join(cell.get("source", [])) for cell in cells)
    for marker in REQUIRED_MARKERS:
        if marker not in text:
            errors.append(f"{label}: thiếu phần bắt buộc {marker!r}")

    # Nếu có nbformat thật thì đối chiếu thêm bằng schema chính thức.
    try:
        import nbformat  # type: ignore[import-not-found]
    except ImportError:
        return
    try:
        nbformat.validate(nbformat.reads(json.dumps(data), as_version=4))
    except Exception as error:  # noqa: BLE001 - mọi lỗi schema đều cần báo
        errors.append(f"{label}: nbformat.validate thất bại — {error}")


def main() -> int:
    if not NOTEBOOK_DIR.is_dir():
        print(f"Không tìm thấy thư mục notebooks: {NOTEBOOK_DIR}", file=sys.stderr)
        return 1

    files = sorted(NOTEBOOK_DIR.glob("*.ipynb"))
    actual_names = {path.name for path in files}
    errors: list[str] = []

    missing = sorted(EXPECTED_NAMES - actual_names)
    unexpected = sorted(actual_names - EXPECTED_NAMES)
    if missing:
        errors.append(f"Thiếu notebook: {missing}")
    if unexpected:
        errors.append(f"Notebook lạ: {unexpected}")

    for path in files:
        validate_notebook(path, errors)

    if errors:
        print(f"Notebook không hợp lệ ({len(errors)} lỗi):", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
        return 1

    print(f"Validated {len(files)} notebooks")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
