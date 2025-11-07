"""
Enzyme analysis using BioPython's Bio.Restriction module.

This leverages BioPython's comprehensive restriction enzyme database
with over 600 enzymes from REBASE.
"""

import uuid
from typing import Optional

from Bio.Restriction import Analysis, RestrictionBatch, AllEnzymes
from Bio.Seq import Seq

from app.models.schemas import EnzymePair, RestrictionSite


def find_restriction_sites(
    sequence: str,
    topology: str = "linear",
    enzyme_names: Optional[list[str]] = None,
) -> dict[str, list[RestrictionSite]]:
    """
    Find restriction sites in a DNA sequence using BioPython.

    Args:
        sequence: DNA sequence string
        topology: 'linear' or 'circular'
        enzyme_names: Specific enzyme names to search for (all if None)

    Returns:
        Dictionary mapping enzyme names to lists of restriction sites
    """
    # Create Bio.Seq object
    seq = Seq(sequence.upper())

    # Determine if circular
    is_circular = topology.lower() == "circular"

    # Get enzyme batch
    if enzyme_names:
        # Use specific enzymes
        try:
            rb = RestrictionBatch([enz for enz in AllEnzymes if str(enz) in enzyme_names])
        except Exception:
            # Fallback: try to find enzymes by name
            valid_enzymes = []
            for name in enzyme_names:
                for enz in AllEnzymes:
                    if str(enz).lower() == name.lower():
                        valid_enzymes.append(enz)
            if not valid_enzymes:
                raise ValueError(f"No valid enzymes found from: {enzyme_names}")
            rb = RestrictionBatch(valid_enzymes)
    else:
        # Use common commercially available enzymes (subset for performance)
        common_enzymes = [
            "EcoRI", "BamHI", "HindIII", "PstI", "SalI", "XbaI", "SmaI",
            "KpnI", "SacI", "XhoI", "NotI", "SpeI", "NheI", "ApaI",
            "NcoI", "NdeI", "BglII", "EcoRV", "PvuII", "AgeI", "ClaI",
            "MluI", "SacII", "AscI", "FseI", "PmeI", "SbfI", "BssHII"
        ]
        rb = RestrictionBatch([enz for enz in AllEnzymes if str(enz) in common_enzymes])

    # Analyze sequence
    analysis = Analysis(rb, seq, linear=not is_circular)
    results_dict = analysis.full()

    # Convert to our schema format
    sites_map: dict[str, list[RestrictionSite]] = {}

    for enzyme, positions in results_dict.items():
        enzyme_name = str(enzyme)
        sites = []

        for pos in positions:
            # BioPython uses 1-indexed positions, convert to 0-indexed
            position_0_indexed = pos - 1

            # Get enzyme properties
            overhang = enzyme.ovhg if hasattr(enzyme, "ovhg") else 0
            site_length = len(enzyme.site) if hasattr(enzyme, "site") else 6

            # Determine overhang sequence
            if overhang > 0:
                # 5' overhang
                overhang_seq = sequence[position_0_indexed:position_0_indexed + overhang]
            elif overhang < 0:
                # 3' overhang
                overhang_seq = sequence[position_0_indexed + overhang:position_0_indexed]
            else:
                # Blunt end
                overhang_seq = ""

            site = RestrictionSite(
                enzyme=enzyme_name,
                position=position_0_indexed,
                strand=1,  # BioPython doesn't distinguish forward/reverse in results
                recognition_start=position_0_indexed,
                recognition_end=position_0_indexed + site_length,
                overhang_seq=overhang_seq,
            )
            sites.append(site)

        sites_map[enzyme_name] = sites

    return sites_map


def count_enzyme_sites(
    sequence: str,
    topology: str = "linear",
    enzyme_names: Optional[list[str]] = None,
) -> dict[str, int]:
    """
    Count restriction sites for each enzyme.

    Args:
        sequence: DNA sequence string
        topology: 'linear' or 'circular'
        enzyme_names: Specific enzyme names (all if None)

    Returns:
        Dictionary mapping enzyme names to site counts
    """
    sites_map = find_restriction_sites(sequence, topology, enzyme_names)
    return {enzyme: len(sites) for enzyme, sites in sites_map.items()}


