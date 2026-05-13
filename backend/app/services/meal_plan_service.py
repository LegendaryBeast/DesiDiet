"""Meal plan generation service — GraphRAG + Calorie Engine + Groq LLM (Llama 3.3)."""

import json
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from app.db import prisma
from app.core.llm_client import llm_client
from app.utils import safe_list, to_json_string
from graph_rag_bridge import calculate_targets, KhadokGraphRAG, NDG_DIETARY_RULES


# Singleton Neo4j connection
_rag_engine = None


def _get_rag() -> KhadokGraphRAG:
    global _rag_engine
    if _rag_engine is None:
        _rag_engine = KhadokGraphRAG()
    return _rag_engine


def _build_meal_plan_prompt(
    profile: Any,
    targets: Dict[str, Any],
    safe_foods: List[Dict[str, Any]],
    conditions: List[str],
    language: str = "bn",
) -> List[Dict[str, str]]:
    """Build the LLM prompt for meal plan generation."""

    applicable_rules = [r for r in NDG_DIETARY_RULES if r["condition"] in conditions]

    foods_text = "\n".join([
        f"- {f['name_bn']} ({f['name_en']}): {f.get('calories', 'N/A')} kcal, {f.get('protein', 'N/A')}g protein, group: {f['food_group']}"
        for f in safe_foods[:30]
    ])

    rules_text = "\n".join([
        f"- [{r['rule_type']}] {r['group_target']}: {r['reason_en']}"
        for r in applicable_rules[:20]
    ])

    lang_instruction = "বাংলায় উত্তর দিন।" if language == "bn" else "Reply in English."

    system_prompt = """You are Khadok-Bangla AI, a warm and knowledgeable Bangladeshi nutrition companion.
Your task is to generate a personalized daily meal plan using ONLY the provided safe foods.

CRITICAL RULES:
1. Use ONLY foods from the safe foods list.
2. Respect all dietary rules (AVOID, PREFER, LIMIT).
3. Match the calorie target and macro distribution.
4. Use authentic Bangladeshi food names in Bengali first, then English in brackets.
5. Explain WHY each food is recommended for this specific user.
6. Return ONLY a valid JSON object — no markdown, no extra text outside JSON.
7. All numeric values must be integers where specified.
8. Every meal must have at least one item.
"""

    # Enrich prompt with dietary context from GraphRAG
    dietary_context = ""
    for condition in conditions:
        rules_for_condition = [r for r in applicable_rules if r["condition"] == condition]
        if rules_for_condition:
            dietary_context += f"\n{condition} Rules:\n"
            for r in rules_for_condition[:5]:
                action = "AVOID" if r["rule_type"] == "AVOID" else "PREFER"
                dietary_context += f"  - {action} {r['group_target']}: {r['reason_en']}\n"

    user_prompt = f"""{lang_instruction}

USER PROFILE:
- Age: {profile.age}, Gender: {profile.gender}
- Weight: {profile.weightKg}kg, Height: {profile.heightCm}cm
- Activity Level: {profile.activityLevel}
- Goal: {profile.goal}
- Medical Conditions: {', '.join(conditions) if conditions else 'None'}
- Preferred Foods: {', '.join(safe_list(profile.preferredFoods)) if profile.preferredFoods else 'Any'}
- Disliked Foods: {', '.join(safe_list(profile.dislikedFoods)) if profile.dislikedFoods else 'None'}

DAILY NUTRITION TARGETS (NDG 2025):
- Target Calories: {targets['target_calories']} kcal
- Protein: {targets['protein_g']}g | Carbs: {targets['carbs_g']}g | Fat: {targets['fat_g']}g
- Fiber: {targets.get('fiber_g', 25)}g | Water: {targets['water_L']}L

DIETARY RULES:
{rules_text}

DETAILED CONTEXT:
{dietary_context}

SAFE FOODS (use only these):
{foods_text}

MEAL DISTRIBUTION:
- Breakfast (সকালের নাস্তা): 20% of calories
- Morning Snack (সকালের হালকা নাস্তা): 10%
- Lunch (দুপুরের খাবার): 35%
- Evening Snack (বিকেলের নাস্তা): 10%
- Dinner (রাতের খাবার): 25%

TASK: Generate a complete daily meal plan in JSON format. Do not include any text outside the JSON object.

RESPONSE FORMAT (strict JSON, follow exactly):
{{
  "target_calories": {targets['target_calories']},
  "macros": {{"protein_g": {targets['protein_g']}, "carbs_g": {targets['carbs_g']}, "fat_g": {targets['fat_g']}, "fiber_g": {targets.get('fiber_g', 25)}}},
  "explanation_bn": "বাংলায় ব্যাখ্যা...",
  "explanation_en": "English explanation...",
  "meals": [
    {{
      "slot": "breakfast",
      "slot_bn": "সকালের নাস্তা",
      "target_calories": number,
      "items": [
        {{
          "food_code": "code_or_name",
          "name_bn": "বাংলা নাম",
          "name_en": "English Name",
          "amount_g": 150,
          "calories": 195,
          "why_bn": "কেন এই খাবার..."
        }}
      ]
    }}
  ],
  "condition_rules_applied": {json.dumps(conditions)}
}}
"""

    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]


