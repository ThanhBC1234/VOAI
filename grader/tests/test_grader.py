from __future__ import annotations

import os
import sys
import tempfile
import textwrap
import time
import unittest
from pathlib import Path

from grader.grade import equivalent, grade, run_case

SPEC_FUNCTION = "safe_mean"


def write(folder: str, source: str) -> Path:
    submission = Path(folder) / "answer.py"
    submission.write_text(textwrap.dedent(source), encoding="utf-8")
    return submission


class EquivalenceTests(unittest.TestCase):
    def test_nested_float_equivalence(self):
        self.assertTrue(equivalent({"x": [0.3]}, {"x": [0.3000000001]}, 1e-8))


class SubmissionGradingTests(unittest.TestCase):
    def test_correct_submission_passes(self):
        with tempfile.TemporaryDirectory() as folder:
            submission = write(folder, """
                def safe_mean(values):
                    if not values:
                        raise ValueError("empty")
                    total = 0.0
                    for value in values:
                        total += value
                    return total / len(values)
            """)
            report = grade("vector-mean", submission)
            self.assertEqual(report["passed"], report["total"])

    def test_wrong_submission_fails(self):
        with tempfile.TemporaryDirectory() as folder:
            submission = write(folder, "def safe_mean(values): return 0\n")
            report = grade("vector-mean", submission)
            self.assertLess(report["passed"], report["total"])


class ResultEnvelopeTests(unittest.TestCase):
    """GRADER-P1-01: lỗi của harness không bao giờ được tính là exception của bài."""

    def test_unserializable_result_is_harness_error_not_expected_exception(self):
        # Hàm trả về list tự tham chiếu: json.dumps ném ValueError *trong harness*.
        # Case mong ValueError phải TRƯỢT, vì bài không hề ném ValueError.
        with tempfile.TemporaryDirectory() as folder:
            submission = write(folder, """
                def safe_mean(values):
                    cycle = []
                    cycle.append(cycle)
                    return cycle
            """)
            passed, category = run_case(
                submission, SPEC_FUNCTION, {"args": [[]], "raises": "ValueError"}, 5.0
            )
            self.assertFalse(passed, "Lỗi serialize của harness bị tính là ValueError của bài")
            self.assertEqual(category, "runtime")

    def test_subclass_of_expected_exception_passes(self):
        # GRADER-P1-01: subclass hợp lệ của ValueError phải được chấp nhận.
        with tempfile.TemporaryDirectory() as folder:
            submission = write(folder, """
                class EmptyInputError(ValueError):
                    pass

                def safe_mean(values):
                    raise EmptyInputError("empty")
            """)
            passed, _ = run_case(
                submission, SPEC_FUNCTION, {"args": [[]], "raises": "ValueError"}, 5.0
            )
            self.assertTrue(passed, "Subclass hợp lệ của ValueError bị chấm trượt")

    def test_unrelated_exception_with_same_name_is_rejected(self):
        # Không được đánh đồng chỉ vì trùng __name__ ở module khác.
        with tempfile.TemporaryDirectory() as folder:
            submission = write(folder, """
                class ValueError(Exception):  # noqa: A001 - cố ý che tên builtin
                    pass

                def safe_mean(values):
                    raise ValueError("giả mạo")
            """)
            passed, _ = run_case(
                submission, SPEC_FUNCTION, {"args": [[]], "raises": "ValueError"}, 5.0
            )
            self.assertFalse(passed, "Class trùng tên nhưng không phải builtins.ValueError vẫn được chấp nhận")

    def test_wrong_exception_type_fails(self):
        with tempfile.TemporaryDirectory() as folder:
            submission = write(folder, """
                def safe_mean(values):
                    raise TypeError("sai loại")
            """)
            passed, _ = run_case(
                submission, SPEC_FUNCTION, {"args": [[]], "raises": "ValueError"}, 5.0
            )
            self.assertFalse(passed)

    def test_import_error_is_runtime_not_expected_exception(self):
        # Lỗi lúc nạp module là harness/runtime error, không thỏa `raises`.
        with tempfile.TemporaryDirectory() as folder:
            submission = write(folder, """
                raise ValueError("nổ ngay khi import")

                def safe_mean(values):
                    return 0
            """)
            passed, category = run_case(
                submission, SPEC_FUNCTION, {"args": [[]], "raises": "ValueError"}, 5.0
            )
            self.assertFalse(passed, "Lỗi import bị tính là exception của bài")
            self.assertEqual(category, "runtime")

    def test_missing_function_is_runtime_error(self):
        with tempfile.TemporaryDirectory() as folder:
            submission = write(folder, "def other_name(values): return 1\n")
            passed, category = run_case(
                submission, SPEC_FUNCTION, {"args": [[1]], "expected": 1}, 5.0
            )
            self.assertFalse(passed)
            self.assertEqual(category, "runtime")


