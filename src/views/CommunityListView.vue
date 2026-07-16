<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BaseButton from '../components/common/BaseButton.vue'
import {
  loadPosts,
  getHotPosts,
  getLikedPosts,
  getReportedPosts,
} from '../utils/storage.js'

const router = useRouter()
const route = useRoute()

const posts = ref([])
const likedPosts = ref([])
const reportedPosts = ref([])

const searchKeyword = ref('')
const activeTab = ref('all')
const currentPage = ref(1)
const selectedCategory = ref('전체')

const ITEMS_PER_PAGE = 10

const categories = [
  '전체',
  '일반',
  '추천',
  '팁',
  '질문',
  '소식',
  '맛집',
  '명소',
  '축제',
  '자유',
  '여행코스',
  '숙박',
  '쇼핑',
  '문화시설',
  '레포츠',
  '기타',
]

const refreshPosts = () => {
  try {
    posts.value = loadPosts() || []
    likedPosts.value = getLikedPosts() || []
    reportedPosts.value = getReportedPosts() || []
    currentPage.value = 1
  } catch (error) {
    console.error('게시글 새로고침 실패:', error)

    posts.value = []
    likedPosts.value = []
    reportedPosts.value = []
  }
}

onMounted(() => {
  refreshPosts()
})

watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/community') {
      refreshPosts()
    }
  },
)

watch(searchKeyword, () => {
  currentPage.value = 1
})

const filteredPosts = computed(() => {
  let result = []

  if (activeTab.value === 'hot') {
    result = getHotPosts() || []
  } else {
    result = posts.value || []
  }

  if (
    selectedCategory.value &&
    selectedCategory.value !== '전체'
  ) {
    result = result.filter(
      (post) => post.category === selectedCategory.value,
    )
  }

  const keyword = searchKeyword.value.trim().toLowerCase()

  if (keyword) {
    result = result.filter((post) => {
      const title = String(post.title || '').toLowerCase()
      const content = String(post.content || '').toLowerCase()

      return title.includes(keyword) || content.includes(keyword)
    })
  }

  return result
})

const totalPages = computed(() => {
  return Math.max(
    1,
    Math.ceil(filteredPosts.value.length / ITEMS_PER_PAGE),
  )
})

const displayPosts = computed(() => {
  if (filteredPosts.value.length === 0) {
    return []
  }

  const startIndex =
    (currentPage.value - 1) * ITEMS_PER_PAGE

  return filteredPosts.value.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  )
})

const pageNumbers = computed(() => {
  const pages = []

  for (let page = 1; page <= totalPages.value; page += 1) {
    pages.push(page)
  }

  return pages
})

const hotPostCount = computed(() => {
  return (getHotPosts() || []).length
})

const goHome = () => {
  router.push('/')
}

const goToDetail = (id) => {
  router.push(`/community/${id}`)
}

const goToWrite = () => {
  router.push('/community/new')
}

const switchTab = (tab) => {
  activeTab.value = tab
  searchKeyword.value = ''
  currentPage.value = 1
}

const onCategoryChange = () => {
  currentPage.value = 1
}

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) {
    return
  }

  currentPage.value = page

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

const previousPage = () => {
  if (currentPage.value > 1) {
    goToPage(currentPage.value - 1)
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    goToPage(currentPage.value + 1)
  }
}

const getPostPreview = (content) => {
  const text = String(content || '')

  if (text.length > 100) {
    return `${text.substring(0, 100)}...`
  }

  return text
}

const formatDate = (dateValue) => {
  if (!dateValue) {
    return ''
  }

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleDateString('ko-KR')
}
</script>

