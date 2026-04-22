<template>
  <section class="w-full py-16 sm:py-20">
    <div class="mx-auto w-full max-w-5xl px-4">
      <h1 class="text-center text-3xl font-serif font-bold text-dark sm:text-4xl">
        <span class="inline-block border-b-2 border-primary pb-2">AI诗意生图</span>
      </h1>

      <article class="mt-12 rounded-2xl border border-primary/10 bg-white/90 p-8 shadow-lg backdrop-blur-sm">
        <div class="mb-8">
          <h2 class="mb-4 text-xl font-serif font-bold text-dark/80">选择诗句生成图像</h2>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            <button
              v-for="(line, idx) in validLines"
              :key="line.text"
              type="button"
              class="rounded-lg p-4 transition"
              :class="idx === imageIndex ? 'bg-primary/10 text-primary' : 'bg-primary/5 text-dark/80 hover:bg-primary/20'"
              @click="selectLine(idx)"
            >
              {{ line.text }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <h3 class="mb-4 text-xl font-serif font-bold text-dark/80">典故故事</h3>
            <div class="rounded-lg bg-primary/5 p-6">
              <h4 class="mb-2 text-lg font-serif font-bold text-primary">{{ currentLine.text }}</h4>
              <p class="mb-4 text-dark/60">{{ currentLine.pinyin }}</p>
              <div class="text-dark/80 leading-8 whitespace-pre-line">{{ allusionStory }}</div>
            </div>
            <div class="mt-6">
              <button
                type="button"
                class="w-full rounded-lg bg-primary py-4 text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl"
                :disabled="bookLoading"
                @click="loadPictureBook"
              >
                <template v-if="bookLoading">正在加载绘本...</template>
                <template v-else>AI 生成绘本</template>
              </button>
            </div>
          </div>

          <div>
            <h3 class="mb-4 text-xl font-serif font-bold text-dark/80">绘本展示</h3>

            <div class="mb-4 flex items-center justify-between">
              <span class="text-sm text-dark/60">共 {{ totalPages }} 页</span>
              <div class="flex space-x-2">
                <button
                  type="button"
                  class="rounded-lg bg-primary/10 px-4 py-2 text-primary transition hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="!pictureBook || currentPageIndex === 0"
                  @click="goPrev"
                >上一页</button>
                <button
                  type="button"
                  class="rounded-lg bg-primary/10 px-4 py-2 text-primary transition hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="!pictureBook || currentPageIndex >= totalPages - 1"
                  @click="goNext"
                >下一页</button>
              </div>
            </div>

            <div class="relative" style="perspective: 1500px;">
              <div class="relative aspect-[4/3] overflow-hidden rounded-lg bg-white shadow-lg">
                <img v-if="currentPage?.image_url" :src="currentPage.image_url" alt="绘本页面" class="h-full w-full object-contain" />
                <div v-else class="flex h-full flex-col items-center justify-center p-6 text-center text-dark/60">
                  <i class="fa fa-picture-o mb-4 text-6xl text-primary/30" aria-hidden="true"></i>
                  <p v-if="currentPage">第 {{ currentPageIndex + 1 }} 页：{{ currentPage.prompt }}</p>
                  <p v-else>点击“AI 生成绘本”按钮生成画面</p>
                </div>
              </div>

              <div class="mt-4 flex justify-center space-x-2">
                <button
                  v-for="idx in indicatorPages.length"
                  :key="`page-dot-${idx}`"
                  type="button"
                  class="h-3 rounded-full transition"
                  :class="idx - 1 === currentPageIndex ? 'w-6 bg-primary' : 'w-3 bg-primary/30 hover:bg-primary/50'"
                  @click="currentPageIndex = idx - 1"
                ></button>
              </div>
            </div>

            <div class="mt-4 rounded-lg bg-primary/5 p-4">
              <h4 class="mb-1 text-sm font-bold text-dark/80">画面提示</h4>
              <p class="text-sm leading-relaxed text-dark/70">{{ currentPrompt }}</p>
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { mockApi } from '../mocks/jinseMockApi'

const VALID_LINE_TEXTS = [
  '锦瑟无端五十弦',
  '庄生晓梦迷蝴蝶',
  '望帝春心托杜鹃',
  '沧海月明珠有泪',
  '蓝田日暖玉生烟',
]

const fallbackLines = VALID_LINE_TEXTS.map((text) => ({ text, pinyin: '拼音加载中...' }))

const poemLines = ref(fallbackLines)
const imageIndex = ref(0)
const allusionStory = ref('正在加载典故故事...')
const pictureBook = ref(null)
const currentPageIndex = ref(0)
const bookLoading = ref(false)

const validLines = computed(() => poemLines.value.filter((line) => VALID_LINE_TEXTS.includes(line.text)))
const currentLine = computed(() => validLines.value[imageIndex.value] || fallbackLines[0])
const totalPages = computed(() => pictureBook.value?.total_pages || 0)
const currentPage = computed(() => pictureBook.value?.pages?.[currentPageIndex.value] || null)
const indicatorPages = computed(() => pictureBook.value?.pages || [])
const currentPrompt = computed(() => currentPage.value?.prompt || '选择典故后，点击“AI 生成绘本”按钮生成画面。')

async function loadPoemLines() {
  try {
    const poem = await mockApi('/api/poem')
    const lines = (poem.lines || []).filter((item) => VALID_LINE_TEXTS.includes(item.text))
    if (lines.length) {
      poemLines.value = lines
    }
  } catch (error) {
    console.warn('loadPoemLines fallback:', error)
  }
}

async function loadAllusionStory() {
  try {
    const data = await mockApi('/api/allusion-story', {
      body: { line: currentLine.value.text },
    })
    allusionStory.value = data.story || '待补充典故故事内容...'
  } catch (error) {
    allusionStory.value = `加载失败：${error.message}`
  }
}

async function loadPictureBook() {
  if (!currentLine.value?.text) {
    return
  }

  bookLoading.value = true
  try {
    const data = await mockApi('/api/picture-book', {
      body: { line: currentLine.value.text },
    })
    pictureBook.value = data
    currentPageIndex.value = 0
  } catch (error) {
    pictureBook.value = {
      total_pages: 1,
      pages: [{ page_index: 0, prompt: '绘本加载失败，请重试。', image_url: '' }],
    }
  } finally {
    bookLoading.value = false
  }
}

async function selectLine(idx) {
  imageIndex.value = idx
  pictureBook.value = null
  currentPageIndex.value = 0
  await loadAllusionStory()
}

function goPrev() {
  if (currentPageIndex.value > 0) {
    currentPageIndex.value -= 1
  }
}

function goNext() {
  if (currentPageIndex.value < totalPages.value - 1) {
    currentPageIndex.value += 1
  }
}

onMounted(async () => {
  await loadPoemLines()
  await loadAllusionStory()
})
</script>
