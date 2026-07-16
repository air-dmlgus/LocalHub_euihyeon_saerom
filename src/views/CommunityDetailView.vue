<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BaseButton from '../components/common/BaseButton.vue'
import {
  getPostById,
  deletePost,
  toggleLike,
  getLikedPosts,
  addComment,
  deleteComment,
  reportPost,
  getReportedPosts,
} from '../utils/storage.js'

const router = useRouter()
const route = useRoute()

const post = ref(null)
const passwordInput = ref('')
const commentInput = ref('')
const commentPassword = ref('')            // 댓글 작성용 비밀번호
const deletingCommentId = ref(null)        // 삭제할 댓글 id
const deletingCommentPassword = ref('')    // 댓글 삭제용 비밀번호 입력
const commentError = ref('')               // 댓글 관련 에러

const deleteMode = ref(false)
const editMode = ref(false)
const reportMode = ref(false)
const error = ref('')
const loading = ref(false)

const likedPosts = ref([])
const reportedPosts = ref([])
const isLiked = ref(false)
const hasReported = ref(false)

onMounted(() => {
  const foundPost = getPostById(route.params.id)
  if (!foundPost) {
    error.value = '게시글을 찾을 수 없습니다.'
  } else {
    post.value = foundPost
  }

  likedPosts.value = getLikedPosts()
  reportedPosts.value = getReportedPosts()

  if (post.value) {
    isLiked.value = likedPosts.value.includes(post.value.id)
    hasReported.value = reportedPosts.value.includes(post.value.id)
  }
})

const formattedDate = computed(() => {
  if (!post.value) return ''
  return new Date(post.value.createdAt).toLocaleString('ko-KR')
})

const goBack = () => {
  router.push('/community')
}

const handleLike = () => {
  if (!post.value) return
  toggleLike(post.value.id)
  isLiked.value = !isLiked.value
  post.value = getPostById(post.value.id)
}

const goToEdit = () => {
  editMode.value = true
  passwordInput.value = ''
  error.value = ''
}

const cancelEdit = () => {
  editMode.value = false
  passwordInput.value = ''
  error.value = ''
}

const cancelDelete = () => {
  deleteMode.value = false
  passwordInput.value = ''
  error.value = ''
}

const cancelReport = () => {
  reportMode.value = false
  error.value = ''
}

const confirmEdit = () => {
  error.value = ''

  if (!passwordInput.value) {
    error.value = '비밀번호를 입력해주세요.'
    return
  }

  if (passwordInput.value !== post.value.password) {
    error.value = '비밀번호가 일치하지 않습니다.'
    return
  }

  router.push(`/community/${post.value.id}/edit`)
}

const confirmDelete = () => {
  error.value = ''

  if (!passwordInput.value) {
    error.value = '비밀번호를 입력해주세요.'
    return
  }

  if (passwordInput.value !== post.value.password) {
    error.value = '비밀번호가 일치하지 않습니다.'
    return
  }

  loading.value = true
  try {
    deletePost(post.value.id)
    loading.value = false
    setTimeout(() => router.push('/community'), 150)
  } catch (err) {
    error.value = '삭제 중 오류가 발생했습니다.'
    loading.value = false
  }
}

// 댓글 작성 (비밀번호 전달)
const submitComment = () => {
  commentError.value = ''
  if (!commentInput.value.trim()) {
    commentError.value = '댓글 내용을 입력해주세요.'
    return
  }
  if (!/^\d{4,}$/.test(commentPassword.value)) {
    commentError.value = '댓글 비밀번호는 숫자 4자 이상이어야 합니다.'
    return
  }

  addComment(post.value.id, commentInput.value, commentPassword.value)
  post.value = getPostById(post.value.id)
  commentInput.value = ''
  commentPassword.value = ''
}

// 댓글 삭제 처리
const confirmDeleteComment = () => {
  commentError.value = ''
  if (!deletingCommentPassword.value) {
    commentError.value = '비밀번호를 입력해주세요.'
    return
  }
  const ok = deleteComment(post.value.id, deletingCommentId.value, deletingCommentPassword.value)
  if (!ok) {
    commentError.value = '비밀번호가 올바르지 않거나 삭제할 수 없습니다.'
    return
  }
  post.value = getPostById(post.value.id)
  deletingCommentId.value = null
  deletingCommentPassword.value = ''
}

