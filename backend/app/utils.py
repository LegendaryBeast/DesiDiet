"""Utility helpers for JSON serialization, parsing, etc."""

import json
from typing import Any, Optional, List, Dict


def to_json_string(value: Any) -> Optional[str]:
    """Serialize a Python object to a JSON string for SQLite storage."""
    if value is None:
        return None
    return json.dumps(value, ensure_ascii=False)


def from_json_string(value: Optional[str]) -> Any:
    """Deserialize a JSON string from SQLite back to a Python object."""
    if value is None or value == "":
        return None
    try:
        return json.loads(value)
    except json.JSONDecodeError:
        return value


def safe_list(value: Any) -> List[str]:
    """Ensure value is a list of strings."""
    if value is None:
        return []
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        parsed = from_json_string(value)
        if isinstance(parsed, list):
            return parsed
    return []


def safe_dict(value: Any) -> Dict[str, Any]:
    """Ensure value is a dict."""
    if value is None:
        return {}
    if isinstance(value, dict):
        return value
    if isinstance(value, str):
        parsed = from_json_string(value)
        if isinstance(parsed, dict):
            return parsed
    return {}
