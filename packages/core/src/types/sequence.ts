/**
 * DNA sequence record with annotations and metadata
 */
export interface SequenceRecord {
  /** Unique identifier */
  id: string;
  /** Sequence name */
  name: string;
  /** DNA sequence (uppercase ATGCN) */
  sequence: string;
  /** Sequence length in base pairs */
  length: number;
  /** DNA topology */
  topology: 'linear' | 'circular';
  /** Sequence features/annotations */
  features: Feature[];
  /** GC content percentage (0-100) */
  gcContent: number;
  /** Molecular weight in Daltons */
  molecularWeight: number;
  /** Creation timestamp */
  createdAt: Date;
  /** Last modification timestamp */
  modifiedAt: Date;
  /** Optional description */
  description?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Sequence feature/annotation (gene, promoter, etc.)
 */
export interface Feature {
  /** Unique identifier */
  id: string;
  /** Feature name */
  name: string;
  /** Feature type */
  type: FeatureType;
  /** Start position (0-indexed, inclusive) */
  start: number;
  /** End position (0-indexed, exclusive) */
  end: number;
  /** Strand: 1 = forward, -1 = reverse */
  strand: 1 | -1;
  /** Display color (hex format) */
  color: string;
  /** Optional notes */
  notes?: string;
  /** GenBank-style qualifiers */
  qualifiers?: Record<string, string>;
}

/**
 * Standard feature types in molecular biology
 */
export type FeatureType =
  | 'gene'
  | 'CDS'
  | 'promoter'
  | 'terminator'
  | 'RBS'
  | 'tag'
  | 'origin'
  | 'resistance'
  | 'misc_feature'
  | 'primer'
  | 'primer_bind'
  | 'protein_bind'
  | 'misc_binding'
  | 'misc_RNA';

/**
 * Color palette for feature types
 */
export const FEATURE_COLORS: Record<FeatureType, string> = {
  gene: '#60A5FA',
  CDS: '#60A5FA',
  promoter: '#34D399',
  terminator: '#F87171',
  RBS: '#FBBF24',
  tag: '#A78BFA',
  origin: '#FB923C',
  resistance: '#3B82F6',
  misc_feature: '#9CA3AF',
  primer: '#EC4899',
  primer_bind: '#EC4899',
  protein_bind: '#8B5CF6',
  misc_binding: '#6366F1',
  misc_RNA: '#14B8A6',
};
