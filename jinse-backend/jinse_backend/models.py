"""
数据库模型定义模块
本模块使用 SQLAlchemy ORM 定义了应用的核心数据库表结构
包括诗歌信息表和学习模块表
"""
from datetime import UTC, datetime
from .db import db


def utcnow():
    """获取当前 UTC 时间，用作数据库中的时间戳"""
    return datetime.now(UTC)


class Poem(db.Model):
    """
    诗歌表模型
    存储诗歌的完整信息，包括标题、作者、朝代、诗文内容等
    每首诗可以关联多个学习模块
    """
    __tablename__ = "poems"

    # === 主键和外部标识 ===
    id = db.Column(db.Integer, primary_key=True)  # 数据库自增主键
    external_id = db.Column(db.String(128), unique=True, nullable=False, index=True)  # 外部唯一标识符（用于前端引用）

    # === 诗歌基本信息 ===
    title = db.Column(db.String(256), nullable=False, index=True)  # 诗歌标题（建立索引便于快速搜索）
    author = db.Column(db.String(128))  # 诗人名字
    dynasty = db.Column(db.String(64))  # 朝代（如"唐代"、"宋代"）
    stage_key = db.Column(db.String(64))  # 李商隐人生阶段键（如"青年"、"壮年"、"老年"）
    stage_label = db.Column(db.String(128))  # 阶段标签（人生阶段的描述文本）
    year_range = db.Column(db.String(128))  # 年份范围（诗歌创作的年份）

    # === 诗歌内容 ===
    summary = db.Column(db.Text)  # 诗歌摘要或简介
    full_text = db.Column(db.Text)  # 完整诗文
    hero_lines = db.Column(db.JSON)  # JSON 格式存储精选诗句（便于高亮展示）

    # === 时间戳 ===
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow)  # 记录创建对应数据库记录时间
    updated_at = db.Column(db.DateTime(timezone=True), default=utcnow, onupdate=utcnow)  # 记录最后更新时间

    # === 关系 ===
    modules = db.relationship(
        "LearningModule",
        back_populates="poem",
        cascade="all, delete-orphan"  # 当诗歌被删除时，关联的所有学习模块也被级联删除
    )


class LearningModule(db.Model):
    """
    学习模块表模型
    存储每首诗的各类学习模块数据（如基础学习、深度学习、高级学习等）
    与 Poem 表形成一对多关系
    """
    __tablename__ = "learning_modules"

    # === 主键 ===
    id = db.Column(db.Integer, primary_key=True)  # 数据库自增主键

    # === 外键关系 ===
    poem_id = db.Column(
        db.Integer,
        db.ForeignKey("poems.id", ondelete="CASCADE"),
        nullable=False
    )  # 关联到 Poem 表，当诗歌被删除时此模块也被删除

    # === 模块信息 ===
    name = db.Column(db.String(128), nullable=False, index=True)  # 模块名称（如"基础学习"、"深度学习"）
    data = db.Column(db.JSON)  # JSON 格式的模块具体数据内容

    # === 时间戳 ===
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow)  # 创建时间
    updated_at = db.Column(db.DateTime(timezone=True), default=utcnow, onupdate=utcnow)  # 更新时间

    # === 关系 ===
    poem = db.relationship("Poem", back_populates="modules")  # 反向关系引用到 Poem 对象

    # === 约束 ===
    # 同一首诗不能有重复的模块名称（例如不能有两个都叫"基础学习"的模块）
    __table_args__ = (db.UniqueConstraint("poem_id", "name", name="uq_poem_module"),)
