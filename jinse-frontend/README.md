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

## 5. 后端联调说明

后端项目在同一仓库的 `jinse_flask_backend_v4/`。

常用接口包括：

- `/api/poem`
- `/api/prosody`
- `/api/knowledge-graph`
- `/api/allusion-story`
- `/api/picture-book`
- `/api/quiz/generate`、`/api/quiz/check`、`/api/quiz/submit`
- `/api/recommendations`

如果要改成真实后端联调，可将页面中的 `mockApi` 调用切换为 `fetch`（或统一封装一个可切换的 API 层）。

## 6. Mock 数据说明

Mock 数据集中在：`src/mocks/jinseMockApi.js`。

目前已覆盖以下模块的主要交互：

- 诗意生图：诗句、典故故事、绘本分页
- 知识图谱：节点、连线、节点详情
- 课堂小测：生成题目、单题判题、提交结果
- 相似诗歌：多维度推荐与换一组

建议开发时先用 Mock 保证页面交互完整，再按模块逐步接回后端接口。
