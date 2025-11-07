"""
Digest simulation using BioPython.

Simulates restriction enzyme digests and predicts resulting fragments.
"""

import uuid
from typing import Literal

from Bio.Restriction import Analysis, RestrictionBatch, AllEnzymes
from Bio.Seq import Seq

from app.models.schemas import DigestFragment, Feature


def simulate_digest(
    sequence: str,
    enzyme_names: list[str],
    topology: Literal["linear", "circular"] = "linear",
    features: list[Feature] | None = None,
) -> list[DigestFragment]:
    """
    Simulate a restriction digest and return resulting fragments.

    Args:
        sequence: DNA sequence string
        enzyme_names: List of enzyme names to use
        topology: Sequence topology
        features: Optional list of features to track in fragments

    Returns:
        List of DigestFragment objects
    """
    if not enzyme_names:
        raise ValueError("At least one enzyme must be specified")

    # Create Bio.Seq object
    seq = Seq(sequence.upper())
    is_circular = topology.lower() == "circular"

    # Get enzymes
    enzyme_objects = []
    for name in enzyme_names:
        for enz in AllEnzymes:
            if str(enz).lower() == name.lower():
                enzyme_objects.append(enz)
                break

    if not enzyme_objects:
        raise ValueError(f"No valid enzymes found from: {enzyme_names}")

    rb = RestrictionBatch(enzyme_objects)

    # Analyze to get cut sites
    analysis = Analysis(rb, seq, linear=not is_circular)
    cut_sites = analysis.full()

    # Collect all cut positions
    all_cuts = []
    enzyme_at_position = {}

    for enzyme, positions in cut_sites.items():
        enzyme_name = str(enzyme)
        for pos in positions:
            # Convert to 0-indexed
            pos_0 = pos - 1
            all_cuts.append(pos_0)
            enzyme_at_position[pos_0] = enzyme_name

    # Remove duplicates and sort
    all_cuts = sorted(set(all_cuts))

    if not all_cuts:
        # No cuts - return original sequence as single fragment
        return [
            DigestFragment(
                id=str(uuid.uuid4()),
                sequence=sequence,
                length=len(sequence),
                start=0,
                end=len(sequence),
                five_prime_end="blunt",
                three_prime_end="blunt",
                features=features or [],
            )
        ]

    # Generate fragments
    fragments = []

    if is_circular:
        # For circular DNA, cuts create fragments between consecutive cut sites
        # and one fragment from last cut to first cut (wrapping around)
        for i in range(len(all_cuts)):
            start = all_cuts[i]
            end = all_cuts[(i + 1) % len(all_cuts)]

            if end <= start:
                # Fragment wraps around origin
                frag_seq = sequence[start:] + sequence[:end]
            else:
                frag_seq = sequence[start:end]

            # Determine end types
            start_enzyme = enzyme_at_position.get(start, "unknown")
            end_enzyme = enzyme_at_position.get(end, "unknown")

            # Get features in this fragment
            frag_features = get_features_in_range(
                features or [], start, end, len(sequence), is_circular
            )

            fragment = DigestFragment(
                id=str(uuid.uuid4()),
                sequence=frag_seq,
                length=len(frag_seq),
                start=start,
                end=end if end > start else end + len(sequence),
                five_prime_end="sticky",  # Simplified
                three_prime_end="sticky",
                features=frag_features,
            )
            fragments.append(fragment)
    else:
        # For linear DNA
        # First fragment: start to first cut
        if all_cuts[0] > 0:
            frag_seq = sequence[: all_cuts[0]]
            frag_features = get_features_in_range(features or [], 0, all_cuts[0], len(sequence))

            fragments.append(
                DigestFragment(
                    id=str(uuid.uuid4()),
                    sequence=frag_seq,
                    length=len(frag_seq),
                    start=0,
                    end=all_cuts[0],
                    five_prime_end="blunt",
                    three_prime_end="sticky",
                    features=frag_features,
                )
            )

        # Middle fragments
        for i in range(len(all_cuts) - 1):
            start = all_cuts[i]
            end = all_cuts[i + 1]
            frag_seq = sequence[start:end]
            frag_features = get_features_in_range(features or [], start, end, len(sequence))

            fragments.append(
                DigestFragment(
                    id=str(uuid.uuid4()),
                    sequence=frag_seq,
                    length=len(frag_seq),
                    start=start,
                    end=end,
                    five_prime_end="sticky",
                    three_prime_end="sticky",
                    features=frag_features,
                )
            )

        # Last fragment: last cut to end
        if all_cuts[-1] < len(sequence):
            frag_seq = sequence[all_cuts[-1] :]
            frag_features = get_features_in_range(
                features or [], all_cuts[-1], len(sequence), len(sequence)
            )

            fragments.append(
                DigestFragment(
                    id=str(uuid.uuid4()),
                    sequence=frag_seq,
                    length=len(frag_seq),
                    start=all_cuts[-1],
                    end=len(sequence),
                    five_prime_end="sticky",
                    three_prime_end="blunt",
                    features=frag_features,
                )
            )

    return fragments


def get_features_in_range(
    features: list[Feature],
    start: int,
    end: int,
    seq_length: int,
    is_circular: bool = False,
) -> list[Feature]:
    """
    Get features that overlap with a given range.

    Args:
        features: List of features
        start: Range start position
        end: Range end position
        seq_length: Total sequence length
        is_circular: Whether sequence is circular

    Returns:
        List of features overlapping the range
    """
    overlapping = []

    for feature in features:
        # Check if feature overlaps with range
        if is_circular and end < start:
            # Range wraps around origin
            if feature.start >= start or feature.end <= end:
                overlapping.append(feature)
        else:
            # Normal range
            if not (feature.end <= start or feature.start >= end):
                overlapping.append(feature)

    return overlapping


def get_digest_stats(fragments: list[DigestFragment]) -> dict:
    """
    Calculate statistics about digest fragments.

    Args:
        fragments: List of fragments

    Returns:
        Dictionary with statistics
    """
    if not fragments:
        return {
            "total_fragments": 0,
            "largest_fragment": 0,
            "smallest_fragment": 0,
            "average_fragment": 0,
        }

    lengths = [f.length for f in fragments]

    return {
        "total_fragments": len(fragments),
        "largest_fragment": max(lengths),
        "smallest_fragment": min(lengths),
        "average_fragment": sum(lengths) // len(lengths),
    }
