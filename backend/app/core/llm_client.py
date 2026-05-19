"""Async LLM client with automatic fallback between primary and secondary providers.

Primary:  OpenRouter (minimax/minimax-01) — user-provided key
Fallback: Groq (llama-3.3-70b-versatile) — existing working key
"""

from typing import AsyncIterator, List, Dict, Any, Optional
from openai import AsyncOpenAI
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# OpenRouter requires these headers for proper routing and ranking
_OPENROUTER_HEADERS = {
    "HTTP-Referer": "https://desidiet.ai",
    "X-Title": "DesiDiet AI",
}


class LLMClient:
    """Unified async LLM client with automatic provider fallback."""

    def __init__(self):
        # Primary provider (OpenRouter)
        primary_headers = {}
        if "openrouter" in settings.llm_base_url.lower():
            primary_headers = _OPENROUTER_HEADERS.copy()

        self.primary = AsyncOpenAI(
            api_key=settings.llm_api_key,
            base_url=settings.llm_base_url,
            default_headers=primary_headers,
        )
        self.primary_model = settings.llm_model

        # Fallback provider (Groq)
        self.fallback = AsyncOpenAI(
            api_key=settings.llm_fallback_api_key,
            base_url=settings.llm_fallback_base_url,
        )
        self.fallback_model = settings.llm_fallback_model

    async def _try_primary(
        self,
        messages: List[Dict[str, str]],
        temperature: float,
        max_tokens: int,
        response_format: Optional[Dict[str, str]] = None,
        stream: bool = False,
    ):
        """Attempt request on primary provider."""
        kwargs = {
            "model": self.primary_model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": stream,
        }
        if response_format:
            kwargs["response_format"] = response_format
        return await self.primary.chat.completions.create(**kwargs)

    async def _try_fallback(
        self,
        messages: List[Dict[str, str]],
        temperature: float,
        max_tokens: int,
        response_format: Optional[Dict[str, str]] = None,
        stream: bool = False,
    ):
        """Attempt request on fallback provider."""
        kwargs = {
            "model": self.fallback_model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": stream,
        }
        if response_format:
            kwargs["response_format"] = response_format
        return await self.fallback.chat.completions.create(**kwargs)

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 2048,
        response_format: Optional[Dict[str, str]] = None,
    ) -> str:
        """Non-streaming chat completion with automatic fallback."""
        # Try primary
        try:
            response = await self._try_primary(
                messages, temperature, max_tokens, response_format, stream=False
            )
            return response.choices[0].message.content or ""
        except Exception as e:
            logger.warning(f"Primary LLM ({self.primary_model}) failed: {e}. Trying fallback...")

        # Try fallback
        try:
            response = await self._try_fallback(
                messages, temperature, max_tokens, response_format, stream=False
            )
            return response.choices[0].message.content or ""
        except Exception as e:
            logger.error(f"Fallback LLM ({self.fallback_model}) also failed: {e}")
            raise

    async def chat_completion_stream(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ) -> AsyncIterator[str]:
        """Streaming chat completion with automatic fallback.

        Since we can't retry a stream mid-flight, we try primary first.
        If it fails immediately, we yield from fallback.
        """
        primary_failed = False
        try:
            stream = await self._try_primary(
                messages, temperature, max_tokens, stream=True
            )
            async for chunk in stream:
                content = chunk.choices[0].delta.content
                if content:
                    yield content
            return
        except Exception as e:
            logger.warning(f"Primary LLM ({self.primary_model}) stream failed: {e}. Falling back...")
            primary_failed = True

        if primary_failed:
            try:
                stream = await self._try_fallback(
                    messages, temperature, max_tokens, stream=True
                )
                async for chunk in stream:
                    content = chunk.choices[0].delta.content
                    if content:
                        yield content
            except Exception as e:
                logger.error(f"Fallback LLM ({self.fallback_model}) stream also failed: {e}")
                raise


# Singleton instance
llm_client = LLMClient()
