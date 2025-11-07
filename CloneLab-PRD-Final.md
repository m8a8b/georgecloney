# CloneLab - Complete Modular PRD for AI Implementation

**Version:** 2.0 (Modular Architecture)  
**Target Audience:** AI Coding Assistants (Claude Code, Cursor, GitHub Copilot)  
**Last Updated:** 2025-10-30

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Monorepo Setup](#monorepo-setup)
3. [Package 1: @clonelab/core](#package-1-clonelabcore)
4. [Package 2: @clonelab/web](#package-2-clonelabweb)
5. [Implementation Phases](#implementation-phases)
6. [Testing Strategy](#testing-strategy)
7. [Deployment](#deployment)

---

## Architecture Overview

### System Design

```
┌─────────────────────────────────────────────────────────┐
│                    CloneLab Monorepo                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────┐      ┌─────────────────────┐   │
│  │  @clonelab/core    │◄─────│  @clonelab/web      │   │
│  │                    │      │                     │   │
│  │  Pure TypeScript   │      │  React Frontend     │   │
│  │  Zero UI deps      │      │  + Redux + Vite     │   │
│  │                    │      │                     │   │
│  │  • Parsers         │      │  • Components       │   │
│  │  • Enzymes         │      │  • Visualizations   │   │
│  │  • Analysis        │      │  • State Management │   │
│  │  • Types           │      │                     │   │
│  └────────────────────┘      └─────────────────────┘   │
│           ▲                                             │
│           │                                             │
│           │  Can be used by:                            │
│           ├── Vue frontend                              │
│           ├── React Native mobile                       │
│           ├── CLI tool                                  │
│           └── VS Code extension                         │
└─────────────────────────────────────────────────────────┘
```

### Directory Structure

```
clonelab/
├── package.json                    # Root workspace config
├── pnpm-workspace.yaml            # Workspace definition
├── tsconfig.base.json             # Shared TS config
├── .gitignore
├── README.md
│
├── packages/
│   │
│   ├── core/                      # Core library (pure TypeScript)
│   │   ├── src/
│   │   │   ├── index.ts          # Public API
│   │   │   ├── types/            # Type definitions
│   │   │   │   ├── sequence.ts
│   │   │   │   ├── enzyme.ts
│   │   │   │   ├── fragment.ts
│   │   │   │   ├── ligation.ts
│   │   │   │   └── index.ts
│   │   │   ├── parsers/          # File parsers
│   │   │   │   ├── fasta.ts
│   │   │   │   ├── genbank.ts
│   │   │   │   ├── detect.ts
│   │   │   │   └── index.ts
│   │   │   ├── enzymes/          # Enzyme analysis
│   │   │   │   ├── finder.ts
│   │   │   │   ├── pairing.ts
│   │   │   │   ├── database.ts
│   │   │   │   └── index.ts
│   │   │   ├── analysis/         # Cloning algorithms
│   │   │   │   ├── digest.ts
│   │   │   │   ├── ligation.ts
│   │   │   │   ├── features.ts
│   │   │   │   └── index.ts
│   │   │   ├── utils/            # Utilities
│   │   │   │   ├── sequence.ts
│   │   │   │   ├── validation.ts
│   │   │   │   └── index.ts
│   │   │   └── data/
│   │   │       └── enzymes.json  # Enzyme database
│   │   ├── tests/
│   │   │   ├── parsers.test.ts
│   │   │   ├── enzymes.test.ts
│   │   │   ├── analysis.test.ts
│   │   │   └── integration.test.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsup.config.ts
│   │   └── README.md
│   │
│   └── web/                       # React frontend
│       ├── src/
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   ├── components/
│       │   │   ├── layout/
│       │   │   │   ├── Layout.tsx
│       │   │   │   ├── Header.tsx
│       │   │   │   └── Sidebar.tsx
│       │   │   ├── sequence/
│       │   │   │   ├── SequenceView.tsx
│       │   │   │   ├── SequenceUpload.tsx
│       │   │   │   ├── LinearView.tsx
│       │   │   │   └── CircularView.tsx
│       │   │   ├── enzyme/
│       │   │   │   ├── EnzymePanel.tsx
│       │   │   │   ├── EnzymeList.tsx
│       │   │   │   ├── EnzymeFilter.tsx
│       │   │   │   └── EnzymePairSuggestions.tsx
│       │   │   ├── digest/
│       │   │   │   ├── DigestSimulator.tsx
│       │   │   │   ├── FragmentList.tsx
│       │   │   │   └── VirtualGel.tsx
│       │   │   ├── ligation/
│       │   │   │   ├── LigationPlanner.tsx
│       │   │   │   └── ProductPreview.tsx
│       │   │   └── common/
│       │   │       ├── Button.tsx
│       │   │       ├── Input.tsx
│       │   │       ├── Card.tsx
│       │   │       └── Modal.tsx
│       │   ├── store/
│       │   │   ├── store.ts
│       │   │   └── slices/
│       │   │       ├── sequencesSlice.ts
│       │   │       ├── enzymesSlice.ts
│       │   │       ├── digestSlice.ts
│       │   │       ├── ligationSlice.ts
│       │   │       └── uiSlice.ts
│       │   ├── hooks/
│       │   │   ├── useCore.ts
│       │   │   └── redux.ts
│       │   └── styles/
│       │       └── globals.css
│       ├── public/
│       ├── index.html
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       └── postcss.config.js
│
└── docs/                          # Documentation
    ├── API.md                     # Core API docs
    ├── DEVELOPMENT.md             # Dev guide
    └── DEPLOYMENT.md              # Deploy guide
```

---

## Monorepo Setup

### Step 1: Initialize Repository

```bash
# Create project directory
mkdir clonelab
cd clonelab

# Initialize git
git init

# Initialize package manager (using pnpm for monorepo)
pnpm init
```

### Step 2: Configure Workspace

Create root `package.json`:

```json
{
  "name": "clonelab-monorepo",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "pnpm --filter @clonelab/web dev",
    "build": "pnpm --filter @clonelab/core build && pnpm --filter @clonelab/web build",
    "build:core": "pnpm --filter @clonelab/core build",
    "build:web": "pnpm --filter @clonelab/web build",
    "test": "pnpm -r test",
    "test:core": "pnpm --filter @clonelab/core test",
    "test:web": "pnpm --filter @clonelab/web test",
    "lint": "pnpm -r lint",
    "clean": "pnpm -r exec rm -rf dist node_modules"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.1",
    "typescript": "^5.3.3"
  }
}
```

Create `pnpm-workspace.yaml`:

```yaml
packages:
  - 'packages/*'
```

Create `.gitignore`:

```
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
build/
*.tsbuildinfo

# Environment
.env
.env.local
.env.production

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
.nyc_output/

# Logs
*.log
npm-debug.log*
```

Create base TypeScript config `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

### Step 3: Create Package Directories

```bash
# Create package directories
mkdir -p packages/core/src
mkdir -p packages/web/src

# Initialize packages
cd packages/core && pnpm init && cd ../..
cd packages/web && pnpm init && cd ../..
```

---

## Package 1: @clonelab/core

**Pure TypeScript library with zero UI dependencies**

### Configuration Files

#### `packages/core/package.json`

```json
{
  "name": "@clonelab/core",
  "version": "0.1.0",
  "description": "Framework-agnostic molecular cloning toolkit",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist",
    "README.md"
  ],
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts --clean",
    "build:watch": "tsup src/index.ts --format esm,cjs --dts --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src --ext ts",
    "typecheck": "tsc --noEmit"
  },
  "keywords": [
    "molecular-biology",
    "cloning",
    "restriction-enzymes",
    "bioinformatics",
    "dna"
  ],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {},
  "devDependencies": {
    "@types/node": "^20.10.5",
    "@vitest/coverage-v8": "^1.0.4",
    "eslint": "^8.55.0",
    "tsup": "^8.0.1",
    "typescript": "^5.3.3",
    "vitest": "^1.0.4"
  }
}
```

#### `packages/core/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

#### `packages/core/tsup.config.ts`

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
});
```

### Type Definitions

#### `packages/core/src/types/sequence.ts`

```typescript
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
```

#### `packages/core/src/types/enzyme.ts`

```typescript
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
```

#### `packages/core/src/types/fragment.ts`

```typescript
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
```

#### `packages/core/src/types/ligation.ts`

```typescript
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
```

#### `packages/core/src/types/index.ts`

```typescript
export * from './sequence';
export * from './enzyme';
export * from './fragment';
export * from './ligation';
```

### Parser Implementations

#### `packages/core/src/parsers/fasta.ts`

```typescript
import type { SequenceRecord } from '../types';
import { calculateGC, calculateMW, validateSequence } from '../utils/sequence';

/**
 * Parse FASTA format sequence
 * 
 * Format:
 * >sequence_name description
 * ATGCATGCATGC
 * ATGCATGCATGC
 * 
 * @param text - Raw FASTA text
 * @returns Parsed sequence record
 * @throws Error if format is invalid
 */
export function parseFasta(text: string): SequenceRecord {
  const lines = text.trim().split('\n');
  
  if (lines.length === 0 || !lines[0].startsWith('>')) {
    throw new Error('Invalid FASTA format: missing header line starting with ">"');
  }
  
  // Parse header line
  const headerLine = lines[0].substring(1).trim();
  const [name, ...descriptionParts] = headerLine.split(/\s+/);
  const description = descriptionParts.join(' ') || undefined;
  
  // Parse sequence lines
  const sequence = lines
    .slice(1)
    .join('')
    .replace(/\s+/g, '')      // Remove whitespace
    .replace(/[0-9]/g, '')    // Remove numbers
    .toUpperCase();
  
  // Validate sequence
  if (!validateSequence(sequence)) {
    throw new Error('Invalid DNA sequence: contains non-IUPAC characters');
  }
  
  return {
    id: crypto.randomUUID(),
    name: name || 'Untitled Sequence',
    sequence,
    length: sequence.length,
    topology: 'linear', // FASTA doesn't specify topology
    features: [],
    gcContent: calculateGC(sequence),
    molecularWeight: calculateMW(sequence),
    createdAt: new Date(),
    modifiedAt: new Date(),
    description,
  };
}
```

#### `packages/core/src/parsers/genbank.ts`

```typescript
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
            currentFeature = {
              id: crypto.randomUUID(),
              type: mapFeatureType(type),
              start: parsedLocation.start,
              end: parsedLocation.end,
              strand: parsedLocation.strand,
              color: FEATURE_COLORS[mapFeatureType(type)],
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
          if ((key === 'gene' || key === 'label') && !currentFeature.name) {
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
  
  return {
    id: crypto.randomUUID(),
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
  };
  
  return mapping[gbType] || 'misc_feature';
}
```

#### `packages/core/src/parsers/detect.ts`

```typescript
/**
 * Auto-detect sequence file format
 * 
 * @param text - File content
 * @returns Detected format
 */
export function detectFormat(text: string): 'fasta' | 'genbank' | 'unknown' {
  const trimmed = text.trim();
  
  // FASTA starts with >
  if (trimmed.startsWith('>')) {
    return 'fasta';
  }
  
  // GenBank starts with LOCUS
  if (trimmed.startsWith('LOCUS')) {
    return 'genbank';
  }
  
  return 'unknown';
}
```

#### `packages/core/src/parsers/index.ts`

```typescript
export { parseFasta } from './fasta';
export { parseGenBank } from './genbank';
export { detectFormat } from './detect';
```

### Enzyme Analysis

#### `packages/core/src/enzymes/finder.ts`

```typescript
import type { RestrictionEnzyme, RestrictionSite } from '../types';
import { reverseComplement } from '../utils/sequence';

/**
 * Find all restriction sites for all enzymes in a sequence
 * 
 * @param sequence - DNA sequence to analyze
 * @param enzymes - Enzyme database
 * @param topology - Sequence topology
 * @returns Map of enzyme name to sites found
 */
export function findRestrictionSites(
  sequence: string,
  enzymes: Record<string, RestrictionEnzyme>,
  topology: 'linear' | 'circular' = 'linear'
): Record<string, RestrictionSite[]> {
  const results: Record<string, RestrictionSite[]> = {};
  
  // For circular sequences, extend to handle sites spanning origin
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
 * Find all sites for a single enzyme
 */
function findSitesForEnzyme(
  sequence: string,
  enzyme: RestrictionEnzyme,
  originalLength: number,
  topology: 'linear' | 'circular'
): RestrictionSite[] {
  const sites: RestrictionSite[] = [];
  const pattern = enzyme.recognitionSeq;
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
  
  // Search reverse strand
  pos = 0;
  while ((pos = sequence.indexOf(patternRev, pos)) !== -1) {
    if (pos < originalLength) {
      sites.push(createSite(enzyme, pos, -1));
    }
    pos++;
  }
  
  return sites;
}

/**
 * Create a restriction site object
 */
function createSite(
  enzyme: RestrictionEnzyme,
  position: number,
  strand: 1 | -1
): RestrictionSite {
  const recognitionLen = enzyme.recognitionSeq.length;
  
  // Calculate actual cut position
  const cutPos = strand === 1 
    ? position + enzyme.cutPos5
    : position + recognitionLen - enzyme.cutPos3;
  
  return {
    enzyme: enzyme.name,
    position: cutPos,
    strand,
    recognitionStart: position,
    recognitionEnd: position + recognitionLen,
    overhangSeq: enzyme.overhangSeq,
  };
}
```

#### `packages/core/src/enzymes/pairing.ts`

```typescript
import type { SequenceRecord, RestrictionSite, RestrictionEnzyme } from '../types';

export interface EnzymePairSuggestion {
  /** First enzyme name */
  enzyme1: string;
  /** Second enzyme name */
  enzyme2: string;
  /** Quality score (0-100, higher is better) */
  score: number;
  /** Reason for suggestion */
  reason: string;
  /** Potential issues or warnings */
  warnings: string[];
  /** Sites in vector */
  vectorSites: RestrictionSite[];
  /** Sites in insert (if applicable) */
  insertSites: RestrictionSite[];
}

/**
 * Find optimal enzyme pairs for cloning insert into vector
 * 
 * @param sequence - Vector sequence
 * @param insertStart - Insert start position
 * @param insertEnd - Insert end position
 * @param allSites - All restriction sites in sequence
 * @param enzymeDb - Enzyme database
 * @returns Ranked list of enzyme pair suggestions
 */
export function findEnzymePairs(
  sequence: SequenceRecord,
  insertStart: number,
  insertEnd: number,
  allSites: Record<string, RestrictionSite[]>,
  enzymeDb: Record<string, RestrictionEnzyme>
): EnzymePairSuggestion[] {
  const suggestions: EnzymePairSuggestion[] = [];
  
  // Find enzymes that cut exactly once
  const singleCutters = Object.entries(allSites)
    .filter(([_, sites]) => sites.length === 1)
    .map(([enzyme, _]) => enzyme);
  
  // Find all pairs of single cutters
  for (let i = 0; i < singleCutters.length; i++) {
    for (let j = i + 1; j < singleCutters.length; j++) {
      const enz1 = singleCutters[i];
      const enz2 = singleCutters[j];
      
      const site1 = allSites[enz1][0];
      const site2 = allSites[enz2][0];
      
      // Check if sites flank the insert region
      const flankingCorrectly = 
        (site1.position < insertStart && site2.position > insertEnd) ||
        (site2.position < insertStart && site1.position > insertEnd);
      
      if (!flankingCorrectly) continue;
      
      // Check enzyme compatibility
      const enz1Data = enzymeDb[enz1];
      const enz2Data = enzymeDb[enz2];
      
      if (!enz1Data || !enz2Data) continue;
      
      const compatibleBuffers = enz1Data.buffers.filter(b => 
        enz2Data.buffers.includes(b)
      );
      
      // Calculate score
      let score = 100;
      const reasons: string[] = [];
      const warnings: string[] = [];
      
      // Buffer compatibility bonus
      if (compatibleBuffers.length > 0) {
        score += 20;
        reasons.push(`Compatible buffers: ${compatibleBuffers.join(', ')}`);
      } else {
        score -= 30;
        warnings.push('Requires sequential digest (incompatible buffers)');
      }
      
      // Different overhangs = directional cloning
      if (enz1Data.overhangType !== enz2Data.overhangType) {
        score += 15;
        reasons.push('Different overhangs enable directional cloning');
      } else if (enz1Data.overhangSeq !== enz2Data.overhangSeq) {
        score += 10;
        reasons.push('Different overhang sequences');
      }
      
      // Star activity penalties
      if (enz1Data.starActivity) {
        score -= 10;
        warnings.push(`${enz1} has star activity risk`);
      }
      if (enz2Data.starActivity) {
        score -= 10;
        warnings.push(`${enz2} has star activity risk`);
      }
      
      // Methylation sensitivity warnings
      if (enz1Data.methylationSensitive || enz2Data.methylationSensitive) {
        warnings.push('Use dam-/dcm- E. coli strain');
      }
      
      suggestions.push({
        enzyme1: enz1,
        enzyme2: enz2,
        score,
        reason: reasons.join('; '),
        warnings,
        vectorSites: [site1, site2],
        insertSites: [],
      });
    }
  }
  
  // Sort by score (highest first)
  return suggestions.sort((a, b) => b.score - a.score);
}
```

#### `packages/core/src/enzymes/database.ts`

```typescript
import type { RestrictionEnzyme } from '../types';
import enzymeData from '../data/enzymes.json';

/**
 * Load enzyme database
 * 
 * @returns Promise resolving to enzyme database
 */
export async function loadEnzymeDatabase(): Promise<Record<string, RestrictionEnzyme>> {
  // In a real implementation, this might fetch from a URL
  // For now, we just return the imported data
  return enzymeData as Record<string, RestrictionEnzyme>;
}

/**
 * Get enzyme by name
 */
export function getEnzyme(
  database: Record<string, RestrictionEnzyme>,
  name: string
): RestrictionEnzyme | undefined {
  return database[name];
}

/**
 * Filter enzymes by criteria
 */
export function filterEnzymes(
  database: Record<string, RestrictionEnzyme>,
  criteria: {
    suppliers?: string[];
    overhangType?: 'blunt' | "5'" | "3'";
    buffers?: string[];
  }
): Record<string, RestrictionEnzyme> {
  return Object.fromEntries(
    Object.entries(database).filter(([_, enzyme]) => {
      if (criteria.suppliers && !criteria.suppliers.some(s => enzyme.suppliers.includes(s))) {
        return false;
      }
      if (criteria.overhangType && enzyme.overhangType !== criteria.overhangType) {
        return false;
      }
      if (criteria.buffers && !criteria.buffers.some(b => enzyme.buffers.includes(b))) {
        return false;
      }
      return true;
    })
  );
}
```

#### `packages/core/src/enzymes/index.ts`

```typescript
export { findRestrictionSites } from './finder';
export { findEnzymePairs, type EnzymePairSuggestion } from './pairing';
export { loadEnzymeDatabase, getEnzyme, filterEnzymes } from './database';
```

### Analysis Algorithms

#### `packages/core/src/analysis/digest.ts`

```typescript
import type { SequenceRecord, RestrictionSite, RestrictionEnzyme, DigestFragment, FragmentEnd, Feature } from '../types';
import { reverseComplement } from '../utils/sequence';

/**
 * Simulate restriction digest
 * 
 * @param sequence - Sequence to digest
 * @param sites - Restriction sites to cut at
 * @param enzymeDb - Enzyme database
 * @returns Resulting DNA fragments
 */
export function simulateDigest(
  sequence: SequenceRecord,
  sites: RestrictionSite[],
  enzymeDb: Record<string, RestrictionEnzyme>
): DigestFragment[] {
  if (sites.length === 0) {
    // No cuts - return whole sequence as single fragment
    return [{
      id: crypto.randomUUID(),
      sequence: sequence.sequence,
      length: sequence.length,
      start: 0,
      end: sequence.length,
      fivePrimeEnd: { type: 'blunt' },
      threePrimeEnd: { type: 'blunt' },
      features: sequence.features,
    }];
  }
  
  // Sort sites by position
  const sortedSites = [...sites].sort((a, b) => a.position - b.position);
  
  if (sequence.topology === 'linear') {
    return digestLinear(sequence, sortedSites, enzymeDb);
  } else {
    return digestCircular(sequence, sortedSites, enzymeDb);
  }
}

/**
 * Digest linear DNA
 */
function digestLinear(
  sequence: SequenceRecord,
  sites: RestrictionSite[],
  enzymeDb: Record<string, RestrictionEnzyme>
): DigestFragment[] {
  const fragments: DigestFragment[] = [];
  
  let prevPos = 0;
  let prevEnd: FragmentEnd = { type: 'blunt' };
  
  for (const site of sites) {
    const enzyme = enzymeDb[site.enzyme];
    if (!enzyme) continue;
    
    const currentEnd = createFragmentEnd(enzyme, site.strand, false);
    const fragSeq = sequence.sequence.substring(prevPos, site.position);
    
    fragments.push({
      id: crypto.randomUUID(),
      sequence: fragSeq,
      length: fragSeq.length,
      start: prevPos,
      end: site.position,
      fivePrimeEnd: prevEnd,
      threePrimeEnd: currentEnd,
      features: extractFeatures(sequence.features, prevPos, site.position),
    });
    
    prevPos = site.position;
    prevEnd = complementFragmentEnd(currentEnd);
  }
  
  // Final fragment
  const finalSeq = sequence.sequence.substring(prevPos);
  fragments.push({
    id: crypto.randomUUID(),
    sequence: finalSeq,
    length: finalSeq.length,
    start: prevPos,
    end: sequence.length,
    fivePrimeEnd: prevEnd,
    threePrimeEnd: { type: 'blunt' },
    features: extractFeatures(sequence.features, prevPos, sequence.length),
  });
  
  return fragments;
}

/**
 * Digest circular DNA
 */
function digestCircular(
  sequence: SequenceRecord,
  sites: RestrictionSite[],
  enzymeDb: Record<string, RestrictionEnzyme>
): DigestFragment[] {
  const fragments: DigestFragment[] = [];
  
  for (let i = 0; i < sites.length; i++) {
    const currentSite = sites[i];
    const nextSite = sites[(i + 1) % sites.length];
    
    const start = currentSite.position;
    let end = nextSite.position;
    
    // Handle wrap-around
    if (i === sites.length - 1) {
      end = sequence.length + nextSite.position;
    }
    
    let fragSeq: string;
    if (end > sequence.length) {
      // Fragment spans origin
      fragSeq = sequence.sequence.substring(start) + 
                sequence.sequence.substring(0, end - sequence.length);
    } else {
      fragSeq = sequence.sequence.substring(start, end);
    }
    
    const currentEnzyme = enzymeDb[currentSite.enzyme];
    const nextEnzyme = enzymeDb[nextSite.enzyme];
    
    if (!currentEnzyme || !nextEnzyme) continue;
    
    fragments.push({
      id: crypto.randomUUID(),
      sequence: fragSeq,
      length: fragSeq.length,
      start,
      end: end % sequence.length,
      fivePrimeEnd: createFragmentEnd(currentEnzyme, currentSite.strand, false),
      threePrimeEnd: complementFragmentEnd(createFragmentEnd(nextEnzyme, nextSite.strand, false)),
      features: extractFeatures(sequence.features, start, end),
    });
  }
  
  return fragments;
}

/**
 * Create fragment end from enzyme
 */
function createFragmentEnd(
  enzyme: RestrictionEnzyme,
  strand: 1 | -1,
  complement: boolean
): FragmentEnd {
  if (enzyme.overhangType === 'blunt') {
    return { type: 'blunt', enzyme: enzyme.name };
  }
  
  let type: FragmentEnd['type'];
  if (enzyme.overhangType === "5'") {
    type = complement ? "3'-overhang" : "5'-overhang";
  } else {
    type = complement ? "5'-overhang" : "3'-overhang";
  }
  
  const overhangSeq = complement 
    ? reverseComplement(enzyme.overhangSeq)
    : enzyme.overhangSeq;
  
  return {
    type,
    overhangSeq,
    enzyme: enzyme.name,
  };
}

/**
 * Get complementary fragment end
 */
function complementFragmentEnd(end: FragmentEnd): FragmentEnd {
  if (end.type === 'blunt') {
    return end;
  }
  
  return {
    type: end.type === "5'-overhang" ? "3'-overhang" : "5'-overhang",
    overhangSeq: end.overhangSeq ? reverseComplement(end.overhangSeq) : undefined,
    enzyme: end.enzyme,
  };
}

/**
 * Extract features within a range
 */
function extractFeatures(
  features: Feature[],
  start: number,
  end: number
): Feature[] {
  return features
    .filter(f => f.start >= start && f.end <= end)
    .map(f => ({
      ...f,
      start: f.start - start,
      end: f.end - start,
    }));
}
```

#### `packages/core/src/analysis/ligation.ts`

```typescript
import type { DigestFragment, LigationProduct, LigationParameters, LigationProtocol } from '../types';

/**
 * Predict ligation products
 * 
 * @param vectorFragment - Vector fragment
 * @param insertFragment - Insert fragment
 * @returns Predicted ligation products
 */
export function predictLigationProducts(
  vectorFragment: DigestFragment,
  insertFragment: DigestFragment
): LigationProduct[] {
  const products: LigationProduct[] = [];
  
  // Check if ends are compatible
  const vector5Compatible = areEndsCompatible(vectorFragment.fivePrimeEnd, insertFragment.threePrimeEnd);
  const vector3Compatible = areEndsCompatible(vectorFragment.threePrimeEnd, insertFragment.fivePrimeEnd);
  
  // Correct orientation product
  if (vector5Compatible && vector3Compatible) {
    const correctSeq = vectorFragment.sequence + insertFragment.sequence;
    products.push({
      id: crypto.randomUUID(),
      type: 'correct',
      sequence: correctSeq,
      length: correctSeq.length,
      probability: 0.6, // Estimated
      fragmentIds: [vectorFragment.id, insertFragment.id],
      description: 'Insert in correct orientation',
      isDesired: true,
    });
  }
  
  // Reverse orientation product (if both ends have same compatibility)
  const insert5Compatible = areEndsCompatible(vectorFragment.fivePrimeEnd, insertFragment.fivePrimeEnd);
  const insert3Compatible = areEndsCompatible(vectorFragment.threePrimeEnd, insertFragment.threePrimeEnd);
  
  if (insert5Compatible && insert3Compatible) {
    const reverseSeq = vectorFragment.sequence + reverseComplement(insertFragment.sequence);
    products.push({
      id: crypto.randomUUID(),
      type: 'reverse',
      sequence: reverseSeq,
      length: reverseSeq.length,
      probability: 0.3, // Estimated
      fragmentIds: [vectorFragment.id, insertFragment.id],
      description: 'Insert in reverse orientation',
      isDesired: false,
    });
  }
  
  // Self-ligation of vector
  if (areEndsCompatible(vectorFragment.fivePrimeEnd, vectorFragment.threePrimeEnd)) {
    products.push({
      id: crypto.randomUUID(),
      type: 'self-ligation',
      sequence: vectorFragment.sequence,
      length: vectorFragment.sequence.length,
      probability: 0.1, // Estimated
      fragmentIds: [vectorFragment.id],
      description: 'Vector self-ligation (no insert)',
      isDesired: false,
    });
  }
  
  return products;
}

/**
 * Check if two fragment ends are compatible for ligation
 */
function areEndsCompatible(end1: FragmentEnd, end2: FragmentEnd): boolean {
  // Blunt ends are always compatible
  if (end1.type === 'blunt' && end2.type === 'blunt') {
    return true;
  }
  
  // One blunt, one sticky - not compatible
  if (end1.type === 'blunt' || end2.type === 'blunt') {
    return false;
  }
  
  // Both sticky ends - must be complementary types and sequences
  if (
    (end1.type === "5'-overhang" && end2.type === "3'-overhang") ||
    (end1.type === "3'-overhang" && end2.type === "5'-overhang")
  ) {
    // Check if overhang sequences are complementary
    return end1.overhangSeq === reverseComplement(end2.overhangSeq || '');
  }
  
  return false;
}

/**
 * Calculate ligation protocol
 * 
 * @param params - Ligation parameters
 * @returns Calculated protocol
 */
export function calculateLigationProtocol(params: LigationParameters): LigationProtocol {
  const { vectorFragment, insertFragment, molarRatio, vectorConcentration, reactionVolume } = params;
  
  // Calculate pmol needed
  const vectorMW = vectorFragment.length * 650; // Average MW per bp
  const insertMW = insertFragment.length * 650;
  
  // Typically use 50-100ng vector
  const vectorAmount = 50; // ng
  const vectorPmol = (vectorAmount / vectorMW) * 1000;
  
  // Calculate insert amount based on molar ratio
  const insertPmol = vectorPmol * molarRatio;
  const insertAmount = (insertPmol * insertMW) / 1000;
  
  // Calculate volumes
  const vectorVolume = vectorAmount / vectorConcentration;
  const insertConcentration = vectorConcentration; // Assume same concentration for simplicity
  const insertVolume = insertAmount / insertConcentration;
  
  const ligaseVolume = 1; // µL (standard)
  const bufferVolume = reactionVolume * 0.1; // 10% of total volume
  const waterVolume = reactionVolume - vectorVolume - insertVolume - ligaseVolume - bufferVolume;
  
  return {
    vectorAmount,
    vectorVolume: parseFloat(vectorVolume.toFixed(2)),
    insertAmount: parseFloat(insertAmount.toFixed(2)),
    insertVolume: parseFloat(insertVolume.toFixed(2)),
    ligaseVolume,
    bufferVolume: parseFloat(bufferVolume.toFixed(2)),
    waterVolume: parseFloat(waterVolume.toFixed(2)),
    totalVolume: reactionVolume,
    incubation: 'Room temperature for 1 hour or 16°C overnight',
  };
}

function reverseComplement(seq: string): string {
  const complement: Record<string, string> = {
    'A': 'T', 'T': 'A', 'G': 'C', 'C': 'G', 'N': 'N',
  };
  return seq.split('').reverse().map(b => complement[b] || b).join('');
}
```

#### `packages/core/src/analysis/features.ts`

```typescript
import type { Feature, FeatureType } from '../types';
import { FEATURE_COLORS } from '../types';

/**
 * Find open reading frames (ORFs) in sequence
 * 
 * @param sequence - DNA sequence
 * @param minLength - Minimum ORF length in codons (default: 100)
 * @returns Detected ORFs as features
 */
export function findORFs(sequence: string, minLength: number = 100): Feature[] {
  const orfs: Feature[] = [];
  const startCodons = ['ATG'];
  const stopCodons = ['TAA', 'TAG', 'TGA'];
  
  // Search all 6 reading frames (3 forward, 3 reverse)
  for (let frame = 0; frame < 3; frame++) {
    // Forward strand
    const forwardORFs = findORFsInFrame(sequence, frame, 1, startCodons, stopCodons, minLength);
    orfs.push(...forwardORFs);
    
    // Reverse strand
    const reverseSeq = reverseComplement(sequence);
    const reverseORFs = findORFsInFrame(reverseSeq, frame, -1, startCodons, stopCodons, minLength);
    // Convert positions back to forward strand coordinates
    reverseORFs.forEach(orf => {
      const actualStart = sequence.length - orf.end;
      const actualEnd = sequence.length - orf.start;
      orf.start = actualStart;
      orf.end = actualEnd;
    });
    orfs.push(...reverseORFs);
  }
  
  return orfs;
}

function findORFsInFrame(
  sequence: string,
  frame: number,
  strand: 1 | -1,
  startCodons: string[],
  stopCodons: string[],
  minLength: number
): Feature[] {
  const orfs: Feature[] = [];
  let inORF = false;
  let orfStart = 0;
  
  for (let i = frame; i < sequence.length - 2; i += 3) {
    const codon = sequence.substring(i, i + 3);
    
    if (!inORF && startCodons.includes(codon)) {
      inORF = true;
      orfStart = i;
    } else if (inORF && stopCodons.includes(codon)) {
      const orfLength = (i - orfStart + 3) / 3;
      if (orfLength >= minLength) {
        orfs.push({
          id: crypto.randomUUID(),
          name: `ORF${orfs.length + 1}`,
          type: 'CDS',
          start: orfStart,
          end: i + 3,
          strand,
          color: FEATURE_COLORS.CDS,
          notes: `${orfLength} codons`,
        });
      }
      inORF = false;
    }
  }
  
  return orfs;
}

function reverseComplement(seq: string): string {
  const complement: Record<string, string> = {
    'A': 'T', 'T': 'A', 'G': 'C', 'C': 'G', 'N': 'N',
  };
  return seq.split('').reverse().map(b => complement[b] || b).join('');
}

/**
 * Detect common features using pattern matching
 * (Simplified version - real implementation would use a curated database)
 */
export function detectFeatures(sequence: string): Feature[] {
  const features: Feature[] = [];
  
  // This would normally query a feature database
  // For now, just find some common patterns
  
  // Find common promoters (simplified)
  const t7Promoter = 'TAATACGACTCACTATAGGG';
  let pos = sequence.indexOf(t7Promoter);
  if (pos !== -1) {
    features.push({
      id: crypto.randomUUID(),
      name: 'T7 promoter',
      type: 'promoter',
      start: pos,
      end: pos + t7Promoter.length,
      strand: 1,
      color: FEATURE_COLORS.promoter,
    });
  }
  
  // Find common terminators
  const t7Terminator = 'GCTAGTTATTGCTCAGCGG';
  pos = sequence.indexOf(t7Terminator);
  if (pos !== -1) {
    features.push({
      id: crypto.randomUUID(),
      name: 'T7 terminator',
      type: 'terminator',
      start: pos,
      end: pos + t7Terminator.length,
      strand: 1,
      color: FEATURE_COLORS.terminator,
    });
  }
  
  return features;
}
```

#### `packages/core/src/analysis/index.ts`

```typescript
export { simulateDigest } from './digest';
export { predictLigationProducts, calculateLigationProtocol } from './ligation';
export { findORFs, detectFeatures } from './features';
```

### Utility Functions

#### `packages/core/src/utils/sequence.ts`

```typescript
/**
 * Sequence utility functions
 */

/**
 * Calculate GC content percentage
 */
export function calculateGC(sequence: string): number {
  const gc = (sequence.match(/[GC]/gi) || []).length;
  return (gc / sequence.length) * 100;
}

/**
 * Calculate molecular weight
 * (Simplified - assumes average MW per base pair)
 */
export function calculateMW(sequence: string): number {
  const avgMW = 650; // Daltons per bp
  return sequence.length * avgMW;
}

/**
 * Reverse complement a DNA sequence
 */
export function reverseComplement(sequence: string): string {
  const complement: Record<string, string> = {
    'A': 'T', 'T': 'A', 'G': 'C', 'C': 'G',
    'N': 'N', 'R': 'Y', 'Y': 'R', 'M': 'K',
    'K': 'M', 'S': 'S', 'W': 'W', 'H': 'D',
    'B': 'V', 'V': 'B', 'D': 'H',
  };
  
  return sequence
    .split('')
    .reverse()
    .map(base => complement[base.toUpperCase()] || base)
    .join('');
}

/**
 * Translate DNA to protein
 */
export function translateSequence(sequence: string, frame: number = 0): string {
  const codonTable: Record<string, string> = {
    'TTT': 'F', 'TTC': 'F', 'TTA': 'L', 'TTG': 'L',
    'TCT': 'S', 'TCC': 'S', 'TCA': 'S', 'TCG': 'S',
    'TAT': 'Y', 'TAC': 'Y', 'TAA': '*', 'TAG': '*',
    'TGT': 'C', 'TGC': 'C', 'TGA': '*', 'TGG': 'W',
    'CTT': 'L', 'CTC': 'L', 'CTA': 'L', 'CTG': 'L',
    'CCT': 'P', 'CCC': 'P', 'CCA': 'P', 'CCG': 'P',
    'CAT': 'H', 'CAC': 'H', 'CAA': 'Q', 'CAG': 'Q',
    'CGT': 'R', 'CGC': 'R', 'CGA': 'R', 'CGG': 'R',
    'ATT': 'I', 'ATC': 'I', 'ATA': 'I', 'ATG': 'M',
    'ACT': 'T', 'ACC': 'T', 'ACA': 'T', 'ACG': 'T',
    'AAT': 'N', 'AAC': 'N', 'AAA': 'K', 'AAG': 'K',
    'AGT': 'S', 'AGC': 'S', 'AGA': 'R', 'AGG': 'R',
    'GTT': 'V', 'GTC': 'V', 'GTA': 'V', 'GTG': 'V',
    'GCT': 'A', 'GCC': 'A', 'GCA': 'A', 'GCG': 'A',
    'GAT': 'D', 'GAC': 'D', 'GAA': 'E', 'GAG': 'E',
    'GGT': 'G', 'GGC': 'G', 'GGA': 'G', 'GGG': 'G',
  };
  
  let protein = '';
  for (let i = frame; i < sequence.length - 2; i += 3) {
    const codon = sequence.substring(i, i + 3).toUpperCase();
    protein += codonTable[codon] || 'X';
  }
  
  return protein;
}

/**
 * Validate DNA sequence (check for valid IUPAC codes)
 */
export function validateSequence(sequence: string): boolean {
  return /^[ATGCNRYMKSWHBVD]+$/i.test(sequence);
}
```

#### `packages/core/src/utils/validation.ts`

```typescript
/**
 * Input validation utilities
 */

/**
 * Validate sequence record
 */
export function isValidSequenceRecord(obj: any): boolean {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.sequence === 'string' &&
    typeof obj.length === 'number' &&
    (obj.topology === 'linear' || obj.topology === 'circular') &&
    Array.isArray(obj.features)
  );
}

/**
 * Validate restriction enzyme
 */
export function isValidEnzyme(obj: any): boolean {
  return (
    typeof obj === 'object' &&
    typeof obj.name === 'string' &&
    typeof obj.recognitionSeq === 'string' &&
    typeof obj.cutPos5 === 'number' &&
    typeof obj.cutPos3 === 'number' &&
    (obj.overhangType === 'blunt' || obj.overhangType === "5'" || obj.overhangType === "3'")
  );
}
```

#### `packages/core/src/utils/index.ts`

```typescript
export * from './sequence';
export * from './validation';
```

### Public API

#### `packages/core/src/index.ts`

```typescript
/**
 * CloneLab Core Library
 * Framework-agnostic molecular cloning toolkit
 * 
 * @packageDocumentation
 */

// Export all types
export * from './types';

// Export parsers
export { parseFasta, parseGenBank, detectFormat } from './parsers';

// Export enzyme functions
export {
  findRestrictionSites,
  findEnzymePairs,
  loadEnzymeDatabase,
  getEnzyme,
  filterEnzymes,
  type EnzymePairSuggestion,
} from './enzymes';

// Export analysis functions
export {
  simulateDigest,
  predictLigationProducts,
  calculateLigationProtocol,
  findORFs,
  detectFeatures,
} from './analysis';

// Export utilities
export {
  reverseComplement,
  translateSequence,
  calculateGC,
  calculateMW,
  validateSequence,
} from './utils';
```

### Sample Enzyme Database

#### `packages/core/src/data/enzymes.json`

```json
{
  "EcoRI": {
    "name": "EcoRI",
    "recognitionSeq": "GAATTC",
    "cutPos5": 1,
    "cutPos3": 5,
    "overhangType": "5'",
    "overhangSeq": "AATT",
    "suppliers": ["NEB", "Thermo Fisher", "Promega"],
    "buffers": ["CutSmart", "EcoRI Buffer"],
    "isoschizomers": [],
    "methylationSensitive": false,
    "starActivity": true,
    "heatInactivation": 65
  },
  "BamHI": {
    "name": "BamHI",
    "recognitionSeq": "GGATCC",
    "cutPos5": 1,
    "cutPos3": 5,
    "overhangType": "5'",
    "overhangSeq": "GATC",
    "suppliers": ["NEB", "Thermo Fisher"],
    "buffers": ["CutSmart", "BamHI Buffer"],
    "isoschizomers": [],
    "methylationSensitive": false,
    "starActivity": false,
    "heatInactivation": 80
  },
  "HindIII": {
    "name": "HindIII",
    "recognitionSeq": "AAGCTT",
    "cutPos5": 1,
    "cutPos3": 5,
    "overhangType": "5'",
    "overhangSeq": "AGCT",
    "suppliers": ["NEB", "Thermo Fisher"],
    "buffers": ["CutSmart"],
    "isoschizomers": [],
    "methylationSensitive": false,
    "starActivity": false,
    "heatInactivation": 80
  },
  "PstI": {
    "name": "PstI",
    "recognitionSeq": "CTGCAG",
    "cutPos5": 5,
    "cutPos3": 1,
    "overhangType": "3'",
    "overhangSeq": "TGCA",
    "suppliers": ["NEB", "Thermo Fisher"],
    "buffers": ["CutSmart"],
    "isoschizomers": [],
    "methylationSensitive": true,
    "starActivity": false,
    "heatInactivation": 80
  },
  "SmaI": {
    "name": "SmaI",
    "recognitionSeq": "CCCGGG",
    "cutPos5": 3,
    "cutPos3": 3,
    "overhangType": "blunt",
    "overhangSeq": "",
    "suppliers": ["NEB", "Thermo Fisher"],
    "buffers": ["CutSmart"],
    "isoschizomers": ["XmaI"],
    "methylationSensitive": false,
    "starActivity": false,
    "heatInactivation": 80
  }
}
```

---

## Package 2: @clonelab/web

**React frontend using @clonelab/core**

### Configuration

#### `packages/web/package.json`

```json
{
  "name": "@clonelab/web",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint src --ext ts,tsx",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@clonelab/core": "workspace:*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@reduxjs/toolkit": "^2.0.1",
    "react-redux": "^9.0.4",
    "seqviz": "^4.0.0",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "vitest": "^1.0.4",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5",
    "eslint": "^8.55.0",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "eslint-plugin-react-hooks": "^4.6.0"
  }
}
```

#### `packages/web/vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@clonelab/core': path.resolve(__dirname, '../core/src'),
    },
  },
  server: {
    port: 3000,
  },
});
```

#### `packages/web/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@clonelab/core": ["../core/src"]
    }
  },
  "include": ["src"],
  "references": [
    { "path": "../core" }
  ]
}
```

#### `packages/web/tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [],
}
```

### Redux Store

#### `packages/web/src/store/store.ts`

```typescript
import { configureStore } from '@reduxjs/toolkit';
import sequencesReducer from './slices/sequencesSlice';
import enzymesReducer from './slices/enzymesSlice';
import digestReducer from './slices/digestSlice';
import ligationReducer from './slices/ligationSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    sequences: sequencesReducer,
    enzymes: enzymesReducer,
    digest: digestReducer,
    ligation: ligationReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

