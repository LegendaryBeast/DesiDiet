"""Food search and GraphRAG food routes."""

from fastapi import APIRouter, Depends, HTTPException
from app.dependencies import get_current_user
from app.db import prisma
from app.schemas import FoodSearchResponse, SafeFoodsResponse, FoodDetailResponse, FoodWithInsightResponse
from app.utils import safe_list
from app.core.llm_client import llm_client
from graph_rag_bridge import KhadokGraphRAG
from typing import List

router = APIRouter()

# Singleton Neo4j connection
_rag_engine = None


def _get_rag() -> KhadokGraphRAG:
    global _rag_engine
    if _rag_engine is None:
        _rag_engine = KhadokGraphRAG()
    return _rag_engine


@router.get("/search", response_model=List[FoodSearchResponse])
async def search_foods(q: str, current_user=Depends(get_current_user)):
    """Search foods by Bengali or English name."""
    rag = _get_rag()
    results = rag.search_food(q)
    return [
        FoodSearchResponse(
            code=r["code"],
            name_en=r["name_en"],
            name_bn=r["name_bn"],
            calories=r.get("calories"),
            protein=r.get("protein"),
            food_group=r["food_group"],
        )
        for r in results
    ]


@router.get("/safe-foods", response_model=List[SafeFoodsResponse])
async def get_safe_foods(current_user=Depends(get_current_user)):
    """Get foods safe for the user's conditions and goal."""
    profile = await prisma.profile.find_unique(where={"userId": current_user.id})
    conditions = safe_list(profile.medicalConditions) if profile else []
    goal = profile.goal if profile else "Maintain"

    rag = _get_rag()
    results = rag.get_safe_foods(conditions=conditions, goal=goal, limit=50)
    return [
        SafeFoodsResponse(
            code=r["code"],
            name_en=r["name_en"],
            name_bn=r["name_bn"],
            calories=r.get("calories"),
            protein=r.get("protein"),
            fiber=r.get("fiber"),
            food_group=r["food_group"],
            preference_score=r.get("preference_score", 0),
        )
        for r in results
    ]


@router.get("/{code}", response_model=FoodDetailResponse)
async def get_food_detail(code: str, current_user=Depends(get_current_user)):
    """Get detailed food info with dietary rules for user's conditions."""
    profile = await prisma.profile.find_unique(where={"userId": current_user.id})
    conditions = safe_list(profile.medicalConditions) if profile else []

    rag = _get_rag()
    context = rag.get_chatbot_context(code, conditions)

    # Also fetch basic food data from search
    search_results = rag.search_food(code)
    food = next((r for r in search_results if r["code"] == code), None)
    if not food:
        # Try by name
        search_results = rag.search_food(code.replace("_", " "))
        food = search_results[0] if search_results else None

    if not food:
        raise HTTPException(status_code=404, detail="Food not found")

    # Parse rules from context string
    rules = []
    for line in context.split("\n"):
        line = line.strip()
        if line.startswith("⚠️ AVOID") or line.startswith("✅ PREFER"):
            parts = line.split(":", 1)
            if len(parts) == 2:
                action = "AVOID" if "AVOID" in parts[0] else "PREFER"
                condition_part = parts[0].split("(")
                condition = condition_part[1].replace(")", "").strip() if len(condition_part) > 1 else ""
                rules.append({
                    "action": action,
                    "condition": condition,
                    "reason": parts[1].strip(),
                })

    return FoodDetailResponse(
        code=food["code"],
        name_en=food["name_en"],
        name_bn=food["name_bn"],
        food_group=food.get("food_group", "Unknown"),
        calories=food.get("calories"),
        protein=food.get("protein"),
        fat=food.get("fat"),
        carbs=food.get("carbs"),
        fiber=food.get("fiber"),
        rules=rules,
    )


INSIGHT_SYSTEM_PROMPT = """You are an AI nutritionist. For each food item, provide a 1-line personalized nutritional insight based on the user's conditions and goal.
Return ONLY valid JSON in this exact structure:
{
  "insights": [
    {
      "code": "02_0001",
      "safety": "safe",  // "safe", "caution", or "avoid"
      "ai_insight": "Great protein source for your diabetes, but keep portions moderate for weight loss."
    }
  ]
}"""


@router.get("/search-with-insight", response_model=List[FoodWithInsightResponse])
async def search_foods_with_insight(q: str, slot: str = "any", current_user=Depends(get_current_user)):
    """Search foods with AI personalized insights for the current user."""
    profile = await prisma.profile.find_unique(where={"userId": current_user.id})
    conditions = safe_list(profile.medicalConditions) if profile else []
    goal = profile.goal if profile else "maintain"

    rag = _get_rag()
    results = rag.search_food(q)[:10]  # Limit to 10 to avoid huge LLM prompts

    if not results:
        return []

    foods_context = []
    for r in results:
        foods_context.append(
            f"- [{r['code']}] {r['name_en']} ({r.get('calories', '?')} kcal, {r.get('protein', '?')}g protein)"
        )
    
    context = (
        f"User conditions: {', '.join(conditions) or 'None'}. Goal: {goal}. Meal slot: {slot}.\n"
        f"Foods found:\n" + "\n".join(foods_context)
    )

    messages = [
        {"role": "system", "content": INSIGHT_SYSTEM_PROMPT},
        {"role": "user", "content": context},
    ]

    raw = await llm_client.chat_completion(
        messages=messages,
        temperature=0.3,
        max_tokens=1024,
        response_format={"type": "json_object"},
    )

    insights_map = {}
    try:
        data = __import__('json').loads(raw)
        for item in data.get("insights", []):
            insights_map[item["code"]] = item
    except Exception:
        pass

    response = []
    for r in results:
        insight = insights_map.get(r["code"], {})
        response.append(
            FoodWithInsightResponse(
                code=r["code"],
                name_en=r["name_en"],
                name_bn=r["name_bn"],
                calories=r.get("calories"),
                protein=r.get("protein"),
                fiber=r.get("fiber"),
                fat=r.get("fat"),
                carbs=r.get("carbs"),
                food_group=r["food_group"],
                safety=insight.get("safety", "safe"),
                ai_insight=insight.get("ai_insight", "Good nutritional choice."),
            )
        )
    return response

