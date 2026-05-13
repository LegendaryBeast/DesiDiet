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
    ai_suggestion_cal: Optional[int]
    user_choice_cal: Optional[int]
    language: str
    feedback: Optional[int]
    completed_slots: List[str] = []
    created_at: datetime

    class Config:
        from_attributes = True

class EditMealPlanRequest(BaseModel):
    plan_data: Dict[str, Any]
    user_choice_cal: int


class MealPlanFeedbackRequest(BaseModel):
    feedback: int = Field(..., ge=1, le=5)


# ─── Chat ───────────────────────────────────────────────

class ChatHistoryItem(BaseModel):
    role: str   # "user" | "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    language: str = Field(default="bn")
    history: List[ChatHistoryItem] = Field(default_factory=list, description="Last N turns for multi-turn context")


class DietPlanChatRequest(BaseModel):
    """Request body for the conversational diet plan session endpoint."""
    message: str
    language: str = Field(default="bn")
    history: List[ChatHistoryItem] = Field(default_factory=list)
    # Already-collected fields from prior turns (merged on frontend)
    collected: Dict[str, Any] = Field(default_factory=dict,
        description="Fields confirmed so far: age, gender, height_cm, weight_kg, activity_level, goal, medical_conditions")


class DietPlanChatResponse(BaseModel):
    """Returned inside the SSE stream as a special event when plan is ready."""
    plan_id: str
    plan_data: Dict[str, Any]
    calorie_target: int
    message_bn: str
    message_en: str


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


# ─── Meal Tracking ──────────────────────────────────────

class MealTrackingRequest(BaseModel):
    input: str = Field(..., description="Natural language description of what was eaten")
    meal_slot: Optional[str] = Field(None, description="breakfast / lunch / dinner / snack")
    language: str = Field(default="en")


class ParsedFoodItem(BaseModel):
    name: str
    amount_g: Optional[float] = None
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float


class MealTrackingResponse(BaseModel):
    id: str
    parsed_items: List[ParsedFoodItem]
    total_calories: int
    macros: Dict[str, float]
    ai_feedback: str
    meal_slot: Optional[str]
    logged_at: datetime


class MealTrackingListItem(BaseModel):
    id: str
    input_text: str
    total_calories: int
    macros: Dict[str, float]
    meal_slot: Optional[str]
    logged_at: datetime


# ─── Mark Meal Slot Complete ─────────────────────────────

class MarkSlotCompleteRequest(BaseModel):
    slot: str = Field(..., description="breakfast / lunch / dinner / snack")
    completed: bool = Field(default=True)


class MarkSlotCompleteResponse(BaseModel):
    plan_id: str
    completed_slots: List[str]
    message: str


# ─── Meal Builder Analyze ────────────────────────────────

class MealBuilderItem(BaseModel):
    food_code: str
    amount_g: float
    name_en: Optional[str] = None
    name_bn: Optional[str] = None


class MealBuilderAnalyzeRequest(BaseModel):
    meal_slot: Optional[str] = None
    items: List[MealBuilderItem]
    replaced_item: Optional[MealBuilderItem] = None
    language: str = Field(default="en")


class MealBuilderAnalyzeResponse(BaseModel):
    total_calories: int
    macros: Dict[str, float]
    vs_plan_target: Dict[str, Any]
    condition_safety: Dict[str, Any]
    ai_insight: str
    comparison: Optional[Dict[str, Any]] = None
    meal_score: Dict[str, Any]


# ─── Food Search With Insight ────────────────────────────

class FoodWithInsightResponse(BaseModel):
    code: str
    name_en: str
    name_bn: str
    calories: Optional[float]
    protein: Optional[float]
    fiber: Optional[float]
    fat: Optional[float]
    carbs: Optional[float]
    food_group: str
    safety: str              # "safe" | "caution" | "avoid"
    ai_insight: str          # 1-line personalized insight


# ─── Medicine Reminders ──────────────────────────────────

class MedicineReminderRequest(BaseModel):
    input: str = Field(..., description="Natural language medicine schedule")
    language: str = Field(default="en")


class MedicineItem(BaseModel):
    name: str
    dose: str
    times: List[str]
    with_food: bool
    notes: Optional[str] = None


class MedicineReminderResponse(BaseModel):
    id: str
    medicines: List[MedicineItem]
    confirmation: str


class MedicineReminderListItem(BaseModel):
    id: str
    name: str
    dose: str
    times: List[str]
    with_food: bool
    notes: Optional[str]
    active: bool
    created_at: datetime


# ─── Email Report ────────────────────────────────────────

class SendEmailReportRequest(BaseModel):
    email: str
    language: str = Field(default="en")


class SendEmailReportResponse(BaseModel):
    message: str
    email: str
    report_summary: str

