import type { RestrictionEnzyme } from '../types';
import { countEnzymeSites } from './finder';

/**
 * Represents a suggested enzyme pair for cloning
 */
export interface EnzymePair {
  /** First enzyme in the pair */
  enzyme1: string;
  /** Second enzyme in the pair */
  enzyme2: string;
  /** Compatibility score (0-1, higher is better) */
  score: number;
  /** Reasons why this pair is good */
  reasons: string[];
  /** Warnings or potential issues */
  warnings: string[];
  /** Whether enzymes are compatible in the same buffer */
  bufferCompatible: boolean;
}

/**
 * Find compatible enzyme pairs for directional cloning
 *
 * This function analyzes a vector and insert sequence to suggest enzyme pairs
 * that will enable directional cloning. Good pairs have:
 * - Single cut sites in both vector and insert
 * - Different overhang sequences (prevents self-ligation)
 * - Compatible reaction buffers
 * - Low star activity risk
 *
 * @param vectorSeq - Vector DNA sequence
 * @param insertSeq - Insert DNA sequence
 * @param enzymes - Enzyme database
 * @param vectorTopology - Vector topology (usually 'circular')
 * @returns Array of suggested enzyme pairs, sorted by score
 *
 * @example
 * ```typescript
 * const pairs = suggestEnzymePairs(
 *   vectorSequence,
 *   insertSequence,
 *   enzymeDatabase,
 *   'circular'
 * );
 * console.log(`Best pair: ${pairs[0].enzyme1} + ${pairs[0].enzyme2}`);
 * ```
 */
export function suggestEnzymePairs(
  vectorSeq: string,
  insertSeq: string,
  enzymes: Record<string, RestrictionEnzyme>,
  vectorTopology: 'linear' | 'circular' = 'circular'
): EnzymePair[] {
  const pairs: EnzymePair[] = [];

  // Count cut sites for each enzyme in both sequences
  const vectorCounts = countEnzymeSites(vectorSeq, enzymes, vectorTopology);
  const insertCounts = countEnzymeSites(insertSeq, enzymes, 'linear');

  // Find enzymes that cut once in both sequences
  const singleCutters: string[] = [];
  for (const [name, enzyme] of Object.entries(enzymes)) {
    const vectorCuts = vectorCounts[name] || 0;
    const insertCuts = insertCounts[name] || 0;

    if (vectorCuts === 1 && insertCuts === 1) {
      singleCutters.push(name);
    }
  }

  // Generate all possible pairs
  for (let i = 0; i < singleCutters.length; i++) {
    for (let j = i + 1; j < singleCutters.length; j++) {
      const enz1Name = singleCutters[i];
      const enz2Name = singleCutters[j];
      const enz1 = enzymes[enz1Name];
      const enz2 = enzymes[enz2Name];

      const pair = evaluateEnzymePair(enz1, enz2);
      pairs.push(pair);
    }
  }

  // Sort by score (highest first)
  pairs.sort((a, b) => b.score - a.score);

  return pairs;
}

/**
 * Evaluate the quality of an enzyme pair for cloning
 */
