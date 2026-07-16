<script setup>
import {
  nextTick,
  ref,
} from 'vue'
import {
  searchPlacesFromQuestion,
} from '../../services/placeSearch.js'
import {
  searchCommunityPostsFromQuestion,
} from '../../services/communitySearch.js'
import {
  generateOpenAIAnswer,
} from '../../services/openai.js'
import ChatPlaceCard from './ChatPlaceCard.vue'

const isOpen = ref(false)
const inputMessage = ref('')
const isLoading = ref(false)
const messageListRef = ref(null)

const lastSearchFilters = ref(null)
const lastShownPlaces = ref([])
const conversationSessionId = ref(0)

const INITIAL_MESSAGE =
  '안녕하세요! 대전·충청 지역 정보를 찾아드리는 LocalHub AI예요. 지역이나 원하는 장소 유형을 자유롭게 말씀해 주세요.'

const FOLLOW_UP_GUIDE =
  '대전·충청 지역 정보에 대해 더 궁금한 점이 있다면 이어서 질문해 주세요.'

const suggestedQuestions = [
  '대전 관광지 3곳 알려줘',
  '유성구 음식점 찾아줘',
  '대전 당일치기 장소를 조합해줘',
  '공주시 맛집 찾아줘',
  '커뮤니티 게시글 보여줘',
]

const messages = ref(
  createInitialMessages(),
)

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
      places: [],
    },
  ]
}

function normalizeUserText(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/알려져/g, '알려줘')
    .replace(/번재/g, '번째')
    .replace(/\s+/g, ' ')
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

  const shouldReset =
    window.confirm(
      '새 대화를 시작할까요?\n현재 대화 내용이 초기화됩니다.',
    )

  if (!shouldReset) {
    return
  }

  conversationSessionId.value += 1

  messages.value =
    createInitialMessages()

  inputMessage.value = ''
  isLoading.value = false

  lastSearchFilters.value = null
  lastShownPlaces.value = []

  await scrollToBottom()
}

function addAssistantMessage({
  text,
  intent = null,
  places = [],
}) {
  messages.value.push({
    id: createMessageId(),
    role: 'assistant',
    text,
    intent,
    places,
  })
}

async function addDirectResponse({
  text,
  intent = null,
  places = [],
}) {
  addAssistantMessage({
    text,
    intent,
    places,
  })

  isLoading.value = false

  await scrollToBottom()
}

function getScopeResponse(question) {
  const normalized =
    normalizeUserText(question)

  const asksForSecret =
    [
      'api 키',
      'api키',
      'apikey',
      '시스템 프롬프트',
      '시스템 지시문',
      '내부 설정',
    ].some((keyword) =>
      normalized.includes(keyword),
    )

  if (asksForSecret) {
    return [
      '보안상 API 키나 내부 설정 정보는 안내할 수 없어요.',
      'LocalHub에서는 대전·충청 지역 정보와 현재 브라우저의 커뮤니티 게시글을 검색할 수 있어요.',
    ].join('\n')
  }

  const asksToFabricate =
    (
      normalized.includes('무시') &&
      normalized.includes('검색')
    ) ||
    [
      '임의로 만들어',
      '지어내',
      '가짜 장소',
      '없는 장소 만들어',
    ].some((keyword) =>
      normalized.includes(keyword),
    )

  if (asksToFabricate) {
    return [
      'LocalHub는 제공된 실제 지역 데이터만 안내해요.',
      '대전·충청의 지역명과 관광지, 음식점, 숙박 같은 유형을 함께 질문해 주세요.',
    ].join('\n')
  }

  return null
}

