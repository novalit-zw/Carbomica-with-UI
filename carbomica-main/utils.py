import os
import json
import tempfile
from pathlib import Path
from datetime import datetime
import matplotlib.pyplot as plt
import matplotlib as mpl
import pandas as pd
import atomica as at

def _project_dirs():
    """
    Return (results_dir, graphs_dir) based on env PROJECT_DIR.
    Do NOT create repository-level /results or /figs on first-run.
    If PROJECT_DIR is set, create and return per-project directories.
    If PROJECT_DIR is not set, return transient temp dirs under the system temp directory
    (so no /results or /figs are created in repo root).
    """
    proj_env = os.environ.get("PROJECT_DIR")
    if proj_env:
        proj = Path(proj_env)
        results_dir = proj / "results"
        graphs_dir = proj / "graphs"
        results_dir.mkdir(parents=True, exist_ok=True)
        graphs_dir.mkdir(parents=True, exist_ok=True)
        return results_dir, graphs_dir

    # No project context: use a safe temp directory (do not create in repo root)
    tmproot = Path(tempfile.gettempdir()) / "optima_temp"
    tmproot.mkdir(parents=True, exist_ok=True)
    results_dir = tmproot / "results"
    graphs_dir = tmproot / "graphs"
    results_dir.mkdir(parents=True, exist_ok=True)
    graphs_dir.mkdir(parents=True, exist_ok=True)
    return results_dir, graphs_dir

def _record_graph(graphs_dir: Path, filename: str, meta: dict):
    manifest = graphs_dir / "manifest.json"
    data = {}
    if manifest.exists():
        try:
            data = json.loads(manifest.read_text(encoding="utf-8"))
        except Exception:
            data = {}
    # use timestamped name key
    data[filename] = meta
    manifest.write_text(json.dumps(data, indent=2), encoding="utf-8")

def calc_emissions(results, start_year, facility_code, file_name, title=None):
    """
    Save emissions excel & a bar plot into project-specific results/ and graphs/ directories.
    """
    # Extract relevant parameter names for plotting
    pop = results[0].pop_names[0]
    pars = results[0].par_names(pop)
    parameters = [par for par in pars if '_mult' not in par and '_emissions' not in par and '_baseline' not in par]
    par_labels = [par.replace('_', ' ').title() for par in parameters]
    
    # Set up DataFrame for emissions
    rows = [res.name for res in results]
    df_emissions = pd.DataFrame(index=rows, columns=par_labels)
    start_i = list(results[0].t).index(start_year)
    
    # Populate the DataFrame with emissions data
    for par, par_label in zip(parameters, par_labels):
        for res in results:
            df_emissions.loc[res.name, par_label] = res.get_variable(par, facility_code)[0].vals[start_i]
    
    # write to project results and graphs
    results_dir, graphs_dir = _project_dirs()
    excel_path = results_dir / f'{file_name}.xlsx'
    writer_emissions = pd.ExcelWriter(excel_path, engine='xlsxwriter')
    df_emissions.to_excel(writer_emissions, sheet_name=facility_code)
    writer_emissions.close()
    
    # Generate the bar plot
    fig_width = max(15, len(par_labels) * 1.5)
    fig_height = 10
    font_size = 22
    fig, ax = plt.subplots(figsize=(fig_width, fig_height))
    df_emissions.plot(kind='bar', stacked=True, ax=ax, fontsize=font_size)
    
    plt.title(title or 'Total CO2e Emissions', fontsize=font_size + 2)
    ax.legend(title='Emission Sources', bbox_to_anchor=(1.0, 1.0), loc='upper left', fontsize=font_size-2, title_fontsize=font_size)
    ax.yaxis.set_major_formatter(mpl.ticker.StrMethodFormatter('{x:,.0f}'))
    plt.xticks(rotation=90, ha='center')
    plt.ylabel('Emissions (CO2e)', fontsize=font_size)
    plt.tight_layout()
    img_name = f'{file_name}.png'
    img_path = graphs_dir / img_name
    fig.savefig(img_path, bbox_inches='tight')
    plt.close(fig)
    
    # record in manifest
    _record_graph(graphs_dir, img_name, {
        "file": img_name,
        "type": "emissions",
        "title": title or 'Emissions',
        "created_at": datetime.utcnow().isoformat() + "Z",
        "facility": facility_code
    })
    
    print(f'Emissions results saved: {excel_path}')
    print(f'Emissions bar plot saved: {img_path}')

