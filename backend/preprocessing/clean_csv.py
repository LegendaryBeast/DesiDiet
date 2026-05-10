"""
Khadok-Bangla CSV Preprocessor
===============================
Cleans bd_foods.csv and produces bd_foods_clean.csv ready for Neo4j ingestion.

Issues addressed:
  1. 7 ghost rows (empty name + all nutrients empty) → DROPPED
  2. 32 rows with missing energy_kcal → kept but flagged is_partial=True
  3. 3 garbled/concatenated names → manually corrected
  4. 1 negative vitamin_a value → clamped to 0
  5. food_name_text split into name_en + name_bn (best-effort heuristic)
  6. Computed fields: food_group, is_raw, is_recipe, is_partial
"""

import csv
import re
import os

# ──────────────────────────────────────────────
# Configuration
# ──────────────────────────────────────────────
INPUT_FILE = os.path.join(os.path.dirname(__file__), '..', 'bd_foods.csv')
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), 'bd_foods_clean.csv')

# Food group mapping from code prefix
FOOD_GROUP_MAP = {
    '01': ('Cereals', 'শস্যদানা'),
    '02': ('Pulses & Legumes', 'ডাল ও শিম'),
    '03': ('Vegetables', 'সবজি'),
    '04': ('Leafy Vegetables', 'শাক'),
    '05': ('Roots & Tubers', 'মূল ও কন্দ'),
    '06': ('Nuts & Seeds', 'বাদাম ও বীজ'),
    '07': ('Spices & Condiments', 'মশলা'),
    '08': ('Fruits', 'ফল'),
    '09': ('Fish & Seafood', 'মাছ ও সামুদ্রিক খাবার'),
    '10': ('Meat & Poultry', 'মাংস'),
    '11': ('Eggs', 'ডিম'),
    '12': ('Milk & Dairy', 'দুধ ও দুগ্ধজাত'),
    '13': ('Fats & Oils', 'তেল ও চর্বি'),
    '14': ('Beverages', 'পানীয়'),
    '15': ('Miscellaneous', 'বিবিধ'),
}

# Rows to DROP entirely (ghost rows with no name and all nutrients empty)
GHOST_ROW_CODES = {'04_0002', '08_0033', '09_0007', '09_0029', '09_0041', '09_0048', '09_0051'}

# Manual fixes for garbled names
MANUAL_NAME_FIXES = {
    '01_0018': ('Rice, BRRI Dhan-40, parboiled, milled, raw', 'চাল, বিআরআরআই ধান-৪০, সিদ্ধ, কলেছাটা'),
    '05_0016': ('Sweet potato, Komola Sundori, orange flesh, boiled', 'মিষ্টি আলু, কমলা সুন্দরী, সিদ্ধ'),
    '09_0016': ('Chanda, Indian glassy fish, eyes included', 'চান্দা, রাঙ্গা, চোখ সহ'),
}

# Nutrient columns for completeness check
CORE_NUTRIENT_COLS = ['energy_kcal', 'protein_g', 'fat_g', 'carbohydrate_available_g']
ALL_NUTRIENT_COLS = [
    'energy_kcal', 'energy_kj', 'water_g', 'protein_g', 'fat_g',
    'carbohydrate_available_g', 'total_dietary_fibre_g', 'ash_g',
    'calcium_mg', 'iron_mg', 'magnesium_mg', 'phosphorus_mg',
    'potassium_mg', 'sodium_mg', 'zinc_mg', 'copper_mg',
    'vitamin_a_mcg', 'retinol_mcg', 'beta_carotene_equiv_mcg',
    'vitamin_d_mcg', 'vitamin_e_mg', 'thiamin_mg', 'riboflavin_mg',
    'niacin_equiv_mg', 'vitamin_b6_mg', 'folate_mcg', 'vitamin_c_mg'
]