function extractReferenceIndex(question) {
  const normalized =
    normalizeUserText(question)

  const numericMatch =
    normalized.match(
      /(\d{1,2})\s*번째/,
    )

  if (numericMatch) {
    return Number(numericMatch[1]) - 1
  }

  const ordinalEntries = [
    ['첫', 0],
    ['두', 1],
    ['세', 2],
    ['네', 3],
    ['다섯', 4],
    ['여섯', 5],
    ['일곱', 6],
    ['여덟', 7],
    ['아홉', 8],
    ['열', 9],
  ]

  for (
    const [word, index]
    of ordinalEntries
  ) {
    const pattern =
      new RegExp(
        `${word}\\s*번째`,
      )

    if (pattern.test(normalized)) {
      return index
    }
  }

  return null
}

function isPlaceReferenceQuestion(
  question,
) {
  const normalized =
    normalizeUserText(question)

  return (
    extractReferenceIndex(
      normalized,
    ) !== null &&
    (
      normalized.includes('주소') ||
      normalized.includes('위치')
    )
  )
}

function createPlaceReferenceResponse(
  question,
) {
  const index =
    extractReferenceIndex(question)

  if (
    index === null ||
    lastShownPlaces.value.length === 0
  ) {
    return [
      '먼저 지역이나 장소 유형을 검색해 주세요.',
      '예: “유성구 음식점 3곳 알려줘”',
    ].join('\n')
  }

  const place =
    lastShownPlaces.value[index]

  if (!place) {
    return `이전 결과에는 ${index + 1}번째 장소가 없어요. 표시된 장소 범위 안에서 다시 선택해 주세요.`
  }

  const title =
    String(place.title ?? '').trim() ||
    `${index + 1}번째 장소`

  const address =
    String(
      place.address ??
      place.addr1 ??
      '',
    ).trim()

  if (!address) {
    return `${title}의 주소 정보는 현재 데이터에 없어요.`
  }

  return `${index + 1}번째 장소인 ${title}의 주소는 ${address}입니다.`
}

function createEmptySearchResult() {
  return {
    intent: 'community',

    filters: {
      location: null,
      category: null,
      lodgingSubtype: null,
      requiresImage: false,
      limit: 0,
      isFollowUp: false,
    },

    total: 0,
    places: [],
    needsClarification: false,
  }
}

function formatLocation(location) {
  const labels = {
    대전광역시: '대전',
    충청남도: '충남',
    충청북도: '충북',
  }

  return (
    labels[location] ??
    location ??
    ''
  )
}

function createCountResponse(result) {
  const location =
    formatLocation(
      result.filters?.location,
    )

  if (result.subtypeLimited) {
    const prefix =
      location
        ? `${location}의 `
        : ''

    return [
      `${prefix}숙박 데이터 중 장소명에 ‘${result.lodgingSubtype}’이(가) 포함된 곳은 총 ${result.total.toLocaleString('ko-KR')}곳이에요.`,
      '현재 데이터에는 숙박 세부 유형 필드가 없어 실제 전체 수와는 다를 수 있어요.',
    ].join('\n')
  }

  const category =
    result.filters?.category

  const target =
    [location, category]
      .filter(Boolean)
      .join(' ')

  return `${target || '입력한 조건에 맞는 장소'}는 총 ${result.total.toLocaleString('ko-KR')}곳이에요.`
}

function createLimitationResponse(
  result,
) {
  const placeName =
    result.places?.[0]?.title
      ? `${result.places[0].title}의 `
      : '해당 '

  const responses = {
    hours:
      `현재 LocalHub 데이터에는 ${placeName}운영시간 정보가 없어요. 방문 전 해당 장소의 공식 채널에서 확인해 주세요.`,

    price:
      `현재 LocalHub 데이터에는 ${placeName}가격이나 이용요금 정보가 없어요. 방문 전 해당 장소의 공식 채널에서 확인해 주세요.`,

    holiday:
      `현재 LocalHub 데이터에는 ${placeName}휴무일 정보가 없어요. 방문 전 해당 장소의 공식 채널에서 확인해 주세요.`,

    menu:
      `현재 LocalHub 데이터에는 ${placeName}상세 메뉴와 가격 정보가 없어요.`,

    reservation:
      `현재 LocalHub에서는 ${placeName}실시간 예약 가능 여부를 확인할 수 없어요.`,

    parking:
      `현재 LocalHub 데이터에는 ${placeName}주차 가능 여부 정보가 없어요.`,

    weather:
      '현재 LocalHub에서는 실시간 날씨 정보를 제공하지 않아요. 기상청이나 날씨 앱에서 확인해 주세요.',

    festivalDate:
      '현재 LocalHub 데이터에는 축제 시작일과 종료일 전용 정보가 없어 정확한 일정을 안내하기 어려워요.',

    realtime:
      '현재 LocalHub에서는 실시간 혼잡도나 현장 상황을 확인할 수 없어요.',
  }

  return (
    responses[result.limitationType] ??
    '현재 LocalHub 데이터에는 요청하신 정보가 없어요.'
  )
}

