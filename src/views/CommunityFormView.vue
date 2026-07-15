<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BaseButton from '../components/common/BaseButton.vue'
import { addPost, getPostById, updatePost } from '../utils/storage.js'

const router = useRouter()
const route = useRoute()

const isEditMode = ref(false)
const postId = ref(null)

const form = ref({
  title: '',
  content: '',
  password: '',
  category: '일반',
})

const imagePreview = ref('')
const error = ref('')
const loading = ref(false)

// 카테고리 확장 (15개)
const categories = [
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

onMounted(() => {
  if (route.params.id) {
    isEditMode.value = true
    postId.value = route.params.id

    const post = getPostById(postId.value)
    if (post) {
      form.value.title = post.title
      form.value.content = post.content
      form.value.category = post.category || '일반'
      imagePreview.value = post.image || ''
    }
  }
})

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 1MB 용량 제한
  if (file.size > 1024 * 1024) {
    error.value = '이미지 크기는 1MB 이하만 가능합니다.'
    event.target.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target.result // Base64
    console.log('이미지 업로드 완료:', imagePreview.value.substring(0, 50) + '...')
  }
  reader.readAsDataURL(file)
}

const removeImage = () => {
  imagePreview.value = ''
}

// 비밀번호 숫자만 입력되도록
const formatPassword = (event) => {
  form.value.password = event.target.value.replace(/[^0-9]/g, '')
}

const submitForm = () => {
  error.value = ''

  if (!form.value.title.trim()) {
    error.value = '제목을 입력해주세요.'
    return
  }

  if (!form.value.content.trim()) {
    error.value = '내용을 입력해주세요.'
    return
  }

  if (!form.value.password.trim()) {
    error.value = '비밀번호를 입력해주세요.'
    return
  }

  if (form.value.password.length < 4) {
    error.value = '비밀번호는 4자 이상이어야 합니다.'
    return
  }

  // 비밀번호가 숫자만인지 확인
  if (!/^\d+$/.test(form.value.password)) {
    error.value = '비밀번호는 숫자만 입력 가능합니다.'
    return
  }

  loading.value = true

  try {
    if (isEditMode.value) {
      updatePost(postId.value, {
        title: form.value.title,
        content: form.value.content,
        category: form.value.category,
        password: form.value.password,
        image: imagePreview.value,
      })
      console.log('게시글 수정 완료:', postId.value)
    } else {
      const newPost = addPost({
        title: form.value.title,
        content: form.value.content,
        password: form.value.password,
        category: form.value.category,
        image: imagePreview.value,
      })
      console.log('게시글 작성 완료:', newPost)
    }
    loading.value = false
    router.push('/community')
  } catch (err) {
    console.error('저장 실패:', err)
    error.value = '게시글 저장에 실패했습니다. 다시 시도해주세요.'
    loading.value = false
  }
}

const goBack = () => {
  if (isEditMode.value) {
    router.push(`/community/${postId.value}`)
  } else {
    router.push('/community')
  }
}
</script>

<template>
  <section class="community-form">
    <div class="form-header">
      <h1>{{ isEditMode ? '게시글 수정' : '게시글 작성' }}</h1>
    </div>

    <form @submit.prevent="submitForm" class="form-container">
      <div class="form-group">
        <label for="category">카테고리 ⭐</label>
        <select v-model="form.category" id="category" class="form-input">
          <option v-for="cat in categories" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="title">제목</label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          class="form-input"
          placeholder="제목을 입력해주세요."
          maxlength="100"
        />
        <span class="char-count">{{ form.title.length }}/100</span>
      </div>

      <div class="form-group">
        <label for="image">이미지 첨부</label>
        <input
          id="image"
          type="file"
          accept="image/*"
          class="form-input"
          @change="handleImageUpload"
        />
        <p class="image-hint">💡 이미지는 1MB 이하만 가능합니다.</p>

        <div v-if="imagePreview" class="image-preview-container">
          <img :src="imagePreview" alt="미리보기" class="image-preview" />
          <button type="button" @click="removeImage" class="btn-remove-image">
            ✕ 제거
          </button>
        </div>
      </div>

      <div class="form-group">
        <label for="content">내용</label>
        <textarea
          id="content"
          v-model="form.content"
          class="form-textarea"
          placeholder="내용을 입력해주세요."
          rows="10"
          maxlength="5000"
        ></textarea>
        <span class="char-count">{{ form.content.length }}/5000</span>
      </div>

      <div class="form-group">
        <label for="password">비밀번호 (숫자만) 🔐</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          class="form-input"
          placeholder="게시글 수정/삭제 시 필요합니다 (숫자 4자 이상)"
          inputmode="numeric"
          minlength="4"
          @input="formatPassword"
        />
        <p class="password-hint">💡 숫자만 입력 가능합니다.</p>
      </div>

      <div v-if="error" class="error-message">
        ⚠️ {{ error }}
      </div>

      <div class="form-actions">
        <button
          type="button"
          class="btn btn-cancel"
          @click="goBack"
          :disabled="loading"
        >
          취소
        </button>
        <button
          type="submit"
          class="btn btn-submit"
          :disabled="loading"
        >
          {{ loading ? '저장 중...' : isEditMode ? '수정' : '작성' }}
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.community-form {
  max-width: 900px;
  margin: 0 auto;
}

.form-header {
  margin-bottom: 32px;
}

.form-header h1 {
  margin: 0;
  color: var(--text-heading, #163535);
}

.form-container {
  background: #fff;
  padding: 28px;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
}

.form-group {
  margin-bottom: 24px;
  position: relative;
}

.form-group:last-of-type {
  margin-bottom: 28px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-heading, #163535);
  font-weight: 600;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #0ea5a4;
  box-shadow: 0 0 0 3px rgba(14, 165, 164, 0.1);
}

.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
}

.form-textarea:focus {
  outline: none;
  border-color: #0ea5a4;
  box-shadow: 0 0 0 3px rgba(14, 165, 164, 0.1);
}

.char-count {
  position: absolute;
  right: 0;
  top: 0;
  font-size: 12px;
  color: #999;
}

.image-hint,
.password-hint {
  margin: 6px 0 0;
  font-size: 12px;
  color: #999;
}

.image-preview-container {
  margin-top: 16px;
  position: relative;
  display: inline-block;
}

.image-preview {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #e0e0e0;
}

.btn-remove-image {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.btn-remove-image:hover {
  background: rgba(0, 0, 0, 0.9);
}

.error-message {
  padding: 12px 16px;
  background: #fee;
  border-left: 4px solid #f66;
  border-radius: 4px;
  color: #c00;
  font-size: 14px;
  margin-bottom: 20px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  background: #f0f0f0;
  color: var(--text, #435858);
}

.btn-cancel:hover:not(:disabled) {
  background: #e0e0e0;
}

.btn-submit {
  background: #0ea5a4;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #0b8f8e;
}

@media (max-width: 768px) {
  .form-container {
    padding: 20px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
