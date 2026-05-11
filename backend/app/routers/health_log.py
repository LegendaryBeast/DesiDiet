"""Health log routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from app.db import prisma
from app.dependencies import get_current_user
from app.schemas import HealthLogCreateRequest, HealthLogResponse
from app.utils import safe_list, to_json_string
from datetime import datetime
from typing import List

router = APIRouter()


def _log_to_response(log) -> HealthLogResponse:
    return HealthLogResponse(
        log_id=log.logId,
        user_id=log.userId,
        log_date=log.logDate,
        weight_kg=log.weightKg,
        blood_pressure=log.bloodPressure,
        blood_sugar=log.bloodSugar,
        hba1c=log.hba1c,
        notes=log.notes,
        symptoms=safe_list(log.symptoms),
        created_at=log.createdAt,
    )


@router.post("", response_model=HealthLogResponse)
async def create_health_log(req: HealthLogCreateRequest, current_user=Depends(get_current_user)):
    """Add a new health log entry."""
    log = await prisma.healthlog.create(
        data={
            "userId": current_user.id,
            "logDate": req.log_date or datetime.now(),
            "weightKg": req.weight_kg,
            "bloodPressure": req.blood_pressure,
            "bloodSugar": req.blood_sugar,
            "hba1c": req.hba1c,
            "notes": req.notes,
            "symptoms": to_json_string(req.symptoms or []),
        }
    )
    return _log_to_response(log)


@router.get("", response_model=List[HealthLogResponse])
async def list_health_logs(limit: int = 30, current_user=Depends(get_current_user)):
    """Get the last N health log entries."""
    logs = await prisma.healthlog.find_many(
        where={"userId": current_user.id},
        order={"logDate": "desc"},
        take=limit,
    )
    return [_log_to_response(log) for log in logs]


@router.get("/trends")
async def get_health_trends(current_user=Depends(get_current_user)):
    """Get weight/BP/sugar trend summary."""
    logs = await prisma.healthlog.find_many(
        where={"userId": current_user.id},
        order={"logDate": "asc"},
        take=30,
    )

    weights = [(log.logDate.isoformat(), log.weightKg) for log in logs if log.weightKg]
    sugars = [(log.logDate.isoformat(), log.bloodSugar) for log in logs if log.bloodSugar]

    latest_weight = weights[-1][1] if weights else None
    first_weight = weights[0][1] if weights else None
    weight_change = round(latest_weight - first_weight, 1) if latest_weight and first_weight else None

    return {
        "weight_trend": {
            "data_points": len(weights),
            "latest_kg": latest_weight,
            "change_kg": weight_change,
            "history": weights,
        },
        "blood_sugar_trend": {
            "data_points": len(sugars),
            "history": sugars,
        },
    }
