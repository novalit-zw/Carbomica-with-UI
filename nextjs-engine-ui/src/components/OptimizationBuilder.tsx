'use client'
import React, { useState } from 'react';

type Optimization = {
  name: string;
  parameters: Record<string, string>;
};

const OptimizationBuilder: React.FC = () => {
  const [optimizations, setOptimizations] = useState<Optimization[]>([{ name: '', parameters: {} }]);

  const handleOptimizationChange = (index: number, field: keyof Optimization, value: any) => {
    const newOptimizations = [...optimizations];
    // @ts-ignore
    newOptimizations[index][field] = value;
    setOptimizations(newOptimizations);
  };

  const addOptimization = () => {
    setOptimizations([...optimizations, { name: '', parameters: {} }]);
  };

  const removeOptimization = (index: number) => {
    const newOptimizations = optimizations.filter((_, i) => i !== index);
    setOptimizations(newOptimizations);
  };

  const handleParameterChange = (index: number, param: string, value: string) => {
    const newOptimizations = [...optimizations];
    newOptimizations[index].parameters = { ...newOptimizations[index].parameters, [param]: value };
    setOptimizations(newOptimizations);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit optimizations to the engine or API
    console.log('optimizations', optimizations);
  };

  return (
    <div className="bg-white border border-black/10 p-4 rounded-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Optimization Builder</h2>
        <button
          type="button"
          onClick={addOptimization}
          className="px-3 py-1 border border-black rounded text-sm text-black hover:bg-black hover:text-white transition"
        >
          Add Optimization
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {optimizations.map((optimization, index) => (
          <div key={index} className="border border-black/5 p-3 rounded-sm">
            <div className="flex items-center gap-3 mb-3">
              <input
                type="text"
                placeholder="Optimization Name"
                value={optimization.name}
                onChange={(e) => handleOptimizationChange(index, 'name', e.target.value)}
                className="flex-1 px-2 py-1 border border-black/10 rounded text-sm bg-white text-black"
              />
              <button
                type="button"
                onClick={() => removeOptimization(index)}
                className="px-2 py-1 border border-black rounded text-sm text-black hover:bg-black hover:text-white transition"
              >
                Remove
              </button>
            </div>

            <div className="space-y-2">
              {/* Example single parameter input; adapt to dynamic params as needed */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Parameter name (e.g. max_iter)"
                  onChange={(e) => handleParameterChange(index, 'param1', e.target.value)}
                  className="flex-1 px-2 py-1 border border-black/10 rounded text-sm bg-white text-black"
                />
                <input
                  type="text"
                  placeholder="Value"
                  onChange={(e) => handleParameterChange(index, 'param1_value', e.target.value)}
                  className="w-40 px-2 py-1 border border-black/10 rounded text-sm bg-white text-black"
                />
              </div>
            </div>
          </div>
        ))}

        <div className="pt-2">
          <button
            type="submit"
            className="px-4 py-2 border border-black rounded text-black hover:bg-black hover:text-white transition"
          >
            Submit Optimizations
          </button>
        </div>
      </form>
    </div>
  );
};

export default OptimizationBuilder;