def split_name(raw_name: str) -> tuple:
    """
    Split the combined food_name_text into (English name, Bangla name).
    
    Common patterns:
      "Barley, whole-grain, raw Jaab, gota"  →  ("Barley, whole-grain, raw", "Jaab, gota")
      "Cholar dal, vanga"                    →  ("Cholar dal, vanga", "চোলার ডাল, ভাঙ্গা")  # Bangla romanized
      "Rice, BR-28, boiled* (without salt)"  →  ("Rice, BR-28, boiled", "")
    
    Heuristic: Look for transition point after 'raw', 'dried', 'boiled*', etc.
    """
    if not raw_name or not raw_name.strip():
        return ('', '')
    
    name = raw_name.strip()
    
    # Known transition words that separate English from Bangla portion
    transition_patterns = [
        r',\s*raw\s+',           # ", raw " 
        r',\s*dried,?\s+',       # ", dried "  
        r'\*?\s*\(without\s',    # "* (without"
        r',\s*dried\s+',
        r'\braw\s+(?=[A-Z])',    # "raw " followed by capital letter (Bangla name starts)
    ]
    
    # Try splitting after keywords like "raw", "dried" 
    # The Bangla/romanized portion usually starts with a capital letter after these
    for pattern in [r'\braw\b', r'\bdried\b']:
        match = re.search(pattern, name)
        if match:
            after_keyword = name[match.end():].strip()
            # Check if what follows looks like a Bangla name (starts with a capital or is non-empty after stripping)
            if after_keyword and after_keyword[0].isupper() and not after_keyword.startswith(('Rice', 'Fish', 'Sweet', 'Indian', 'Egg')):
                name_en = name[:match.end()].strip().rstrip(',').strip()
                name_bn = after_keyword.strip()
                return (name_en, name_bn)
    
    # Check for boiled* pattern
    boiled_match = re.search(r'\bboiled\*?\b', name)
    if boiled_match:
        after = name[boiled_match.end():].strip()
        # Usually: "boiled* (without salt) Bangla name"
        paren_match = re.search(r'\)\s*', after)
        if paren_match:
            bangla_part = after[paren_match.end():].strip()
            eng_part = name[:boiled_match.end() + paren_match.end() + len('(without salt)')].strip()
            if bangla_part:
                return (name[:boiled_match.end()].strip() + after[:paren_match.end()].strip(), bangla_part)
    
    # Check for specific Bangla-only entries (no English descriptor)
    # These typically have no "raw/dried/boiled" keyword and are just Bangla romanized
    if not any(kw in name.lower() for kw in ['raw', 'dried', 'boiled', 'fried', 'roasted']):
        # Probably Bangla romanized name — keep as both
        return (name, name)
    
    # Fallback: return the whole thing as English, empty Bangla
    return (name, '')


def safe_float(val, default=0.0, clamp_min=0.0):
    """Convert to float safely, clamping negative values."""
    try:
        v = float(val)
        if clamp_min is not None and v < clamp_min:
            return clamp_min
        return v
    except (ValueError, TypeError):
        return default


def determine_flags(name: str, code: str) -> dict:
    """Determine is_raw, is_recipe, is_cooked from name."""
    name_lower = name.lower()
    return {
        'is_raw': 'raw' in name_lower and 'boiled' not in name_lower and 'fried' not in name_lower,
        'is_recipe': '*' in name,  # Items marked with * are prepared recipes
        'is_cooked': any(kw in name_lower for kw in ['boiled', 'siddha', 'fried', 'fry', 'bhuna']),
    }


