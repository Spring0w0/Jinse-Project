<template>
  <aside class="flex h-full flex-col border-r border-primary/10 bg-white/95">
    <div class="flex-1 overflow-y-auto px-3 py-3">
      <div
        v-for="session in sessions"
        :key="session.id"
        class="mb-2 flex items-center gap-2 rounded-xl border bg-white px-3 py-3 transition"
        :class="session.id === currentSessionId ? 'border-primary bg-primary/10' : 'border-primary/10 bg-white hover:bg-primary/5'"
      >
        <button
          type="button"
          class="min-w-0 flex-1 text-left"
          @click="$emit('select-session', session.id)"
        >
          <div class="truncate text-sm font-semibold text-dark/85">{{ session.title || '新会话' }}</div>
          <div class="mt-2 text-[11px] text-dark/40">{{ formatTime(session.updatedAt) }}</div>
        </button>
        <button
          type="button"
          class="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 transition hover:bg-red-100"
          title="删除会话"
          @click.stop="$emit('delete-session', session)"
        >
          <i class="fa fa-trash-o" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
defineProps({
  currentSessionId: {
    type: String,
    default: '',
  },
  sessions: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['delete-session', 'select-session'])

function formatTime(value) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')
  return `${month}-${day} ${hours}:${minutes}`
}
</script>
