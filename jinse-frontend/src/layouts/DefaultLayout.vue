<template>
  <div class="relative flex min-h-screen flex-col bg-gradient-to-b from-light to-secondary/10 text-dark">
    <div class="pointer-events-none absolute inset-0 bg-paper-texture opacity-60"></div>
    <AppNav />
    <main class="relative container mx-auto flex flex-1 min-h-0 px-4 pt-24 pb-10">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import AppNav from '../components/AppNav.vue'
</script>
