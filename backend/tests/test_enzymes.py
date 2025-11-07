"""Tests for enzyme analysis."""

import pytest

from app.core.enzymes import count_enzyme_sites, find_restriction_sites, find_single_cutters


def test_find_ecori_site():
    """Test finding EcoRI restriction site."""
    sequence = "ATGCGAATTCGCTA"

    sites = find_restriction_sites(sequence, "linear", ["EcoRI"])

    assert "EcoRI" in sites
    assert len(sites["EcoRI"]) == 1
    assert sites["EcoRI"][0].enzyme == "EcoRI"


def test_count_multiple_sites():
    """Test counting multiple restriction sites."""
    sequence = "GAATTCATGCGAATTC"

    counts = count_enzyme_sites(sequence, "linear", ["EcoRI"])

    assert counts["EcoRI"] == 2


def test_find_single_cutters():
    """Test finding enzymes that cut once."""
    sequence = "GAATTCATGCGGATCC"

    single_cutters = find_single_cutters(sequence, "linear", ["EcoRI", "BamHI"])

    assert "EcoRI" in single_cutters
    assert "BamHI" in single_cutters


def test_no_sites_found():
    """Test sequence with no restriction sites."""
    sequence = "ATGCATGCATGC"

    sites = find_restriction_sites(sequence, "linear", ["EcoRI"])

    assert "EcoRI" in sites
    assert len(sites["EcoRI"]) == 0
