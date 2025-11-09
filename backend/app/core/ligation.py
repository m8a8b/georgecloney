"""
Ligation simulation using BioPython.

Simulates DNA ligation reactions and predicts potential products.
"""

import uuid
from typing import Literal

from Bio.Seq import Seq
from Bio.SeqUtils import gc_fraction

from app.models.schemas import DigestFragment, LigationProduct, Feature


def simulate_ligation(
    vector_fragment: DigestFragment,
    insert_fragment: DigestFragment,
    molar_ratio: float = 3.0,
) -> list[LigationProduct]:
    """
    Simulate ligation of vector and insert fragments.

    Args:
        vector_fragment: Digested vector fragment
        insert_fragment: Digested insert fragment
        molar_ratio: Insert to vector molar ratio (affects relative probabilities)

    Returns:
        List of predicted ligation products
    """
    products = []

    # Correct orientation: vector + insert
    correct_product = _ligate_fragments(
        vector_fragment,
        insert_fragment,
        product_type="correct",
        description=f"Vector backbone with insert in correct orientation",
        is_desired=True,
        probability=0.6,  # Highest probability for desired product
    )
    products.append(correct_product)

    # Reverse orientation: vector + reverse-complement insert
    reverse_product = _ligate_fragments(
        vector_fragment,
        insert_fragment,
        product_type="reverse",
        description="Vector backbone with insert in reverse orientation",
        is_desired=False,
        probability=0.2,  # Lower probability
        reverse_insert=True,
    )
    products.append(reverse_product)

    # Self-ligation of vector (no insert)
    self_ligation = LigationProduct(
        id=str(uuid.uuid4()),
        type="self-ligation",
        sequence=vector_fragment.sequence,
        length=vector_fragment.length,
        probability=0.15,
        fragment_ids=[vector_fragment.id],
        description="Vector self-ligation (no insert)",
        is_desired=False,
    )
    products.append(self_ligation)

    # Concatemer: multiple inserts
    if molar_ratio > 2.0:
        concatemer = _ligate_fragments(
            vector_fragment,
            insert_fragment,
            product_type="concatemer",
            description="Vector with multiple insert copies",
            is_desired=False,
            probability=0.05,
            multiple_inserts=True,
        )
        products.append(concatemer)

    # Normalize probabilities
    total_prob = sum(p.probability for p in products)
    for product in products:
        product.probability = product.probability / total_prob

    # Sort by probability (descending)
    products.sort(key=lambda p: p.probability, reverse=True)

    return products


def _ligate_fragments(
    vector_fragment: DigestFragment,
    insert_fragment: DigestFragment,
    product_type: Literal["correct", "reverse", "self-ligation", "concatemer", "other"],
    description: str,
    is_desired: bool,
    probability: float,
    reverse_insert: bool = False,
    multiple_inserts: bool = False,
) -> LigationProduct:
    """
    Create a ligation product by joining fragments.

    Args:
        vector_fragment: Vector fragment
        insert_fragment: Insert fragment
        product_type: Type of ligation product
        description: Human-readable description
        is_desired: Whether this is the desired cloning product
        probability: Relative probability (0-1)
        reverse_insert: If True, use reverse complement of insert
        multiple_inserts: If True, include 2 copies of insert

    Returns:
        LigationProduct object
    """
    # Prepare insert sequence
    insert_seq = insert_fragment.sequence
    if reverse_insert:
        bio_seq = Seq(insert_seq)
        insert_seq = str(bio_seq.reverse_complement())

    # Combine sequences
    if multiple_inserts:
        final_sequence = vector_fragment.sequence + insert_seq + insert_seq
    else:
        final_sequence = vector_fragment.sequence + insert_seq

    # Combine features
    features = []

    # Add vector features (positions unchanged)
    features.extend(vector_fragment.features)

    # Add insert features (positions shifted by vector length)
    offset = vector_fragment.length
    for feature in insert_fragment.features:
        shifted_feature = Feature(
            id=feature.id,
            name=feature.name,
            type=feature.type,
            start=feature.start + offset,
            end=feature.end + offset,
            strand=feature.strand if not reverse_insert else -feature.strand,
            color=feature.color,
            notes=feature.notes,
            qualifiers=feature.qualifiers,
        )
        features.append(shifted_feature)

    # If multiple inserts, add second copy
    if multiple_inserts:
        offset2 = offset + insert_fragment.length
        for feature in insert_fragment.features:
            shifted_feature2 = Feature(
                id=f"{feature.id}_copy2",
                name=f"{feature.name} (copy 2)",
                type=feature.type,
                start=feature.start + offset2,
                end=feature.end + offset2,
                strand=feature.strand if not reverse_insert else -feature.strand,
                color=feature.color,
                notes=feature.notes,
                qualifiers=feature.qualifiers,
            )
            features.append(shifted_feature2)

    return LigationProduct(
        id=str(uuid.uuid4()),
        type=product_type,
        sequence=final_sequence,
        length=len(final_sequence),
        probability=probability,
        fragment_ids=[vector_fragment.id, insert_fragment.id],
        description=description,
        is_desired=is_desired,
    )


def check_compatibility(
    fragment1: DigestFragment,
    fragment2: DigestFragment,
) -> dict:
    """
    Check if two fragments have compatible ends for ligation.

    Args:
        fragment1: First fragment
        fragment2: Second fragment

    Returns:
        Dictionary with compatibility information
    """
    # Check end compatibility
    # In a real implementation, we'd check overhang sequences
    # For now, simplified compatibility check

    compatible = True
    warnings = []

    if fragment1.three_prime_end == "blunt" and fragment2.five_prime_end == "blunt":
        warnings.append("Blunt-end ligation has lower efficiency")

    if fragment1.three_prime_end == "sticky" and fragment2.five_prime_end != "sticky":
        compatible = False
        warnings.append("Incompatible end types")

    return {
        "compatible": compatible,
        "warnings": warnings,
        "ligation_efficiency": "high" if compatible and not warnings else "low",
    }
