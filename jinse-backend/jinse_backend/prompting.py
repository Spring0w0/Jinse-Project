PAGE_GUIDANCE = {
    "poem-appreciation": "当前页面偏诗句赏析，请优先解释关键词、句意、意象和情绪推进。",
    "tone-analysis": "当前页面偏平仄分析，请优先说明朗读停顿、节奏、声律和情感语势。",
    "ai-image": "当前页面偏诗意生图，请优先说明画面元素、意象组合、色调和氛围。",
    "knowledge-graph": "当前页面偏知识图谱，请优先说明典故、意象、人物、情感之间的关系。",
    "quiz": "当前页面偏课堂小测，请优先帮助判断考点、排除误区，并引导学生自己得出答案。",
    "similar-poems": "当前页面偏相似诗歌，请优先围绕主题、情感、意象、手法做比较。",
    "home": "当前页面是首页，请帮助学生选择学习入口或概览当前诗歌。",
}

SYSTEM_PROMPT = """你是一个古诗词学习助手，服务于李商隐诗歌学习网站。

回答要求：
1. 必须结合当前诗歌、当前页面和必要的历史上下文。
2. 不要把所有问题都写死为《锦瑟》，要根据 poemId / poemTitle 动态适配。
3. 解释清楚但不要冗长，默认控制在 120 字以内，优先用适合中学生学习的语言。
4. 可以承认多义性；没有把握时不要编造作者生平、典故或史实。
5. 问题脱离古诗学习时，简短回应并自然拉回当前诗歌学习场景。
6. 不要输出 Markdown 表格，除非用户明确要求。"""


def build_messages(payload):
    route_context = payload["routeContext"]
    poem_title = route_context.get("poemTitle") or "当前诗歌"
    poem_id = route_context.get("poemId") or "unknown"
    page_label = route_context.get("label") or "当前页面"
    page_name = route_context.get("name") or ""
    page_guidance = PAGE_GUIDANCE.get(page_name, "请优先结合当前页面功能回答。")

    context_prompt = (
        f"当前诗歌：{poem_title}\n"
        f"诗歌 ID：{poem_id}\n"
        f"当前页面：{page_label}（{page_name or 'unknown'}）\n"
        f"页面回答侧重：{page_guidance}"
    )

    messages = [
        ("system", SYSTEM_PROMPT),
        ("system", context_prompt),
    ]

    for item in payload["history"]:
        role = "assistant" if item["role"] == "assistant" else "human"
        messages.append((role, item["content"]))

    messages.append(("human", payload["message"]))
    return messages


def build_route_scoped_fallback(payload):
    route_context = payload["routeContext"]
    message = payload["message"]
    page_name = route_context.get("name") or ""
    page_label = route_context.get("label") or "当前页面"
    poem_title = route_context.get("poemTitle") or "当前这首诗"
    page_guidance = PAGE_GUIDANCE.get(page_name, "我会优先结合当前页面内容回答。")
    history_hint = _history_hint(payload["history"])

    if _contains(message, ("典故", "出处", "借典", "用典")):
        focus = f"可以先判断《{poem_title}》这里是否真的化用了典故，再看典故和诗中情绪之间的关系。"
    elif _contains(message, ("情感", "感情", "情绪", "主旨")):
        focus = f"理解《{poem_title}》的情感时，不必急着压成单一答案，可以从意象组合、语气变化和收束句一起看。"
    elif _contains(message, ("平仄", "声律", "朗读", "节奏", "停顿")):
        focus = f"分析《{poem_title}》的声律时，先看停顿和句尾语势，再联系这种声音效果怎样托住情绪。"
    elif _contains(message, ("意象", "画面", "生图", "图像")):
        focus = f"读《{poem_title}》的意象时，重点是几个画面怎样共同形成氛围，而不是把词语孤立翻译。"
    elif _contains(message, ("测验", "题目", "做题", "答案")):
        focus = f"做《{poem_title}》相关题目时，先分清题目考的是句意、意象、典故、手法还是整体主旨。"
    else:
        focus = f"你问的是“{message}”。可以把问题落到某一句、某个意象或某个考点上，我会更容易给出准确解释。"

    return f"你现在在“{page_label}”页面，当前学习诗歌是《{poem_title}》。{page_guidance}{history_hint}{focus}"


def _contains(text, keywords):
    return any(keyword in text for keyword in keywords)


def _history_hint(history):
    if not history:
        return ""
    last_user_turn = next((item["content"] for item in reversed(history) if item["role"] == "user"), "")
    if not last_user_turn:
        return ""
    return f" 结合前面你提到的“{last_user_turn[:24]}”，"
