"""
GraphRAG Core Retrieval Engine
Translates frontend features into Cypher queries over the Neo4j Knowledge Graph.
"""

from typing import List, Dict, Any
from neo4j import GraphDatabase
from .config import get_neo4j_config

class KhadokGraphRAG:
    def __init__(self):
        config = get_neo4j_config()
        self.driver = GraphDatabase.driver(config['uri'], auth=(config['user'], config['password']))

    def close(self):
        self.driver.close()

    def get_safe_foods(self, conditions: List[str], goal: str = "Maintain", limit: int = 40) -> List[Dict[str, Any]]:
        """
        Feature: Body condition summary and Diet plan overview.
        Retrieves foods that are safe for the user's medical conditions and prioritizes
        foods that match their goal (Weight Loss, Gain, etc.).
        Excludes 'is_partial' foods.
        """
        query = '''
        MATCH (f:Food)-[:BELONGS_TO]->(fg:FoodGroup)
        WHERE f.is_partial = false

        // 1. Check if this food group is AVOIDED for user's conditions
        OPTIONAL MATCH (ca:Condition)-[:AVOID_GROUP]->(fg)
        WHERE ca.name IN $conditions OR ca.name = $goal
        WITH f, fg, ca

        // Only keep foods where no AVOID relationship matched
        WHERE ca IS NULL

        // 2. Soft boosting: Check if this food group is preferred
        OPTIONAL MATCH (cp:Condition)-[:PREFER_GROUP]->(fg)
        WHERE cp.name IN $conditions OR cp.name = $goal
        WITH f, fg, count(cp) AS preference_score

        RETURN f.code AS code,
               f.name_en AS name_en,
               f.name_bn AS name_bn,
               f.energy_kcal AS calories,
               f.protein_g AS protein,
               f.fiber_g AS fiber,
               fg.name_en AS food_group,
               preference_score
        ORDER BY preference_score DESC, f.protein_g DESC
        LIMIT $limit
        '''
        with self.driver.session() as session:
            result = session.run(query, conditions=conditions, goal=goal, limit=limit)
            return [dict(record) for record in result]

    def search_food(self, query_text: str) -> List[Dict[str, Any]]:
        """
        Feature: Meal Search Option
        Allows user to search for a food to add to their meal.
        """
        query = '''
        MATCH (f:Food)-[:BELONGS_TO]->(fg:FoodGroup)
        WHERE toLower(f.name_en) CONTAINS toLower($qt)
           OR toLower(f.name_bn) CONTAINS toLower($qt)
           OR toLower(f.name_original) CONTAINS toLower($qt)
        RETURN f.code AS code,
               f.name_en AS name_en,
               f.name_bn AS name_bn,
               f.energy_kcal AS calories,
               f.protein_g AS protein,
               f.fat_g AS fat,
               f.carbohydrate_g AS carbs,
               f.fiber_g AS fiber,
               fg.name_en AS food_group
        ORDER BY f.protein_g DESC
        LIMIT 10
        '''
        with self.driver.session() as session:
            result = session.run(query, qt=query_text)
            return [dict(record) for record in result]

    def compare_meals(self, meal_1_codes: List[str], meal_2_codes: List[str], conditions: List[str]) -> Dict[str, Any]:
        """
        Feature: Daily meal generation comparison and insights.
        Evaluates two custom meal combinations.
        """
        def evaluate_meal(codes, session):
            q = '''
            UNWIND $codes AS code
            MATCH (f:Food {code: code})-[:BELONGS_TO]->(fg:FoodGroup)
            
            // Check violations
            OPTIONAL MATCH (c:Condition)-[r:AVOID_GROUP]->(fg)
            WHERE c.name IN $conditions
            
            RETURN 
                sum(f.energy_kcal) AS total_calories,
                sum(f.protein_g) AS total_protein,
                sum(f.fat_g) AS total_fat,
                sum(f.carbohydrate_g) AS total_carbs,
                collect(DISTINCT c.name) AS violated_conditions,
                collect(DISTINCT r.reason) AS violation_reasons
            '''
            return dict(session.run(q, codes=codes, conditions=conditions).single())

        with self.driver.session() as session:
            m1 = evaluate_meal(meal_1_codes, session)
            m2 = evaluate_meal(meal_2_codes, session)
            
            insight = "Both meals are safe."
            if m1['violated_conditions'] and not m2['violated_conditions']:
                insight = f"Meal 2 is better. Meal 1 violates rules for {', '.join([c for c in m1['violated_conditions'] if c])}."
            elif m2['violated_conditions'] and not m1['violated_conditions']:
                insight = f"Meal 1 is better. Meal 2 violates rules for {', '.join([c for c in m2['violated_conditions'] if c])}."
            elif m1['violated_conditions'] and m2['violated_conditions']:
                insight = "Both meals contain items you should avoid based on your conditions."
            else:
                if m1['total_protein'] > m2['total_protein']:
                    insight = "Meal 1 has a better protein profile."
                else:
                    insight = "Meal 2 has a better protein profile."
                    
            return {
                "meal_1": m1,
                "meal_2": m2,
                "insight": insight
            }

    def get_chatbot_context(self, food_code_or_name: str, conditions: List[str]) -> str:
        """
        Feature: Dedicated Chatbot context generation.
        When user asks about a food, we fetch its rules for their specific conditions.
        Accepts either a food code (e.g. '01_0012') or partial name (e.g. 'rice', 'ilish').
        """
        query = '''
        MATCH (f:Food)-[:BELONGS_TO]->(fg:FoodGroup)
        WHERE f.code = $term
           OR toLower(f.name_en) CONTAINS toLower($term)
           OR toLower(f.name_bn) CONTAINS toLower($term)
           OR toLower(f.name_original) CONTAINS toLower($term)

        OPTIONAL MATCH (c:Condition)-[r:AVOID_GROUP|PREFER_GROUP]->(fg)
        WHERE c.name IN $conditions

        RETURN f.name_bn AS name_bn, f.name_en AS name_en, fg.name_en AS group,
               collect({condition: c.name, rel_type: type(r), reason: r.reason}) AS rules
        LIMIT 1
        '''
        with self.driver.session() as session:
            record = session.run(query, term=food_code_or_name, conditions=conditions).single()
            if not record:
                return f"'{food_code_or_name}' not found in the knowledge graph."

            rules = record['rules']
            context = f"Food: {record['name_bn']} ({record['name_en']}), Group: {record['group']}.\n"

            valid_rules = [r for r in rules if r['condition'] is not None]
            if not valid_rules:
                context += "No specific dietary restrictions found for your conditions."
            else:
                for r in valid_rules:
                    action = "⚠️ AVOID" if r['rel_type'] == "AVOID_GROUP" else "✅ PREFER"
                    context += f"  {action} (for {r['condition']}): {r['reason']}\n"

            return context
