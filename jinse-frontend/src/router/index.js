import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
  { path: '/ai-dialogue', name: 'ai-dialogue', component: () => import('../views/AiDialogueView.vue') },
  { path: '/poem-appreciation', name: 'poem-appreciation', component: () => import('../views/PoemAppreciationView.vue') },
  { path: '/tone-analysis', name: 'tone-analysis', component: () => import('../views/ToneAnalysisView.vue') },
  { path: '/ai-image', name: 'ai-image', component: () => import('../views/AiImageView.vue') },
  { path: '/knowledge-graph', name: 'knowledge-graph', component: () => import('../views/KnowledgeGraphView.vue') },
  { path: '/quiz', name: 'quiz', component: () => import('../views/QuizView.vue') },
  { path: '/similar-poems', name: 'similar-poems', component: () => import('../views/SimilarPoemsView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router

