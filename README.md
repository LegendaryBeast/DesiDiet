# Khadok-Bangla AI

Personalized AI Nutrition Companion for Bangladeshi People. This system uses a GraphRAG architecture based on the National Dietary Guidelines for Bangladesh 2025.

## Installation & Setup

### Prerequisites
* Python 3.9+
* Docker (for running the Neo4j Graph Database)

### 1. Start Neo4j Database
Run the Neo4j graph database locally using Docker:
```bash
docker run -d --name neo4j-khadok \
    -p 7474:7474 -p 7687:7687 \
    -e NEO4J_AUTH=neo4j/khadok2025 \
    neo4j:5.12
```

### 2. Environment Setup
Create a virtual environment and install the required Python packages:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r graphRAG/requirements.txt
```

Ensure your `.env` file (now located inside the `graphRAG/` folder) matches your Neo4j setup:
```env
NEO4J_MODE=docker
NEO4J_DOCKER_URI=bolt://localhost:7687
NEO4J_DOCKER_USER=neo4j
NEO4J_DOCKER_PASSWORD=khadok2025
```

### 3. Data Processing & Knowledge Graph Ingestion
First, clean and normalize the raw Bangladeshi food CSV datasets, then ingest them into the Neo4j knowledge graph along with the NDG 2025 dietary rules:
```bash
# Navigate to the graphRAG engine directory
cd graphRAG

# Clean the raw dataset
python3 preprocessing/clean_csv.py

# Build the Neo4j knowledge graph
python3 build_graph.py
```

### 4. Running the Engine
You can test the GraphRAG reasoning engine directly to see the personalized safe foods and macro calculations in action:
```bash
cd graphRAG
python3 graph_rag/engine.py
```

---

## Database Schema Architecture

The system utilizes a hybrid database model to link static nutritional knowledge with dynamic user profiles. Below is the Entity-Relationship (ER) diagram detailing the data structure.

![Database Schema](graphRAG/schema.png)

### Core Components

1. Static Knowledge Base
   * Food & FoodGroup: Stores Bangladeshi food items with macronutrient data (calories, protein, carbs, fat, fiber) and their classifications.
   * MedicalCondition: Represents physiological states and diseases (e.g., Diabetes, Hypertension).
   * DietaryRule: Connects Medical Conditions to Food Groups, defining what to prefer, limit, or avoid based on NDG 2025 medical rationale.

2. Dynamic User Data
   * UserProfile: Stores physical metrics (age, weight, height, activity level) required for caloric calculation.
   * HealthLog: Tracks daily health metrics like weight fluctuations, blood sugar, and blood pressure.
   * MealPlan & MealPlanFood: Records the AI-generated diet plans assigned to the user.
   * UserCondition & UserFoodPreference: Mapping tables linking the user to their specific medical conditions and food likes/dislikes.

## How the Personalization Works

1. Calorie Calculation: The system calculates the Ideal Body Weight (IBW) and daily caloric targets based on the UserProfile and the latest HealthLog.
2. Graph Retrieval: The GraphRAG engine traverses from the UserProfile to MedicalCondition to DietaryRule to filter out unsafe foods and boost preferred foods.
3. LLM Generation: The retrieved safe foods and macro targets are passed to the Large Language Model to generate a personalized, culturally accurate meal plan.
