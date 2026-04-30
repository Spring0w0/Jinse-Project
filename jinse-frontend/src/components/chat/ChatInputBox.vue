<template>
  <div class="border-t border-primary/10 bg-white px-4 py-4">
    <div class="mb-3 flex flex-wrap gap-2">
      <button
        v-for="question in quickQuestions"
        :key="question"
        type="button"
        class="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary transition hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-55"
        :disabled="disabled"
        @click="$emit('quick-question', question)"
      >
        {{ question }}
      </button>
    </div>

    <div class="flex items-end gap-3">
      <textarea
        :value="modelValue"
        rows="2"
        class="min-h-[76px] flex-1 resize-none rounded-2xl border border-primary/20 px-4 py-3 text-sm leading-6 text-dark/80 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-dark/55"
        :disabled="disabled"
        :placeholder="disabled ? '智能体正在思考或输出中，请先等待或点击停止生成。' : '继续追问当前诗歌内容...'"
        @input="$emit('update:modelValue', $event.target.value)"
        @keydown.enter.exact.prevent="$emit('send')"
      ></textarea>
      <button
        type="button"
        class="inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-5 text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="disabled || !modelValue.trim()"
        @click="$emit('send')"
      >
        <i class="fa" :class="disabled ? 'fa-spinner fa-spin' : 'fa-paper-plane'" aria-hidden="true"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: String,
    default: '',
  },
})

defineEmits(['quick-question', 'send', 'update:modelValue'])

const quickQuestions = [
  '这首诗的核心情感是什么？',
  '这一句最值得抓住的意象是什么？',
  '我应该从哪个角度理解这首诗？',
]
</script>
