<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const mobileOpen = ref(false)

function toggleMobile() {
  mobileOpen.value = !mobileOpen.value
}

// 메뉴를 누르고 페이지가 이동하면 모바일 메뉴를 자동으로 닫는다.
watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false
  },
)
</script>

<template>
  <header class="app-header">
    <div class="inner">
      <router-link to="/" class="logo">
        LocalHub
      </router-link>

      <nav
        id="main-navigation"
        :class="['nav', { open: mobileOpen }]"
        aria-label="주요 메뉴"
      >
        <router-link
          to="/"
          class="nav-link"
          :class="{ active: route.path === '/' }"
        >
          홈
        </router-link>

        <router-link
          to="/places"
          class="nav-link"
          :class="{ active: route.path.startsWith('/places') }"
        >
          지역 정보
        </router-link>

        <router-link
          to="/community"
          class="nav-link"
          :class="{ active: route.path.startsWith('/community') }"
        >
          커뮤니티
        </router-link>
      </nav>

      <button
        type="button"
        class="hamburger"
        aria-label="메뉴 열기 및 닫기"
        aria-controls="main-navigation"
        :aria-expanded="mobileOpen"
        @click="toggleMobile"
      >
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 40;
  border-bottom: 1px solid var(--border, #dbe5e5);
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(8px);
}

.inner {
  position: relative;
  width: 100%;
  max-width: 1126px;
  margin: 0 auto;
  padding: 16px 20px;
  box-sizing: border-box;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.logo {
  color: #056b6b;
  font-size: 20px;
  font-weight: 700;
  text-decoration: none;
}

.nav {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 18px;
}

.nav-link {
  padding: 8px 12px;
  border-radius: 8px;
  color: var(--text, #263838);
  text-decoration: none;
}

.nav-link:hover {
  background: rgba(14, 165, 164, 0.08);
}

.nav-link.active {
  color: white;
  background: #0ea5a4;
}

.hamburger {
  display: none;
  padding: 8px;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.bar {
  display: block;
  width: 20px;
  height: 2px;
  margin: 3px 0;
  border-radius: 2px;
  background: var(--text, #263838);
}

@media (max-width: 720px) {
  .nav {
    position: absolute;
    top: calc(100% + 8px);
    right: 16px;

    display: none;
    min-width: 160px;
    padding: 12px;
    border: 1px solid var(--border, #dbe5e5);
    border-radius: 10px;
    background: white;
    box-shadow: var(--shadow, 0 10px 30px rgba(0, 0, 0, 0.12));

    flex-direction: column;
    align-items: stretch;
    gap: 4px;
  }

  .nav.open {
    display: flex;
  }

  .nav-link {
    width: 100%;
    box-sizing: border-box;
  }

  .hamburger {
    display: block;
  }
}
</style>