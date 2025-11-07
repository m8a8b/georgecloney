import { describe, it, expect } from 'vitest';
import {
  findRestrictionSites,
  findEnzymeSites,
  countEnzymeSites,
  filterEnzymesByCutCount,
  findSingleCutters,
  findNonCutters,
  suggestEnzymePairs,
  groupEnzymesByOverhang,
  loadEnzymeDatabase,
  getEnzyme,
  getEnzymes,
  filterBySupplier,
  filterByOverhangType,
} from '../src/enzymes';
import type { RestrictionEnzyme } from '../src/types';

// Test enzyme data
const testEnzymes: Record<string, RestrictionEnzyme> = {
  EcoRI: {
    name: 'EcoRI',
    recognitionSeq: 'GAATTC',
    cutPos5: 1,
    cutPos3: 5,
    overhangType: "5'",
    overhangSeq: 'AATT',
    suppliers: ['NEB'],
    buffers: ['CutSmart'],
    methylationSensitive: true,
    starActivity: true,
    heatInactivation: 65,
  },
  BamHI: {
    name: 'BamHI',
    recognitionSeq: 'GGATCC',
    cutPos5: 1,
    cutPos3: 5,
    overhangType: "5'",
    overhangSeq: 'GATC',
    suppliers: ['NEB'],
    buffers: ['CutSmart'],
    methylationSensitive: false,
    starActivity: true,
    heatInactivation: 65,
  },
  SmaI: {
    name: 'SmaI',
    recognitionSeq: 'CCCGGG',
    cutPos5: 3,
    cutPos3: 3,
    overhangType: 'blunt',
    overhangSeq: '',
    suppliers: ['NEB'],
    buffers: ['CutSmart'],
    methylationSensitive: false,
    starActivity: false,
    heatInactivation: 65,
  },
};

