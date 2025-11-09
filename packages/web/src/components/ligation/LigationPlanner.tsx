import React, { useState } from 'react';
import { storeFragments, simulateLigation } from '../../api/client';
import type { DigestFragment, LigationResponse } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

interface LigationPlannerProps {
  vectorFragments: DigestFragment[];
  insertFragments: DigestFragment[];
  vectorName: string;
  insertName: string;
}

export const LigationPlanner: React.FC<LigationPlannerProps> = ({
  vectorFragments,
  insertFragments,
  vectorName,
  insertName,
}) => {
  const [selectedVectorFragmentId, setSelectedVectorFragmentId] = useState<string>('');
  const [selectedInsertFragmentId, setSelectedInsertFragmentId] = useState<string>('');
  const [molarRatio, setMolarRatio] = useState<number>(3.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LigationResponse | null>(null);

  const handleSimulateLigation = async () => {
    if (!selectedVectorFragmentId || !selectedInsertFragmentId) {
      setError('Please select both vector and insert fragments');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Store all fragments in backend first
      await storeFragments([...vectorFragments, ...insertFragments]);

      // Simulate ligation
      const ligationResult = await simulateLigation({
        vector_fragment_id: selectedVectorFragmentId,
        insert_fragment_id: selectedInsertFragmentId,
        molar_ratio: molarRatio,
      });

      setResult(ligationResult);
    } catch (err: any) {
      setError(err.detail || err.message || 'Ligation simulation failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card title="Ligation Planner">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vector Fragment ({vectorName})
              </label>
              <select
                value={selectedVectorFragmentId}
                onChange={(e) => setSelectedVectorFragmentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select fragment...</option>
                {vectorFragments.map((fragment, index) => (
                  <option key={fragment.id} value={fragment.id}>
                    Fragment {index + 1} ({fragment.length.toLocaleString()} bp)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insert Fragment ({insertName})
              </label>
              <select
                value={selectedInsertFragmentId}
                onChange={(e) => setSelectedInsertFragmentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select fragment...</option>
                {insertFragments.map((fragment, index) => (
                  <option key={fragment.id} value={fragment.id}>
                    Fragment {index + 1} ({fragment.length.toLocaleString()} bp)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Insert:Vector Molar Ratio
            </label>
            <input
              type="number"
              min="1"
              max="10"
              step="0.5"
              value={molarRatio}
              onChange={(e) => setMolarRatio(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Typical ratio: 3:1 (higher ratios favor insert incorporation)
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <Button onClick={handleSimulateLigation} loading={loading} className="w-full">
            Simulate Ligation
          </Button>
        </div>
      </Card>

      {result && (
        <Card title="Ligation Products">
          <div className="space-y-3">
            <div className="text-sm text-gray-600 mb-3">
              Showing {result.products.length} predicted product(s), sorted by probability
            </div>

            {result.products.map((product, index) => (
              <div
                key={product.id}
                className={`p-4 border rounded-lg ${
                  product.is_desired
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white'
                } hover:border-blue-300 transition-colors`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">Product {index + 1}</h4>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${
                          product.is_desired
                            ? 'bg-green-200 text-green-900'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {product.type}
                      </span>
                      {product.is_desired && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800">
                          Desired
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{product.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>
                        <span className="font-medium">Length:</span>{' '}
                        {product.length.toLocaleString()} bp
                      </div>
                      <div>
                        <span className="font-medium">Probability:</span>{' '}
                        {(product.probability * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-sm"
                      style={{
                        background: `conic-gradient(#3b82f6 0% ${product.probability * 100}%, #e5e7eb ${product.probability * 100}% 100%)`,
                      }}
                    >
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        {(product.probability * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>

                {product.sequence.length <= 100 && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs font-mono break-all">
                    {product.sequence}
                  </div>
                )}
              </div>
            ))}

            {result.desired_product && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">
                  Success! Desired Product Predicted
                </h4>
                <p className="text-sm text-green-800">
                  The correct ligation product has a{' '}
                  {(result.desired_product.probability * 100).toFixed(1)}% probability.
                  Length: {result.desired_product.length.toLocaleString()} bp
                </p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
