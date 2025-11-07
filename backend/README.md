# CloneLab Backend

Python backend for CloneLab molecular cloning toolkit, powered by BioPython.

## Features

- **FastAPI** - Modern, fast (high-performance) web framework
- **BioPython** - Comprehensive bioinformatics library
- **REST API** - Clean API for frontend integration
- **OpenAPI** - Auto-generated API documentation
- **Type Safety** - Full type hints with Pydantic

## Quick Start

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --port 8000
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Development

```bash
# Run tests
pytest

# Format code
black .

# Lint
ruff check .

# Type check
mypy app
```

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI application
│   ├── api/                 # API routes
│   │   ├── sequences.py     # Sequence endpoints
│   │   ├── enzymes.py       # Enzyme endpoints
│   │   └── digest.py        # Digest simulation endpoints
│   ├── core/                # Business logic
│   │   ├── parsers.py       # BioPython parsers
│   │   ├── enzymes.py       # Enzyme analysis
│   │   └── digest.py        # Digest algorithms
│   ├── models/              # Pydantic models
│   │   └── schemas.py       # API schemas
│   └── services/            # External services
└── tests/                   # Test suite
```

## License

MIT
