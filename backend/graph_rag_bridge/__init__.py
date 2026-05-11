"""
Bridge module to import existing graphRAG components from the sibling graphRAG directory.
Provides a fallback mock engine when Neo4j is not available.
"""

import sys
import os

# Add the graphRAG directory to Python path
GRAPH_RAG_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "graphRAG")
if GRAPH_RAG_PATH not in sys.path:
    sys.path.insert(0, GRAPH_RAG_PATH)

# Re-export key modules
from graph_rag.calorie_engine import calculate_targets
from graph_rag.dietary_rules_data import NDG_DIETARY_RULES
from graph_rag.config import get_neo4j_config

# Import the real engine class
from graph_rag.engine import KhadokGraphRAG as _RealKhadokGraphRAG


class MockKhadokGraphRAG:
    """Mock GraphRAG engine for development when Neo4j is not running."""

    _sample_foods = [
        {"code": "01_0012", "name_en": "Parboiled Rice", "name_bn": "ভাত (পার্বয়েলড)", "calories": 130, "protein": 2.7, "fat": 0.3, "carbs": 28, "fiber": 0.4, "food_group": "Cereals & Grains"},
        {"code": "02_0001", "name_en": "Masur Dal", "name_bn": "মসুর ডাল", "calories": 116, "protein": 9.0, "fat": 0.4, "carbs": 20, "fiber": 7.9, "food_group": "Pulses & Legumes"},
        {"code": "03_0001", "name_en": "Rohu Fish", "name_bn": "রুই মাছ", "calories": 97, "protein": 16.7, "fat": 2.8, "carbs": 0, "fiber": 0, "food_group": "Fish & Seafood"},
        {"code": "03_0002", "name_en": "Ilish Fish", "name_bn": "ইলিশ মাছ", "calories": 204, "protein": 17.5, "fat": 14.5, "carbs": 0, "fiber": 0, "food_group": "Fish & Seafood"},
        {"code": "04_0001", "name_en": "Spinach", "name_bn": "পালং শাক", "calories": 23, "protein": 2.9, "fat": 0.4, "carbs": 3.6, "fiber": 2.2, "food_group": "Leafy Vegetables"},
        {"code": "04_0002", "name_en": "Bitter Gourd", "name_bn": "করলা", "calories": 19, "protein": 0.8, "fat": 0.1, "carbs": 4.3, "fiber": 2.0, "food_group": "Vegetables"},
        {"code": "05_0001", "name_en": "Egg", "name_bn": "ডিম", "calories": 155, "protein": 13.0, "fat": 11.0, "carbs": 1.1, "fiber": 0, "food_group": "Eggs"},
        {"code": "06_0001", "name_en": "Milk", "name_bn": "দুধ", "calories": 61, "protein": 3.2, "fat": 3.3, "carbs": 4.8, "fiber": 0, "food_group": "Milk & Dairy"},
        {"code": "07_0001", "name_en": "Chicken Breast", "name_bn": "মুরগির বুক", "calories": 165, "protein": 31.0, "fat": 3.6, "carbs": 0, "fiber": 0, "food_group": "Meat & Poultry"},
        {"code": "08_0001", "name_en": "Banana", "name_bn": "কলা", "calories": 89, "protein": 1.1, "fat": 0.3, "carbs": 23, "fiber": 2.6, "food_group": "Fruits"},
        {"code": "09_0001", "name_en": "Yogurt", "name_bn": "দই", "calories": 59, "protein": 10.0, "fat": 0.4, "carbs": 3.6, "fiber": 0, "food_group": "Milk & Dairy"},
        {"code": "10_0001", "name_en": "Oats", "name_bn": "ওটস", "calories": 389, "protein": 16.9, "fat": 6.9, "carbs": 66, "fiber": 10.6, "food_group": "Cereals & Grains"},
    ]

    def get_safe_foods(self, conditions, goal="Maintain", limit=40):
        avoid_groups = set()
        prefer_groups = set()
        for rule in NDG_DIETARY_RULES:
            if rule["condition"] in conditions:
                if rule["rule_type"] == "AVOID":
                    avoid_groups.add(rule["group_target"])
                elif rule["rule_type"] == "PREFER":
                    prefer_groups.add(rule["group_target"])

        results = []
        for f in self._sample_foods:
            if f["food_group"] in avoid_groups:
                continue
            score = 1 if f["food_group"] in prefer_groups else 0
            if "Diabetes" in conditions:
                if f["food_group"] in ["Leafy Vegetables", "Pulses & Legumes", "Fish & Seafood", "Vegetables"]:
                    score += 2
                if f["food_group"] in ["Sugars & Sweets", "Roots & Tubers"]:
                    continue
            results.append({**f, "preference_score": score})

        results.sort(key=lambda x: (-x["preference_score"], -x.get("protein", 0)))
        return results[:limit]

    def search_food(self, query_text):
        qt = query_text.lower()
        return [f for f in self._sample_foods if qt in f["name_en"].lower() or qt in f["name_bn"]]

    def compare_meals(self, meal_1_codes, meal_2_codes, conditions):
        return {"meal_1": {}, "meal_2": {}, "insight": "Comparison not available in mock mode."}

    def get_chatbot_context(self, food_code_or_name, conditions):
        food = next((f for f in self._sample_foods if f["code"] == food_code_or_name or food_code_or_name.lower() in f["name_en"].lower()), None)
        if not food:
            return f"'{food_code_or_name}' not found."
        rules = []
        for rule in NDG_DIETARY_RULES:
            if rule["condition"] in conditions and rule["group_target"] == food["food_group"]:
                action = "⚠️ AVOID" if rule["rule_type"] == "AVOID" else "✅ PREFER"
                rules.append(f"  {action} (for {rule['condition']}): {rule['reason_en']}")
        ctx = f"Food: {food['name_bn']} ({food['name_en']}), Group: {food['food_group']}.\n"
        ctx += "\n".join(rules) if rules else "No specific dietary restrictions found."
        return ctx

    def close(self):
        pass


class KhadokGraphRAG:
    """Wrapper that tries the real Neo4j engine, falls back to mock on connection failure."""

    def __init__(self):
        self._real = None
        self._mock = None
        try:
            self._real = _RealKhadokGraphRAG()
        except Exception:
            self._mock = MockKhadokGraphRAG()

    def _delegate(self, method_name, *args, **kwargs):
        if self._real is not None:
            try:
                return getattr(self._real, method_name)(*args, **kwargs)
            except Exception:
                # Runtime connection failure — switch to mock permanently
                self._real.close()
                self._real = None
                self._mock = MockKhadokGraphRAG()
        return getattr(self._mock, method_name)(*args, **kwargs)

    def get_safe_foods(self, conditions, goal="Maintain", limit=40):
        return self._delegate("get_safe_foods", conditions, goal, limit)

    def search_food(self, query_text):
        return self._delegate("search_food", query_text)

    def compare_meals(self, meal_1_codes, meal_2_codes, conditions):
        return self._delegate("compare_meals", meal_1_codes, meal_2_codes, conditions)

    def get_chatbot_context(self, food_code_or_name, conditions):
        return self._delegate("get_chatbot_context", food_code_or_name, conditions)

    def close(self):
        if self._real is not None:
            self._real.close()


__all__ = [
    "KhadokGraphRAG",
    "calculate_targets",
    "NDG_DIETARY_RULES",
    "get_neo4j_config",
]
