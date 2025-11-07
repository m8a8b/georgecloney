"""
Pydantic models for CloneLab API schemas.

These models define the structure of API requests and responses,
with automatic validation and serialization.
"""

from typing import Literal, Optional
from pydantic import BaseModel, Field


# ============================================================================
# Sequence Models
# ============================================================================


class Feature(BaseModel):
    """Sequence feature/annotation (gene, promoter, etc.)."""

    id: str
    name: str
    type: str
    start: int = Field(description="Start position (0-indexed, inclusive)")
    end: int = Field(description="End position (0-indexed, exclusive)")
    strand: Literal[1, -1] = Field(description="1 = forward, -1 = reverse")
    color: str = Field(default="#9CA3AF", description="Display color (hex format)")
    notes: Optional[str] = None
    qualifiers: Optional[dict[str, str]] = None


class SequenceRecord(BaseModel):
    """DNA sequence record with annotations and metadata."""

    id: str
    name: str
    sequence: str = Field(description="DNA sequence (uppercase ATGCN)")
    length: int = Field(description="Sequence length in base pairs")
    topology: Literal["linear", "circular"]
    features: list[Feature] = Field(default_factory=list)
    gc_content: float = Field(description="GC content percentage (0-100)")
    molecular_weight: float = Field(description="Molecular weight in Daltons")
    description: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "id": "seq_001",
                "name": "pUC19",
                "sequence": "ATGCATGCATGC",
                "length": 12,
                "topology": "circular",
                "features": [],
                "gc_content": 50.0,
                "molecular_weight": 3708.4,
                "description": "pUC19 cloning vector",
            }
        }


class SequenceUploadRequest(BaseModel):
    """Request to parse a sequence file."""

    content: str = Field(description="Raw file content (FASTA or GenBank)")
    format: Optional[Literal["fasta", "genbank"]] = Field(
        None, description="File format (auto-detected if not specified)"
    )


# ============================================================================
# Enzyme Models
# ============================================================================


class RestrictionSite(BaseModel):
    """Restriction site found in a sequence."""

    enzyme: str
    position: int = Field(description="Cut position in sequence (0-indexed)")
    strand: Literal[1, -1]
    recognition_start: int
    recognition_end: int
    overhang_seq: str


class EnzymeSitesRequest(BaseModel):
    """Request to find restriction sites in a sequence."""

    sequence: str = Field(description="DNA sequence to analyze")
    topology: Literal["linear", "circular"] = Field(default="linear")
    enzymes: Optional[list[str]] = Field(
        None, description="Specific enzymes to search for (all if not specified)"
    )


class EnzymeSitesResponse(BaseModel):
    """Response with found restriction sites."""

    sites: dict[str, list[RestrictionSite]] = Field(
        description="Map of enzyme name to list of sites"
    )


class EnzymePair(BaseModel):
    """Suggested enzyme pair for cloning."""

    enzyme1: str
    enzyme2: str
    score: float = Field(description="Compatibility score (0-1, higher is better)")
    reasons: list[str] = Field(description="Why this pair is good")
    warnings: list[str] = Field(default_factory=list, description="Potential issues")
    buffer_compatible: bool


class EnzymePairRequest(BaseModel):
    """Request to suggest enzyme pairs for cloning."""

    vector_sequence: str
    insert_sequence: str
    vector_topology: Literal["linear", "circular"] = Field(default="circular")


class EnzymePairResponse(BaseModel):
    """Response with suggested enzyme pairs."""

    pairs: list[EnzymePair] = Field(description="Suggested enzyme pairs, sorted by score")


# ============================================================================
# Digest Models
# ============================================================================


class DigestFragment(BaseModel):
    """DNA fragment resulting from restriction digest."""

    id: str
    sequence: str
    length: int = Field(description="Fragment length in bp")
    start: int = Field(description="Start position in original sequence")
    end: int = Field(description="End position in original sequence")
    five_prime_end: str = Field(description="5' end type: blunt, 5'-overhang, or 3'-overhang")
    three_prime_end: str = Field(description="3' end type: blunt, 5'-overhang, or 3'-overhang")
    features: list[Feature] = Field(default_factory=list)


class DigestRequest(BaseModel):
    """Request to simulate a restriction digest."""

    sequence_id: str = Field(description="Sequence ID or sequence string")
    enzymes: list[str] = Field(description="Enzymes to use for digest", min_length=1)
    topology: Literal["linear", "circular"] = Field(default="linear")


class DigestResponse(BaseModel):
    """Response with digest fragments."""

    fragments: list[DigestFragment]
    total_fragments: int
    largest_fragment: int
    smallest_fragment: int


# ============================================================================
# Ligation Models
# ============================================================================


class LigationProduct(BaseModel):
    """Predicted ligation product."""

    id: str
    type: Literal["correct", "reverse", "self-ligation", "concatemer", "other"]
    sequence: str
    length: int
    probability: float = Field(description="Estimated relative probability (0-1)")
    fragment_ids: list[str]
    description: str
    is_desired: bool


class LigationRequest(BaseModel):
    """Request to predict ligation products."""

    vector_fragment_id: str
    insert_fragment_id: str
    molar_ratio: float = Field(default=3.0, description="Insert:vector molar ratio")


class LigationResponse(BaseModel):
    """Response with predicted ligation products."""

    products: list[LigationProduct] = Field(description="Predicted products, sorted by probability")
    desired_product: Optional[LigationProduct] = None


# ============================================================================
# Health & Info Models
# ============================================================================


class HealthResponse(BaseModel):
    """Health check response."""

    status: str
    version: str
    biopython_version: str


class ErrorResponse(BaseModel):
    """Error response."""

    detail: str