function createPlaceNameList(places) {
  return places
    .map((place) =>
      `- ${place.title}`,
    )
    .join('\n')
}

function createCappedResponse(result) {
  const location =
    formatLocation(
      result.filters?.location,
    )

  const category =
    result.filters?.category

  const target =
    [location, category]
      .filter(Boolean)
      .join(' ')

  const placeNames =
    createPlaceNameList(
      result.places,
    )

  return [
    `한 번에 최대 ${result.maxLimit}곳까지 보여드릴 수 있어 ${target || '조건에 맞는 장소'} ${result.places.length}곳을 찾았어요.`,
    '',
    placeNames,
    '',
    '더 많은 장소는 지역 정보 화면에서 둘러볼 수 있어요.',
    FOLLOW_UP_GUIDE,
  ].join('\n')
}

function createCommunityResponse(
  communityResult,
) {
  const postLines =
    communityResult.posts.map(
      (post) => {
        const preview =
          post.contentPreview
            ? `\n  ${post.contentPreview}`
            : ''

        return `- ${post.title} · ${post.category}${preview}`
      },
    )

  return [
    `관련 커뮤니티 게시글 ${communityResult.total.toLocaleString('ko-KR')}개를 찾았어요.`,
    '',
    ...postLines,
    '',
    '커뮤니티와 지역 정보에 대해 더 궁금한 점이 있다면 이어서 질문해 주세요.',
  ].join('\n')
}

function createFallbackResponseText(
  result,
) {
  const placeNames =
    createPlaceNameList(
      result.places,
    )

  if (result.intent === 'course') {
    return [
      `${result.places.length}곳의 방문 후보를 찾았어요.`,
      '',
      placeNames,
      '',
      FOLLOW_UP_GUIDE,
    ].join('\n')
  }

  return [
    `${result.places.length}곳을 찾았어요.`,
    '',
    placeNames,
    '',
    FOLLOW_UP_GUIDE,
  ].join('\n')
}

function createApiErrorMessage(error) {
  if (
    error?.code ===
    'OPENAI_API_KEY_MISSING'
  ) {
    return 'OpenAI API 키가 설정되지 않았어요. 프로젝트 최상위의 .env 파일을 확인해 주세요.'
  }

  if (
    error?.status === 401 ||
    error?.code ===
      'invalid_api_key'
  ) {
    return 'OpenAI API 인증에 실패했어요. API 키가 올바른지 확인해 주세요.'
  }

  if (error?.status === 403) {
    return 'OpenAI API 요청이 거부됐어요. 제공받은 키의 모델 접근 권한을 확인해 주세요.'
  }

  if (
    error?.code ===
      'model_not_found' ||
    error?.status === 404
  ) {
    return '설정한 OpenAI 모델을 사용할 수 없어요.'
  }

  if (error?.status === 429) {
    return 'OpenAI API 요청 한도 또는 사용량 한도에 도달했어요. 잠시 후 다시 시도해 주세요.'
  }

  if (
    error?.code ===
    'OPENAI_REQUEST_TIMEOUT'
  ) {
    return 'AI 답변 요청 시간이 초과되었어요. 잠시 후 다시 시도해 주세요.'
  }

  if (
    error?.code ===
    'OPENAI_NETWORK_ERROR'
  ) {
    return 'OpenAI API에 연결하지 못했어요. 인터넷 연결을 확인해 주세요.'
  }

  if (
    error?.code ===
    'OPENAI_EMPTY_RESPONSE'
  ) {
    return 'AI가 답변을 생성하지 못했어요. 질문을 조금 다르게 입력해 주세요.'
  }

  return 'AI 답변을 불러오는 중 오류가 발생했어요.'
}

