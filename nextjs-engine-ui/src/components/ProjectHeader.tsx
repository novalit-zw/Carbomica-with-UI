'use client'
import React, { useEffect, useState } from 'react';
import { getVariables } from '@/lib/apiClient';

type Props = {
  projectId?: string | null;
  meta?: any;
};

export default function ProjectHeader({ projectId: propId, meta: initialMeta }: Props) {
  const [projectId, setProjectId] = useState<string | null>(propId ?? null);
  const [meta, setMeta] = useState<any>(initialMeta ?? null);
  const [loading, setLoading] = useState<boolean>(false);

  // Keep projectId in sync with prop changes and fall back to localStorage only when prop not provided
  useEffect(() => {
    if (propId) {
      setProjectId(propId);
      return;
    }
    const id = typeof window !== 'undefined'
      ? (localStorage.getItem('engine:lastProjectId') || localStorage.getItem('engine:activeProjectId'))
      : null;
    setProjectId(id);
  }, [propId]);

  // Sync meta when parent supplies it, otherwise fetch when projectId changes
  useEffect(() => {
    let mounted = true;
    if (initialMeta) {
      setMeta(initialMeta);
      return;
    }
    if (!projectId) {
      setMeta(null);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const vars = await getVariables(projectId);
        if (!mounted) return;
        setMeta(vars ?? {});
      } catch (e) {
        console.warn('Could not fetch project variables', e);
        if (mounted) setMeta({});
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [projectId, initialMeta]);

  if (!projectId) {
    return <div className="text-sm text-black/60">No active project selected</div>;
  }

  const name = meta?.project_name ?? projectId;
  const facility = meta?.facility_code ?? 'unknown';
  const startYear = meta?.start_year ?? null;
  const endYear = startYear ? Number(startYear) + 5 : null;

  return (
    <div className="bg-white border border-black/10 p-4 rounded-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-black/60">Project</div>
          <div className="text-lg font-semibold">{name}</div>
          <div className="text-xs text-black/60 mt-1">
            Facility:&nbsp;
            <span className="font-medium">{facility}</span>
            {startYear ? (
              <span className="ml-3">• Years: {startYear}–{endYear}</span>
            ) : null}
          </div>
        </div>
        <div className="text-xs text-black/60">
          <div>ID:</div>
          <div className="font-mono text-sm break-all">{projectId}</div>
        </div>
      </div>

      {loading && <div className="mt-2 text-xs text-black/50">Loading project info…</div>}
    </div>
  );
}