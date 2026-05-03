MAX_MESSAGE_LENGTH = 2000
MAX_HISTORY_ITEMS = 12
MAX_HISTORY_CONTENT_LENGTH = 1200


def normalize_chat_payload(payload):
    if not isinstance(payload, dict):
        raise ValueError("请求体必须是 JSON 对象")

    message = _clean_text(payload.get("message"))
    if not message:
        raise ValueError("message 为必填字段")
    if len(message) > MAX_MESSAGE_LENGTH:
        raise ValueError(f"message 不能超过 {MAX_MESSAGE_LENGTH} 个字符")

    route_context = payload.get("routeContext")
    if not isinstance(route_context, dict):
        raise ValueError("routeContext 为必填对象")

    normalized_route_context = {
        "name": _clean_text(route_context.get("name")),
        "path": _clean_text(route_context.get("path")),
        "label": _clean_text(route_context.get("label")),
        "poemId": _clean_text(route_context.get("poemId")),
        "poemTitle": _clean_text(route_context.get("poemTitle")),
    }

    if not normalized_route_context["poemId"] or not normalized_route_context["poemTitle"]:
        raise ValueError("routeContext.poemId 和 routeContext.poemTitle 为必填字段")

    return {
        "message": message,
        "history": _normalize_history(payload.get("history")),
        "routeContext": normalized_route_context,
    }


def _normalize_history(history):
    if history is None:
        return []
    if not isinstance(history, list):
        raise ValueError("history 必须是数组")

    normalized = []
    for item in history[-MAX_HISTORY_ITEMS:]:
        if not isinstance(item, dict):
            continue

        role = _clean_text(item.get("role"))
        content = _clean_text(item.get("content"))
        if role not in ("user", "assistant") or not content:
            continue

        normalized.append({
            "role": role,
            "content": content[:MAX_HISTORY_CONTENT_LENGTH],
        })

    return normalized


def _clean_text(value):
    return str(value or "").strip()
