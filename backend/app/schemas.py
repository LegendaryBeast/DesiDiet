"""Pydantic request/response DTOs."""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal


# ─── Auth ───────────────────────────────────────────────

class RegisterRequest(BaseModel):
    phone: Optional[str] = None
    email: Optional[str] = None
    password: str = Field(..., min_length=6)
    language: str = Field(default="bn")


class LoginRequest(BaseModel):
    identifier: str  # phone or email
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


# ─── Profile ────────────────────────────────────────────

class ProfileCreateRequest(BaseModel):
    name_bn: Optional[str] = None
    name_en: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    activity_level: Optional[str] = None
    goal: Optional[str] = None
    medical_conditions: Optional[List[str]] = None
    preferred_foods: Optional[List[str]] = None
    disliked_foods: Optional[List[str]] = None


class ProfileUpdateRequest(BaseModel):
    name_bn: Optional[str] = None
    name_en: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    activity_level: Optional[str] = None
    goal: Optional[str] = None
    medical_conditions: Optional[List[str]] = None
    preferred_foods: Optional[List[str]] = None
    disliked_foods: Optional[List[str]] = None


class ProfileResponse(BaseModel):
    user_id: str
    name_bn: Optional[str]
    name_en: Optional[str]
    age: Optional[int]
    gender: Optional[str]
    weight_kg: Optional[float]
    height_cm: Optional[float]
    activity_level: Optional[str]
    goal: Optional[str]
    medical_conditions: Optional[List[str]]
    preferred_foods: Optional[List[str]]
    disliked_foods: Optional[List[str]]
    updated_at: datetime

    class Config:
        from_attributes = True


class NutritionTargetsResponse(BaseModel):
    bmi: float
    bmi_category: str
    ideal_body_weight_kg: float
    target_calories: int
    protein_g: int
    carbs_g: int
    fat_g: int
    fiber_g: int
    water_l: float


class ProfileWithTargetsResponse(BaseModel):
    profile: ProfileResponse
    targets: NutritionTargetsResponse


# ─── Health Log ─────────────────────────────────────────

class HealthLogCreateRequest(BaseModel):
    log_date: Optional[datetime] = None
    weight_kg: Optional[float] = None
    blood_pressure: Optional[str] = None
    blood_sugar: Optional[float] = None
    hba1c: Optional[float] = None
    notes: Optional[str] = None
    symptoms: Optional[List[str]] = None


class HealthLogResponse(BaseModel):
    log_id: str
    user_id: str
    log_date: datetime
    weight_kg: Optional[float]
    blood_pressure: Optional[str]
    blood_sugar: Optional[float]
    hba1c: Optional[float]
    notes: Optional[str]
    symptoms: Optional[List[str]]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Meal Plan ──────────────────────────────────────────

class MealPlanResponse(BaseModel):
    plan_id: str
    user_id: str
    plan_date: datetime
    plan_type: str
    plan_data: Dict[str, Any]
    calorie_target: int
    language: str
    feedback: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class MealPlanFeedbackRequest(BaseModel):
    feedback: int = Field(..., ge=1, le=5)


# ─── Chat ───────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    language: str = Field(default="bn")


# ─── Foods ──────────────────────────────────────────────

class FoodSearchResponse(BaseModel):
    code: str
    name_en: str
    name_bn: str
    calories: Optional[float]
    protein: Optional[float]
    food_group: str


class SafeFoodsResponse(BaseModel):
    code: str
    name_en: str
    name_bn: str
    calories: Optional[float]
    protein: Optional[float]
    fiber: Optional[float]
    food_group: str
    preference_score: int


class FoodDetailResponse(BaseModel):
    code: str
    name_en: str
    name_bn: str
    food_group: str
    calories: Optional[float]
    protein: Optional[float]
    fat: Optional[float]
    carbs: Optional[float]
    fiber: Optional[float]
    rules: List[Dict[str, Any]]


# ─── Report ─────────────────────────────────────────────

class NutritionReportResponse(BaseModel):
    user_id: str
    profile: ProfileResponse
    targets: NutritionTargetsResponse
    latest_health_log: Optional[HealthLogResponse]
    applicable_rules: List[Dict[str, Any]]


class ConditionsReportResponse(BaseModel):
    conditions: List[str]
    rules: List[Dict[str, Any]]
