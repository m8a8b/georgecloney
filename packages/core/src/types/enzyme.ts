/**
 * Restriction enzyme definition
 */
export interface RestrictionEnzyme {
  /** Enzyme name (e.g., "EcoRI") */
  name: string;
  /** Recognition sequence (e.g., "GAATTC") */
  recognitionSeq: string;
  /** Cut position on forward strand (after this base) */
  cutPos5: number;
  /** Cut position on reverse strand (after this base) */
  cutPos3: number;
  /** Type of overhang produced */
  overhangType: 'blunt' | "5'" | "3'";
  /** Overhang sequence (if applicable) */
  overhangSeq: string;
  /** Commercial suppliers */
  suppliers: string[];
  /** Compatible reaction buffers */
  buffers: string[];
  /** Alternative enzymes with same recognition sequence */
  isoschizomers?: string[];
  /** Sensitive to Dam/Dcm methylation */
  methylationSensitive: boolean;
  /** Risk of star activity (non-specific cutting) */
  starActivity: boolean;
  /** Heat inactivation temperature (°C) */
  heatInactivation?: number;
}

/**
 * Restriction site found in a sequence
 */
export interface RestrictionSite {
  /** Enzyme name */
  enzyme: string;
  /** Cut position in sequence (0-indexed) */
  position: number;
  /** Strand where recognition sequence is located */
  strand: 1 | -1;
  /** Start of recognition sequence */
  recognitionStart: number;
  /** End of recognition sequence */
  recognitionEnd: number;
  /** Overhang sequence produced */
  overhangSeq: string;
}
