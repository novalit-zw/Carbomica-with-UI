import axios from "axios";
const ENGINE_URL = (process.env.NEXT_PUBLIC_ENGINE_URL || 'http://localhost:8000').replace(/\/$/, '');

/* Project / upload */
export async function uploadFile(file: File, projectName?: string) {
  const form = new FormData();
  form.append('file', file);
  if (projectName) form.append('project_name', projectName);

  const res = await axios.post(`${ENGINE_URL}/upload`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const data = res.data ?? {};
  if (data.project_id) setLastProjectId(data.project_id);
  return data;
}

export async function uploadTemp(file: File) {
  const form = new FormData();
  form.append('file', file);
  const res = await axios.post(`${ENGINE_URL}/upload-temp`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function createProject(file?: File | undefined, projectName?: string | undefined, startYear?: number | undefined, uploadToken?: string | undefined) {
  const form = new FormData();
  if (file) form.append('file', file);
  if (projectName) form.append('project_name', projectName);
  if (startYear != null) form.append('start_year', String(startYear));
  if (uploadToken) form.append('upload_token', uploadToken);

  const res = await axios.post(`${ENGINE_URL}/projects`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

/* Return projects array (normalized shape: res.data.projects) */
export async function listProjects(): Promise<any[]> {
  const res = await axios.get(`${ENGINE_URL}/projects`);
  const data = res.data ?? {};
  // backend returns { projects: [...] }
  return data.projects ?? data;
}

/* Engine run / status */
export async function runEngine(scenarioData: any = {}) {
  const projectId = scenarioData?.projectId || getLastProjectId();
  if (!projectId) throw new Error('projectId is required to run engine');
  const res = await axios.post(`${ENGINE_URL}/projects/${projectId}/run`, scenarioData);
  return res.data ?? {};
}

export async function getEngineStatus(projectId?: string) {
  const id = projectId || getLastProjectId();
  if (!id) throw new Error('projectId is required to get status');
  const res = await axios.get(`${ENGINE_URL}/projects/${id}/status`);
  return res.data ?? {};
}

/* Sheets / inputs */
export async function getSheet(projectId: string, sheet = 'databook', sheet_name?: string) {
  const res = await axios.get(`${ENGINE_URL}/projects/${projectId}/sheet`, { params: { sheet, sheet_name }});
  return res.data ?? {};
}

export async function saveSheet(projectId: string, payload: any) {
  const res = await axios.put(`${ENGINE_URL}/projects/${projectId}/sheet`, payload);
  return res.data ?? {};
}

/* Simulation / reports */
export async function simulateProject(projectId: string, scenario: string, options?: any) {
  // POST /projects/{id}/scenarios/run accepts { scenario, options }
  const res = await axios.post(`${ENGINE_URL}/projects/${encodeURIComponent(projectId)}/scenarios/run`, { scenario, options });
  return res.data ?? {};
}

export async function getReport(projectId: string) {
  const res = await axios.get(`${ENGINE_URL}/projects/${projectId}/report`, { responseType: 'blob' });
  // return Blob directly for consumers to create object URL
  return res.data;
}

/* Variables helpers - return normalized shapes (object) */
export async function getVariables(projectId?: string) {
  const id = projectId || getLastProjectId();
  if (!id) throw new Error('projectId is required to get variables');
  const res = await axios.get(`${ENGINE_URL}/projects/${id}/variables`);
  const data = res.data ?? {};
  // backend returns { variables: {...} }
  return data.variables ?? data;
}

export async function saveVariables(projectId: string, vars: any) {
  const res = await axios.put(`${ENGINE_URL}/projects/${projectId}/variables`, vars);
  const data = res.data ?? {};
  // return normalized variables object where possible
  return data.variables ?? data;
}

/* Books and Scenarios */
export async function listBooks(projectId: string) {
  const res = await axios.get(`${ENGINE_URL}/projects/${encodeURIComponent(projectId)}/books`);
  return res.data ?? { files: [], books_path: '' };
}

export async function listScenarios(projectId: string) {
  const res = await axios.get(`${ENGINE_URL}/projects/${encodeURIComponent(projectId)}/scenarios`);
  // backend returns { scenarios: [...] }
  return res.data?.scenarios ?? [];
}

export async function runScenario(projectId: string, scenario: string) {
  const res = await axios.post(`${ENGINE_URL}/projects/${projectId}/scenarios/run`, { scenario });
  return res.data ?? {};
}

export async function listBookSheets(projectId: string, filename: string) {
  const res = await axios.get(`${ENGINE_URL}/projects/${encodeURIComponent(projectId)}/books/${encodeURIComponent(filename)}/sheets`);
  return res.data?.sheets ?? [];
}

/**
 * Fetch a table (spreadsheet) for a scenario or project books.
 * scenario: name of scenario or 'books' to inspect generated workbooks
 * sheet: optional sheet name (when scenario === 'books' you pass the sheet to inspect)
 *
 * Backend expected endpoint:
 * GET /projects/{projectId}/scenarios/{scenario}/table?sheet={sheet}
 */
export async function getScenarioTable(projectId: string, scenario: string, sheet?: string) {
  const q = sheet ? `?sheet=${encodeURIComponent(sheet)}` : '';
  const res = await axios.get(`${ENGINE_URL}/projects/${encodeURIComponent(projectId)}/scenarios/${encodeURIComponent(scenario)}/table${q}`);
  return res.data ?? { columns: [], rows: [] };
}

export async function createScenario(projectId: string, payload: { name: string; spending?: number; budgets?: number[] }) {
  const res = await axios.post(`${ENGINE_URL}/projects/${projectId}/scenarios`, payload);
  return res.data ?? {};
}

// helper to read last project id from localStorage (safe at module load)
export function getLastProjectId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('engine:lastProjectId') || localStorage.getItem('engine:activeProjectId') || null;
}

// ensure listGraphs is available early
export async function listGraphs(projectId?: string) {
  const id = projectId || getLastProjectId();
  if (!id) {
    return { files: [], manifest: {} };
  }
  const res = await axios.get(`${ENGINE_URL}/projects/${encodeURIComponent(id)}/graphs`);
  return res.data ?? { files: [], manifest: {} };
}

export default {
  uploadFile,
  uploadTemp,
  createProject,
  listProjects,
  runEngine,
  getEngineStatus,
  getSheet,
  saveSheet,
  simulateProject,
  getReport,
  getVariables,
  saveVariables,
  listBooks,
  listScenarios,
  runScenario,
  getScenarioTable,
  listBookSheets,
  listGraphs,
  createScenario,
};