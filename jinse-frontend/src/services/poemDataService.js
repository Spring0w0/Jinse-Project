import { reactive } from 'vue'
import { findPoemById, poemCatalog } from '../mocks/poemCatalog'
import { poemAdvancedLearningData } from '../mocks/poemAdvancedLearningData'
import { poemLearningData } from '../mocks/poemLearningData'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const DEFAULT_POEM_ID = 'jinse'

const remoteState = reactive({
  catalog: null,
  modules: {},
})

function apiUrl(path) {
  return `${API_BASE_URL}${path}`
}

async function fetchJson(path) {
  const response = await fetch(apiUrl(path))
  if (!response.ok) {
    throw new Error(`接口请求失败：${response.status}`)
  }
  return response.json()
}

function getCachedModule(poemId, moduleName, fallback) {
  return remoteState.modules[`${poemId}:${moduleName}`] || fallback
}

async function loadModule(poemId, moduleName, fallback) {
  const key = `${poemId}:${moduleName}`
  try {
    const data = await fetchJson(`/api/poems/${poemId}/${moduleName}`)
    remoteState.modules = { ...remoteState.modules, [key]: data }
    return data
  } catch (error) {
    console.warn(`load ${moduleName} failed:`, error)
    return fallback
  }
}

function getPoemModule(poemId) {
  return poemLearningData[poemId] || poemLearningData[DEFAULT_POEM_ID]
}

function getPoemAdvancedModule(poemId) {
  return poemAdvancedLearningData[poemId] || poemAdvancedLearningData[DEFAULT_POEM_ID]
}

export async function loadPoemCatalog() {
  try {
    remoteState.catalog = await fetchJson('/api/poems')
  } catch (error) {
    console.warn('load poem catalog failed:', error)
  }
  return getPoemCatalog()
}

export function getPoemCatalog() {
  return remoteState.catalog || poemCatalog
}

export function getPoemMeta(poemId) {
  return getPoemCatalog().find((item) => item.id === poemId) || findPoemById(poemId)
}

export function getPoemTimeline() {
  return [...getPoemCatalog()].reverse().map((item, index) => ({
    ...item,
    timelineIndex: index,
    side: index % 2 === 0 ? 'left' : 'right',
  }))
}

export function getPoemAppreciation(poemId) {
  return getCachedModule(poemId, 'appreciation', getPoemModule(poemId).appreciation)
}

export function loadPoemAppreciation(poemId) {
  return loadModule(poemId, 'appreciation', getPoemModule(poemId).appreciation)
}

export function getPoemQuiz(poemId) {
  return getCachedModule(poemId, 'quiz', getPoemModule(poemId).quiz)
}

export function loadPoemQuiz(poemId) {
  return loadModule(poemId, 'quiz', getPoemModule(poemId).quiz)
}

export function getPoemSimilarPoems(poemId) {
  return getCachedModule(poemId, 'similar-poems', getPoemModule(poemId).similarPoems)
}

export function loadPoemSimilarPoems(poemId) {
  return loadModule(poemId, 'similar-poems', getPoemModule(poemId).similarPoems)
}

export function getPoemAiImage(poemId) {
  return getCachedModule(poemId, 'ai-image', getPoemAdvancedModule(poemId).aiImage)
}

export function loadPoemAiImage(poemId) {
  return loadModule(poemId, 'ai-image', getPoemAdvancedModule(poemId).aiImage)
}

export function getPoemToneAnalysis(poemId) {
  return getCachedModule(poemId, 'tone-analysis', getPoemAdvancedModule(poemId).toneAnalysis)
}

export function loadPoemToneAnalysis(poemId) {
  return loadModule(poemId, 'tone-analysis', getPoemAdvancedModule(poemId).toneAnalysis)
}

export function getPoemKnowledgeGraph(poemId) {
  return getCachedModule(poemId, 'knowledge-graph', getPoemAdvancedModule(poemId).knowledgeGraph)
}

export function loadPoemKnowledgeGraph(poemId) {
  return loadModule(poemId, 'knowledge-graph', getPoemAdvancedModule(poemId).knowledgeGraph)
}
