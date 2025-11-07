import React, { useState } from 'react';
import { findEnzymeSites, getSingleCutters } from '../../api/client';
import type { SequenceRecord, RestrictionSite } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

interface EnzymeAnalysisProps {
  sequence: SequenceRecord;
}

export const EnzymeAnalysis: React.FC<EnzymeAnalysisProps> = ({ sequence }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sites, setSites] = useState<Record<string, RestrictionSite[]> | null>(null);
  const [singleCutters, setSingleCutters] = useState<string[] | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);

    try {
      // Find all enzyme sites
      const sitesResult = await findEnzymeSites({
        sequence: sequence.sequence,
        topology: sequence.topology,
      });
      setSites(sitesResult.sites);

      // Find single cutters
      const cuttersResult = await getSingleCutters({
        sequence: sequence.sequence,
        topology: sequence.topology,
      });
      setSingleCutters(cuttersResult.enzymes);
    } catch (err: any) {
      setError(err.detail || err.message || 'Analysis failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const enzymeCount = sites ? Object.keys(sites).length : 0;
  const enzymesWithSites = sites
    ? Object.entries(sites).filter(([_, s]) => s.length > 0).length
    : 0;

  return (
    <div className="space-y-4">
      <Card title="Enzyme Analysis">
        <div className="space-y-4">
          <Button onClick={handleAnalyze} loading={loading} className="w-full">
            Analyze Restriction Sites
          </Button>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {sites && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-900">{enzymeCount}</p>
                  <p className="text-xs text-blue-700">Enzymes Tested</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-900">{enzymesWithSites}</p>
                  <p className="text-xs text-green-700">Enzymes with Sites</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-900">
                    {singleCutters?.length || 0}
                  </p>
                  <p className="text-xs text-purple-700">Single Cutters</p>
                </div>
              </div>

              {singleCutters && singleCutters.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Single Cutters ({singleCutters.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {singleCutters.slice(0, 20).map((enzyme) => (
                      <span
                        key={enzyme}
                        className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded"
                      >
                        {enzyme}
                      </span>
                    ))}
                    {singleCutters.length > 20 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                        +{singleCutters.length - 20} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {sites && Object.keys(sites).length > 0 && (
        <Card title="Restriction Sites">
          <div className="max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                    Enzyme
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                    Sites
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                    Positions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(sites)
                  .filter(([_, s]) => s.length > 0)
                  .sort((a, b) => a[1].length - b[1].length)
                  .map(([enzyme, enzymeSites]) => (
                    <tr key={enzyme} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">{enzyme}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{enzymeSites.length}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {enzymeSites.length <= 5
                          ? enzymeSites.map((s) => s.position).join(', ')
                          : `${enzymeSites
                              .slice(0, 5)
                              .map((s) => s.position)
                              .join(', ')}... (+${enzymeSites.length - 5})`}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
