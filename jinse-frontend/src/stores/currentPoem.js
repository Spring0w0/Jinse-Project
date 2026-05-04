import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { getPoemCatalog, getPoemMeta, loadPoemCatalog } from '../services/poemDataService'

const STORAGE_KEY = 'jinse-current-poem-id'
const DEFAULT_POEM_ID = 'jinse'

function createFallbackPoem() {
  return {
    id: DEFAULT_POEM_ID,
    title: '锦瑟',
    author: '李商隐',
    dynasty: '唐',
    stageKey: 'late',
    stageLabel: '',
    yearRange: '',
    summary: '',
    fullText: '',
    heroLines: [],
  }
}

export const useCurrentPoemStore = defineStore('currentPoem', () => {
  const currentPoemId = ref(DEFAULT_POEM_ID)
  const initialized = ref(false)

  const catalog = computed(() => getPoemCatalog())
  const currentPoem = computed(() => getPoemMeta(currentPoemId.value) || createFallbackPoem())

  function initialize() {
    if (initialized.value) {
      return
    }

    if (typeof window !== 'undefined') {
      const storedId = window.localStorage.getItem(STORAGE_KEY)
      if (storedId && catalog.value.some((item) => item.id === storedId)) {
        currentPoemId.value = storedId
      }
    }

    initialized.value = true
    void loadPoemCatalog()
  }

  function setCurrentPoem(poemId) {
    initialize()
    if (!catalog.value.some((item) => item.id === poemId)) {
      return
    }
    currentPoemId.value = poemId
  }

  watch(currentPoemId, (poemId) => {
    if (!initialized.value || typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem(STORAGE_KEY, poemId)
  })

  return {
    catalog,
    currentPoem,
    currentPoemId,
    initialize,
    setCurrentPoem,
  }
})
