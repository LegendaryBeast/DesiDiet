"""Chat routes — SSE streaming endpoint with full user-context RAG."""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from app.dependencies import get_current_user
from app.db import prisma
from app.schemas import ChatRequest, DietPlanChatRequest, DietPlanChatResponse
from app.core.llm_client import llm_client
from app.utils import safe_list
from graph_rag_bridge import calculate_targets, KhadokGraphRAG
import json
from datetime import datetime, timedelta, timezone

from app.services.diet_plan_chat_service import (
    COLLECTION_SYSTEM_PROMPT,
    extract_collected_data,
    generate_plan_from_collected,
)

router = APIRouter()


async def _build_user_context(current_user_id: str) -> str:
    """
    Gather the full personalized context for the AI:
    - Profile + calculated nutrition targets
    - Recent meal tracking logs (7 days)
    - Latest health log (weight, BP, sugar)
    - Today's meal plan (what AI already planned)
    Returns a plain-text context block to inject into the system prompt.
    """
    lines = []

    # ── Profile & Targets ─────────────────────────────────────────────────────
    profile = await prisma.profile.find_unique(where={"userId": current_user_id})
    conditions = safe_list(profile.medicalConditions) if profile else []

    if profile:
        lines.append("=== USER PROFILE ===")
        lines.append(f"Name: {profile.nameBn or profile.nameEn or 'User'}")
        lines.append(f"Age: {profile.age}, Gender: {profile.gender}")
        lines.append(f"Weight: {profile.weightKg}kg, Height: {profile.heightCm}cm")
        lines.append(f"Goal: {profile.goal}")
        lines.append(f"Activity Level: {profile.activityLevel}")
        lines.append(f"Medical Conditions: {', '.join(conditions) if conditions else 'None'}")
        lines.append(f"Preferred Foods: {', '.join(safe_list(profile.preferredFoods)) if profile.preferredFoods else 'No preference'}")
        lines.append(f"Disliked Foods: {', '.join(safe_list(profile.dislikedFoods)) if profile.dislikedFoods else 'None'}")

        if profile.weightKg and profile.heightCm and profile.gender and profile.activityLevel:
            try:
                targets = calculate_targets({
                    "gender": profile.gender,
                    "height_cm": profile.heightCm,
                    "weight_kg": profile.weightKg,
                    "activity_level": profile.activityLevel,
                })
                lines.append(f"\n=== NUTRITION TARGETS (AI-calculated) ===")
                lines.append(f"Daily Calories: {targets['target_calories']} kcal")
                lines.append(f"Protein: {targets['protein_g']}g | Carbs: {targets['carbs_g']}g | Fat: {targets['fat_g']}g")
                lines.append(f"BMI: {targets['bmi']} ({targets.get('bmi_category', '')})")
                lines.append(f"Water: {targets['water_L']}L/day")
            except Exception:
                pass

    # ── Latest Health Log ─────────────────────────────────────────────────────
    health_log = await prisma.healthlog.find_first(
        where={"userId": current_user_id},
        order={"logDate": "desc"},
    )
    if health_log:
        lines.append("\n=== LATEST HEALTH LOG ===")
        if health_log.weightKg:
            lines.append(f"Weight: {health_log.weightKg}kg (logged {health_log.logDate.date()})")
        if health_log.bloodPressure:
            lines.append(f"Blood Pressure: {health_log.bloodPressure}")
        if health_log.bloodSugar:
            lines.append(f"Blood Sugar: {health_log.bloodSugar} mmol/L")
        if health_log.hba1c:
            lines.append(f"HbA1c: {health_log.hba1c}%")
        if health_log.notes:
            lines.append(f"Notes: {health_log.notes}")

    # ── Today's Meal Plan ─────────────────────────────────────────────────────
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_plan = await prisma.mealplan.find_first(
        where={"userId": current_user_id, "planDate": {"gte": today}},
        order={"createdAt": "desc"},
    )
    if today_plan and today_plan.planData:
        try:
            plan_data = json.loads(today_plan.planData) if isinstance(today_plan.planData, str) else today_plan.planData
            completed_slots = []
            if today_plan.completedSlots:
                completed_slots = json.loads(today_plan.completedSlots) if isinstance(today_plan.completedSlots, str) else today_plan.completedSlots
            
            lines.append("\n=== TODAY'S MEAL PLAN ===")
            for meal in plan_data.get("meals", []):
                status = "✅ Eaten" if meal.get("slot") in completed_slots else "⬜ Pending"
                items_text = ", ".join(
                    f"{i.get('name_bn') or i.get('name_en')} ({i.get('calories', '?')} kcal)"
                    for i in meal.get("items", [])
                )
                lines.append(f"[{meal.get('slot_bn') or meal.get('slot')}] {status}: {items_text or 'No items'} (~{meal.get('target_calories', '?')} kcal)")
        except Exception:
            pass

    # ── Recent Meal Tracking Logs (7 days) ────────────────────────────────────
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    recent_logs = await prisma.mealtracking.find_many(
        where={"userId": current_user_id, "loggedAt": {"gte": week_ago}},
        order={"loggedAt": "desc"},
        take=15,
    )
    if recent_logs:
        lines.append("\n=== RECENT MEALS LOGGED (last 7 days) ===")
        for log in recent_logs:
            day = log.loggedAt.strftime("%a %d %b")
            slot = log.mealSlot or "unknown"
            cals = log.totalCalories or 0
            lines.append(f"[{day} · {slot}] {log.inputText[:80]} → {cals} kcal")

    return "\n".join(lines)


