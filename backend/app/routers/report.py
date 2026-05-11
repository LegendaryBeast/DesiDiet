"""Nutrition report routes."""

from fastapi import APIRouter, Depends
from app.dependencies import get_current_user
from app.db import prisma
from app.schemas import NutritionReportResponse, ConditionsReportResponse
from app.utils import safe_list
from graph_rag_bridge import calculate_targets, NDG_DIETARY_RULES
from typing import List, Dict, Any

router = APIRouter()


@router.get("/nutrition")
async def get_nutrition_report(current_user=Depends(get_current_user)):
    """Get full nutrition requirements report."""
    profile = await prisma.profile.find_unique(where={"userId": current_user.id})
    if not profile:
        return {"error": "Profile not found"}

    latest_log = await prisma.healthlog.find_first(
        where={"userId": current_user.id},
        order={"logDate": "desc"},
    )

    targets = calculate_targets({
        "gender": profile.gender or "male",
        "height_cm": profile.heightCm or 170,
        "weight_kg": profile.weightKg or 70,
        "activity_level": profile.activityLevel or "sedentary",
    })

    conditions = safe_list(profile.medicalConditions)
    applicable_rules = [r for r in NDG_DIETARY_RULES if r["condition"] in conditions]

    return {
        "user_id": current_user.id,
        "targets": targets,
        "latest_health_log": {
            "weight_kg": latest_log.weightKg if latest_log else None,
            "blood_sugar": latest_log.bloodSugar if latest_log else None,
            "blood_pressure": latest_log.bloodPressure if latest_log else None,
        },
        "applicable_rules": applicable_rules,
    }


@router.get("/conditions")
async def get_conditions_report(current_user=Depends(get_current_user)):
    """Get NDG 2025 dietary rules for the user's conditions."""
    profile = await prisma.profile.find_unique(where={"userId": current_user.id})
    if not profile:
        return {"conditions": [], "rules": []}

    conditions = safe_list(profile.medicalConditions)
    rules = [r for r in NDG_DIETARY_RULES if r["condition"] in conditions]

    return ConditionsReportResponse(conditions=conditions, rules=rules)
