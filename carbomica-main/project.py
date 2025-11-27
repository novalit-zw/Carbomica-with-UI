"""
Define atomica project based on input data spreadsheet.
"""

import os
import json
from pathlib import Path

import atomica as at
import pandas as pd
from books import generate_books

# determine project folder (env var PROJECT_DIR preferred, then PROJECT_ID inside projects/)
BASE_DIR = Path(__file__).resolve().parent
PROJECTS_DIR = BASE_DIR / "projects"

proj_dir = None
if os.environ.get("PROJECT_DIR"):
    proj_dir = Path(os.environ["PROJECT_DIR"])
elif os.environ.get("PROJECT_ID"):
    proj_dir = PROJECTS_DIR / os.environ["PROJECT_ID"]
else:
    proj_dir = None  # will fall back to repo root/lookups

# load persisted variables if available
vars_data = {}
if proj_dir:
    vars_file = proj_dir / "variables.json"
    if vars_file.exists():
        try:
            vars_data = json.loads(vars_file.read_text(encoding="utf-8"))
        except Exception:
            vars_data = {}

# Time frame of simulation (use persisted start_year if present)
default_start = 2024
start_year = int(vars_data.get("start_year", default_start))
end_year = int(vars_data.get("end_year", start_year + 5))

# Input data sheet file name (prefer project input_filename, else defaults)
input_filename = vars_data.get("input_filename") or "input_data_example.xlsx"
if proj_dir:
    possible_path = proj_dir / input_filename
    if possible_path.exists():
        input_data_sheet = str(possible_path)
    else:
        # fallback to repo root file if present
        repo_candidate = BASE_DIR / input_filename
        input_data_sheet = str(repo_candidate) if repo_candidate.exists() else input_filename
else:
    # no project dir supplied; use repo local file name
    input_data_sheet = input_filename

# Attempt to read facility_code from the input spreadsheet (best-effort)
facility_code = None
try:
    df_fac = pd.read_excel(input_data_sheet, sheet_name="facility", index_col="Code Name")
    facility_code = df_fac.index[0] if len(df_fac.index) > 0 else None
except Exception:
    facility_code = vars_data.get("facility_code") or None

# generate framework, databook and progbook (books.py handles output paths)
generate_books(input_data_sheet, start_year, end_year)

# Atomica project definition
if not facility_code:
    raise RuntimeError(f"Could not determine facility_code from {input_data_sheet}")

P = at.Project(
    framework=f'books/carbomica_framework_{facility_code}.xlsx',
    databook=f'books/carbomica_databook_{facility_code}.xlsx',
    do_run=False,
)

# Projection settings
P.settings.sim_dt = 1
P.settings.sim_start = start_year
P.settings.sim_end = end_year

# Load program/progbook
progset = P.load_progbook(f'books/carbomica_progbook_{facility_code}.xlsx')
