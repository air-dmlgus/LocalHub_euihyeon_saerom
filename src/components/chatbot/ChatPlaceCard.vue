<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  place: {
    type: Object,
    required: true,
  },
})

const imageFailed = ref(false)

watch(
  () => props.place?.imageUrl,
  () => {
    imageFailed.value = false
  },
)

function handleImageError() {
  imageFailed.value = true
}
</script>

<template>
  <article class="chat-place-card">
    <div class="card-image-area">
      <img
        v-if="place.imageUrl && !imageFailed"
        :src="place.imageUrl"
        :alt="`${place.title} 장소 이미지`"
        class="card-image"
        loading="lazy"
        @error="handleImageError"
      />

      <div
        v-else
        class="image-placeholder"
        aria-label="등록된 이미지 없음"
      >
        <span aria-hidden="true">🏞️</span>
        <span>이미지 없음</span>
      </div>

      <span class="category-badge">
        {{ place.contentType }}
      </span>
    </div>

    <div class="card-content">
      <h3 class="place-title">
        {{ place.title }}
      </h3>

      <p class="place-address">
        {{ place.address || '주소 정보 없음' }}
      </p>
    </div>
  </article>
</template>

<style scoped>
.chat-place-card {
  overflow: hidden;

  border: 1px solid #dbe5e5;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 5px 16px rgba(34, 70, 70, 0.1);
}

.card-image-area {
  position: relative;

  width: 100%;
  height: 130px;

  overflow: hidden;
  background: #eef5f5;
}

.card-image {
  display: block;

  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;

  width: 100%;
  height: 100%;

  color: #748888;
  font-size: 12px;
}

.image-placeholder span:first-child {
  font-size: 26px;
}

.category-badge {
  position: absolute;
  left: 10px;
  bottom: 10px;

  padding: 5px 8px;

  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 999px;
  background: rgba(18, 48, 48, 0.5);
  backdrop-filter: blur(5px);

  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
}

.card-content {
  padding: 12px;
}

.place-title {
  margin: 0;

  color: #263c3c;
  font-size: 15px;
  line-height: 1.4;
}

.place-address {
  display: -webkit-box;

  margin: 7px 0 0;

  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;

  color: #647575;
  font-size: 12px;
  line-height: 1.5;
}
</style>