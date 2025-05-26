<template>
  <div class="error-page">
    <div class="error-content">
      <h1 class="error-code">{{ error.statusCode }}</h1>
      <p class="error-message">
        Хмм...Экологической проблемы тут нет. <br />{{
          error.statusCode === 404
            ? "И такой страницы тоже."
            : "Но возникла проблема с сайтом. Уже занимаемся её исправлением."
        }}
      </p>
      <CButton @click="handleError">Вернуться</CButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from "#app";
const router = useRouter();
defineProps({
  error: Object as () => NuxtError,
});
const handleError = () => {
  clearError();
  router.back();
};
</script>

<style scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #e0f7e9 0%, #c8f0d3 100%);
  color: #2e5f40;
  text-align: center;
  padding: 2rem;
}

.error-content {
  max-width: 400px;
}

.error-code {
  font-size: 6rem;
  margin: 0;
}

.error-message {
  font-size: 1.25rem;
  margin: 1rem 0;
}

.home-link {
  display: inline-block;
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #4caf50;
  color: #ffffff;
  border-radius: 8px;
  text-decoration: none;
  transition: background-color 0.3s;
}

.home-link:hover {
  background-color: #388e3c;
}
</style>
