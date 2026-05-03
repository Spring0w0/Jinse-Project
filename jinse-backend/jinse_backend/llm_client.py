import os
from functools import lru_cache


def can_use_llm():
    return bool(os.getenv("OPENAI_API_KEY"))


def stream_llm_reply(messages):
    model = _get_model(
        os.getenv("OPENAI_MODEL", "gpt-4.1-mini"),
        os.getenv("OPENAI_BASE_URL") or "",
        float(os.getenv("OPENAI_TEMPERATURE", "0.25")),
        int(os.getenv("OPENAI_MAX_RETRIES", "0")),
        float(os.getenv("OPENAI_TIMEOUT", "20")),
        int(os.getenv("OPENAI_MAX_TOKENS", "320")),
    )

    try:
        for chunk in model.stream(messages):
            text = _extract_text(chunk)
            if text:
                yield text
    except GeneratorExit:
        raise


@lru_cache(maxsize=4)
def _get_model(model_name, base_url, temperature, max_retries, timeout, max_tokens):
    from langchain_openai import ChatOpenAI

    return ChatOpenAI(
        model=model_name,
        base_url=base_url or None,
        temperature=temperature,
        max_retries=max_retries,
        timeout=timeout,
        max_tokens=max_tokens,
        streaming=True,
    )


def _extract_text(chunk):
    content = getattr(chunk, "content", "")

    if isinstance(content, str):
        return content

    if isinstance(content, list):
        parts = []
        for item in content:
            if isinstance(item, str):
                parts.append(item)
            elif isinstance(item, dict):
                text = item.get("text") or item.get("content") or ""
                if text:
                    parts.append(str(text))
        return "".join(parts)

    return str(content or "")
