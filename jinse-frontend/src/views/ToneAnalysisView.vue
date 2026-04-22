<template>
  <section class="w-full py-16 sm:py-20">
    <div class="mx-auto w-full max-w-5xl px-4">
      <h1 class="text-center text-3xl font-serif font-bold text-dark sm:text-4xl">
        <span class="inline-block border-b-2 border-primary pb-2">声律分析</span>
      </h1>

      <article class="mt-12 rounded-2xl border border-primary/10 bg-white/90 p-8 shadow-lg backdrop-blur-sm">
        <div class="mx-auto mb-8 max-w-3xl text-center">
          <p class="text-dark/70 leading-8">{{ prosody.module_note }}</p>
          <p v-if="useFallbackData" class="mt-2 text-xs text-dark/50">当前使用本地演示数据，后端可用时会自动切换为实时数据。</p>
        </div>

        <div class="mb-8 flex justify-center">
          <div class="inline-flex rounded-md border border-primary/20 shadow-sm" role="group" aria-label="声律显示模式">
            <button
              v-for="mode in modeOptions"
              :key="mode.key"
              type="button"
              class="px-5 py-2 text-sm font-medium transition"
              :class="[
                prosodyMode === mode.key ? 'bg-primary text-white' : 'bg-white text-dark hover:bg-primary/5',
                mode.roundedClass,
              ]"
              @click="prosodyMode = mode.key"
            >
              {{ mode.label }}
            </button>
          </div>
        </div>

        <div class="space-y-7">
          <div
            v-for="(line, lineIdx) in prosody.lines"
            :key="line.id"
            class="rounded-2xl border border-primary/10 bg-primary/5 p-6 transition"
            :class="activeLineIndex === lineIdx ? 'ring-2 ring-primary/40 bg-primary/10' : ''"
          >
            <div class="mb-3 flex flex-wrap justify-center gap-2">
              <button
                v-for="(charItem, charIdx) in line.chars"
                :key="`${line.id}-${charIdx}-${charItem.char}`"
                type="button"
                class="rounded-2xl border bg-white transition hover:bg-primary/5"
                :class="charClass(lineIdx, charIdx, charItem)"
                @click="showCharacterDetail(charItem)"
              >
                <template v-if="prosodyMode === 'pronunciation'">
                  <span :class="toneTextClass(charItem)">{{ charItem.char }}</span>
                  <span class="mt-1 text-xs text-dark/60">{{ charItem.pinyin }}</span>
                </template>
                <template v-else>
                  <span :class="['text-2xl font-serif', prosodyMode === 'tone' ? toneTextClass(charItem) : 'text-dark']">{{ charItem.char }}</span>
                </template>
              </button>
            </div>
            <p class="text-center text-sm text-dark/50">{{ line.rhythm }}</p>

            <div class="mt-4 grid gap-3 text-sm leading-7 md:grid-cols-3">
              <div class="rounded-xl border border-primary/10 bg-white p-4">
                <div class="mb-2 font-semibold text-dark/80">节奏特点</div>
                <p class="text-dark/70">{{ line.rhythm_feature }}</p>
              </div>
              <div class="rounded-xl border border-primary/10 bg-white p-4">
                <div class="mb-2 font-semibold text-dark/80">朗读建议</div>
                <p class="text-dark/70">{{ line.reading_tip }}</p>
              </div>
              <div class="rounded-xl border border-primary/10 bg-white p-4">
                <div class="mb-2 font-semibold text-dark/80">情感关联</div>
                <p class="text-dark/70">{{ line.emotion_link }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8 grid gap-4 md:grid-cols-2">
          <div
            v-for="summary in prosody.couplet_summaries"
            :key="summary.range"
            class="rounded-2xl border border-primary/10 bg-white p-4"
          >
            <div class="mb-2 font-semibold text-primary">{{ summary.range }}</div>
            <p class="text-sm leading-7 text-dark/70">{{ summary.text }}</p>
          </div>
        </div>

        <div class="mt-10 rounded-2xl border border-primary/10 bg-primary/5 p-6">
          <div class="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 class="text-xl font-serif font-bold text-dark/85">朗读辅助</h2>
              <p class="mt-1 text-sm text-dark/60">建议先听“标准朗读”再切换到“声律模式”，感受停顿、韵脚与句尾收束。</p>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-sm text-dark/60">TTS回退语速</span>
              <input v-model.number="readingSpeed" type="range" min="75" max="120" class="w-32 accent-primary" />
            </div>
          </div>

          <div class="mb-5 grid gap-3 md:grid-cols-3">
            <button type="button" class="rounded-xl bg-primary px-4 py-3 text-white transition hover:bg-primary/90" @click="playAudioOrFallback('standard')">标准朗读</button>
            <button type="button" class="rounded-xl border border-primary/20 bg-white px-4 py-3 text-primary transition hover:bg-primary/5" @click="playAudioOrFallback('poetic')">诗意朗诵</button>
            <button type="button" class="rounded-xl border border-primary/20 bg-white px-4 py-3 text-primary transition hover:bg-primary/5" @click="playAudioOrFallback('melody')">旋律辅助</button>
          </div>

          <div class="mb-3 flex flex-wrap items-center gap-3">
            <button type="button" class="rounded-lg border border-primary/20 px-4 py-2 text-dark/80 transition hover:bg-white" @click="stopReading">
              <i class="fa fa-stop mr-2" aria-hidden="true"></i>停止播放
            </button>
            <span class="text-sm font-medium text-primary">{{ readingStatus }}</span>
          </div>

          <div class="mb-3 rounded-xl border border-primary/10 bg-white p-4">
            <div class="mb-2 text-sm text-dark/55">本段朗读提示</div>
            <p class="leading-7 text-dark/75">{{ readingTipText }}</p>
          </div>

          <div class="text-xs text-dark/50">
            可选音频文件名：<code>static/audio/jinse_standard.mp3</code>、<code>jinse_poetic.mp3</code>、<code>jinse_melody.mp3</code>。若未放入文件，将自动使用浏览器朗读回退。
          </div>
        </div>

        <div v-if="characterDetail" class="mt-8">
          <div class="rounded-2xl border border-primary/15 bg-primary/5 p-5">
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="text-3xl font-serif font-bold text-primary">{{ characterDetail.char }}</div>
                <div class="mt-1 text-sm text-dark/60">{{ characterDetail.pinyin }} · {{ characterDetail.tone }}</div>
              </div>
              <button type="button" class="text-dark/45 transition hover:text-primary" @click="characterDetail = null">
                <i class="fa fa-times" aria-hidden="true"></i>
              </button>
            </div>

            <div class="mt-4 grid gap-4 text-sm leading-7 md:grid-cols-2">
              <div class="rounded-xl border border-primary/10 bg-white p-4">
                <div class="mb-2 font-semibold text-dark/80">字词说明</div>
                <p class="text-dark/70">{{ characterDetail.note }}</p>
              </div>
              <div class="rounded-xl border border-primary/10 bg-white p-4">
                <div class="mb-2 font-semibold text-dark/80">在本句中的作用</div>
                <p class="text-dark/70">{{ characterDetail.role }}</p>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const FALLBACK_PROSODY = {
  module_note: '这里的平仄与韵脚展示，重点不在死记规则，而在帮助学生看见《锦瑟》的声音结构：哪里起、哪里伏、哪里收。',
  lines: [
    {
      id: 1,
      text: '锦瑟无端五十弦',
      rhythm: '锦瑟 / 无端 / 五十弦',
      rhythm_feature: '起句双仄开篇，随后转入较平稳的节奏，句末以韵脚收束。',
      reading_tip: '建议按“锦瑟 / 无端 / 五十弦”停顿，首二字略重，句尾“弦”轻收。',
      emotion_link: '这种由繁入稳的声音推进，像由器物触发回忆，奠定全诗幽微惘然的起点。',
      chars: [
        { char: '锦', pinyin: 'jǐn', pingze: '仄' },
        { char: '瑟', pinyin: 'sè', pingze: '仄' },
        { char: '无', pinyin: 'wú', pingze: '平' },
        { char: '端', pinyin: 'duān', pingze: '平' },
        { char: '五', pinyin: 'wǔ', pingze: '仄' },
        { char: '十', pinyin: 'shí', pingze: '平' },
        { char: '弦', pinyin: 'xián', pingze: '平', rhyme: true },
      ],
    },
    {
      id: 2,
      text: '一弦一柱思华年',
      rhythm: '一弦 / 一柱 / 思华年',
      rhythm_feature: '句中平声较多，节奏舒展，结尾押韵让回忆感更绵长。',
      reading_tip: '建议按“一弦 / 一柱 / 思华年”分层递进，“华年”要读得略缓。',
      emotion_link: '声音整体较平和，强化了对青春华年的层层追忆。',
      chars: [
        { char: '一', pinyin: 'yī', pingze: '平' },
        { char: '弦', pinyin: 'xián', pingze: '平' },
        { char: '一', pinyin: 'yī', pingze: '平' },
        { char: '柱', pinyin: 'zhù', pingze: '仄' },
        { char: '思', pinyin: 'sī', pingze: '平' },
        { char: '华', pinyin: 'huá', pingze: '平' },
        { char: '年', pinyin: 'nián', pingze: '平', rhyme: true },
      ],
    },
    {
      id: 3,
      text: '庄生晓梦迷蝴蝶',
      rhythm: '庄生 / 晓梦 / 迷蝴蝶',
      rhythm_feature: '中部双仄形成转折，前平后舒，读来有梦境摇曳之感。',
      reading_tip: '建议按“庄生 / 晓梦 / 迷蝴蝶”停顿，中间“晓梦”略提。',
      emotion_link: '节奏由稳转幻，和庄周梦蝶的真幻难辨相呼应。',
      chars: [
        { char: '庄', pinyin: 'zhuāng', pingze: '平' },
        { char: '生', pinyin: 'shēng', pingze: '平' },
        { char: '晓', pinyin: 'xiǎo', pingze: '仄' },
        { char: '梦', pinyin: 'mèng', pingze: '仄' },
        { char: '迷', pinyin: 'mí', pingze: '平' },
        { char: '蝴', pinyin: 'hú', pingze: '平' },
        { char: '蝶', pinyin: 'dié', pingze: '平', rhyme: true },
      ],
    },
    {
      id: 4,
      text: '望帝春心托杜鹃',
      rhythm: '望帝 / 春心 / 托杜鹃',
      rhythm_feature: '开头两仄直入，后半逐渐舒缓，句尾再以韵脚收拢。',
      reading_tip: '建议按“望帝 / 春心 / 托杜鹃”停顿，“杜鹃”句末稍作回落。',
      emotion_link: '前紧后缓的声音走势，强化了执念与悲怆逐步外溢的感觉。',
      chars: [
        { char: '望', pinyin: 'wàng', pingze: '仄' },
        { char: '帝', pinyin: 'dì', pingze: '仄' },
        { char: '春', pinyin: 'chūn', pingze: '平' },
        { char: '心', pinyin: 'xīn', pingze: '平' },
        { char: '托', pinyin: 'tuō', pingze: '平' },
        { char: '杜', pinyin: 'dù', pingze: '仄' },
        { char: '鹃', pinyin: 'juān', pingze: '平', rhyme: true },
      ],
    },
    {
      id: 5,
      text: '沧海月明珠有泪',
      rhythm: '沧海 / 月明 / 珠有泪',
      rhythm_feature: '声调起伏更明显，明月、珠泪等意象在节奏上呈现波光般闪动。',
      reading_tip: '建议按“沧海 / 月明 / 珠有泪”停顿，“有泪”略延长。',
      emotion_link: '起伏感和句末下沉共同营造出清冷、凄美的听觉效果。',
      chars: [
        { char: '沧', pinyin: 'cāng', pingze: '平' },
        { char: '海', pinyin: 'hǎi', pingze: '仄' },
        { char: '月', pinyin: 'yuè', pingze: '仄' },
        { char: '明', pinyin: 'míng', pingze: '平' },
        { char: '珠', pinyin: 'zhū', pingze: '平' },
        { char: '有', pinyin: 'yǒu', pingze: '仄' },
        { char: '泪', pinyin: 'lèi', pingze: '仄' },
      ],
    },
    {
      id: 6,
      text: '蓝田日暖玉生烟',
      rhythm: '蓝田 / 日暖 / 玉生烟',
      rhythm_feature: '前半较沉，后半回稳，尾字押韵使画面在空灵中慢慢散开。',
      reading_tip: '建议按“蓝田 / 日暖 / 玉生烟”停顿，“生烟”读得轻柔些。',
      emotion_link: '声音由沉入轻，契合“玉生烟”的朦胧、可望难即之美。',
      chars: [
        { char: '蓝', pinyin: 'lán', pingze: '平' },
        { char: '田', pinyin: 'tián', pingze: '平' },
        { char: '日', pinyin: 'rì', pingze: '仄' },
        { char: '暖', pinyin: 'nuǎn', pingze: '仄' },
        { char: '玉', pinyin: 'yù', pingze: '仄' },
        { char: '生', pinyin: 'shēng', pingze: '平' },
        { char: '烟', pinyin: 'yān', pingze: '平', rhyme: true },
      ],
    },
    {
      id: 7,
      text: '此情可待成追忆',
      rhythm: '此情 / 可待 / 成追忆',
      rhythm_feature: '前段节奏短促，中间稍顿，句尾韵脚再次把全诗情绪收拢。',
      reading_tip: '建议按“此情 / 可待 / 成追忆”停顿，“追忆”句尾略收。',
      emotion_link: '声音像在回望中短暂停顿，带出自省与追悔。',
      chars: [
        { char: '此', pinyin: 'cǐ', pingze: '仄' },
        { char: '情', pinyin: 'qíng', pingze: '平' },
        { char: '可', pinyin: 'kě', pingze: '仄' },
        { char: '待', pinyin: 'dài', pingze: '仄' },
        { char: '成', pinyin: 'chéng', pingze: '平' },
        { char: '追', pinyin: 'zhuī', pingze: '平' },
        { char: '忆', pinyin: 'yì', pingze: '仄' },
      ],
    },
    {
      id: 8,
      text: '只是当时已惘然',
      rhythm: '只是 / 当时 / 已惘然',
      rhythm_feature: '前平后仄的起落让尾句更显回环，句末韵脚形成余音。',
      reading_tip: '建议按“只是 / 当时 / 已惘然”停顿，“惘然”读得低缓绵长。',
      emotion_link: '句尾收束最强，像情绪最终落回“惘然”，留下悠长余味。',
      chars: [
        { char: '只', pinyin: 'zhǐ', pingze: '仄' },
        { char: '是', pinyin: 'shì', pingze: '仄' },
        { char: '当', pinyin: 'dāng', pingze: '平' },
        { char: '时', pinyin: 'shí', pingze: '平' },
        { char: '已', pinyin: 'yǐ', pingze: '仄' },
        { char: '惘', pinyin: 'wǎng', pingze: '仄' },
        { char: '然', pinyin: 'rán', pingze: '平', rhyme: true },
      ],
    },
  ],
  couplet_summaries: [
    { range: '首联', text: '首联节奏较整饬，像由乐器牵出往事，一层层引向“思华年”的追忆。' },
    { range: '颔联', text: '颔联起伏更明显，梦蝶与杜鹃的声音组织共同营造出迷离与执念。' },
    { range: '颈联', text: '颈联声律柔中有顿，和“珠有泪”“玉生烟”的清冷空灵相呼应。' },
    { range: '尾联', text: '尾联句尾收束最强，情绪最终沉入“惘然”，留下回环不尽的余音。' },
  ],
}

const CHAR_EXPLAIN = {
  锦: ['jǐn', '仄声', '装饰华美、色彩斑斓。', '在首句中先声夺人，突出了“瑟”的精美，也反衬了回忆之痛。'],
  瑟: ['sè', '仄声', '古代拨弦乐器。', '它是整首诗的起兴之物，由乐器引出人生追忆。'],
  华: ['huá', '平声', '华美、美好。', '“华年”指青春好时光，是全诗最重要的追忆核心。'],
  蝶: ['dié', '平声', '蝴蝶。', '梦蝶意象使诗句呈现梦幻与真幻难辨的色彩。'],
  鹃: ['juān', '平声', '杜鹃。', '杜鹃啼血常承载哀思与执念，使情感更悲怆。'],
  泪: ['lèi', '仄声', '泪光、泪珠。', '“珠有泪”把凄美情绪凝成一个极具画面感的意象。'],
  烟: ['yān', '平声', '云烟、轻烟。', '“玉生烟”写出可望不可即的朦胧美。'],
  惘: ['wǎng', '仄声', '失意迷惘。', '尾联结穴之字，概括全诗余味。'],
  然: ['rán', '平声', '......的样子。', '与“惘”连用，形成含蓄悠远的总结。'],
}

const modeOptions = [
  { key: 'original', label: '原文模式', roundedClass: 'rounded-l-md' },
  { key: 'tone', label: '声律模式', roundedClass: '' },
  { key: 'pronunciation', label: '拼音模式', roundedClass: 'rounded-r-md' },
]

const prosody = ref(FALLBACK_PROSODY)
const useFallbackData = ref(true)
const prosodyMode = ref('original')
const readingSpeed = ref(92)
const readingStatus = ref('当前未播放')
const readingTipText = ref('标准朗读适合和停顿、平仄一起看；诗意朗诵更适合整体感受《锦瑟》的低回气质；旋律辅助可在放入曲谱音频后播放。')
const characterDetail = ref(null)
const activeLineIndex = ref(null)
const activeChar = ref({ lineIdx: null, charIdx: null })

const readingTimers = []
let currentAudio = null
let currentUtterance = null

function toneTextClass(charItem) {
  return charItem.pingze === '平' ? 'text-blue-600' : 'text-red-600'
}

function charClass(lineIdx, charIdx, charItem) {
  const baseSize = prosodyMode.value === 'pronunciation'
    ? 'flex h-16 w-16 flex-col items-center justify-center'
    : 'flex h-14 w-14 items-center justify-center'
  const borderClass = charItem.rhyme ? 'border-2 border-accent' : 'border-primary/20'
  const activeClass = activeChar.value.lineIdx === lineIdx && activeChar.value.charIdx === charIdx
    ? 'scale-105 bg-primary/10 shadow-lg'
    : ''
  return [baseSize, borderClass, activeClass].join(' ')
}

function showCharacterDetail(charItem) {
  const explain = CHAR_EXPLAIN[charItem.char] || [charItem.pinyin, `${charItem.pingze}声`, '暂无详细注释。', '后续可继续补充字词说明。']
  characterDetail.value = {
    char: charItem.char,
    pinyin: explain[0],
    tone: explain[1],
    note: explain[2],
    role: explain[3],
  }
}

function clearReadingTimers() {
  while (readingTimers.length) {
    clearTimeout(readingTimers.pop())
  }
}

function resetHighlights() {
  activeLineIndex.value = null
  activeChar.value = { lineIdx: null, charIdx: null }
}

function stopReading() {
  clearReadingTimers()
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
  }
  currentAudio = null
  currentUtterance = null
  readingStatus.value = '当前未播放'
  resetHighlights()
}

