<script setup>
import AppHeader from './components/common/AppHeader.vue'
import AppFooter from './components/common/AppFooter.vue'
import ChatbotFloatingButton from './components/chatbot/ChatbotFloatingButton.vue'
</script>

<template>
  <div id="app-root">
    <AppHeader />

    <main class="page-container">
      <router-view />
    </main>

    <AppFooter />
    <ChatbotFloatingButton />
  </div>
</template>

<style scoped>
#app-root {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
}

.page-container {
  width: 100%;
  max-width: 1126px;
  margin: 0 auto;
  padding: 36px 20px;
  box-sizing: border-box;
  flex: 1;
}

@media (max-width: 768px) {
  .page-container {
    padding: 20px 16px;
  }
}
</style>