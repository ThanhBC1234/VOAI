"""CLI chấm bài SOLO-90 bằng public/private cases định nghĩa trong JSON.

Ranh giới tin cậy (GRADER-P1-01..03):

- Kết quả của worker đi qua **tệp envelope riêng**, không qua stdout. Bài nộp in
  gì ra màn hình cũng không đổi được điểm.
- Envelope phân biệt `returned` / `raised` / `harness_error`. Chỉ `raised` mới
  được đối chiếu với `raises` của spec.
- `raises` được so theo **MRO đầy đủ**, nên subclass hợp lệ của `ValueError` được
  chấp nhận, còn một class trùng tên ở module khác thì không.
- Timeout hạ cả cây tiến trình (xem `grader/proc.py`).
"""

from __future__ import annotations

import argparse
import copy
import json
import math
import sys
import tempfile
import uuid
from pathlib import Path

try:
    from grader.proc import CLEANUP_GRACE_SECONDS, run_guarded
except ModuleNotFoundError:  # chạy trực tiếp: `python grader/grade.py ...`
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
    from grader.proc import CLEANUP_GRACE_SECONDS, run_guarded

ROOT = Path(__file__).resolve().parent
WORKER = ROOT / "worker.py"
SPECS = ROOT / "specs.json"

#: Các category dùng để giải thích cho người học vì sao một case không đạt.
CATEGORY_TIMEOUT = "timeout"
CATEGORY_RUNTIME = "runtime"
CATEGORY_EXCEPTION = "exception"
CATEGORY_WRONG_ANSWER = "wrong-answer"


def equivalent(actual, expected, tolerance: float = 1e-8) -> bool:
    if isinstance(expected, float) and isinstance(actual, (int, float)):
        return math.isclose(float(actual), expected, rel_tol=tolerance, abs_tol=tolerance)
    if isinstance(expected, list) and isinstance(actual, (list, tuple)):
        return len(actual) == len(expected) and all(equivalent(a, e, tolerance) for a, e in zip(actual, expected))
    if isinstance(expected, dict) and isinstance(actual, dict):
        return actual.keys() == expected.keys() and all(equivalent(actual[key], value, tolerance) for key, value in expected.items())
    return actual == expected


def exception_matches(envelope: dict, expected: str) -> bool:
    """Khớp `raises` theo MRO đầy đủ thay vì so tên chuỗi tuyệt đối.

    - `"ValueError"` (không có dấu chấm) khớp với `builtins.ValueError` ở bất kỳ
      vị trí nào trong MRO, nên subclass do người học định nghĩa vẫn được nhận.
    - Tên có dấu chấm được so nguyên dạng với MRO đã định danh đầy đủ, dùng khi
      contract cần chỉ đúng một class cụ thể.
    """
    mro = envelope.get("mro") or []
    if not isinstance(mro, list):
        return False
    if "." in expected:
        return expected in mro
    return f"builtins.{expected}" in mro


def run_case(submission: Path, function: str, case: dict, timeout: float) -> tuple[bool, str]:
    """Chạy một case và trả về (đạt hay không, category giải thích)."""
    with tempfile.TemporaryDirectory(prefix="voai-grader-") as workspace:
        result_path = Path(workspace) / f"result-{uuid.uuid4().hex}.json"
        nonce = uuid.uuid4().hex
        payload = {
            "submission": str(submission),
            "function": function,
            "args": copy.deepcopy(case.get("args", [])),
            "kwargs": copy.deepcopy(case.get("kwargs", {})),
            "resultPath": str(result_path),
            "nonce": nonce,
        }

        outcome = run_guarded(
            [sys.executable, "-I", str(WORKER)],
            json.dumps(payload, ensure_ascii=False),
            timeout=timeout,
        )
        if outcome.status == "timeout":
            return False, CATEGORY_TIMEOUT

        # Thiếu envelope hoặc envelope hỏng đều là lỗi runtime, không phải lỗi của bài.
        try:
            envelope = json.loads(result_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return False, CATEGORY_RUNTIME
        if not isinstance(envelope, dict) or envelope.get("nonce") != nonce:
            return False, CATEGORY_RUNTIME

        result_outcome = envelope.get("outcome")
        expected_error = case.get("raises")

        if result_outcome == "harness_error":
            return False, CATEGORY_RUNTIME

        if result_outcome == "raised":
            if not expected_error:
                return False, CATEGORY_RUNTIME
            return exception_matches(envelope, expected_error), CATEGORY_EXCEPTION

        if result_outcome != "returned":
            return False, CATEGORY_RUNTIME

        # Worker thoát bất thường dù đã ghi envelope: coi là lỗi runtime.
        if outcome.returncode not in (0, None):
            return False, CATEGORY_RUNTIME

        if expected_error:
            # Spec đòi ném exception nhưng hàm lại trả về giá trị.
            return False, CATEGORY_EXCEPTION

        return (
            equivalent(envelope.get("value"), case.get("expected"), case.get("tolerance", 1e-8)),
            CATEGORY_WRONG_ANSWER,
        )


def grade(task_id: str, submission: Path, public_only: bool = False, timeout: float = 5.0) -> dict:
    specs = json.loads(SPECS.read_text(encoding="utf-8"))
    if task_id not in specs:
        raise KeyError(f"Không có task '{task_id}'")
    spec = specs[task_id]
    cases = list(spec["public"])
    if not public_only:
        cases.extend(spec["private"])
    results = []
    for index, case in enumerate(cases):
        passed, category = run_case(submission, spec["function"], case, timeout)
        is_private = index >= len(spec["public"])
        results.append({
            "name": "Test ẩn" if is_private else case["name"],
            "passed": passed,
            "category": "đạt" if passed else category,
        })
    passed_count = sum(item["passed"] for item in results)
    return {
        "task": task_id,
        "passed": passed_count,
        "total": len(results),
        "correctnessPoints": round(45 * passed_count / max(1, len(results)), 1),
        "results": results,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Chấm bài Python VOAI Lab")
    parser.add_argument("task_id")
    parser.add_argument("submission", type=Path)
    parser.add_argument("--public", action="store_true", help="Chỉ chạy test công khai")
    parser.add_argument(
        "--timeout",
        type=float,
        default=5.0,
        help=f"Giới hạn mỗi case, tính bằng giây (cộng thêm tối đa {CLEANUP_GRACE_SECONDS}s dọn dẹp)",
    )
    args = parser.parse_args()
    submission = args.submission.resolve()
    if not submission.is_file():
        parser.error(f"Không tìm thấy bài làm: {submission}")
    try:
        report = grade(args.task_id, submission, args.public, args.timeout)
    except KeyError as error:
        parser.error(str(error))
    print(f"{report['passed']}/{report['total']} test đạt — {report['correctnessPoints']}/45 điểm correctness")
    for item in report["results"]:
        marker = "✓" if item["passed"] else "×"
        print(f"{marker} {item['name']}: {item['category']}")
    return 0 if report["passed"] == report["total"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
