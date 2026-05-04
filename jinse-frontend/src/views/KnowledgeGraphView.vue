<template>
  <section class="w-full py-16 sm:py-20">
    <div class="mx-auto w-full max-w-6xl px-4">
      <h1 class="text-center text-3xl font-serif font-bold text-dark sm:text-4xl">
        <span class="inline-block border-b-2 border-primary pb-2">知识图谱</span>
      </h1>

      <article class="mt-12 rounded-2xl border border-primary/10 bg-white/90 p-8 shadow-lg backdrop-blur-sm">
        <div class="mb-8">
          <div
            ref="graphContainerRef"
            class="h-[600px] w-full rounded-xl border border-primary/20 bg-gradient-to-br from-gray-50 to-white shadow-inner"
          ></div>
          <p class="mt-3 text-xs text-dark/55">点击图谱节点后，下方会联动显示该节点的背景信息、作用和相关意象。</p>
        </div>

        <div class="mb-8">
          <h2 class="mb-4 text-xl font-serif font-bold text-dark/80">节点类别</h2>
          <div class="flex flex-wrap gap-4">
            <div v-for="item in categoryLegend" :key="item.name" class="flex items-center">
              <span class="mr-2 h-4 w-4 rounded-full" :style="{ backgroundColor: item.color }"></span>
              <span class="text-dark/80">{{ item.name }}</span>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex flex-wrap gap-3">
            <button type="button" class="rounded-lg bg-primary/10 px-4 py-2 text-primary transition hover:bg-primary/20" @click="zoomIn">
              <i class="fa fa-search-plus mr-2"></i>放大
            </button>
            <button type="button" class="rounded-lg bg-primary/10 px-4 py-2 text-primary transition hover:bg-primary/20" @click="zoomOut">
              <i class="fa fa-search-minus mr-2"></i>缩小
            </button>
            <button type="button" class="rounded-lg bg-primary/10 px-4 py-2 text-primary transition hover:bg-primary/20" @click="resetGraph">
              <i class="fa fa-refresh mr-2"></i>重置
            </button>
          </div>
          <div>
            <select
              v-model="selectedNodeName"
              class="rounded-lg border border-primary/30 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">选择节点查看详情</option>
              <option v-for="node in graphData.nodes" :key="`option-${node.name}`" :value="node.name">{{ node.name }}</option>
            </select>
          </div>
        </div>

        <div v-if="selectedNode" class="mt-8">
          <h3 class="mb-4 text-xl font-serif font-bold text-dark/80">节点详情</h3>
          <div class="rounded-lg border border-primary/20 bg-white p-6 shadow">
            <h4 class="mb-2 text-lg font-serif font-bold text-primary">{{ selectedNode.name }}</h4>
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h5 class="mb-2 font-bold text-dark/80">基础说明</h5>
                <p class="mb-4 text-dark/70">{{ selectedNode.info }}</p>
                <h5 class="mb-2 font-bold text-dark/80">来源</h5>
                <p class="text-dark/70">{{ selectedNode.source }}</p>
              </div>
              <div>
                <h5 class="mb-2 font-bold text-dark/80">在作品中的作用</h5>
                <p class="mb-4 text-dark/70">{{ selectedNode.role }}</p>
                <h5 class="mb-2 font-bold text-dark/80">相关意象</h5>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="image in selectedNode.images || []"
                    :key="`${selectedNode.name}-${image}`"
                    class="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                  >
                    {{ image }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      <article class="mt-12 rounded-2xl border border-primary/10 bg-white/90 p-8 shadow-lg backdrop-blur-sm">
        <h2 class="text-center text-3xl font-serif font-bold text-dark">
          <span class="inline-flex items-center gap-2 border-b-2 border-primary pb-2">AI 情感量化分析</span>
        </h2>

        <div class="mt-10">
          <h3 class="mb-4 text-xl font-serif font-bold text-dark/80">选择诗句进行分析</h3>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button
              v-for="item in emotionLines"
              :key="item.line"
              type="button"
              class="rounded-lg border p-4 text-left transition"
              :class="item.line === selectedEmotionLine ? 'border-primary bg-primary/10 text-primary' : 'border-primary/20 bg-primary/5 text-dark/80 hover:bg-primary/10'"
              @click="selectEmotionLine(item.line)"
            >
              {{ item.line }}
            </button>
          </div>
        </div>

        <div class="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
          <div>
            <div class="mb-4 rounded-lg bg-primary/5 p-4">
              <h4 class="mb-2 text-lg font-serif font-bold text-primary">{{ currentEmotion.line }}</h4>
              <p class="leading-7 text-dark/70">{{ currentEmotion.explanation }}</p>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div
                v-for="(dimension, idx) in currentEmotion.dimensions"
                :key="`${dimension}-${idx}`"
                class="rounded-lg border border-primary/20 bg-white p-4"
              >
                <div class="text-sm text-dark/60">{{ dimension }}</div>
                <div class="mt-2 text-3xl font-bold text-primary">{{ emotionScore(idx) }}</div>
              </div>
            </div>
          </div>

          <div class="rounded-lg border border-primary/20 bg-white p-4">
            <div ref="emotionChartRef" class="h-[360px] w-full"></div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { getPoemKnowledgeGraph, loadPoemKnowledgeGraph } from '../services/poemDataService'
import { useCurrentPoemStore } from '../stores/currentPoem'

const currentPoemStore = useCurrentPoemStore()

const categoryColors = ['#CD5C5C', '#483D8B', '#8B4513', '#16A34A', '#EAB308']
const zoom = ref(1)
const graphContainerRef = ref(null)
const emotionChartRef = ref(null)
const selectedNodeName = ref('')
const selectedEmotionLine = ref('')

let chartInstance = null
let emotionChartInstance = null
let resizeHandler = null

const graphData = computed(() => getPoemKnowledgeGraph(currentPoemStore.currentPoemId))
const categoryLegend = computed(() => {
  return (graphData.value.categories || []).map((name, index) => ({
    name,
    color: categoryColors[index] || '#6b7280',
  }))
})
const selectedNode = computed(() => {
  return (graphData.value.nodes || []).find((item) => item.name === selectedNodeName.value) || null
})
const emotionLines = computed(() => graphData.value.emotionAnalyses || [])
const currentEmotion = computed(() => {
  return emotionLines.value.find((item) => item.line === selectedEmotionLine.value) || emotionLines.value[0] || {
    line: '',
    explanation: '',
    dimensions: [],
    scores: [],
  }
})

function refreshKnowledgeGraph() {
  void loadPoemKnowledgeGraph(currentPoemStore.currentPoemId)
}

function buildGraphOption() {
  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255,255,255,0.98)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#374151', fontSize: 13 },
      formatter: (params) => {
        const data = params.data || {}
        return `<div><strong>${data.name || ''}</strong><br/>${data.info || ''}</div>`
      },
    },
    animationDuration: 900,
    series: [
      {
        type: 'graph',
        layout: 'force',
        roam: true,
        draggable: true,
        zoom: zoom.value,
        force: { repulsion: 340, edgeLength: 150, gravity: 0.05 },
        label: {
          show: true,
          position: 'inside',
          color: '#1f2937',
          fontWeight: 600,
          fontSize: 12,
        },
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: [3, 5],
        lineStyle: { color: '#d1d5db', width: 1.2, opacity: 0.7, curveness: 0.12 },
        emphasis: {
          focus: 'adjacency',
          lineStyle: { width: 2.5, color: '#dc2626', opacity: 0.8 },
          label: { fontSize: 14 },
        },
        categories: (graphData.value.categories || []).map((name, idx) => ({
          name,
          itemStyle: { color: categoryColors[idx] || '#6b7280' },
        })),
        data: (graphData.value.nodes || []).map((node) => ({
          ...node,
          itemStyle: {
            color: categoryColors[Number(node.category || 0)] || '#6b7280',
            shadowBlur: 10,
            shadowColor: 'rgba(0,0,0,0.16)',
            borderWidth: 2,
            borderColor: 'rgba(255,255,255,0.88)',
          },
        })),
        links: graphData.value.links || [],
      },
    ],
  }
}