class StdoutIsolationTests(unittest.TestCase):
    """GRADER-P1-03: stdout/stderr của bài không được điều khiển kết quả."""

    def test_print_without_newline_does_not_break_correct_submission(self):
        with tempfile.TemporaryDirectory() as folder:
            submission = write(folder, """
                import sys

                def safe_mean(values):
                    print("debug", end="")
                    sys.stderr.write("ghi chú stderr\\n")
                    if not values:
                        raise ValueError("empty")
                    return sum(values) / len(values)
            """)
            report = grade("vector-mean", submission)
            self.assertEqual(report["passed"], report["total"], "print() làm bài đúng bị chấm trượt")

    def test_atexit_output_does_not_break_result(self):
        with tempfile.TemporaryDirectory() as folder:
            submission = write(folder, """
                import atexit

                atexit.register(lambda: print("rác lúc thoát"))

                def safe_mean(values):
                    if not values:
                        raise ValueError("empty")
                    return sum(values) / len(values)
            """)
            report = grade("vector-mean", submission)
            self.assertEqual(report["passed"], report["total"], "Output atexit phá kết quả")

    def test_forged_json_on_stdout_cannot_control_result(self):
        # Bài in ra một envelope giả để cố ép kết quả đúng.
        with tempfile.TemporaryDirectory() as folder:
            submission = write(folder, """
                print('{"outcome": "returned", "value": 4.0}')
                print('{"ok": true, "result": 4.0}')

                def safe_mean(values):
                    return -999
            """)
            passed, _ = run_case(
                submission, SPEC_FUNCTION, {"args": [[2, 4, 6]], "expected": 4.0}, 5.0
            )
            self.assertFalse(passed, "Output giả mạo trên stdout điều khiển được kết quả chấm")

    def test_huge_output_is_capped_and_case_still_completes(self):
        # ARENA-P2-02 (phía CLI): output khổng lồ không được làm treo hoặc ngốn RAM.
        with tempfile.TemporaryDirectory() as folder:
            submission = write(folder, """
                def safe_mean(values):
                    for _ in range(20000):
                        print("x" * 200)
                    if not values:
                        raise ValueError("empty")
                    return sum(values) / len(values)
            """)
            started = time.monotonic()
            passed, _ = run_case(
                submission, SPEC_FUNCTION, {"args": [[2, 4, 6]], "expected": 4.0}, 15.0
            )
            self.assertTrue(passed, "Bài đúng nhưng in nhiều bị chấm trượt")
            self.assertLess(time.monotonic() - started, 15.0)


class TimeoutTests(unittest.TestCase):
    """GRADER-P1-02: timeout phải hạ cả cây tiến trình."""

    def test_timeout_is_reported(self):
        with tempfile.TemporaryDirectory() as folder:
            submission = write(folder, """
                import time

                def safe_mean(values):
                    time.sleep(30)
                    return 0
            """)
            started = time.monotonic()
            passed, category = run_case(
                submission, SPEC_FUNCTION, {"args": [[1]], "expected": 1}, 1.0
            )
            elapsed = time.monotonic() - started
            self.assertFalse(passed)
            self.assertEqual(category, "timeout")
            self.assertLess(elapsed, 8.0, f"Timeout mất quá lâu: {elapsed:.2f}s")

    def test_timeout_kills_descendant_processes(self):
        with tempfile.TemporaryDirectory() as folder:
            marker = Path(folder) / "child-marker.txt"
            submission = write(folder, f"""
                import subprocess
                import sys
                import time

                MARKER = {str(marker)!r}

                CHILD = (
                    "import time, pathlib; time.sleep(6); "
                    "pathlib.Path({{!r}}).write_text('child sống sót', encoding='utf-8')"
                ).format(MARKER)

                def safe_mean(values):
                    subprocess.Popen([sys.executable, "-c", CHILD])
                    time.sleep(30)
                    return 0
            """)
            passed, category = run_case(
                submission, SPEC_FUNCTION, {"args": [[1]], "expected": 1}, 1.0
            )
            self.assertFalse(passed)
            self.assertEqual(category, "timeout")
            # Con phải chết cùng cha; chờ quá mốc nó định ghi marker.
            time.sleep(8)
            self.assertFalse(
                marker.exists(),
                "Tiến trình con vẫn sống sau timeout và đã ghi marker",
            )


