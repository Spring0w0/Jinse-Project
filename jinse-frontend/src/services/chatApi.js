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
    const size = /[，。；：！？]/.test(reply[index]) ? 1 : 3
    chunks.push(reply.slice(index, index + size))
    index += size
  }

  return chunks
}

function summarizeRouteContext(routeContext = {}) {
  if (!routeContext.label) {
    return '当前页面'
  }
  return `当前页面是“${routeContext.label}”`
}

function buildReplyByKeyword(message, routeContext = {}) {
  const normalized = String(message || '').trim()
  const routeSummary = summarizeRouteContext(routeContext)

  if (!normalized) {
    return '我还没有收到具体问题。你可以告诉我你想从诗句、典故、意象、情感或声律中的哪一部分开始。'
  }

  if (/(典故|庄生|蝴蝶|望帝|杜鹃)/.test(normalized)) {
    return `${routeSummary}。如果你现在正在看《锦瑟》的典故相关内容，可以重点抓住两组核心借典：一是“庄生晓梦迷蝴蝶”，强调真幻难辨与人生迷离；二是“望帝春心托杜鹃”，强调深情、执念与悲怆。它们共同把《锦瑟》的情感推向含蓄而复杂的层次。`
  }

  if (/(情感|惘然|追忆|伤感|悲伤)/.test(normalized)) {
    return `${routeSummary}。理解《锦瑟》的情感时，不建议只归结成单一的“爱情”或“伤感”。更稳妥的读法是把它看成追忆、迷惘、惆怅与审美性朦胧交织在一起的复合情绪，而“惘然”正是这种复杂情感的收束点。`
  }

  if (/(声律|平仄|朗读|韵脚)/.test(normalized)) {
    return `${routeSummary}。如果你是在声律分析页面提问，可以把重点放在三件事上：句中停顿怎么帮助理解层次，句尾韵脚怎么制造回环感，以及平仄起伏怎么服务于《锦瑟》的低回气质。声律在这里不是单独的规则，而是情绪表达的一部分。`
  }

  if (/(意象|生图|月|珠|玉|烟)/.test(normalized)) {
    return `${routeSummary}。读《锦瑟》的意象时，最好不要把“沧海月明珠有泪”“蓝田日暖玉生烟”拆成单个名词去背，而是看它们如何共同形成一种清冷、晶莹、可望难即的整体氛围。这也是为什么它很适合转成图像化学习内容。`
  }

  if (/(测验|题目|做题|答案)/.test(normalized)) {
    return `${routeSummary}。如果你是围绕测验在问，我建议先确认题目是在考诗句理解、典故识别、意象分析还是情感归纳。对《锦瑟》这类多义文本，最常见的问题不是记不住，而是过早把答案收窄成唯一解释。`
  }

  return `${routeSummary}。你刚才的问题是“${normalized}”。目前这套聊天能力还是前端阶段的学习助手版本，我可以先从《锦瑟》的诗句、典故、意象、情感、声律或相关诗歌比较几个方向帮你整理思路。你也可以把问题问得更具体一点。`
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
