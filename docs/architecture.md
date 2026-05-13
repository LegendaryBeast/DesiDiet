# DesiDiet AI – System Architecture

This document maps the **DesiDiet AI** platform architecture to the recommended **Infinity AI Buildfest 2026 AI-Native Application Blueprint**. This demonstrates our commitment to building an enterprise-scale, production-ready intelligent system that adheres to modern global standards.

Our architecture strictly separates intelligence from the interface, uses highly structured knowledge retrieval over static prompting, and ensures modularity across the stack.

---

## 🏗️ AI-Native Reference Architecture Mapping

### 1. User Interaction Layer
* **Purpose:** Provide the interface through which users interact with the system.
* **DesiDiet Implementation:** A premium, "magazine-style" React web application featuring a Lovable UI.
* **Technologies:** React 18, Vite, Tailwind CSS v3, Framer Motion (for fluid micro-interactions), Recharts (for health trend dashboards).
* **Why It Matters:** Ensures accessibility and a premium, responsive experience for Bangladeshi users across all devices.

### 2. Application Logic Layer
* **Purpose:** Manage workflows, business logic, and system coordination.
* **DesiDiet Implementation:** A highly modular RESTful backend that handles authentication, user profile management, health log processing, and acts as the orchestrator between the frontend and the AI engines.
* **Technologies:** Python, FastAPI, Pydantic (data validation).
* **Why It Matters:** Enables scalable application logic, strict type-checking, and rapid concurrent request handling capable of enterprise-level workloads.

### 3. AI Intelligence Layer
* **Purpose:** Power reasoning, generation, prediction, and automation.
* **DesiDiet Implementation:** Real-time conversational intelligence and personalized AI-driven meal plan generation with SSE (Server-Sent Events) streaming.
* **Technologies:** Llama 3.3 70B (Via Groq API for ultra-low latency inference).
* **Why It Matters:** Forms the core intelligence, allowing the system to understand natural Bengali/English inputs and synthesize complex nutritional logic.

### 4. Knowledge Retrieval Layer
* **Purpose:** Provide contextual intelligence using structured data and documents.
* **DesiDiet Implementation:** **GraphRAG Engine** indexing the National Dietary Guidelines (NDG) Bangladesh 2025. Over 370+ local foods are mapped alongside specific medical dietary rules (e.g., Diabetes, Hypertension).
* **Technologies:** Neo4j (Graph Database), Cypher Query Language, Python GraphRAG Bridge.
* **Why It Matters:** Prevents AI hallucinations. The LLM does not guess nutrition; it only reasons upon the strict, scientifically validated graph data retrieved by our algorithms.

### 5. Agent Orchestration Layer
* **Purpose:** Coordinate multiple specialized AI agents to perform complex workflows.
* **DesiDiet Implementation:** Autonomous reasoning pipelines within the FastAPI backend that intercept user profiles, query Neo4j for safe foods, dynamically construct highly-contextualized prompts, and orchestrate the final output to the user.
* **Technologies:** Custom Python Orchestration Pipelines, `meal_plan_service.py` rules engine.
* **Why It Matters:** Ensures complex multi-step tasks (like validating a food choice against 5 different medical conditions simultaneously) are automated flawlessly.

### 6. Data Infrastructure Layer
* **Purpose:** Store, manage, and secure application data and embeddings.
* **DesiDiet Implementation:** A dual-database strategy. Relational data (users, meal plans, health logs) is separated from complex knowledge relationships (foods, dietary rules).
* **Technologies:** Prisma ORM, SQLite/PostgreSQL (Relational), Neo4j (Graph storage).
* **Why It Matters:** Provides a reliable, scalable foundation where user PII is secure, while knowledge data is optimized for rapid graph traversal.

### 7. Automation & Integration Layer
* **Purpose:** Connect the AI system with external services and data sources.
* **DesiDiet Implementation:** Automated parsing of unstructured medicine reminders into strict chron jobs, API gateways, and Vite local proxy integrations for seamless full-stack communication.
* **Technologies:** Vite Proxy, FastAPI Middleware.
* **Why It Matters:** Allows the AI to interact with real-world triggers and ensures secure cross-origin communication.

### 8. Deployment & Infrastructure Layer
* **Purpose:** Ensure systems run reliably at global scale.
* **DesiDiet Implementation:** Fully containerized setup for the knowledge graph and environment-agnostic backend configurations.
* **Technologies:** Docker (Neo4j), Node.js, Uvicorn ASGI Server.
* **Why It Matters:** Ensures DesiDiet is not just an isolated local demo, but an easily deployable, production-ready system capable of scaling to thousands of users.

---

## 🎯 Expected Outcome Achieved
By adhering to this architectural blueprint, DesiDiet AI transcends a simple hackathon prototype. We have successfully developed a modular system that combines **modern LLM capabilities, strict Graph-based knowledge retrieval, scalable FastAPI orchestration, and a robust data infrastructure**—matching the architectural maturity expected in leading global AI startups.
