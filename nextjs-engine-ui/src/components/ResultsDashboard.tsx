'use client'

import React from 'react';
import useEngine from '../hooks/useEngine';
import Graph from './Graph';
import DataTable from './DataTable';
import PDFReportPreview from './PDFReportPreview';

const ResultsDashboard = () => {
    const { results, loading, error } = useEngine();

    if (loading) {
        return <div className="py-6 text-center text-sm">Loading results...</div>;
    }

    if (error) {
        const message = typeof error === 'string' ? error : (error?.message ?? 'Unknown error');
        return <div className="py-6 text-center text-sm text-red-600">Error loading results: {message}</div>;
    }

    if (!results) {
        return <div className="py-6 text-center text-sm">No results available. Upload data and run a scenario to see results.</div>;
    }

    const graphData = results?.graphData ?? { labels: [], datasets: [] };
    const tableData = results?.tableData ?? [];
    const reportData = results?.reportData ?? null;

    return (
        <div className="space-y-6">
            <header className="mb-2">
                <h1 className="text-2xl font-semibold">Results Dashboard</h1>
                <p className="text-sm text-black/70">Graphs, tables and report preview for the current project.</p>
            </header>

            <section className="bg-white border border-black/10 p-4 rounded-sm">
                <h2 className="text-lg font-medium mb-3">Graphs</h2>
                <div className="h-72">
                    <Graph data={graphData} />
                </div>
            </section>

            <section className="bg-white border border-black/10 p-4 rounded-sm">
                <h2 className="text-lg font-medium mb-3">Data Table</h2>
                <DataTable data={tableData} />
            </section>

            <section className="bg-white border border-black/10 p-4 rounded-sm">
                <h2 className="text-lg font-medium mb-3">PDF Report Preview</h2>
                <PDFReportPreview data={reportData} />
            </section>
        </div>
    );
};

export default ResultsDashboard;