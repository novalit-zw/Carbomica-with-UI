import React, { useState, useEffect, useRef } from 'react';

type VarItem = { name: string; value: any };

interface Props {
  variables: any;
  onVariablesChange: (vars: any) => void;
}

const VariableEditor: React.FC<Props> = ({ variables, onVariablesChange }) => {
  const formatRef = useRef<'array' | 'object' | 'unknown'>('unknown');
  const [editedVariables, setEditedVariables] = useState<VarItem[]>([]);

  useEffect(() => {
    // normalize incoming variables to an array of {name, value}
    if (Array.isArray(variables)) {
      formatRef.current = 'array';
      const arr: VarItem[] = variables.map((v: any) => {
        if (v && typeof v === 'object' && 'name' in v) {
          return { name: String(v.name), value: v.value ?? '' };
        }
        // if array item is [name, value] or primitive, try to handle
        if (Array.isArray(v) && v.length >= 2) return { name: String(v[0]), value: v[1] };
        return { name: String(v?.name ?? ''), value: v?.value ?? '' };
      });
      setEditedVariables(arr);
    } else if (variables && typeof variables === 'object') {
      formatRef.current = 'object';
      const arr = Object.entries(variables).map(([k, v]) => ({ name: k, value: v }));
      setEditedVariables(arr);
    } else {
      formatRef.current = 'unknown';
      setEditedVariables([]);
    }
  }, [variables]);

  const emitChange = (updated: VarItem[]) => {
    // convert back to original format
    if (formatRef.current === 'object') {
      const obj: Record<string, any> = {};
      updated.forEach((it) => {
        obj[it.name] = it.value;
      });
      onVariablesChange(obj);
    } else {
      onVariablesChange(updated);
    }
  };

  const handleChange = (index: number, field: keyof VarItem, value: any) => {
    const updatedVariables = editedVariables.slice();
    updatedVariables[index] = { ...updatedVariables[index], [field]: value };
    setEditedVariables(updatedVariables);
    emitChange(updatedVariables);
  };

  const handleAdd = () => {
    const updated = [...editedVariables, { name: '', value: '' }];
    setEditedVariables(updated);
    emitChange(updated);
  };

  const handleRemove = (index: number) => {
    const updated = editedVariables.slice();
    updated.splice(index, 1);
    setEditedVariables(updated);
    emitChange(updated);
  };

  return (
    <div className="bg-white border border-black/10 p-4 rounded-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-medium">Edit Variables</h2>
        <button
          type="button"
          onClick={handleAdd}
          className="px-3 py-1 border border-black rounded text-sm text-black hover:bg-black hover:text-white transition"
        >
          Add
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm table-auto border-collapse">
          <thead>
            <tr className="text-left">
              <th className="pb-2 pr-4">Name</th>
              <th className="pb-2 pr-4">Value</th>
              <th className="pb-2 w-16">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(editedVariables || []).map((variable, index) => (
              <tr key={index} className="border-t border-black/5">
                <td className="pr-4 py-2">
                  <input
                    className="w-full px-2 py-1 border border-black/10 rounded text-sm bg-white text-black"
                    value={variable.name}
                    onChange={(e) => handleChange(index, 'name', e.target.value)}
                  />
                </td>
                <td className="pr-4 py-2">
                  <input
                    className="w-full px-2 py-1 border border-black/10 rounded text-sm bg-white text-black"
                    value={variable.value ?? ''}
                    onChange={(e) => handleChange(index, 'value', e.target.value)}
                  />
                </td>
                <td className="py-2">
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="px-2 py-1 border border-black rounded text-sm text-black hover:bg-black hover:text-white transition"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}

            {editedVariables.length === 0 && (
              <tr>
                <td colSpan={3} className="py-4 text-sm text-black/60">
                  No variables. Click Add to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VariableEditor;