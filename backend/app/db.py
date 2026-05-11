"""Prisma database client singleton and lifespan management."""

from prisma import Prisma
from contextlib import asynccontextmanager
from fastapi import FastAPI

# Global Prisma client instance
prisma = Prisma()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Connect to the database on startup and disconnect on shutdown."""
    await prisma.connect()
    print("✅ Database connected via Prisma")
    yield
    await prisma.disconnect()
    print("✅ Database disconnected")
