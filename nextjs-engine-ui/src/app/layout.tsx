'use client'
import './globals.css'
import React, { useEffect, useState } from 'react';
import ProjectHeader from '@/components/ProjectHeader';
import { Inter } from 'next/font/google';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

// export const metadata = {
//   title: 'Carbomica UI',
//   description: 'Carbon emissions modeling and analysis platform',
// };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    const readProjectId = () => {
      if (typeof window === 'undefined') return;
      const id = localStorage.getItem('engine:lastProjectId') || localStorage.getItem('engine:activeProjectId') || null;
      setProjectId(id);
    };

    readProjectId();

    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === 'engine:lastProjectId' || e.key === 'engine:activeProjectId') {
        readProjectId();
      }
    };
    window.addEventListener('storage', onStorage);

    // also listen for a custom event so in-app code can dispatch updates without touching localStorage
    const onProjectChanged = () => readProjectId();
    window.addEventListener('engine:projectChanged', onProjectChanged as EventListener);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('engine:projectChanged', onProjectChanged as EventListener);
    };
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <header className="mb-4">
            <div className="flex items-center justify-between">
              <Link href="/"><h1 className="text-xl font-bold">Carbomica UI</h1></Link>
              <nav className="text-sm space-x-3">
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/create-project">Create project</Link>
                <Link href="/inputs">Inputs</Link>
                <Link href="/scenarios">Scenarios</Link>
                <Link href="/simulation">Simulation</Link>
              </nav>
            </div>
          </header>

          {/* Project info panel just below header (client reads localStorage or prop) */}
          <div className="mb-4">
            <ProjectHeader projectId={projectId} />
          </div>

          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}