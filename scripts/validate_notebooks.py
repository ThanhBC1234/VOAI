from __future__ import annotations

import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
files = sorted((root / "notebooks").glob("*.ipynb"))
assert len(files) == 8, f"Expected 8 notebooks, found {len(files)}"
for path in files:
    data = json.loads(path.read_text(encoding="utf-8"))
    assert data["nbformat"] == 4
    assert data["metadata"]["voai_lab"]["solo90"] is True
    assert len(data["cells"]) >= 10
    assert any(cell["cell_type"] == "code" for cell in data["cells"])
    text = "".join("".join(cell["source"]) for cell in data["cells"])
    assert "Visible tests" in text and "Exit ticket" in text
print(f"Validated {len(files)} notebooks")