function updateSearchState(
  searchResult,
) {
  if (
    searchResult.needsClarification ||
    searchResult.intent ===
      'limitation'
  ) {
    return
  }

  const {
    location,
    category,
    lodgingSubtype,
    requiresImage,
  } = searchResult.filters

  if (
    location ||
    category ||
    lodgingSubtype ||
    requiresImage
  ) {
    lastSearchFilters.value = {
      location,
      category,
      lodgingSubtype,
      requiresImage,
    }
  }

  if (
    ['search', 'course'].includes(
      searchResult.intent,
    ) &&
    searchResult.places.length > 0
  ) {
    lastShownPlaces.value = [
      ...searchResult.places,
    ]
  }
}

async function sendMessage(
  message = inputMessage.value,
) {
  const trimmedMessage =
    String(message ?? '').trim()

  if (
    !trimmedMessage ||
    isLoading.value
  ) {
    return
  }

  const conversationBeforeSend =
    messages.value
      .filter((item) =>
        [
          'user',
          'assistant',
        ].includes(item.role),
      )
      .slice(-6)

  messages.value.push({
    id: createMessageId(),
    role: 'user',
    text: trimmedMessage,
    places: [],
  })

  inputMessage.value = ''

  await scrollToBottom()

  const scopeResponse =
    getScopeResponse(
      trimmedMessage,
    )

  if (scopeResponse) {
    await addDirectResponse({
      text: scopeResponse,
    })

    return
  }

  if (
    isPlaceReferenceQuestion(
      trimmedMessage,
    )
  ) {
    await addDirectResponse({
      text:
        createPlaceReferenceResponse(
          trimmedMessage,
        ),
    })

    return
  }

  isLoading.value = true

  let searchResult
  let communityResult

  try {
    communityResult =
      searchCommunityPostsFromQuestion(
        trimmedMessage,
      )

    if (
      communityResult
        .isCommunityQuery
    ) {
      searchResult =
        createEmptySearchResult()
    } else {
      searchResult =
        searchPlacesFromQuestion(
          trimmedMessage,
          lastSearchFilters.value,
        )
    }
  } catch (error) {
    console.error(
      'LocalHub 검색 중 오류가 발생했습니다.',
      error,
    )

    await addDirectResponse({
      text:
        '지역 정보를 검색하는 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.',
    })

    return
  }

  if (
    communityResult
      .isCommunityQuery
  ) {
    if (communityResult.total === 0) {
      await addDirectResponse({
        text:
          '현재 브라우저의 커뮤니티에서 해당 게시글을 찾지 못했어요.',

        intent: 'community',
      })

      return
    }

    await addDirectResponse({
      text:
        createCommunityResponse(
          communityResult,
        ),

      intent: 'community',
    })

    return
  }

  if (searchResult.invalidLimit) {
    await addDirectResponse({
      text:
        '찾을 장소 개수는 1에서 10 사이로 입력해 주세요.',
    })

    return
  }

  if (
    searchResult
      .needsClarification
  ) {
    const isFollowUpWithoutContext =
      searchResult
        .clarificationReason ===
        'FOLLOW_UP_WITHOUT_CONTEXT'

    await addDirectResponse({
      text:
        isFollowUpWithoutContext
          ? '어떤 결과를 기준으로 찾을지 먼저 알려주세요. 예: “대전 관광지 2곳 알려줘”'
          : '당일치기나 데이트 장소를 조합하려면 원하는 지역을 함께 입력해 주세요. 예: “대전 당일치기 장소를 조합해줘”',
    })

    return
  }

  if (
    searchResult.intent ===
      'limitation'
  ) {
    await addDirectResponse({
      text:
        createLimitationResponse(
          searchResult,
        ),
    })

    return
  }

  if (searchResult.total === 0) {
    await addDirectResponse({
      text:
        searchResult
          .subtypeLimited
          ? createCountResponse(
              searchResult,
            )
          : '조건에 맞는 장소를 LocalHub 데이터에서 찾지 못했어요. 지역명이나 장소 유형을 바꿔 다시 검색해 주세요.',
    })

    return
  }

  updateSearchState(
    searchResult,
  )

  if (
    searchResult.intent ===
      'count'
  ) {
    await addDirectResponse({
      text:
        createCountResponse(
          searchResult,
        ),

      intent: 'count',
    })

    return
  }

  if (
    searchResult
      .limitWasCapped
  ) {
    await addDirectResponse({
      text:
        createCappedResponse(
          searchResult,
        ),

      intent:
        searchResult.intent,

      places:
        searchResult.places,
    })

    return
  }

  const requestSessionId =
    conversationSessionId.value

  try {
    const responseText =
      await generateOpenAIAnswer({
        question:
          trimmedMessage,

        searchResult,

        communityResult,

        conversation:
          conversationBeforeSend,
      })

    if (
      requestSessionId !==
      conversationSessionId.value
    ) {
      return
    }

    addAssistantMessage({
      text: responseText,

      intent:
        searchResult.intent,

      places:
        searchResult.places,
    })
  } catch (error) {
    console.error(
      'OpenAI API 답변 생성 중 오류가 발생했습니다.',
      {
        status: error?.status,
        code: error?.code,
        message: error?.message,
        details: error?.details,
      },
    )

    if (
      requestSessionId !==
      conversationSessionId.value
    ) {
      return
    }

    addAssistantMessage({
      text: [
        createApiErrorMessage(
          error,
        ),
        '',
        createFallbackResponseText(
          searchResult,
        ),
      ].join('\n'),

      intent:
        searchResult.intent,

      places:
        searchResult.places,
    })
  } finally {
    if (
      requestSessionId ===
      conversationSessionId.value
    ) {
      isLoading.value = false

      await scrollToBottom()
    }
  }
}