function evaluateEnzymePair(
  enzyme1: RestrictionEnzyme,
  enzyme2: RestrictionEnzyme
): EnzymePair {
  let score = 0.5; // Start with neutral score
  const reasons: string[] = [];
  const warnings: string[] = [];

  // Check if overhangs are different (prevents self-ligation)
  const differentOverhangs = enzyme1.overhangSeq !== enzyme2.overhangSeq;
  if (differentOverhangs) {
    score += 0.2;
    reasons.push('Different overhangs prevent self-ligation');
  } else {
    score -= 0.2;
    warnings.push('Same overhangs may cause unwanted ligation products');
  }

  // Check buffer compatibility
  const bufferCompatible = hasCommonBuffer(enzyme1.buffers, enzyme2.buffers);
  if (bufferCompatible) {
    score += 0.15;
    reasons.push('Enzymes work in the same buffer');
  } else {
    score -= 0.1;
    warnings.push('Enzymes require different buffers (sequential digestion needed)');
  }

  // Penalize star activity risk
  if (enzyme1.starActivity) {
    score -= 0.1;
    warnings.push(`${enzyme1.name} has star activity risk`);
  }
  if (enzyme2.starActivity) {
    score -= 0.1;
    warnings.push(`${enzyme2.name} has star activity risk`);
  }

  // Prefer enzymes that can be heat inactivated
  if (enzyme1.heatInactivation && enzyme2.heatInactivation) {
    score += 0.1;
    reasons.push('Both enzymes can be heat inactivated');
  }

  // Prefer common overhang types (5' overhangs are generally more efficient)
  if (enzyme1.overhangType === "5'" && enzyme2.overhangType === "5'") {
    score += 0.05;
    reasons.push("Both create 5' overhangs (efficient ligation)");
  }

  // Warn about methylation sensitivity
  if (enzyme1.methylationSensitive) {
    warnings.push(`${enzyme1.name} is sensitive to Dam/Dcm methylation`);
  }
  if (enzyme2.methylationSensitive) {
    warnings.push(`${enzyme2.name} is sensitive to Dam/Dcm methylation`);
  }

  // Clamp score between 0 and 1
  score = Math.max(0, Math.min(1, score));

  return {
    enzyme1: enzyme1.name,
    enzyme2: enzyme2.name,
    score,
    reasons,
    warnings,
    bufferCompatible,
  };
}

/**
 * Check if two enzyme buffer lists have any common buffer
 */
function hasCommonBuffer(buffers1: string[], buffers2: string[]): boolean {
  const set1 = new Set(buffers1.map(b => b.toLowerCase()));
  return buffers2.some(b => set1.has(b.toLowerCase()));
}

/**
 * Find enzymes that cut only once in a sequence (single cutters)
 *
 * @param sequence - DNA sequence to analyze
 * @param enzymes - Enzyme database
 * @param topology - Sequence topology
 * @returns Array of enzyme names that cut exactly once
 *
 * @example
 * ```typescript
 * const singleCutters = findSingleCutters(plasmid, enzymeDatabase);
 * console.log(`Found ${singleCutters.length} single-cutter enzymes`);
 * ```
 */
export function findSingleCutters(
  sequence: string,
  enzymes: Record<string, RestrictionEnzyme>,
  topology: 'linear' | 'circular' = 'linear'
): string[] {
  const counts = countEnzymeSites(sequence, enzymes, topology);
  const singleCutters: string[] = [];

  for (const [name, count] of Object.entries(counts)) {
    if (count === 1) {
      singleCutters.push(name);
    }
  }

  return singleCutters;
}

/**
 * Find enzymes that don't cut a sequence (useful for removing from consideration)
 *
 * @param sequence - DNA sequence to analyze
 * @param enzymes - Enzyme database
 * @param topology - Sequence topology
 * @returns Array of enzyme names that don't cut the sequence
 *
 * @example
 * ```typescript
 * const nonCutters = findNonCutters(plasmid, enzymeDatabase);
 * ```
 */
export function findNonCutters(
  sequence: string,
  enzymes: Record<string, RestrictionEnzyme>,
  topology: 'linear' | 'circular' = 'linear'
): string[] {
  const counts = countEnzymeSites(sequence, enzymes, topology);
  const nonCutters: string[] = [];

  for (const name of Object.keys(enzymes)) {
    if (!counts[name] || counts[name] === 0) {
      nonCutters.push(name);
    }
  }

  return nonCutters;
}

/**
 * Group enzymes by their overhang sequences
 * Useful for finding compatible sticky ends
 *
 * @param enzymes - Enzyme database
 * @returns Map of overhang sequence to array of enzyme names
 *
 * @example
 * ```typescript
 * const groups = groupEnzymesByOverhang(enzymeDatabase);
 * // All enzymes that create AATT overhangs
 * console.log(groups['AATT']);
 * ```
 */
export function groupEnzymesByOverhang(
  enzymes: Record<string, RestrictionEnzyme>
): Record<string, string[]> {
  const groups: Record<string, string[]> = {};

  for (const [name, enzyme] of Object.entries(enzymes)) {
    const overhang = enzyme.overhangSeq || 'blunt';

    if (!groups[overhang]) {
      groups[overhang] = [];
    }
    groups[overhang].push(name);
  }

  return groups;
}
