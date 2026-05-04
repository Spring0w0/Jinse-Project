"""
数据库初始化模块
使用 Application Factory 模式延迟初始化数据库连接
这样可以在不同的环境中灵活地配置不同的数据库
"""
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

# === 数据库对象 ===
# 这些对象在这里创建但却还未初始化（延迟初始化）
# 需要在 init_app() 中与 Flask 应用关联才能使用

db = SQLAlchemy()
"""
SQLAlchemy ORM 对象
用途：
  - 执行数据库查询和修改操作
  - 管理数据库会话和事务
  - 定义数据模型（models.py 中的所有模型都继承 db.Model）
"""

migrate = Migrate()
"""
Flask-Migrate 迁移管理器
用途：
  - 生成和执行数据库迁移脚本
  - 管理数据库版本控制
  - 与 migrations/ 文件夹配合工作
"""


def init_app(app):
    """
    初始化数据库和迁移工具

    使用延迟初始化的好处：
      1. 支持创建多个 Flask 应用实例（不同配置）
      2. 便于测试（可以用内存数据库进行单元测试）
      3. 避免循环导入问题

    参数：
      app: Flask 应用实例

    调用时机：
      在应用启动时调用，通常在 app.py 中：
        from jinse_backend.db import init_app
        app = Flask(__name__)
        init_app(app)
    """
    # 初始化 SQLAlchemy 连接
    db.init_app(app)

    # 初始化 Flask-Migrate，使其能够管理该数据库的迁移
    migrate.init_app(app, db)