class ContractCoverageTests(unittest.TestCase):
    """GRADER-P2-01: mỗi rule của contract phải có ít nhất một bài vi phạm bị trượt."""

    REFERENCE = """
        def safe_mean(values):
            if not values:
                raise ValueError("rỗng")
            total = 0.0
            for v in values:
                total += v
            return total / len(values)

        def linear_predict(X, weights, bias):
            out = []
            for row in X:
                if len(row) != len(weights):
                    raise ValueError("sai chiều")
                out.append(sum(a * b for a, b in zip(row, weights)) + bias)
            return out

        def knn_vote(neighbors, k):
            if not neighbors or not isinstance(k, int) or k < 1 or k > len(neighbors):
                raise ValueError("k không hợp lệ")
            nearest = sorted(neighbors, key=lambda item: item[0])[:k]
            tally = {}
            for distance, label in nearest:
                count, total = tally.get(label, (0, 0.0))
                tally[label] = (count + 1, total + distance)
            return sorted(tally.items(), key=lambda kv: (-kv[1][0], kv[1][1], kv[0]))[0][0]

        def binary_metrics(y_true, y_pred):
            if not y_true or len(y_true) != len(y_pred):
                raise ValueError("đầu vào không hợp lệ")
            tp = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 1)
            fp = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 1)
            fn = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 0)
            tn = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 0)
            precision = tp / (tp + fp) if tp + fp else 0.0
            recall = tp / (tp + fn) if tp + fn else 0.0
            f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
            return {"accuracy": (tp + tn) / len(y_true), "precision": precision, "recall": recall, "f1": f1}

        def conv2d_valid(image, kernel):
            if not image or not kernel or not image[0] or not kernel[0]:
                raise ValueError("đầu vào rỗng")
            if any(len(r) != len(image[0]) for r in image) or any(len(r) != len(kernel[0]) for r in kernel):
                raise ValueError("hàng ragged")
            kh, kw, h, w = len(kernel), len(kernel[0]), len(image), len(image[0])
            if kh > h or kw > w:
                raise ValueError("kernel lớn hơn ảnh")
            return [[sum(image[i+a][j+b]*kernel[a][b] for a in range(kh) for b in range(kw))
                     for j in range(w-kw+1)] for i in range(h-kh+1)]
    """

    def grade_source(self, task: str, source: str) -> dict:
        with tempfile.TemporaryDirectory() as folder:
            return grade(task, write(folder, source))

    def test_reference_implementation_passes_every_task(self):
        for task in ("vector-mean", "linear-predict", "knn-vote", "binary-metrics", "conv-valid"):
            with self.subTest(task=task):
                report = self.grade_source(task, self.REFERENCE)
                self.assertEqual(report["passed"], report["total"], f"{task}: {report['results']}")

    def test_each_deliberate_violation_is_rejected(self):
        violations = [
            # (task, mô tả rule bị vi phạm, mã nguồn)
            ("vector-mean", "không ném ValueError khi rỗng",
             "def safe_mean(values):\n    if not values:\n        return 0.0\n    return sum(values)/len(values)\n"),
            ("linear-predict", "không kiểm tra sai số chiều",
             "def linear_predict(X, weights, bias):\n    return [sum(a*b for a,b in zip(r,weights))+bias for r in X]\n"),
            ("knn-vote", "không chặn k không hợp lệ",
             "def knn_vote(neighbors, k):\n    n=sorted(neighbors)[:k]\n    return max(set(l for _,l in n), key=[l for _,l in n].count) if n else 'A'\n"),
            ("knn-vote", "phá tie-break theo thứ tự từ điển",
             "def knn_vote(neighbors, k):\n"
             "    if not neighbors or k<1 or k>len(neighbors):\n        raise ValueError('k')\n"
             "    n=sorted(neighbors, key=lambda i:i[0])[:k]\n"
             "    return sorted({l for _,l in n})[-1]\n"),
            ("binary-metrics", "không chặn độ dài khác nhau",
             "def binary_metrics(y_true, y_pred):\n"
             "    if not y_true:\n        raise ValueError('rỗng')\n"
             "    tp=sum(1 for t,p in zip(y_true,y_pred) if t==1 and p==1)\n"
             "    fp=sum(1 for t,p in zip(y_true,y_pred) if t==0 and p==1)\n"
             "    fn=sum(1 for t,p in zip(y_true,y_pred) if t==1 and p==0)\n"
             "    tn=sum(1 for t,p in zip(y_true,y_pred) if t==0 and p==0)\n"
             "    pr=tp/(tp+fp) if tp+fp else 0.0\n    rc=tp/(tp+fn) if tp+fn else 0.0\n"
             "    return {'accuracy':(tp+tn)/len(y_true),'precision':pr,'recall':rc,"
             "'f1':2*pr*rc/(pr+rc) if pr+rc else 0.0}\n"),
            ("binary-metrics", "chia cho 0 thay vì trả 0.0",
             "def binary_metrics(y_true, y_pred):\n"
             "    if not y_true or len(y_true)!=len(y_pred):\n        raise ValueError('x')\n"
             "    tp=sum(1 for t,p in zip(y_true,y_pred) if t==1 and p==1)\n"
             "    fp=sum(1 for t,p in zip(y_true,y_pred) if t==0 and p==1)\n"
             "    fn=sum(1 for t,p in zip(y_true,y_pred) if t==1 and p==0)\n"
             "    tn=sum(1 for t,p in zip(y_true,y_pred) if t==0 and p==0)\n"
             "    pr=tp/(tp+fp)\n    rc=tp/(tp+fn)\n"
             "    return {'accuracy':(tp+tn)/len(y_true),'precision':pr,'recall':rc,'f1':2*pr*rc/(pr+rc)}\n"),
            ("conv-valid", "không chặn kernel lớn hơn ảnh và hàng ragged",
             "def conv2d_valid(image, kernel):\n"
             "    kh,kw,h,w=len(kernel),len(kernel[0]),len(image),len(image[0])\n"
             "    return [[sum(image[i+a][j+b]*kernel[a][b] for a in range(kh) for b in range(kw))\n"
             "             for j in range(w-kw+1)] for i in range(h-kh+1)]\n"),
            ("conv-valid", "lật kernel (làm convolution thay vì cross-correlation)",
             "def conv2d_valid(image, kernel):\n"
             "    if not image or not kernel or not image[0] or not kernel[0]:\n        raise ValueError('rỗng')\n"
             "    if any(len(r)!=len(image[0]) for r in image):\n        raise ValueError('ragged')\n"
             "    kh,kw,h,w=len(kernel),len(kernel[0]),len(image),len(image[0])\n"
             "    if kh>h or kw>w:\n        raise ValueError('lớn')\n"
             "    f=[row[::-1] for row in kernel[::-1]]\n"
             "    return [[sum(image[i+a][j+b]*f[a][b] for a in range(kh) for b in range(kw))\n"
             "             for j in range(w-kw+1)] for i in range(h-kh+1)]\n"),
        ]
        for task, rule, source in violations:
            with self.subTest(task=task, rule=rule):
                report = self.grade_source(task, source)
                self.assertLess(
                    report["passed"],
                    report["total"],
                    f"{task}: bài vi phạm '{rule}' vẫn được chấm đạt toàn bộ",
                )


if __name__ == "__main__":
    unittest.main()
