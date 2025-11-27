'use client'

import React, { useState } from 'react';

const ScenarioManager: React.FC = () => {
  const [scenarios, setScenarios] = useState<string[]>([]);
  const [newScenario, setNewScenario] = useState('');

  const handleAddScenario = () => {
    if (!newScenario.trim()) return;
    setScenarios((s) => [...s, newScenario.trim()]);
    setNewScenario('');
  };

  const handleRemoveScenario = (index: number) => {
    setScenarios((s) => s.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white border border-black/10 p-4 rounded-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-medium">Scenarios</h2>
        <button
          type="button"
          onClick={handleAddScenario}
          className="px-3 py-1 border border-black rounded text-sm text-black hover:bg-black hover:text-white transition"
          aria-label="Add scenario"
        >
          Add
        </button>
      </div>

      <div className="flex gap-2 mb-3">
        <input
          id="new-scenario"
          type="text"
          value={newScenario}
          onChange={(e) => setNewScenario(e.target.value)}
          placeholder="Enter new scenario"
          className="flex-1 px-3 py-2 border border-black/10 rounded text-sm bg-white text-black"
        />
        <button
          type="button"
          onClick={handleAddScenario}
          className="px-3 py-2 border border-black rounded text-sm text-black hover:bg-black hover:text-white transition"
        >
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {scenarios.length === 0 && (
          <li className="text-sm text-black/60">No scenarios yet. Add one to begin.</li>
        )}

        {scenarios.map((scenario, index) => (
          <li
            key={index}
            className="flex items-center justify-between bg-black/2 border border-black/5 rounded px-3 py-2"
          >
            <span className="text-sm">{scenario}</span>
            <button
              type="button"
              onClick={() => handleRemoveScenario(index)}
              className="ml-3 px-2 py-1 border border-black rounded text-sm text-black hover:bg-black hover:text-white transition"
              aria-label={`Remove scenario ${scenario}`}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ScenarioManager;