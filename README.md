# 锦瑟 Jinse — AI 古诗词沉浸式学习平台

以李商隐诗词为核心，结合 AI 对话、知识图谱、声律分析、诗意生图等功能，构建沉浸式古诗学习体验。

## 技术栈

| 层 | 技术 |
|---|------|
| 前端 | Vue 3 + Vite + Pinia + Vue Router + Tailwind CSS + ECharts |
| 后端 | Python 3 + Flask 3 + LangChain OpenAI |
| 数据库 | PostgreSQL |
| AI | OpenAI 兼容 API（支持任意兼容服务） |

## 项目结构

```
Jinse-Project/
├── jinse-frontend/          # 前端 SPA
│   ├── src/
│   │   ├── views/           # 页面组件（7 个路由页面）
│   │   ├── components/      # 通用组件 + 聊天组件
│   │   ├── services/        # API 调用 + 数据加载
│   │   ├── stores/          # Pinia 状态管理
│   │   ├── mocks/           # 前端离线回退数据
│   │   └── router/          # Vue Router 路由
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── jinse-backend/           # Flask API 后端
│   ├── jinse_backend/       # 后端核心模块
│   ├── data/                # 诗词静态数据（JSON） + 插图图片
│   ├── scripts/             # 数据导入脚本
│   ├── migrations/          # Alembic 数据库迁移
│   ├── tests/               # 测试
│   ├── app.py               # 应用入口
│   └── requirements.txt
└── README.md
```

## 前端

### 环境要求

- Node.js ≥ 18
- npm ≥ 9

### 安装与构建

```bash
cd jinse-frontend

# 安装依赖
npm install

# 开发模式（热更新，默认 http://localhost:5173）
npm run dev

# 生产构建（输出到 dist/）
npm run build

# 预览生产构建
npm run preview
```

### 开发说明

- Vite 开发服务器默认监听 `localhost:5173`
- `/api` 请求通过 Vite proxy 自动转发到后端 `http://127.0.0.1:5001`（配置见 `vite.config.js`）
- 前端内置离线 mock 数据（`src/mocks/`），后端不可用时自动回退，可独立开发 UI
- 路由页面：首页、诗句赏析、声律分析、诗意生图、知识图谱、课堂小测、同主题诗

---

## 数据库

### 环境要求

- PostgreSQL ≥ 14

### 创建 PostgreSQL 数据库

```sql
-- 以 postgres 超级用户执行
CREATE USER jinse_user WITH PASSWORD 'jinse_pass';
CREATE DATABASE jinse_db OWNER jinse_user;
GRANT ALL PRIVILEGES ON DATABASE jinse_db TO jinse_user;
```

### 配置数据库连接

在后端目录创建 `.env` 文件（可参考 `.env.example`）：

```bash
DATABASE_URL=postgresql://jinse_user:jinse_pass@127.0.0.1:5432/jinse_db
```

### 初始化数据库表结构

```bash
cd jinse-backend

# 方式一：Flask-Migrate 自动建表（推荐）
$env:DATABASE_URL = "postgresql://jinse_user:jinse_pass@127.0.0.1:5432/jinse_db"
flask db upgrade

# 方式二：导入脚本自动建表（见下方数据导入）
```

### 导入静态数据

项目预置了 12 首李商隐诗词的完整学习数据（赏析、测验、知识图谱、声律分析、诗意生图等），通过导入脚本写入数据库：

```powershell
cd jinse-backend
$env:DATABASE_URL = "postgresql://jinse_user:jinse_pass@127.0.0.1:5432/jinse_db"
python scripts/import_static_to_db.py
```

脚本行为：
- 默认**清空**现有 `poems` 和 `learning_modules` 表后重新导入
- 使用 `--no-reset` 参数可跳过清空（增量导入）
- 读取 `data/poemCatalog.json`、`data/poemLearningData.json`、`data/poemAdvancedLearningData.json` 三个数据源
- 导入完成后打印验证行数

### 数据库迁移（Schema 变更时使用）

```bash
cd jinse-backend
$env:DATABASE_URL = "postgresql://..."

# 生成迁移脚本
flask db migrate -m "描述本次变更"

# 应用迁移
flask db upgrade
```

---

## 后端

### 环境要求

- Python ≥ 3.10
- pip

### 创建虚拟环境（推荐）

```bash
cd jinse-backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate
```

### 安装依赖

```bash
cd jinse-backend
pip install -r requirements.txt
```

### 配置环境变量

复制 `.env.example` 为 `.env` 并根据实际情况修改：

```bash
# === 必需 ===
DATABASE_URL=postgresql://jinse_user:jinse_pass@127.0.0.1:5432/jinse_db

# === AI 对话功能（可选） ===
OPENAI_API_KEY=your-api-key           # 不设置则使用本地回退模式
OPENAI_MODEL=gpt-4.1-mini
OPENAI_BASE_URL=                      # 留空使用 OpenAI 官方，可填入兼容代理地址
OPENAI_TIMEOUT=60
OPENAI_TEMPERATURE=0.2
OPENAI_MAX_RETRIES=0

# === 服务配置 ===
JINSE_BACKEND_HOST=127.0.0.1
JINSE_BACKEND_PORT=5001
JINSE_CORS_ORIGIN=*                   # 生产环境应设为前端域名
JINSE_FALLBACK_STREAM_DELAY=0.08      # AI 回退模式下的流式延迟（秒）
```

### 启动服务

```bash
cd jinse-backend
python app.py
```

服务默认监听 `http://127.0.0.1:5001`。启动后可访问 `http://127.0.0.1:5001/api/health` 验证。

### API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/poems` | 诗词目录列表 |
| GET | `/api/poems/timeline` | 时间线排序的诗词列表 |
| GET | `/api/poems/<id>` | 单首诗词元数据 |
| GET | `/api/poems/<id>/<module>` | 学习模块数据（见下方模块列表） |
| GET | `/api/pictures/<path>` | 诗意生图插图 |
| POST | `/api/chat` | AI 对话（流式 SSE 响应） |

学习模块名称：`appreciation`、`quiz`、`similar-poems`、`ai-image`、`tone-analysis`、`knowledge-graph`

### AI 对话模式

- 设置了 `OPENAI_API_KEY` → 通过 LangChain 调用 OpenAI 兼容 API，响应会根据用户当前所在页面自动调整系统提示词
- 未设置 `OPENAI_API_KEY` → 使用本地确定性回退模式，返回预设的、针对当前页面上下文定制的回复

---

## 一键启动（开发环境）

```bash
# 终端 1：启动后端
cd jinse-backend
.venv\Scripts\activate
python app.py

# 终端 2：启动前端
cd jinse-frontend
npm run dev
```

浏览器访问 `http://localhost:5173` 即可使用。
