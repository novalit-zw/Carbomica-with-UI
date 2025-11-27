'use client'
import React, { useEffect, useState } from 'react';
import { getSheet, saveSheet } from '@/lib/apiClient';

const SHEETS_TO_RENDER = [
  'emission sources',
  'emission data',
  'interventions',
  'emission targets',
  'effect sizes',
  'implementation costs',
  'maintenance costs',
];

// treat these sheets as currency (2 decimal places)
const COST_SHEETS = ['implementation costs', 'maintenance costs'];

type SheetData = {
  sheet?: string;
  rows: Record<string, any>[];
  columns: string[];
};

function formatCurrency(v: any) {
  if (v === null || v === undefined || v === '') return '';
  const n = Number(v);
  if (Number.isNaN(n)) return '';
  return n.toFixed(2);
}

// allow up to 2 decimal places, optional leading -, digits, optional decimals
const CURRENCY_RE = /^-?\d*(\.\d{0,2})?$/;

export default function InputsPage() {
  const projectId = typeof window !== 'undefined' ? localStorage.getItem('engine:lastProjectId') : null;
  const [sheets, setSheets] = useState<Record<string, SheetData | null>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    (async () => {
      try {
        const results: Record<string, SheetData | null> = {};
        for (const sheetName of SHEETS_TO_RENDER) {
          try {
            const res = await getSheet(projectId!, 'databook', sheetName);
            results[sheetName] = {
              sheet: res.sheet,
              rows: res.rows ?? [],
              columns: res.columns ?? [],
            };
          } catch (err) {
            results[sheetName] = null;
            console.warn(`Could not load sheet ${sheetName}:`, err);
          }
        }
        setSheets(results);
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId]);

  const updateCell = (sheetName: string, rowIndex: number, col: string, value: any) => {
    setSheets((prev) => {
      const copy = { ...prev };
      const s = copy[sheetName];
      if (!s) return prev;
      const rows = [...s.rows];
      rows[rowIndex] = { ...rows[rowIndex], [col]: value };
      copy[sheetName] = { ...s, rows };
      return copy;
    });
  };

  const handleCurrencyChange = (sheetName: string, rowIndex: number, col: string, raw: string) => {
    // allow empty
    if (raw === '' || raw === null) {
      updateCell(sheetName, rowIndex, col, '');
      return;
    }
    // validate allowed characters/format (allows partial input)
    if (!CURRENCY_RE.test(raw)) {
      // invalid input — ignore change
      return;
    }
    // store as string while typing to avoid forcing formatting mid-type
    updateCell(sheetName, rowIndex, col, raw);
  };

  const handleCurrencyBlur = (sheetName: string, rowIndex: number, col: string, raw: string) => {
    if (raw === '' || raw === null) {
      updateCell(sheetName, rowIndex, col, '');
      return;
    }
    const n = Number(raw);
    if (Number.isNaN(n)) {
      updateCell(sheetName, rowIndex, col, '');
      return;
    }
    updateCell(sheetName, rowIndex, col, Number(n.toFixed(2)));
  };

  const addRow = (sheetName: string) => {
    setSheets((prev) => {
      const copy = { ...prev };
      const s = copy[sheetName];
      if (!s) return prev;
      const empty: Record<string, any> = {};
      s.columns.forEach((c) => (empty[c] = ''));
      copy[sheetName] = { ...s, rows: [...s.rows, empty] };
      return copy;
    });
  };

  const removeRow = (sheetName: string, rowIndex: number) => {
    setSheets((prev) => {
      const copy = { ...prev };
      const s = copy[sheetName];
      if (!s) return prev;
      const rows = s.rows.filter((_, i) => i !== rowIndex);
      copy[sheetName] = { ...s, rows };
      return copy;
    });
  };

  const saveSheetToServer = async (sheetName: string) => {
    if (!projectId) {
      alert('No active project selected');
      return;
    }
    const s = sheets[sheetName];
    if (!s) {
      alert('No data to save for ' + sheetName);
      return;
    }
    try {
      // ensure currency columns are numbers with 2 decimals
      const rowsToSave = s.rows.map((r) => {
        if (COST_SHEETS.includes(sheetName)) {
          const out: Record<string, any> = {};
          Object.entries(r).forEach(([k, v]) => {
            if (v === '' || v === null || v === undefined) {
              out[k] = '';
            } else {
              // parse numeric if possible
              const n = Number(String(v).replace(/[^0-9.-]/g, ''));
              out[k] = Number.isNaN(n) ? '' : Number(n.toFixed(2));
            }
          });
          return out;
        }
        return r;
      });

      await saveSheet(projectId, { sheet: sheetName, rows: rowsToSave, columns: s.columns });
      alert(`Saved ${sheetName}`);
    } catch (err) {
      console.error('Save failed', err);
      alert('Save failed');
    }
  };

  if (!projectId) return <div className="text-sm text-black/60">No active project selected</div>;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-semibold mb-4">Inputs / Databook</h1>

      {loading && <div className="mb-4 text-sm text-black/60">Loading sheets…</div>}

      <div className="space-y-6">
        {SHEETS_TO_RENDER.map((sheetName) => {
          const s = sheets[sheetName];
          return (
            <section key={sheetName} className="bg-white border border-black/10 p-4 rounded-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm font-medium">{sheetName}</h2>
                  <div className="text-xs text-black/60">{s ? `${s.rows.length} rows` : 'Not available'}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => addRow(sheetName)}
                    disabled={!s}
                    className="px-2 py-1 text-sm border rounded disabled:opacity-50"
                  >
                    Add row
                  </button>
                  <button
                    onClick={() => saveSheetToServer(sheetName)}
                    disabled={!s}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              </div>

              {!s ? (
                <div className="text-sm text-black/60">Sheet not found in project workbook</div>
              ) : s.columns.length === 0 ? (
                <div className="text-sm text-black/60">Sheet is empty</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr>
                        {s.columns.map((c) => (
                          <th key={c} className="px-2 py-1 text-left bg-black/2">{c}</th>
                        ))}
                        <th className="px-2 py-1" />
                      </tr>
                    </thead>
                    <tbody>
                      {s.rows.map((row, i) => (
                        <tr key={i} className="border-t">
                          {s.columns.map((c) => {
                            const isCost = COST_SHEETS.includes(sheetName);
                            const rawValue = row[c] ?? '';
                            const displayValue = isCost ? (typeof rawValue === 'number' ? formatCurrency(rawValue) : String(rawValue)) : rawValue ?? '';
                            return (
                              <td key={c} className="px-2 py-1 align-top">
                                {isCost ? (
                                  <input
                                    inputMode="decimal"
                                    pattern="^-?\d*(\.\d{0,2})?$"
                                    step="0.01"
                                    className="w-full px-2 py-1 border border-black/10 rounded text-sm"
                                    value={displayValue}
                                    onChange={(e) => handleCurrencyChange(sheetName, i, c, e.target.value)}
                                    onBlur={(e) => handleCurrencyBlur(sheetName, i, c, e.target.value)}
                                  />
                                ) : (
                                  <input
                                    className="w-full px-2 py-1 border border-black/10 rounded text-sm"
                                    value={displayValue}
                                    onChange={(e) => updateCell(sheetName, i, c, e.target.value)}
                                  />
                                )}
                              </td>
                            );
                          })}
                          <td className="px-2 py-1">
                            <button
                              onClick={() => removeRow(sheetName, i)}
                              className="px-2 py-1 text-xs border rounded"
                              aria-label={`Remove row ${i + 1}`}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}