def _generate_fallback_meal_plan(
    profile: Any,
    targets: Dict[str, Any],
    safe_foods: List[Dict[str, Any]],
    conditions: List[str],
    language: str = "bn",
    used_codes_global: set = None,
) -> Dict[str, Any]:
    """Generate a template-based meal plan when LLM is unavailable."""

    if used_codes_global is None:
        used_codes_global = set()

    categories = {}
    for f in safe_foods:
        cat = f.get("food_group", "Other")
        categories.setdefault(cat, []).append(f)

    def pick(cat, used):
        pool = [f for f in categories.get(cat, []) if f["code"] not in used and f["code"] not in used_codes_global]
        if pool:
            chosen = random.choice(pool)
            used.add(chosen["code"])
            used_codes_global.add(chosen["code"])
            return chosen
        pool = [f for f in safe_foods if f["code"] not in used and f["code"] not in used_codes_global]
        if pool:
            chosen = random.choice(pool)
            used.add(chosen["code"])
            used_codes_global.add(chosen["code"])
            return chosen
        return safe_foods[0]

    used_codes = set()

    def make_meal(slot, slot_bn, pct):
        target = int(targets["target_calories"] * pct)
        items = []
        meal_cals = 0

        grain = pick("Cereals & Grains", used_codes)
        items.append({
            "food_code": grain["code"],
            "name_bn": grain["name_bn"],
            "name_en": grain["name_en"],
            "amount_g": 150 if slot in ["lunch", "dinner"] else 100,
            "calories": grain.get("calories", 150),
            "why_bn": "শক্তির উৎস" if language == "bn" else "Energy source",
        })
        meal_cals += grain.get("calories", 150)

        protein = pick("Fish & Seafood", used_codes)
        if not protein:
            protein = pick("Pulses & Legumes", used_codes)
        if not protein:
            protein = pick("Eggs", used_codes)
        if protein:
            items.append({
                "food_code": protein["code"],
                "name_bn": protein["name_bn"],
                "name_en": protein["name_en"],
                "amount_g": 100 if slot in ["lunch", "dinner"] else 50,
                "calories": protein.get("calories", 150),
                "why_bn": "প্রোটিনের উৎস" if language == "bn" else "Protein source",
            })
            meal_cals += protein.get("calories", 150)

        veg = pick("Leafy Vegetables", used_codes)
        if not veg:
            veg = pick("Vegetables", used_codes)
        if not veg:
            veg = pick("Fruits", used_codes)
        if veg:
            items.append({
                "food_code": veg["code"],
                "name_bn": veg["name_bn"],
                "name_en": veg["name_en"],
                "amount_g": 80,
                "calories": veg.get("calories", 30),
                "why_bn": "ভিটামিন ও আঁশ সমৃদ্ধ" if language == "bn" else "Rich in vitamins and fiber",
            })
            meal_cals += veg.get("calories", 30)

        return {
            "slot": slot,
            "slot_bn": slot_bn,
            "target_calories": target,
            "items": items,
        }

    meals = [
        make_meal("breakfast", "সকালের নাস্তা", 0.20),
        make_meal("morning_snack", "সকালের হালকা নাস্তা", 0.10),
        make_meal("lunch", "দুপুরের খাবার", 0.35),
        make_meal("evening_snack", "বিকেলের নাস্তা", 0.10),
        make_meal("dinner", "রাতের খাবার", 0.25),
    ]

    total_cals = sum(sum(i["calories"] for i in m["items"]) for m in meals)

    explanation_bn = (
        f"এটি একটি টেমপ্লেট-ভিত্তিক খাবার পরিকল্পনা। "
        f"আপনার লক্ষ্য ক্যালরি {targets['target_calories']} এবং শর্ত {', '.join(conditions) if conditions else 'কোনো নেই'} অনুযায়ী তৈরি। "
        f"আরও ব্যক্তিগতকৃত পরিকল্পনার জন্য LLM সেবা চালু করুন।"
    )
    explanation_en = (
        f"This is a template-based meal plan. "
        f"Generated for your target of {targets['target_calories']} calories and conditions: {', '.join(conditions) if conditions else 'none'}. "
        f"Enable LLM service for more personalized plans."
    )

    return {
        "target_calories": targets["target_calories"],
        "macros": {
            "protein_g": targets["protein_g"],
            "carbs_g": targets["carbs_g"],
            "fat_g": targets["fat_g"],
            "fiber_g": targets.get("fiber_g", 25),
        },
        "explanation_bn": explanation_bn,
        "explanation_en": explanation_en,
        "meals": meals,
        "condition_rules_applied": conditions,
        "is_fallback": True,
        "actual_calories": total_cals,
    }


