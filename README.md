# DesiDiet AI: Personalized Nutrition at Scale 

DesiDiet AI is an enterprise-grade nutritional ecosystem designed specifically for the Bangladeshi population. It leverages a modern **GraphRAG (Graph-based Retrieval-Augmented Generation)** architecture to deliver highly personalized dietary advice grounded in the **National Dietary Guidelines (NDG) Bangladesh 2025**.

---

## 🛠️ System Overview

DesiDiet AI follows the **Infinity AI Buildfest 2026 AI-Native Application Blueprint**. It consists of three primary layers:

1.  **Data Layer:** Neo4j Knowledge Graph (370+ local foods & NDG rules) + Prisma SQL (User profiles & logs).
2.  **Reasoning Layer (FastAPI):** Python-based GraphRAG engine that performs semantic retrieval and dietary constraint checking.
3.  **Presentation Layer (React):** A premium, bilingual dashboard for real-time AI assistance and health tracking.

For a comprehensive breakdown of our 8-layer enterprise architecture, please see the [System Architecture Documentation](./docs/architecture.md).

---

##  Quick Start

### 1. Database (Neo4j)
Run the Neo4j graph database locally using Docker:
```bash
docker run -d --name neo4j-khadok \
    -p 7474:7474 -p 7687:7687 \
    -e NEO4J_AUTH=neo4j/khadok2025 \
    neo4j:5.12
```

### 2. Backend & GraphRAG Engine
```bash
cd graphRAG
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Ingest data into Neo4j
python3 preprocessing/clean_csv.py
python3 build_graph.py

# Start the API server
uvicorn app.main:app --reload
```

### 3. Frontend Dashboard
The frontend is a modern React application.
```bash
cd frontend
npm install
npm run dev
```
Detailed instructions are in the [Frontend README](frontend/README.md).

---

##  Knowledge Graph & Schema

The system utilizes a hybrid model to link nutritional science with user data. 

![Database Schema](graphRAG/schema.png)

### Core Logic:
1.  **IBW & Macro Targeting:** Automatic calculation of Ideal Body Weight and caloric goals.
2.  **Constraint Propagation:** The Graph engine traverses from `MedicalCondition` → `DietaryRule` → `FoodGroup` to filter unsafe items.
3.  **LLM Reasoning:** Integrates with local/remote LLMs to synthesize culturally accurate meal suggestions.

---

##  Legal Notice
DesiDiet AI is an AI-powered assistant and **not a medical device**. Full details are available in our [Conditions Page](https://desidiet.ai/conditions).

Developed with  for the people of Bangladesh. 