@router.post("")
async def chat(req: ChatRequest, current_user=Depends(get_current_user)):
    """Stream an AI chat response via SSE.
    Uses full user context RAG: profile + targets + health log + today's plan + recent meal logs.
    Also supports multi-turn conversation via optional history field.
    """

    async def event_generator():
        # 1. Build rich user context
        user_context = await _build_user_context(current_user.id)

        # 2. Query GraphRAG for food knowledge relevant to the message
        rag = KhadokGraphRAG()
        rag_food_context = ""
        try:
            profile = await prisma.profile.find_unique(where={"userId": current_user.id})
            conditions = safe_list(profile.medicalConditions) if profile else []
            search_results = rag.search_food(req.message)
            if search_results:
                rag_food_context = "\n=== FOOD KNOWLEDGE (from nutrition database) ===\n"
                for food in search_results[:6]:
                    ctx = rag.get_chatbot_context(food["code"], conditions)
                    rag_food_context += f"- {ctx}\n"
        except Exception:
            pass

        # 3. Build system prompt
        system_msg = (
            "You are পুষ্টি এআই (PushtiAI), a warm, knowledgeable, and proactive Bangladeshi nutrition companion. "
            "You have complete access to the user's health profile, medical conditions, nutrition targets, "
            "today's meal plan, and their recent 7-day meal history. Use all of this to give highly personalized, "
            "practical, and compassionate advice.\n\n"
            "IMPORTANT RULES:\n"
            "1. Always reply in Bengali if the user writes in Bengali. Reply in English if they write in English.\n"
            "2. If the user hasn't set up their profile, gently guide them to complete it.\n"
            "3. If the user asks for a meal plan or food suggestions, cross-reference their medical conditions, "
            "recent meal logs, and nutrition targets to give specific, personalized recommendations.\n"
            "4. If no recent meal data exists, ask the user about their preferences interactively.\n"
            "5. For calorie/macro questions, always use their calculated targets from the profile.\n"
            "6. Be proactive — mention if something they ate recently was risky given their conditions.\n"
            "7. Keep responses concise but warm. Use bullet points for lists.\n\n"
            f"=== USER'S COMPLETE CONTEXT ===\n{user_context}\n"
            f"{rag_food_context}"
        )

        # 4. Build message list (supports multi-turn history from client)
        history = getattr(req, "history", []) or []
        messages = [{"role": "system", "content": system_msg}]

        # Re-inject last 10 turns from client-provided history
        for turn in history[-10:]:
            if turn.get("role") in ("user", "assistant") and turn.get("content"):
                messages.append({"role": turn["role"], "content": turn["content"]})

        messages.append({"role": "user", "content": req.message})

        # 5. Stream LLM response
        try:
            async for token in llm_client.chat_completion_stream(messages):
                yield f"data: {json.dumps({'token': token})}\n\n"
        except Exception:
            fallback = (
                "আমি এই মুহূর্তে উত্তর দিতে পারছি না — LLM সেবা সাময়িকভাবে বন্ধ আছে। "
                "আপনার পূর্ববর্তী খাবার পরিকল্পনা দেখতে 'খাবার' ট্যাব ব্যবহার করুন।"
                if req.language == "bn"
                else "LLM service is temporarily unavailable. Check your meal plan tab for today's recommendations."
            )
            for word in fallback.split():
                yield f"data: {json.dumps({'token': word + ' '})}\n\n"

        yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.post("/diet-plan-session")
async def diet_plan_session(req: DietPlanChatRequest, current_user=Depends(get_current_user)):
    """
    Stream an AI chat response specifically for building a diet plan.
    Guided conversation to collect required profile fields, followed by plan generation.
    """

    async def event_generator():
        # 1. Start with the fixed collection system prompt
        messages = [{"role": "system", "content": COLLECTION_SYSTEM_PROMPT}]

        # 2. Add conversation history
        for turn in req.history:
            if turn.get("role") in ("user", "assistant") and turn.get("content"):
                messages.append({"role": turn["role"], "content": turn["content"]})

        # 3. Add current message
        messages.append({"role": "user", "content": req.message})

        # 4. Stream LLM response & capture output to check for completion marker
        full_response = ""
        try:
            async for token in llm_client.chat_completion_stream(messages):
                full_response += token
                # Only stream the token if it's not part of the JSON marker section
                if "##DIET_DATA_COMPLETE##" not in full_response:
                    yield f"data: {json.dumps({'token': token})}\n\n"
        except Exception as e:
            fallback = "দুঃখিত, এই মুহূর্তে উত্তর দিতে পারছি না।" if req.language == "bn" else "Sorry, I can't reply right now."
            yield f"data: {json.dumps({'token': fallback})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"
            return

        # 5. Check if we reached the completion marker
        collected_data = extract_collected_data(full_response)
        
        if collected_data:
            # We have all data! Let's generate the plan
            yield f"data: {json.dumps({'status': 'generating_plan'})}\n\n"
            try:
                plan_result = await generate_plan_from_collected(collected_data, current_user.id, req.language)
                
                # Stream the special plan_ready event
                msg_bn = "আপনার ডায়েট পরিকল্পনা সফলভাবে তৈরি হয়েছে! নিচে আপনার পরিকল্পনাটি দেখুন।"
                msg_en = "Your diet plan has been successfully created! See your plan below."
                
                response_data = DietPlanChatResponse(
                    plan_id=plan_result["plan_id"],
                    plan_data=plan_result["plan_data"],
                    calorie_target=plan_result["calorie_target"],
                    message_bn=msg_bn,
                    message_en=msg_en
                )
                
                yield f"data: {json.dumps({'plan_ready': response_data.model_dump()})}\n\n"
            except Exception as e:
                err_msg = "পরিকল্পনা তৈরি করতে সমস্যা হয়েছে।" if req.language == "bn" else "Failed to generate plan."
                yield f"data: {json.dumps({'error': err_msg})}\n\n"

        yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
