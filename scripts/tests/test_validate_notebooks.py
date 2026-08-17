"""Test cho validator notebook.

Bảo vệ hai kết luận của audit:

- NOTEBOOK-P2-01: cell thiếu id hoặc trùng id phải bị bắt.
- NOTEBOOK-P2-02: validator phải thất bại **kể cả khi chạy bằng `python -O`**,
  vốn loại bỏ mọi câu lệnh `assert`.
"""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
VALIDATOR = ROOT / "scripts" / "validate_notebooks.py"
NOTEBOOKS = ROOT / "notebooks"


def run_validator(notebook_dir: Path, optimized: bool = False) -> subprocess.CompletedProcess:
    command = [sys.executable]
    if optimized:
        command.append("-O")
    command.append(str(VALIDATOR))
    return subprocess.run(
        command,
        capture_output=True,
        text=True,
        env={**dict(**__import__("os").environ), "VOAI_NOTEBOOK_DIR": str(notebook_dir)},
        check=False,
    )


class ValidatorTests(unittest.TestCase):
    def setUp(self) -> None:
        self._temporary = tempfile.TemporaryDirectory()
        self.notebooks = Path(self._temporary.name) / "notebooks"
        shutil.copytree(NOTEBOOKS, self.notebooks)
        self.sample = self.notebooks / "00_khoi_dong_va_diagnostic.ipynb"

    def tearDown(self) -> None:
        self._temporary.cleanup()

    def _rewrite(self, mutate) -> None:
        data = json.loads(self.sample.read_text(encoding="utf-8"))
        mutate(data)
        self.sample.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")

    def test_pristine_notebooks_pass(self):
        result = run_validator(self.notebooks)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("Validated 8 notebooks", result.stdout)

    def test_missing_cell_id_fails(self):
        self._rewrite(lambda data: data["cells"][0].pop("id", None))
        result = run_validator(self.notebooks)
        self.assertEqual(result.returncode, 1)
        self.assertIn("id không hợp lệ", result.stderr)

    def test_duplicate_cell_id_fails(self):
        def mutate(data):
            data["cells"][1]["id"] = data["cells"][0]["id"]

        self._rewrite(mutate)
        result = run_validator(self.notebooks)
        self.assertEqual(result.returncode, 1)
        self.assertIn("id trùng", result.stderr)

    def test_invalid_cell_id_characters_fail(self):
        self._rewrite(lambda data: data["cells"][0].__setitem__("id", "id có dấu cách"))
        result = run_validator(self.notebooks)
        self.assertEqual(result.returncode, 1)

    def test_solo90_false_fails_under_plain_python(self):
        self._rewrite(lambda data: data["metadata"]["voai_lab"].__setitem__("solo90", False))
        result = run_validator(self.notebooks)
        self.assertEqual(result.returncode, 1)
        self.assertIn("solo90", result.stderr)

    def test_solo90_false_also_fails_under_python_dash_O(self):
        # Đây là ca mà phiên bản cũ dùng `assert` báo hợp lệ sai.
        self._rewrite(lambda data: data["metadata"]["voai_lab"].__setitem__("solo90", False))
        result = run_validator(self.notebooks, optimized=True)
        self.assertEqual(result.returncode, 1, "python -O vẫn bỏ qua notebook sai metadata")
        self.assertIn("solo90", result.stderr)

    def test_saved_outputs_fail(self):
        def mutate(data):
            for cell in data["cells"]:
                if cell["cell_type"] == "code":
                    cell["outputs"] = [{"output_type": "stream", "name": "stdout", "text": ["rác"]}]
                    break

        self._rewrite(mutate)
        result = run_validator(self.notebooks)
        self.assertEqual(result.returncode, 1)

    def test_missing_notebook_fails(self):
        (self.notebooks / "05_nlp_attention.ipynb").unlink()
        result = run_validator(self.notebooks)
        self.assertEqual(result.returncode, 1)
        self.assertIn("Thiếu notebook", result.stderr)


class NotebookCurriculumTests(unittest.TestCase):
    """NOTEBOOK-P3-01: nội dung phải khớp đúng lời cam kết trong mô tả."""

    def text(self, name: str) -> str:
        data = json.loads((NOTEBOOKS / name).read_text(encoding="utf-8"))
        return "".join("".join(cell.get("source", [])) for cell in data["cells"])

    def test_attention_notebook_implements_masking(self):
        body = self.text("05_nlp_attention.ipynb")
        self.assertIn("mask=None", body, "attention chưa nhận tham số mask")
        self.assertIn("causal_mask", body)
        self.assertIn("-inf", body, "mask phải áp trước softmax bằng -inf")
        self.assertIn("w_m[0, 1] < 1e-9", body, "thiếu test chứng minh mask chặn thật")

    def test_audio_notebook_implements_mel_and_mfcc(self):
        body = self.text("06_audio_stft_mel.ipynb")
        for marker in ("hz_to_mel", "mel_to_hz", "mel_filterbank", "def mfcc", "DCT-II"):
            self.assertIn(marker, body, f"thiếu {marker}")
        self.assertIn("fb.shape == (20, 201)", body, "thiếu shape test cho filterbank")
        self.assertIn("c0[0, 1:], 0", body, "thiếu numeric test cho DCT")

    def test_backprop_notebook_calls_backward_with_gradient_check(self):
        body = self.text("03_mlp_backprop_pytorch.ipynb")
        self.assertIn("def bce_loss", body, "chưa định nghĩa rõ loss")
        self.assertIn("'X', 'Z1', 'A1', 'Z2'", body, "chưa nêu rõ cache cho backward")
        self.assertIn("dW1, db1, dW2, db2 = backward(", body, "visible test không gọi backward")
        self.assertIn("numeric - dW2[0, 0]", body, "thiếu numerical gradient check")

    def test_mock_notebook_rejects_a_placeholder_model(self):
        body = self.text("07_mock_voai_end_to_end.ipynb")
        self.assertIn("hasattr(model, 'fit') and hasattr(model, 'predict')", body)
        self.assertIn("leakage", body, "thiếu kiểm tra chồng chỉ số giữa các split")
        self.assertIn("SEED", body, "thiếu kiểm tra tái lập bằng seed")
        self.assertIn("f1_score", body, "thiếu metric hợp lệ tính lại được")
        self.assertIn("submission.csv", body, "thiếu kiểm tra artifact nộp bài")
        # `model = object(); validation_score = 0` phải không lọt qua được.
        self.assertNotIn("model = object()", body)


if __name__ == "__main__":
    unittest.main()
