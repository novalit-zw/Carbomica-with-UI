from pathlib import Path
from typing import Any
import json
from storage import project_path

VARS_FILENAME = "variables.json"

def _vars_file(project_id: str) -> Path:
    p = project_path(project_id)
    p.mkdir(parents=True, exist_ok=True)
    return p / VARS_FILENAME

def load_variables(project_id: str) -> dict:
    f = _vars_file(project_id)
    if not f.exists():
        return {}
    try:
        return json.loads(f.read_text(encoding="utf-8"))
    except Exception:
        return {}

def save_variables(project_id: str, data: dict) -> None:
    f = _vars_file(project_id)
    f.write_text(json.dumps(data or {}, indent=2), encoding="utf-8")

def update_variable(project_id: str, key: str, value: Any) -> None:
    d = load_variables(project_id)
    d[key] = value
    save_variables(project_id, d)