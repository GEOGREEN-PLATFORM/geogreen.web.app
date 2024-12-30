<template>
  <div
    style="
      height: 100vh;
      width: 100vw;
      display: flex;
      justify-content: center;
      align-items: center;
    "
  >
    <div style="width: 100vw; height: 100vh">
      <TestMap />
      <div class="text-center" @click="navigateTo('/auth/register')">
        В регистрацию
      </div>
      ТЕСТИРОВАНИЕ ACTIONS
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss"></style>
