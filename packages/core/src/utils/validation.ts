/**
 * Validation utilities
 */

/**
 * Check if a string is a valid DNA sequence
 */
export function isValidDNA(sequence: string): boolean {
  return /^[ATGCNRYSWKMBDHV]+$/i.test(sequence);
}

/**
 * Check if a number is within a valid range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Check if a value is a positive number
 */
export function isPositive(value: number): boolean {
  return value > 0;
}

/**
 * Validate enzyme name format
 */
export function isValidEnzymeName(name: string): boolean {
  // Enzyme names are typically capitalized alphanumeric (e.g., "EcoRI", "BamHI")
  return /^[A-Z][a-zA-Z0-9]+$/.test(name);
}
