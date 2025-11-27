'use client'
import React, { useEffect, useState, useRef } from 'react';
import { simulateProject, listScenarios, getEngineStatus } from '@/lib/apiClient';
import GraphGrid from '@/components/GraphGrid';

export default function SimulationPage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [scenarioName, setScenarioName] = useState<string>('baseline');
  const [running, setRunning] = useState(false);
  const [spending, setSpending] = useState<number | ''>('');
  const [budgetsCsv, setBudgetsCsv] = useState<string>('20000,50000,100000');
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [statusInfo, setStatusInfo] = useState<any>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const id = typeof window !== 'undefined' ? (localStorage.getItem('engine:lastProjectId') || localStorage.getItem('engine:activeProjectId')) : null;
    setProjectId(id);
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!projectId) return;
    (async () => {
      try {
        const sc = await listScenarios(projectId);
        setScenarios(sc || []);
        if (sc && sc[0] && sc[0].name) setScenarioName(sc[0].name);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [projectId]);

  // Poll status until finished/failed
  const waitForFinish = async (pid: string, interval = 2000, timeoutMs = 5 * 60 * 1000) => {
    const start = Date.now();
    while (mountedRef.current) {
      try {
        const st = await getEngineStatus(pid);
        setStatusInfo(st);
        const s = (st && st.status) ? String(st.status).toLowerCase() : '';
        if (s === 'finished' || s === 'failed' || s === 'error') {
          return st;
        }
      } catch (err) {
        // continue polling on transient errors
        console.error('status poll error', err);
      }
      if (Date.now() - start > timeoutMs) {
        return { status: 'timeout' };
      }
      await new Promise(res => setTimeout(res, interval));
    }
    return { status: 'aborted' };
  };

  const run = async () => {
    if (!projectId) return alert('No project selected');
    setRunning(true);
    setStatusInfo({ status: 'queued', scenario: scenarioName });
    try {
      const budgets = budgetsCsv.split(',').map(s => Number(s.trim())).filter(n => !Number.isNaN(n));
      const options: any = {};
      if (spending !== '') options.spending = Number(spending);
      if (budgets.length) options.budgets = budgets;
      // dispatch run (backend enqueues)
      await simulateProject(projectId, scenarioName, options);
      // poll until finished/failed
      const final = await waitForFinish(projectId);
      // update statusInfo with final
      setStatusInfo(final);
      if (final?.status === 'finished') {
        // small delay to allow graphs to be written
        await new Promise(res => setTimeout(res, 500));
      } else if (final?.status === 'failed' || final?.status === 'error') {
        console.warn('Run ended with failure', final);
      }
    } catch (e:any) {
      console.error(e);
      setStatusInfo({ status: 'error', error: e?.message ?? String(e) });
      alert(e?.message || 'Simulation error');
    } finally {
      if (mountedRef.current) setRunning(false);
    }
  };

  const budgetsList = budgetsCsv.split(',').map(s => s.trim()).filter(Boolean);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-semibold mb-4">Simulation</h1>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="block mb-1">Scenario</label>
          <select value={scenarioName} onChange={(e) => setScenarioName(e.target.value)} className="w-full px-3 py-2 border border-black/10 rounded">
            {scenarios.map((s:any) => <option key={s.name} value={s.name}>{s.name}</option>)}
          </select>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="number" placeholder="Spending (optional)" value={spending as any} onChange={(e)=> setSpending(e.target.value ? Number(e.target.value) : '')} className="w-full px-3 py-2 border rounded" />
            <input type="text" placeholder="Budgets CSV (e.g. 20000,50000,100000)" value={budgetsCsv} onChange={(e)=> setBudgetsCsv(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>

          <div className="mt-3 text-sm text-black/60">
            <span className="font-medium">Current run parameters:</span>
            <div>Scenario: {scenarioName}</div>
            <div>Spending: {spending === '' ? '—' : spending}</div>
            <div>Budgets: {budgetsList.join(', ') || '—'}</div>
          </div>

          {statusInfo && (
            <div className="mt-3 text-sm bg-gray-50 border p-3 rounded">
              <div className="font-medium mb-1">Run status</div>
              <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(statusInfo, null, 2)}</pre>
            </div>
          )}
        </div>

        <div className="flex items-end">
          <button
            onClick={run}
            disabled={running}
            className="w-full px-4 py-2 border border-black rounded bg-gray-50 hover:bg-gray-100"
          >
            {running ? 'Running…' : 'Run scenario'}
          </button>
        </div>
      </div>

      <GraphGrid projectId={projectId} />
    </div>
  );
}