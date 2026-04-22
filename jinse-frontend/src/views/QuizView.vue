<template>
  <section class="w-full py-16 sm:py-20">
    <div class="mx-auto w-full max-w-4xl px-4">
      <h1 class="text-center text-3xl font-serif font-bold text-dark sm:text-4xl">
        <span class="inline-block border-b-2 border-primary pb-2">AI课堂小测</span>
      </h1>

      <article class="mt-12 rounded-2xl border border-primary/10 bg-white/90 p-8 shadow-lg backdrop-blur-sm">
        <div v-if="!resultVisible">
          <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 class="text-xl font-serif font-bold text-primary">《锦瑟》知识测验</h2>
              <p class="mt-1 text-sm text-dark/60">{{ sourceText }}</p>
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
                <h3 class="text-lg font-serif font-bold text-primary">问题 {{ currentIndex + 1 }}/{{ questions.length }}</h3>
                <p class="mt-1 text-xs text-dark/55">知识点：{{ (currentQuestion.knowledge_points || []).join('、') }}</p>
              </div>
              <span class="rounded-full bg-white px-3 py-1 text-xs text-dark/60 border border-primary/10">难度：{{ currentQuestion.difficulty || 'mixed' }}</span>
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

          <div v-if="currentCheckedResult" class="mb-6 rounded-2xl border p-5" :class="currentCheckedResult.correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'">
            <h4 class="text-lg font-bold" :class="currentCheckedResult.correct ? 'text-green-800' : 'text-red-800'">{{ currentCheckedResult.feedback_title }}</h4>
            <div class="mt-3 grid gap-3 text-sm md:grid-cols-2">
              <div class="rounded-xl border border-white/70 bg-white/80 p-4">
                <div class="mb-2 text-dark/60">作答结果</div>
                <p :class="currentCheckedResult.correct ? 'text-green-700' : 'text-red-700'">你的答案：{{ currentCheckedResult.user_answer || '未作答' }}</p>
                <p :class="currentCheckedResult.correct ? 'text-green-700' : 'text-red-700'">正确答案：{{ currentCheckedResult.answer }}</p>
              </div>
              <div class="rounded-xl border border-white/70 bg-white/80 p-4">
                <div class="mb-2 text-dark/60">知识点</div>
                <p class="text-dark/75">{{ (currentCheckedResult.knowledge_points || []).join('、') }}</p>
                <p class="mt-1 text-dark/50">本题用时：{{ currentCheckedResult.time_spent || 0 }}s</p>
              </div>
            </div>
            <ul class="mt-4 space-y-2 rounded-xl border border-white/70 bg-white/85 p-4 text-sm" :class="currentCheckedResult.correct ? 'text-green-700' : 'text-red-700'">
              <li v-for="point in currentCheckedResult.explanation_points || []" :key="point">• {{ point }}</li>
            </ul>
          </div>

          <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <button
              type="button"
              class="rounded-lg bg-primary/10 px-6 py-2 text-primary transition hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="currentIndex === 0"
              @click="prevQuestion"
            >上一题</button>
            <div class="text-sm text-dark/55">先选择答案并提交本题，再进入下一题。</div>
            <button
              type="button"
              class="rounded-lg bg-primary px-6 py-2 text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="actionLoading"
              @click="handleAction"
            >{{ actionLabel }}</button>
          </div>
        </div>

        <div v-else>
          <div class="mb-8 text-center">
            <div class="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-primary/10">
              <span class="text-4xl font-bold text-primary">{{ resultData.score || 0 }}</span>
            </div>
            <h2 class="mb-2 text-2xl font-serif font-bold text-dark/80">测验完成！</h2>
            <p class="text-dark/60">你的得分是 {{ resultData.score || 0 }}/{{ resultData.total || 0 }}</p>
          </div>

          <div class="mb-8 space-y-6 rounded-lg bg-primary/5 p-6">
            <div>
              <h3 class="mb-4 font-bold text-dark/80">成绩概览</h3>
              <div class="grid gap-3 md:grid-cols-4">
                <div v-for="card in summaryCards" :key="card.label" class="rounded-xl border border-primary/15 bg-white p-4">
                  <div class="text-sm text-dark/60">{{ card.label }}</div>
                  <div class="mt-1 text-2xl font-bold text-primary">{{ card.value }}</div>
                </div>
              </div>
            </div>

            <div>
              <h3 class="mb-3 font-bold text-dark/80">知识点掌握情况</h3>
              <div class="space-y-3">
                <div v-for="item in resultData.knowledge_stats || []" :key="item.name">
                  <div class="mb-1 flex justify-between text-sm text-dark/70">
                    <span>{{ item.name }}</span>
                    <span>{{ item.mastery }}% · {{ item.label }}</span>
                  </div>
                  <div class="h-2.5 w-full overflow-hidden rounded-full bg-primary/20">
                    <div class="h-2.5 rounded-full bg-primary" :style="{ width: `${item.mastery}%` }"></div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 class="mb-3 font-bold text-dark/80">AI 学情分析</h3>
              <div class="whitespace-pre-wrap rounded-lg border border-primary/15 bg-white p-4 leading-7 text-dark/70">{{ resultData.analysis_text || '暂无学情分析。' }}</div>
            </div>
          </div>

          <div class="flex justify-center gap-4">
            <button type="button" class="rounded-lg bg-primary px-6 py-3 text-white transition hover:bg-primary/90" @click="generateQuiz">重新测验</button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { mockApi } from '../mocks/jinseMockApi'

