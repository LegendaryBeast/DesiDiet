"""Chat routes — SSE streaming endpoint."""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from app.dependencies import get_current_user
from app.db import prisma
from app.schemas import ChatRequest
from app.core.llm_client import llm_client
from app.utils import safe_list
from graph_rag_bridge import calculate_targets, KhadokGraphRAG
import json

router = APIRouter()


@router.post("")
async def chat(req: ChatRequest, current_user=Depends(get_current_user)):
    """Stream an AI chat response via SSE. Falls back to template responses if LLM is unavailable."""

    async def event_generator():
        # Load user context
        profile = await prisma.profile.find_unique(where={"userId": current_user.id})
        conditions = safe_list(profile.medicalConditions) if profile else []

        system_msg = (
            "You are Khadok-Bangla AI, a warm Bangladeshi nutrition companion. "
            f"The user has these conditions: {', '.join(conditions)}. "
            "Reply in Bengali when the user speaks Bengali, otherwise in English."
        )

        messages = [
            {"role": "system", "content": system_msg},
            {"role": "user", "content": req.message},
        ]

        try:
            async for token in llm_client.chat_completion_stream(messages):
                yield f"data: {json.dumps({'token': token})}\n\n"
        except Exception:
            # LLM unavailable — return a helpful fallback message
            fallback = (
                "আমি এই মুহূর্তে আপনার প্রশ্নের উত্তর দিতে পারছি না কারণ LLM সেবা বর্তমানে অনুপলব্ধ। "
                "আপনার দৈনিক খাবার পরিকল্পনা পেতে 'Meal Plan' বাটনটি ব্যবহার করতে পারেন। "
                "অথবা আপনার প্রোফিল এবং স্বাস্থ্য লগ দেখতে পারেন।"
                if req.language == "bn"
                else "I am unable to answer your question right now because the LLM service is currently unavailable. "
                   "You can use the 'Meal Plan' feature to get your daily diet plan, or check your profile and health logs."
            )
            for word in fallback.split():
                yield f"data: {json.dumps({'token': word + ' '})}\n\n"

        yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
    )
