# @clonelab/core

Framework-agnostic molecular cloning toolkit for TypeScript/JavaScript.

## Features

- **Sequence Parsing**: Read FASTA and GenBank files
- **Enzyme Analysis**: Find restriction sites in DNA sequences
- **Digest Simulation**: Predict fragments from restriction digests
- **Ligation Planning**: Plan and optimize cloning strategies
- **Zero Dependencies**: Pure TypeScript with no external dependencies

## Installation

```bash
npm install @clonelab/core
# or
pnpm add @clonelab/core
```

## Usage

```typescript
import { parseFasta, findRestrictionSites, simulateDigest } from '@clonelab/core';

// Parse a sequence
const sequence = parseFasta(fastaText);

// Find restriction sites
const sites = findRestrictionSites(sequence.sequence, enzymeDatabase);

// Simulate digest
const fragments = simulateDigest(sequence, ['EcoRI', 'BamHI']);
```

## API Documentation

See the [API documentation](../../docs/API.md) for complete details.

## License

MIT