const cancelDeleteComment = () => {
  deletingCommentId.value = null
  deletingCommentPassword.value = ''
  commentError.value = ''
}

const removeComment = (commentId) => {
  // 기존 호출 방식 유지하지 않음 — 삭제는 모달을 통해서만
}

const handleReport = () => {
  if (hasReported.value) {
    error.value = '이미 신고한 게시글입니다.'
    return
  }
  reportPost(post.value.id)
  hasReported.value = true
  reportMode.value = false
}

// 엔터키로 비밀번호 확인
const handlePasswordKeyup = (e, action) => {
  if (e.key === 'Enter') {
    if (action === 'edit') {
      confirmEdit()
    } else if (action === 'delete') {
      confirmDelete()
    }
  }
}
</script>

<template>
  <section class="community-detail">
    <div class="detail-header">
      <button @click="goBack" class="back-btn" aria-label="목록으로 이동">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>목록으로</span>
      </button>
    </div>

    <div v-if="error && !post" class="error-state">
      <p>{{ error }}</p>
      <BaseButton @click="goBack">목록 보기</BaseButton>
    </div>

    <article v-else-if="post" class="detail-container">
      <header class="post-header">
        <div class="header-left">
          <span class="category-badge">{{ post.category }}</span>
          <h1 class="post-title">{{ post.title }}</h1>
        </div>
        <div class="post-meta">
          <span class="post-date">{{ formattedDate }}</span>
        </div>
      </header>
 

      <div v-if="post.image" class="post-image-container">
        <img :src="post.image" :alt="post.title" class="post-image" />
      </div>

      <div class="post-body">
        <p class="post-content">{{ post.content }}</p>
      </div>

      <div class="post-actions-bar">
        <div class="stats">
          <button @click="handleLike" :class="['action-btn', isLiked ? 'liked' : '']" aria-label="like">
            <span class="icon">{{ isLiked ? '❤️' : '🤍' }}</span>
            <span class="count">{{ post.likes ?? 0 }}</span>
          </button>

          <div class="comment-count" title="댓글 수">
            💬 <span class="count">{{ post.comments?.length ?? 0 }}</span>
          </div>
        </div>

        <div class="actions">
          <button @click.stop="goToEdit" class="btn btn-edit">✏️ 수정</button>
          <button @click.stop="deleteMode = true" class="btn btn-delete">🗑️ 삭제</button>
          <button
            @click.stop="reportMode = true"
            :disabled="hasReported"
            class="btn btn-report"
          >
            {{ hasReported ? '🚫 신고 완료' : '⚠️ 신고' }}
          </button>
        </div>
      </div>

      <div class="comments-section">
        <h3>댓글 ({{ post.comments?.length ?? 0 }})</h3>

        <div class="comment-input-area">
          <textarea
            v-model="commentInput"
            placeholder="익명으로 댓글을 작성해주세요."
            class="comment-input"
            rows="2"
            maxlength="500"
          ></textarea>

          <input
            v-model="commentPassword"
            type="password"
            inputmode="numeric"
            placeholder="댓글 삭제용 비밀번호 (숫자 4자 이상)"
            class="comment-pw-input"
          />

          <div class="comment-controls">
            <span class="char-count">{{ commentInput.length }}/500</span>
            <button @click="submitComment" class="btn-comment-submit">작성</button>
          </div>

          <div v-if="commentError" class="error-message">⚠️ {{ commentError }}</div>
        </div>

        <div v-if="!post.comments || post.comments.length === 0" class="no-comments">
          <p>첫 댓글을 달아주세요! 👋</p>
        </div>

        <div v-else class="comments-list">
          <div v-for="comment in post.comments" :key="comment.id" class="comment-item">
            <div class="comment-header">
              <strong class="anonymous-name">익명{{ comment.anonymousNumber }}</strong>
              <span class="comment-date">
                {{ new Date(comment.createdAt).toLocaleString('ko-KR', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }) }}
              </span>
            </div>
            <p class="comment-text">{{ comment.text }}</p>
            <div class="comment-actions">
              <button
                @click.stop="deletingCommentId = comment.id; deletingCommentPassword=''; commentError='';"
                class="btn-delete-comment"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="deletingCommentId" class="modal-overlay">
        <div class="modal">
          <h3>댓글 삭제</h3>
          <p>댓글 삭제를 위해 비밀번호를 입력하세요.</p>

          <input
            v-model="deletingCommentPassword"
            type="password"
            inputmode="numeric"
            class="modal-input"
            placeholder="댓글 비밀번호"
            @keyup.enter="confirmDeleteComment"
            autofocus
          />

          <div v-if="commentError" class="error-message">⚠️ {{ commentError }}</div>

          <div class="modal-actions">
            <button @click="cancelDeleteComment" class="btn btn-cancel">취소</button>
            <button @click="confirmDeleteComment" class="btn btn-danger">삭제</button>
          </div>
        </div>
      </div>

      <div v-if="editMode" class="modal-overlay">
        <div class="modal">
          <h3>게시글 수정</h3>
          <p>비밀번호를 입력해주세요.</p>

          <input
            v-model="passwordInput"
            type="password"
            class="modal-input"
            placeholder="비밀번호"
            @keyup="(e) => handlePasswordKeyup(e, 'edit')"
            autofocus
          />

          <div v-if="error" class="error-message">⚠️ {{ error }}</div>

          <div class="modal-actions">
            <button @click="cancelEdit" class="btn btn-cancel">취소</button>
            <button @click="confirmEdit" class="btn btn-confirm">확인</button>
          </div>
        </div>
      </div>

      <!-- 삭제 확인을 위한 강조 모달 (기존 inline-delete 대신 사용) -->
