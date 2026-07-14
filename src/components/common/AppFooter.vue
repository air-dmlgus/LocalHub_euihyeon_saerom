<template>
  <footer class="app-footer">
    <div class="inner">
      <div class="service-info">
        <strong>LocalHub</strong>
        <p>대전·충청 지역을 위한 지역 정보 서비스</p>
      </div>

      <div class="source-info">
        <p>이 서비스는 한국관광공사 TourAPI 4.0 데이터를 활용하였습니다.</p>
        <p>출처: 한국관광공사 · 라이선스: 공공누리 제3유형</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  padding: 20px;
  border-top: 1px solid var(--border, #dbe5e5);
  background: #f7fafa;
}

.inner {
  width: 100%;
  max-width: 1126px;
  margin: 0 auto;
  box-sizing: border-box;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.service-info p,
.source-info p {
  margin: 4px 0 0;
  color: var(--text-muted, #647575);
  font-size: 14px;
  line-height: 1.5;
}

.source-info {
  text-align: right;
}

@media (max-width: 720px) {
  .inner {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .source-info {
    text-align: center;
  }
}
</style>