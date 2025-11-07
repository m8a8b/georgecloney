"""
Sequence parsers using BioPython.

This module leverages BioPython's mature parsing capabilities
for FASTA and GenBank formats.
"""

import uuid
from io import StringIO
from typing import Literal, Optional

from Bio import SeqIO
from Bio.Seq import Seq
from Bio.SeqRecord import SeqRecord as BioSeqRecord
from Bio.SeqUtils import GC, molecular_weight

from app.models.schemas import Feature, SequenceRecord


def detect_format(content: str) -> Literal["fasta", "genbank", "unknown"]:
    """
    Auto-detect sequence file format.

    Args:
        content: Raw file content

    Returns:
        Detected format: 'fasta', 'genbank', or 'unknown'
    """
    content = content.strip()

    if content.startswith(">"):
        return "fasta"
    elif content.startswith("LOCUS"):
        return "genbank"
    else:
        return "unknown"


def parse_sequence(
    content: str, file_format: Optional[Literal["fasta", "genbank"]] = None
) -> SequenceRecord:
    """
    Parse a sequence file using BioPython.

    Args:
        content: Raw file content
        file_format: File format ('fasta' or 'genbank'). Auto-detected if None.

    Returns:
        Parsed sequence record

    Raises:
        ValueError: If format is invalid or parsing fails
    """
    # Auto-detect format if not specified
    if file_format is None:
        file_format = detect_format(content)
        if file_format == "unknown":
            raise ValueError("Cannot detect file format. Must be FASTA or GenBank.")

    # Parse using BioPython
    try:
        handle = StringIO(content)
        bio_record = SeqIO.read(handle, file_format)
        handle.close()
    except Exception as e:
        raise ValueError(f"Failed to parse {file_format.upper()} file: {str(e)}")

    # Convert BioPython SeqRecord to our schema
    return biopython_to_schema(bio_record)


def biopython_to_schema(bio_record: BioSeqRecord) -> SequenceRecord:
    """
    Convert BioPython SeqRecord to our Pydantic schema.

    Args:
        bio_record: BioPython SeqRecord object

    Returns:
        SequenceRecord Pydantic model
    """
    sequence_str = str(bio_record.seq).upper()

    # Determine topology from annotations
    topology: Literal["linear", "circular"] = "linear"
    if "topology" in bio_record.annotations:
        if bio_record.annotations["topology"].lower() == "circular":
            topology = "circular"

    # Convert features
    features = []
    for bio_feature in bio_record.features:
        try:
            # Extract location info
            start = int(bio_feature.location.start)
            end = int(bio_feature.location.end)
            strand = bio_feature.location.strand if bio_feature.location.strand else 1

            # Get feature name from qualifiers
            name = bio_feature.type
            if "gene" in bio_feature.qualifiers:
                name = bio_feature.qualifiers["gene"][0]
            elif "label" in bio_feature.qualifiers:
                name = bio_feature.qualifiers["label"][0]
            elif "locus_tag" in bio_feature.qualifiers:
                name = bio_feature.qualifiers["locus_tag"][0]

            # Get color (use default based on type)
            color = get_feature_color(bio_feature.type)

            # Convert qualifiers to dict
            qualifiers = {}
            for key, values in bio_feature.qualifiers.items():
                qualifiers[key] = values[0] if len(values) == 1 else ", ".join(values)

            feature = Feature(
                id=str(uuid.uuid4()),
                name=name,
                type=bio_feature.type,
                start=start,
                end=end,
                strand=strand,
                color=color,
                qualifiers=qualifiers,
            )
            features.append(feature)
        except Exception:
            # Skip malformed features
            continue

    # Calculate properties
    gc_content = GC(bio_record.seq)
    mol_weight = molecular_weight(bio_record.seq, seq_type="DNA", double_stranded=True)

    return SequenceRecord(
        id=bio_record.id or str(uuid.uuid4()),
        name=bio_record.name or "Untitled",
        sequence=sequence_str,
        length=len(sequence_str),
        topology=topology,
        features=features,
        gc_content=gc_content,
        molecular_weight=mol_weight,
        description=bio_record.description or None,
    )


def get_feature_color(feature_type: str) -> str:
    """
    Get default color for a feature type.

    Args:
        feature_type: Feature type (gene, CDS, promoter, etc.)

    Returns:
        Hex color code
    """
    color_map = {
        "gene": "#60A5FA",
        "CDS": "#60A5FA",
        "promoter": "#34D399",
        "terminator": "#F87171",
        "RBS": "#FBBF24",
        "tag": "#A78BFA",
        "rep_origin": "#FB923C",
        "origin": "#FB923C",
        "misc_feature": "#9CA3AF",
        "primer": "#EC4899",
        "primer_bind": "#EC4899",
        "protein_bind": "#8B5CF6",
        "misc_binding": "#6366F1",
        "misc_RNA": "#14B8A6",
    }
    return color_map.get(feature_type, "#9CA3AF")


def parse_multi_fasta(content: str) -> list[SequenceRecord]:
    """
    Parse a multi-FASTA file with multiple sequences.

    Args:
        content: Raw FASTA file content

    Returns:
        List of parsed sequence records
    """
    sequences = []
    handle = StringIO(content)

    try:
        for bio_record in SeqIO.parse(handle, "fasta"):
            try:
                seq_record = biopython_to_schema(bio_record)
                sequences.append(seq_record)
            except Exception:
                # Skip invalid sequences
                continue
    finally:
        handle.close()

    return sequences