def plot_allocation(results, file_name):
    """
    Save allocation bar plot into project graphs directory and excel into results dir.
    """
    prog_codes = results[0].model.progset.programs
    prog_labels = [results[0].model.progset.programs[prog].label for prog in prog_codes]
    res_names = [res.name for res in results]
    df_spending_optimized = pd.DataFrame(index=res_names, columns=prog_labels)
    
    for res in results:
        for prog_code, prog_name in zip(prog_codes,prog_labels):
            df_spending_optimized.loc[res.name,prog_name] = res.get_alloc()[prog_code][0]
    
    # colors
    colormap = plt.cm.tab20
    colors = [colormap(i) for i in range(len(df_spending_optimized.columns))]
    
    results_dir, graphs_dir = _project_dirs()
    fig, ax = plt.subplots(figsize=(15,10))
    df_spending_optimized.plot.bar(stacked=True, color=colors, ax=ax, fontsize=22)
    ax.legend(loc='upper left', bbox_to_anchor=(1.05,1), title='Interventions', fontsize=20, title_fontsize=22)
    ax.yaxis.set_major_formatter(mpl.ticker.StrMethodFormatter('${x:,.0f}'))
    plt.title('Budget allocation', fontsize=25)
    plt.xticks(rotation=0)
    plt.tight_layout()
    img_name = f'{file_name}.png'
    img_path = graphs_dir / img_name
    fig.savefig(img_path, bbox_inches='tight')
    plt.close(fig)
    
    excel_path = results_dir / f'{file_name}.xlsx'
    writer = pd.ExcelWriter(excel_path, engine='xlsxwriter')
    df_spending_optimized.to_excel(writer, sheet_name="Allocation")
    writer.close()
    
    _record_graph(graphs_dir, img_name, {
        "file": img_name,
        "type": "allocation",
        "title": "Budget allocation",
        "created_at": datetime.utcnow().isoformat() + "Z"
    })
    
    print(f'Allocation bar plot saved: {img_path}')
    print(f'Allocation excel saved: {excel_path}')

def write_alloc_excel(progset, results, year, print_results=True, file_name=None):
    """
    Write optimized budget allocations onto an excel file (saved into project results dir).
    """
    progname = []
    prog_labels = []
    for prog in progset.programs:
        progname += [prog]
        prog_labels += [progset.programs[prog].label]
        
    bars = []
    for i in range(0, len(results)):
         bar_name = results[i].name
         bars.append(bar_name)
         
    d1 = at.PlotData.programs(results, quantity='spending')
    d1.interpolate(year)
    spending_raw_data = {(x.result, x.output): x.vals[0] for x in d1.series}
    spending_data = {res: {prog:0 for prog in progname} for res in bars}
    
    d2 = at.PlotData.programs(results, quantity='coverage_fraction')
    d2.interpolate(year)
    cov_raw_data = {(x.result, x.output): x.vals[0] for x in d2.series}
    cov_data = {res: {prog:0 for prog in progname} for res in bars}
    for br in bars:
        for prog in progname:
            spending_data[br][prog] = spending_raw_data[(br, prog)]
            cov_data[br][prog] = cov_raw_data[(br, prog)]
    df1 = pd.DataFrame(spending_data)
    df2 = pd.DataFrame(cov_data)
    df1.index = prog_labels
    df2.index = prog_labels
    
    results_dir, graphs_dir = _project_dirs()
    if print_results:
        fn = file_name or 'allocations'
        excel_file = results_dir / (fn + '.xlsx')
        writer = pd.ExcelWriter(excel_file, engine='xlsxwriter')
        df1.to_excel(writer, sheet_name="Budgets")
        df2.to_excel(writer, sheet_name="Coverages")
        writer.close()
        print(f'Excel file saved: {excel_file}')
    
    return df1, df2