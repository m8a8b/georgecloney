import React, { useState } from 'react';
import { parseSequence, detectFormat } from '../../api/client';
import type { SequenceRecord } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

interface SequenceUploadProps {
  onSequenceParsed: (sequence: SequenceRecord) => void;
}

export const SequenceUpload: React.FC<SequenceUploadProps> = ({ onSequenceParsed }) => {
  const [fileContent, setFileContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedFormat, setDetectedFormat] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setDetectedFormat(null);

    try {
      const content = await file.text();
      setFileContent(content);

      // Auto-detect format
      const result = await detectFormat(content);
      setDetectedFormat(result.format);
    } catch (err) {
      setError('Failed to read file');
      console.error(err);
    }
  };

  const handleTextAreaChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    setFileContent(content);
    setError(null);

    if (content.trim()) {
      try {
        const result = await detectFormat(content);
        setDetectedFormat(result.format);
      } catch (err) {
        console.error('Format detection failed:', err);
      }
    } else {
      setDetectedFormat(null);
    }
  };

  const handleParse = async () => {
    if (!fileContent.trim()) {
      setError('Please provide sequence content');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const sequence = await parseSequence({ content: fileContent });
      onSequenceParsed(sequence);
    } catch (err: any) {
      setError(err.detail || err.message || 'Failed to parse sequence');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Upload Sequence">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload File (FASTA or GenBank)
          </label>
          <input
            type="file"
            accept=".fasta,.fa,.gb,.gbk,.txt"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div className="text-center text-sm text-gray-500">— or —</div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paste Sequence
          </label>
          <textarea
            value={fileContent}
            onChange={handleTextAreaChange}
            placeholder=">sequence_name&#10;ATGCATGCATGC&#10;&#10;or paste GenBank format..."
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
        </div>

        {detectedFormat && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Detected format:</span>
            <span
              className={`px-2 py-1 rounded font-medium ${
                detectedFormat === 'unknown'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {detectedFormat.toUpperCase()}
            </span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <Button onClick={handleParse} loading={loading} className="w-full">
          Parse Sequence
        </Button>
      </div>
    </Card>
  );
};
