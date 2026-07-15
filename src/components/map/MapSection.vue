<template>
  <section class="map-section">
    <h2>카테고리 바로가기</h2>

    <div class="category-row">
      <button
        v-for="cat in categories"
        :key="cat"
        :class="['cat-btn', selected === cat ? 'active' : '']"
        @click="onCategoryClick(cat)"
      >
        {{ cat }}
      </button>
      <button class="cat-btn" @click="showMarkers = !showMarkers">
        {{ showMarkers ? '핀 끄기' : '핀 켜기' }}
      </button>
    </div>

    <div class="map-wrapper">
      <MapView :places="visiblePlaces" :center="defaultCenter" :zoom="defaultZoom" :showMarkers="showMarkers" />
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import MapView from './MapView.vue'
import { allPlaces, placeCategories } from '../../services/placeData.js'

const categories = ['전체', ...placeCategories]
const selected = ref('전체')
const showMarkers = ref(true) // 추가
const defaultCenter = { lat: 36.3504, lng: 127.3845 }
const defaultZoom = 11

const visiblePlaces = computed(() => {
  const list = (allPlaces || []).filter(p => p && p.hasCoordinates)
  if (selected.value === '전체') return list
  // contentType(또는 다른 필드)로 카테고리 매핑이 필요하면 이 부분을 조정하세요.
  return list.filter(p => {
    // 예: contentType 값이 '관광지' 등으로 들어온다면 아래처럼 비교
    return (p.contentType || '').includes(selected.value) || (p.title && p.title.includes(selected.value))
  })
})

function onCategoryClick(cat) {
  selected.value = cat
}
</script>

<style scoped>
.map-section { padding: 28px 0; }
.category-row { display:flex; gap:10px; margin-bottom: 14px; flex-wrap:wrap; }
.cat-btn { background:#fff; border:1px solid #e6e6e6; color:#0b8f8e; padding:8px 14px; border-radius:999px; cursor:pointer; font-weight:600; }
.cat-btn.active { background:#0ea5a4; color:#fff; border-color:transparent; }
.map-wrapper { width:100%; }
</style>