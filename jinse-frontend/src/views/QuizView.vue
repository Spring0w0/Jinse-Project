<template>
  <section class="w-full py-16 sm:py-20">
    <div class="mx-auto w-full max-w-4xl px-4">
      <h1 class="text-center text-3xl font-serif font-bold text-dark sm:text-4xl">
        <span class="inline-block border-b-2 border-primary pb-2">AI 课堂小测</span>
      </h1>

      <article class="mt-12 rounded-2xl border border-primary/10 bg-white/90 p-8 shadow-lg backdrop-blur-sm">
        <div v-if="!resultVisible">
          <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 class="text-xl font-serif font-bold text-primary">《{{ currentPoem.title }}》知识测验</h2>
              <p class="mt-1 text-sm text-dark/60">{{ quizData.sourceText }}</p>
            </div>
            <div class="flex items-center gap-2 text-sm text-dark/60">
              <span>进度</span>
              <div class="h-2 w-36 overflow-hidden rounded-full bg-primary/20">
                <div class="h-full bg-primary transition-all" :style="{ width: `${progress}%` }"></div>
              </div>
              <span>{{ checkedCount }}/{{ questions.length }}</span>
            </div>
          </div>

          <div v-if="currentQuestion" class="mb-6 rounded-2xl border border-primary/10 bg-primary/5 p-6">
            <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 class="text-lg font-serif font-bold text-primary">第 {{ currentIndex + 1 }} / {{ questions.length }} 题</h3>
                <p class="mt-1 text-xs text-dark/55">知识点：{{ (currentQuestion.knowledgePoints || []).join(' / ') }}</p>
              </div>
              <span class="rounded-full border border-primary/10 bg-white px-3 py-1 text-xs text-dark/60">
                难度：{{ currentQuestion.difficulty || 'mixed' }}
              </span>
            </div>

            <p class="mb-6 text-lg leading-8 text-dark/85">{{ currentQuestion.question }}</p>

            <div class="space-y-3">
              <label
                v-for="option in currentQuestion.options"
                :key="`${currentQuestion.id}-${option}`"
                class="flex items-center rounded-xl border p-4 transition"
                :class="optionClass(option)"
              >
                <input
                  :checked="userAnswers[currentQuestion.id] === option"
                  :disabled="!!checkedResults[currentQuestion.id]"
                  class="mr-3 accent-primary"
                  name="quiz-option"
                  type="radio"
                  @change="setAnswer(option)"
                />
                <span class="text-dark/80">{{ option }}</span>
              </label>
            </div>
          </div>

          <div
            v-if="currentCheckedResult"
            class="mb-6 rounded-2xl border p-5"
            :class="currentCheckedResult.correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'"
          >
            <h4 class="text-lg font-bold" :class="currentCheckedResult.correct ? 'text-green-800' : 'text-red-800'">
              {{ currentCheckedResult.correct ? '回答正确' : '再想一想' }}
            </h4>
            <div class="mt-3 grid gap-3 text-sm md:grid-cols-2">
              <div class="rounded-xl border border-white/70 bg-white/80 p-4">
                <div class="mb-2 text-dark/60">答案对照</div>
                <p :class="currentCheckedResult.correct ? 'text-green-700' : 'text-red-700'">你的答案：{{ currentCheckedResult.userAnswer || '未作答' }}</p>
                <p :class="currentCheckedResult.correct ? 'text-green-700' : 'text-red-700'">正确答案：{{ currentCheckedResult.answer }}</p>
              </div>
              <div class="rounded-xl border border-white/70 bg-white/80 p-4">
                <div class="mb-2 text-dark/60">作答信息</div>
                <p class="text-dark/75">{{ (currentCheckedResult.knowledgePoints || []).join(' / ') }}</p>
                <p class="mt-1 text-dark/50">用时：{{ currentCheckedResult.timeSpent }}s</p>
              </div>
            </div>
            <div class="mt-4 rounded-xl border border-white/70 bg-white/85 p-4 text-sm leading-7 text-dark/75">
              {{ currentCheckedResult.analysis }}
            </div>
          </div>

          <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <button
              type="button"
              class="rounded-lg bg-primary/10 px-6 py-2 text-primary transition hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="currentIndex === 0"
              @click="prevQuestion"
            >
              上一题
            </button>
            <div class="text-sm text-dark/55">先作答，再查看解析；最后一题批改完成后即可提交本轮测验。</div>
            <button
              type="button"
              class="rounded-lg bg-primary px-6 py-2 text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="actionDisabled"
              @click="handleAction"
            >
              {{ actionLabel }}
            </button>
          </div>
        </div>

        <div v-else>
          <div class="mb-8 text-center">
            <div class="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-primary/10">
              <span class="text-4xl font-bold text-primary">{{ scoreSummary.score }}</span>
            </div>
            <h2 class="mb-2 text-2xl font-serif font-bold text-dark/80">本轮测验完成</h2>
            <p class="text-dark/60">总分：{{ scoreSummary.score }}/{{ scoreSummary.total }}</p>
          </div>

          <div class="mb-8 space-y-6 rounded-lg bg-primary/5 p-6">
            <div>
              <h3 class="mb-4 font-bold text-dark/80">结果概览</h3>
              <div class="grid gap-3 md:grid-cols-4">
                <div v-for="card in summaryCards" :key="card.label" class="rounded-xl border border-primary/15 bg-white p-4">
                  <div class="text-sm text-dark/60">{{ card.label }}</div>
                  <div class="mt-1 text-2xl font-bold text-primary">{{ card.value }}</div>
                </div>
              </div>
            </div>

            <div>
              <h3 class="mb-3 font-bold text-dark/80">知识点掌握</h3>
              <div class="space-y-3">
                <div v-for="item in knowledgeStats" :key="item.name">
                  <div class="mb-1 flex justify-between text-sm text-dark/70">
                    <span>{{ item.name }}</span>
                    <span>{{ item.mastery }}%</span>
                  </div>
                  <div class="h-2.5 w-full overflow-hidden rounded-full bg-primary/20">
                    <div class="h-2.5 rounded-full bg-primary" :style="{ width: `${item.mastery}%` }"></div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 class="mb-3 font-bold text-dark/80">AI 学习反馈</h3>
              <div class="whitespace-pre-wrap rounded-lg border border-primary/15 bg-white p-4 leading-7 text-dark/70">{{ analysisText }}</div>
            </div>
          </div>

          <div class="flex justify-center gap-4">
            <button type="button" class="rounded-lg bg-primary px-6 py-3 text-white transition hover:bg-primary/90" @click="resetState">
              重新测验
            </button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { getPoemQuiz } from '../services/poemDataService'
