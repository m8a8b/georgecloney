import React from 'react';
import type { SequenceRecord } from '../../types';
import { Card } from '../common/Card';

interface SequenceInfoProps {
  sequence: SequenceRecord;
}

export const SequenceInfo: React.FC<SequenceInfoProps> = ({ sequence }) => {
  return (
    <Card title="Sequence Information">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Name</p>
          <p className="font-medium text-gray-900">{sequence.name}</p>
        </div>

        <div>
          <p className="text-sm text-gray-600">Length</p>
          <p className="font-medium text-gray-900">{sequence.length.toLocaleString()} bp</p>
        </div>

        <div>
          <p className="text-sm text-gray-600">Topology</p>
          <p className="font-medium text-gray-900 capitalize">{sequence.topology}</p>
        </div>

        <div>
          <p className="text-sm text-gray-600">GC Content</p>
          <p className="font-medium text-gray-900">{sequence.gc_content.toFixed(1)}%</p>
        </div>

        <div>
          <p className="text-sm text-gray-600">Molecular Weight</p>
          <p className="font-medium text-gray-900">
            {(sequence.molecular_weight / 1000).toFixed(1)} kDa
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-600">Features</p>
          <p className="font-medium text-gray-900">{sequence.features.length}</p>
        </div>
      </div>

      {sequence.description && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">Description</p>
          <p className="text-sm text-gray-900 mt-1">{sequence.description}</p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-2">Sequence Preview</p>
        <div className="bg-gray-50 p-3 rounded font-mono text-xs break-all max-h-24 overflow-y-auto">
          {sequence.sequence.slice(0, 300)}
          {sequence.sequence.length > 300 && '...'}
        </div>
      </div>
    </Card>
  );
};