function scheduleReadingHighlights(mode) {
  clearReadingTimers()
  const speed = readingSpeed.value / 100
  const base = mode === 'poetic' ? 2200 : mode === 'melody' ? 2400 : 1800

  prosody.value.lines.forEach((line, lineIdx) => {
    const lineTimer = setTimeout(() => {
      activeLineIndex.value = lineIdx
      line.chars.forEach((_, charIdx) => {
        const charTimer = setTimeout(() => {
          activeChar.value = { lineIdx, charIdx }
        }, charIdx * 230)
        readingTimers.push(charTimer)
      })
    }, lineIdx * (base / speed))

    readingTimers.push(lineTimer)
  })
}

function speakPoem(mode = 'standard') {
  if (!window.speechSynthesis) {
    readingStatus.value = '当前浏览器不支持朗读'
    return
  }

  const text = `${prosody.value.lines.map((line) => line.rhythm || line.text).join('，')}。`
  const rateSeed = readingSpeed.value / 100
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'zh-CN'
  utter.rate = mode === 'poetic'
    ? Math.max(0.7, rateSeed * 0.88)
    : mode === 'melody'
      ? Math.max(0.6, rateSeed * 0.82)
      : Math.max(0.75, rateSeed)
  utter.pitch = mode === 'poetic' ? 0.82 : mode === 'melody' ? 0.72 : 0.95
  utter.onend = () => stopReading()
  utter.onerror = () => stopReading()

  currentUtterance = utter
  readingStatus.value = mode === 'poetic'
    ? '正在播放：诗意朗诵（TTS 回退）'
    : mode === 'melody'
      ? '正在播放：旋律辅助（TTS 回退）'
      : '正在播放：标准朗读（TTS 回退）'
  window.speechSynthesis.speak(utter)
}