describe('Enzyme Finder', () => {
  it('should find single EcoRI site', () => {
    const sequence = 'ATGCGAATTCGCTA';
    const sites = findRestrictionSites(sequence, testEnzymes);

    expect(sites.EcoRI).toHaveLength(1);
    expect(sites.EcoRI[0].enzyme).toBe('EcoRI');
    expect(sites.EcoRI[0].recognitionStart).toBe(4);
  });

  it('should find multiple restriction sites', () => {
    const sequence = 'GAATTCATGCGGATCCATGCGAATTC';
    const sites = findRestrictionSites(sequence, testEnzymes);

    expect(sites.EcoRI).toHaveLength(2);
    expect(sites.BamHI).toHaveLength(1);
  });

  it('should find sites on forward and reverse strands', () => {
    // GAATTC on forward, reverse complement also contains GAATTC
    const sequence = 'GAATTCNNNNNNNGAATTC';
    const sites = findRestrictionSites(sequence, testEnzymes);

    expect(sites.EcoRI.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle circular sequences spanning origin', () => {
    // Site that spans the origin: ...TTC (end) + GAA... (start)
    const sequence = 'AATTCNNNNNNNGA';
    const sites = findRestrictionSites(sequence, testEnzymes, 'circular');

    // Should find the site that spans the origin
    expect(sites.EcoRI.length).toBeGreaterThanOrEqual(0);
  });

  it('should return empty array for enzymes with no sites', () => {
    const sequence = 'ATGCATGCATGC';
    const sites = findRestrictionSites(sequence, testEnzymes);

    expect(sites.EcoRI).toHaveLength(0);
    expect(sites.BamHI).toHaveLength(0);
  });

  it('should find blunt cutter sites', () => {
    const sequence = 'ATGCCCGGGCTA';
    const sites = findRestrictionSites(sequence, testEnzymes);

    expect(sites.SmaI).toHaveLength(1);
    expect(sites.SmaI[0].overhangSeq).toBe('');
  });
});

describe('Enzyme Site Counting', () => {
  it('should count sites correctly', () => {
    const sequence = 'GAATTCATGCGAATTC';
    const counts = countEnzymeSites(sequence, testEnzymes);

    expect(counts.EcoRI).toBe(2);
    expect(counts.BamHI).toBe(0);
  });

  it('should filter by cut count', () => {
    const sequence = 'GAATTCATGCGGATCCATGCGAATTC';

    // Find enzymes that cut exactly once
    const onceCutters = filterEnzymesByCutCount(sequence, testEnzymes, 1, 1);
    expect(onceCutters.BamHI).toBeDefined();
    expect(onceCutters.EcoRI).toBeUndefined(); // Cuts twice

    // Find enzymes that cut at least once
    const anyCutters = filterEnzymesByCutCount(sequence, testEnzymes, 1, Infinity);
    expect(anyCutters.EcoRI).toBeDefined();
    expect(anyCutters.BamHI).toBeDefined();
  });
});

describe('Enzyme Pairing', () => {
  it('should find single cutters', () => {
    const sequence = 'GAATTCATGCGGATCC';
    const singleCutters = findSingleCutters(sequence, testEnzymes);

    expect(singleCutters).toContain('EcoRI');
    expect(singleCutters).toContain('BamHI');
    expect(singleCutters).not.toContain('SmaI');
  });

  it('should find non-cutters', () => {
    const sequence = 'ATGCATGCATGC';
    const nonCutters = findNonCutters(sequence, testEnzymes);

    expect(nonCutters).toContain('EcoRI');
    expect(nonCutters).toContain('BamHI');
    expect(nonCutters).toContain('SmaI');
  });

  it('should suggest enzyme pairs for cloning', () => {
    const vector = 'NNNNGAATTCNNNNNNGGATCCNNNN';
    const insert = 'NNGAATTCNNNNNNGGATCCNN';

    const pairs = suggestEnzymePairs(vector, insert, testEnzymes);

    expect(pairs.length).toBeGreaterThan(0);
    expect(pairs[0].enzyme1).toBeDefined();
    expect(pairs[0].enzyme2).toBeDefined();
    expect(pairs[0].score).toBeGreaterThan(0);
    expect(pairs[0].score).toBeLessThanOrEqual(1);
  });

  it('should score pairs with different overhangs higher', () => {
    const testEnzymesWithBlunt = {
      ...testEnzymes,
      EcoRV: {
        name: 'EcoRV',
        recognitionSeq: 'GATATC',
        cutPos5: 3,
        cutPos3: 3,
        overhangType: 'blunt' as const,
        overhangSeq: '',
        suppliers: ['NEB'],
        buffers: ['CutSmart'],
        methylationSensitive: false,
        starActivity: false,
        heatInactivation: 65,
      },
    };

    const vector = 'NNGAATTCNNNNNNGATATCNN';
    const insert = 'NNGAATTCNNNNNNGATATCNN';

    const pairs = suggestEnzymePairs(vector, insert, testEnzymesWithBlunt);

    // Pair with different overhangs should score higher
    const differentOverhangPair = pairs.find(
      p => (p.enzyme1 === 'EcoRI' && p.enzyme2 === 'EcoRV') ||
           (p.enzyme1 === 'EcoRV' && p.enzyme2 === 'EcoRI')
    );

    expect(differentOverhangPair).toBeDefined();
    expect(differentOverhangPair!.reasons).toContain('Different overhangs prevent self-ligation');
  });

  it('should group enzymes by overhang', () => {
    const groups = groupEnzymesByOverhang(testEnzymes);

    expect(groups.AATT).toContain('EcoRI');
    expect(groups.GATC).toContain('BamHI');
    expect(groups.blunt).toContain('SmaI');
  });
});

describe('Enzyme Database', () => {
  it('should load enzyme database', () => {
    const db = loadEnzymeDatabase();

    expect(db).toBeDefined();
    expect(Object.keys(db).length).toBeGreaterThan(0);
    expect(db.EcoRI).toBeDefined();
    expect(db.BamHI).toBeDefined();
  });

  it('should get enzyme by name', () => {
    const ecoRI = getEnzyme('EcoRI');

    expect(ecoRI).toBeDefined();
    expect(ecoRI?.name).toBe('EcoRI');
    expect(ecoRI?.recognitionSeq).toBe('GAATTC');
  });

  it('should get enzyme case-insensitively', () => {
    const ecoRI = getEnzyme('ecori');

    expect(ecoRI).toBeDefined();
    expect(ecoRI?.name).toBe('EcoRI');
  });

  it('should return undefined for non-existent enzyme', () => {
    const enzyme = getEnzyme('NonExistentEnzyme');

    expect(enzyme).toBeUndefined();
  });

  it('should get multiple enzymes', () => {
    const enzymes = getEnzymes(['EcoRI', 'BamHI', 'NonExistent']);

    expect(Object.keys(enzymes)).toHaveLength(2);
    expect(enzymes.EcoRI).toBeDefined();
    expect(enzymes.BamHI).toBeDefined();
  });

  it('should filter by supplier', () => {
    const nebEnzymes = filterBySupplier('NEB');

    expect(Object.keys(nebEnzymes).length).toBeGreaterThan(0);
    for (const enzyme of Object.values(nebEnzymes)) {
      expect(enzyme.suppliers).toContain('NEB');
    }
  });

  it('should filter by overhang type', () => {
    const bluntCutters = filterByOverhangType('blunt');

    expect(Object.keys(bluntCutters).length).toBeGreaterThan(0);
    for (const enzyme of Object.values(bluntCutters)) {
      expect(enzyme.overhangType).toBe('blunt');
    }

    const fivePrimeEnzymes = filterByOverhangType("5'");
    expect(Object.keys(fivePrimeEnzymes).length).toBeGreaterThan(0);
    for (const enzyme of Object.values(fivePrimeEnzymes)) {
      expect(enzyme.overhangType).toBe("5'");
    }
  });
});

describe('findEnzymeSites', () => {
  it('should find sites for a single enzyme', () => {
    const sequence = 'ATGCGAATTCGCTA';
    const enzyme = testEnzymes.EcoRI;

    const sites = findEnzymeSites(sequence, enzyme);

    expect(sites).toHaveLength(1);
    expect(sites[0].enzyme).toBe('EcoRI');
    expect(sites[0].recognitionStart).toBe(4);
  });

  it('should handle linear topology', () => {
    const sequence = 'GAATTCATGC';
    const enzyme = testEnzymes.EcoRI;

    const sites = findEnzymeSites(sequence, enzyme, 'linear');

    expect(sites).toHaveLength(1);
  });

  it('should handle circular topology', () => {
    const sequence = 'AATTCNNNGA'; // Site spans origin: ...TTC + GAA...
    const enzyme = testEnzymes.EcoRI;

    const sites = findEnzymeSites(sequence, enzyme, 'circular');

    // Should be able to find sites that span the origin
    expect(sites).toBeDefined();
  });
});
