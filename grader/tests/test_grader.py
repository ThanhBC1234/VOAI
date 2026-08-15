from __future__ import annotations

import tempfile
import textwrap
import unittest
from pathlib import Path

from grader.grade import equivalent, grade


class GraderTests(unittest.TestCase):
    def test_nested_float_equivalence(self):
        self.assertTrue(equivalent({"x": [0.3]}, {"x": [0.3000000001]}, 1e-8))

    def test_correct_submission_passes(self):
        with tempfile.TemporaryDirectory() as folder:
            submission = Path(folder) / "answer.py"
            submission.write_text(textwrap.dedent("""
                def safe_mean(values):
                    if not values:
                        raise ValueError("empty")
                    total = 0.0
                    for value in values:
                        total += value
                    return total / len(values)
            """), encoding="utf-8")
            report = grade("vector-mean", submission)
            self.assertEqual(report["passed"], report["total"])

    def test_wrong_submission_fails(self):
        with tempfile.TemporaryDirectory() as folder:
            submission = Path(folder) / "answer.py"
            submission.write_text("def safe_mean(values): return 0\n", encoding="utf-8")
            report = grade("vector-mean", submission)
            self.assertLess(report["passed"], report["total"])


if __name__ == "__main__":
    unittest.main()
