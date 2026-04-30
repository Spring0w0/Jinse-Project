import { poemAdvancedLearningData } from '../mocks/poemAdvancedLearningData'

const DEFAULT_POEM_ID = 'jinse'

function getPoemAdvancedModule(poemId) {
  return poemAdvancedLearningData[poemId] || poemAdvancedLearningData[DEFAULT_POEM_ID]
}

export function getPoemAiImage(poemId) {
  return getPoemAdvancedModule(poemId).aiImage
}

export function getPoemToneAnalysis(poemId) {
  return getPoemAdvancedModule(poemId).toneAnalysis
}

export function getPoemKnowledgeGraph(poemId) {
  return getPoemAdvancedModule(poemId).knowledgeGraph
}