import { useCurrentPoemStore } from '../stores/currentPoem'

const currentPoemStore = useCurrentPoemStore()

const currentIndex = ref(0)
const userAnswers = ref({})
const checkedResults = ref({})
const timeSpent = ref({})
const resultVisible = ref(false)
const questionEnterAt = ref(0)

const currentPoem = computed(() => currentPoemStore.currentPoem)
const quizData = computed(() => getPoemQuiz(currentPoemStore.currentPoemId))
const questions = computed(() => quizData.value.questions || [])
const currentQuestion = computed(() => questions.value[currentIndex.value] || null)
const currentCheckedResult = computed(() => {
  const qid = currentQuestion.value?.id
  return qid ? checkedResults.value[qid] : null
})
const checkedCount = computed(() => Object.keys(checkedResults.value).length)
const progress = computed(() => (questions.value.length ? (checkedCount.value / questions.value.length) * 100 : 0))
const actionDisabled = computed(() => !currentQuestion.value || (!currentCheckedResult.value && !userAnswers.value[currentQuestion.value.id]))

const scoreSummary = computed(() => {
  const total = questions.value.length * 25
  const score = Object.values(checkedResults.value).reduce((sum, item) => sum + (item.correct ? 25 : 0), 0)
  return { score, total }
})

const knowledgeStats = computed(() => {
  const stats = new Map()
  Object.values(checkedResults.value).forEach((result) => {
    ;(result.knowledgePoints || []).forEach((point) => {
      const current = stats.get(point) || { name: point, total: 0, correct: 0 }
      current.total += 1
      if (result.correct) {
        current.correct += 1
      }
      stats.set(point, current)
    })
  })

  return Array.from(stats.values()).map((item) => ({
    name: item.name,
    mastery: item.total ? Math.round((item.correct / item.total) * 100) : 0,
  }))
})

