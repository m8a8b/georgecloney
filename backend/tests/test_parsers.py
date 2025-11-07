"""Tests for sequence parsers."""

import pytest

from app.core.parsers import detect_format, parse_sequence


def test_detect_fasta_format():
    """Test FASTA format detection."""
    content = ">test_sequence\nATGCATGC"
    assert detect_format(content) == "fasta"


def test_detect_genbank_format():
    """Test GenBank format detection."""
    content = "LOCUS       test    100 bp\nORIGIN\n  1 atgcatgc\n//"
    assert detect_format(content) == "genbank"


def test_parse_fasta():
    """Test FASTA parsing."""
    content = """>test_sequence Example sequence
ATGCATGCATGC"""

    result = parse_sequence(content, "fasta")

    assert result.name == "test_sequence"
    assert result.sequence == "ATGCATGCATGC"
    assert result.length == 12
    assert result.topology == "linear"
    assert result.gc_content == pytest.approx(50.0, rel=1e-2)


def test_parse_multi_line_fasta():
    """Test multi-line FASTA parsing."""
    content = """>test_sequence
ATGCATGC
ATGCATGC"""

    result = parse_sequence(content, "fasta")

    assert result.sequence == "ATGCATGCATGCATGC"
    assert result.length == 16


def test_invalid_format_raises_error():
    """Test that invalid format raises ValueError."""
    content = "INVALID DATA"

    with pytest.raises(ValueError, match="Cannot detect file format"):
        parse_sequence(content)
