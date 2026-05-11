"""Meal plan routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from app.db import prisma
from app.dependencies import get_current_user
from app.schemas import MealPlanResponse, MealPlanFeedbackRequest
from app.services.meal_plan_service import generate_daily_meal_plan, save_meal_plan
from app.utils import safe_dict, to_json_string
from datetime import datetime, timedelta
from typing import List

router = APIRouter()


def _plan_to_response(plan) -> MealPlanResponse:
    return MealPlanResponse(
        plan_id=plan.planId,
        user_id=plan.userId,
        plan_date=plan.planDate,
        plan_type=plan.planType,
        plan_data=safe_dict(plan.planData),
        calorie_target=plan.calorieTarget,
        language=plan.language,
        feedback=plan.feedback,
        created_at=plan.createdAt,
    )


@router.get("/daily", response_model=MealPlanResponse)
async def get_daily_plan(language: str = "bn", current_user=Depends(get_current_user)):
    """Generate today's AI meal plan."""
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

    # Check if plan already exists for today
    existing = await prisma.mealplan.find_first(
        where={
            "userId": current_user.id,
            "planType": "daily",
            "planDate": {"gte": today, "lt": today + timedelta(days=1)},
        }
    )
    if existing:
        return _plan_to_response(existing)

    # Generate new plan
    plan_data = await generate_daily_meal_plan(current_user.id, language=language)
    plan = await save_meal_plan(current_user.id, "daily", plan_data, language)
    return _plan_to_response(plan)


@router.get("/weekly", response_model=List[MealPlanResponse])
async def get_weekly_plan(language: str = "bn", current_user=Depends(get_current_user)):
    """Generate a 7-day meal plan."""
    # TODO: Implement weekly plan with variety enforcement in Milestone 4 advanced
    # For now, generate 7 daily plans
    plans = []
    for day_offset in range(7):
        day = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=day_offset)

        existing = await prisma.mealplan.find_first(
            where={
                "userId": current_user.id,
                "planType": "daily",
                "planDate": {"gte": day, "lt": day + timedelta(days=1)},
            }
        )
        if existing:
            plans.append(_plan_to_response(existing))
        else:
            plan_data = await generate_daily_meal_plan(current_user.id, language=language)
            plan = await save_meal_plan(current_user.id, "daily", plan_data, language)
            plans.append(_plan_to_response(plan))

    return plans


@router.get("/history", response_model=List[MealPlanResponse])
async def get_plan_history(limit: int = 30, current_user=Depends(get_current_user)):
    """Get past meal plans."""
    plans = await prisma.mealplan.find_many(
        where={"userId": current_user.id},
        order={"planDate": "desc"},
        take=limit,
    )
    return [_plan_to_response(plan) for plan in plans]


@router.post("/{plan_id}/feedback")
async def submit_feedback(plan_id: str, req: MealPlanFeedbackRequest, current_user=Depends(get_current_user)):
    """Rate a meal plan 1–5."""
    plan = await prisma.mealplan.find_unique(where={"planId": plan_id})
    if not plan or plan.userId != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")

    updated = await prisma.mealplan.update(
        where={"planId": plan_id},
        data={"feedback": req.feedback},
    )
    return {"message": "Feedback submitted", "feedback": updated.feedback}
