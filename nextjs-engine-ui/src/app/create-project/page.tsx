'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import FileUploader from '@/components/FileUploader';
import { createProject } from '@/lib/apiClient';

export default function CreateProjectPage() {
  const router = useRouter();
  const [projectName, setProjectName] = useState('');
  const [startYear, setStartYear] = useState<number | ''>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadToken, setUploadToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="text-2xl font-semibold mb-4">Create Project</h1>

      <label className="block mb-2">Project name</label>
      <input className="w-full mb-3 px-3 py-2 border border-black/10 rounded" value={projectName} onChange={e => setProjectName(e.target.value)} />

      <label className="block mb-2">Start year</label>
      <input type="number" className="w-48 mb-3 px-3 py-2 border border-black/10 rounded" value={startYear} onChange={e => setStartYear(e.target.value ? Number(e.target.value) : '')} />

      <div className="mb-4">
        <FileUploader onFileSelected={({ file, token }) => { setSelectedFile(file); setUploadToken(token ?? null); }} />
      </div>

      <div>
        <button
          onClick={async () => {
            setLoading(true);
            try {
              if (!uploadToken) return alert('Please upload a file first');
              // createProject signature supports uploadToken (will POST upload_token form field)
              const data = await createProject(undefined, projectName || undefined, startYear || undefined, uploadToken);
              if (data?.project_id) {
                localStorage.setItem('engine:lastProjectId', data.project_id);
                router.push('/dashboard');
              } else {
                alert('Project created but no project_id returned.');
              }
            } catch (e:any) {
              alert(e?.message || 'Create failed');
            } finally { setLoading(false); }
          }}
          className="px-4 py-2 border border-black rounded"
        >
          {loading ? 'Creating…' : 'Create Project'}
        </button>
      </div>
    </div>
  );
}