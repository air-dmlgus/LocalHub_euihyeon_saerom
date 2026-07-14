<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  to: {
    type: [String, Object],
    default: null,
  },
  type: {
    type: String,
    default: 'button',
  },
})
</script>

<template>
  <RouterLink
    v-if="to"
    :to="to"
    class="base-button"
  >
    <slot />
  </RouterLink>

  <button
    v-else
    :type="type"
    class="base-button"
  >
    <slot />
  </button>
</template>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  min-height: 44px;
  padding: 12px 16px;
  border: 0;
  border-radius: 12px;

  background: #0ea5a4;
  color: white;

  font: inherit;
  font-weight: 600;
  line-height: 1;
  text-decoration: none;
  cursor: pointer;

  transition:
    transform 0.15s ease,
    background-color 0.15s ease;
}

.base-button:hover {
  background: #0b8f8e;
}

.base-button:active {
  transform: translateY(1px);
}

.base-button:focus-visible {
  outline: 3px solid rgba(14, 165, 164, 0.25);
  outline-offset: 2px;
}

@media (max-width: 420px) {
  .base-button {
    min-height: 48px;
    padding: 12px 14px;
    border-radius: 10px;
  }
}
</style>