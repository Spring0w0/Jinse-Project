const MOCK_LATENCY_MS = 260
const MOCK_STREAM_INTERVAL_MS = 55

function abortError() {
  return new DOMException('The operation was aborted.', 'AbortError')
}

function throwIfAborted(signal) {
  if (signal?.aborted) {
    throw abortError()
  }
}

function delay(ms = MOCK_LATENCY_MS, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup()
      resolve()
    }, ms)

    function onAbort() {
      cleanup()
      reject(abortError())
    }

    function cleanup() {
      clearTimeout(timer)
      signal?.removeEventListener('abort', onAbort)
    }

    if (signal) {
      signal.addEventListener('abort', onAbort, { once: true })
    }
  })
}

function buildReplyChunks(reply) {
  const chunks = []
  let index = 0

  while (index < reply.length) {
    const size = /[，。！？；：、“”《》]/.test(reply[index]) ? 1 : 3
    chunks.push(reply.slice(index, index + size))
    index += size
  }

  return chunks
}

function summarizeRouteContext(routeContext = {}) {
  const poemTitle = routeContext.poemTitle || '当前这首诗'
  const pageLabel = routeContext.label || '当前页面'
  return `你现在在“${pageLabel}”页面，当前学习诗歌是《${poemTitle}》`
}

function buildPoemScopedAdvice(routeContext = {}) {
  const pageName = routeContext.name
  const poemTitle = routeContext.poemTitle || '当前这首诗'

  if (pageName === 'poem-appreciation') {
    return `建议先抓住《${poemTitle}》这一联最关键的词语，再看它如何带出整句的情绪和语气。`
  }
  if (pageName === 'tone-analysis') {
    return `可以先看《${poemTitle}》这一句的停顿、收尾和语势变化，再判断这些声音特征如何服务情感表达。`
  }
  if (pageName === 'ai-image') {
    return `在《${poemTitle}》的诗意生图页面，重点不是死记名词，而是判断这一句更偏向典故、场景还是整体氛围。`
  }
  if (pageName === 'knowledge-graph') {
    return `在《${poemTitle}》的知识图谱里，建议先抓中心节点，再看它和典故、意象、情感之间的连接方式。`
  }
  if (pageName === 'quiz') {
    return `如果你是在《${poemTitle}》的小测页面提问，先分清题目是在考诗句理解、意象分析还是整体主旨。`
  }
  if (pageName === 'similar-poems') {
    return `如果你正在比较《${poemTitle}》和其它作品，先确定比较维度：主题、情感、意象还是表达方式。`
  }

  return `你可以直接围绕《${poemTitle}》提问，我会优先结合当前页面内容来回答。`
}

function buildReplyByKeyword(message, routeContext = {}) {
  const normalized = String(message || '').trim()
  const routeSummary = summarizeRouteContext(routeContext)
  const poemTitle = routeContext.poemTitle || '当前这首诗'

  if (!normalized) {
    return `${routeSummary}。你可以直接问我《${poemTitle}》的诗句、意象、典故、情感、声律，或者当前页面里看不懂的地方。`
  }

  if (/(典故|出处|用了什么典|借典)/.test(normalized)) {
    return `${routeSummary}。如果你是在问《${poemTitle}》里的典故，建议先分清这句是真的在化用传统故事，还是只是借意象营造氛围；不是每句诗都必须硬套典故。`
  }

  if (/(情感|感情|情绪|主旨)/.test(normalized)) {
    return `${routeSummary}。理解《${poemTitle}》的情感时，最好不要急着压成单一答案。更稳妥的办法是先看关键词、意象组合和收束句，再判断它是偏回忆、孤独、深情、惋惜还是历史反思。`
  }

  if (/(平仄|声律|朗读|节奏|停顿)/.test(normalized)) {
    return `${routeSummary}。分析《${poemTitle}》的声律，不必先背规则，先看停顿位置、句尾如何收、语势是上扬还是下沉，再看这些变化怎样服务情绪。`
  }

  if (/(意象|画面|生图|图像)/.test(normalized)) {
    return `${routeSummary}。读《${poemTitle}》的意象时，重点是看几个核心画面如何共同形成整体氛围，而不是把每个词拆开孤立记忆。`
  }

  if (/(测验|题目|做题|答案)/.test(normalized)) {
    return `${routeSummary}。做《${poemTitle}》相关题目时，最常见的问题不是不会背，而是过早把多义文本收窄成唯一解释，所以先判断题目到底在考哪一层。`
  }

  return `${routeSummary}。你刚才的问题是“${normalized}”。${buildPoemScopedAdvice(routeContext)} 如果你愿意，可以继续把问题问得更具体一点，比如直接指出某一句、某个意象，或者某道题。`
}

export async function streamChatReply({
  message,
  history = [],
  routeContext = {},
  signal,
  onChunk,
}) {
  throwIfAborted(signal)
  await delay(MOCK_LATENCY_MS, signal)

  const reply = buildReplyByKeyword(message, routeContext, history)
  const chunks = buildReplyChunks(reply)
  let fullText = ''

  for (const chunk of chunks) {
    throwIfAborted(signal)
    await delay(MOCK_STREAM_INTERVAL_MS, signal)
    fullText += chunk
    onChunk?.(fullText, chunk)
  }

  return {
    reply: fullText,
    mode: 'mock-stream',
  }
}
