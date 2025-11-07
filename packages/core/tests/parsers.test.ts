import { describe, it, expect } from 'vitest';
import { parseFasta, parseMultiFasta, parseGenBank, detectFormat } from '../src/parsers';

describe('FASTA Parser', () => {
  it('should parse a simple FASTA sequence', () => {
    const fasta = `>test_sequence Example sequence
ATGCATGCATGC`;

    const result = parseFasta(fasta);

    expect(result.name).toBe('test_sequence');
    expect(result.sequence).toBe('ATGCATGCATGC');
    expect(result.length).toBe(12);
    expect(result.topology).toBe('linear');
    expect(result.description).toBe('Example sequence');
    expect(result.features).toEqual([]);
  });

  it('should parse multi-line FASTA sequence', () => {
    const fasta = `>multi_line
ATGCATGC
ATGCATGC
ATGC`;

    const result = parseFasta(fasta);

    expect(result.sequence).toBe('ATGCATGCATGCATGCATGC');
    expect(result.length).toBe(20);
  });

  it('should handle sequence with numbers and whitespace', () => {
    const fasta = `>numbered_seq
1 ATGC ATGC 10
20 ATGC ATGC 30`;

    const result = parseFasta(fasta);

    expect(result.sequence).toBe('ATGCATGCATGCATGC');
  });

  it('should calculate GC content correctly', () => {
    const fasta = `>gc_test
GGGGCCCC`;

    const result = parseFasta(fasta);

    expect(result.gcContent).toBe(100);
  });

  it('should throw error for invalid FASTA format', () => {
    const invalidFasta = `ATGCATGC`; // Missing header

    expect(() => parseFasta(invalidFasta)).toThrow('Invalid FASTA format');
  });

  it('should throw error for empty sequence', () => {
    const emptyFasta = `>empty_seq
`;

    expect(() => parseFasta(emptyFasta)).toThrow('sequence is empty');
  });

  it('should throw error for invalid DNA characters', () => {
    const invalidDNA = `>invalid
ATGCXYZ`;

    expect(() => parseFasta(invalidDNA)).toThrow('non-IUPAC characters');
  });
});

describe('Multi-FASTA Parser', () => {
  it('should parse multiple FASTA sequences', () => {
    const multiFasta = `>seq1
ATGC
>seq2
GCTA
>seq3
TTAA`;

    const results = parseMultiFasta(multiFasta);

    expect(results).toHaveLength(3);
    expect(results[0].name).toBe('seq1');
    expect(results[0].sequence).toBe('ATGC');
    expect(results[1].name).toBe('seq2');
    expect(results[1].sequence).toBe('GCTA');
    expect(results[2].name).toBe('seq3');
    expect(results[2].sequence).toBe('TTAA');
  });

  it('should skip invalid sequences but continue parsing', () => {
    const multiFasta = `>seq1
ATGC
>invalid
XYZ
>seq2
GCTA`;

    const results = parseMultiFasta(multiFasta);

    expect(results).toHaveLength(2);
    expect(results[0].name).toBe('seq1');
    expect(results[1].name).toBe('seq2');
  });
});

describe('GenBank Parser', () => {
  it('should parse a simple GenBank sequence', () => {
    const genbank = `LOCUS       test_plasmid    20 bp    DNA     circular
DEFINITION  Test plasmid for testing
FEATURES             Location/Qualifiers
     gene            1..10
                     /label="test_gene"
ORIGIN
        1 atgcatgcat gcatgcatgc
//`;

    const result = parseGenBank(genbank);

    expect(result.name).toBe('test_plasmid');
    expect(result.sequence).toBe('ATGCATGCATGCATGCATGC');
    expect(result.length).toBe(20);
    expect(result.topology).toBe('circular');
    expect(result.description).toBe('Test plasmid for testing');
    expect(result.features).toHaveLength(1);
    expect(result.features[0].name).toBe('test_gene');
    expect(result.features[0].start).toBe(0); // 0-indexed
    expect(result.features[0].end).toBe(10);
  });

  it('should parse features on complement strand', () => {
    const genbank = `LOCUS       test    20 bp    DNA     linear
FEATURES             Location/Qualifiers
     gene            complement(5..15)
                     /label="reverse_gene"
ORIGIN
        1 atgcatgcat gcatgcatgc
//`;

    const result = parseGenBank(genbank);

    expect(result.features).toHaveLength(1);
    expect(result.features[0].strand).toBe(-1);
    expect(result.features[0].start).toBe(4);
    expect(result.features[0].end).toBe(15);
  });

  it('should map feature types correctly', () => {
    const genbank = `LOCUS       test    30 bp    DNA     linear
FEATURES             Location/Qualifiers
     CDS             1..10
                     /label="coding_seq"
     promoter        11..20
                     /label="promoter"
     terminator      21..30
                     /label="terminator"
ORIGIN
        1 atgcatgcat gcatgcatgc atgcatgcat
//`;

    const result = parseGenBank(genbank);

    expect(result.features).toHaveLength(3);
    expect(result.features[0].type).toBe('CDS');
    expect(result.features[1].type).toBe('promoter');
    expect(result.features[2].type).toBe('terminator');
  });

  it('should throw error for invalid GenBank format', () => {
    const invalid = `INVALID FORMAT
ATGCATGC`;

    expect(() => parseGenBank(invalid)).toThrow('Invalid GenBank format');
  });
});

describe('Format Detector', () => {
  it('should detect FASTA format', () => {
    const fasta = `>sequence_name
ATGCATGC`;

    expect(detectFormat(fasta)).toBe('fasta');
  });

  it('should detect GenBank format', () => {
    const genbank = `LOCUS       test    20 bp
ORIGIN
        1 atgcatgc
//`;

    expect(detectFormat(genbank)).toBe('genbank');
  });

  it('should return unknown for invalid format', () => {
    const unknown = `ATGCATGC`;

    expect(detectFormat(unknown)).toBe('unknown');
  });

  it('should handle whitespace at start', () => {
    const fasta = `  >sequence_name
ATGCATGC`;

    expect(detectFormat(fasta.trim())).toBe('fasta');
  });
});
