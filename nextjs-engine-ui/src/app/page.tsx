'use client'

import React from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Welcome to the Carbomica UI</h1>
        <p className="text-sm">This application allows you to upload data, edit variables, create scenarios, and view results.</p>
      </header>

      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full sm:w-auto px-4 py-2 border border-black rounded text-black hover:bg-black hover:text-white transition"
          >
            Open Dashboard
          </button>
        </div>

        <div className="pt-6 border-t border-black/10 text-sm text-black/70">
          <p>
            Use the Dashboard to select a project, view its key graphs/tables and generate reports.
          </p>
        </div>
      </section>
    </div>
  );
}