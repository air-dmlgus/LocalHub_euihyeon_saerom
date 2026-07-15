<script setup>
import { nextTick, onBeforeUnmount, ref } from 'vue'
import { searchPlacesFromQuestion } from '../../services/placeSearch.js'
import ChatPlaceCard from './ChatPlaceCard.vue'

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
  '대전 당일치기 장소를 조합해줘',
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
      intent: 'message',
      text: INITIAL_MESSAGE,
      places: [],
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

function createAssistantResponseText(result) {
  if (result.intent === 'limitation') {
    return result.limitationMessage
  }

  if (result.needsClarification) {
    return '당일치기 또는 데이트 장소를 조합하려면 대전, 유성구, 공주시처럼 원하는 지역을 함께 입력해 주세요.'
  }

  if (result.intent === 'count') {
    return `입력한 조건에 맞는 장소는 총 ${result.total.toLocaleString(
      'ko-KR',
    )}개입니다.`
  }

  if (result.total === 0) {
    return '입력한 조건에 맞는 장소를 현재 LocalHub 데이터에서 찾지 못했어요. 지역명이나 장소 유형을 바꿔 다시 질문해 주세요.'
  }

  if (result.intent === 'course') {
    return [
      '제공된 데이터를 바탕으로 같은 지역의 방문 후보를 조합했어요.',
      '',
      `${result.places.length}곳을 아래 카드에서 확인해 주세요.`,
      '',
      '운영시간과 실제 이동 경로는 제공 데이터에 없어 방문 전에 별도로 확인해 주세요.',
    ].join('\n')
  }

  if (result.total > result.places.length) {
    return `입력한 조건에 맞는 장소는 총 ${result.total.toLocaleString(
      'ko-KR',
    )}곳이며, 그중 ${result.places.length}곳을 소개할게요.`
  }

  return `입력한 조건에 맞는 장소 ${result.total.toLocaleString(
    'ko-KR',
  )}곳을 찾았어요.`
}

function addSearchErrorMessage() {
  messages.value.push({
    id: createMessageId(),
    role: 'assistant',
    intent: 'error',
    text: '지역 정보를 검색하는 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.',
    places: [],
  })
}

async function sendMessage(message = inputMessage.value) {
  const trimmedMessage = String(message ?? '').trim()

  if (!trimmedMessage || isLoading.value) {
    return
  }

  messages.value.push({
    id: createMessageId(),
    role: 'user',
    intent: 'message',
    text: trimmedMessage,
    places: [],
  })

  inputMessage.value = ''
  isLoading.value = true

  await scrollToBottom()

  let searchResult

  try {
    searchResult = searchPlacesFromQuestion(trimmedMessage)
  } catch (error) {
    console.error('장소 검색 중 오류가 발생했습니다.', error)

    addSearchErrorMessage()
    isLoading.value = false

    await scrollToBottom()
    return
  }

  replyTimerId = window.setTimeout(async () => {
    try {
      const responseText =
        createAssistantResponseText(searchResult)

      const shouldShowPlaceCards = [
        'search',
        'course',
      ].includes(searchResult.intent)

      messages.value.push({
        id: createMessageId(),
        role: 'assistant',
        intent: searchResult.intent,
        text: responseText,
        places: shouldShowPlaceCards
          ? searchResult.places
          : [],
      })
    } catch (error) {
      console.error(
        '챗봇 답변 생성 중 오류가 발생했습니다.',
        error,
      )

      addSearchErrorMessage()
    } finally {
      isLoading.value = false
      replyTimerId = null

      await scrollToBottom()
    }
  }, 350)
}

function selectSuggestedQuestion(question) {
  sendMessage(question)
}

onBeforeUnmount(() => {
  if (replyTimerId) {
    window.clearTimeout(replyTimerId)
    replyTimerId = null
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
            class="message-content"
            :class="`message-content--${message.role}`"
          >
            <div
              class="message-bubble"
              :class="`message-bubble--${message.role}`"
            >
              {{ message.text }}
            </div>

            <div
              v-if="
                message.role === 'assistant' &&
                ['search', 'course'].includes(
                  message.intent,
                ) &&
                message.places &&
                message.places.length > 0
              "
              class="chat-place-list"
              aria-label="추천 장소 목록"
            >
              <div
                v-for="place in message.places"
                :key="place.id"
                class="chat-place-slide"
              >
                <ChatPlaceCard :place="place" />
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="isLoading"
          class="message-row message-row--assistant"
        >
          <div
            class="message-content message-content--assistant"
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

.message-content {
  display: flex;
  flex-direction: column;
  gap: 10px;

  max-width: 88%;
  min-width: 0;
}

.message-content--user {
  align-items: flex-end;
}

.message-content--assistant {
  align-items: stretch;
  width: 100%;
}

.message-bubble {
  max-width: 100%;
  padding: 11px 13px;

  border-radius: 16px;

  font-size: 14px;
  line-height: 1.55;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.message-bubble--assistant {
  align-self: flex-start;

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

.chat-place-list {
  display: flex;
  gap: 10px;

  width: 100%;
  padding: 2px 2px 10px;

  overflow-x: auto;
  overflow-y: hidden;

  scroll-snap-type: x mandatory;
  overscroll-behavior-x: contain;
  scrollbar-width: thin;
  -webkit-overflow-scrolling: touch;
}

.chat-place-slide {
  flex: 0 0 88%;
  min-width: 0;

  scroll-snap-align: start;
  scroll-snap-stop: always;
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
    padding-top: max(
      18px,
      env(safe-area-inset-top)
    );
  }

  .chat-place-slide {
    flex-basis: 82%;
  }

  .chat-form {
    padding-bottom: max(
      14px,
      env(safe-area-inset-bottom)
    );
  }
}
</style>