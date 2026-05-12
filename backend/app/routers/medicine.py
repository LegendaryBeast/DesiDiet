"""Medicine reminder routes — AI text parsing for medicine schedules."""

import json
from fastapi import APIRouter, Depends, HTTPException, status
from app.db import prisma
from app.dependencies import get_current_user
from app.schemas import (
    MedicineReminderRequest, MedicineReminderResponse, MedicineReminderListItem, MedicineItem
)
from app.core.llm_client import llm_client
from app.utils import safe_list, to_json_string, from_json_string
from typing import List

router = APIRouter()

MEDICINE_SYSTEM_PROMPT = """You are a medical assistant AI. The user will describe their medicine schedule in natural language.
Extract all medicines mentioned and return a structured JSON schedule.

IMPORTANT: Return ONLY valid JSON in this exact structure:
{
  "medicines": [
    {
      "name": "Metformin",
      "dose": "500mg",
      "times": ["08:30", "20:30"],
      "with_food": true,
      "notes": "Take immediately after meals"
    }
  ],
  "confirmation": "A short friendly confirmation message summarizing what was set."
}

Rules:
- Times must be in HH:MM 24-hour format
- "with_food" is true if the user says "after meal", "with food", etc.
- If no specific time given, infer: morning=08:00, afternoon=13:00, evening=18:00, night=21:00, after breakfast=08:30, after lunch=13:30, after dinner=20:30
- Confirmation should be friendly and clear"""


@router.post("", response_model=MedicineReminderResponse)
async def add_medicine_reminder(req: MedicineReminderRequest, current_user=Depends(get_current_user)):
    """Parse a natural language medicine description and save reminders."""

    messages = [
        {"role": "system", "content": MEDICINE_SYSTEM_PROMPT},
        {"role": "user", "content": req.input},
    ]

    raw = await llm_client.chat_completion(
        messages=messages,
        temperature=0.2,
        max_tokens=512,
        response_format={"type": "json_object"},
    )

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI returned invalid JSON. Please try again.",
        )

    medicines = data.get("medicines", [])
    confirmation = data.get("confirmation", "Reminders set successfully.")

    if not medicines:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not extract any medicine information from the input.",
        )

    # Save each medicine as a separate reminder record
    saved_ids = []
    for med in medicines:
        record = await prisma.medicinereminder.create(
            data={
                "userId": current_user.id,
                "name": med.get("name", "Unknown"),
                "dose": med.get("dose", ""),
                "times": to_json_string(med.get("times", [])),
                "withFood": med.get("with_food", False),
                "notes": med.get("notes"),
                "active": True,
            }
        )
        saved_ids.append(record.id)

    # Return using the first saved ID (multi-medicine returns consolidated)
    return MedicineReminderResponse(
        id=saved_ids[0] if saved_ids else "",
        medicines=[MedicineItem(**m) for m in medicines],
        confirmation=confirmation,
    )


@router.get("", response_model=List[MedicineReminderListItem])
async def list_medicine_reminders(current_user=Depends(get_current_user)):
    """Get all active medicine reminders for the current user."""
    records = await prisma.medicinereminder.find_many(
        where={"userId": current_user.id, "active": True},
        order={"createdAt": "asc"},
    )
    return [
        MedicineReminderListItem(
            id=r.id,
            name=r.name,
            dose=r.dose,
            times=safe_list(from_json_string(r.times)),
            with_food=r.withFood,
            notes=r.notes,
            active=r.active,
            created_at=r.createdAt,
        )
        for r in records
    ]


@router.delete("/{reminder_id}")
async def delete_medicine_reminder(reminder_id: str, current_user=Depends(get_current_user)):
    """Soft-delete a medicine reminder (sets active=false)."""
    reminder = await prisma.medicinereminder.find_unique(where={"id": reminder_id})
    if not reminder or reminder.userId != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")

    await prisma.medicinereminder.update(
        where={"id": reminder_id},
        data={"active": False},
    )
    return {"message": "Reminder deleted", "id": reminder_id}
