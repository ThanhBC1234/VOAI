from __future__ import annotations

import ast
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
files = sorted((root / "notebooks").glob("*.ipynb"))
expected_names = {
    "00_khoi_dong_va_diagnostic.ipynb",
    "01_numpy_linear_regression.ipynb",
    "02_classical_ml_pipeline.ipynb",
    "03_mlp_backprop_pytorch.ipynb",
    "04_computer_vision_cnn.ipynb",
    "05_nlp_attention.ipynb",
    "06_audio_stft_mel.ipynb",
    "07_mock_voai_end_to_end.ipynb",
}
actual_names = {path.name for path in files}
assert actual_names == expected_names, (
    f"Notebook set mismatch. Missing={sorted(expected_names - actual_names)}, "
    f"unexpected={sorted(actual_names - expected_names)}"
)
for path in files:
    data = json.loads(path.read_text(encoding="utf-8"))
    assert data["nbformat"] == 4
    assert data["metadata"]["voai_lab"]["solo90"] is True
    assert len(data["cells"]) >= 10
    assert any(cell["cell_type"] == "code" for cell in data["cells"])
    for index, cell in enumerate(data["cells"]):
        if cell["cell_type"] != "code":
            continue
        source = "".join(cell["source"])
        try:
            ast.parse(source, filename=f"{path.name}:cell-{index}")
        except SyntaxError as error:
            raise AssertionError(
                f"Python syntax error in {path.name}, cell {index}: {error}"
            ) from error
        assert cell.get("execution_count") is None, (
            f"Starter notebook must not contain execution history: {path.name}, cell {index}"
        )
        assert cell.get("outputs", []) == [], (
            f"Starter notebook must not contain saved outputs: {path.name}, cell {index}"
        )
    text = "".join("".join(cell["source"]) for cell in data["cells"])
    assert "TODO" in text and "Visible tests" in text and "Exit ticket" in text
print(f"Validated {len(files)} notebooks")
