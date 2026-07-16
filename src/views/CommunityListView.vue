<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BaseButton from '../components/common/BaseButton.vue'
import { loadPosts, getHotPosts, getLikedPosts, getReportedPosts } from '../utils/storage.js'

const router = useRouter()
const goHome = () => {
  router.push('/')
}
const route = useRoute()
const posts = ref([])
const searchKeyword = ref('')
const activeTab = ref('all')
const currentPage = ref(1)
const selectedCategory = ref('전체')

const likedPosts = ref([])
const reportedPosts = ref([])

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
  '기타'
]

const refreshPosts = () => {
  try {
    posts.value = loadPosts() || []
    likedPosts.value = getLikedPosts() || []
    reportedPosts.value = getReportedPosts() || []
    currentPage.value = 1
  } catch (error) {
    console.error('새로고침 실패:', error)
  }
}

onMounted(() => {
  refreshPosts()
})

watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/community') refreshPosts()
  }
)

const filteredPosts = computed(() => {
  let result = []

  if (activeTab.value === 'hot') {
    result = getHotPosts() || []
  } else {
    result = posts.value || []
  }

  // 카테고리 필터 적용
  if (selectedCategory.value && selectedCategory.value !== '전체') {
    result = result.filter((p) => p.category === selectedCategory.value)
  }

  // 검색어 필터 적용
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(
      (post) =>
        (post.title && post.title.toLowerCase().includes(keyword)) ||
        (post.content && post.content.toLowerCase().includes(keyword))
    )
  }

  return result
})

const totalPages = computed(() => {
  if (!filteredPosts.value) return 0
  return Math.max(1, Math.ceil(filteredPosts.value.length / ITEMS_PER_PAGE))
})

const displayPosts = computed(() => {
  if (!filteredPosts.value || filteredPosts.value.length === 0) return []
  const startIndex = (currentPage.value - 1) * ITEMS_PER_PAGE
  return filteredPosts.value.slice(startIndex, startIndex + ITEMS_PER_PAGE)
})

const pageNumbers = computed(() => {
  const pages = []
  const max = totalPages.value
  for (let i = 1; i <= max; i++) pages.push(i)
  return pages
})

const goToDetail = (id) => router.push(`/community/${id}`)
const goToWrite = () => router.push('/community/new')

const switchTab = (tab) => {
  activeTab.value = tab
  searchKeyword.value = ''
  currentPage.value = 1
}

const onCategoryChange = () => {
  currentPage.value = 1
}

const goToPage = (page) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const previousPage = () => {
  if (currentPage.value > 1) goToPage(currentPage.value - 1)
}
const nextPage = () => {
  if (currentPage.value < totalPages.value) goToPage(currentPage.value + 1)
}
</script>

<template>
  <section class="community-list">
    <div class="header">
      <button @click="goHome" class="back-btn header-back" aria-label="홈으로 이동">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  <span>홈으로</span>
</button>
      <p class="eyebrow">LOCAL COMMUNITY</p>
      <h1>지역 커뮤니티</h1>
      <p class="description">주민과 관광객이 지역 이야기를 공유하는 공간입니다.</p>
      <div class="notice">
        <p>
          💡 이 게시판은 현재 브라우저와 기기에서만 게시글이 보입니다.
          다른 브라우저나 기기에서는 게시글이 표시되지 않습니다.
        </p>
      </div>
    </div>

    <div class="tabs">
      <button @click="switchTab('all')" :class="{ active: activeTab === 'all' }" class="tab-btn">
        전체 ({{ posts.length }})
      </button>
      <button @click="switchTab('hot')" :class="{ active: activeTab === 'hot' }" class="tab-btn">
        🔥 HOT ({{ getHotPosts().length }})
      </button>
    </div>

    <div class="controls">
      <select v-model="selectedCategory" @change="onCategoryChange" class="category-select">
        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>

      <input v-model="searchKeyword" type="text" class="search-input" placeholder="게시글 검색..." />

      <BaseButton @click="goToWrite" class="write-btn">✍️ 게시글 작성</BaseButton>
    </div>

    <div v-if="displayPosts.length === 0" class="empty-state">
      <p>게시글이 없습니다.</p>
      <p v-if="searchKeyword" class="sub">검색 결과가 없습니다.</p>
      <p v-else class="sub">첫 번째 게시글을 작성해보세요! ✨</p>
    </div>

    <div v-else class="posts-list">
      <article v-for="post in displayPosts" :key="post.id" class="post-card" @click="goToDetail(post.id)">
        <div class="post-header">
          <div class="post-title-area">
            <span v-if="post.likes >= 5" class="hot-badge">🔥</span>
            <span class="category-badge">{{ post.category }}</span>
            <h3 class="post-title">{{ post.title }}</h3>
          </div>
          <span class="post-date">{{ new Date(post.createdAt).toLocaleDateString('ko-KR') }}</span>
        </div>

        <div v-if="post.image" class="post-image-thumb"><img :src="post.image" :alt="post.title" /></div>

        <p class="post-content">
          {{ post.content.substring(0, 100) }}{{ post.content.length > 100 ? '...' : '' }}
        </p>

        <div class="post-stats">
          <span class="stat">👍 {{ post.likes ?? 0 }}</span>
          <span class="stat">💬 {{ post.comments?.length ?? 0 }}</span>
        </div>
      </article>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button @click="previousPage" :disabled="currentPage === 1" class="pagination-btn">← 이전</button>
      <div class="page-numbers">
        <button v-for="page in pageNumbers" :key="page" @click="goToPage(page)" :class="{ active: currentPage === page }" class="page-btn">{{ page }}</button>
      </div>
      <button @click="nextPage" :disabled="currentPage === totalPages" class="pagination-btn">다음 →</button>
    </div>

    <div v-if="filteredPosts.length > 0" class="page-info">
      페이지 {{ currentPage }} / {{ totalPages }} (총 {{ filteredPosts.length }}개)
    </div>
  </section>
