<template>
  <section class="w-full py-16 sm:py-20">
    <div class="mx-auto w-full max-w-6xl px-4">
      <h1 class="text-center text-3xl font-serif font-bold text-dark sm:text-4xl">
        <span class="inline-block border-b-2 border-primary pb-2">推荐相似诗歌</span>
      </h1>
      <p class="mx-auto mt-4 max-w-3xl text-center leading-8 text-dark/65">
        学完《{{ currentPoem.title }}》后，你还可以从主题、情感等不同维度继续延伸阅读，建立李商隐诗歌之间的互文关系。
      </p>

      <article class="mt-10 rounded-2xl border border-primary/10 bg-white/90 p-8 shadow-lg backdrop-blur-sm">
        <div class="mb-6 flex flex-wrap gap-3">
          <button
            v-for="item in dimensionTabs"
            :key="item.key"
            type="button"
            class="rounded-full px-4 py-2 transition"
            :class="dimension === item.key ? 'bg-primary text-white' : 'bg-primary/10 text-primary hover:bg-primary/20'"
            @click="dimension = item.key"
          >
            {{ item.label }}
          </button>
        </div>

        <div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 class="text-2xl font-serif font-bold text-primary">{{ currentDimension.label }}</h2>
            <p class="mt-2 leading-7 text-dark/65">{{ similarData.intro }}</p>
          </div>
          <div class="text-sm text-dark/55">当前学习诗歌：{{ currentPoem.title }}</div>
        </div>

        <div class="grid auto-rows-min gap-5 md:grid-cols-2">
          <article
            v-for="item in currentItems"
            :key="item.id"
            class="rounded-2xl border border-primary/10 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div class="mb-3 flex items-start justify-between gap-4">
              <div>
                <div class="text-xl font-serif font-bold text-dark">{{ item.title }}</div>
                <div class="mt-1 text-sm text-dark/55">{{ item.dynasty }} · {{ item.author }}</div>
              </div>
              <span class="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">{{ currentDimension.label }}</span>
            </div>

            <div class="mb-4 rounded-xl border border-primary/10 bg-secondary/25 p-4 leading-7 text-dark/80">{{ item.excerpt }}</div>

            <div class="mb-3">
              <div class="mb-2 text-sm font-semibold text-dark/80">推荐理由</div>
              <p class="text-sm leading-7 text-dark/70">{{ item.reason }}</p>
            </div>

            <div class="mb-4">
              <div class="mb-2 text-sm font-semibold text-dark/80">学习价值</div>
              <p class="text-sm leading-7 text-dark/65">{{ item.learning_value }}</p>
            </div>

            <div class="mb-4 flex flex-wrap gap-2">
              <span v-for="tag in item.tags || []" :key="`${item.id}-${tag}`" class="rounded-full bg-dark/5 px-2.5 py-1 text-xs text-dark/65">
                {{ tag }}
              </span>
            </div>

            <div class="mb-3 flex flex-wrap gap-3">
              <button
                type="button"
                class="rounded-lg bg-primary px-4 py-2 text-white transition hover:bg-primary/90"
                @click="toggleDetail(item.id)"
              >
                {{ detailOpen[item.id] ? '收起对照分析' : '展开对照分析' }}
              </button>
            </div>

            <div v-if="detailOpen[item.id]" class="rounded-xl border border-primary/10 bg-primary/5 p-4 text-sm text-dark/75">
              <div class="mb-2 font-semibold text-dark/80">与《{{ currentPoem.title }}》的相似点</div>
              <ul class="space-y-2 leading-7">
                <li v-for="point in item.similar_points || []" :key="`${item.id}-${point}`">• {{ point }}</li>
              </ul>
              <div class="mt-3 text-dark/65">
                <span class="font-semibold text-dark/75">对照阅读提示：</span>{{ item.compare_focus }}
              </div>
            </div>
          </article>

          <div v-if="!currentItems.length" class="col-span-full rounded-xl border border-primary/10 bg-primary/5 p-6 text-dark/70">
            当前维度下还没有配置相似诗歌数据。
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { getPoemSimilarPoems, loadPoemSimilarPoems } from '../services/poemDataService'
import { useCurrentPoemStore } from '../stores/currentPoem'

const currentPoemStore = useCurrentPoemStore()
const dimension = ref('theme')
const detailOpen = ref({})

const currentPoem = computed(() => currentPoemStore.currentPoem)
const similarData = computed(() => getPoemSimilarPoems(currentPoemStore.currentPoemId))
const dimensionTabs = computed(() => {
  return Object.entries(similarData.value.dimensions || {}).map(([key, value]) => ({
    key,
    label: value.label,
  }))
})
const currentDimension = computed(() => {
  return similarData.value.dimensions?.[dimension.value] || dimensionTabs.value[0] || { label: '相似诗歌', items: [] }
})
const currentItems = computed(() => {
  return similarData.value.dimensions?.[dimension.value]?.items || []
})

function toggleDetail(id) {
  detailOpen.value = { ...detailOpen.value, [id]: !detailOpen.value[id] }
}

watch(() => currentPoemStore.currentPoemId, () => {
  const firstDimension = dimensionTabs.value[0]?.key || 'theme'
  dimension.value = firstDimension
  detailOpen.value = {}
  loadPoemSimilarPoems(currentPoemStore.currentPoemId)
}, { immediate: true })

onMounted(() => {
  currentPoemStore.initialize()
})
</script>
