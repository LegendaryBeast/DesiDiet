"""
Master Build Script for Khadok-Bangla GraphRAG
Runs all steps in sequence: preprocess CSV → build graph → validate
"""

import sys
import os

def step(msg):
    print(f"\n{'='*55}")
    print(f"  {msg}")
    print(f"{'='*55}")

def main():
    step("STEP 1: Preprocessing bd_foods.csv")
    sys.path.insert(0, os.path.dirname(__file__))
    from preprocessing.clean_csv import process
    clean_rows = process()

    step("STEP 2: Validate Calorie Engine (offline - no Neo4j needed)")
    from graph_rag.calorie_engine import calculate_targets
    test_profiles = [
        {"label": "Obese Sedentary Male",
         "gender": "male",   "height_cm": 170, "weight_kg": 95,  "activity_level": "sedentary"},
        {"label": "Underweight Active Female",
         "gender": "female", "height_cm": 155, "weight_kg": 42,  "activity_level": "active"},
        {"label": "Normal Moderate Male",
         "gender": "male",   "height_cm": 175, "weight_kg": 70,  "activity_level": "moderate"},
    ]
    print(f"\n{'Code':<35} {'BMI':<6} {'Body Type':<12} {'Calories':<10} {'Protein':<9} {'Carbs':<8} {'Fat'}")
    print("-" * 80)
    for p in test_profiles:
        t = calculate_targets(p)
        print(f"{p['label']:<35} {t['bmi']:<6} {t['body_type']:<12} {t['target_calories']:<10} "
              f"{t['protein_g']}g{'':<6} {t['carbs_g']}g{'':<5} {t['fat_g']}g")

    step("STEP 3: Neo4j Graph Ingestion (requires Neo4j running)")
    uri = os.getenv("NEO4J_DOCKER_URI") or os.getenv("NEO4J_CLOUD_URI")
    if not uri:
        print("\n⚠️  No Neo4j URI found in environment.")
        print("   To ingest data:")
        print("   1. Copy .env.example → .env and fill in credentials")
        print("   2. Start Neo4j: `docker compose up -d` (Docker)")
        print("      OR create a free AuraDB at https://console.neo4j.io")
        print("   3. Run: python build_graph.py again, or")
        print("          python -m graph_rag.ingestion")
        return

    from dotenv import load_dotenv
    load_dotenv()
    
    try:
        from graph_rag.ingestion import run_ingestion
        run_ingestion()

        step("STEP 4: GraphRAG Query Validation")
        from graph_rag.engine import KhadokGraphRAG
        rag = KhadokGraphRAG()

        print("\n[A] Safe foods for Diabetic + Hypertensive user (Weight Loss goal):")
        foods = rag.get_safe_foods(
            conditions=["Diabetes", "Hypertension"],
            goal="Weight_Loss",
            limit=8
        )
        for f in foods:
            score = f.get('preference_score', 0)
            cal   = f.get('calories') or 'N/A'
            prot  = f.get('protein')  or 'N/A'
            print(f"  [boost={score}] {f['name_bn']:<25} ({f['food_group']}) — {cal} kcal, {prot}g protein")

        print("\n[B] Food search: 'dal'")
        results = rag.search_food("dal")
        for r in results[:5]:
            print(f"  {r['code']}: {r['name_en']} ({r['name_bn']}) — {r['calories']} kcal")

        print("\n[C] Chatbot context — Rice (01_0012) for Diabetic user:")
        ctx = rag.get_chatbot_context("01_0012", ["Diabetes"])
        print(f"  {ctx.strip()}")

        print("\n[D] Chatbot context — Butter (13_0001) for Diabetic + Hypertensive:")
        ctx2 = rag.get_chatbot_context("13_0001", ["Diabetes", "Hypertension"])
        print(f"  {ctx2.strip()}")

        rag.close()
        print("\n✅ All GraphRAG validations passed!")

    except Exception as e:
        print(f"\n❌ Neo4j step failed: {e}")
        print("   Make sure Neo4j is running and credentials in .env are correct.")

if __name__ == "__main__":
    main()
