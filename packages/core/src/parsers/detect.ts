/**
 * Auto-detect sequence file format
 *
 * @param text - File content
 * @returns Detected format
 */
export function detectFormat(text: string): 'fasta' | 'genbank' | 'unknown' {
  const trimmed = text.trim();

  // FASTA starts with >
  if (trimmed.startsWith('>')) {
    return 'fasta';
  }

  // GenBank starts with LOCUS
  if (trimmed.startsWith('LOCUS')) {
    return 'genbank';
  }

  return 'unknown';
}
