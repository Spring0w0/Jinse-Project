<template>
  <section class="w-full py-16 sm:py-20">
    <div class="mx-auto w-full max-w-5xl px-4">
      <h1 class="text-center text-3xl font-serif font-bold text-dark sm:text-4xl">
        <span class="inline-block border-b-2 border-primary pb-2">平仄分析</span>
      </h1>

      <article class="mt-12 rounded-2xl border border-primary/10 bg-white/90 p-8 shadow-lg backdrop-blur-sm">
        <div class="mx-auto max-w-3xl text-center">
          <h2 class="text-3xl font-serif font-bold text-primary">{{ currentPoem.title }}</h2>
          <p class="mt-4 leading-8 text-dark/70">{{ toneData.moduleNote }}</p>
        </div>

        <div class="mt-10 space-y-6">
          <div
            v-for="line in toneData.lines"
            :key="line.text"
            class="rounded-2xl border border-primary/10 bg-primary/5 p-6"
          >
            <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div class="text-2xl font-serif font-bold text-primary">{{ line.text }}</div>
                <div class="mt-2 text-sm text-dark/55">停顿建议：{{ line.rhythm }}</div>
                <div class="mt-1 text-sm text-dark/55">平仄概览：{{ line.tonePattern }}</div>
              </div>
            </div>

            <div class="mt-5 grid gap-4 md:grid-cols-2">
              <div class="rounded-xl border border-primary/10 bg-white p-4">
                <div class="mb-2 font-semibold text-dark/80">朗读提示</div>
                <p class="leading-7 text-dark/70">{{ line.readingTip }}</p>
              </div>
              <div class="rounded-xl border border-primary/10 bg-white p-4">
                <div class="mb-2 font-semibold text-dark/80">情绪联动</div>
                <p class="leading-7 text-dark/70">{{ line.emotionLink }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-10 grid gap-4 md:grid-cols-2">
          <div
            v-for="summary in toneData.coupletSummaries"
            :key="summary.range"
            class="rounded-2xl border border-primary/10 bg-white p-5"
          >
            <div class="mb-2 font-semibold text-primary">{{ summary.range }}</div>
            <p class="leading-7 text-dark/70">{{ summary.text }}</p>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { getPoemToneAnalysis, loadPoemToneAnalysis } from '../services/poemDataService'
import { useCurrentPoemStore } from '../stores/currentPoem'

const currentPoemStore = useCurrentPoemStore()

const currentPoem = computed(() => currentPoemStore.currentPoem)
const toneData = computed(() => getPoemToneAnalysis(currentPoemStore.currentPoemId))

function refreshToneAnalysis() {
  void loadPoemToneAnalysis(currentPoemStore.currentPoemId)
}

watch(() => currentPoemStore.currentPoemId, (poemId) => {
  void loadPoemToneAnalysis(poemId)
}, { immediate: true })

onMounted(() => {
  currentPoemStore.initialize()
  refreshToneAnalysis()
})
</script>