#### `packages/web/src/store/slices/sequencesSlice.ts`

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SequenceRecord } from '@clonelab/core';

interface SequencesState {
  items: Record<string, SequenceRecord>;
  activeId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: SequencesState = {
  items: {},
  activeId: null,
  loading: false,
  error: null,
};

const sequencesSlice = createSlice({
  name: 'sequences',
  initialState,
  reducers: {
    addSequence: (state, action: PayloadAction<SequenceRecord>) => {
      state.items[action.payload.id] = action.payload;
      state.activeId = action.payload.id;
      state.error = null;
    },
    
    setActiveSequence: (state, action: PayloadAction<string>) => {
      state.activeId = action.payload;
    },
    
    removeSequence: (state, action: PayloadAction<string>) => {
      delete state.items[action.payload];
      if (state.activeId === action.payload) {
        state.activeId = null;
      }
    },
    
    updateSequence: (state, action: PayloadAction<SequenceRecord>) => {
      state.items[action.payload.id] = action.payload;
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  addSequence,
  setActiveSequence,
  removeSequence,
  updateSequence,
  setLoading,
  setError,
} = sequencesSlice.actions;

export default sequencesSlice.reducer;
```

#### `packages/web/src/store/slices/enzymesSlice.ts`

```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RestrictionEnzyme, RestrictionSite } from '@clonelab/core';
import { loadEnzymeDatabase, findRestrictionSites } from '@clonelab/core';
import type { RootState } from '../store';

interface EnzymesState {
  database: Record<string, RestrictionEnzyme>;
  sites: Record<string, RestrictionSite[]>;
  selected: string[];
  searchQuery: string;
  loading: boolean;
  error: string | null;
}

const initialState: EnzymesState = {
  database: {},
  sites: {},
  selected: [],
  searchQuery: '',
  loading: false,
  error: null,
};

// Async thunk to load enzyme database
export const loadEnzymes = createAsyncThunk(
  'enzymes/loadDatabase',
  async () => {
    return await loadEnzymeDatabase();
  }
);

// Async thunk to find restriction sites
export const findSites = createAsyncThunk(
  'enzymes/findSites',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const activeId = state.sequences.activeId;
    
    if (!activeId) {
      throw new Error('No active sequence');
    }
    
    const sequence = state.sequences.items[activeId];
    const enzymes = state.enzymes.database;
    
    return {
      sequenceId: activeId,
      sites: findRestrictionSites(sequence.sequence, enzymes, sequence.topology),
    };
  }
);

const enzymesSlice = createSlice({
  name: 'enzymes',
  initialState,
  reducers: {
    selectEnzyme: (state, action: PayloadAction<string>) => {
      if (!state.selected.includes(action.payload)) {
        state.selected.push(action.payload);
      }
    },
    
    deselectEnzyme: (state, action: PayloadAction<string>) => {
      state.selected = state.selected.filter(e => e !== action.payload);
    },
    
    clearSelectedEnzymes: (state) => {
      state.selected = [];
    },
    
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadEnzymes.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadEnzymes.fulfilled, (state, action) => {
        state.database = action.payload;
        state.loading = false;
      })
      .addCase(loadEnzymes.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to load enzymes';
        state.loading = false;
      })
      .addCase(findSites.fulfilled, (state, action) => {
        state.sites = action.payload.sites;
      });
  },
});