function selectSuggestedQuestion(
  question,
) {
  sendMessage(question)
}
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
                <ChatPlaceCard
                  :place="place"
                />
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
            @click="
              selectSuggestedQuestion(
                question,
              )
            "
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
          @keydown.enter.exact.prevent="
            sendMessage()
          "
        ></textarea>

        <button
          type="submit"
          class="send-button"
          :disabled="
            !inputMessage.trim() ||
            isLoading
          "
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
  box-shadow:
    0 12px 30px
    rgba(14, 165, 164, 0.3);

  color: #ffffff;
  cursor: pointer;
}

.floating-button:hover {
  background: #0b8f8e;
}

.floating-button:focus-visible {
  outline:
    3px solid
    rgba(14, 165, 164, 0.3);

  outline-offset: 3px;
}

.floating-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 40px;
  height: 40px;

  border-radius: 50%;
  background:
    rgba(255, 255, 255, 0.18);

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

  width:
    min(
      390px,
      calc(100vw - 32px)
    );

  height:
    min(
      680px,
      calc(100vh - 48px)
    );

  overflow: hidden;

  border:
    1px solid
    var(--border, #dbe5e5);

  border-radius: 20px;
  background: #ffffff;

  box-shadow:
    0 20px 50px
    rgba(22, 53, 53, 0.22);
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

  color:
    rgba(255, 255, 255, 0.82);

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

  border:
    1px solid
    rgba(255, 255, 255, 0.45);

  border-radius: 9px;
  background:
    rgba(255, 255, 255, 0.1);

  color: #ffffff;
  font-size: 12px;
  font-weight: 700;

  cursor: pointer;
}

