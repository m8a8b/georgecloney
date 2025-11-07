/**
 * Utility functions for DNA sequence manipulation
 */

/**
 * Validate that a sequence contains only valid IUPAC DNA characters
 * Valid characters: A, T, G, C, N (and some ambiguity codes)
 *
 * @param sequence - DNA sequence to validate
 * @returns true if valid, false otherwise
 */
export function validateSequence(sequence: string): boolean {
  // IUPAC nucleotide codes including ambiguity codes
  const validChars = /^[ATGCNRYSWKMBDHV]+$/i;
  return validChars.test(sequence);
}

/**
 * Calculate GC content percentage of a DNA sequence
 *
 * @param sequence - DNA sequence
 * @returns GC content as percentage (0-100)
 */
export function calculateGC(sequence: string): number {
  if (sequence.length === 0) return 0;

  const gcCount = (sequence.match(/[GCgc]/g) || []).length;
  return (gcCount / sequence.length) * 100;
}

/**
 * Calculate molecular weight of a DNA sequence
 * Uses average molecular weights for dsDNA
 *
 * Average MW per base pair:
 * - A: 313.2 g/mol
 * - T: 304.2 g/mol
 * - G: 329.2 g/mol
 * - C: 289.2 g/mol
 *
 * @param sequence - DNA sequence
 * @returns Molecular weight in Daltons (g/mol)
 */
export function calculateMW(sequence: string): number {
  const weights: Record<string, number> = {
    'A': 313.2,
    'T': 304.2,
    'G': 329.2,
    'C': 289.2,
    'N': 308.95, // Average of all four bases
  };

  let totalWeight = 0;
  for (const base of sequence.toUpperCase()) {
    totalWeight += weights[base] || 308.95; // Use average for unknown bases
  }

  return totalWeight;
}

/**
 * Get reverse complement of a DNA sequence
 *
 * @param sequence - DNA sequence
 * @returns Reverse complement sequence
 */
export function reverseComplement(sequence: string): string {
  const complement: Record<string, string> = {
    'A': 'T',
    'T': 'A',
    'G': 'C',
    'C': 'G',
    'N': 'N',
    // Ambiguity codes
    'R': 'Y',
    'Y': 'R',
    'S': 'S',
    'W': 'W',
    'K': 'M',
    'M': 'K',
    'B': 'V',
    'D': 'H',
    'H': 'D',
    'V': 'B',
  };

  return sequence
    .toUpperCase()
    .split('')
    .reverse()
    .map(base => complement[base] || 'N')
    .join('');
}

/**
 * Normalize a DNA sequence (uppercase, remove whitespace and numbers)
 *
 * @param sequence - Raw DNA sequence
 * @returns Normalized sequence
 */
export function normalizeSequence(sequence: string): string {
  return sequence
    .replace(/\s+/g, '')      // Remove whitespace
    .replace(/[0-9]/g, '')    // Remove numbers
    .toUpperCase();
}
