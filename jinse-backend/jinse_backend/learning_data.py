from sqlalchemy import select

from .db import db
from .models import LearningModule, Poem


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
    poems = db.session.scalars(select(Poem).order_by(Poem.id.asc())).all()
    return [_serialize_poem(poem) for poem in poems]


def get_poem_meta(poem_id):
    poem = _get_poem_or_default(poem_id)
    return _serialize_poem(poem)


def get_poem_timeline():
    catalog = list(reversed(get_poem_catalog()))
    return [
        {
            **item,
            "timelineIndex": index,
            "side": "left" if index % 2 == 0 else "right",
        }
        for index, item in enumerate(catalog)
    ]


def get_learning_module(poem_id, module_name):
    if module_name not in MODULE_MAP:
        raise KeyError(f"unknown module: {module_name}")

    poem = _get_poem_or_default(poem_id)
    module = db.session.scalar(select(LearningModule).filter_by(poem_id=poem.id, name=module_name))

    if module is None and poem.external_id != DEFAULT_POEM_ID:
        default_poem = db.session.scalar(select(Poem).filter_by(external_id=DEFAULT_POEM_ID))
        if default_poem is not None:
            module = db.session.scalar(select(LearningModule).filter_by(poem_id=default_poem.id, name=module_name))

    if module is None:
        raise KeyError(f"module not found: {module_name}")

    return module.data


def _get_poem_or_default(poem_id):
    poem = db.session.scalar(select(Poem).filter_by(external_id=poem_id))
    if poem is not None:
        return poem

    poem = db.session.scalar(select(Poem).filter_by(external_id=DEFAULT_POEM_ID))
    if poem is not None:
        return poem

    poem = db.session.scalar(select(Poem).order_by(Poem.id.asc()))
    if poem is not None:
        return poem

    raise KeyError("no poems found in database")


def _serialize_poem(poem):
    return {
        "id": poem.external_id,
        "title": poem.title,
        "author": poem.author,
        "dynasty": poem.dynasty,
        "stageKey": poem.stage_key,
        "stageLabel": poem.stage_label,
        "yearRange": poem.year_range,
        "summary": poem.summary,
        "fullText": poem.full_text,
        "heroLines": poem.hero_lines or [],
    }