<template>
  <section class="community-list">
    <div class="header">
      <button
        type="button"
        class="header-back"
        aria-label="홈으로 이동"
        @click="goHome"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M15 18l-6-6 6-6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>

        <span>홈으로</span>
      </button>

      <p class="eyebrow">LOCAL COMMUNITY</p>
      <h1>지역 커뮤니티</h1>

      <p class="description">
        주민과 관광객이 지역 이야기를 공유하는 공간입니다.
      </p>

      <div class="notice">
        <p>
          💡 이 게시판은 현재 브라우저와 기기에서만 게시글이
          보입니다. 다른 브라우저나 기기에서는 게시글이 표시되지
          않습니다.
        </p>
      </div>
    </div>

    <div class="tabs">
      <button
        type="button"
        class="tab-btn"
        :class="{ active: activeTab === 'all' }"
        @click="switchTab('all')"
      >
        전체 ({{ posts.length }})
      </button>

      <button
        type="button"
        class="tab-btn"
        :class="{ active: activeTab === 'hot' }"
        @click="switchTab('hot')"
      >
        🔥 HOT ({{ hotPostCount }})
      </button>
    </div>

    <div class="controls">
      <select
        v-model="selectedCategory"
        class="category-select"
        aria-label="게시글 카테고리"
        @change="onCategoryChange"
      >
        <option
          v-for="category in categories"
          :key="category"
          :value="category"
        >
          {{ category }}
        </option>
      </select>

      <input
        v-model="searchKeyword"
        type="search"
        class="search-input"
        placeholder="게시글 검색..."
        aria-label="게시글 검색"
      />

      <BaseButton
        class="write-btn"
        @click="goToWrite"
      >
        ✍️ 게시글 작성
      </BaseButton>
    </div>

    <div
      v-if="displayPosts.length === 0"
      class="empty-state"
    >
      <p>게시글이 없습니다.</p>

      <p
        v-if="searchKeyword"
        class="sub"
      >
        검색 결과가 없습니다.
      </p>

      <p
        v-else
        class="sub"
      >
        첫 번째 게시글을 작성해보세요! ✨
      </p>
    </div>

    <div
      v-else
      class="posts-list"
    >
      <article
        v-for="post in displayPosts"
        :key="post.id"
        class="post-card"
        tabindex="0"
        role="button"
        @click="goToDetail(post.id)"
        @keydown.enter="goToDetail(post.id)"
        @keydown.space.prevent="goToDetail(post.id)"
      >
        <div class="post-header">
          <div class="post-title-area">
            <span
              v-if="(post.likes ?? 0) >= 5"
              class="hot-badge"
            >
              🔥
            </span>

            <span class="category-badge">
              {{ post.category || '일반' }}
            </span>

            <h3 class="post-title">
              {{ post.title }}
            </h3>
          </div>

          <span class="post-date">
            {{ formatDate(post.createdAt) }}
          </span>
        </div>

        <div
          v-if="post.image"
          class="post-image-thumb"
        >
          <img
            :src="post.image"
            :alt="post.title || '게시글 첨부 이미지'"
          />
        </div>

        <p class="post-content">
          {{ getPostPreview(post.content) }}
        </p>

        <div class="post-stats">
          <span class="stat">
            👍 {{ post.likes ?? 0 }}
          </span>

          <span class="stat">
            💬 {{ post.comments?.length ?? 0 }}
          </span>
        </div>
      </article>
    </div>

    <div
      v-if="totalPages > 1"
      class="pagination"
    >
      <button
        type="button"
        class="pagination-btn"
        :disabled="currentPage === 1"
        @click="previousPage"
      >
        ← 이전
      </button>

      <div class="page-numbers">
        <button
          v-for="page in pageNumbers"
          :key="page"
          type="button"
          class="page-btn"
          :class="{ active: currentPage === page }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
      </div>

      <button
        type="button"
        class="pagination-btn"
        :disabled="currentPage === totalPages"
        @click="nextPage"
      >
        다음 →
      </button>
    </div>

    <div
      v-if="filteredPosts.length > 0"
      class="page-info"
    >
      페이지 {{ currentPage }} / {{ totalPages }}
      (총 {{ filteredPosts.length }}개)
    </div>
  </section>
</template>

<style scoped>
.community-list {
  max-width: 900px;
  margin: 0 auto;
}

.header {
  position: relative;
  padding-top: 8px;
  margin-bottom: 24px;
}