const quizSessionId = ref('')
const questions = ref([])
const currentIndex = ref(0)
const userAnswers = ref({})
const checkedResults = ref({})
const quizTimeSpent = ref({})
const resultVisible = ref(false)
const resultData = ref({})
const sourceText = ref('AI 正在准备本轮题目...')
const questionEnterAt = ref(0)
const actionLoading = ref(false)

const currentQuestion = computed(() => questions.value[currentIndex.value] || null)
const currentCheckedResult = computed(() => {
  const qid = currentQuestion.value?.id
  return qid ? checkedResults.value[qid] : null
})
const checkedCount = computed(() => Object.keys(checkedResults.value).length)
const progress = computed(() => (questions.value.length ? (checkedCount.value / questions.value.length) * 100 : 0))

const actionLabel = computed(() => {
  if (!currentQuestion.value) {
    return '加载中...'
  }
  if (!currentCheckedResult.value) {
    return '提交本题'
  }
  if (currentIndex.value < questions.value.length - 1) {
    return '下一题'
  }
  return '查看结果'
})

const summaryCards = computed(() => {
  const summary = resultData.value.time_summary || {}
  return [
    { label: '得分', value: `${summary.score || resultData.value.score || 0}/${summary.total || resultData.value.total || 0}` },
    { label: '正确题数', value: `${summary.correct_count || 0}/${summary.question_count || 0}` },
    { label: '总用时', value: `${summary.total_time || 0}s` },
    { label: '平均每题', value: `${summary.avg_time || 0}s` },
  ]
})

function resetState() {
  currentIndex.value = 0
  userAnswers.value = {}
  checkedResults.value = {}
  quizTimeSpent.value = {}
  resultVisible.value = false
  resultData.value = {}
}

async function generateQuiz() {
  resetState()
  actionLoading.value = true
  try {
    const data = await mockApi('/api/quiz/generate', {
      body: { count: 5, difficulty: 'mixed', source: 'hybrid' },
    })
    quizSessionId.value = data.session_id || ''
    questions.value = data.questions || []
    sourceText.value = data.source === 'bank'
      ? '本轮题目由本地题库随机生成，已避免固定顺序。'
      : '本轮题目已结合大模型与题库生成，题目将保持动态变化。'
  } catch (error) {
    questions.value = []
    sourceText.value = `题目加载失败：${error.message}`
  } finally {
    questionEnterAt.value = Date.now()
    actionLoading.value = false
  }
}

function setAnswer(option) {
  if (!currentQuestion.value) {
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
  if (currentIndex.value > 0) {
    currentIndex.value -= 1
    questionEnterAt.value = Date.now()
  }
}

async function checkCurrentQuestion() {
  if (!currentQuestion.value) {
    return
  }

  const selected = userAnswers.value[currentQuestion.value.id]
  if (!selected) {
    return
  }

  const elapsed = Math.max(0.5, Math.round(((Date.now() - questionEnterAt.value) / 1000) * 100) / 100)
  quizTimeSpent.value = { ...quizTimeSpent.value, [currentQuestion.value.id]: elapsed }
  actionLoading.value = true
  try {
    const result = await mockApi('/api/quiz/check', {
      body: {
        session_id: quizSessionId.value,
        question_id: currentQuestion.value.id,
        answer: selected,
        time_spent: elapsed,
      },
    })
    checkedResults.value = { ...checkedResults.value, [currentQuestion.value.id]: result }
  } catch (error) {
    sourceText.value = `判题失败：${error.message}`
  } finally {
    actionLoading.value = false
  }
}

async function submitQuiz() {
  actionLoading.value = true
  try {
    resultData.value = await mockApi('/api/quiz/submit', {
      body: {
        session_id: quizSessionId.value,
        answers: userAnswers.value,
        time_spent: quizTimeSpent.value,
      },
    })
    resultVisible.value = true
  } catch (error) {
    sourceText.value = `提交失败：${error.message}`
  } finally {
    actionLoading.value = false
  }
}

async function handleAction() {
  if (!currentQuestion.value) {
    return
  }

  if (!currentCheckedResult.value) {
    await checkCurrentQuestion()
    return
  }

  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value += 1
    questionEnterAt.value = Date.now()
    return
  }

  await submitQuiz()
}

onMounted(() => {
  generateQuiz()
})
</script>
