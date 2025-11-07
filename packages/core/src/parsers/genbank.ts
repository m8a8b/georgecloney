import type { SequenceRecord, Feature, FeatureType } from '../types';
import { FEATURE_COLORS } from '../types';
import { calculateGC, calculateMW } from '../utils/sequence';

/**
 * Parse GenBank format sequence
 *
 * @param text - Raw GenBank text
 * @returns Parsed sequence record
 * @throws Error if format is invalid
 */
export function parseGenBank(text: string): SequenceRecord {
  const lines = text.split('\n');

  let name = '';
  let description = '';
  let topology: 'linear' | 'circular' = 'linear';
  let sequence = '';
  const features: Feature[] = [];

  let section: 'header' | 'features' | 'origin' = 'header';
  let currentFeature: Partial<Feature> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Parse LOCUS line
    if (line.startsWith('LOCUS')) {
      const parts = line.split(/\s+/);
      name = parts[1] || 'Untitled';
      if (line.toLowerCase().includes('circular')) {
        topology = 'circular';
      }
      continue;
    }

    // Parse DEFINITION
    if (line.startsWith('DEFINITION')) {
      description = line.substring(12).trim();
      // Continue reading multi-line definitions
      let j = i + 1;
      while (j < lines.length && lines[j].match(/^\s{12}/)) {
        description += ' ' + lines[j].trim();
        j++;
      }
      i = j - 1;
      continue;
    }

    // Features section
    if (line.startsWith('FEATURES')) {
      section = 'features';
      continue;
    }

    // Origin section
    if (line.startsWith('ORIGIN')) {
      section = 'origin';
      continue;
    }

    // End of record
    if (line.startsWith('//')) {
      break;
    }

    // Parse features
    if (section === 'features') {
      // New feature line (starts at column 5)
      if (line.match(/^\s{5}\S/)) {
        // Save previous feature
        if (currentFeature && currentFeature.start !== undefined && currentFeature.end !== undefined) {
          features.push(currentFeature as Feature);
        }

        const match = line.match(/^\s{5}(\S+)\s+(.+)$/);
        if (match) {
          const [, type, location] = match;
          const parsedLocation = parseLocation(location);

          if (parsedLocation) {
            // Generate ID
            const id = typeof crypto !== 'undefined' && crypto.randomUUID
              ? crypto.randomUUID()
              : `feat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

            const featureType = mapFeatureType(type);
            currentFeature = {
              id,
              type: featureType,
              start: parsedLocation.start,
              end: parsedLocation.end,
              strand: parsedLocation.strand,
              color: FEATURE_COLORS[featureType],
              name: type,
              qualifiers: {},
            };
          }
        }
      }
      // Qualifier line (starts at column 21)
      else if (line.match(/^\s{21}/) && currentFeature) {
        const qualMatch = line.trim().match(/\/(\w+)="?([^"]+)"?/);
        if (qualMatch) {
          const [, key, value] = qualMatch;
          if (currentFeature.qualifiers) {
            currentFeature.qualifiers[key] = value;
          }
          // Use gene or label as feature name
          if ((key === 'gene' || key === 'label') && value) {
            currentFeature.name = value;
          }
        }
      }
    }

    // Parse sequence
    if (section === 'origin') {
      const seqLine = line
        .replace(/^\s*\d+\s*/, '')  // Remove line numbers
        .replace(/\s/g, '')          // Remove whitespace
        .toUpperCase();
      sequence += seqLine;
    }
  }

  // Save last feature
  if (currentFeature && currentFeature.start !== undefined && currentFeature.end !== undefined) {
    features.push(currentFeature as Feature);
  }

  if (!sequence) {
    throw new Error('Invalid GenBank format: no sequence found');
  }

  // Generate ID
  const id = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `seq_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  return {
    id,
    name: name || 'Untitled',
    sequence,
    length: sequence.length,
    topology,
    features,
    gcContent: calculateGC(sequence),
    molecularWeight: calculateMW(sequence),
    createdAt: new Date(),
    modifiedAt: new Date(),
    description: description || undefined,
  };
}

/**
 * Parse GenBank location string
 * Handles: 100..500, complement(100..500), join(...), etc.
 */
function parseLocation(location: string): { start: number; end: number; strand: 1 | -1 } | null {
  // Handle complement
  const isComplement = location.includes('complement');
  const strand = isComplement ? -1 : 1;

  // Extract numbers (simple parser, doesn't handle all cases)
  const match = location.match(/(\d+)\.\.(\d+)/);
  if (!match) return null;

  const start = parseInt(match[1]) - 1; // Convert to 0-indexed
  const end = parseInt(match[2]);

  return { start, end, strand: strand as 1 | -1 };
}

/**
 * Map GenBank feature type to CloneLab feature type
 */
function mapFeatureType(gbType: string): FeatureType {
  const mapping: Record<string, FeatureType> = {
    'CDS': 'CDS',
    'gene': 'gene',
    'promoter': 'promoter',
    'terminator': 'terminator',
    'RBS': 'RBS',
    'rep_origin': 'origin',
    'misc_feature': 'misc_feature',
    'primer_bind': 'primer_bind',
    'protein_bind': 'protein_bind',
    'misc_binding': 'misc_binding',
    'misc_RNA': 'misc_RNA',
    'primer': 'primer',
    'tag': 'tag',
  };

  return mapping[gbType] || 'misc_feature';
}
