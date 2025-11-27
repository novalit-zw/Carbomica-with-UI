'use client'
import React, { useEffect, useState } from 'react';
import { listScenarios, createScenario, listBooks, getScenarioTable, listBookSheets } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';

type ScenarioObj = { name: string; spending?: number; budgets?: number[] };

export default function ScenariosPage() {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [scenarios, setScenarios] = useState<ScenarioObj[]>([]);
  const [books, setBooks] = useState<string[]>([]);
  const [bookSheets, setBookSheets] = useState<Record<string, string[]>>({});
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [table, setTable] = useState<{ columns?: string[]; rows?: any[] } | null>(null);
  const [loading, setLoading] = useState(false);

  // form for new scenario
  const [newName, setNewName] = useState('');
  const [newSpending, setNewSpending] = useState<number | ''>('');
  const [newBudgets, setNewBudgets] = useState<string>('20000,50000,100000');

  useEffect(() => {
    const id = typeof window !== 'undefined' ? (localStorage.getItem('engine:lastProjectId') || localStorage.getItem('engine:activeProjectId')) : null;
    setProjectId(id);
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!projectId) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const sc = await listScenarios(projectId);
        if (!mounted) return;
        setScenarios(sc || []);
        setSelectedScenario((sc && sc[0] && sc[0].name) || null);
        const b = await listBooks(projectId);
        if (!mounted) return;
        setBooks(b.files || []);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [projectId]);

  // fetch sheets for all books once books are loaded
  useEffect(() => {
    if (!projectId || books.length === 0) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const pairs = await Promise.all(
          books.map(async (fn) => {
            try {
              const sheets = await listBookSheets(projectId, fn);
              return [fn, sheets] as [string, string[]];
            } catch (err) {
              console.warn('Failed to load sheets for', fn, err);
              return [fn, []] as [string, string[]];
            }
          })
        );
        if (!mounted) return;
        const mapping: Record<string, string[]> = {};
        pairs.forEach(([fn, sheets]) => { mapping[fn] = sheets; });
        setBookSheets(mapping);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [projectId, books]);

  const handleCreateScenario = async () => {
    if (!projectId) return alert('No active project');
    if (!newName.trim()) return alert('Provide a scenario name');
    const budgets = newBudgets.split(',').map(s => Number(s.trim())).filter(n => !Number.isNaN(n));
    const payload = { name: newName.trim(), spending: newSpending ? Number(newSpending) : undefined, budgets: budgets.length ? budgets : undefined };
    try {
      setLoading(true);
      const res = await createScenario(projectId, payload);
      if (res?.scenario) {
        setScenarios(prev => [...prev, res.scenario]);
        setNewName(''); setNewSpending(''); setNewBudgets('20000,50000,100000');
        alert('Scenario created');
      }
    } catch (err:any) {
      alert(err?.message || 'Failed to create scenario');
    } finally { setLoading(false); }
  };

  const inspectScenarioSheet = async (scenario: string | null, sheet?: string) => {
    if (!projectId) return;
    setLoading(true);
    try {
      const scenarioParam = scenario || 'books';
      const res = await getScenarioTable(projectId, scenarioParam, sheet);
      setTable({ columns: res.columns, rows: res.rows });
      setSelectedSheet(sheet ?? null);
      if (books.length) {
        const match = Object.entries(bookSheets).find(([, sheets]) => sheets.includes(sheet ?? ''));
        setSelectedBook(match ? match[0] : null);
      }
    } catch (e:any) {
      alert(e?.message || 'Failed to load table');
      setTable(null);
      setSelectedSheet(null);
    } finally {
      setLoading(false);
    }
  };

  // deterministic server render while not mounted
  if (!isMounted) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Scenarios</h1>
          <button onClick={() => router.push('/create-project')} className="px-3 py-2 border rounded">Create Project</button>
        </header>

        <div className="bg-white border p-6 rounded-sm text-sm text-black/60">
          Loading…
        </div>
      </div>
    );
  }

  if (!projectId) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Scenarios</h1>
          <button onClick={() => router.push('/create-project')} className="px-3 py-2 border rounded">Create Project</button>
        </header>

        <div className="bg-white border p-6 rounded-sm text-sm text-black/60">
          No active project selected
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Scenarios</h1>
        <button onClick={() => router.push('/create-project')} className="px-3 py-2 border rounded">Create Project</button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <aside className="col-span-1 bg-white border p-4 rounded-sm">
          <h3 className="font-medium mb-3">Available scenarios</h3>
          {scenarios.map((s) => (
            <div key={s.name} className="flex items-center justify-between mb-2">
              <div className="text-sm">{s.name}</div>
              <div className="flex gap-2">
                {/* Run removed from scenarios page */}
                <button onClick={() => { setSelectedScenario(s.name); }} className="px-2 py-1 border rounded text-xs">Select</button>
                <button onClick={() => inspectScenarioSheet(s.name)} className="px-2 py-1 border rounded text-xs">Inspect</button>
              </div>
            </div>
          ))}
          {scenarios.length === 0 && <div className="text-sm text-black/60">No scenarios found</div>}

          <hr className="my-3" />

          <h4 className="font-medium mb-2">Create new scenario</h4>
          <div className="space-y-2 text-sm">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Name" className="w-full px-2 py-1 border rounded" />
            <input value={newSpending as any} onChange={(e) => setNewSpending(e.target.value ? Number(e.target.value) : '')} placeholder="Spending (number)" type="number" className="w-full px-2 py-1 border rounded" />
            <input value={newBudgets} onChange={(e) => setNewBudgets(e.target.value)} placeholder="Budgets CSV e.g. 20000,50000,100000" className="w-full px-2 py-1 border rounded" />
            <div className="flex gap-2">
              <button onClick={handleCreateScenario} className="px-3 py-1 border rounded">Create</button>
            </div>
          </div>
        </aside>

        <main className="col-span-2 space-y-6">
          <section className="bg-white border p-4 rounded-sm">
            <h4 className="font-medium mb-3">Selected</h4>
            <div className="text-sm">Scenario: <span className="font-medium">{selectedScenario ?? 'books'}</span></div>
            <div className="text-sm">Book: <span className="font-medium">{selectedBook ?? '—'}</span></div>
            <div className="text-sm">Sheet: <span className="font-medium">{selectedSheet ?? '—'}</span></div>
          </section>

          {table && table.columns ? (
            <section className="bg-white border p-4 rounded-sm">
              <h4 className="font-medium mb-3">Table preview</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      {table.columns.map((c) => <th key={c} className="px-2 py-1 text-left">{c}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows?.map((r, i) => (
                      <tr key={i} className="border-t">
                        {table.columns.map((c) => <td key={c} className="px-2 py-1">{String(r[c] ?? '')}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : (
            <section className="bg-white border p-4 rounded-sm text-sm text-black/60">
              Select a book sheet to inspect.
            </section>
          )}
        </main>
      </div>
    </div>
  );
}