import type { RestrictionEnzyme, RestrictionSite } from '../types';
import { reverseComplement } from '../utils/sequence';

/**
 * Find all restriction sites for all enzymes in a sequence
 *
 * @param sequence - DNA sequence to analyze
 * @param enzymes - Enzyme database (map of enzyme name to enzyme definition)
 * @param topology - Sequence topology ('linear' or 'circular')
 * @returns Map of enzyme name to array of sites found
 *
 * @example
 * ```typescript
 * const sites = findRestrictionSites(
 *   'ATGAATTCGCGGATCCATGC',
 *   enzymeDatabase,
 *   'linear'
 * );
 * // Returns: { 'EcoRI': [site1], 'BamHI': [site2] }
 * ```
 */
export function findRestrictionSites(
  sequence: string,
  enzymes: Record<string, RestrictionEnzyme>,
  topology: 'linear' | 'circular' = 'linear'
): Record<string, RestrictionSite[]> {
  const results: Record<string, RestrictionSite[]> = {};

  // For circular sequences, extend to handle sites spanning the origin
  const maxRecognitionLength = Math.max(
    ...Object.values(enzymes).map(e => e.recognitionSeq.length)
  );

  const searchSeq = topology === 'circular'
    ? sequence + sequence.substring(0, maxRecognitionLength)
    : sequence;

  // Find sites for each enzyme
  for (const [name, enzyme] of Object.entries(enzymes)) {
    results[name] = findSitesForEnzyme(
      searchSeq,
      enzyme,
      sequence.length,
      topology
    );
  }

  return results;
}

/**
 * Find all restriction sites for a single enzyme in a sequence
 *
 * @param sequence - DNA sequence to search
 * @param enzyme - Restriction enzyme to search for
 * @param topology - Sequence topology
 * @returns Array of restriction sites found
 *
 * @example
 * ```typescript
 * const sites = findEnzymeSites('ATGAATTCGC', ecoRI, 'linear');
 * // Returns array of sites where EcoRI cuts
 * ```
 */
export function findEnzymeSites(
  sequence: string,
  enzyme: RestrictionEnzyme,
  topology: 'linear' | 'circular' = 'linear'
): RestrictionSite[] {
  const maxLength = enzyme.recognitionSeq.length;
  const searchSeq = topology === 'circular'
    ? sequence + sequence.substring(0, maxLength)
    : sequence;

  return findSitesForEnzyme(searchSeq, enzyme, sequence.length, topology);
}

/**
 * Internal function to find sites for a single enzyme
 */
function findSitesForEnzyme(
  sequence: string,
  enzyme: RestrictionEnzyme,
  originalLength: number,
  topology: 'linear' | 'circular'
): RestrictionSite[] {
  const sites: RestrictionSite[] = [];
  const pattern = enzyme.recognitionSeq.toUpperCase();
  const patternRev = reverseComplement(pattern);

  // Search forward strand
  let pos = 0;
  while ((pos = sequence.indexOf(pattern, pos)) !== -1) {
    // Only include sites within original sequence
    if (pos < originalLength) {
      sites.push(createSite(enzyme, pos, 1));
    }
    pos++;
  }

  // Search reverse strand (only if palindrome check passes)
  if (pattern !== patternRev) {
    pos = 0;
    while ((pos = sequence.indexOf(patternRev, pos)) !== -1) {
      if (pos < originalLength) {
        sites.push(createSite(enzyme, pos, -1));
      }
      pos++;
    }
  }

  return sites;
}

/**
 * Create a RestrictionSite object from enzyme and position information
 */
function createSite(
  enzyme: RestrictionEnzyme,
  recognitionStart: number,
  strand: 1 | -1
): RestrictionSite {
  const recognitionEnd = recognitionStart + enzyme.recognitionSeq.length;

  // Calculate actual cut position based on enzyme cut positions
  let cutPosition: number;
  if (strand === 1) {
    cutPosition = recognitionStart + enzyme.cutPos5;
  } else {
    cutPosition = recognitionStart + enzyme.cutPos3;
  }

  return {
    enzyme: enzyme.name,
    position: cutPosition,
    strand,
    recognitionStart,
    recognitionEnd,
    overhangSeq: enzyme.overhangSeq,
  };
}

/**
 * Count the number of cut sites for each enzyme in a sequence
 *
 * @param sequence - DNA sequence to analyze
 * @param enzymes - Enzyme database
 * @param topology - Sequence topology
 * @returns Map of enzyme name to cut count
 *
 * @example
 * ```typescript
 * const counts = countEnzymeSites(sequence, enzymeDatabase);
 * // Returns: { 'EcoRI': 1, 'BamHI': 2, 'HindIII': 0 }
 * ```
 */
export function countEnzymeSites(
  sequence: string,
  enzymes: Record<string, RestrictionEnzyme>,
  topology: 'linear' | 'circular' = 'linear'
): Record<string, number> {
  const sites = findRestrictionSites(sequence, enzymes, topology);
  const counts: Record<string, number> = {};

  for (const [enzymeName, siteArray] of Object.entries(sites)) {
    counts[enzymeName] = siteArray.length;
  }

  return counts;
}

/**
 * Filter enzymes by the number of cut sites in a sequence
 *
 * @param sequence - DNA sequence to analyze
 * @param enzymes - Enzyme database
 * @param minCuts - Minimum number of cuts (inclusive)
 * @param maxCuts - Maximum number of cuts (inclusive)
 * @param topology - Sequence topology
 * @returns Filtered enzyme database
 *
 * @example
 * ```typescript
 * // Find enzymes that cut exactly once
 * const singleCutters = filterEnzymesByCutCount(
 *   sequence,
 *   enzymeDatabase,
 *   1,
 *   1
 * );
 * ```
 */
export function filterEnzymesByCutCount(
  sequence: string,
  enzymes: Record<string, RestrictionEnzyme>,
  minCuts: number = 0,
  maxCuts: number = Infinity,
  topology: 'linear' | 'circular' = 'linear'
): Record<string, RestrictionEnzyme> {
  const counts = countEnzymeSites(sequence, enzymes, topology);
  const filtered: Record<string, RestrictionEnzyme> = {};

  for (const [name, enzyme] of Object.entries(enzymes)) {
    const count = counts[name] || 0;
    if (count >= minCuts && count <= maxCuts) {
      filtered[name] = enzyme;
    }
  }

  return filtered;
}
