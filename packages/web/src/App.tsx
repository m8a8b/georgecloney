import React, { useState, useEffect } from 'react';
import { SequenceManager } from './components/sequence/SequenceManager';
import { SequenceInfo } from './components/sequence/SequenceInfo';
import { EnzymeAnalysis } from './components/enzyme/EnzymeAnalysis';
import { DigestSimulator } from './components/digest/DigestSimulator';
import { LigationPlanner } from './components/ligation/LigationPlanner';
import { getHealth } from './api/client';
import type { SequenceRecord, DigestResponse } from './types';

function App() {
  const [sequences, setSequences] = useState<SequenceRecord[]>([]);
  const [selectedSequenceId, setSelectedSequenceId] = useState<string>('');
  const [digestResults, setDigestResults] = useState<Map<string, DigestResponse>>(new Map());
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    // Check backend health on mount
    getHealth()
      .then(() => setBackendStatus('online'))
      .catch(() => setBackendStatus('offline'));
  }, []);

  const selectedSequence = sequences.find((seq) => seq.id === selectedSequenceId);
  const vectorSequence = sequences.find((seq) => seq.role === 'vector');
  const insertSequence = sequences.find((seq) => seq.role === 'insert');
  const vectorDigest = vectorSequence ? digestResults.get(vectorSequence.id) : undefined;
  const insertDigest = insertSequence ? digestResults.get(insertSequence.id) : undefined;

  const handleDigestComplete = (sequenceId: string, result: DigestResponse) => {
    setDigestResults((prev) => new Map(prev).set(sequenceId, result));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                <span className="text-blue-600">Clone</span>Lab
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Molecular Cloning Toolkit • Powered by BioPython
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  backendStatus === 'online'
                    ? 'bg-green-500'
                    : backendStatus === 'offline'
                    ? 'bg-red-500'
                    : 'bg-yellow-500'
                }`}
              />
              <span className="text-sm text-gray-600">
                Backend {backendStatus === 'checking' ? 'checking...' : backendStatus}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {backendStatus === 'offline' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-red-600 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800">
                    Backend Connection Failed
                  </h3>
                  <p className="mt-1 text-sm text-red-700">
                    Cannot connect to Python backend at http://localhost:8000
                  </p>
                  <p className="mt-2 text-sm text-red-600">
                    Please start the backend server:
                    <code className="ml-2 px-2 py-1 bg-red-100 rounded font-mono text-xs">
                      cd backend && uvicorn app.main:app --reload
                    </code>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="px-4 sm:px-0">
            <div className="space-y-6">
              {/* Sequence Manager */}
              <SequenceManager sequences={sequences} onSequencesChange={setSequences} />

              {sequences.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Select Sequence to Analyze
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {sequences.map((seq) => (
                      <button
                        key={seq.id}
                        onClick={() =>
                          setSelectedSequenceId(
                            selectedSequenceId === seq.id ? '' : seq.id
                          )
                        }
                        className={`p-3 border rounded-lg text-left transition-colors ${
                          selectedSequenceId === seq.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="font-medium text-gray-900 truncate">
                          {seq.name}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {seq.length.toLocaleString()} bp
                        </div>
                        <div className="flex gap-1 mt-2">
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded ${
                              seq.role === 'vector'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {seq.role}
                          </span>
                          <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-700">
                            {seq.topology}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedSequence && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Sequence Info */}
                  <div className="space-y-6">
                    <SequenceInfo sequence={selectedSequence} />
                  </div>

                  {/* Middle Column - Enzyme Analysis */}
                  <div className="space-y-6">
                    <EnzymeAnalysis sequence={selectedSequence} />
                  </div>

                  {/* Right Column - Digest Simulator */}
                  <div className="space-y-6">
                    <DigestSimulator
                      sequence={selectedSequence}
                      onDigestComplete={(result) =>
                        handleDigestComplete(selectedSequence.id, result)
                      }
                    />
                  </div>
                </div>
              )}

              {/* Ligation Planner - Show only if both vector and insert are digested */}
              {vectorSequence &&
                insertSequence &&
                vectorDigest &&
                insertDigest &&
                vectorDigest.fragments.length > 0 &&
                insertDigest.fragments.length > 0 && (
                  <div className="mt-8">
                    <LigationPlanner
                      vectorFragments={vectorDigest.fragments}
                      insertFragments={insertDigest.fragments}
                      vectorName={vectorSequence.name}
                      insertName={insertSequence.name}
                    />
                  </div>
                )}

              {sequences.length === 0 && (
                <div className="max-w-2xl mx-auto mt-8 p-6 bg-blue-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">
                    🧬 Getting Started with Cloning
                  </h3>
                  <ol className="space-y-2 text-sm text-blue-800">
                    <li>
                      <strong>1. Upload your vector</strong> - Select "Vector" role and
                      "Circular" topology for plasmids
                    </li>
                    <li>
                      <strong>2. Upload your insert</strong> - Select "Insert" role (topology
                      auto-switches to "Linear")
                    </li>
                    <li>
                      <strong>3. Analyze and digest both</strong> - Find single-cutter enzymes
                      and simulate digests
                    </li>
                    <li>
                      <strong>4. Plan ligation</strong> - Select fragments and predict cloning
                      products
                    </li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            CloneLab • Powered by{' '}
            <a
              href="https://biopython.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              BioPython
            </a>{' '}
            • Open Source (MIT License)
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
