<script setup>
import { ref } from 'vue'

defineProps({
  place: {
    type: Object,
    required: true,
  },
})

const imageError = ref(false)

function handleImageError() {
  imageError.value = true
}
</script>

<template>
  <article
    class="place-card"
    :aria-labelledby="`place-title-${place.id}`"
  >
    <div class="media">
      <img
        v-if="place.imageUrl && !imageError"
        :src="place.imageUrl"
        :alt="`${place.title} 대표 이미지`"
        loading="lazy"
        @error="handleImageError"
      />

      <div
        v-else
        class="image-placeholder"
        aria-label="대표 이미지 없음"
      >
        이미지 없음
      </div>
    </div>

    <div class="body">
      <span class="badge">
        {{ place.contentType }}
      </span>

      <h3
        :id="`place-title-${place.id}`"
        class="title"
      >
        {{ place.title }}
      </h3>

      <p class="address">
        {{ place.address }}
      </p>

      <p
        v-if="place.tel"
        class="tel"
      >
        전화: {{ place.tel }}
      </p>

      <p
        v-if="!place.hasCoordinates"
        class="no-coordinates"
      >
        지도 위치 정보 없음
      </p>
    </div>
  </article>
</template>

<style scoped>
.place-card {
  align-self: start;
  display: flex;
  flex-direction: column;

  width: 100%;
  min-width: 0;
  overflow: hidden;

  border: 1px solid var(--border, #dbe5e5);
  border-radius: 12px;
  background: #ffffff;
}

.media {
  display: flex;
  flex: 0 0 210px;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 210px;
  min-width: 0;
  overflow: hidden;

  background: #eef5f5;
}

.media img {
  display: block;

  width: 100%;
  height: 100%;
  max-width: none;

  object-fit: cover;
  object-position: center;
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;

  color: var(--text-muted, #647575);
  font-size: 14px;
}

.body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;

  min-width: 0;
  padding: 16px;
}

.badge {
  padding: 4px 8px;
  border-radius: 8px;

  background: rgba(14, 165, 164, 0.12);
  color: #056b6b;

  font-size: 13px;
  font-weight: 600;
}

.title {
  width: 100%;
  margin: 0;

  overflow-wrap: anywhere;

  color: var(--text-heading, #163535);
  font-size: 17px;
  line-height: 1.4;
}

.address,
.tel,
.no-coordinates {
  width: 100%;
  margin: 0;

  overflow-wrap: anywhere;

  color: var(--text, #435858);
  font-size: 14px;
  line-height: 1.5;
}

.no-coordinates {
  color: var(--text-muted, #647575);
}

@media (max-width: 720px) {
  .media {
    flex-basis: 220px;
    height: 220px;
  }
}
</style>