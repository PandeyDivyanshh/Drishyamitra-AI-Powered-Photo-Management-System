"""Groq-powered NLP interface to convert natural language into structured queries."""

import json
import logging
from typing import Optional

from groq import Groq

from app.config import GROQ_API_KEY

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are Drishyamitra's AI assistant. Your job is to convert the user's
natural-language photo search request into a structured JSON query object.

RULES:
1. Always respond with valid JSON containing two keys:
   - "message": A short, friendly natural-language response to the user.
   - "query": An object with optional filter fields.
2. The "query" object may contain any combination of:
   - "name" (string) — Person's name to search for.
   - "date_from" (string, YYYY-MM-DD) — Start date.
   - "date_to" (string, YYYY-MM-DD) — End date.
   - "action" (string) — One of: "search", "list_all", "count".
3. If the user is just chatting and NOT asking about photos, set "query" to null
   and respond conversationally.
4. Do NOT include any keys outside "message" and "query".

Examples:
User: "Find Ananya's photos from last month"
{"message": "Searching for Ananya's photos from last month!", "query": {"name": "Ananya", "date_from": "2026-02-01", "date_to": "2026-02-28", "action": "search"}}

User: "Show me all photos"
{"message": "Here are all your photos!", "query": {"action": "list_all"}}

User: "Hello!"
{"message": "Hey there! 👋 I'm Drishyamitra, your AI photo assistant. Ask me to find photos by person name or date!", "query": null}
"""


def _get_client() -> Optional[Groq]:
    if not GROQ_API_KEY:
        logger.warning("GROQ_API_KEY is not set – chat features are disabled.")
        return None
    return Groq(api_key=GROQ_API_KEY)


def process_chat(user_message: str) -> tuple[str, Optional[dict]]:
    """
    Send a user message to Groq and parse the structured response.

    Returns:
        (natural_language_response, structured_query_or_None)
    """
    client = _get_client()
    if client is None:
        return (
            "Chat is currently unavailable — the Groq API key is not configured.",
            None,
        )

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            temperature=0.3,
            max_tokens=512,
        )

        raw = completion.choices[0].message.content.strip()

        # Try to parse as JSON
        try:
            parsed = json.loads(raw)
            message = parsed.get("message", raw)
            query = parsed.get("query")
            return message, query
        except json.JSONDecodeError:
            logger.warning("Groq returned non-JSON: %s", raw)
            return raw, None

    except Exception as e:
        logger.error("Groq API error: %s", e)
        return f"Sorry, I encountered an error: {str(e)}", None
