# jinse-front

`jinse-front` 是《锦瑟》学习平台的前端工程，基于 Vue 3 + Vite + Tailwind CSS 构建。

当前前端已包含：

- 首页与多模块页面路由
- 声律分析、诗意生图、知识图谱、课堂小测、相似诗歌等页面
- 前端 Mock 数据（便于无后端时演示完整交互）

## 1. 快速开始

```bash
npm install
npm run dev
```

默认使用 Vite 本地开发服务。

## 2. 常用脚本

- `npm run dev`：启动本地开发环境
- `npm run build`：构建生产包
- `npm run preview`：本地预览构建结果

## 3. 目录说明

```text
src/
  components/
	AppNav.vue
  layouts/
	DefaultLayout.vue
  mocks/
	jinseMockApi.js
  router/
	index.js
  stores/
	index.js
  views/
	HomeView.vue
	AiDialogueView.vue
	PoemAppreciationView.vue
	ToneAnalysisView.vue
	AiImageView.vue
	KnowledgeGraphView.vue
	QuizView.vue
	SimilarPoemsView.vue
```

## 4. 样式与构建配置

- Tailwind 配置：`tailwind.config.js`
- PostCSS 配置：`postcss.config.js`
- 全局样式入口：`src/style.css`
- Vite 配置：`vite.config.js`

## 5. AI 对话后端联调说明

本仓库已包含用于全局智能对话组件的一阶段 Flask 后端，路径为 `../jinse-backend/`。

```bash
cd ../jinse-backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export OPENAI_API_KEY="your-api-key"
python app.py
```

前端开发服务已将 `/api` 代理到 `http://127.0.0.1:5001`。如果需要直连其他地址，可设置：

```bash
VITE_CHAT_API_URL=http://127.0.0.1:5001/api/chat npm run dev
```

未配置 `OPENAI_API_KEY` 时，后端仍会返回本地流式兜底回复，便于验证前后端联通、流式输出和停止生成。

## 6. 前端测试后端接口

同时启动后端和前端：

```bash
cd /Users/matterhorn/work/jinse/Jinse-Project
PYTHONPATH=jinse-backend jinse-backend/.venv/bin/python jinse-backend/app.py
```

另开一个终端：

```bash
cd /Users/matterhorn/work/jinse/Jinse-Project/jinse-frontend
npm run dev -- --host 127.0.0.1
```

打开 `http://127.0.0.1:5173/` 后逐页测试：

- 首页：切换诗歌，Network 应出现 `GET /api/poems`
- 诗句赏析：进入页面，Network 应出现 `GET /api/poems/{poemId}/appreciation`
- 平仄分析：Network 应出现 `GET /api/poems/{poemId}/tone-analysis`
- 诗意生图：Network 应出现 `GET /api/poems/{poemId}/ai-image`
- 知识图谱：Network 应出现 `GET /api/poems/{poemId}/knowledge-graph`
- 课堂小测：Network 应出现 `GET /api/poems/{poemId}/quiz`
- 相似诗歌：Network 应出现 `GET /api/poems/{poemId}/similar-poems`
- 右下角聊天：Network 应出现 `POST /api/chat`，回复应实时流式显示

也可以直接用命令冒烟测试：

```bash
curl -sS http://127.0.0.1:5173/api/poems/jinse/appreciation
curl -sS http://127.0.0.1:5173/api/poems/jinse/tone-analysis
curl -sS http://127.0.0.1:5173/api/poems/jinse/ai-image
curl -sS http://127.0.0.1:5173/api/poems/jinse/knowledge-graph
curl -sS http://127.0.0.1:5173/api/poems/jinse/quiz
curl -sS http://127.0.0.1:5173/api/poems/jinse/similar-poems
```

## 7. 其他后端联调说明

历史规划中的完整后端项目路径为 `jinse_flask_backend_v4/`。

常用接口包括：

- `/api/poem`
- `/api/prosody`
- `/api/knowledge-graph`
- `/api/allusion-story`
- `/api/picture-book`
- `/api/quiz/generate`、`/api/quiz/check`、`/api/quiz/submit`
- `/api/recommendations`

如果要改成真实后端联调，可将页面中的 `mockApi` 调用切换为 `fetch`（或统一封装一个可切换的 API 层）。

## 8. Mock 数据说明

Mock 数据集中在：`src/mocks/jinseMockApi.js`。

目前已覆盖以下模块的主要交互：

- 诗意生图：诗句、典故故事、绘本分页
- 知识图谱：节点、连线、节点详情
- 课堂小测：生成题目、单题判题、提交结果
- 相似诗歌：多维度推荐与换一组

建议开发时先用 Mock 保证页面交互完整，再按模块逐步接回后端接口。
