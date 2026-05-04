<template>
  <section class="w-full py-16 sm:py-20">
    <div class="mx-auto w-full max-w-5xl px-4">
      <h1 class="text-center text-3xl font-serif font-bold text-dark sm:text-4xl">
        <span class="inline-block border-b-2 border-primary pb-2">诗句深度赏析</span>
      </h1>

      <article class="mt-12 rounded-2xl border border-primary/10 bg-white/90 p-8 shadow-lg backdrop-blur-sm">
        <h2 class="text-center text-3xl font-serif font-bold text-primary">{{ currentPoem.title }}</h2>
        <p class="mt-2 text-center text-dark/60">{{ currentPoem.dynasty }} · {{ currentPoem.author }}</p>
        <p class="mx-auto mt-6 max-w-3xl text-center leading-8 text-dark/70">{{ appreciationData.intro }}</p>

        <div class="mt-8 grid grid-cols-1 gap-4">
          <button
            v-for="line in poemLines"
            :key="line.id"
            type="button"
            class="rounded-lg px-6 py-5 text-center text-xl font-serif transition sm:text-2xl"
            :class="line.id === selectedLineId
              ? 'bg-primary/10 text-primary shadow-sm'
              : 'text-dark/85 hover:bg-primary/5'"
            @click="selectedLineId = line.id"
          >
            {{ line.displayLine }}
          </button>
        </div>
      </article>

      <article class="mt-12 rounded-2xl border border-primary/10 bg-white/90 p-8 shadow-lg backdrop-blur-sm">
        <h2 class="text-3xl font-serif font-bold text-primary">{{ currentLine.title }}</h2>

        <div class="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <h3 class="text-xl font-serif font-bold text-dark/80">拼音</h3>
            <p class="mt-3 text-lg leading-8 text-dark/70">{{ currentLine.pinyin }}</p>

            <h3 class="mt-8 text-xl font-serif font-bold text-dark/80">重点词语</h3>
            <ul class="mt-3 list-disc space-y-2 pl-5 text-lg leading-8 text-dark/70">
              <li v-for="note in currentLine.notes" :key="note">{{ note }}</li>
            </ul>

            <h3 class="mt-8 text-xl font-serif font-bold text-dark/80">今译</h3>
            <p class="mt-3 text-lg leading-8 text-dark/70">{{ currentLine.translation }}</p>
          </div>

          <div>
            <h3 class="text-xl font-serif font-bold text-dark/80">赏析</h3>
            <p class="mt-3 text-lg leading-8 text-dark/70">{{ currentLine.analysis }}</p>

            <h3 class="mt-8 text-xl font-serif font-bold text-dark/80">情感提示</h3>
            <p class="mt-3 text-lg leading-8 text-dark/70">{{ currentLine.emotion }}</p>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useCurrentPoemStore } from '../stores/currentPoem'
import { getPoemAppreciation, loadPoemAppreciation } from '../services/poemDataService'

const currentPoemStore = useCurrentPoemStore()
const selectedLineId = ref('')

const currentPoem = computed(() => currentPoemStore.currentPoem)
const appreciationData = computed(() => getPoemAppreciation(currentPoemStore.currentPoemId))
const poemLines = computed(() => appreciationData.value.lines || [])

const currentLine = computed(() => {
  return poemLines.value.find((line) => line.id === selectedLineId.value) || poemLines.value[0] || {
    title: '',
    pinyin: '',
    notes: [],
    translation: '',
    analysis: '',
    emotion: '',
  }
})

watch(poemLines, (lines) => {
  selectedLineId.value = lines[0]?.id || ''
}, { immediate: true })

function refreshAppreciation() {
  void loadPoemAppreciation(currentPoemStore.currentPoemId)
}

watch(() => currentPoemStore.currentPoemId, (poemId) => {
  void loadPoemAppreciation(poemId)
}, { immediate: true })

onMounted(() => {
  currentPoemStore.initialize()
  refreshAppreciation()
})
</script>
