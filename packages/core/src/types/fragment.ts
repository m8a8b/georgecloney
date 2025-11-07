import type { Feature } from './sequence';

/**
 * DNA fragment resulting from restriction digest
 */
export interface DigestFragment {
  /** Unique identifier */
  id: string;
  /** Fragment DNA sequence */
  sequence: string;
  /** Fragment length in bp */
  length: number;
  /** Start position in original sequence */
  start: number;
  /** End position in original sequence */
  end: number;
  /** 5' end characteristics */
  fivePrimeEnd: FragmentEnd;
  /** 3' end characteristics */
  threePrimeEnd: FragmentEnd;
  /** Features contained in fragment */
  features: Feature[];
}

/**
 * Characteristics of a fragment end
 */
export interface FragmentEnd {
  /** Type of end */
  type: 'blunt' | "5'-overhang" | "3'-overhang";
  /** Overhang sequence (if applicable) */
  overhangSeq?: string;
  /** Enzyme that created this end */
  enzyme?: string;
}