<div v-if="deleteMode" class="modal-overlay">
  <div class="modal danger">
    <h3>게시글 삭제</h3>
    <p class="sub">이 작업은 되돌릴 수 없습니다. 게시글을 영구 삭제하시겠습니까?</p>

    <p class="confirm-note">삭제 확인을 위해 비밀번호를 입력해주세요.</p>

    <input
      v-model="passwordInput"
      type="password"
      class="modal-input"
      placeholder="비밀번호"
      @keyup.enter="confirmDelete"
      autofocus
    />

    <div v-if="error" class="error-message">⚠️ {{ error }}</div>

    <div class="modal-actions">
      <button @click="cancelDelete" class="btn btn-cancel" :disabled="loading">취소</button>
      <button @click="confirmDelete" class="btn btn-danger" :disabled="loading">
        {{ loading ? '삭제 중...' : '영구 삭제' }}
      </button>
    </div>
  </div>
</div>

      <div v-if="reportMode" class="modal-overlay">
        <div class="modal">
          <h3>게시글 신고</h3>
          <p>이 게시글을 신고하시겠습니까?</p>
          <p class="sub">부적절한 내용으로 인한 신고는 3회 누적 시 자동으로 블라인드 처리됩니다.</p>

          <div v-if="error" class="error-message">⚠️ {{ error }}</div>

          <div class="modal-actions">
            <button @click="cancelReport" class="btn btn-cancel">취소</button>
            <button @click="handleReport" class="btn btn-danger">신고</button>
          </div>
        </div>
      </div>
    </article>
  </section>
</template>

<style scoped>
/* Back button (톤 맞춘 라운드 버튼) */
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--surface, #ffffff);
  color: var(--primary-dark, #0b8f8e);
  border: 1px solid rgba(14,165,164,0.12);
  border-radius: 999px;
  box-shadow: 0 6px 18px rgba(14,165,164,0.06);
  font-weight: 700;
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 120ms ease;
  margin-bottom: 12px;
}
.back-btn svg { display:block; color: var(--primary-dark, #0b8f8e); }
.back-btn span { font-size: 14px; }
.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(14,165,164,0.10);
}

/* Header layout tweaks */
.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}
.header-left { display:flex; align-items:center; gap:12px; }

