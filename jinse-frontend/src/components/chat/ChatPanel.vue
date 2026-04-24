<template>
  <transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="translate-y-4 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-4 opacity-0"
  >
    <section
      v-if="isOpen"
      class="pointer-events-auto fixed bottom-24 right-4 z-[70] flex h-[min(72vh,680px)] w-[min(calc(100vw-2rem),720px)] overflow-hidden rounded-[28px] border border-primary/15 bg-white/95 shadow-2xl backdrop-blur md:right-6"
    >
      <div
        class="absolute inset-y-0 left-0 z-10 w-[260px] transition-transform duration-200 ease-out"
        :class="isHistoryOpen ? 'translate-x-0' : '-translate-x-full'"
      >
        <ChatSessionList
          :current-session-id="currentSessionId"
          :sessions="sortedSessions"
          @delete-session="deleteSession"
          @select-session="selectSession"
        />
      </div>

      <div
        v-if="isHistoryOpen"
        class="absolute inset-0 z-[5] bg-dark/20"
        @click="toggleHistory"
      ></div>

      <div class="relative z-[6] flex min-w-0 flex-1 flex-col bg-light/40">
        <header class="flex items-center justify-between border-b border-primary/10 bg-white/90 px-4 py-4">
          <div class="min-w-0">
            <div class="truncate text-base font-serif font-bold text-primary">{{ sessionTitle }}</div>
            <div class="mt-1 text-xs text-dark/55">{{ routeLabelText }}</div>
          </div>

          <div class="ml-4 flex items-center gap-2">
            <button
              type="button"
              class="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary/10 px-4 text-sm font-medium text-primary transition hover:bg-primary/20"
              @click="toggleHistory"
            >
              <i class="fa fa-history" aria-hidden="true"></i>
              <span>{{ isHistoryOpen ? '收起历史' : '历史会话' }}</span>
            </button>
            <button
              type="button"
              class="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-white transition hover:bg-primary/90"
              @click="startNewSession"
            >
              <i class="fa fa-pencil-square-o" aria-hidden="true"></i>
              <span>新建会话</span>
            </button>
            <button
              v-if="isStreaming"
              type="button"
              class="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-red-50 px-4 text-sm font-medium text-red-700 transition hover:bg-red-100"
              @click="stopGenerating"
            >
              <i class="fa fa-stop-circle-o" aria-hidden="true"></i>
              <span>停止生成</span>
            </button>
            <button
              type="button"
              class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition hover:bg-primary/20"
              @click="closePanel"
            >
              <i class="fa fa-minus" aria-hidden="true"></i>
            </button>
          </div>
        </header>

        <ChatMessageList :messages="messages" />

        <ChatInputBox
          v-model="draft"
          :disabled="isSending"
          @quick-question="fillQuickQuestion"
          @send="send"
        />
      </div>
    </section>
  </transition>
</template>

<script setup>
import { computed } from 'vue'
import { useChatStore } from '../../stores/chat'
import ChatInputBox from './ChatInputBox.vue'
import ChatMessageList from './ChatMessageList.vue'
import ChatSessionList from './ChatSessionList.vue'

const props = defineProps({
  routeContext: {
    type: Object,
    default: () => ({}),
  },
})

const chatStore = useChatStore()

const isOpen = computed(() => chatStore.isOpen)
const isHistoryOpen = computed(() => chatStore.isHistoryOpen)
const currentSessionId = computed(() => chatStore.currentSessionId)
const sortedSessions = computed(() => chatStore.sortedSessions)
const isSending = computed(() => chatStore.isSending)
const isStreaming = computed(() => chatStore.isStreaming)
const draft = computed({
  get: () => chatStore.currentDraft,
  set: (value) => {
    chatStore.currentDraft = value
  },
})

const messages = computed(() => chatStore.currentSession?.messages || [])
const sessionTitle = computed(() => chatStore.currentSession?.title || '新会话')
const routeLabelText = computed(() => {
  return props.routeContext?.label
    ? `当前页面：${props.routeContext.label}`
    : '当前页面上下文暂不可用'
})

function send() {
  chatStore.sendMessage(draft.value, props.routeContext)
}

function fillQuickQuestion(question) {
  draft.value = question
}

function closePanel() {
  chatStore.closePanel()
}

function toggleHistory() {
  chatStore.toggleHistory()
}

function startNewSession() {
  chatStore.startNewSession()
}

function stopGenerating() {
  chatStore.stopGenerating()
}

function deleteSession(session) {
  const title = session?.title || '新会话'
  const confirmed = window.confirm(`确认删除会话“${title}”吗？删除后无法恢复。`)
  if (!confirmed) {
    return
  }
  chatStore.deleteSession(session)
}

function selectSession(sessionId) {
  chatStore.selectSession(sessionId)
}
</script>