.new-chat-button:hover:not(:disabled) {
  background:
    rgba(255, 255, 255, 0.2);
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
  background:
    rgba(255, 255, 255, 0.14);

  color: #ffffff;
  font-size: 26px;
  line-height: 1;

  cursor: pointer;
}

.close-button:hover {
  background:
    rgba(255, 255, 255, 0.24);
}

.new-chat-button:focus-visible,
.close-button:focus-visible {
  outline:
    3px solid
    rgba(255, 255, 255, 0.45);

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
  gap: 8px;

  max-width: 82%;
}

.message-bubble {
  max-width: 100%;
  padding: 11px 13px;

  border-radius: 16px;

  font-size: 14px;
  line-height: 1.65;

  white-space: pre-wrap;

  word-break: keep-all;
  overflow-wrap: break-word;
  line-break: strict;
}

.message-bubble--assistant {
  border:
    1px solid
    var(--border, #dbe5e5);

  border-bottom-left-radius: 4px;

  background: #ffffff;

  color:
    var(--text, #435858);
}

.message-bubble--user {
  border-bottom-right-radius: 4px;
  background: #0ea5a4;

  color: #ffffff;
}

.message-row--assistant
.message-content {
  width: 100%;
  max-width: 100%;
}

.message-row--assistant
.message-bubble {
  align-self: flex-start;
  max-width: 82%;
}

.chat-place-list {
  display: flex;
  gap: 12px;

  width: 100%;

  overflow-x: auto;
  overflow-y: hidden;

  padding: 2px 2px 10px;

  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  overscroll-behavior-x: contain;
}

.chat-place-slide {
  flex:
    0 0
    min(
      280px,
      calc(100% - 16px)
    );

  min-width: 0;

  scroll-snap-align: start;
}

.chat-place-list::-webkit-scrollbar {
  height: 7px;
}

.chat-place-list::-webkit-scrollbar-thumb {
  border-radius: 999px;

  background:
    rgba(14, 165, 164, 0.35);
}

.chat-place-list::-webkit-scrollbar-track {
  background: transparent;
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

  animation:
    loading-bounce
    1.2s
    infinite
    ease-in-out;
}

.loading-dot:nth-child(2) {
  animation-delay: 0.15s;
}

.loading-dot:nth-child(3) {
  animation-delay: 0.3s;
}

.suggestion-section {
  padding: 12px 16px;

  border-top:
    1px solid
    var(--border, #dbe5e5);

  background: #ffffff;
}

.suggestion-title {
  margin: 0 0 8px;

  color:
    var(--text-muted, #647575);

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

  border:
    1px solid
    rgba(14, 165, 164, 0.3);

  border-radius: 999px;

  background:
    rgba(14, 165, 164, 0.07);

  color: #087f7e;
  font-size: 12px;

  cursor: pointer;
}

.suggestion-button:hover:not(:disabled) {
  background:
    rgba(14, 165, 164, 0.14);
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

  border-top:
    1px solid
    var(--border, #dbe5e5);

  background: #ffffff;
}

.chat-input {
  flex: 1;

  min-height: 44px;
  max-height: 100px;

  padding: 11px 12px;

  resize: none;

  border:
    1px solid
    var(--border, #dbe5e5);

  border-radius: 12px;

  color:
    var(--text, #435858);

  font: inherit;
  line-height: 1.4;

  word-break: keep-all;
  overflow-wrap: break-word;
}

.chat-input:focus {
  border-color: #0ea5a4;

  outline:
    3px solid
    rgba(14, 165, 164, 0.14);
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

  clip:
    rect(
      0,
      0,
      0,
      0
    );

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
    padding-top:
      max(
        18px,
        env(safe-area-inset-top)
      );
  }

  .chat-form {
    padding-bottom:
      max(
        14px,
        env(safe-area-inset-bottom)
      );
  }
}
</style>