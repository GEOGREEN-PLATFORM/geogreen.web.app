<script setup lang="ts">
definePageMeta({
  layout: 'auth', // Подключаем общий Layout
})
</script>

<template>
  <div>
    <NuxtLayout name="auth">
      <AuthPageForm type="register" />
    </NuxtLayout>
  </div>
</template>
