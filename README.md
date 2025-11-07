# CloneLab

A modern molecular cloning toolkit powered by **BioPython** for planning and visualizing restriction digests and ligations.

## Architecture

**Full-Stack Application:**
- **Backend:** Python FastAPI + BioPython (REST API)
- **Frontend:** React + TypeScript (Web UI)

```
┌────────────────────────────────────────────┐
│     React Frontend (packages/web)          │
│  ┌──────────────────────────────────────┐ │
│  │   • Upload sequences (FASTA/GenBank) │ │
│  │   • Visualize enzyme sites           │ │
│  │   • Simulate digests                 │ │
│  │   • Plan ligations                   │ │
│  └──────────────────────────────────────┘ │
└────────────────────────────────────────────┘
                    │ HTTP/REST
                    ▼
┌────────────────────────────────────────────┐
│     Python Backend (backend/)              │
│  ┌──────────────────────────────────────┐ │
│  │   FastAPI + BioPython                │ │
│  │   • Bio.SeqIO (parsers)              │ │
│  │   • Bio.Restriction (enzyme DB)      │ │
│  │   • Digest simulation                │ │
│  │   • 600+ restriction enzymes         │ │
│  └──────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

## Quick Start

### Backend (Python)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run API server
uvicorn app.main:app --reload --port 8000

# Or use Docker
docker-compose up
```

**API Documentation:** http://localhost:8000/docs

### Frontend (React)

```bash
# Install dependencies
pnpm install

# Run development server
pnpm --filter @clonelab/web dev
```

**Frontend:** http://localhost:3000

## Features

- ✅ **BioPython Integration** - Leverage mature bioinformatics libraries
- ✅ **FASTA & GenBank Parsing** - Full support for sequence file formats
- ✅ **600+ Restriction Enzymes** - Complete REBASE database via Bio.Restriction
- ✅ **Digest Simulation** - Predict fragments from enzyme digests
- ✅ **Smart Enzyme Pairing** - AI-powered suggestions for cloning strategies
- ✅ **REST API** - Clean API for frontend or programmatic access
- ✅ **Type Safety** - Full type hints (Python) and TypeScript (frontend)
- ✅ **Docker Ready** - Easy deployment with Docker Compose

## Project Structure

```
clonelab/
├── backend/                  # Python FastAPI backend
│   ├── app/
│   │   ├── main.py          # FastAPI app
│   │   ├── core/            # BioPython business logic
│   │   │   ├── parsers.py   # Sequence parsing
│   │   │   ├── enzymes.py   # Enzyme analysis
│   │   │   └── digest.py    # Digest simulation
│   │   └── models/
│   │       └── schemas.py   # Pydantic models
│   ├── tests/               # Pytest test suite
│   ├── requirements.txt
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── packages/
│   ├── core/                # TypeScript library (archived)
│   └── web/                 # React frontend
│       ├── src/
│       │   ├── components/  # React components
│       │   └── services/    # API client
│       └── package.json
│
└── README.md
```

## Development

### Backend Tests
```bash
cd backend
pytest                    # Run tests
pytest --cov=app         # With coverage
black .                  # Format code
ruff check .             # Lint
mypy app                 # Type check
```

### Frontend Tests
```bash
pnpm test                # Run tests
pnpm build               # Build for production
```

## API Endpoints

See full API documentation at http://localhost:8000/docs

**Key Endpoints:**
- `POST /api/sequences/parse` - Parse FASTA/GenBank files
- `POST /api/enzymes/find-sites` - Find restriction sites
- `POST /api/enzymes/suggest-pairs` - Get enzyme pair recommendations
- `POST /api/digest/simulate` - Simulate restriction digest
- `GET /health` - Health check

## Why BioPython?

BioPython provides:
- **Mature, tested algorithms** for bioinformatics
- **REBASE database** with 600+ restriction enzymes
- **Sequence parsing** for multiple formats
- **Easy extensibility** for future features (alignments, NCBI integration, etc.)
- **Active community** and comprehensive documentation

## License

MIT
