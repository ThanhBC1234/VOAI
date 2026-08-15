"""CLI chấm bài SOLO-90 bằng public/private cases định nghĩa trong JSON."""

from __future__ import annotations

import argparse
import copy
import json
import math
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
WORKER = ROOT / "worker.py"
SPECS = ROOT / "specs.json"


def equivalent(actual, expected, tolerance: float = 1e-8) -> bool:
    if isinstance(expected, float) and isinstance(actual, (int, float)):
        return math.isclose(float(actual), expected, rel_tol=tolerance, abs_tol=tolerance)
    if isinstance(expected, list) and isinstance(actual, (list, tuple)):
        return len(actual) == len(expected) and all(equivalent(a, e, tolerance) for a, e in zip(actual, expected))
    if isinstance(expected, dict) and isinstance(actual, dict):
        return actual.keys() == expected.keys() and all(equivalent(actual[key], value, tolerance) for key, value in expected.items())
    return actual == expected


def run_case(submission: Path, function: str, case: dict, timeout: float) -> tuple[bool, str]:
    payload = {
        "submission": str(submission),
        "function": function,
        "args": copy.deepcopy(case.get("args", [])),
        "kwargs": copy.deepcopy(case.get("kwargs", {})),
    }
    try:
        process = subprocess.run(
            [sys.executable, "-I", str(WORKER)],
            input=json.dumps(payload, ensure_ascii=False),
            text=True,
            capture_output=True,
            timeout=timeout,
            check=False,
        )
    except subprocess.TimeoutExpired:
        return False, "timeout"
    try:
        response = json.loads(process.stdout.strip().splitlines()[-1])
    except (json.JSONDecodeError, IndexError):
        return False, "runtime"
    if "workerError" in response:
        return False, "runtime"
    expected_error = case.get("raises")
    if expected_error:
        return (not response.get("ok") and response.get("errorType") == expected_error), "exception"
    if not response.get("ok"):
        return False, "runtime"
    return equivalent(response.get("result"), case.get("expected"), case.get("tolerance", 1e-8)), "wrong-answer"


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
    parser.add_argument("--timeout", type=float, default=5.0)
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
