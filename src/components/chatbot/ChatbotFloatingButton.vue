<script setup>
import { ref } from 'vue'

const isOpen = ref(false)

function toggleChatbot() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="chatbot-root">
    <div
      v-if="isOpen"
      id="chatbot-preview-panel"
      class="panel"
      role="status"
    >
      LocalHub 챗봇을 준비하고 있습니다.
    </div>

    <button
      type="button"
      class="fab"
      aria-controls="chatbot-preview-panel"
      :aria-expanded="isOpen"
      :aria-label="isOpen ? '챗봇 안내 닫기' : '챗봇 안내 열기'"
      @click="toggleChatbot"
    >
      AI
    </button>
  </div>
</template>

<style scoped>
.chatbot-root {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 60;

  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.fab {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 56px;
  height: 56px;
  padding: 0;

  border: 0;
  border-radius: 999px;
  background: #0ea5a4;
  color: white;
  box-shadow: var(--shadow, 0 10px 30px rgba(0, 0, 0, 0.15));

  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.fab:hover {
  background: #0b8f8e;
}

.fab:focus-visible {
  outline: 3px solid rgba(14, 165, 164, 0.25);
  outline-offset: 3px;
}

.panel {
  max-width: 220px;
  padding: 12px 14px;

  border: 1px solid var(--border, #dbe5e5);
  border-radius: 10px;
  background: white;
  color: var(--text, #263838);
  box-shadow: var(--shadow, 0 10px 30px rgba(0, 0, 0, 0.15));

  font-size: 14px;
  line-height: 1.5;
}

@media (max-width: 420px) {
  .chatbot-root {
    right: 14px;
    bottom: 14px;
  }

  .fab {
    width: 48px;
    height: 48px;
  }

  .panel {
    max-width: 180px;
    font-size: 13px;
  }
}
</style>