function renderGraph() {
  if (!graphContainerRef.value) {
    return
  }
  if (!chartInstance) {
    chartInstance = echarts.init(graphContainerRef.value)
    chartInstance.on('click', (params) => {
      if (params.dataType === 'node' && params.data?.name) {
        selectedNodeName.value = params.data.name
      }
    })
  }
  chartInstance.setOption(buildGraphOption(), true)
}

function buildEmotionOption() {
  return {
    animationDuration: 700,
    radar: {
      indicator: (currentEmotion.value.dimensions || []).map((name) => ({ name, max: 100 })),
      splitNumber: 5,
      radius: '68%',
      axisName: { color: '#6b7280', fontSize: 14 },
      splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.25)' } },
      splitArea: { areaStyle: { color: ['rgba(255,255,255,0.85)'] } },
      axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.28)' } },
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: (currentEmotion.value.scores || []).map((value) => Math.round(value * 100)),
            areaStyle: { color: 'rgba(139,69,19,0.18)' },
            lineStyle: { color: '#8B4513', width: 3 },
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: { color: '#CD5C5C' },
          },
        ],
      },
    ],
  }
}

function renderEmotionChart() {
  if (!emotionChartRef.value) {
    return
  }
  if (!emotionChartInstance) {
    emotionChartInstance = echarts.init(emotionChartRef.value)
  }
  emotionChartInstance.setOption(buildEmotionOption(), true)
}