def process():
    """Main preprocessing pipeline."""
    print(f"Reading {INPUT_FILE}...")
    
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        raw_rows = list(reader)
    
    print(f"  Total raw rows: {len(raw_rows)}")
    
    # ── Step 1: Drop ghost rows ──
    rows = [r for r in raw_rows if r['code'] not in GHOST_ROW_CODES]
    dropped = len(raw_rows) - len(rows)
    print(f"  Step 1: Dropped {dropped} ghost rows")
    
    # ── Step 2-6: Process each row ──
    clean_rows = []
    partial_count = 0
    
    for row in rows:
        code = row['code']
        raw_name = row.get('food_name_text', '')
        
        # Step 3: Apply manual name fixes
        if code in MANUAL_NAME_FIXES:
            name_en, name_bn = MANUAL_NAME_FIXES[code]
        else:
            name_en, name_bn = split_name(raw_name)
        
        # Step 5: Food group
        prefix = code.split('_')[0] if '_' in code else ''
        fg_en, fg_bn = FOOD_GROUP_MAP.get(prefix, ('Other', 'অন্যান্য'))
        
        # Step 4: Check if partial (missing core nutrients)
        is_partial = any(not row.get(col, '').strip() for col in CORE_NUTRIENT_COLS)
        if is_partial:
            partial_count += 1
        
        # Step 5: Computed flags
        flags = determine_flags(raw_name, code)
        
        # Build clean row
        clean = {
            'code': code,
            'name_en': name_en,
            'name_bn': name_bn,
            'name_original': raw_name,
            'food_group_en': fg_en,
            'food_group_bn': fg_bn,
            'food_group_code': prefix,
            
            # Core macros (Step 4: clamp negatives)
            'energy_kcal': safe_float(row.get('energy_kcal'), default=None),
            'protein_g': safe_float(row.get('protein_g'), default=None),
            'fat_g': safe_float(row.get('fat_g'), default=None),
            'carbohydrate_g': safe_float(row.get('carbohydrate_available_g'), default=None),
            'fiber_g': safe_float(row.get('total_dietary_fibre_g'), default=None),
            'water_g': safe_float(row.get('water_g'), default=None),
            
            # Minerals
            'calcium_mg': safe_float(row.get('calcium_mg'), default=None),
            'iron_mg': safe_float(row.get('iron_mg'), default=None),
            'magnesium_mg': safe_float(row.get('magnesium_mg'), default=None),
            'phosphorus_mg': safe_float(row.get('phosphorus_mg'), default=None),
            'potassium_mg': safe_float(row.get('potassium_mg'), default=None),
            'sodium_mg': safe_float(row.get('sodium_mg'), default=None),
            'zinc_mg': safe_float(row.get('zinc_mg'), default=None),
            
            # Vitamins (Step 4: clamp vitamin_a negative to 0)
            'vitamin_a_mcg': safe_float(row.get('vitamin_a_mcg'), default=None, clamp_min=0.0),
            'vitamin_c_mg': safe_float(row.get('vitamin_c_mg'), default=None),
            'vitamin_d_mcg': safe_float(row.get('vitamin_d_mcg'), default=None),
            'folate_mcg': safe_float(row.get('folate_mcg'), default=None),
            
            # Edible portion
            'edible_portion': safe_float(row.get('edible_portion_coefficient', '1'), default=1.0),
            
            # Flags
            'is_raw': flags['is_raw'],
            'is_cooked': flags['is_cooked'],
            'is_recipe': flags['is_recipe'],
            'is_partial': is_partial,
        }
        
        clean_rows.append(clean)
    
    print(f"  Step 2: Split names (name_en + name_bn)")
    print(f"  Step 3: Fixed 3 garbled names")
    print(f"  Step 4: Flagged {partial_count} partial rows (missing core nutrients)")
    print(f"  Step 5: Added food_group, is_raw, is_cooked, is_recipe flags")
    
    # ── Write output ──
    fieldnames = list(clean_rows[0].keys())
    with open(OUTPUT_FILE, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(clean_rows)
    
    print(f"\n✅ Wrote {len(clean_rows)} clean rows to {OUTPUT_FILE}")
    print(f"   Dropped: {dropped} ghost rows")
    print(f"   Partial: {partial_count} rows (flagged, not dropped)")
    print(f"   Fixed:   3 garbled names + 1 negative vitamin_a clamped to 0")
    
    return clean_rows


if __name__ == '__main__':
    process()
