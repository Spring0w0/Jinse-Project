import json
import re
import subprocess
from functools import lru_cache
from pathlib import Path

from .config import BACKEND_DIR


FRONTEND_DIR = BACKEND_DIR.parent / "jinse-frontend"
DEFAULT_POEM_ID = "jinse"

MODULE_MAP = {
    "appreciation": ("basic", "appreciation"),
    "quiz": ("basic", "quiz"),
    "similar-poems": ("basic", "similarPoems"),
    "ai-image": ("advanced", "aiImage"),
    "tone-analysis": ("advanced", "toneAnalysis"),
    "knowledge-graph": ("advanced", "knowledgeGraph"),
}


def get_poem_catalog():
    return _frontend_export("src/mocks/poemCatalog.js", "poemCatalog")


def get_poem_meta(poem_id):
    catalog = get_poem_catalog()
    return next((item for item in catalog if item.get("id") == poem_id), catalog[0])


def get_poem_timeline():
    return [
        {
            **item,
            "timelineIndex": index,
            "side": "left" if index % 2 == 0 else "right",
        }
        for index, item in enumerate(reversed(get_poem_catalog()))
    ]


def get_learning_module(poem_id, module_name):
    dataset_name, key = MODULE_MAP[module_name]
    dataset = _basic_data() if dataset_name == "basic" else _advanced_data()
    poem_data = dataset.get(poem_id) or dataset[DEFAULT_POEM_ID]
    return poem_data[key]


@lru_cache(maxsize=1)
def _basic_data():
    return _frontend_export("src/mocks/poemLearningData.js", "poemLearningData")


@lru_cache(maxsize=1)
def _advanced_data():
    return _frontend_export("src/mocks/poemAdvancedLearningData.js", "poemAdvancedLearningData")


@lru_cache(maxsize=8)
def _frontend_export(relative_path, export_name):
    source_path = FRONTEND_DIR / relative_path
    source = source_path.read_text(encoding="utf-8")
    expression = _extract_export_expression(source, export_name)
    script = f"console.log(JSON.stringify({expression}))"
    result = subprocess.run(
        ["node", "-e", script],
        capture_output=True,
        check=True,
        text=True,
        timeout=10,
    )
    return json.loads(result.stdout)


def _extract_export_expression(source, export_name):
    match = re.search(rf"export\s+const\s+{re.escape(export_name)}\s*=", source)
    if not match:
        raise KeyError(f"export not found: {export_name}")

    index = match.end()
    while index < len(source) and source[index].isspace():
        index += 1

    opener = source[index]
    closer = {"{": "}", "[": "]"}[opener]
    depth = 0
    in_string = None
    escaped = False

    for current_index in range(index, len(source)):
        char = source[current_index]

        if in_string:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == in_string:
                in_string = None
            continue

        if char in ("'", '"', "`"):
            in_string = char
        elif char == opener:
            depth += 1
        elif char == closer:
            depth -= 1
            if depth == 0:
                return source[index:current_index + 1]

    raise ValueError(f"could not parse export: {export_name}")
