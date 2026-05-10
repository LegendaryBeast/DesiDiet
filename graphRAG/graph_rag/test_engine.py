from .calorie_engine import calculate_targets

def run_tests():
    print("--- Khadok-Bangla GraphRAG Test Suite ---\n")
    
    # 1. Test Calorie Engine
    print("1. Testing User Setup (Calorie Engine)")
    profile = {
        'gender': 'male',
        'height_cm': 170,
        'weight_kg': 85,
        'activity_level': 'sedentary'
    }
    targets = calculate_targets(profile)
    print(f"Profile: 170cm, 85kg, Sedentary Male")
    print(f"BMI: {targets['bmi']} ({targets['body_type']})")
    print(f"Daily Target: {targets['target_calories']} kcal")
    print(f"Macros: Protein {targets['protein_g']}g, Carbs {targets['carbs_g']}g, Fat {targets['fat_g']}g\n")
    
    # 2. Test GraphRAG Engine
    print("2. Testing GraphRAG Queries")
    try:
        from .engine import KhadokGraphRAG
        rag = KhadokGraphRAG()
        
        conditions = ["Diabetes", "Hypertension"]
        print(f"A. Fetching Safe Foods for: {conditions}")
        safe_foods = rag.get_safe_foods(conditions=conditions, goal="Weight_Loss", limit=5)
        for f in safe_foods:
            print(f"   [+{f['preference_score']}] {f['name_bn']} ({f['name_en']}) - {f['calories']} kcal, {f['protein']}g protein")
            
        print("\nB. Searching Food: 'rice'")
        search_res = rag.search_food("rice")
        for f in search_res[:3]:
            print(f"   {f['code']}: {f['name_en']} -> {f['calories']} kcal")
            
        print("\nC. Chatbot Context Generation")
        # Let's assume 01_0012 is some Rice, 13_0001 is Butter
        ctx1 = rag.get_chatbot_context("01_0012", conditions)
        print(f"   Context for 01_0012 (Rice):\n   {ctx1.strip()}")
        
        ctx2 = rag.get_chatbot_context("13_0001", conditions)
        print(f"\n   Context for 13_0001 (Butter/Fats):\n   {ctx2.strip()}")
        
        rag.close()
    except Exception as e:
        print(f"Graph query skipped or failed: {e}")
        print("Make sure Neo4j is running and you have ingested the data (python -m graph_rag.ingestion)")

if __name__ == "__main__":
    run_tests()
