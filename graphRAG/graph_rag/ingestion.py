"""
Graph Ingestion Module
Reads the clean CSV and dietary rules, and creates the Knowledge Graph in Neo4j.
"""

import csv
import os
from neo4j import GraphDatabase
from .config import get_neo4j_config
from .dietary_rules_data import NDG_DIETARY_RULES

class GraphIngestion:
    def __init__(self):
        config = get_neo4j_config()
        self.driver = GraphDatabase.driver(config['uri'], auth=(config['user'], config['password']))

    def close(self):
        self.driver.close()

    def clear_database(self):
        print("Clearing existing Graph Database...")
        with self.driver.session() as session:
            session.run("MATCH (n) DETACH DELETE n")
        print("Database cleared.")

    def build_constraints(self):
        print("Building constraints and indexes...")
        with self.driver.session() as session:
            # Drop existing if needed (ignoring errors)
            try:
                session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (f:Food) REQUIRE f.code IS UNIQUE")
                session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (g:FoodGroup) REQUIRE g.name_en IS UNIQUE")
                session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (c:Condition) REQUIRE c.name IS UNIQUE")
            except Exception as e:
                pass
            
            # Indexes for faster lookup
            try:
                session.run("CREATE INDEX IF NOT EXISTS FOR (f:Food) ON (f.name_en)")
                session.run("CREATE INDEX IF NOT EXISTS FOR (f:Food) ON (f.name_bn)")
            except:
                pass

    def ingest_foods(self, csv_filepath: str):
        print(f"Ingesting foods from {csv_filepath}...")
        foods = []
        with open(csv_filepath, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # String fields that must NEVER be cast to float
                STRING_FIELDS = {
                    'code', 'name_en', 'name_bn', 'name_original',
                    'food_group_en', 'food_group_bn', 'food_group_code'
                }
                clean_row = {}
                for k, v in row.items():
                    if k in STRING_FIELDS:
                        clean_row[k] = v  # Always keep as string
                    elif v == '':
                        clean_row[k] = None
                    elif v.lower() == 'true':
                        clean_row[k] = True
                    elif v.lower() == 'false':
                        clean_row[k] = False
                    else:
                        try:
                            clean_row[k] = float(v)
                        except ValueError:
                            clean_row[k] = v
                foods.append(clean_row)

        query = '''
        UNWIND $foods AS f
        MERGE (food:Food {code: f.code})
        SET food.name_en = f.name_en,
            food.name_bn = f.name_bn,
            food.name_original = f.name_original,
            food.energy_kcal = f.energy_kcal,
            food.protein_g = f.protein_g,
            food.fat_g = f.fat_g,
            food.carbohydrate_g = f.carbohydrate_g,
            food.fiber_g = f.fiber_g,
            food.water_g = f.water_g,
            food.calcium_mg = f.calcium_mg,
            food.iron_mg = f.iron_mg,
            food.vitamin_a_mcg = f.vitamin_a_mcg,
            food.vitamin_c_mg = f.vitamin_c_mg,
            food.is_raw = f.is_raw,
            food.is_cooked = f.is_cooked,
            food.is_recipe = f.is_recipe,
            food.is_partial = f.is_partial
        
        MERGE (fg:FoodGroup {name_en: f.food_group_en})
        SET fg.name_bn = f.food_group_bn,
            fg.code = f.food_group_code
            
        MERGE (food)-[:BELONGS_TO]->(fg)
        '''
        with self.driver.session() as session:
            session.run(query, foods=foods)
        print(f"Loaded {len(foods)} foods and connected to FoodGroups.")

    def ingest_dietary_rules(self):
        print("Ingesting NDG 2025 Dietary Rules...")
        query = '''
        UNWIND $rules AS r
        MERGE (c:Condition {name: r.condition})
        
        // Find the targeted food group
        WITH c, r
        MATCH (fg:FoodGroup {name_en: r.group_target})
        
        MERGE (rule:DietaryRule {reason_en: r.reason_en})
        SET rule.rule_type = r.rule_type,
            rule.reason_bn = r.reason_bn
            
        MERGE (c)-[:HAS_RULE]->(rule)
        MERGE (rule)-[:TARGETS_GROUP]->(fg)
        
        // Create direct graph shortcuts for faster GraphRAG querying later
        WITH c, fg, r
        CALL apoc.do.when(
            r.rule_type = 'AVOID',
            'MERGE (c)-[:AVOID_GROUP {reason: r.reason_en}]->(fg) RETURN c',
            'MERGE (c)-[:PREFER_GROUP {reason: r.reason_en}]->(fg) RETURN c',
            {c:c, fg:fg, r:r}
        ) YIELD value
        RETURN count(*)
        '''
        
        # We need apoc for conditional relationships, if not available, we use separate queries
        query_avoid = '''
        UNWIND $rules AS r
        WITH r WHERE r.rule_type = 'AVOID'
        MERGE (c:Condition {name: r.condition})
        MERGE (fg:FoodGroup {name_en: r.group_target})
        MERGE (rule:DietaryRule {reason_en: r.reason_en, rule_type: r.rule_type, reason_bn: r.reason_bn})
        MERGE (c)-[:HAS_RULE]->(rule)
        MERGE (rule)-[:TARGETS_GROUP]->(fg)
        MERGE (c)-[:AVOID_GROUP {reason: r.reason_en}]->(fg)
        '''
        
        query_prefer = '''
        UNWIND $rules AS r
        WITH r WHERE r.rule_type = 'PREFER'
        MERGE (c:Condition {name: r.condition})
        MERGE (fg:FoodGroup {name_en: r.group_target})
        MERGE (rule:DietaryRule {reason_en: r.reason_en, rule_type: r.rule_type, reason_bn: r.reason_bn})
        MERGE (c)-[:HAS_RULE]->(rule)
        MERGE (rule)-[:TARGETS_GROUP]->(fg)
        MERGE (c)-[:PREFER_GROUP {reason: r.reason_en}]->(fg)
        '''

        with self.driver.session() as session:
            session.run(query_avoid, rules=NDG_DIETARY_RULES)
            session.run(query_prefer, rules=NDG_DIETARY_RULES)
            
        print("Dietary rules and Condition nodes loaded.")

    def ingest_ndg_foods(self, csv_filepath: str):
        """Ingest supplementary NDG 2025 foods into the graph."""
        print(f"Ingesting NDG 2025 foods from {csv_filepath}...")
        foods = []
        with open(csv_filepath, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                clean_row = {}
                for k, v in row.items():
                    k = k.strip()
                    v = v.strip() if v else ''
                    if k in ('code', 'name_en', 'name_bn', 'food_group', 'serving_unit',
                             'source_table', 'age_group_target', 'gi_category'):
                        clean_row[k] = v
                    elif v == '':
                        clean_row[k] = None
                    elif v.lower() == 'true':
                        clean_row[k] = True
                    elif v.lower() == 'false':
                        clean_row[k] = False
                    else:
                        try:
                            clean_row[k] = float(v)
                        except ValueError:
                            clean_row[k] = v
                foods.append(clean_row)

        query = '''
        UNWIND $foods AS f
        MERGE (food:Food {code: f.code})
        SET food.name_en = f.name_en,
            food.name_bn = f.name_bn,
            food.name_original = f.name_en,
            food.energy_kcal = f.energy_kcal,
            food.protein_g = f.protein_g,
            food.fat_g = f.fat_g,
            food.carbohydrate_g = f.carbohydrate_g,
            food.fiber_g = f.fiber_g,
            food.serving_size_g = f.serving_size_g,
            food.serving_unit = f.serving_unit,
            food.popularity_rank = f.popularity_rank,
            food.gi_category = f.gi_category,
            food.source = 'NDG_2025',
            food.is_staple = f.is_staple,
            food.is_partial = false,
            food.is_raw = true,
            food.is_cooked = false,
            food.is_recipe = false

        MERGE (fg:FoodGroup {name_en: f.food_group})
        MERGE (food)-[:BELONGS_TO]->(fg)
        '''
        with self.driver.session() as session:
            session.run(query, foods=foods)
        print(f"Loaded {len(foods)} NDG foods and connected to FoodGroups.")

def run_ingestion():
    csv_path = os.path.join(os.path.dirname(__file__), '..', 'preprocessing', 'bd_foods_clean.csv')
    ndg_path = os.path.join(os.path.dirname(__file__), '..', 'preprocessing', 'ndg_foods.csv')

    if not os.path.exists(csv_path):
        print("Error: Clean CSV not found. Please run preprocessing/clean_csv.py first.")
        return

    ingestor = GraphIngestion()
    try:
        ingestor.clear_database()
        ingestor.build_constraints()
        ingestor.ingest_foods(csv_path)
        if os.path.exists(ndg_path):
            ingestor.ingest_ndg_foods(ndg_path)
        else:
            print("⚠️  NDG foods CSV not found, skipping.")
        ingestor.ingest_dietary_rules()
        print("✅ GraphRAG Knowledge Graph build complete!")
    finally:
        ingestor.close()

if __name__ == '__main__':
    run_ingestion()
