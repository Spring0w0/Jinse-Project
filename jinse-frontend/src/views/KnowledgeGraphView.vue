<template>
  <section class="w-full py-16 sm:py-20">
    <div class="mx-auto w-full max-w-6xl px-4">
      <h1 class="text-center text-3xl font-serif font-bold text-dark sm:text-4xl">
        <span class="inline-block border-b-2 border-primary pb-2">诗词知识图谱</span>
      </h1>

      <article class="mt-12 rounded-2xl border border-primary/10 bg-white/90 p-8 shadow-lg backdrop-blur-sm">
        <div class="mb-8">
          <div
            ref="graphContainerRef"
            class="h-[600px] w-full rounded-xl border border-primary/20 bg-gradient-to-br from-gray-50 to-white shadow-inner"
          ></div>
          <p class="mt-3 text-xs text-dark/55">提示：图中节点可拖动，可滚轮缩放，可拖动画布平移。</p>
        </div>

        <div class="mb-8">
          <h2 class="mb-4 text-xl font-serif font-bold text-dark/80">节点类型</h2>
          <div class="flex flex-wrap gap-4">
            <div v-for="item in categoryLegend" :key="item.name" class="flex items-center">
              <span class="mr-2 h-4 w-4 rounded-full" :style="{ backgroundColor: item.color }"></span>
              <span class="text-dark/80">{{ item.name }}</span>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex flex-wrap gap-3">
            <button type="button" class="rounded-lg bg-primary/10 px-4 py-2 text-primary transition hover:bg-primary/20" @click="zoomIn"><i class="fa fa-search-plus mr-2"></i>放大</button>
            <button type="button" class="rounded-lg bg-primary/10 px-4 py-2 text-primary transition hover:bg-primary/20" @click="zoomOut"><i class="fa fa-search-minus mr-2"></i>缩小</button>
            <button type="button" class="rounded-lg bg-primary/10 px-4 py-2 text-primary transition hover:bg-primary/20" @click="resetGraph"><i class="fa fa-refresh mr-2"></i>重置</button>
          </div>
          <div>
            <select
              v-model="selectedNodeName"
              class="rounded-lg border border-primary/30 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">选择节点查看详情</option>
              <option v-for="node in graph.nodes" :key="`option-${node.name}`" :value="node.name">{{ node.name }}</option>
            </select>
          </div>
        </div>

        <div v-if="selectedNode" class="mt-8">
          <h3 class="mb-4 text-xl font-serif font-bold text-dark/80">节点详情</h3>
          <div class="rounded-lg border border-primary/20 bg-white p-6 shadow">
            <h4 class="mb-2 text-lg font-serif font-bold text-primary">{{ selectedNode.name }}</h4>
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h5 class="mb-2 font-bold text-dark/80">基本信息</h5>
                <p class="mb-4 text-dark/70">{{ selectedNode.info || selectedNode.value || '暂无说明。' }}</p>
                <h5 class="mb-2 font-bold text-dark/80">相关典故</h5>
                <p class="text-dark/70">{{ selectedNode.source || '暂无出处信息。' }}</p>
              </div>
              <div>
                <h5 class="mb-2 font-bold text-dark/80">在诗中的作用</h5>
                <p class="mb-4 text-dark/70">{{ selectedNode.role || '暂无角色说明。' }}</p>
                <h5 class="mb-2 font-bold text-dark/80">相关意象</h5>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="image in selectedNode.images || []"
                    :key="`${selectedNode.name}-${image}`"
                    class="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                  >
                    {{ image }}
                  </span>
                  <span v-if="!(selectedNode.images || []).length" class="text-dark/60">暂无关联意象。</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      <article class="mt-12 rounded-2xl border border-primary/10 bg-white/90 p-8 shadow-lg backdrop-blur-sm">
        <h2 class="text-center text-3xl font-serif font-bold text-dark">
          <span class="inline-flex items-center gap-2 border-b-2 border-primary pb-2">AI情感量化分析</span>
        </h2>

        <div class="mt-10">
          <h3 class="mb-4 text-xl font-serif font-bold text-dark/80">选择诗句分析情感维度</h3>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button
              v-for="item in emotionLines"
              :key="item"
              type="button"
              class="rounded-lg border p-4 text-left transition"
              :class="item === selectedEmotionLine ? 'border-primary bg-primary/10 text-primary' : 'border-primary/20 bg-primary/5 text-dark/80 hover:bg-primary/10'"
              @click="selectEmotionLine(item)"
            >
              {{ item }}
            </button>
          </div>
        </div>

        <div class="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
          <div>
            <div class="mb-4 rounded-lg bg-primary/5 p-4">
              <h4 class="mb-2 text-lg font-serif font-bold text-primary">{{ emotionData.line }}</h4>
              <p class="text-dark/70 leading-7">{{ emotionData.explanation }}</p>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div
                v-for="(dimension, idx) in emotionData.dimensions"
                :key="`${dimension}-${idx}`"
                class="rounded-lg border border-primary/20 bg-white p-4"
              >
                <div class="text-sm text-dark/60">{{ dimension }}</div>
                <div class="mt-2 text-3xl font-bold text-primary">{{ emotionScore(dimension, idx) }}</div>
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
import { mockApi } from '../mocks/jinseMockApi'

