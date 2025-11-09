/**
 * TypeScript types matching Python backend Pydantic models
 */

export interface Feature {
  id: string;
  name: string;
  type: string;
  start: number;
  end: number;
  strand: 1 | -1;
  color: string;
  notes?: string;
  qualifiers?: Record<string, string>;
}

export interface SequenceRecord {
  id: string;
  name: string;
  sequence: string;
  length: number;
  topology: 'linear' | 'circular';
  features: Feature[];
  gc_content: number;
  molecular_weight: number;
  description?: string;
  role?: 'vector' | 'insert'; // For cloning workflow
}

export interface RestrictionSite {
  enzyme: string;
  position: number;
  strand: 1 | -1;
  recognition_start: number;
  recognition_end: number;
  overhang_seq: string;
}

export interface EnzymePair {
  enzyme1: string;
  enzyme2: string;
  score: number;
  reasons: string[];
  warnings: string[];
  buffer_compatible: boolean;
}

export interface DigestFragment {
  id: string;
  sequence: string;
  length: number;
  start: number;
  end: number;
  five_prime_end: string;
  three_prime_end: string;
  features: Feature[];
}

export interface DigestResponse {
  fragments: DigestFragment[];
  total_fragments: number;
  largest_fragment: number;
  smallest_fragment: number;
}

export interface LigationProduct {
  id: string;
  type: 'correct' | 'reverse' | 'self-ligation' | 'concatemer' | 'other';
  sequence: string;
  length: number;
  probability: number;
  fragment_ids: string[];
  description: string;
  is_desired: boolean;
}

export interface LigationResponse {
  products: LigationProduct[];
  desired_product: LigationProduct | null;
}

export interface HealthResponse {
  status: string;
  version: string;
  biopython_version: string;
}
