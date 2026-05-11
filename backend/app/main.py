"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db import lifespan
from app.routers import auth, profile, health_log, meal_plan, chat, foods, report

app = FastAPI(
    title=settings.app_name,
    description="Personalized AI Nutrition Companion for Bangladeshi People — Backend API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(profile.router, prefix="/profile", tags=["Profile"])
app.include_router(health_log.router, prefix="/health-logs", tags=["Health Log"])
app.include_router(meal_plan.router, prefix="/meal-plans", tags=["Meal Plan"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(foods.router, prefix="/foods", tags=["Foods"])
app.include_router(report.router, prefix="/reports", tags=["Reports"])


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "app": settings.app_name}


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Khadok-Bangla AI API",
        "docs": "/docs",
        "health": "/health",
    }