export const {
  selectEnzyme,
  deselectEnzyme,
  clearSelectedEnzymes,
  setSearchQuery,
} = enzymesSlice.actions;

export default enzymesSlice.reducer;
```

#### `packages/web/src/store/slices/digestSlice.ts`

```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { DigestFragment, RestrictionSite } from '@clonelab/core';
import { simulateDigest } from '@clonelab/core';
import type { RootState } from '../store';

interface DigestState {
  fragments: DigestFragment[];
  selectedFragmentIds: string[];
  loading: boolean;
  error: string | null;
}

const initialState: DigestState = {
  fragments: [],
  selectedFragmentIds: [],
  loading: false,
  error: null,
};

// Async thunk to simulate digest
export const performDigest = createAsyncThunk(
  'digest/simulate',
  async (enzymeNames: string[], { getState }) => {
    const state = getState() as RootState;
    const activeId = state.sequences.activeId;
    
    if (!activeId) {
      throw new Error('No active sequence');
    }
    
    const sequence = state.sequences.items[activeId];
    const allSites = state.enzymes.sites;
    const enzymeDb = state.enzymes.database;
    
    // Get sites for selected enzymes
    const sites: RestrictionSite[] = enzymeNames.flatMap(name => allSites[name] || []);
    
    return simulateDigest(sequence, sites, enzymeDb);
  }
);

