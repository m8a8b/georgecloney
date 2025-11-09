import React, { useState } from 'react';
import { simulateDigest } from '../../api/client';
import type { SequenceRecord, DigestResponse } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

interface DigestSimulatorProps {
  sequence: SequenceRecord;
  onDigestComplete?: (result: DigestResponse) => void;
}

export const DigestSimulator: React.FC<DigestSimulatorProps> = ({
  sequence,
  onDigestComplete
}) => {
  const [enzymes, setEnzymes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DigestResponse | null>(null);

  const handleSimulate = async () => {
    const enzymeList = enzymes
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    if (enzymeList.length === 0) {
      setError('Please enter at least one enzyme');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const digestResult = await simulateDigest({
        sequence_id: sequence.sequence,
        enzymes: enzymeList,
        topology: sequence.topology,
      });
      setResult(digestResult);

      // Call callback to notify parent
      if (onDigestComplete) {
        onDigestComplete(digestResult);
      }
    } catch (err: any) {
      setError(err.detail || err.message || 'Digest simulation failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card title="Digest Simulator">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enzymes (comma-separated)
            </label>
            <input
              type="text"
              value={enzymes}
              onChange={(e) => setEnzymes(e.target.value)}
              placeholder="EcoRI, BamHI, HindIII"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Example: EcoRI, BamHI (use single cutters for best results)
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <Button onClick={handleSimulate} loading={loading} className="w-full">
            Simulate Digest
          </Button>
        </div>
      </Card>

      {result && (
        <Card title="Digest Results">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-900">{result.total_fragments}</p>
                <p className="text-xs text-blue-700">Fragments</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-900">
                  {result.largest_fragment.toLocaleString()}
                </p>
                <p className="text-xs text-green-700">Largest (bp)</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-900">
                  {result.smallest_fragment.toLocaleString()}
                </p>
                <p className="text-xs text-purple-700">Smallest (bp)</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Fragment Details</h4>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {result.fragments.map((fragment, index) => (
                  <div
                    key={fragment.id}
                    className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        Fragment {index + 1}
                      </span>
                      <span className="text-sm font-bold text-blue-600">
                        {fragment.length.toLocaleString()} bp
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>
                        <span className="font-medium">Position:</span> {fragment.start} - {fragment.end}
                      </div>
                      <div>
                        <span className="font-medium">5' end:</span> {fragment.five_prime_end}
                      </div>
                      <div>
                        <span className="font-medium">3' end:</span> {fragment.three_prime_end}
                      </div>
                      <div>
                        <span className="font-medium">Features:</span> {fragment.features.length}
                      </div>
                    </div>
                    {fragment.sequence.length <= 100 && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono break-all">
                        {fragment.sequence}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