def find_single_cutters(
    sequence: str,
    topology: str = "linear",
    enzyme_names: Optional[list[str]] = None,
) -> list[str]:
    """
    Find enzymes that cut exactly once in a sequence.

    Args:
        sequence: DNA sequence string
        topology: 'linear' or 'circular'
        enzyme_names: Specific enzyme names (all if None)

    Returns:
        List of enzyme names that cut once
    """
    counts = count_enzyme_sites(sequence, topology, enzyme_names)
    return [enzyme for enzyme, count in counts.items() if count == 1]


def suggest_enzyme_pairs(
    vector_sequence: str,
    insert_sequence: str,
    vector_topology: str = "circular",
) -> list[EnzymePair]:
    """
    Suggest compatible enzyme pairs for directional cloning.

    Args:
        vector_sequence: Vector DNA sequence
        insert_sequence: Insert DNA sequence
        vector_topology: Vector topology ('circular' or 'linear')

    Returns:
        List of EnzymePair suggestions, sorted by score
    """
    # Find single cutters in both sequences
    vector_single = set(find_single_cutters(vector_sequence, vector_topology))
    insert_single = set(find_single_cutters(insert_sequence, "linear"))

    # Find common single cutters
    common_single = vector_single & insert_single

    if len(common_single) < 2:
        # Not enough compatible enzymes
        return []

    # Generate enzyme pairs
    pairs: list[EnzymePair] = []
    enzyme_list = list(common_single)

    for i in range(len(enzyme_list)):
        for j in range(i + 1, len(enzyme_list)):
            enz1_name = enzyme_list[i]
            enz2_name = enzyme_list[j]

            # Get enzyme objects
            enz1 = None
            enz2 = None
            for enz in AllEnzymes:
                if str(enz) == enz1_name:
                    enz1 = enz
                if str(enz) == enz2_name:
                    enz2 = enz

            if not enz1 or not enz2:
                continue

            # Evaluate pair
            pair = evaluate_enzyme_pair(enz1, enz2)
            pairs.append(pair)

    # Sort by score (highest first)
    pairs.sort(key=lambda p: p.score, reverse=True)

    return pairs


def evaluate_enzyme_pair(enz1, enz2) -> EnzymePair:
    """
    Evaluate the quality of an enzyme pair for cloning.

    Args:
        enz1: BioPython enzyme object
        enz2: BioPython enzyme object

    Returns:
        EnzymePair with score and recommendations
    """
    score = 0.5  # Start neutral
    reasons = []
    warnings = []

    enz1_name = str(enz1)
    enz2_name = str(enz2)

    # Check overhang compatibility
    ovhg1 = enz1.ovhg if hasattr(enz1, "ovhg") else 0
    ovhg2 = enz2.ovhg if hasattr(enz2, "ovhg") else 0

    if ovhg1 != ovhg2:
        score += 0.2
        reasons.append("Different overhang types prevent self-ligation")
    else:
        score -= 0.15
        warnings.append("Same overhang type may cause unwanted ligation")

    # Check if both create sticky ends (preferred over blunt)
    if ovhg1 != 0 and ovhg2 != 0:
        score += 0.15
        reasons.append("Both create sticky ends (efficient ligation)")

    # Check buffer compatibility (BioPython doesn't have this data)
    # For now, assume most commercial enzymes are compatible
    buffer_compatible = True
    score += 0.1
    reasons.append("Enzymes likely compatible in common buffers")

    # Check for methylation sensitivity (BioPython has limited data)
    # Most modern enzymes are not sensitive, but flag common ones
    methylation_sensitive = ["EcoRI", "PstI", "XbaI", "KpnI", "XhoI", "ClaI", "SacI", "SacII"]
    if enz1_name in methylation_sensitive:
        warnings.append(f"{enz1_name} may be sensitive to Dam/Dcm methylation")
    if enz2_name in methylation_sensitive:
        warnings.append(f"{enz2_name} may be sensitive to Dam/Dcm methylation")

    # Prefer enzymes with different recognition sequences
    site1 = str(enz1.site) if hasattr(enz1, "site") else ""
    site2 = str(enz2.site) if hasattr(enz2, "site") else ""
    if site1 != site2:
        score += 0.1
        reasons.append("Different recognition sequences")

    # Clamp score between 0 and 1
    score = max(0.0, min(1.0, score))

    return EnzymePair(
        enzyme1=enz1_name,
        enzyme2=enz2_name,
        score=score,
        reasons=reasons,
        warnings=warnings,
        buffer_compatible=buffer_compatible,
    )
