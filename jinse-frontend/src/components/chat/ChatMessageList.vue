<template>
  <div ref="scrollRef" class="flex-1 space-y-4 overflow-y-auto px-4 py-4">
    <div
      v-for="message in messages"
      :key="message.id"
      class="flex"
      :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
    >
      <div
        class="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-7 shadow-sm"
        :class="bubbleClass(message)"
      >
        <p class="whitespace-pre-wrap break-words">{{ message.text }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'

const props = defineProps({
  messages: {
    type: Array,
    default: () => [],
  },
})

const scrollRef = ref(null)

function bubbleClass(message) {
  if (message.role === 'user') {
    return 'bg-primary text-white'
  }
  if (message.error) {
    return 'border border-red-200 bg-red-50 text-red-800'
  }
  if (message.pending) {
    return 'border border-primary/10 bg-primary/5 text-dark/70'
  }
  if (message.aborted) {
    return 'border border-amber-200 bg-amber-50 text-dark/80'
  }
  return 'border border-primary/10 bg-white text-dark/80'
}

async function scrollToBottom() {
  await nextTick()
  if (!scrollRef.value) {
    return
  }
  scrollRef.value.scrollTop = scrollRef.value.scrollHeight
}

watch(
  () => props.messages.length,
  () => {
    scrollToBottom()
  },
  { immediate: true },
)
</script>