</template>

<style scoped>
/* 기존 스타일 그대로 유지 (필요시 수정) */
.community-list { max-width: 900px; margin: 0 auto; }
.header { margin-bottom: 24px; }
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--surface, #fff);
  color: var(--primary-dark, #0b8f8e);
  border: 1px solid rgba(14,165,164,0.12);
  border-radius: 999px;
  box-shadow: 0 6px 18px rgba(14,165,164,0.06);
  font-weight: 700;
  cursor: pointer;
}
.back-btn svg { color: var(--primary-dark, #0b8f8e); }
.back-btn:hover { transform: translateY(-2px); }
.header-back { margin-bottom: 12px; } /* eyebrow 위에 올릴 때 간격 조정용 */
.eyebrow { margin: 0 0 8px; color: #087f7e; font-size: 14px; font-weight: 700; }
h1 { margin: 0 0 16px; color: var(--text-heading, #163535); font-size: 32px; }
.description { color: var(--text, #435858); line-height: 1.7; margin: 0; }
.notice { margin-top: 20px; padding: 16px; background: rgba(14, 165, 164, 0.08); border-left: 4px solid #0ea5a4; border-radius: 8px; color: var(--text, #435858); font-size: 14px; }
.tabs { display: flex; gap: 12px; margin-bottom: 20px; border-bottom: 1px solid #e0e0e0; }
.tab-btn { padding: 12px 16px; background: none; border: none; border-bottom: 3px solid transparent; color: #999; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s; }
.tab-btn:hover { color: var(--text-heading, #163535); }
.tab-btn.active { color: #0ea5a4; border-bottom-color: #0ea5a4; }
.controls { display: flex; gap: 12px; margin-bottom: 28px; align-items: center; }
.category-select { padding: 10px 12px; border: 1px solid #ccc; border-radius: 8px; background: #fff; }
.search-input { flex: 1; padding: 12px 16px; border: 1px solid #ccc; border-radius: 8px; font-size: 14px; font-family: inherit; }
.search-input:focus { outline: none; border-color: #0ea5a4; box-shadow: 0 0 0 3px rgba(14, 165, 164, 0.1); }
.write-btn { white-space: nowrap; }
.empty-state { text-align: center; padding: 60px 20px; color: var(--text, #435858); }
.posts-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 32px; }
.post-card { padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; cursor: pointer; transition: all 0.2s ease; }
.post-card:hover { border-color: #0ea5a4; background: rgba(14, 165, 164, 0.03); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(14, 165, 164, 0.1); }
.post-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
.post-title-area { display: flex; align-items: center; gap: 8px; flex: 1; }
.hot-badge { font-size: 16px; flex-shrink: 0; }
.category-badge { display: inline-block; padding: 4px 10px; background: rgba(14, 165, 164, 0.1); color: #0ea5a4; border-radius: 20px; font-size: 11px; font-weight: 600; white-space: nowrap; flex-shrink: 0; }
.post-title { margin: 0; color: var(--text-heading, #163535); font-size: 18px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.post-date { color: #999; font-size: 12px; white-space: nowrap; flex-shrink: 0; }
.post-image-thumb { width: 80px; height: 80px; margin-bottom: 12px; border-radius: 8px; overflow: hidden; flex-shrink: 0; }
.post-image-thumb img { width: 100%; height: 100%; object-fit: cover; }
.post-content { margin: 0 0 12px; color: var(--text, #435858); line-height: 1.6; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-clamp: 2; }
.post-stats { display: flex; gap: 16px; font-size: 13px; color: #999; }
.stat { display: flex; align-items: center; gap: 4px; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 12px; margin: 32px 0; padding: 20px; background: #f9f9f9; border-radius: 12px; flex-wrap: wrap; }
.pagination-btn { padding: 10px 16px; background: white; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px; font-weight: 600; color: var(--text, #435858); cursor: pointer; transition: all 0.2s; }
.page-numbers { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
.page-btn { width: 40px; height: 40px; padding: 0; background: white; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 13px; font-weight: 600; color: var(--text, #435858); cursor: pointer; transition: all 0.2s; }
.page-info { text-align: center; color: #999; font-size: 13px; margin-bottom: 20px; }
@media (max-width: 768px) {
  h1 { font-size: 24px; }
  .controls { flex-direction: column; }
  .search-input { width: 100%; }
  .write-btn { width: 100%; }
  .post-image-thumb { width: 60px; height: 60px; }
  .pagination { flex-direction: column; gap: 8px; }
  .page-numbers { max-height: 100px; overflow-y: auto; }
  .page-btn { width: 36px; height: 36px; font-size: 12px; }
}
</style>