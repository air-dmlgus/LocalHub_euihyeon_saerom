<script setup>
import BaseButton from '../components/common/BaseButton.vue'
import MapSection from '../components/map/MapSection.vue'
</script>

<template>
  <section class="home-hero">
    <div class="hero-inner">
      <p class="eyebrow">대전·충청 지역 정보 플랫폼</p>

      <h1>우리 동네와 여행지를 한곳에서</h1>

      <p class="lead">
        대전·충청의 관광지, 음식점, 문화시설을 찾아보고
        지역 이야기를 공유해 보세요.
      </p>

      <div class="actions">
        <BaseButton to="/places">
          지역 정보 둘러보기
        </BaseButton>

        <BaseButton to="/community">
          커뮤니티 가기
        </BaseButton>
      </div>
    </div>
  </section>

  <section class="features">
    <h2>LocalHub 핵심 기능</h2>

    <div class="cards">
      <article class="card">
        <h3>지역 정보 탐색</h3>
        <p>관광지·음식점·문화시설 등 대전·충청 지역 정보를 한눈에 확인합니다.</p>
      </article>

      <article class="card">
        <h3>익명 지역 커뮤니티</h3>
        <p>지역 주민과 관광객이 로그인 없이 지역 이야기를 기록하고 공유합니다.</p>
      </article>

      <article class="card">
        <h3>AI 지역 정보 챗봇</h3>
        <p>제공된 지역 데이터를 기반으로 장소를 찾고 관련 정보를 안내합니다.</p>
      </article>
    </div>
  </section>

  <MapSection />
</template>

<style scoped>
.home-hero {
  padding: 64px 24px;
  border-radius: 24px;
  background:
    linear-gradient(
      135deg,
      rgba(14, 165, 164, 0.14),
      rgba(255, 255, 255, 0.85)
    );
  text-align: center;
}

.hero-inner {
  max-width: 760px;
  margin: 0 auto;
}

.eyebrow {
  margin: 0 0 12px;
  color: #087f7e;
  font-size: 14px;
  font-weight: 700;
}

h1 {
  margin: 0;
  color: var(--text-heading, #163535);
  font-size: clamp(32px, 5vw, 52px);
  line-height: 1.2;
}

.lead {
  max-width: 720px;
  margin: 18px auto 24px;
  color: var(--text, #435858);
  font-size: 18px;
  line-height: 1.7;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

.features,
.categories,
.intro {
  padding: 40px 0;
}

.features h2,
.categories h2,
.intro h2 {
  margin: 0 0 18px;
  color: var(--text-heading, #163535);
}

.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.card {
  padding: 22px;
  border: 1px solid var(--border, #dbe5e5);
  border-radius: 16px;
  background: white;
}

.card h3 {
  margin: 0 0 10px;
  color: var(--text-heading, #163535);
}

.card p {
  margin: 0;
  color: var(--text, #435858);
  line-height: 1.6;
}

.category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.intro {
  text-align: center;
}

.intro p {
  margin: 0;
  color: var(--text, #435858);
  line-height: 1.7;
}

@media (max-width: 768px) {
  .home-hero {
    padding: 44px 18px;
  }

  .lead {
    font-size: 16px;
  }

  .cards {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 420px) {
  .actions {
    flex-direction: column;
  }

  .actions :deep(.base-button) {
    width: 100%;
  }
}
</style>