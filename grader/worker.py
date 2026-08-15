"""Worker tối giản: nhận payload JSON từ stdin, gọi một hàm trong bài nộp."""

from __future__ import annotations

import importlib.util
import json
import math
import sys
import traceback
from pathlib import Path


def json_safe(value):
    if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
        return repr(value)
    if isinstance(value, tuple):
        return list(value)
    return value


def main() -> int:
    payload = json.load(sys.stdin)
    submission = Path(payload["submission"]).resolve()
    spec = importlib.util.spec_from_file_location("student_submission", submission)
    if spec is None or spec.loader is None:
        raise RuntimeError("Không thể nạp tệp bài làm")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    function = getattr(module, payload["function"])
    try:
        result = function(*payload.get("args", []), **payload.get("kwargs", {}))
        print(json.dumps({"ok": True, "result": json_safe(result)}, ensure_ascii=False))
    except Exception as error:  # lỗi là dữ liệu chấm, không phải lỗi của worker
        print(json.dumps({"ok": False, "errorType": type(error).__name__, "message": str(error)}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(json.dumps({"workerError": type(error).__name__, "message": str(error), "trace": traceback.format_exc(limit=2)}, ensure_ascii=False))
        raise SystemExit(2)
