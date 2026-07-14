<script setup>
import { computed, ref } from 'vue'
import PlaceCard from '../components/places/PlaceCard.vue'
import {
  allPlaces,
  placeCategories,
} from '../services/placeData.js'

const searchQuery = ref('')
const selectedCategory = ref('전체')

const categories = ['전체', ...placeCategories]

function matchesSearch(place, normalizedQuery) {
  if (!normalizedQuery) {
    return true
  }

  const searchableText = [
    place.title,
    place.address,
    place.contentType,
  ]
    .map((value) => String(value ?? '').toLowerCase())
    .join(' ')

  return searchableText.includes(normalizedQuery)
}

const filteredPlaces = computed(() => {
  const normalizedQuery = searchQuery.value
    .trim()
    .toLowerCase()

  return allPlaces.filter((place) => {
    const matchesCategory =
      selectedCategory.value === '전체' ||
      place.contentType === selectedCategory.value

    return (
      matchesCategory &&
      matchesSearch(place, normalizedQuery)
    )
  })
})

const totalResults = computed(
  () => filteredPlaces.value.length,
)

const visiblePlaces = computed(
  () => filteredPlaces.value.slice(0, 60),
)
</script>

<template>
  <section class="places-page">
    <header class="page-header">
      <p class="eyebrow">
        LOCAL PLACES
      </p>

      <h1>대전·충청 지역 정보</h1>

      <p class="description">
        관광지, 음식점, 문화시설 등 대전·충청의 다양한 장소를 찾아보세요.
      </p>

      <div class="controls">
        <div class="search-group">
          <label for="place-search">
            장소 검색
          </label>

          <input
            id="place-search"
            v-model="searchQuery"
            type="search"
            placeholder="장소명, 주소 또는 콘텐츠 유형을 검색하세요."
          />
        </div>

        <div
          class="category-row"
          aria-label="카테고리 필터"
        >
          <button
            v-for="category in categories"
            :key="category"
            type="button"
            class="category-button"
            :class="{
              active: selectedCategory === category,
            }"
            :aria-pressed="selectedCategory === category"
            @click="selectedCategory = category"
          >
            {{ category }}
          </button>
        </div>

        <p
          class="result-info"
          aria-live="polite"
        >
          검색 결과 총
          <strong>{{ totalResults.toLocaleString() }}</strong>개
        </p>
      </div>
    </header>

    <div
      v-if="visiblePlaces.length > 0"
      class="place-grid"
    >
      <PlaceCard
        v-for="place in visiblePlaces"
        :key="place.id"
        :place="place"
      />
    </div>

    <div
      v-else
      class="empty-state"
    >
      <strong>검색 결과가 없습니다.</strong>

      <p>
        다른 검색어나 카테고리를 선택해 보세요.
      </p>
    </div>

    <p
      v-if="totalResults > 60"
      class="display-note"
    >
      검색 결과 중 최대 60개까지 표시됩니다.
    </p>
  </section>
</template>

<style scoped>
.places-page {
  width: 100%;
  max-width: 1126px;
  margin: 0 auto;
}

.page-header {
  padding: 8px 0 18px;
  text-align: left;
}

.eyebrow {
  margin: 0 0 8px;

  color: #087f7e;
  font-size: 14px;
  font-weight: 700;
}

h1 {
  margin: 0;
  color: var(--text-heading, #163535);
}

.description {
  margin: 8px 0 0;

  color: var(--text, #435858);
  line-height: 1.7;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 14px;

  margin-top: 24px;
}

.search-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search-group label {
  color: var(--text-heading, #163535);
  font-size: 14px;
  font-weight: 600;
}

.search-group input {
  width: 100%;
  padding: 12px 14px;

  border: 1px solid var(--border, #dbe5e5);
  border-radius: 10px;
  background: #ffffff;

  color: var(--text, #435858);
  font: inherit;
}

.search-group input:focus {
  border-color: #0ea5a4;
  outline: 3px solid rgba(14, 165, 164, 0.14);
}

.category-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-button {
  padding: 9px 13px;

  border: 1px solid var(--border, #dbe5e5);
  border-radius: 10px;
  background: #ffffff;

  color: var(--text, #435858);
  font: inherit;

  cursor: pointer;
}

.category-button:hover {
  border-color: #0ea5a4;
  background: rgba(14, 165, 164, 0.06);
}

.category-button.active {
  border-color: #0ea5a4;
  background: #0ea5a4;
  color: #ffffff;
}

.category-button:focus-visible {
  outline: 3px solid rgba(14, 165, 164, 0.2);
  outline-offset: 2px;
}

.result-info {
  margin: 0;

  color: var(--text, #435858);
  font-size: 14px;
}

.place-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: start;
  gap: 16px;

  margin-top: 18px;
}

.empty-state {
  margin-top: 18px;
  padding: 40px 24px;

  border: 1px dashed var(--border, #dbe5e5);
  border-radius: 12px;
  background: #ffffff;

  text-align: center;
}

.empty-state p {
  margin: 8px 0 0;
  color: var(--text-muted, #647575);
}

.display-note {
  margin: 16px 0 0;

  color: var(--text-muted, #647575);
  font-size: 13px;
  text-align: center;
}

@media (max-width: 720px) {
  .place-grid {
    grid-template-columns: 1fr;
  }

  .controls {
    gap: 12px;
  }

  .category-button {
    flex: 1 1 auto;
  }
}

@media (min-width: 721px) and (max-width: 1024px) {
  .place-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>