"""User profile routes."""

from fastapi import APIRouter, HTTPException, status, Depends
from app.db import prisma
from app.dependencies import get_current_user
from app.schemas import (
    ProfileCreateRequest,
    ProfileUpdateRequest,
    ProfileResponse,
    ProfileWithTargetsResponse,
    NutritionTargetsResponse,
)
from app.utils import safe_list, to_json_string
from graph_rag_bridge import calculate_targets
from typing import List

router = APIRouter()


def _profile_to_response(profile) -> ProfileResponse:
    return ProfileResponse(
        user_id=profile.userId,
        name_bn=profile.nameBn,
        name_en=profile.nameEn,
        age=profile.age,
        gender=profile.gender,
        weight_kg=profile.weightKg,
        height_cm=profile.heightCm,
        activity_level=profile.activityLevel,
        goal=profile.goal,
        medical_conditions=safe_list(profile.medicalConditions),
        preferred_foods=safe_list(profile.preferredFoods),
        disliked_foods=safe_list(profile.dislikedFoods),
        updated_at=profile.updatedAt,
    )


def _calculate_targets_from_profile(profile) -> NutritionTargetsResponse:
    if not profile.weightKg or not profile.heightCm or not profile.gender or not profile.activityLevel:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile incomplete — weight, height, gender, and activity level are required",
        )

    targets = calculate_targets({
        "gender": profile.gender,
        "height_cm": profile.heightCm,
        "weight_kg": profile.weightKg,
        "activity_level": profile.activityLevel,
    })

    return NutritionTargetsResponse(
        bmi=targets["bmi"],
        bmi_category=targets["body_type"],
        ideal_body_weight_kg=targets["ideal_body_weight_kg"],
        target_calories=targets["target_calories"],
        protein_g=targets["protein_g"],
        carbs_g=targets["carbs_g"],
        fat_g=targets["fat_g"],
        fiber_g=targets.get("fiber_g", 25),
        water_l=targets["water_L"],
    )


@router.post("", response_model=ProfileResponse)
async def create_profile(req: ProfileCreateRequest, current_user=Depends(get_current_user)):
    """Create or replace the user's profile."""
    # Delete existing profile if any
    existing = await prisma.profile.find_unique(where={"userId": current_user.id})
    if existing:
        await prisma.profile.delete(where={"userId": current_user.id})

    profile = await prisma.profile.create(
        data={
            "userId": current_user.id,
            "nameBn": req.name_bn,
            "nameEn": req.name_en,
            "age": req.age,
            "gender": req.gender,
            "weightKg": req.weight_kg,
            "heightCm": req.height_cm,
            "activityLevel": req.activity_level,
            "goal": req.goal,
            "medicalConditions": to_json_string(req.medical_conditions or []),
            "preferredFoods": to_json_string(req.preferred_foods or []),
            "dislikedFoods": to_json_string(req.disliked_foods or []),
        }
    )
    return _profile_to_response(profile)


@router.patch("", response_model=ProfileResponse)
async def update_profile(req: ProfileUpdateRequest, current_user=Depends(get_current_user)):
    """Partially update the user's profile."""
    existing = await prisma.profile.find_unique(where={"userId": current_user.id})
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Create one first.",
        )

    update_data = {}
    if req.name_bn is not None:
        update_data["nameBn"] = req.name_bn
    if req.name_en is not None:
        update_data["nameEn"] = req.name_en
    if req.age is not None:
        update_data["age"] = req.age
    if req.gender is not None:
        update_data["gender"] = req.gender
    if req.weight_kg is not None:
        update_data["weightKg"] = req.weight_kg
    if req.height_cm is not None:
        update_data["heightCm"] = req.height_cm
    if req.activity_level is not None:
        update_data["activityLevel"] = req.activity_level
    if req.goal is not None:
        update_data["goal"] = req.goal
    if req.medical_conditions is not None:
        update_data["medicalConditions"] = to_json_string(req.medical_conditions)
    if req.preferred_foods is not None:
        update_data["preferredFoods"] = to_json_string(req.preferred_foods)
    if req.disliked_foods is not None:
        update_data["dislikedFoods"] = to_json_string(req.disliked_foods)

    profile = await prisma.profile.update(
        where={"userId": current_user.id},
        data=update_data,
    )
    return _profile_to_response(profile)


@router.get("", response_model=ProfileWithTargetsResponse)
async def get_profile(current_user=Depends(get_current_user)):
    """Get the user's profile with calculated nutrition targets."""
    profile = await prisma.profile.find_unique(where={"userId": current_user.id})
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )

    profile_resp = _profile_to_response(profile)
    targets = _calculate_targets_from_profile(profile)

    return ProfileWithTargetsResponse(profile=profile_resp, targets=targets)
