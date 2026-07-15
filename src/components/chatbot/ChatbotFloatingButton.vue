<script setup>
import { nextTick, onBeforeUnmount, ref } from 'vue'

const isOpen = ref(false)
const inputMessage = ref('')
const isLoading = ref(false)
const messageListRef = ref(null)

let replyTimerId = null

const INITIAL_MESSAGE =
  '안녕하세요! 대전·충청 지역 정보를 찾아드리는 LocalHub AI예요. 지역이나 원하는 장소 유형을 자유롭게 말씀해 주세요.'

const suggestedQuestions = [
  '대전 관광지 3곳 알려줘',
  '유성구 음식점 찾아줘',
  '당일치기 장소를 조합해줘',
  '사진 있는 장소 알려줘',
]

const messages = ref(createInitialMessages())

function createMessageId() {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random()}`
}

function createInitialMessages() {
  return [
    {
      id: createMessageId(),
      role: 'assistant',
      text: INITIAL_MESSAGE,
    },
  ]
}

function openChatbot() {
  isOpen.value = true
  scrollToBottom()
}

function closeChatbot() {
  isOpen.value = false
}

async function scrollToBottom() {
  await nextTick()

  if (messageListRef.value) {
    messageListRef.value.scrollTop =
      messageListRef.value.scrollHeight
  }
}

async function startNewConversation() {
  if (isLoading.value) {
    return
  }

  const shouldReset = window.confirm(
    '새 대화를 시작할까요?\n현재 대화 내용이 초기화됩니다.',
  )

  if (!shouldReset) {
    return
  }

  if (replyTimerId) {
    window.clearTimeout(replyTimerId)
    replyTimerId = null
  }

  messages.value = createInitialMessages()
  inputMessage.value = ''
  isLoading.value = false

  await scrollToBottom()
}

async function sendMessage(message = inputMessage.value) {
  const trimmedMessage = String(message ?? '').trim()

  if (!trimmedMessage || isLoading.value) {
    return
  }

  messages.value.push({
    id: createMessageId(),
    role: 'user',
    text: trimmedMessage,
  })

  inputMessage.value = ''
  isLoading.value = true

  await scrollToBottom()

  // OpenAI API 연결 전 채팅 흐름 확인을 위한 임시 응답입니다.
  replyTimerId = window.setTimeout(async () => {
    messages.value.push({
      id: createMessageId(),
      role: 'assistant',
      text: `“${trimmedMessage}” 질문을 확인했어요. 다음 단계에서 LocalHub 지역 데이터를 검색해 실제 장소를 안내하도록 연결할 예정입니다.`,
    })

    isLoading.value = false
    replyTimerId = null

    await scrollToBottom()
  }, 700)
}

function selectSuggestedQuestion(question) {
  sendMessage(question)
}

onBeforeUnmount(() => {
  if (replyTimerId) {
    window.clearTimeout(replyTimerId)
  }
})
</script>

<template>
  <div class="chatbot-root">
    <button
      v-if="!isOpen"
      type="button"
      class="floating-button"
      aria-label="LocalHub AI 챗봇 열기"
      @click="openChatbot"
    >
      <span
        class="floating-icon"
        aria-hidden="true"
      >
        AI
      </span>

      <span class="floating-label">
        지역 정보 물어보기
      </span>
    </button>

    <section
      v-else
      class="chatbot-panel"
      aria-label="LocalHub AI 챗봇"
    >
      <header class="chatbot-header">
        <div>
          <strong class="chatbot-title">
            LocalHub AI
          </strong>

          <p class="chatbot-subtitle">
            대전·충청 지역 정보 가이드
          </p>
        </div>

        <div class="header-actions">
          <button
            type="button"
            class="new-chat-button"
            aria-label="현재 대화를 지우고 새 대화 시작"
            :disabled="isLoading"
            @click="startNewConversation"
          >
            새 대화
          </button>

          <button
            type="button"
            class="close-button"
            aria-label="챗봇 닫기"
            @click="closeChatbot"
          >
            ×
          </button>
        </div>
      </header>

      <div
        ref="messageListRef"
        class="message-list"
        aria-live="polite"
      >
        <div
          v-for="message in messages"
          :key="message.id"
          class="message-row"
          :class="`message-row--${message.role}`"
        >
          <div
            class="message-bubble"
            :class="`message-bubble--${message.role}`"
          >
            {{ message.text }}
          </div>
        </div>

        <div
          v-if="isLoading"
          class="message-row message-row--assistant"
        >
          <div
            class="message-bubble message-bubble--assistant loading-message"
          >
            <span class="loading-dot"></span>
            <span class="loading-dot"></span>
            <span class="loading-dot"></span>

            <span class="sr-only">
              답변을 준비하고 있습니다.
            </span>
          </div>
        </div>
      </div>

      <div class="suggestion-section">
        <p class="suggestion-title">
          이런 질문을 해보세요
        </p>

        <div class="suggestion-list">
          <button
            v-for="question in suggestedQuestions"
            :key="question"
            type="button"
            class="suggestion-button"
            :disabled="isLoading"
            @click="selectSuggestedQuestion(question)"
          >
            {{ question }}
          </button>
        </div>
      </div>

      <form
        class="chat-form"
        @submit.prevent="sendMessage()"
      >
        <label
          for="chatbot-input"
          class="sr-only"
        >
          지역 정보 질문 입력
        </label>

        <textarea
          id="chatbot-input"
          v-model="inputMessage"
          class="chat-input"
          rows="1"
          maxlength="300"
          placeholder="예: 유성구 음식점 3곳 알려줘"
          :disabled="isLoading"
          @keydown.enter.exact.prevent="sendMessage()"
        ></textarea>

        <button
          type="submit"
          class="send-button"
          :disabled="!inputMessage.trim() || isLoading"
        >
          전송
        </button>
      </form>
    </section>
  </div>
</template>

<style scoped>
.chatbot-root {
  position: relative;
  z-index: 1000;
}

.floating-button {
  position: fixed;
  right: 24px;
  bottom: 24px;

  display: flex;
  align-items: center;
  gap: 10px;

  padding: 10px 16px 10px 10px;

  border: 0;
  border-radius: 999px;
  background: #0ea5a4;
  box-shadow: 0 12px 30px rgba(14, 165, 164, 0.3);

  color: #ffffff;
  cursor: pointer;
}

.floating-button:hover {
  background: #0b8f8e;
}

.floating-button:focus-visible {
  outline: 3px solid rgba(14, 165, 164, 0.3);
  outline-offset: 3px;
}

.floating-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 40px;
  height: 40px;

  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);

  font-size: 14px;
  font-weight: 800;
}

.floating-label {
  font-size: 14px;
  font-weight: 700;
}

.chatbot-panel {
  position: fixed;
  right: 24px;
  bottom: 24px;

  display: flex;
  flex-direction: column;

  width: min(390px, calc(100vw - 32px));
  height: min(680px, calc(100vh - 48px));

  overflow: hidden;

  border: 1px solid var(--border, #dbe5e5);
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 20px 50px rgba(22, 53, 53, 0.22);
}

.chatbot-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  padding: 18px 20px;

  background: #0ea5a4;
  color: #ffffff;
}

.chatbot-title {
  display: block;
  font-size: 18px;
}

.chatbot-subtitle {
  margin: 4px 0 0;

  color: rgba(255, 255, 255, 0.82);
  font-size: 12px;
}

.header-actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 8px;
}

.new-chat-button {
  padding: 7px 10px;

  border: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.1);

  color: #ffffff;
  font-size: 12px;
  font-weight: 700;

  cursor: pointer;
}

.new-chat-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.new-chat-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 36px;
  height: 36px;

  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);

  color: #ffffff;
  font-size: 26px;
  line-height: 1;

  cursor: pointer;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.24);
}

.new-chat-button:focus-visible,
.close-button:focus-visible {
  outline: 3px solid rgba(255, 255, 255, 0.45);
  outline-offset: 2px;
}

.message-list {
  flex: 1;
  overflow-y: auto;

  padding: 18px;

  background: #f7fbfb;
}

.message-row {
  display: flex;
  margin-bottom: 12px;
}

.message-row--user {
  justify-content: flex-end;
}

.message-row--assistant {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 82%;
  padding: 11px 13px;
  border-radius: 16px;

  font-size: 14px;
  line-height: 1.55;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.message-bubble--assistant {
  border: 1px solid var(--border, #dbe5e5);
  border-bottom-left-radius: 4px;
  background: #ffffff;

  color: var(--text, #435858);
}

.message-bubble--user {
  border-bottom-right-radius: 4px;
  background: #0ea5a4;

  color: #ffffff;
}

.loading-message {
  display: flex;
  align-items: center;
  gap: 5px;

  min-height: 42px;
}

.loading-dot {
  width: 7px;
  height: 7px;

  border-radius: 50%;
  background: #0ea5a4;

  animation: loading-bounce 1.2s infinite ease-in-out;
}

.loading-dot:nth-child(2) {
  animation-delay: 0.15s;
}

.loading-dot:nth-child(3) {
  animation-delay: 0.3s;
}

.suggestion-section {
  padding: 12px 16px;

  border-top: 1px solid var(--border, #dbe5e5);
  background: #ffffff;
}

.suggestion-title {
  margin: 0 0 8px;

  color: var(--text-muted, #647575);
  font-size: 12px;
}

.suggestion-list {
  display: flex;
  gap: 7px;

  overflow-x: auto;
  padding-bottom: 2px;
}

.suggestion-button {
  flex: 0 0 auto;

  padding: 7px 10px;

  border: 1px solid rgba(14, 165, 164, 0.3);
  border-radius: 999px;
  background: rgba(14, 165, 164, 0.07);

  color: #087f7e;
  font-size: 12px;

  cursor: pointer;
}

.suggestion-button:hover:not(:disabled) {
  background: rgba(14, 165, 164, 0.14);
}

.suggestion-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.chat-form {
  display: flex;
  align-items: flex-end;
  gap: 8px;

  padding: 14px 16px;

  border-top: 1px solid var(--border, #dbe5e5);
  background: #ffffff;
}

.chat-input {
  flex: 1;

  min-height: 44px;
  max-height: 100px;
  padding: 11px 12px;

  resize: none;

  border: 1px solid var(--border, #dbe5e5);
  border-radius: 12px;

  color: var(--text, #435858);
  font: inherit;
  line-height: 1.4;
}

.chat-input:focus {
  border-color: #0ea5a4;
  outline: 3px solid rgba(14, 165, 164, 0.14);
}

.send-button {
  min-width: 60px;
  height: 44px;
  padding: 0 14px;

  border: 0;
  border-radius: 12px;
  background: #0ea5a4;

  color: #ffffff;
  font-weight: 700;

  cursor: pointer;
}

.send-button:hover:not(:disabled) {
  background: #0b8f8e;
}

.send-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.sr-only {
  position: absolute;

  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;

  overflow: hidden;
  clip: rect(0, 0, 0, 0);

  white-space: nowrap;
  border: 0;
}

@keyframes loading-bounce {
  0%,
  80%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }

  40% {
    transform: translateY(-5px);
    opacity: 1;
  }
}

@media (max-width: 640px) {
  .floating-button {
    right: 16px;
    bottom: 16px;
  }

  .floating-label {
    display: none;
  }

  .chatbot-panel {
    inset: 0;

    width: 100%;
    height: 100dvh;
    max-width: none;

    border: 0;
    border-radius: 0;
  }

  .chatbot-header {
    padding-top: max(18px, env(safe-area-inset-top));
  }

  .chat-form {
    padding-bottom: max(14px, env(safe-area-inset-bottom));
  }
}
</style>