const fallbackGraph = {
  categories: [{ name: '诗句' }, { name: '典故' }, { name: '诗人' }, { name: '出处' }, { name: '意象' }, { name: '情感' }],
  nodes: [
    { name: '《锦瑟》', category: 0, symbolSize: 70, info: '全诗核心节点。', role: '连接诗句、典故、意象与情感。', source: '晚唐诗歌', images: ['华年', '惘然'] },
    { name: '庄生梦蝶', category: 1, symbolSize: 48, info: '人生如梦，真幻难辨。', role: '强化迷离感。', source: '《庄子·齐物论》', images: ['蝴蝶', '梦境'] },
    { name: '望帝啼鹃', category: 1, symbolSize: 48, info: '杜鹃啼血寄寓执念。', role: '增强悲怆张力。', source: '《华阳国志》', images: ['杜鹃', '啼血'] },
    { name: '李商隐', category: 2, symbolSize: 44, info: '晚唐诗人。', role: '诗风深婉绮丽，善用典。', source: '晚唐诗坛', images: ['无题诗'] },
  ],
  links: [
    { source: '《锦瑟》', target: '庄生梦蝶' },
    { source: '《锦瑟》', target: '望帝啼鹃' },
    { source: '《锦瑟》', target: '李商隐' },
  ],
}

const categoryColors = ['#CD5C5C', '#483D8B', '#8B4513', '#3B82F6', '#16A34A', '#EAB308']

const categoryLegend = [
  { name: '诗人', color: '#8B4513' },
  { name: '诗句', color: '#CD5C5C' },
  { name: '典故', color: '#483D8B' },
  { name: '意象', color: '#16A34A' },
  { name: '情感', color: '#EAB308' },
  { name: '出处', color: '#3B82F6' },
]

const graph = ref(fallbackGraph)
const selectedNodeName = ref('')
const zoom = ref(1)
const graphContainerRef = ref(null)
const emotionChartRef = ref(null)
const emotionData = ref({
  line: '庄生晓梦迷蝴蝶',
  explanation: '点击诗句后会显示五维情感分析与解释。',
  dimensions: ['迷惘感', '凄美感', '孤独感', '执念感', '虚无感'],
  scores: [0.85, 0.4, 0.5, 0.3, 0.9],
})
const emotionLines = [
  '庄生晓梦迷蝴蝶',
  '望帝春心托杜鹃',
  '沧海月明珠有泪',
  '蓝田日暖玉生烟',
  '此情可待成追忆，只是当时已惘然',
]
const selectedEmotionLine = ref('庄生晓梦迷蝴蝶')
let chartInstance = null
let emotionChartInstance = null
let resizeHandler = null

const selectedNode = computed(() => {
  if (!selectedNodeName.value) {
    return null
  }
  return (graph.value.nodes || []).find((item) => item.name === selectedNodeName.value) || null
})


