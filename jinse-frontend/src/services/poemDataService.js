import { findPoemById, poemCatalog } from '../mocks/poemCatalog'
export { getPoemAppreciation, getPoemQuiz, getPoemSimilarPoems } from './poemModuleService'
export { getPoemAiImage, getPoemToneAnalysis, getPoemKnowledgeGraph } from './poemAdvancedModuleService'

export function getPoemCatalog() {
  return poemCatalog
}

export function getPoemMeta(poemId) {
  return findPoemById(poemId)
}

export function getPoemTimeline() {
  return [...poemCatalog].reverse().map((item, index) => ({
    ...item,
    timelineIndex: index,
    side: index % 2 === 0 ? 'left' : 'right',
  }))
}
