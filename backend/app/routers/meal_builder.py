"""Meal builder routes — flexible AI meal analysis and food swap comparison."""

import json
from fastapi import APIRouter, Depends, HTTPException
from app.db import prisma
from app.dependencies import get_current_user
from app.schemas import MealBuilderAnalyzeRequest, MealBuilderAnalyzeResponse
from app.core.llm_client import llm_client
from app.utils import safe_list, safe_dict, to_json_string
from graph_rag_bridge import KhadokGraphRAG

router = APIRouter()

_rag_engine = None


def _get_rag() -> KhadokGraphRAG:
    global _rag_engine
    if _rag_engine is None:
        _rag_engine = KhadokGraphRAG()
    return _rag_engine


BUILDER_SYSTEM_PROMPT = """You are an expert clinical nutritionist AI.
The user has built a custom meal combination. Analyze it and return a JSON report.

Return ONLY valid JSON in this structure:
{
  "total_calories": 450,
  "macros": {"protein_g": 28, "carbs_g": 50, "fat_g": 10},
  "vs_plan_target": {
    "slot_target_kcal": 500,
    "difference": -50,
    "within_range": true,
    "note": "Slightly under target — good if trying to lose weight."
  },
  "condition_safety": {
    "safe": true,
    "flags": [],
    "note": "All items are safe for your conditions."
  },
  "ai_insight": "One paragraph of constructive, personalized insight.",
  "comparison": null,
  "meal_score": {
    "balance": 8,
    "protein_adequacy": 9,
    "condition_safety": 10,
    "overall": 9,
    "label": "Excellent"
  }
}

If a swap was made, fill "comparison":
{
  "before": {"calories": 500, "protein_g": 22},
  "after": {"calories": 450, "protein_g": 28},
  "verdict": "Better protein, fewer calories. Great swap!"
}

Scores are out of 10. Labels: Excellent (9-10), Good (7-8), Fair (5-6), Poor (<5)."""


@router.post("/analyze", response_model=MealBuilderAnalyzeResponse)
async def analyze_meal(req: MealBuilderAnalyzeRequest, current_user=Depends(get_current_user)):
    """Analyze a custom meal combination or food swap using AI."""

    profile = await prisma.profile.find_unique(where={"userId": current_user.id})
    conditions = safe_list(profile.medicalConditions) if profile else []
    goal = profile.goal if profile else "maintain"

    # Determine slot calorie target from today's meal plan
    slot_target = None
    if req.meal_slot:
        from datetime import datetime, timedelta
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        plan = await prisma.mealplan.find_first(
            where={
                "userId": current_user.id,
                "planDate": {"gte": today, "lt": today + timedelta(days=1)},
            }
        )
        if plan:
            plan_data = safe_dict(plan.planData if isinstance(plan.planData, dict) else __import__('json').loads(plan.planData or "{}"))
            for meal in plan_data.get("meals", []):
                if meal.get("slot") == req.meal_slot:
                    slot_target = meal.get("target_calories")
                    break

    # Build food item descriptions for the prompt
    rag = _get_rag()
    item_descriptions = []
    for item in req.items:
        results = rag.search_food(item.food_code)
        food_info = next((r for r in results if r.get("code") == item.food_code), None)
        if food_info:
            item_descriptions.append(
                f"- {food_info['name_en']} ({item.amount_g}g): "
                f"{food_info.get('calories', '?')} kcal/100g, "
                f"protein {food_info.get('protein', '?')}g/100g"
            )
        else:
            name = item.name_en or item.food_code
            item_descriptions.append(f"- {name} ({item.amount_g}g): unknown nutrition data")

    replaced_desc = ""
    if req.replaced_item:
        results = rag.search_food(req.replaced_item.food_code)
        food_info = next((r for r in results if r.get("code") == req.replaced_item.food_code), None)
        if food_info:
            replaced_desc = (
                f"\nReplaced item: {food_info['name_en']} ({req.replaced_item.amount_g}g): "
                f"{food_info.get('calories', '?')} kcal/100g"
            )

    context = (
        f"User conditions: {', '.join(conditions) or 'None'}. Goal: {goal}.\n"
        f"Meal slot: {req.meal_slot or 'custom meal'}. "
        f"Slot calorie target: {slot_target or 'unknown'} kcal.\n"
        f"Items in this meal:\n" + "\n".join(item_descriptions) + replaced_desc
    )

    messages = [
        {"role": "system", "content": BUILDER_SYSTEM_PROMPT},
        {"role": "user", "content": context},
    ]

    raw = await llm_client.chat_completion(
        messages=messages,
        temperature=0.3,
        max_tokens=1024,
        response_format={"type": "json_object"},
    )

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="AI returned invalid JSON. Please try again.")

    return MealBuilderAnalyzeResponse(
        total_calories=data.get("total_calories", 0),
        macros=data.get("macros", {}),
        vs_plan_target=data.get("vs_plan_target", {"slot_target_kcal": slot_target, "note": "No plan found for today"}),
        condition_safety=data.get("condition_safety", {"safe": True, "flags": []}),
        ai_insight=data.get("ai_insight", ""),
        comparison=data.get("comparison"),
        meal_score=data.get("meal_score", {"overall": 0, "label": "Unknown"}),
    )
