import { reactive } from 'vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

const EMPTY_POEM = {
  id: 'jinse',
  title: '锦瑟',
  author: '李商隐',
  dynasty: '唐',
  stageKey: 'late',
  stageLabel: '',
  yearRange: '',
  summary: '',
  fullText: '',
  heroLines: [],
}

const EMPTY_APPRECIATION = { intro: '', lines: [] }
const EMPTY_QUIZ = { sourceText: '', questions: [] }
const EMPTY_SIMILAR = { intro: '', dimensions: {} }
const EMPTY_AI_IMAGE = { lines: [] }
const EMPTY_TONE = { moduleNote: '', lines: [], coupletSummaries: [] }
const EMPTY_GRAPH = { categories: [], nodes: [], links: [], emotionAnalyses: [] }

const remoteState = reactive({
  catalog: null,
  modules: {},
})

let catalogPromise = null
const modulePromises = new Map()

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

function cloneFallback(value) {
  return JSON.parse(JSON.stringify(value))
}

function getCachedModule(poemId, moduleName) {
  return remoteState.modules[`${poemId}:${moduleName}`] || null
}

function getModuleFallback(moduleName) {
  switch (moduleName) {
    case 'appreciation':
      return cloneFallback(EMPTY_APPRECIATION)
    case 'quiz':
      return cloneFallback(EMPTY_QUIZ)
    case 'similar-poems':
      return cloneFallback(EMPTY_SIMILAR)
    case 'ai-image':
      return cloneFallback(EMPTY_AI_IMAGE)
    case 'tone-analysis':
      return cloneFallback(EMPTY_TONE)
    case 'knowledge-graph':
      return cloneFallback(EMPTY_GRAPH)
    default:
      return null
  }
}

function getPoemFallback() {
  return cloneFallback(EMPTY_POEM)
}

async function loadModule(poemId, moduleName) {
  const key = `${poemId}:${moduleName}`
  if (remoteState.modules[key]) {
    return remoteState.modules[key]
  }
  if (modulePromises.has(key)) {
    return modulePromises.get(key)
  }

  const promise = fetchJson(`/api/poems/${poemId}/${moduleName}`)
    .then((data) => {
      remoteState.modules = { ...remoteState.modules, [key]: data }
      return data
    })
    .finally(() => {
      modulePromises.delete(key)
    })

  modulePromises.set(key, promise)
  return promise
}

export async function loadPoemCatalog() {
  if (remoteState.catalog?.length) {
    return remoteState.catalog
  }
  if (catalogPromise) {
    return catalogPromise
  }

  catalogPromise = fetchJson('/api/poems')
    .then((data) => {
      remoteState.catalog = data
      return data
    })
    .finally(() => {
      catalogPromise = null
    })

  return catalogPromise
}

export function getPoemCatalog() {
  return remoteState.catalog || []
}

export function getPoemMeta(poemId) {
  return getPoemCatalog().find((item) => item.id === poemId) || getPoemFallback()
}

export function getPoemTimeline() {
  return [...getPoemCatalog()].reverse().map((item, index) => ({
    ...item,
    timelineIndex: index,
    side: index % 2 === 0 ? 'left' : 'right',
  }))
}

export function getPoemAppreciation(poemId) {
  return getCachedModule(poemId, 'appreciation') || getModuleFallback('appreciation')
}

export function loadPoemAppreciation(poemId) {
  return loadModule(poemId, 'appreciation')
}

export function getPoemQuiz(poemId) {
  return getCachedModule(poemId, 'quiz') || getModuleFallback('quiz')
}

export function loadPoemQuiz(poemId) {
  return loadModule(poemId, 'quiz')
}

export function getPoemSimilarPoems(poemId) {
  return getCachedModule(poemId, 'similar-poems') || getModuleFallback('similar-poems')
}

export function loadPoemSimilarPoems(poemId) {
  return loadModule(poemId, 'similar-poems')
}

export function getPoemAiImage(poemId) {
  return getCachedModule(poemId, 'ai-image') || getModuleFallback('ai-image')
}

export function loadPoemAiImage(poemId) {
  return loadModule(poemId, 'ai-image')
}

export function getPoemToneAnalysis(poemId) {
  return getCachedModule(poemId, 'tone-analysis') || getModuleFallback('tone-analysis')
}

export function loadPoemToneAnalysis(poemId) {
  return loadModule(poemId, 'tone-analysis')
}

export function getPoemKnowledgeGraph(poemId) {
  return getCachedModule(poemId, 'knowledge-graph') || getModuleFallback('knowledge-graph')
}

export function loadPoemKnowledgeGraph(poemId) {
  return loadModule(poemId, 'knowledge-graph')
}
