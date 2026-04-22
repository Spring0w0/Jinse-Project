<template>
  <section class="w-full py-16 sm:py-20">
    <div class="mx-auto w-full max-w-6xl px-4">
      <h1 class="text-center text-3xl font-serif font-bold text-dark sm:text-4xl">
        <span class="inline-block border-b-2 border-primary pb-2">推荐相似诗歌</span>
      </h1>
      <p class="mx-auto mt-4 max-w-3xl text-center leading-8 text-dark/65">
        学完《锦瑟》后，你还可以从主题、情感、意象、典故、风格、时代与作者等不同维度，继续阅读与之相近的诗歌。
      </p>

      <article class="mt-10 rounded-2xl border border-primary/10 bg-white/90 p-8 shadow-lg backdrop-blur-sm">
        <div class="mb-6 flex flex-wrap gap-3">
          <button
            v-for="item in dimensionTabs"
            :key="item.key"
            type="button"
            class="rounded-full px-4 py-2 transition"
            :class="dimension === item.key ? 'bg-primary text-white' : 'bg-primary/10 text-primary hover:bg-primary/20'"
            @click="changeDimension(item.key)"
          >
            {{ item.label }}
          </button>
        </div>

        <div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 class="text-2xl font-serif font-bold text-primary">{{ dimensionLabel }}</h2>
            <p class="mt-2 leading-7 text-dark/65">{{ dimensionIntro }}</p>
          </div>
          <div class="flex items-center gap-3">
            <div class="text-sm text-dark/55">{{ statusText }}</div>
            <button type="button" class="rounded-lg border border-primary px-4 py-2 text-primary transition hover:bg-primary/10" @click="refreshRecommendations">换一组推荐</button>
          </div>
        </div>

        <div class="grid auto-rows-min gap-5 md:grid-cols-2">
          <article
            v-for="item in items"
            :key="item.id"
            class="rounded-2xl border border-primary/10 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div class="mb-3 flex items-start justify-between gap-4">
              <div>
                <div class="text-xl font-serif font-bold text-dark">{{ item.title }}</div>
                <div class="mt-1 text-sm text-dark/55">{{ item.dynasty }} · {{ item.author }}</div>
              </div>
              <span class="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">{{ item.dimension_label }}</span>
            </div>

            <div class="mb-4 rounded-xl border border-primary/10 bg-secondary/25 p-4 leading-7 text-dark/80">{{ item.excerpt }}</div>

            <div class="mb-3">
              <div class="mb-2 text-sm font-semibold text-dark/80">为什么推荐</div>
              <p class="text-sm leading-7 text-dark/70">{{ item.reason }}</p>
            </div>

            <div class="mb-4">
              <div class="mb-2 text-sm font-semibold text-dark/80">延伸阅读提示</div>
              <p class="text-sm leading-7 text-dark/65">{{ item.learning_value }}</p>
            </div>

            <div class="mb-4 flex flex-wrap gap-2">
              <span v-for="tag in displayTags(item)" :key="`${item.id}-${tag}`" class="rounded-full bg-dark/5 px-2.5 py-1 text-xs text-dark/65">{{ tag }}</span>
            </div>

            <div class="mb-3 flex flex-wrap gap-3">
              <button type="button" class="rounded-lg bg-primary px-4 py-2 text-white transition hover:bg-primary/90" @click="toggleDetail(item.id)">
                {{ detailOpen[item.id] ? '收起相似点' : '查看相似点' }}
              </button>
              <button type="button" class="rounded-lg border border-primary px-4 py-2 text-primary transition hover:bg-primary/10" @click="openCompareHint(item)">
                与《锦瑟》对照赏析
              </button>
            </div>

            <div v-if="detailOpen[item.id]" class="rounded-xl border border-primary/10 bg-primary/5 p-4 text-sm text-dark/75">
              <div class="mb-2 font-semibold text-dark/80">与《锦瑟》的相似点</div>
              <ul class="space-y-2 leading-7">
                <li v-for="point in item.similar_points || []" :key="`${item.id}-${point}`">• {{ point }}</li>
              </ul>
              <div class="mt-3 text-dark/65"><span class="font-semibold text-dark/75">对照阅读建议：</span>{{ item.compare_focus }}</div>
            </div>
          </article>

          <div v-if="!items.length" class="col-span-full rounded-xl border border-primary/10 bg-primary/5 p-6 text-dark/70">当前维度暂无推荐结果。</div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { mockApi } from '../mocks/jinseMockApi'

const dimensionTabs = [
  { key: 'theme', label: '主题相似' },
  { key: 'emotion', label: '情感相似' },
  { key: 'imagery', label: '意象相似' },
  { key: 'allusion', label: '典故相似' },
  { key: 'style', label: '风格相似' },
  { key: 'era', label: '同代诗人' },
  { key: 'author', label: '同作者延伸' },
]

const fallbackData = {
  dimension: 'theme',
  dimension_label: '主题相似',
  intro: '从追忆、迷惘、深情难言等主题出发，寻找与《锦瑟》相近的作品。',
  total: 0,
  items: [],
}

const dimension = ref('theme')
const offset = ref(0)
const statusText = ref('正在准备推荐...')
const recommendationData = ref(fallbackData)
const detailOpen = ref({})
const cache = new Map()

const items = computed(() => recommendationData.value.items || [])
const dimensionLabel = computed(() => recommendationData.value.dimension_label || '相似诗歌')
const dimensionIntro = computed(() => recommendationData.value.intro || '')

function displayTags(item) {
  const tags = [...(item.matched_tags || []), ...(item.support_tags || [])]
  return (tags.length ? tags : item.tags || []).slice(0, 4)
}

function toggleDetail(id) {
  detailOpen.value = { ...detailOpen.value, [id]: !detailOpen.value[id] }
}

function openCompareHint(item) {
  const hint = item.compare_focus || `可将《${item.title}》与《锦瑟》从主题和意象上对照阅读。`
  statusText.value = `对照提示：${hint}`
}

async function loadRecommendations(force = false) {
  const key = `${dimension.value}:${offset.value}`
  if (!force && cache.has(key)) {
    recommendationData.value = cache.get(key)
    statusText.value = `当前维度共筛出 ${recommendationData.value.total || 0} 首候选作品`
    return
  }

  statusText.value = '正在匹配相似诗歌...'
  try {
    const data = await mockApi(`/api/recommendations?dimension=${encodeURIComponent(dimension.value)}&offset=${offset.value}&limit=4`)
    cache.set(key, data)
    recommendationData.value = data
    detailOpen.value = {}
    statusText.value = `当前维度共筛出 ${data.total || 0} 首候选作品`
  } catch (error) {
    recommendationData.value = fallbackData
    statusText.value = `推荐加载失败：${error.message}`
  }
}

async function changeDimension(next) {
  dimension.value = next
  offset.value = 0
  await loadRecommendations()
}

async function refreshRecommendations() {
  offset.value += 4
  await loadRecommendations()
}

onMounted(() => {
  loadRecommendations()
})
</script>
