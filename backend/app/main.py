"""
CloneLab FastAPI Application

REST API for molecular cloning operations using BioPython.
"""

import Bio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app import __version__
from app.core.digest import simulate_digest, get_digest_stats
from app.core.enzymes import (
    count_enzyme_sites,
    find_restriction_sites,
    find_single_cutters,
    suggest_enzyme_pairs,
)
from app.core.ligation import simulate_ligation, check_compatibility
from app.core.parsers import detect_format, parse_multi_fasta, parse_sequence
from app.models.schemas import (
    DigestFragment,
    DigestRequest,
    DigestResponse,
    EnzymePairRequest,
    EnzymePairResponse,
    EnzymeSitesRequest,
    EnzymeSitesResponse,
    ErrorResponse,
    HealthResponse,
    LigationRequest,
    LigationResponse,
    SequenceUploadRequest,
)

# Initialize FastAPI app
app = FastAPI(
    title="CloneLab API",
    description="Molecular cloning toolkit powered by BioPython",
    version=__version__,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware - allow frontend to access API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# Health & Info Endpoints
# ============================================================================


@app.get("/", response_model=HealthResponse)
async def root() -> HealthResponse:
    """Root endpoint - returns API health status."""
    return HealthResponse(
        status="healthy",
        version=__version__,
        biopython_version=Bio.__version__,
    )


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        version=__version__,
        biopython_version=Bio.__version__,
    )


# ============================================================================
# Sequence Endpoints
# ============================================================================


@app.post("/api/sequences/parse", tags=["Sequences"])
async def parse_sequence_file(request: SequenceUploadRequest):
    """
    Parse a sequence file (FASTA or GenBank format).

    The format is auto-detected if not specified.
    Returns parsed sequence with features and metadata.
    """
    try:
        sequence_record = parse_sequence(request.content, request.format)
        return sequence_record
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parsing error: {str(e)}")


@app.post("/api/sequences/parse-multi", tags=["Sequences"])
async def parse_multi_fasta_file(request: SequenceUploadRequest):
    """
    Parse a multi-FASTA file with multiple sequences.

    Returns a list of parsed sequence records.
    """
    try:
        if request.format and request.format != "fasta":
            raise ValueError("Multi-sequence parsing only supports FASTA format")

        sequences = parse_multi_fasta(request.content)
        return {"sequences": sequences, "count": len(sequences)}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parsing error: {str(e)}")


@app.post("/api/sequences/detect-format", tags=["Sequences"])
async def detect_sequence_format(request: SequenceUploadRequest):
    """Detect the format of a sequence file."""
    try:
        file_format = detect_format(request.content)
        return {"format": file_format}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Enzyme Endpoints
# ============================================================================


@app.post(
    "/api/enzymes/find-sites",
    response_model=EnzymeSitesResponse,
    tags=["Enzymes"],
)
async def find_enzyme_sites(request: EnzymeSitesRequest) -> EnzymeSitesResponse:
    """
    Find restriction enzyme sites in a DNA sequence.

    Returns all cut sites for specified enzymes (or common enzymes if not specified).
    """
    try:
        sites = find_restriction_sites(
            sequence=request.sequence,
            topology=request.topology,
            enzyme_names=request.enzymes,
        )
        return EnzymeSitesResponse(sites=sites)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")


@app.post("/api/enzymes/count-sites", tags=["Enzymes"])
async def count_sites(request: EnzymeSitesRequest):
    """
    Count restriction enzyme cut sites in a sequence.

    Returns the number of cut sites for each enzyme.
    """
    try:
        counts = count_enzyme_sites(
            sequence=request.sequence,
            topology=request.topology,
            enzyme_names=request.enzymes,
        )
        return {"counts": counts}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")


@app.post("/api/enzymes/single-cutters", tags=["Enzymes"])
async def get_single_cutters(request: EnzymeSitesRequest):
    """
    Find enzymes that cut exactly once in a sequence.

    Useful for finding suitable enzymes for cloning applications.
    """
    try:
        single_cutters = find_single_cutters(
            sequence=request.sequence,
            topology=request.topology,
            enzyme_names=request.enzymes,
        )
        return {"enzymes": single_cutters, "count": len(single_cutters)}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")