const digestSlice = createSlice({
  name: 'digest',
  initialState,
  reducers: {
    selectFragment: (state, action: PayloadAction<string>) => {
      if (!state.selectedFragmentIds.includes(action.payload)) {
        state.selectedFragmentIds.push(action.payload);
      }
    },
    
    deselectFragment: (state, action: PayloadAction<string>) => {
      state.selectedFragmentIds = state.selectedFragmentIds.filter(id => id !== action.payload);
    },
    
    clearSelectedFragments: (state) => {
      state.selectedFragmentIds = [];
    },
    
    clearDigest: (state) => {
      state.fragments = [];
      state.selectedFragmentIds = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(performDigest.pending, (state) => {
        state.loading = true;
      })
      .addCase(performDigest.fulfilled, (state, action) => {
        state.fragments = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(performDigest.rejected, (state, action) => {
        state.error = action.error.message || 'Digest simulation failed';
        state.loading = false;
      });
  },
});

export const {
  selectFragment,
  deselectFragment,
  clearSelectedFragments,
  clearDigest,
} = digestSlice.actions;

export default digestSlice.reducer;
```

#### `packages/web/src/store/slices/ligationSlice.ts`

```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { LigationProduct } from '@clonelab/core';
import { predictLigationProducts } from '@clonelab/core';
import type { RootState } from '../store';

interface LigationState {
  products: LigationProduct[];
  selectedProductId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: LigationState = {
  products: [],
  selectedProductId: null,
  loading: false,
  error: null,
};

// Async thunk to predict ligation
export const predictLigation = createAsyncThunk(
  'ligation/predict',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const selectedFragmentIds = state.digest.selectedFragmentIds;
    
    if (selectedFragmentIds.length !== 2) {
      throw new Error('Select exactly 2 fragments (vector and insert)');
    }
    
    const [vectorId, insertId] = selectedFragmentIds;
    const vectorFragment = state.digest.fragments.find(f => f.id === vectorId);
    const insertFragment = state.digest.fragments.find(f => f.id === insertId);
    
    if (!vectorFragment || !insertFragment) {
      throw new Error('Selected fragments not found');
    }
    
    return predictLigationProducts(vectorFragment, insertFragment);
  }
);

const ligationSlice = createSlice({
  name: 'ligation',
  initialState,
  reducers: {
    selectProduct: (state, action: PayloadAction<string>) => {
      state.selectedProductId = action.payload;
    },
    
    clearLigation: (state) => {
      state.products = [];
      state.selectedProductId = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(predictLigation.pending, (state) => {
        state.loading = true;
      })
      .addCase(predictLigation.fulfilled, (state, action) => {
        state.products = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(predictLigation.rejected, (state, action) => {
        state.error = action.error.message || 'Ligation prediction failed';
        state.loading = false;
      });
  },
});

export const {
  selectProduct,
  clearLigation,
} = ligationSlice.actions;

export default ligationSlice.reducer;
```

#### `packages/web/src/store/slices/uiSlice.ts`

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  viewMode: 'linear' | 'circular';
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
}

const initialState: UIState = {
  viewMode: 'linear',
  sidebarOpen: true,
  theme: 'light',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setViewMode: (state, action: PayloadAction<'linear' | 'circular'>) => {
      state.viewMode = action.payload;
    },
    
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
  },
});

export const {
  setViewMode,
  toggleSidebar,
  setTheme,
} = uiSlice.actions;

export default uiSlice.reducer;
```

### React Hooks

#### `packages/web/src/hooks/redux.ts`

```typescript
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';

// Typed hooks for Redux
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

#### `packages/web/src/hooks/useCore.ts`

```typescript
import { useEffect } from 'react';
import { useAppDispatch } from './redux';
import { loadEnzymes } from '../store/slices/enzymesSlice';

/**
 * Hook to initialize core library
 * Loads enzyme database on mount
 */
export function useCore() {
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    dispatch(loadEnzymes());
  }, [dispatch]);
}
```

### React Components

Due to length constraints, I'll show key component structures. Full implementations would follow similar patterns.

#### `packages/web/src/App.tsx`

```typescript
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { Layout } from './components/layout/Layout';
import { SequenceView } from './components/sequence/SequenceView';
import { EnzymePanel } from './components/enzyme/EnzymePanel';
import { DigestSimulator } from './components/digest/DigestSimulator';
import { useCore } from './hooks/useCore';

function AppContent() {
  useCore(); // Initialize core library
  
  return (
    <Layout>
      <div className="flex h-screen">
        <aside className="w-80 border-r border-gray-200 overflow-y-auto">
          <EnzymePanel />
        </aside>
        
        <main className="flex-1 overflow-hidden">
          <SequenceView />
        </main>
        
        <aside className="w-80 border-l border-gray-200 overflow-y-auto">
          <DigestSimulator />
        </aside>
      </div>
    </Layout>
  );
}

export function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
```

#### `packages/web/src/main.tsx`

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

#### `packages/web/src/components/sequence/SequenceUpload.tsx`

```typescript
import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';
import { useAppDispatch } from '../../hooks/redux';
import { addSequence, setLoading, setError } from '../../store/slices/sequencesSlice';
import { parseFasta, parseGenBank, detectFormat } from '@clonelab/core';

export function SequenceUpload() {
  const dispatch = useAppDispatch();
  
  const handleFileUpload = useCallback(async (file: File) => {
    dispatch(setLoading(true));
    
    try {
      const text = await file.text();
      const format = detectFormat(text);
      
      if (format === 'unknown') {
        throw new Error('Unknown file format. Please upload FASTA or GenBank file.');
      }
      
      const sequence = format === 'fasta'
        ? parseFasta(text)
        : parseGenBank(text);
      
      dispatch(addSequence(sequence));
      
    } catch (error) {
      dispatch(setError(error instanceof Error ? error.message : 'Failed to parse sequence'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);
  
  return (
    <div
      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <p className="text-gray-600 mb-2">
        Drag and drop a sequence file here, or
      </p>
      <label className="inline-block">
        <input
          type="file"
          accept=".fasta,.fa,.fna,.gb,.gbk,.genbank"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
        />
        <span className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 cursor-pointer">
          Choose File
        </span>
      </label>
      <p className="text-sm text-gray-500 mt-2">
        Supports FASTA and GenBank formats
      </p>
    </div>
  );
}
```

---

## Implementation Phases

### Phase 1: Setup (Day 1)

```bash
# Create monorepo
mkdir clonelab && cd clonelab
pnpm init

# Create workspace configuration
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'packages/*'
EOF

# Create packages
mkdir -p packages/core/src packages/web/src
cd packages/core && pnpm init && cd ../..
cd packages/web && pnpm init && cd ../..

# Install dependencies
cd packages/core
pnpm add -D typescript vitest tsup @types/node
cd ../web
pnpm add react react-dom @reduxjs/toolkit react-redux
pnpm add -D @types/react @types/react-dom vite @vitejs/plugin-react typescript
pnpm add -D tailwindcss postcss autoprefixer
```

**Deliverable:** Working monorepo structure

### Phase 2: Core Types (Days 2-3)

Implement all TypeScript interfaces in `packages/core/src/types/`

**Files to create:**
- `types/sequence.ts`
- `types/enzyme.ts`
- `types/fragment.ts`
- `types/ligation.ts`
- `types/index.ts`

**Deliverable:** Complete type definitions

### Phase 3: Core Parsers (Days 4-5)

**Files to create:**
- `parsers/fasta.ts`
- `parsers/genbank.ts`
- `parsers/detect.ts`
- `parsers/index.ts`
- Tests: `tests/parsers.test.ts`

**Deliverable:** Working parsers with tests

### Phase 4: Core Enzyme Logic (Days 6-8)

**Files to create:**
- `enzymes/finder.ts`
- `enzymes/pairing.ts`
- `enzymes/database.ts`
- `enzymes/index.ts`
- `data/enzymes.json` (curate 250 enzymes)
- Tests: `tests/enzymes.test.ts`

**Deliverable:** Enzyme analysis working

### Phase 5: Core Analysis (Days 9-11)

**Files to create:**
- `analysis/digest.ts`
- `analysis/ligation.ts`
- `analysis/features.ts`
- `analysis/index.ts`
- Tests: `tests/analysis.test.ts`

**Deliverable:** Digest and ligation simulation working

### Phase 6: Core Utilities & Public API (Day 12)

**Files to create:**
- `utils/sequence.ts`
- `utils/validation.ts`
- `utils/index.ts`
- `index.ts` (public API)

**Test:** Integration test with full workflow

**Deliverable:** Core library complete and tested

### Phase 7: Web Redux Store (Days 13-14)

**Files to create:**
- `web/src/store/store.ts`
- `web/src/store/slices/sequencesSlice.ts`
- `web/src/store/slices/enzymesSlice.ts`
- `web/src/store/slices/digestSlice.ts`
- `web/src/store/slices/ligationSlice.ts`
- `web/src/store/slices/uiSlice.ts`

**Deliverable:** State management working

### Phase 8: Basic UI Components (Days 15-17)

**Files to create:**
- `web/src/components/layout/Layout.tsx`
- `web/src/components/layout/Header.tsx`
- `web/src/components/common/Button.tsx`
- `web/src/components/common/Card.tsx`
- Tailwind configuration

**Deliverable:** Basic UI shell

### Phase 9: Sequence Components (Days 18-20)

**Files to create:**
- `web/src/components/sequence/SequenceUpload.tsx`
- `web/src/components/sequence/SequenceView.tsx`
- `web/src/components/sequence/LinearView.tsx` (using SeqViz)
- `web/src/components/sequence/CircularView.tsx`

**Deliverable:** Sequence visualization working

### Phase 10: Enzyme Components (Days 21-23)

**Files to create:**
- `web/src/components/enzyme/EnzymePanel.tsx`
- `web/src/components/enzyme/EnzymeList.tsx`
- `web/src/components/enzyme/EnzymeFilter.tsx`

**Deliverable:** Enzyme selection UI working

### Phase 11: Digest Components (Days 24-25)

**Files to create:**
- `web/src/components/digest/DigestSimulator.tsx`
- `web/src/components/digest/FragmentList.tsx`
- `web/src/components/digest/VirtualGel.tsx`

**Deliverable:** Digest simulation UI working

### Phase 12: Ligation Components (Days 26-27)

**Files to create:**
- `web/src/components/ligation/LigationPlanner.tsx`
- `web/src/components/ligation/ProductPreview.tsx`

**Deliverable:** Ligation planning UI working

### Phase 13: Polish & Test (Days 28-30)

- Write E2E tests
- Fix bugs
- Improve error handling
- Add loading states
- Accessibility audit
- Performance optimization

**Deliverable:** Production-ready app

---

## Testing Strategy

### Core Library Tests

```bash
cd packages/core
pnpm test
```

Example test:

```typescript
// packages/core/tests/parsers.test.ts

import { describe, it, expect } from 'vitest';
import { parseFasta } from '../src/parsers';

describe('FASTA Parser', () => {
  it('parses simple FASTA', () => {
    const input = '>test\nATGC';
    const result = parseFasta(input);
    
    expect(result.name).toBe('test');
    expect(result.sequence).toBe('ATGC');
    expect(result.length).toBe(4);
  });
  
  it('calculates GC content', () => {
    const input = '>test\nGGGGCCCCAAAATTTT';
    const result = parseFasta(input);
    
    expect(result.gcContent).toBeCloseTo(50, 1);
  });
});
```

### Web Frontend Tests

```bash
cd packages/web
pnpm test
```

Example test:

```typescript
// packages/web/src/components/sequence/SequenceUpload.test.tsx

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../store/store';
import { SequenceUpload } from './SequenceUpload';

describe('SequenceUpload', () => {
  it('renders upload UI', () => {
    render(
      <Provider store={store}>
        <SequenceUpload />
      </Provider>
    );
    
    expect(screen.getByText(/drag and drop/i)).toBeInTheDocument();
  });
});
```

---

## Deployment

### Build Core Library

```bash
cd packages/core
pnpm build

# Output: dist/index.js, dist/index.cjs, dist/index.d.ts
```

### Build Web Frontend

```bash
cd packages/web
pnpm build

# Output: dist/ (static files)
```

### Deploy to Vercel

```bash
# From root
vercel --prod

# Or configure vercel.json:
```

```json
{
  "buildCommand": "pnpm build:web",
  "outputDirectory": "packages/web/dist",
  "framework": "vite"
}
```

---

## Success Criteria

### Core Library
- [ ] All parsers working (FASTA, GenBank)
- [ ] Enzyme finding accurate and fast (<3s for 50kb)
- [ ] Digest simulation produces correct fragments
- [ ] Ligation prediction works correctly
- [ ] >90% test coverage
- [ ] Zero dependencies (pure TypeScript)
- [ ] Works in Node, browser, Deno

### Web Frontend
- [ ] Upload sequences (drag-drop + file picker)
- [ ] Visualize linear and circular DNA
- [ ] Find and filter enzymes
- [ ] Simulate digest and view fragments
- [ ] Plan ligation and predict products
- [ ] Responsive design (desktop + tablet)
- [ ] <2s page load on 3G
- [ ] Cross-browser (Chrome, Firefox, Safari)

---

## Next Steps

1. **Initialize monorepo** following Phase 1
2. **Build core library** (Phases 2-6)
3. **Build web frontend** (Phases 7-12)
4. **Test and deploy** (Phase 13)

This modular architecture gives you the flexibility to swap frontends, build mobile apps, create CLI tools, and publish the core as a reusable library. The core library is the "brain" with all the biological algorithms, and frontends are interchangeable "faces" for different use cases.

**Ready to implement!** 🚀
