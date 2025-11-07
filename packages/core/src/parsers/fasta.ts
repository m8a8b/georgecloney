import type { SequenceRecord } from '../types';
import { calculateGC, calculateMW, validateSequence, normalizeSequence } from '../utils/sequence';

/**
 * Parse FASTA format sequence
 *
 * Format:
 * >sequence_name description
 * ATGCATGCATGC
 * ATGCATGCATGC
 *
 * @param text - Raw FASTA text
 * @returns Parsed sequence record
 * @throws Error if format is invalid
 */
export function parseFasta(text: string): SequenceRecord {
  const lines = text.trim().split('\n');

  if (lines.length === 0 || !lines[0].startsWith('>')) {
    throw new Error('Invalid FASTA format: missing header line starting with ">"');
  }

  // Parse header line
  const headerLine = lines[0].substring(1).trim();
  const [name, ...descriptionParts] = headerLine.split(/\s+/);
  const description = descriptionParts.join(' ') || undefined;

  // Parse sequence lines
  const rawSequence = lines
    .slice(1)
    .join('')
    .replace(/\s+/g, '')      // Remove whitespace
    .replace(/[0-9]/g, '')    // Remove numbers
    .toUpperCase();

  const sequence = normalizeSequence(rawSequence);

  // Check for empty sequence first
  if (sequence.length === 0) {
    throw new Error('Invalid FASTA format: sequence is empty');
  }

  // Validate sequence
  if (!validateSequence(sequence)) {
    throw new Error('Invalid DNA sequence: contains non-IUPAC characters');
  }

  // Generate ID using crypto.randomUUID if available, otherwise use timestamp
  const id = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `seq_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  return {
    id,
    name: name || 'Untitled Sequence',
    sequence,
    length: sequence.length,
    topology: 'linear', // FASTA doesn't specify topology
    features: [],
    gcContent: calculateGC(sequence),
    molecularWeight: calculateMW(sequence),
    createdAt: new Date(),
    modifiedAt: new Date(),
    description,
  };
}

/**
 * Parse multiple FASTA sequences from a single file
 *
 * @param text - Raw FASTA text containing multiple sequences
 * @returns Array of parsed sequence records
 */
export function parseMultiFasta(text: string): SequenceRecord[] {
  const sequences: SequenceRecord[] = [];
  const lines = text.trim().split('\n');

  let currentSequence: string[] = [];
  let currentHeader = '';

  for (const line of lines) {
    if (line.startsWith('>')) {
      // Save previous sequence if exists
      if (currentHeader && currentSequence.length > 0) {
        const fastaText = currentHeader + '\n' + currentSequence.join('\n');
        try {
          sequences.push(parseFasta(fastaText));
        } catch (error) {
          // Skip invalid sequences but continue parsing
          console.warn(`Skipping invalid sequence: ${error}`);
        }
      }

      // Start new sequence
      currentHeader = line;
      currentSequence = [];
    } else {
      currentSequence.push(line);
    }
  }

  // Don't forget the last sequence
  if (currentHeader && currentSequence.length > 0) {
    const fastaText = currentHeader + '\n' + currentSequence.join('\n');
    try {
      sequences.push(parseFasta(fastaText));
    } catch (error) {
      console.warn(`Skipping invalid sequence: ${error}`);
    }
  }

  return sequences;
}
