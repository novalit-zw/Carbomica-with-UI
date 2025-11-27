"""
Run three main scenarios programmatically.

This module intentionally avoids performing any runs at import time.
Provide run_project(...) as the programmatic entrypoint that accepts
input_path, out_dir, scenario and options (options may include 'spending' and/or 'budgets').
"""
import os
import traceback
from pathlib import Path
from typing import Optional, List, Any, Dict

# engine scenario functions are imported inside run_project to avoid triggering work at import
# (they may rely on PROJECT_DIR / working dir setup)

def run_project(input_path: str, out_dir: str, scenario: Optional[str] = None, options: Optional[Dict[str, Any]] = None):
    """
    Programmatic entrypoint for the engine.

    Parameters
    - input_path: path to the uploaded input workbook (string)
    - out_dir: path to output directory (string). Caller usually sets this to projects/{id}/outputs
    - scenario: optional scenario name ('baseline'/'coverage'/'budget'/'optimization' or custom)
    - options: optional dict with keys like 'spending' (number) or 'budgets' (list)

    Behaviour:
    - If scenario indicates coverage/baseline -> call coverage_scenario(...)
    - If options.spending present or scenario == 'budget' -> call budget_scenario(..., spending)
    - If options.budgets present or scenario == 'optimization' -> call optimization(..., budgets)
    - Returns a dict with status info (engine_api._call_engine_direct will accept this)
    """
    prev_cwd = os.getcwd()
    try:
        # ensure output directory exists
        out_p = Path(out_dir)
        out_p.mkdir(parents=True, exist_ok=True)

        # Set PROJECT_DIR env so project/utils know where to write/read per-project files
        project_dir = str(Path(out_p).parent.resolve())
        os.environ["PROJECT_DIR"] = project_dir

        # Ensure we run imports with repository root as working directory so templates/ resolves correctly
        repo_root = str(Path(__file__).parent.resolve())
        try:
            os.chdir(repo_root)
        except Exception:
            # if this fails, fall back to previous cwd but proceed
            pass

        # Import project and scenarios now that PROJECT_DIR is set and cwd points to repo root
        try:
            from project import P, progset, start_year, facility_code  # type: ignore
        except Exception as e:
            return {"status": "error", "error": f"failed to import project module: {e}", "trace": traceback.format_exc()}

        try:
            from scenarios import coverage_scenario, budget_scenario, optimization  # type: ignore
        except Exception as e:
            return {"status": "error", "error": f"failed to import scenarios module: {e}", "trace": traceback.format_exc()}

        # Normalize options
        opts = options or {}
        scen = (scenario or "baseline").strip().lower()

        # coverage / baseline
        if scen in ("baseline", "coverage", "full"):
            coverage_scenario(P, progset, start_year, facility_code)
            return {"status": "ok", "scenario": "coverage"}

        # budget scenario (single spending)
        if scen in ("budget",) or ("spending" in opts and opts.get("spending") is not None):
            try:
                spending = float(opts.get("spending")) if ("spending" in opts and opts.get("spending") is not None) else float(1e4)
            except Exception:
                spending = 1e4
            budget_scenario(P, progset, start_year, facility_code, spending)
            return {"status": "ok", "scenario": "budget", "spending": spending}

        # optimization scenario (multiple budgets)
        if scen in ("optimization", "opt", "optimize") or ("budgets" in opts and opts.get("budgets") is not None):
            budgets_raw = opts.get("budgets")
            if isinstance(budgets_raw, (list, tuple)):
                try:
                    budgets = [float(b) for b in budgets_raw]
                except Exception:
                    budgets = [20000.0, 50000.0, 100000.0]
            elif isinstance(budgets_raw, str):
                try:
                    budgets = [float(x.strip()) for x in budgets_raw.split(",") if x.strip()]
                except Exception:
                    budgets = [20000.0, 50000.0, 100000.0]
            else:
                budgets = [20000.0, 50000.0, 100000.0]

            optimization(P, progset, start_year, facility_code, budgets)
            return {"status": "ok", "scenario": "optimization", "budgets": budgets}

        # Unknown scenario: attempt to run coverage as safe fallback
        coverage_scenario(P, progset, start_year, facility_code)
        return {"status": "ok", "scenario": "fallback_coverage"}
    except Exception as exc:
        return {"status": "error", "error": str(exc), "trace": traceback.format_exc()}
    finally:
        # restore previous cwd
        try:
            os.chdir(prev_cwd)
        except Exception:
            pass


def main():
    """
    CLI wrapper for running from subprocess.
    Accepts --input, --out, --scenario, --spending, --budgets.
    """
    import argparse
    parser = argparse.ArgumentParser(description="Run project scenarios")
    parser.add_argument("--input", "-i", required=True, help="Path to input workbook")
    parser.add_argument("--out", "-o", required=True, help="Output directory")
    parser.add_argument("--scenario", "-s", default="baseline", help="Scenario name")
    parser.add_argument("--spending", type=float, help="Single spending value for budget scenario")
    parser.add_argument("--budgets", type=str, help="Comma-separated budgets for optimization (e.g. 20000,50000,100000)")
    args = parser.parse_args()

    options = {}
    if args.spending is not None:
        options["spending"] = args.spending
    if args.budgets:
        try:
            options["budgets"] = [float(x.strip()) for x in args.budgets.split(",") if x.strip()]
        except Exception:
            options["budgets"] = args.budgets

    res = run_project(args.input, args.out, args.scenario, options)
    if isinstance(res, dict) and res.get("status") == "ok":
        print("OK:", res)
        return 0
    else:
        print("ERROR:", res)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())

