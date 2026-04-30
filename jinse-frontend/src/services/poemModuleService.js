import { poemLearningData } from '../mocks/poemLearningData'

const DEFAULT_POEM_ID = 'jinse'

function getPoemModule(poemId) {
  return poemLearningData[poemId] || poemLearningData[DEFAULT_POEM_ID]
}

export function getPoemAppreciation(poemId) {
  return getPoemModule(poemId).appreciation
}

export function getPoemQuiz(poemId) {
  return getPoemModule(poemId).quiz
}

export function getPoemSimilarPoems(poemId) {
  return getPoemModule(poemId).similarPoems
}