@app.post(
    "/api/enzymes/suggest-pairs",
    response_model=EnzymePairResponse,
    tags=["Enzymes"],
)
async def suggest_pairs(request: EnzymePairRequest) -> EnzymePairResponse:
    """
    Suggest compatible enzyme pairs for directional cloning.

    Analyzes vector and insert sequences to recommend enzyme pairs
    that cut once in each and are compatible for ligation.
    """
    try:
        pairs = suggest_enzyme_pairs(
            vector_sequence=request.vector_sequence,
            insert_sequence=request.insert_sequence,
            vector_topology=request.vector_topology,
        )
        return EnzymePairResponse(pairs=pairs)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")


# ============================================================================
# Digest Endpoints
# ============================================================================


@app.post(
    "/api/digest/simulate",
    response_model=DigestResponse,
    tags=["Digest"],
)
async def simulate_restriction_digest(request: DigestRequest) -> DigestResponse:
    """
    Simulate a restriction digest.

    Returns predicted DNA fragments resulting from cutting with specified enzymes.
    """
    try:
        fragments = simulate_digest(
            sequence=request.sequence_id,  # For now, treat as sequence string
            enzyme_names=request.enzymes,
            topology=request.topology,
        )

        stats = get_digest_stats(fragments)

        return DigestResponse(
            fragments=fragments,
            total_fragments=stats["total_fragments"],
            largest_fragment=stats["largest_fragment"],
            smallest_fragment=stats["smallest_fragment"],
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Digest simulation error: {str(e)}")


# ============================================================================
# Ligation Endpoints
# ============================================================================


# Store fragments temporarily in memory (in production, use a database)
_fragment_cache: dict[str, DigestFragment] = {}


@app.post("/api/ligation/store-fragments", tags=["Ligation"])
async def store_fragments(fragments: list[DigestFragment]):
    """
    Store digest fragments for later ligation.

    This is a helper endpoint to store fragments in memory so they can be
    referenced by ID in ligation requests.
    """
    for fragment in fragments:
        _fragment_cache[fragment.id] = fragment

    return {"stored": len(fragments), "fragment_ids": [f.id for f in fragments]}


@app.post(
    "/api/ligation/simulate",
    response_model=LigationResponse,
    tags=["Ligation"],
)
async def simulate_ligation_endpoint(request: LigationRequest) -> LigationResponse:
    """
    Simulate ligation of vector and insert fragments.

    Predicts potential ligation products including correct, reverse,
    self-ligation, and concatemer products.
    """
    try:
        # Get fragments from cache
        vector_fragment = _fragment_cache.get(request.vector_fragment_id)
        insert_fragment = _fragment_cache.get(request.insert_fragment_id)

        if not vector_fragment:
            raise HTTPException(
                status_code=404,
                detail=f"Vector fragment {request.vector_fragment_id} not found. Store fragments first.",
            )

        if not insert_fragment:
            raise HTTPException(
                status_code=404,
                detail=f"Insert fragment {request.insert_fragment_id} not found. Store fragments first.",
            )

        # Check compatibility
        compatibility = check_compatibility(vector_fragment, insert_fragment)
        if not compatibility["compatible"]:
            raise HTTPException(
                status_code=400,
                detail=f"Fragments not compatible: {', '.join(compatibility['warnings'])}",
            )

        # Simulate ligation
        products = simulate_ligation(
            vector_fragment=vector_fragment,
            insert_fragment=insert_fragment,
            molar_ratio=request.molar_ratio,
        )

        # Find desired product
        desired = next((p for p in products if p.is_desired), None)

        return LigationResponse(products=products, desired_product=desired)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ligation simulation error: {str(e)}")


# ============================================================================
# Error Handlers
# ============================================================================


@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Handle 404 errors."""
    return ErrorResponse(detail="Endpoint not found")


@app.exception_handler(500)
async def internal_error_handler(request, exc):
    """Handle 500 errors."""
    return ErrorResponse(detail="Internal server error")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