function playAudioOrFallback(mode) {
  const config = {
    standard: {
      src: '/static/audio/jinse_standard.mp3',
      tip: '标准朗读适合配合平仄、停顿与逐句高亮使用。',
      status: '正在播放：标准朗读',
    },
    poetic: {
      src: '/static/audio/jinse_poetic.mp3',
      tip: '诗意朗诵更强调情绪层次与低回感，适合整体欣赏。',
      status: '正在播放：诗意朗诵',
    },
    melody: {
      src: '/static/audio/jinse_melody.mp3',
      tip: '旋律辅助可与诗句联动，用来感受《锦瑟》的音乐性。',
      status: '正在播放：旋律辅助',
    },
  }[mode]

  if (!config) {
    return
  }

  readingTipText.value = config.tip
  stopReading()
  scheduleReadingHighlights(mode)

  const audio = new Audio(config.src)
  audio.onloadeddata = () => {
    currentAudio = audio
    readingStatus.value = config.status
    audio.currentTime = 0
    audio.play().catch(() => speakPoem(mode))
  }
  audio.onerror = () => speakPoem(mode)
  audio.onended = () => stopReading()
  audio.load()
}

async function loadProsody() {
  try {
    const response = await fetch('/api/prosody')
    if (!response.ok) {
      prosody.value = FALLBACK_PROSODY
      useFallbackData.value = true
      return
    }
    prosody.value = await response.json()
    useFallbackData.value = false
  } catch (error) {
    console.warn('loadProsody fallback:', error)
    prosody.value = FALLBACK_PROSODY
    useFallbackData.value = true
  }
}

onMounted(() => {
  loadProsody()
})

onBeforeUnmount(() => {
  stopReading()
})
</script>
