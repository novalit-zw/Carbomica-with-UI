from pathlib import Path
from typing import Optional
import uuid
import json
from datetime import datetime

BASE_DIR = Path(__file__).resolve().parent
PROJECTS_DIR = Path("projects")
PROJECTS_DIR.mkdir(exist_ok=True)

def projects_index_path() -> Path:
    return PROJECTS_DIR / "projects.json"

def load_projects_index() -> dict:
    if not projects_index_path().exists():
        return {"projects": []}
    try:
        return json.loads(projects_index_path().read_text(encoding="utf-8"))
    except Exception:
        return {"projects": []}

def save_projects_index(data: dict) -> None:
    projects_index_path().write_text(json.dumps(data, indent=2), encoding="utf-8")

def add_project_to_index(entry: dict) -> None:
    idx = load_projects_index()
    # remove any existing project with same id
    projects = [p for p in idx.get("projects", []) if p.get("project_id") != entry.get("project_id")]
    projects.append(entry)
    idx["projects"] = projects
    save_projects_index(idx)

def project_path(project_id: str) -> Path:
    return PROJECTS_DIR / project_id

def books_path(project_id: str) -> Path:
    p = project_path(project_id) / "books"
    p.mkdir(parents=True, exist_ok=True)
    return p

def create_project_folder(project_name: Optional[str] = None, project_id: Optional[str] = None, add_index: bool = False) -> str:
    """
    Create a project folder. By default do not add an entry to the projects index.
    Set add_index=True when you want the project to appear in projects.json.
    This prevents creating placeholder projects during file-upload steps.
    """
    pid = project_id or str(uuid.uuid4())
    proj_dir = PROJECTS_DIR / pid
    proj_dir.mkdir(parents=True, exist_ok=True)
    # ensure outputs and books exist
    (proj_dir / "outputs").mkdir(exist_ok=True)
    (proj_dir / "books").mkdir(exist_ok=True)
    vars_file = proj_dir / "variables.json"
    if not vars_file.exists():
        vars_file.write_text(json.dumps({"project_name": project_name} if project_name else {}, indent=2), encoding="utf-8")

    entry = {
        "project_id": pid,
        "project_name": project_name or None,
        "input_filename": None,
        "books_path": str((proj_dir / "books").resolve()),
        "created_at": datetime.utcnow().isoformat() + "Z",
        "has_outputs": False
    }

    if add_index:
        add_project_to_index(entry)

    return pid

def save_input_file(project_id: str, upload_file) -> str:
    """
    upload_file: FastAPI UploadFile or file-like object with .filename and .read().
    Saves to {project}/input_data.xlsx (preserves original extension).
    Returns saved filename (relative).
    """
    proj_dir = project_path(project_id)
    proj_dir.mkdir(parents=True, exist_ok=True)
    filename = getattr(upload_file, "filename", "input_data.xlsx")
    # ensure safe name (basic) and default to input_data.xlsx if no extension
    if not Path(filename).suffix:
        filename = "input_data.xlsx"
    dest = proj_dir / filename
    # if upload_file is FastAPI UploadFile it has .file or .read()
    try:
        content = upload_file.file.read() if hasattr(upload_file, "file") else upload_file.read()
    except Exception:
        # fall back to async read (not expected here)
        content = upload_file.read()
    dest.write_bytes(content)
    # update index entry
    idx = load_projects_index()
    updated = False
    for p in idx.get("projects", []):
        if p.get("project_id") == project_id:
            p["input_filename"] = filename
            p["has_outputs"] = (proj_dir / "outputs").exists()
            updated = True
            break
    if not updated:
        idx.setdefault("projects", []).append({
            "project_id": project_id,
            "project_name": None,
            "input_filename": filename,
            "created_at": datetime.utcnow().isoformat() + "Z",
            "has_outputs": (proj_dir / "outputs").exists()
        })
    save_projects_index(idx)
    return str(dest)