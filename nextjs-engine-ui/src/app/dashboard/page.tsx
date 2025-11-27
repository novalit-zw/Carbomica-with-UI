"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listProjects, getSheet, getVariables } from "@/lib/apiClient";
import ProjectHeader from "@/components/ProjectHeader";
import Graph from "@/components/Graph";

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(
    typeof window !== "undefined"
      ? localStorage.getItem("engine:lastProjectId")
      : null
  );
  const [snapshot, setSnapshot] = useState<{
    rows?: any[];
    columns?: string[];
  } | null>(null);
  const [meta, setMeta] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        // listProjects() now returns normalized array
        const list = await listProjects();
        setProjects(list || []);
      } catch (err) {
        console.error("Failed to list projects", err);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setSnapshot(null);
      setMeta(null);
      return;
    }
    (async () => {
      try {
        const s = await getSheet(selectedId, "databook");
        setSnapshot({ rows: s.rows?.slice(0, 6), columns: s.columns });
      } catch (e) {
        console.warn("No databook snapshot", e);
        setSnapshot(null);
      }
      try {
        const vars = await getVariables(selectedId);
        setMeta(vars || {});
      } catch (e) {
        console.warn("Could not load variables", e);
        setMeta(null);
      }
    })();
  }, [selectedId]);

  const activate = (id: string) => {
    setSelectedId(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("engine:lastProjectId", id);
      localStorage.setItem("engine:activeProjectId", id);
      // notify other parts of the app in this same tab (storage events don't fire in same tab)
      window.dispatchEvent(new Event("engine:projectChanged"));
    }
    // force a refresh so server/client state updates and components re-render
    try {
      router.refresh();
    } catch {
      // fallback to full reload if router.refresh isn't available for some reason
      if (typeof window !== "undefined") window.location.reload();
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-black/70">
            Select a project to view key results and run scenarios.
          </p>
        </div>
        <div>
          <button
            onClick={() => router.push("/create-project")}
            className="px-3 py-2 border rounded"
          >
            Create Project
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <aside className="col-span-1 bg-white border border-black/10 p-4 rounded-sm">
          <h3 className="font-medium mb-3">Projects</h3>
          <ul className="space-y-2 text-sm">
            {projects.length === 0 && (
              <li className="text-slate-500">No projects found</li>
            )}
            {projects.map((p: any) => {
              const id = p.project_id ?? p.id ?? p;
              const name = p.project_name ?? p.project_name ?? id;
              return (
                <button
                  onClick={() => activate(id)}
                  className={`text-left py-1 px-1 w-fit border rounded-sm ${
                    selectedId === id ? "font-semibold" : ""
                  }`}
                >
                  <li key={id} className="flex items-center justify-between">
                    <div>
                      {name}

                      <div className="text-xs text-black/60">{id}</div>
                      <div>
                        {selectedId === id && (
                          <span className="text-xs px-2 py-1 bg-green-100 rounded">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                </button>
              );
            })}
          </ul>
        </aside>

        <main className="col-span-2 space-y-6">
          {selectedId ? (
            <>
              <ProjectHeader projectId={selectedId} meta={meta} />
              <section className="bg-white border border-black/10 p-4 rounded-sm">
                <h4 className="font-medium mb-3">Snapshot</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium mb-2">
                      Key table (databook)
                    </h5>
                    {snapshot?.rows ? (
                      <div className="overflow-x-auto text-sm">
                        <table className="min-w-full">
                          <thead>
                            <tr>
                              {snapshot.columns?.slice(0, 6).map((c) => (
                                <th key={c} className="px-2 py-1 text-left">
                                  {c}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {snapshot.rows.map((r: any, i: number) => (
                              <tr key={i} className="border-t">
                                {snapshot.columns?.slice(0, 6).map((c) => (
                                  <td key={c} className="px-2 py-1">
                                    {String(r[c] ?? "")}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-sm text-black/60">
                        No databook preview available
                      </div>
                    )}
                  </div>

                  <div>
                    <h5 className="text-sm font-medium mb-2">Key graph</h5>
                    <Graph
                      title="Example series"
                      data={[{ name: "A", values: [1, 2, 3, 4] }]}
                    />
                  </div>
                </div>
              </section>
            </>
          ) : (
            <div className="bg-white border border-black/10 p-6 rounded-sm text-sm text-black/60">
              Select a project from the list to view details.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
