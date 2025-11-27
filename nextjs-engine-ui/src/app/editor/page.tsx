'use client'

import React, { useState } from 'react';
import VariableEditor from '@/components/VariableEditor';
import ScenarioManager from '@/components/ScenarioManager';
import OptimizationBuilder from '@/components/OptimizationBuilder';
import ResultsDashboard from '@/components/ResultsDashboard';
import useEngine from '@/hooks/useEngine';

const EditorPage: React.FC = () => {
  const { executeScenario, results, loading } = useEngine();
  const [variables, setVariables] = useState<Record<string, any>>({});
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [optimizations, setOptimizations] = useState<any[]>([]);

  const handleRunScenario = async () => {
    // send a single payload object your engine API expects
    await executeScenario({ variables, scenarios, optimizations });
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Scenario Editor</h1>
        <p className="text-sm text-black/70">Edit variables, create scenarios and optimizations, then run.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <section className="bg-white border border-black/10 p-4 rounded-sm">
            <h2 className="text-lg font-medium mb-3">Variables</h2>
            <VariableEditor variables={variables} onVariablesChange={setVariables} />
          </section>

          <section className="bg-white border border-black/10 p-4 rounded-sm">
            <h2 className="text-lg font-medium mb-3">Scenarios</h2>
            <ScenarioManager scenarios={scenarios} setScenarios={setScenarios} />
          </section>

          <section className="bg-white border border-black/10 p-4 rounded-sm">
            <h2 className="text-lg font-medium mb-3">Optimizations</h2>
            <OptimizationBuilder optimizations={optimizations} setOptimizations={setOptimizations} />
          </section>

          <div className="pt-2">
            <button
              onClick={handleRunScenario}
              disabled={loading}
              className="px-4 py-2 border border-black rounded text-black hover:bg-black hover:text-white transition disabled:opacity-50"
            >
              {loading ? 'Running…' : 'Run Scenario'}
            </button>
          </div>
        </div>

        <div>
          <section className="bg-white border border-black/10 p-4 rounded-sm h-full">
            <h2 className="text-lg font-medium mb-3">Results</h2>
            <ResultsDashboard />
          </section>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;