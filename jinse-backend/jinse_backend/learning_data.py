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

# {poem_id: {line_index: [folder_path, ...]}}
# Each folder contains 1.png ~ 4.png
PICTURE_MAP = {
    "jinse": {
        1: ["锦瑟/庄生晓梦"],
        2: ["锦瑟/望帝春心"],
        3: ["锦瑟/鲛人珠泪"],
        4: ["锦瑟/蓝田玉暖"],
    },
    "anding-chenglou": {
        1: ["青年/安定城楼/贾生年少虚垂涕"],
        2: ["青年/安定城楼/王粲春来更远游"],
        3: ["青年/安定城楼/欲回天地入扁舟"],
        4: ["青年/安定城楼/腐鼠成滋味 猜意鹓雏竟未休"],
    },
    "chunri-jihuai": {
        0: ["青年/春日寄怀"],
    },
    "wuti-sasasa-dongfeng": {
        2: [
            "壮年/无题·飒飒东风细雨来/贾氏窥帘韩掾少",
            "壮年/无题·飒飒东风细雨来/宓妃留枕魏王才",
        ],
    },
    "mawei-2": {
        0: ["壮年/马嵬（其二）/海外九州"],
        1: ["壮年/马嵬（其二）/鸡人报晓"],
        3: ["壮年/马嵬（其二）/七夕牵牛"],
        4: ["壮年/马嵬（其二）/卢家莫愁"],
    },
    "suluo-ting": {
        0: ["老年/宿骆氏亭寄怀崔雍崔衮"],
    },
    "lei": {
        1: [
            "老年/泪/湘江竹上",
            "老年/泪/羊祜堕泪碑",
        ],
        2: ["老年/泪/昭君出塞"],
        3: ["老年/泪/霸王别姬、四面楚歌"],
    },
}


def _inject_picture_urls(poem_id, data):
    line_map = PICTURE_MAP.get(poem_id, {})
    if not line_map:
        return data

    lines = data.get("lines", [])
    for line_idx, folders in line_map.items():
        if line_idx >= len(lines):
            continue
        urls = []
        for folder in folders:
            for i in range(1, 5):
                urls.append(f"/api/pictures/{folder}/{i}.png")
        lines[line_idx]["images"] = urls

    return data


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

    data = module.data
    if module_name == "ai-image":
        data = _inject_picture_urls(poem_id, data)
    return data


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