.header-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: var(--surface, #ffffff);
  color: var(--primary-dark, #0b8f8e);
  border: 1px solid rgba(14, 165, 164, 0.12);
  border-radius: 999px;
  box-shadow: 0 6px 18px rgba(14, 165, 164, 0.06);
  font-family: inherit;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.header-back svg {
  color: var(--primary-dark, #0b8f8e);
}

.header-back:hover {
  border-color: rgba(14, 165, 164, 0.3);
  box-shadow: 0 8px 20px rgba(14, 165, 164, 0.1);
  transform: translateY(-2px);
}

.header-back:focus-visible {
  outline: 3px solid rgba(14, 165, 164, 0.2);
  outline-offset: 2px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #087f7e;
  font-size: 14px;
  font-weight: 700;
}

h1 {
  margin: 0 0 16px;
  color: var(--text-heading, #163535);
  font-size: 32px;
}

.description {
  margin: 0;
  color: var(--text, #435858);
  line-height: 1.7;
}

.notice {
  margin-top: 20px;
  padding: 16px;
  background: rgba(14, 165, 164, 0.08);
  color: var(--text, #435858);
  border-left: 4px solid #0ea5a4;
  border-radius: 8px;
  font-size: 14px;
}

.notice p {
  margin: 0;
  line-height: 1.6;
}

.tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.tab-btn {
  padding: 12px 16px;
  background: none;
  color: #777777;
  border: none;
  border-bottom: 3px solid transparent;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition:
    color 0.2s ease,
    border-color 0.2s ease;
}

.tab-btn:hover {
  color: var(--text-heading, #163535);
}

.tab-btn.active {
  color: #0ea5a4;
  border-bottom-color: #0ea5a4;
}

.controls {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
}

.category-select {
  padding: 10px 12px;
  background: #ffffff;
  border: 1px solid #cccccc;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
}

.search-input {
  flex: 1;
  min-width: 0;
  padding: 12px 16px;
  border: 1px solid #cccccc;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
}

.search-input:focus,
.category-select:focus {
  outline: none;
  border-color: #0ea5a4;
  box-shadow: 0 0 0 3px rgba(14, 165, 164, 0.1);
}

.write-btn {
  white-space: nowrap;
}

.empty-state {
  padding: 60px 20px;
  color: var(--text, #435858);
  text-align: center;
}

.empty-state p {
  margin: 0;
}

.empty-state .sub {
  margin-top: 8px;
  color: #888888;
  font-size: 14px;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.post-card {
  padding: 20px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.post-card:hover {
  background: rgba(14, 165, 164, 0.03);
  border-color: #0ea5a4;
  box-shadow: 0 4px 12px rgba(14, 165, 164, 0.1);
  transform: translateY(-2px);
}

.post-card:focus-visible {
  outline: 3px solid rgba(14, 165, 164, 0.2);
  outline-offset: 2px;
}

.post-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.post-title-area {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.hot-badge {
  flex-shrink: 0;
  font-size: 16px;
}

.category-badge {
  display: inline-block;
  flex-shrink: 0;
  padding: 4px 10px;
  background: rgba(14, 165, 164, 0.1);
  color: #0ea5a4;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.post-title {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: var(--text-heading, #163535);
  font-size: 18px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-date {
  flex-shrink: 0;
  color: #888888;
  font-size: 12px;
  white-space: nowrap;
}

.post-image-thumb {
  width: 80px;
  height: 80px;
  margin-bottom: 12px;
  overflow: hidden;
  border-radius: 8px;
}

.post-image-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-content {
  display: -webkit-box;
  margin: 0 0 12px;
  overflow: hidden;
  color: var(--text, #435858);
  line-height: 1.6;
  text-overflow: ellipsis;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.post-stats {
  display: flex;
  gap: 16px;
  color: #777777;
  font-size: 13px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 32px 0;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 12px;
}

.pagination-btn {
  padding: 10px 16px;
  background: #ffffff;
  color: var(--text, #435858);
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    color 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  color: #0ea5a4;
  border-color: #0ea5a4;
}

.pagination-btn:disabled {
  color: #aaaaaa;
  cursor: not-allowed;
  opacity: 0.6;
}

.page-numbers {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
}

.page-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  background: #ffffff;
  color: var(--text, #435858);
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.page-btn:hover,
.page-btn.active {
  background: #0ea5a4;
  color: #ffffff;
  border-color: #0ea5a4;
}

.page-info {
  margin-bottom: 20px;
  color: #777777;
  font-size: 13px;
  text-align: center;
}

@media (max-width: 768px) {
  .community-list {
    width: 100%;
  }

  h1 {
    font-size: 24px;
  }

  .controls {
    flex-direction: column;
    align-items: stretch;
  }

  .category-select,
  .search-input,
  .write-btn {
    width: 100%;
  }

  .post-header {
    flex-direction: column;
  }

  .post-title-area {
    width: 100%;
  }

  .post-date {
    align-self: flex-end;
  }

  .post-image-thumb {
    width: 60px;
    height: 60px;
  }

  .pagination {
    flex-direction: column;
    gap: 8px;
  }

  .page-numbers {
    max-height: 100px;
    overflow-y: auto;
  }

  .page-btn {
    width: 36px;
    height: 36px;
    font-size: 12px;
  }
}
</style>