const averageTime = computed(() => {
  const values = Object.values(timeSpent.value)
  if (!values.length) {
    return 0
  }
  return Number((values.reduce((sum, item) => sum + item, 0) / values.length).toFixed(1))
})

const summaryCards = computed(() => [
  { label: '总分', value: `${scoreSummary.value.score}/${scoreSummary.value.total}` },
  { label: '答对题数', value: `${Object.values(checkedResults.value).filter((item) => item.correct).length}/${questions.value.length}` },
  { label: '总用时', value: `${Object.values(timeSpent.value).reduce((sum, item) => sum + item, 0).toFixed(1)}s` },
  { label: '平均用时', value: `${averageTime.value}s` },
])

const analysisText = computed(() => {
  const correctCount = Object.values(checkedResults.value).filter((item) => item.correct).length
  const total = questions.value.length
  const weakPoint = [...knowledgeStats.value].sort((a, b) => a.mastery - b.mastery)[0]
  if (!total) {
    return '当前没有可分析的测验数据。'
  }
  return `你已完成《${currentPoem.value.title}》的本轮测验，共答对 ${correctCount} / ${total} 题。${weakPoint ? `当前最需要回看的知识点是“${weakPoint.name}”。` : ''} 建议先回到对应页面复习，再重新测一轮。`
})

const actionLabel = computed(() => {
  if (!currentQuestion.value) {
    return '暂无题目'
  }
  if (!currentCheckedResult.value) {
    return '提交本题'
  }
  if (currentIndex.value < questions.value.length - 1) {
    return '下一题'
  }
  return '查看结果'
})

function resetState() {
  currentIndex.value = 0
  userAnswers.value = {}
  checkedResults.value = {}
  timeSpent.value = {}
  resultVisible.value = false
  questionEnterAt.value = Date.now()
}

function setAnswer(option) {
  if (!currentQuestion.value || checkedResults.value[currentQuestion.value.id]) {
    return
  }
  userAnswers.value = { ...userAnswers.value, [currentQuestion.value.id]: option }
}

function optionClass(option) {
  if (!currentQuestion.value) {
    return 'border-primary/20 bg-white'
  }

  const selected = userAnswers.value[currentQuestion.value.id] === option
  const checked = currentCheckedResult.value

  if (!checked) {
    return selected ? 'border-primary bg-primary/10' : 'border-primary/20 bg-white hover:bg-primary/5'
  }
  if (option === checked.answer) {
    return 'border-green-400 bg-green-50'
  }
  if (selected && !checked.correct) {
    return 'border-red-300 bg-red-50'
  }
  return 'border-primary/20 bg-white'
}

function prevQuestion() {
  if (currentIndex.value === 0) {
    return
  }
  currentIndex.value -= 1
  questionEnterAt.value = Date.now()
}

function checkCurrentQuestion() {
  if (!currentQuestion.value) {
    return
  }

  const selected = userAnswers.value[currentQuestion.value.id]
  if (!selected) {
    return
  }

  const elapsed = Math.max(0.5, Math.round(((Date.now() - questionEnterAt.value) / 1000) * 10) / 10)
  const correct = selected === currentQuestion.value.answer

  timeSpent.value = { ...timeSpent.value, [currentQuestion.value.id]: elapsed }
  checkedResults.value = {
    ...checkedResults.value,
    [currentQuestion.value.id]: {
      correct,
      userAnswer: selected,
      answer: currentQuestion.value.answer,
      analysis: currentQuestion.value.analysis,
      knowledgePoints: currentQuestion.value.knowledgePoints,
      timeSpent: elapsed,
    },
  }
}

function handleAction() {
  if (!currentQuestion.value) {
    return
  }

  if (!currentCheckedResult.value) {
    checkCurrentQuestion()
    return
  }

  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value += 1
    questionEnterAt.value = Date.now()
    return
  }

  resultVisible.value = true
}

watch(() => currentPoemStore.currentPoemId, () => {
  resetState()
}, { immediate: true })

onMounted(() => {
  currentPoemStore.initialize()
})
</script>
