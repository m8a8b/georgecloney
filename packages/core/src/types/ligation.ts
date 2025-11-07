import type { DigestFragment } from './fragment';

/**
 * Predicted ligation product
 */
export interface LigationProduct {
  /** Unique identifier */
  id: string;
  /** Type of product */
  type: 'correct' | 'reverse' | 'self-ligation' | 'concatemer' | 'other';
  /** Product sequence */
  sequence: string;
  /** Product length in bp */
  length: number;
  /** Estimated relative probability (0-1) */
  probability: number;
  /** Fragment IDs that were joined */
  fragmentIds: string[];
  /** Human-readable description */
  description: string;
  /** Whether this is the desired product */
  isDesired: boolean;
}

/**
 * Ligation reaction parameters
 */
export interface LigationParameters {
  /** Vector fragment */
  vectorFragment: DigestFragment;
  /** Insert fragment */
  insertFragment: DigestFragment;
  /** Molar ratio (insert:vector) */
  molarRatio: number;
  /** Vector concentration (ng/µL) */
  vectorConcentration: number;
  /** Total reaction volume (µL) */
  reactionVolume: number;
}

/**
 * Calculated ligation protocol
 */
export interface LigationProtocol {
  /** Vector amount (ng) */
  vectorAmount: number;
  /** Vector volume (µL) */
  vectorVolume: number;
  /** Insert amount (ng) */
  insertAmount: number;
  /** Insert volume (µL) */
  insertVolume: number;
  /** Ligase volume (µL) */
  ligaseVolume: number;
  /** Buffer volume (µL) */
  bufferVolume: number;
  /** Water volume (µL) */
  waterVolume: number;
  /** Total volume (µL) */
  totalVolume: number;
  /** Incubation conditions */
  incubation: string;
}
