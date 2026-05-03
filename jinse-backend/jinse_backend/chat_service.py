import os
import time

from .llm_client import can_use_llm, stream_llm_reply
from .prompting import build_messages, build_route_scoped_fallback
from .validation import normalize_chat_payload


class ChatPayloadError(ValueError):
    """Raised when the frontend chat payload is missing required fields."""


def stream_chat_reply(payload):
    try:
        normalized = normalize_chat_payload(payload)
    except ValueError as error:
        raise ChatPayloadError(str(error)) from error

    if can_use_llm():
        return _safe_llm_stream(normalized)

    return _fallback_stream(normalized)


def _safe_llm_stream(payload):
    messages = build_messages(payload)

    try:
        yield from stream_llm_reply(messages)
    except GeneratorExit:
        raise
    except Exception:
        yield from _fallback_stream(payload)


def _fallback_stream(payload):
    reply = build_route_scoped_fallback(payload)
    delay = float(os.getenv("JINSE_FALLBACK_STREAM_DELAY", "0.08"))

    for chunk in _split_text(reply, size=3):
        time.sleep(delay)
        yield chunk


def _split_text(text, size=6):
    buffer = ""
    punctuation = set("，。！？；：、“”《》\n")

    for char in text:
        buffer += char
        if len(buffer) >= size or char in punctuation:
            yield buffer
            buffer = ""

    if buffer:
        yield buffer
