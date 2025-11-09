import React, { useState } from 'react';
import { parseSequence } from '../../api/client';
import type { SequenceRecord } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

interface SequenceManagerProps {
  sequences: SequenceRecord[];
  onSequencesChange: (sequences: SequenceRecord[]) => void;
}

export const SequenceManager: React.FC<SequenceManagerProps> = ({
  sequences,
  onSequencesChange,
}) => {
  const [fileContent, setFileContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'vector' | 'insert'>('vector');
  const [selectedTopology, setSelectedTopology] = useState<'linear' | 'circular'>('circular');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    try {
      const content = await file.text();
      setFileContent(content);
    } catch (err) {
      setError('Failed to read file');
      console.error(err);
    }
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFileContent(e.target.value);
    setError(null);
  };

  const handleAddSequence = async () => {
    if (!fileContent.trim()) {
      setError('Please provide sequence content');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const parsedSequence = await parseSequence({ content: fileContent });

      // Add role and override topology
      const sequenceWithMeta: SequenceRecord = {
        ...parsedSequence,
        role: selectedRole,
        topology: selectedTopology,
      };

      onSequencesChange([...sequences, sequenceWithMeta]);

      // Clear form
      setFileContent('');

      // Auto-switch to insert after adding a vector
      if (selectedRole === 'vector') {
        setSelectedRole('insert');
        setSelectedTopology('linear');
      }
    } catch (err: any) {
      setError(err.detail || err.message || 'Failed to parse sequence');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSequence = (id: string) => {
    onSequencesChange(sequences.filter((seq) => seq.id !== id));
  };

  const handleChangeRole = (id: string, role: 'vector' | 'insert') => {
    onSequencesChange(
      sequences.map((seq) => (seq.id === id ? { ...seq, role } : seq))
    );
  };

  const handleChangeTopology = (id: string, topology: 'linear' | 'circular') => {
    onSequencesChange(
      sequences.map((seq) => (seq.id === id ? { ...seq, topology } : seq))
    );
  };

  return (
    <div className="space-y-4">
      <Card title="Add Sequence">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as 'vector' | 'insert')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="vector">Vector (Plasmid)</option>
                <option value="insert">Insert (Gene)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topology
              </label>
              <select
                value={selectedTopology}
                onChange={(e) => setSelectedTopology(e.target.value as 'linear' | 'circular')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="circular">Circular (Plasmid)</option>
                <option value="linear">Linear (PCR product)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File or Paste Sequence
            </label>
            <input
              type="file"
              accept=".fasta,.fa,.gb,.gbk,.txt"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <textarea
            value={fileContent}
            onChange={handleTextAreaChange}
            placeholder=">sequence_name&#10;ATGCATGCATGC&#10;&#10;or paste GenBank format..."
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <Button onClick={handleAddSequence} loading={loading} className="w-full">
            Add Sequence
          </Button>
        </div>
      </Card>

      {sequences.length > 0 && (
        <Card title={`Sequences (${sequences.length})`}>
          <div className="space-y-3">
            {sequences.map((seq) => (
              <div
                key={seq.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{seq.name}</h4>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${
                          seq.role === 'vector'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {seq.role || 'unassigned'}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${
                          seq.topology === 'circular'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {seq.topology}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {seq.length.toLocaleString()} bp • GC: {seq.gc_content.toFixed(1)}%
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveSequence(seq.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3">
                  <select
                    value={seq.role || 'vector'}
                    onChange={(e) =>
                      handleChangeRole(seq.id, e.target.value as 'vector' | 'insert')
                    }
                    className="text-sm px-2 py-1 border border-gray-300 rounded"
                  >
                    <option value="vector">Vector</option>
                    <option value="insert">Insert</option>
                  </select>

                  <select
                    value={seq.topology}
                    onChange={(e) =>
                      handleChangeTopology(seq.id, e.target.value as 'linear' | 'circular')
                    }
                    className="text-sm px-2 py-1 border border-gray-300 rounded"
                  >
                    <option value="circular">Circular</option>
                    <option value="linear">Linear</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
