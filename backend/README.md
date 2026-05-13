# DesiDiet AI Backend

FastAPI backend for the Khadok-Bangla AI nutrition companion. Uses Prisma ORM, JWT auth, and integrates with the existing GraphRAG Neo4j knowledge graph.

## Prerequisites

- Python 3.9+
- Node.js 18+ (required for Prisma CLI)

## Quick Start

### 1. Create virtual environment & install dependencies

```bash
cd DesiDiet/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and add your LLM API key:

```env
# Required — add your API key
XAI_API_KEY=xai-your-key-here

# Or use OpenAI instead (recommended if xAI has no credits)
# XAI_API_KEY=sk-your-openai-key
# XAI_BASE_URL=https://api.openai.com/v1
# XAI_MODEL=gpt-4o-mini
```

> **Note:** The included `.env` already has a dev database and auth secrets configured. Only the `XAI_API_KEY` needs to be set.

### 3. Generate Prisma client & run migrations

```bash
prisma generate
prisma migrate dev
```

This creates the SQLite database (`dev.db`) with all tables.

### 4. Start the server

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The API is now running at:
- **API:** http://localhost:8000
- **Interactive docs:** http://localhost:8000/docs
- **Health check:** http://localhost:8000/health

### 5. Verify it's working

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status":"ok","app":"Khadok-Bangla AI"}
```

---

## Running with Neo4j (Optional)

The backend works without Neo4j using mock food data. To use your real GraphRAG knowledge graph:

```bash
# Start Neo4j via Docker
docker run -d --name khadok-neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/khadok2025 \
  neo4j:5.15-community

# Load your data (from the graphRAG/ folder)
cd ../graphRAG
python build_graph.py
```

Then update `.env`:
```env
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=khadok2025
```

---

## API Testing Examples

### Register a user
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone": "01712345678", "password": "testpass", "language": "bn"}'
```

### Login
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "01712345678", "password": "testpass"}'
```

### Create profile (use token from login)
```bash
curl -X POST http://localhost:8000/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name_bn": "রহিম", "age": 35, "gender": "male", "weight_kg": 75, "height_cm": 170, "activity_level": "moderate", "goal": "maintain", "medical_conditions": ["Diabetes"]}'
```

### Generate daily meal plan
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/meal-plans/daily?language=bn"
```

---

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI entry point
│   ├── config.py            # Environment settings
│   ├── db.py                # Prisma client
│   ├── schemas.py           # Pydantic DTOs
│   ├── dependencies.py      # Auth dependencies
│   ├── utils.py             # JSON helpers
│   ├── core/
│   │   ├── security.py      # JWT + bcrypt
│   │   └── llm_client.py    # xAI/OpenAI client
│   ├── services/
│   │   └── meal_plan_service.py
│   └── routers/
│       ├── auth.py
│       ├── profile.py
│       ├── health_log.py
│       ├── meal_plan.py
│       ├── chat.py
│       ├── foods.py
│       └── report.py
├── graph_rag_bridge/        # Connects to ../graphRAG
├── prisma/
│   └── schema.prisma        # Database schema
├── requirements.txt
├── docker-compose.yml
└── .env
```

---

## Troubleshooting

### `prisma: command not found`
Make sure you're inside the virtual environment:
```bash
source venv/bin/activate
```

### `ClientNotConnectedError`
The Prisma client connects automatically on server startup. If running scripts outside FastAPI, manually connect:
```python
from app.db import prisma
await prisma.connect()
# ... your code ...
await prisma.disconnect()
```

### `bcrypt version error`
Already pinned in `requirements.txt`. If you see errors:
```bash
pip install 'bcrypt<4.1'
```

### xAI returns "no credits"
The backend automatically falls back to template-based meal plans and chat responses. To enable AI generation, either add xAI credits or switch to OpenAI by changing `XAI_API_KEY` and `XAI_BASE_URL` in `.env`.
