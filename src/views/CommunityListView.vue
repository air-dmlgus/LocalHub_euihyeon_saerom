<script setup>
import BaseButton from '../components/common/BaseButton.vue'
</script>

<template>
  <section class="placeholder">
    <p class="eyebrow">LOCAL COMMUNITY</p>
    <h1>지역 커뮤니티</h1>

    <p class="description">
      주민과 관광객이 지역 이야기를 공유하는 공간입니다.
    </p>

    <div class="preparing-box">
      <strong>게시판 기능을 준비하고 있습니다.</strong>
      <p>
        게시글 목록, 상세 조회, 작성, 수정, 삭제 기능이 이 화면에 추가될 예정입니다.
      </p>
    </div>

    <div class="actions">
      <BaseButton to="/community/new">
        게시글 작성
      </BaseButton>
    </div>
  </section>
</template>

<style scoped>
.placeholder {
  max-width: 900px;
  margin: 0 auto;
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
}

.description {
  color: var(--text, #435858);
  line-height: 1.7;
}

.preparing-box {
  margin-top: 28px;
  padding: 28px;
  border: 1px dashed #8bbfbe;
  border-radius: 16px;
  background: rgba(14, 165, 164, 0.05);
}

.preparing-box p {
  margin: 8px 0 0;
  color: var(--text, #435858);
  line-height: 1.6;
}

.actions {
  margin-top: 20px;
}
</style>