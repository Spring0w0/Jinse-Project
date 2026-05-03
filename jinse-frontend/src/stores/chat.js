import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { streamChatReply } from '../services/chatApi'

const STORAGE_KEY = 'jinse-chat-store-v1'

function createId(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function createAssistantMessage(text, extra = {}) {
  return {
    id: createId('msg'),
    role: 'assistant',
    text,
    createdAt: new Date().toISOString(),
    pending: false,
    error: false,
    ...extra,
  }
}

function createUserMessage(text) {
  return {
    id: createId('msg'),
    role: 'user',
    text,
    createdAt: new Date().toISOString(),
    pending: false,
    error: false,
  }
}

function createWelcomeMessage() {
  return createAssistantMessage('我是古诗词学习助手。你可以随时围绕当前学习诗歌提问，也可以直接追问当前页面里的诗句、意象、典故、情感或声律。')
}

function createThinkingMessage() {
  return createAssistantMessage('正在思考...', {
    pending: true,
    streaming: true,
  })
}

function buildSessionTitle(firstUserMessage) {
  const normalized = String(firstUserMessage || '').trim()
  if (!normalized) {
    return '新会话'
  }
  return normalized.length > 20 ? `${normalized.slice(0, 20)}...` : normalized
}

function createSession(title = '新会话') {
  const timestamp = new Date().toISOString()
  return {
    id: createId('session'),
    title,
    createdAt: timestamp,
    updatedAt: timestamp,
    messages: [createWelcomeMessage()],
  }
}

function cloneSessions(sessions = []) {
  return sessions.map((session) => ({
    ...session,
    messages: Array.isArray(session.messages) ? session.messages.map((message) => ({ ...message })) : [],
  }))
}

export const useChatStore = defineStore('chat', () => {
  const initialized = ref(false)
  const isOpen = ref(false)
  const isHistoryOpen = ref(false)
  const isSending = ref(false)
  const isStreaming = ref(false)
  const sessions = ref([])
  const currentSessionId = ref('')
  const drafts = ref({})
  const activeResponseId = ref('')
  let activeAbortController = null

  const currentSession = computed(() => {
    return sessions.value.find((session) => session.id === currentSessionId.value) || null
  })

  const sortedSessions = computed(() => {
    return [...sessions.value].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  })

  const currentDraft = computed({
    get() {
      return drafts.value[currentSessionId.value] || ''
    },
    set(value) {
      drafts.value = {
        ...drafts.value,
        [currentSessionId.value]: value,
      }
    },
  })

  function persistState() {
    if (!initialized.value || typeof window === 'undefined') {
      return
    }

    const payload = {
      sessions: sessions.value,
      currentSessionId: currentSessionId.value,
      drafts: drafts.value,
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }

  function hydrateState() {
    if (typeof window === 'undefined') {
      return false
    }

    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return false
    }

    try {
      const parsed = JSON.parse(raw)
      const hydratedSessions = cloneSessions(parsed.sessions || [])
      if (!hydratedSessions.length) {
        return false
      }

      sessions.value = hydratedSessions
      currentSessionId.value = hydratedSessions.some((session) => session.id === parsed.currentSessionId)
        ? parsed.currentSessionId
        : hydratedSessions[0].id
      drafts.value = parsed.drafts || {}
      return true
    } catch (error) {
      console.warn('chat store hydration failed:', error)
      return false
    }
  }

  function initialize() {
    if (initialized.value) {
      return
    }

    const restored = hydrateState()
    if (!restored) {
      const initialSession = createSession()
      sessions.value = [initialSession]
      currentSessionId.value = initialSession.id
      drafts.value = { [initialSession.id]: '' }
    }

    initialized.value = true
  }

  function ensureSession() {
    if (currentSession.value) {
      return currentSession.value
    }

    const nextSession = createSession()
    sessions.value = [nextSession, ...sessions.value]
    currentSessionId.value = nextSession.id
    drafts.value = { ...drafts.value, [nextSession.id]: '' }
    return nextSession
  }

  function openPanel() {
    initialize()
    isOpen.value = true
  }

  function closePanel() {
    isOpen.value = false
    isHistoryOpen.value = false
  }

  function togglePanel() {
    if (isOpen.value) {
      closePanel()
      return
    }
    openPanel()
  }

  function toggleHistory() {
    initialize()
    isHistoryOpen.value = !isHistoryOpen.value
  }

  function selectSession(sessionId) {
    initialize()
    if (!sessions.value.some((session) => session.id === sessionId)) {
      return
    }
    currentSessionId.value = sessionId
    isHistoryOpen.value = false
    isOpen.value = true
  }

  function startNewSession() {
    initialize()
    const nextSession = createSession()
    sessions.value = [nextSession, ...sessions.value]
    currentSessionId.value = nextSession.id
    drafts.value = { ...drafts.value, [nextSession.id]: '' }
    isOpen.value = true
    isHistoryOpen.value = false
  }

  function deleteSession(targetSession) {
    initialize()

    const targetId = typeof targetSession === 'object' && targetSession !== null
      ? targetSession.id
      : targetSession
    const normalizedTargetId = String(targetId)
    const targetIndex = sessions.value.findIndex((session) => String(session.id) === normalizedTargetId)
    if (targetIndex < 0) {
      return
    }

    const nextSessions = sessions.value.filter((session) => String(session.id) !== normalizedTargetId)
    const nextDrafts = { ...drafts.value }
    delete nextDrafts[normalizedTargetId]

    if (!nextSessions.length) {
      const fallbackSession = createSession()
      sessions.value = [fallbackSession]
      currentSessionId.value = fallbackSession.id
      drafts.value = { [fallbackSession.id]: '' }
      return
    }

    sessions.value = nextSessions
    drafts.value = nextDrafts

    if (String(currentSessionId.value) === normalizedTargetId) {
      const fallbackIndex = Math.min(targetIndex, nextSessions.length - 1)
      currentSessionId.value = nextSessions[fallbackIndex].id
    }
  }

  function resetStreamingState(responseId = '') {
    if (responseId && activeResponseId.value && responseId !== activeResponseId.value) {
      return
    }

    isSending.value = false
    isStreaming.value = false
    activeResponseId.value = ''
    activeAbortController = null
  }

  function stopGenerating() {
    if (!activeAbortController) {
      return
    }
    activeAbortController.abort()
  }

  function updateSessionTimestamp(sessionId) {
    const session = sessions.value.find((item) => item.id === sessionId)
    if (!session) {
      return
    }
    session.updatedAt = new Date().toISOString()
  }

  function patchMessage(sessionId, messageId, patch) {
    sessions.value = sessions.value.map((session) => {
      if (session.id !== sessionId) {
        return session
      }

      return {
        ...session,
        messages: (session.messages || []).map((message) => (
          message.id === messageId
            ? { ...message, ...patch }
            : message
        )),
      }
    })
  }

  function applySessionTitle(session, firstUserMessage) {
    if (!session) {
      return
    }
    const userMessageCount = (session.messages || []).filter((message) => message.role === 'user').length
    if (userMessageCount > 1) {
      return
    }
    session.title = buildSessionTitle(firstUserMessage)
  }

  async function sendMessage(rawMessage, routeContext = {}) {
    initialize()

    const messageText = String(rawMessage || '').trim()
    if (!messageText || isSending.value) {
      return
    }

    const session = ensureSession()
    const userMessage = createUserMessage(messageText)
    const pendingAssistantMessage = createThinkingMessage()
    const responseId = pendingAssistantMessage.id
    session.messages.push(userMessage, pendingAssistantMessage)
    applySessionTitle(session, messageText)
    updateSessionTimestamp(session.id)
    currentDraft.value = ''
    isSending.value = true
    isStreaming.value = true
    activeResponseId.value = responseId
    activeAbortController = typeof AbortController !== 'undefined' ? new AbortController() : null

    try {
      const response = await streamChatReply({
        message: messageText,
        history: session.messages
          .filter((message) => !message.pending)
          .map((message) => ({ role: message.role, content: message.text })),
        routeContext,
        signal: activeAbortController?.signal,
        onChunk(fullText) {
          patchMessage(session.id, responseId, {
            text: fullText,
            pending: true,
            streaming: true,
          })
        },
      })

      patchMessage(session.id, responseId, {
        text: response.reply || '我先整理一下这首诗的相关思路，你也可以继续把问题问得更具体。',
        pending: false,
        streaming: false,
        mode: response.mode || 'backend-stream',
      })
      updateSessionTimestamp(session.id)
    } catch (error) {
      if (error?.name === 'AbortError') {
        const currentText = currentSession.value?.messages.find((message) => message.id === responseId)?.text
        patchMessage(session.id, responseId, {
          text: currentText && currentText !== '正在思考...' ? currentText : '本次生成已停止。',
          pending: false,
          streaming: false,
          aborted: true,
        })
        updateSessionTimestamp(session.id)
      } else {
        patchMessage(session.id, responseId, {
          text: '当前这条回复没有成功生成，你可以重新发送，或者把问题缩小到某一句再试一次。',
          pending: false,
          streaming: false,
          error: true,
        })
        updateSessionTimestamp(session.id)
        console.error('chat send failed:', error)
      }
    } finally {
      resetStreamingState(responseId)
    }
  }

  watch(
    [sessions, currentSessionId, drafts],
    () => {
      persistState()
    },
    { deep: true },
  )

  return {
    currentDraft,
    currentSession,
    currentSessionId,
    drafts,
    initialize,
    isHistoryOpen,
    isOpen,
    isSending,
    isStreaming,
    openPanel,
    closePanel,
    deleteSession,
    selectSession,
    sendMessage,
    sessions,
    sortedSessions,
    startNewSession,
    stopGenerating,
    toggleHistory,
    togglePanel,
  }
})
