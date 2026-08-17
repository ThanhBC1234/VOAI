"""Worker: nạp bài nộp, gọi đúng một hàm, ghi envelope kết quả ra kênh riêng.

Giao thức (GRADER-P1-03): kết quả **không bao giờ** đi qua stdout/stderr. Worker
ghi một tệp JSON vào đường dẫn do grader chỉ định, kèm `nonce` ngẫu nhiên để bài
nộp không thể giả mạo envelope bằng cách in ra màn hình. stdout/stderr chỉ còn là
log của người học.

Envelope phân biệt ba kết cục (GRADER-P1-01):

- `returned`      — hàm chạy xong và trả về giá trị serialize được;
- `raised`        — hàm **của bài** ném exception; chỉ trạng thái này mới được so
                    với `raises` trong spec;
- `harness_error` — lỗi của chính hệ thống chấm (nạp module, gọi sai tên hàm,
                    serialize kết quả, hỏng giao thức). Không bao giờ thỏa `raises`.
"""

from __future__ import annotations

import importlib.util
import json
import math
import os
import sys
import traceback
from pathlib import Path

OUTCOME_RETURNED = "returned"
OUTCOME_RAISED = "raised"
OUTCOME_HARNESS_ERROR = "harness_error"

MAX_MESSAGE_CHARS = 2000


def json_safe(value, _seen: frozenset[int] = frozenset()):
    """Chuẩn hóa giá trị trả về sang dạng JSON được, phát hiện tham chiếu vòng."""
    if isinstance(value, float):
        return repr(value) if (math.isnan(value) or math.isinf(value)) else value
    if isinstance(value, (list, tuple)):
        if id(value) in _seen:
            raise ValueError("Giá trị trả về có tham chiếu vòng nên không serialize được")
        nested = _seen | {id(value)}
        return [json_safe(item, nested) for item in value]
    if isinstance(value, dict):
        if id(value) in _seen:
            raise ValueError("Giá trị trả về có tham chiếu vòng nên không serialize được")
        nested = _seen | {id(value)}
        return {str(key): json_safe(item, nested) for key, item in value.items()}
    return value


def describe_exception(error: BaseException) -> dict:
    """Mô tả exception kèm MRO đầy đủ để grader nhận đúng subclass."""
    mro = []
    for cls in type(error).__mro__:
        module = getattr(cls, "__module__", "") or ""
        mro.append(f"{module}.{cls.__qualname__}" if module else cls.__qualname__)
    return {
        "type": type(error).__name__,
        "qualifiedType": mro[0] if mro else type(error).__name__,
        "mro": mro,
        "message": str(error)[:MAX_MESSAGE_CHARS],
    }


def emit(result_path: str, nonce: str, envelope: dict) -> None:
    """Ghi envelope một cách nguyên tử; json.dumps chạy trước khi chạm tệp."""
    body = json.dumps({**envelope, "nonce": nonce}, ensure_ascii=False)
    temporary = f"{result_path}.part"
    with open(temporary, "w", encoding="utf-8") as handle:
        handle.write(body)
        handle.flush()
        os.fsync(handle.fileno())
    os.replace(temporary, result_path)


def main() -> int:
    payload = json.loads(sys.stdin.read())
    result_path = payload["resultPath"]
    nonce = payload["nonce"]

    # Giai đoạn 1 — nạp module và lấy hàm. Mọi lỗi ở đây là lỗi của hệ thống chấm.
    try:
        submission = Path(payload["submission"]).resolve()
        spec = importlib.util.spec_from_file_location("student_submission", submission)
        if spec is None or spec.loader is None:
            raise RuntimeError("Không thể nạp tệp bài làm")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        function = getattr(module, payload["function"])
    except BaseException as error:  # noqa: BLE001 - phải bắt hết để báo đúng loại lỗi
        emit(result_path, nonce, {
            "outcome": OUTCOME_HARNESS_ERROR,
            "stage": "load",
            "trace": traceback.format_exc(limit=3),
            **describe_exception(error),
        })
        return 0

    # Giai đoạn 2 — gọi hàm. CHỈ exception ở đây mới được so với `raises`.
    try:
        value = function(*payload.get("args", []), **payload.get("kwargs", {}))
    except Exception as error:
        emit(result_path, nonce, {"outcome": OUTCOME_RAISED, **describe_exception(error)})
        return 0
    except BaseException as error:  # SystemExit/KeyboardInterrupt: không phải lỗi bài
        emit(result_path, nonce, {
            "outcome": OUTCOME_HARNESS_ERROR,
            "stage": "call",
            **describe_exception(error),
        })
        return 0

    # Giai đoạn 3 — serialize. Lỗi ở đây KHÔNG phải exception của bài.
    try:
        emit(result_path, nonce, {"outcome": OUTCOME_RETURNED, "value": json_safe(value)})
    except BaseException as error:  # noqa: BLE001
        emit(result_path, nonce, {
            "outcome": OUTCOME_HARNESS_ERROR,
            "stage": "serialize",
            **describe_exception(error),
        })
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except SystemExit:
        raise
    except BaseException:  # noqa: BLE001 - hết kênh an toàn, để grader bắt qua return code
        traceback.print_exc(file=sys.stderr)
        raise SystemExit(2)
