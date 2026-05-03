const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL || '/api/chat'

function abortError() {
  return new DOMException('The operation was aborted.', 'AbortError')
}

function throwIfAborted(signal) {
  if (signal?.aborted) {
    throw abortError()
  }
}

function normalizeHistory(history = []) {
  if (!Array.isArray(history)) {
    return []
  }

  return history
    .filter((message) => {
      return ['user', 'assistant'].includes(message?.role) && String(message?.content || '').trim()
    })
    .map((message) => ({
      role: message.role,
      content: String(message.content).trim(),
    }))
}

async function readTextStream(response, signal, onChunk) {
  const reader = response.body?.getReader()
  if (!reader) {
    const text = await response.text()
    onChunk?.(text, text)
    return text
  }

  const decoder = new TextDecoder('utf-8')
  let fullText = ''

  try {
    while (true) {
      throwIfAborted(signal)
      const { done, value } = await reader.read()

      if (done) {
        break
      }

      const chunk = decoder.decode(value, { stream: true })
      if (!chunk) {
        continue
      }

      fullText += chunk
      onChunk?.(fullText, chunk)
      await waitForPaint()
    }

    const tail = decoder.decode()
    if (tail) {
      fullText += tail
      onChunk?.(fullText, tail)
    }

    return fullText
  } catch (error) {
    await reader.cancel().catch(() => {})
    throw error
  } finally {
    reader.releaseLock()
  }
}

function waitForPaint() {
  if (typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function') {
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    window.requestAnimationFrame(() => resolve())
  })
}

async function parseErrorMessage(response) {
  try {
    const data = await response.json()
    return data?.error || `聊天接口请求失败：${response.status}`
  } catch {
    return `聊天接口请求失败：${response.status}`
  }
}

export async function streamChatReply({
  message,
  history = [],
  routeContext = {},
  signal,
  onChunk,
}) {
  throwIfAborted(signal)

  const response = await fetch(CHAT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      history: normalizeHistory(history),
      routeContext,
    }),
    signal,
  })

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response))
  }

  const reply = await readTextStream(response, signal, onChunk)

  return {
    reply,
    mode: 'backend-stream',
  }
}
