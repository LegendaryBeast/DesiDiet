"""Nutrition report routes."""

from fastapi import APIRouter, Depends
from app.dependencies import get_current_user
from app.db import prisma
from app.schemas import NutritionReportResponse, ConditionsReportResponse, SendEmailReportRequest, SendEmailReportResponse
from app.utils import safe_list
from app.core.llm_client import llm_client
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


REPORT_SYSTEM_PROMPT = """You are an AI nutritionist. Write a single paragraph narrative summary of the user's weekly progress.
You will be provided with their weekly calorie averages, macros, weight change, and adherence.
Give them a clear, encouraging, and constructive summary.
Return ONLY valid JSON:
{
  "report_summary": "This week you averaged 1,820kcal / day..."
}"""


@router.post("/send-email", response_model=SendEmailReportResponse)
async def send_email_report(req: SendEmailReportRequest, current_user=Depends(get_current_user)):
    """Generate an AI summary and send the weekly report via email."""
    # Here we would normally aggregate the past week's data. 
    # Simulated context for AI summarization:
    context = "User has averaged 1800kcal this week. Protein 75g. Weight stable. Goal: weight loss. Adherence: 85%."
    
    messages = [
        {"role": "system", "content": REPORT_SYSTEM_PROMPT},
        {"role": "user", "content": context},
    ]

    raw = await llm_client.chat_completion(
        messages=messages,
        temperature=0.4,
        max_tokens=512,
        response_format={"type": "json_object"},
    )
    
    try:
        data = __import__('json').loads(raw)
        report_summary = data.get("report_summary", "Here is your weekly report.")
    except Exception:
        report_summary = "Here is your weekly report."
        
    # TODO: Actual Resend API integration
    # import resend
    # resend.api_key = settings.resend_api_key
    # resend.Emails.send({
    #     "from": "PushtiAI <reports@pushtiai.com>",
    #     "to": req.email,
    #     "subject": "Your Weekly PushtiAI Report",
    #     "html": f"<p>{report_summary}</p>"
    # })
    
    return SendEmailReportResponse(
        message="Email dispatched successfully (simulated).",
        email=req.email,
        report_summary=report_summary
    )