function buildOption() {
  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255,255,255,0.98)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#374151', fontSize: 13 },
      formatter: (params) => {
        const data = params.data || {}
        return `<div><strong>${data.name || ''}</strong><br/>${data.info || data.value || '暂无说明'}</div>`
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
        force: { repulsion: 360, edgeLength: 140, gravity: 0.04 },
        label: {
          show: true,
          position: 'inside',
          color: '#1f2937',
          fontWeight: 600,
          fontSize: 12,
        },
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: [3, 5],
        lineStyle: { color: '#d1d5db', width: 1.2, opacity: 0.6, curveness: 0.12 },
        emphasis: {
          focus: 'adjacency',
          lineStyle: { width: 2.5, color: '#dc2626', opacity: 0.8 },
          label: { fontSize: 14 },
        },
        categories: (graph.value.categories || []).map((item, idx) => ({
          name: item.name,
          itemStyle: { color: categoryColors[idx] || '#6b7280' },
        })),
        data: (graph.value.nodes || []).map((node) => ({
          ...node,
          symbolSize: node.symbolSize || 46,
          itemStyle: {
            color: categoryColors[Number(node.category || 0)] || '#6b7280',
            shadowBlur: 10,
            shadowColor: 'rgba(0,0,0,0.16)',
            borderWidth: 2,
            borderColor: 'rgba(255,255,255,0.88)',
          },
        })),
        links: graph.value.links || [],
      },
    ],
  }
}

function renderChart() {
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
  chartInstance.setOption(buildOption(), true)
}

function buildEmotionOption() {
  return {
    animationDuration: 700,
    radar: {
      indicator: (emotionData.value.dimensions || []).map((name) => ({ name, max: 100 })),
      splitNumber: 5,
      radius: '68%',
      axisName: {
        color: '#6b7280',
        fontSize: 14,
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(148, 163, 184, 0.25)',
        },
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(255,255,255,0.85)'],
        },
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(148, 163, 184, 0.28)',
        },
      },
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: (emotionData.value.scores || []).map((value) => Math.round(value * 100)),
            areaStyle: {
              color: 'rgba(139,69,19,0.18)',
            },
            lineStyle: {
              color: '#8B4513',
              width: 3,
            },
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: '#CD5C5C',
            },
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

function emotionScore(dimension, idx) {
  const score = emotionData.value.scores?.[idx] || 0
  return Math.round(score * 100)
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
  renderChart()
}

async function loadGraph() {
  try {
    graph.value = await mockApi('/api/knowledge-graph')
    await nextTick()
    renderChart()
  } catch (error) {
    console.warn('loadGraph fallback:', error)
    await nextTick()
    renderChart()
  }
}

async function loadEmotion(line) {
  try {
    emotionData.value = await mockApi('/api/emotion', {
      body: { line, mode: 'fast' },
    })
    await nextTick()
    renderEmotionChart()
  } catch (error) {
    console.warn('loadEmotion fallback:', error)
  }
}

function selectEmotionLine(line) {
  selectedEmotionLine.value = line
  loadEmotion(line)
}

watch(
  () => graph.value.nodes,
  (nodes) => {
    if (!nodes?.length) {
      selectedNodeName.value = ''
      return
    }
    if (!nodes.find((item) => item.name === selectedNodeName.value)) {
      selectedNodeName.value = ''
    }
  },
)

watch(selectedNodeName, (name) => {
  if (!chartInstance) {
    return
  }
  chartInstance.dispatchAction({ type: 'downplay', seriesIndex: 0 })
  if (name) {
    const nodeIndex = (graph.value.nodes || []).findIndex((item) => item.name === name)
    if (nodeIndex >= 0) {
      chartInstance.dispatchAction({ type: 'highlight', seriesIndex: 0, dataIndex: nodeIndex })
    }
  }
})

onMounted(() => {
  resizeHandler = () => {
    chartInstance?.resize()
    emotionChartInstance?.resize()
  }
  window.addEventListener('resize', resizeHandler)
  loadGraph()
  loadEmotion(selectedEmotionLine.value)
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