function emotionScore(index) {
  return Math.round((currentEmotion.value.scores?.[index] || 0) * 100)
}

function zoomIn() {
  zoom.value = Math.min(2.2, Number((zoom.value + 0.15).toFixed(2)))
  chartInstance?.setOption({ series: [{ zoom: zoom.value }] })
}

function zoomOut() {
  zoom.value = Math.max(0.6, Number((zoom.value - 0.15).toFixed(2)))
  chartInstance?.setOption({ series: [{ zoom: zoom.value }] })
}

function resetGraph() {
  zoom.value = 1
  selectedNodeName.value = ''
  renderGraph()
}

function selectEmotionLine(line) {
  selectedEmotionLine.value = line
}

watch(() => currentPoemStore.currentPoemId, async () => {
  selectedNodeName.value = ''
  selectedEmotionLine.value = emotionLines.value[0]?.line || ''
  void loadPoemKnowledgeGraph(currentPoemStore.currentPoemId)
  await nextTick()
  renderGraph()
  renderEmotionChart()
}, { immediate: true })

watch(selectedNodeName, (name) => {
  if (!chartInstance) {
    return
  }
  chartInstance.dispatchAction({ type: 'downplay', seriesIndex: 0 })
  if (name) {
    const nodeIndex = (graphData.value.nodes || []).findIndex((item) => item.name === name)
    if (nodeIndex >= 0) {
      chartInstance.dispatchAction({ type: 'highlight', seriesIndex: 0, dataIndex: nodeIndex })
    }
  }
})

watch(currentEmotion, async () => {
  await nextTick()
  renderEmotionChart()
})

onMounted(async () => {
  currentPoemStore.initialize()
  refreshKnowledgeGraph()
  await nextTick()
  renderGraph()
  renderEmotionChart()
  resizeHandler = () => {
    chartInstance?.resize()
    emotionChartInstance?.resize()
  }
  window.addEventListener('resize', resizeHandler)
})

onBeforeUnmount(() => {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
  }
  chartInstance?.dispose()
  emotionChartInstance?.dispose()
  chartInstance = null
  emotionChartInstance = null
})
</script>