async def generate_daily_meal_plan(user_id: str, language: str = "bn") -> Dict[str, Any]:
    """Generate a daily meal plan for a user, using the most recent health log weight."""
    profile = await prisma.profile.find_unique(where={"userId": user_id})
    if not profile:
        raise ValueError("Profile not found")

    if not profile.weightKg or not profile.heightCm or not profile.gender or not profile.activityLevel:
        raise ValueError("Profile incomplete")

    # Use the most recent health-log weight if available (more accurate than profile's initial weight)
    current_weight = profile.weightKg
    latest_log = await prisma.healthlog.find_first(
        where={"userId": user_id},
        order={"logDate": "desc"},
    )
    if latest_log and latest_log.weightKg:
        current_weight = latest_log.weightKg

    targets = calculate_targets({
        "gender": profile.gender,
        "height_cm": profile.heightCm,
        "weight_kg": current_weight,
        "activity_level": profile.activityLevel,
    })

    conditions = safe_list(profile.medicalConditions)
    goal = profile.goal or "Maintain"

    rag = _get_rag()
    safe_foods = rag.get_safe_foods(conditions=conditions, goal=goal, limit=50)

    plan_data = None
    try:
        messages = _build_meal_plan_prompt(profile, targets, safe_foods, conditions, language)
        llm_response = await llm_client.chat_completion(
            messages=messages,
            temperature=0.7,
            max_tokens=3000,
            response_format={"type": "json_object"},
        )
        plan_data = json.loads(llm_response)
    except Exception:
        plan_data = _generate_fallback_meal_plan(profile, targets, safe_foods, conditions, language)

    plan_data.setdefault("target_calories", targets["target_calories"])
    plan_data.setdefault("macros", {
        "protein_g": targets["protein_g"],
        "carbs_g": targets["carbs_g"],
        "fat_g": targets["fat_g"],
        "fiber_g": targets.get("fiber_g", 25),
    })
    plan_data.setdefault("meals", [])
    plan_data.setdefault("condition_rules_applied", conditions)
    # Annotate which weight was used for transparency
    plan_data["_calculated_from_weight_kg"] = current_weight

    return plan_data


async def generate_weekly_meal_plan(user_id: str, language: str = "bn") -> List[Dict[str, Any]]:
    """Generate a 7-day meal plan efficiently."""
    profile = await prisma.profile.find_unique(where={"userId": user_id})
    if not profile:
        raise ValueError("Profile not found")

    if not profile.weightKg or not profile.heightCm or not profile.gender or not profile.activityLevel:
        raise ValueError("Profile incomplete")

    targets = calculate_targets({
        "gender": profile.gender,
        "height_cm": profile.heightCm,
        "weight_kg": profile.weightKg,
        "activity_level": profile.activityLevel,
    })

    conditions = safe_list(profile.medicalConditions)
    goal = profile.goal or "Maintain"

    rag = _get_rag()
    safe_foods = rag.get_safe_foods(conditions=conditions, goal=goal, limit=50)

    # Generate 7 unique daily plans using fallback (fast, no LLM calls)
    used_codes_global = set()
    weekly_plans = []
    for day in range(7):
        plan = _generate_fallback_meal_plan(profile, targets, safe_foods, conditions, language, used_codes_global)
        plan["day"] = day + 1
        plan["day_name_bn"] = ["সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার", "রবিবার"][day]
        plan["day_name_en"] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][day]
        weekly_plans.append(plan)

    return weekly_plans


async def save_meal_plan(user_id: str, plan_type: str, plan_data: Dict[str, Any], language: str) -> Any:
    """Save a generated meal plan to the database."""
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

    ai_cal = sum(
        item.get("calories", 0)
        for m in plan_data.get("meals", [])
        for item in m.get("items", [])
    )

    plan = await prisma.mealplan.create(
        data={
            "userId": user_id,
            "planDate": today,
            "planType": plan_type,
            "planData": to_json_string(plan_data),
            "calorieTarget": plan_data.get("target_calories", 2000),
            "aiSuggestionCal": ai_cal,
            "language": language,
        }
    )
    return plan
