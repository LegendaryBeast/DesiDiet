"""Diet plan chat service — conversational data collection + plan generation."""

import json
from typing import Any, Dict, List, Optional
from app.db import prisma
from app.core.llm_client import llm_client
from app.utils import safe_list, to_json_string
from app.services.meal_plan_service import _get_rag, _generate_fallback_meal_plan, save_meal_plan
from graph_rag_bridge import calculate_targets

# ── Required fields & their Bengali question prompts ────────────────────────

REQUIRED_FIELDS = ["age", "gender", "height_cm", "weight_kg", "activity_level", "goal", "medical_conditions"]

# ── System prompt for the diet-plan intake AI ────────────────────────────────

COLLECTION_SYSTEM_PROMPT = """You are পুষ্টি এআই (PushtiAI), a warm and friendly Bangladeshi AI nutritionist acting as a health intake specialist.

Your ONLY goal in this conversation is to collect the following information from the user step-by-step, one question at a time:

1. **age** — their age in years
2. **gender** — male (পুরুষ) or female (মহিলা)
3. **height_cm** — height in cm (or feet/inches, you convert)
4. **weight_kg** — current weight in kg
5. **activity_level** — one of: sedentary, light, moderate, active, very_active
6. **goal** — one of: lose_weight, gain_weight, maintain, manage_diabetes, manage_hypertension
7. **medical_conditions** — list of conditions like diabetes, hypertension, kidney_disease, heart_disease, none

RULES:
- Ask ONLY ONE question at a time.
- Be warm, encouraging, and conversational — not clinical.
- Reply in Bengali if the user writes in Bengali, English otherwise.
- After each answer, acknowledge it and ask the next missing field.
- Convert units as needed (e.g., feet to cm, pounds to kg).
- For medical conditions, give examples: "ডায়াবেটিস, উচ্চ রক্তচাপ, কিডনির সমস্যা, হৃদরোগ — অথবা কোনো সমস্যা নেই লিখুন"
- For activity level, give examples in Bengali:
  * sedentary = অফিসে বসে কাজ, হাঁটাচলা কম
  * light = হালকা হাঁটাহাঁটি, সপ্তাহে ১-৩ দিন ব্যায়াম
  * moderate = সপ্তাহে ৩-৫ দিন ব্যায়াম
  * active = প্রতিদিন ব্যায়াম বা শারীরিক কাজ
  * very_active = ভারী শারীরিক কাজ বা পেশাদার খেলাধুলা
- When you have ALL 7 fields confirmed, end your message with exactly this JSON marker on its own line:
  ##DIET_DATA_COMPLETE##
  Then on the NEXT line, output ONLY this JSON (no other text around it):
  {"age": <int>, "gender": "<male|female>", "height_cm": <float>, "weight_kg": <float>, "activity_level": "<level>", "goal": "<goal>", "medical_conditions": [<list>]}
- Before the marker, write a warm confirmation message summarising what you collected.
"""


# ── Extract collected data from the AI response ──────────────────────────────

def extract_collected_data(ai_response: str) -> Optional[Dict[str, Any]]:
    """Parse the structured JSON block the AI embeds when data is complete."""
    if "##DIET_DATA_COMPLETE##" not in ai_response:
        return None
    try:
        parts = ai_response.split("##DIET_DATA_COMPLETE##")
        if len(parts) < 2:
            return None
        json_part = parts[1].strip().splitlines()[0].strip()
        data = json.loads(json_part)
        # Validate required keys
        for field in ["age", "gender", "height_cm", "weight_kg", "activity_level", "goal"]:
            if field not in data:
                return None
        if "medical_conditions" not in data:
            data["medical_conditions"] = []
        return data
    except Exception:
        return None


# ── Generate plan from collected conversational data ─────────────────────────

async def generate_plan_from_collected(
    collected: Dict[str, Any],
    user_id: str,
    language: str = "bn",
) -> Dict[str, Any]:
    """
    Generate and save a daily meal plan using data collected via chat.
    Also upserts (patches) the user's profile with the new data.
    Returns dict with plan_data + plan_id.
    """

    # Normalise medical_conditions
    conditions: List[str] = []
    raw_conds = collected.get("medical_conditions", [])
    if isinstance(raw_conds, list):
        conditions = [c.strip().lower() for c in raw_conds if c.strip().lower() not in ("none", "কোনো নেই", "")]
    elif isinstance(raw_conds, str):
        if raw_conds.strip().lower() not in ("none", "কোনো নেই", ""):
            conditions = [raw_conds.strip().lower()]

    targets = calculate_targets({
        "gender": collected["gender"],
        "height_cm": float(collected["height_cm"]),
        "weight_kg": float(collected["weight_kg"]),
        "activity_level": collected["activity_level"],
    })

    rag = _get_rag()
    goal = collected.get("goal", "maintain")
    safe_foods = rag.get_safe_foods(conditions=conditions, goal=goal, limit=50)

    # Try LLM generation; fall back to template on failure
    plan_data: Dict[str, Any] = {}
    try:
        from app.services.meal_plan_service import _build_meal_plan_prompt
        import json as _json

        # Build a lightweight proxy profile object for the prompt builder
        class _ProfileProxy:
            age = collected.get("age")
            gender = collected["gender"]
            weightKg = float(collected["weight_kg"])
            heightCm = float(collected["height_cm"])
            activityLevel = collected["activity_level"]
            goal = collected.get("goal", "maintain")
            preferredFoods = None
            dislikedFoods = None

        messages = _build_meal_plan_prompt(_ProfileProxy(), targets, safe_foods, conditions, language)
        llm_response = await llm_client.chat_completion(
            messages=messages,
            temperature=0.7,
            max_tokens=3000,
            response_format={"type": "json_object"},
        )
        plan_data = _json.loads(llm_response)
    except Exception:
        class _ProfileProxy2:  # type: ignore[no-redef]
            age = collected.get("age")
            gender = collected["gender"]
            weightKg = float(collected["weight_kg"])
            heightCm = float(collected["height_cm"])
            activityLevel = collected["activity_level"]
            goal = collected.get("goal", "maintain")
            preferredFoods = None
            dislikedFoods = None

        plan_data = _generate_fallback_meal_plan(_ProfileProxy2(), targets, safe_foods, conditions, language)

    plan_data.setdefault("target_calories", targets["target_calories"])
    plan_data.setdefault("meals", [])
    plan_data.setdefault("condition_rules_applied", conditions)
    plan_data["_source"] = "diet_plan_chat"

    # Upsert profile with collected data
    try:
        existing = await prisma.profile.find_unique(where={"userId": user_id})
        profile_data = {
            "age": int(collected["age"]),
            "gender": collected["gender"],
            "weightKg": float(collected["weight_kg"]),
            "heightCm": float(collected["height_cm"]),
            "activityLevel": collected["activity_level"],
            "goal": goal,
            "medicalConditions": to_json_string(conditions),
        }
        if existing:
            await prisma.profile.update(where={"userId": user_id}, data=profile_data)
        else:
            await prisma.profile.create(data={"userId": user_id, **profile_data})
    except Exception:
        pass  # Profile upsert is best-effort; don't block plan creation

    # Save plan to DB
    saved = await save_meal_plan(user_id, "daily", plan_data, language)

    return {
        "plan_id": saved.planId,
        "plan_data": plan_data,
        "calorie_target": plan_data.get("target_calories", targets["target_calories"]),
    }
