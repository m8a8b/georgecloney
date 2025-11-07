import React, { useState, useEffect } from 'react';
import { SequenceUpload } from './components/sequence/SequenceUpload';
import { SequenceInfo } from './components/sequence/SequenceInfo';
import { EnzymeAnalysis } from './components/enzyme/EnzymeAnalysis';
import { DigestSimulator } from './components/digest/DigestSimulator';
import { getHealth } from './api/client';
import type { SequenceRecord } from './types';

function App() {
  const [sequence, setSequence] = useState<SequenceRecord | null>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    // Check backend health on mount
    getHealth()
      .then(() => setBackendStatus('online'))
      .catch(() => setBackendStatus('offline'));
  }, []);

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
            {!sequence ? (
              /* Upload View */
              <div className="max-w-2xl mx-auto">
                <SequenceUpload onSequenceParsed={setSequence} />

                <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">
                    🧬 Getting Started
                  </h3>
                  <ol className="space-y-2 text-sm text-blue-800">
                    <li>
                      <strong>1. Upload your sequence</strong> - FASTA or GenBank format
                    </li>
                    <li>
                      <strong>2. Analyze restriction sites</strong> - Find single cutters for cloning
                    </li>
                    <li>
                      <strong>3. Simulate digests</strong> - See predicted fragments
                    </li>
                    <li>
                      <strong>4. Plan your cloning</strong> - Get enzyme pair suggestions
                    </li>
                  </ol>
                </div>
              </div>
            ) : (
              /* Analysis View */
              <div className="space-y-6">
                {/* Action Bar */}
                <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{sequence.name}</h2>
                    <p className="text-sm text-gray-600">
                      {sequence.length.toLocaleString()} bp • {sequence.topology}
                    </p>
                  </div>
                  <button
                    onClick={() => setSequence(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    ← Upload New Sequence
                  </button>
                </div>

                {/* Analysis Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Sequence Info */}
                  <div className="space-y-6">
                    <SequenceInfo sequence={sequence} />
                  </div>

                  {/* Middle Column - Enzyme Analysis */}
                  <div className="space-y-6">
                    <EnzymeAnalysis sequence={sequence} />
                  </div>

                  {/* Right Column - Digest Simulator */}
                  <div className="space-y-6">
                    <DigestSimulator sequence={sequence} />
                  </div>
                </div>
              </div>
            )}
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