/* Category badge (톤 맞춤) */
.category-badge {
  display: inline-block;
  padding: 6px 12px;
  background: rgba(14,165,164,0.10);
  color: var(--primary-dark, #0b8f8e);
  border-radius: 999px;
  font-weight: 700;
  border: 1px solid rgba(14,165,164,0.06);
  box-shadow: none;
  font-size: 13px;
}

/* 제목 스타일 */
.post-title {
  margin: 0;
  color: var(--text-heading, #163535);
  font-size: 24px;
  font-weight: 800;
}

/* 댓글 및 액션 관련 기존 스타일 (정리됨) */
.comment-input-area {
  margin-bottom: 20px;
  padding: 14px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e6efee;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.comment-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #dfecec;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  background: #fbfdfc;
  box-sizing: border-box;
}
.comment-pw-input {
  width: 280px;
  max-width: 100%;
  padding: 10px 12px;
  border: 1px solid #dfecec;
  border-radius: 8px;
  font-size: 13px;
  background: #fff;
  box-sizing: border-box;
}
.comment-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.char-count { color: #8fa9a8; font-size: 13px; }
.btn-comment-submit {
  padding: 8px 14px;
  background: #0ea5a4;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.btn-comment-submit:hover { background: #0b8f8e; }

.comments-list { display: flex; flex-direction: column; gap: 12px; }
.comment-item { padding: 12px 14px; background: #fbfdfc; border: 1px solid #eef7f6; border-radius: 8px; }
.comment-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.anonymous-name { font-size: 13px; color: #0ea5a4; font-weight: 700; }
.comment-actions { margin-top: 8px; display: flex; justify-content: flex-end; }
.btn-delete-comment {
  background: transparent;
  border: 1px solid #e6e6e6;
  color: #666;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
}
.btn-delete-comment:hover {
  background: rgba(255, 100, 100, 0.06);
  border-color: rgba(255, 100, 100, 0.16);
  color: #f66;
}

.post-actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin: 18px 0;
  border-top: 1px solid #eef7f6;
  border-bottom: 1px solid #eef7f6;
  background: #fbfdfc;
  border-radius: 8px;
}
.post-actions-bar .stats { display: flex; align-items: center; gap: 12px; }
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid transparent;
  background: transparent;
  border-radius: 8px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
}
.action-btn .icon { font-size: 16px; }
.action-btn .count { margin-left: 4px; color: #334; font-weight: 700; }
.action-btn:hover { background: rgba(14,165,164,0.06); color: #0ea5a4; }
.action-btn.liked { color: #f66; background: rgba(255,230,230,0.4); }
.comment-count { color: #667; font-weight: 600; font-size: 14px; }

.post-actions-bar .actions { display: flex; gap: 8px; align-items: center; }
.btn { padding: 8px 12px; border-radius: 8px; font-weight: 600; cursor: pointer; border: 1px solid #e6e6e6; background: #fff; }
.btn-edit { color: #0ea5a4; border-color: rgba(14,165,164,0.12); }
.btn-delete { color: #f66; border-color: rgba(255,100,100,0.12); }
.btn-report { color: #ff9600; border-color: rgba(255,150,0,0.12); }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }

.inline-delete { margin-top: 12px; }
.inline-delete-box { display: flex; gap: 12px; align-items: center; background: #fff; border: 1px solid #e6e6e6; padding: 10px; border-radius: 8px; flex-wrap: wrap; }
.inline-delete-text .sub { font-size: 13px; color: #666; margin-top: 2px; }
.inline-input { padding: 8px 10px; border: 1px solid #dfecec; border-radius: 8px; min-width: 180px; }
.inline-actions { display: flex; gap: 8px; }
.inline-delete-error { margin-top: 8px; color: #c00; font-size: 13px; }

/* modal minimal styles */
.modal-overlay { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.35); z-index: 1200; }
.modal { background: #fff; padding: 18px; border-radius: 12px; width: 420px; max-width: calc(100% - 32px); box-shadow: 0 10px 30px rgba(0,0,0,0.12); }
.modal-input { width: 100%; padding: 10px 12px; border: 1px solid #e6e6e6; border-radius: 8px; box-sizing: border-box; margin-top: 8px; margin-bottom: 12px; }
.modal-actions { display:flex; gap:8px; justify-content:flex-end; }
.error-message { color: #c00; margin-top: 8px; }

@media (max-width: 740px) {
  .post-header { flex-direction: column; align-items: flex-start; gap: 8px; }
  .header-left { flex-direction: column; align-items: flex-start; gap: 6px; }
  .back-btn { margin-bottom: 10px; }
}
/* 삭제 모달 강조 스타일 */
.modal.danger {
  border-top: 6px solid #ff6b6b;
}
.modal.danger h3 {
  color: #c0392b;
  margin: 0 0 6px;
}
.confirm-note {
  margin: 6px 0 10px;
  font-weight: 700;
  color: #c0392b;
}

/* 버튼 강조 보완 (이미 존재하면 덮어쓰지 않음) */
.btn-danger {
  background: #fff6f6;
  color: #c0392b;
  border-color: rgba(240,100,100,0.12);
}
.btn-danger:hover {
  background: #ffecec;
}
</style>