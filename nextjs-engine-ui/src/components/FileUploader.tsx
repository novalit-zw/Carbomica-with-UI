'use client'
import React, { useState } from 'react';
import { uploadTemp } from '@/lib/apiClient';

interface SelectedPayload {
  file: File | null;
  token?: string | null;
}
interface Props { onFileSelected?: (payload: SelectedPayload) => void; }

const FileUploader: React.FC<Props> = ({ onFileSelected }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setToken(null);
    if (!selectedFile) {
      setFile(null);
      setError(null);
      onFileSelected?.({ file: null, token: null });
      return;
    }
    if (!selectedFile.name.toLowerCase().endsWith('.xlsx')) {
      setFile(null);
      setError('Please upload a valid .xlsx file.');
      onFileSelected?.({ file: null, token: null });
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Immediately upload to temp endpoint and provide token to parent
    setLoading(true);
    try {
      const res = await uploadTemp(selectedFile);
      // uploadTemp returns { uploaded: true, token, filename, path }
      const tok = res?.token ?? null;
      setToken(tok);
      onFileSelected?.({ file: selectedFile, token: tok });
    } catch (err: any) {
      console.error('upload-temp failed', err);
      setError(err?.message ?? 'Upload failed.');
      setFile(null);
      onFileSelected?.({ file: null, token: null });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setError(null);
    setToken(null);
    onFileSelected?.({ file: null, token: null });
  };

  return (
    <div className="w-full max-w-lg">
      <label className="block mb-2 text-sm font-medium">Select input_data.xlsx</label>

      <input
        type="file"
        accept=".xlsx"
        onChange={handleFileChange}
        className="block w-full text-sm text-black/90 mb-3"
      />

      {file && (
        <div className="mb-3 text-sm text-black/80">
          Selected file: <span className="font-medium">{file.name}</span>
        </div>
      )}

      {token && (
        <div className="mb-3 text-sm text-black/60">
          Uploaded (temp token): <span className="font-medium">{token}</span>
        </div>
      )}

      {error && (
        <p className="mb-3 text-sm text-red-700" role="status" aria-live="polite">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleClear}
          type="button"
          className="px-4 py-2 border border-black rounded text-black hover:bg-black hover:text-white transition"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default FileUploader;