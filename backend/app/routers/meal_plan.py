"""Meal plan routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from app.db import prisma
from app.dependencies import get_current_user
from app.schemas import MealPlanResponse, MealPlanFeedbackRequest, MarkSlotCompleteRequest, MarkSlotCompleteResponse
from app.services.meal_plan_service import generate_daily_meal_plan, generate_weekly_meal_plan, save_meal_plan
from app.utils import safe_dict, safe_list, to_json_string, from_json_string
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

    existing = await prisma.mealplan.find_first(
        where={
            "userId": current_user.id,
            "planType": "daily",
            "planDate": {"gte": today, "lt": today + timedelta(days=1)},
        }
    )
    if existing:
        return _plan_to_response(existing)

    try:
        plan_data = await generate_daily_meal_plan(current_user.id, language=language)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    plan = await save_meal_plan(current_user.id, "daily", plan_data, language)
    return _plan_to_response(plan)


@router.get("/weekly", response_model=List[MealPlanResponse])
async def get_weekly_plan(language: str = "bn", current_user=Depends(get_current_user)):
    """Generate a 7-day meal plan with variety enforcement."""
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

    # Check if we already have plans for this week
    week_end = today + timedelta(days=7)
    existing = await prisma.mealplan.find_many(
        where={
            "userId": current_user.id,
            "planType": "daily",
            "planDate": {"gte": today, "lt": week_end},
        },
        order={"planDate": "asc"},
    )
    if len(existing) == 7:
        return [_plan_to_response(p) for p in existing]

    # Generate 7 unique daily plans
    try:
        weekly_data = await generate_weekly_meal_plan(current_user.id, language=language)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    saved = []
    for i, day_plan in enumerate(weekly_data):
        day = today + timedelta(days=i)
        # Delete existing plan for this day if any
        await prisma.mealplan.delete_many(
            where={
                "userId": current_user.id,
                "planType": "daily",
                "planDate": {"gte": day, "lt": day + timedelta(days=1)},
            }
        )
        plan = await prisma.mealplan.create(
            data={
                "userId": current_user.id,
                "planDate": day,
                "planType": "daily",
                "planData": to_json_string(day_plan),
                "calorieTarget": day_plan.get("target_calories", 2000),
                "language": language,
            }
        )
        saved.append(_plan_to_response(plan))

    return saved


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


@router.patch("/{plan_id}/mark-complete", response_model=MarkSlotCompleteResponse)
async def mark_slot_complete(plan_id: str, req: MarkSlotCompleteRequest, current_user=Depends(get_current_user)):
    """Mark a planned meal slot as eaten."""
    plan = await prisma.mealplan.find_unique(where={"planId": plan_id})
    if not plan or plan.userId != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")

    completed_slots = safe_list(from_json_string(plan.completedSlots)) if plan.completedSlots else []
    
    if req.completed and req.slot not in completed_slots:
        completed_slots.append(req.slot)
    elif not req.completed and req.slot in completed_slots:
        completed_slots.remove(req.slot)

    updated = await prisma.mealplan.update(
        where={"planId": plan_id},
        data={"completedSlots": to_json_string(completed_slots)},
    )
    
    return MarkSlotCompleteResponse(
        plan_id=plan_id,
        completed_slots=completed_slots,
        message=f"Slot {req.slot} marked as {'complete' if req.completed else 'incomplete'}."
    )
