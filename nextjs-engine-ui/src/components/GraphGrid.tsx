'use client'
import React, { useEffect, useState, useRef } from 'react';
import { listGraphs } from '@/lib/apiClient';

type Props = {
  projectId: string | null;
  pollIntervalMs?: number;
};

export default function GraphGrid({ projectId, pollIntervalMs = 3000 }: Props) {
  const [graphs, setGraphs] = useState<string[]>([]);
  const [manifest, setManifest] = useState<Record<string, any>>({});
  const mountedRef = useRef(true);
  const ENGINE_URL = (process.env.NEXT_PUBLIC_ENGINE_URL || 'http://localhost:8000').replace(/\/$/, '');

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetch = async () => {
    if (!projectId) {
      setGraphs([]);
      setManifest({});
      return;
    }
    try {
      const res = await listGraphs(projectId);
      const files = res?.files ?? res?.data?.files ?? [];
      const man = res?.manifest ?? res?.data?.manifest ?? {};
      if (!mountedRef.current) return;
      setGraphs(Array.isArray(files) ? files : []);
      setManifest(typeof man === 'object' && man ? man : {});
    } catch (err) {
      console.error('GraphGrid: failed to list graphs', err);
    }
  };

  // fetch on projectId change and poll passively
  useEffect(() => {
    fetch();
    if (!projectId) return;
    const iv = setInterval(() => fetch(), pollIntervalMs);
    return () => clearInterval(iv);
  }, [projectId, pollIntervalMs]);

  const graphUrl = (filename: string) => {
    if (!projectId) return '';
    return `${ENGINE_URL}/projects/${projectId}/graphs/${encodeURIComponent(filename)}`;
  };

  const pngFiles = graphs.filter((f) => typeof f === 'string' && f.toLowerCase().endsWith('.png'));

  if (!projectId) {
    return <div className="text-sm text-black/60">No project selected</div>;
  }

  return (
    <section className="bg-white border p-4 rounded-sm">
      <h2 className="text-lg font-medium mb-4">Graphs</h2>

      {pngFiles.length === 0 ? (
        <div className="text-sm text-black/60">No graphs found</div>
      ) : (
        // limit to maximum of two columns
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {pngFiles.map((file) => (
            <div key={file} className="bg-gray-50 border rounded overflow-hidden">
              <div className="p-3">
                <div className="text-sm font-medium mb-1">{manifest[file]?.title ?? file}</div>
                <div className="text-xs text-black/60 mb-2">File: {file}</div>
              </div>
              <div className="w-full h-64 bg-white flex items-center justify-center overflow-hidden">
                <img src={graphUrl(file)} alt={file} className="max-w-full max-h-full" />
              </div>
              <div className="p-3 text-xs text-black/60">
                {manifest[file]?.type ? <div>Type: {manifest[file].type}</div> : null}
                {manifest[file]?.created_at ? <div>Created: {manifest[file].created_at}</div> : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}