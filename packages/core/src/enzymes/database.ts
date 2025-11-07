import type { RestrictionEnzyme } from '../types';
import enzymesData from '../data/enzymes.json';

/**
 * Load the enzyme database
 *
 * @returns Record of enzyme names to enzyme definitions
 */
export function loadEnzymeDatabase(): Record<string, RestrictionEnzyme> {
  return enzymesData as Record<string, RestrictionEnzyme>;
}

/**
 * Get a specific enzyme by name
 *
 * @param name - Enzyme name (case-insensitive)
 * @returns Enzyme definition or undefined if not found
 *
 * @example
 * ```typescript
 * const ecoRI = getEnzyme('EcoRI');
 * if (ecoRI) {
 *   console.log(`Recognition sequence: ${ecoRI.recognitionSeq}`);
 * }
 * ```
 */
export function getEnzyme(name: string): RestrictionEnzyme | undefined {
  const db = loadEnzymeDatabase();

  // Try exact match first
  if (db[name]) {
    return db[name];
  }

  // Try case-insensitive match
  const lowerName = name.toLowerCase();
  for (const [key, enzyme] of Object.entries(db)) {
    if (key.toLowerCase() === lowerName) {
      return enzyme;
    }
  }

  return undefined;
}

/**
 * Get multiple enzymes by name
 *
 * @param names - Array of enzyme names
 * @returns Record of found enzymes (missing enzymes are excluded)
 *
 * @example
 * ```typescript
 * const enzymes = getEnzymes(['EcoRI', 'BamHI', 'HindIII']);
 * ```
 */
export function getEnzymes(names: string[]): Record<string, RestrictionEnzyme> {
  const result: Record<string, RestrictionEnzyme> = {};

  for (const name of names) {
    const enzyme = getEnzyme(name);
    if (enzyme) {
      result[enzyme.name] = enzyme;
    }
  }

  return result;
}

/**
 * Filter enzymes by supplier
 *
 * @param supplier - Supplier name (e.g., "NEB", "Thermo")
 * @returns Enzymes available from that supplier
 *
 * @example
 * ```typescript
 * const nebEnzymes = filterBySupplier('NEB');
 * ```
 */
export function filterBySupplier(supplier: string): Record<string, RestrictionEnzyme> {
  const db = loadEnzymeDatabase();
  const filtered: Record<string, RestrictionEnzyme> = {};
  const lowerSupplier = supplier.toLowerCase();

  for (const [name, enzyme] of Object.entries(db)) {
    if (enzyme.suppliers.some(s => s.toLowerCase().includes(lowerSupplier))) {
      filtered[name] = enzyme;
    }
  }

  return filtered;
}

/**
 * Filter enzymes by overhang type
 *
 * @param type - Overhang type ('blunt', "5'", or "3'")
 * @returns Enzymes that create that type of overhang
 *
 * @example
 * ```typescript
 * const bluntCutters = filterByOverhangType('blunt');
 * const stickyEnds = filterByOverhangType("5'");
 * ```
 */
export function filterByOverhangType(
  type: 'blunt' | "5'" | "3'"
): Record<string, RestrictionEnzyme> {
  const db = loadEnzymeDatabase();
  const filtered: Record<string, RestrictionEnzyme> = {};

  for (const [name, enzyme] of Object.entries(db)) {
    if (enzyme.overhangType === type) {
      filtered[name] = enzyme;
    }
  }

  return filtered;
}

/**
 * Search enzymes by recognition sequence pattern
 * Supports exact matches and wildcards (N = any base)
 *
 * @param pattern - Recognition sequence pattern (e.g., "GAATTC" or "GNNNNC")
 * @returns Enzymes matching the pattern
 *
 * @example
 * ```typescript
 * // Find enzymes that recognize 6bp palindromes starting with G
 * const enzymes = searchByRecognitionSeq('G????C');
 * ```
 */
export function searchByRecognitionSeq(pattern: string): Record<string, RestrictionEnzyme> {
  const db = loadEnzymeDatabase();
  const filtered: Record<string, RestrictionEnzyme> = {};
  const upperPattern = pattern.toUpperCase();

  // Convert pattern to regex (N or ? = any base)
  const regexPattern = upperPattern
    .replace(/N/g, '[ATGC]')
    .replace(/\?/g, '[ATGC]');
  const regex = new RegExp(`^${regexPattern}$`);

  for (const [name, enzyme] of Object.entries(db)) {
    if (regex.test(enzyme.recognitionSeq)) {
      filtered[name] = enzyme;
    }
  }

  return filtered;
}

/**
 * Get all enzymes that are isoschizomers (recognize same sequence)
 *
 * @param enzymeName - Reference enzyme name
 * @returns Array of isoschizomer enzyme names
 *
 * @example
 * ```typescript
 * const isos = getIsoschizomers('EcoRI');
 * // Returns other enzymes that recognize GAATTC
 * ```
 */
export function getIsoschizomers(enzymeName: string): string[] {
  const enzyme = getEnzyme(enzymeName);
  if (!enzyme) return [];

  // Check if enzyme has listed isoschizomers
  if (enzyme.isoschizomers && enzyme.isoschizomers.length > 0) {
    return enzyme.isoschizomers;
  }

  // Find all enzymes with same recognition sequence
  const db = loadEnzymeDatabase();
  const isoschizomers: string[] = [];

  for (const [name, enz] of Object.entries(db)) {
    if (name !== enzyme.name && enz.recognitionSeq === enzyme.recognitionSeq) {
      isoschizomers.push(name);
    }
  }

  return isoschizomers;
}
