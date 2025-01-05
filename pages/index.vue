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
      <Map />
      <div class="text-center" @click="navigateTo('/auth/register')">
        В регистрацию
      </div>
      ТЕСТИРОВАНИЕ ACTIONS
      <GGDialogConfirm v-model="showConfirm"></GGDialogConfirm>
    </div>
  </div>
</template>

<script setup lang="ts">
const showConfirm = ref(true);
</script>

<style scoped lang="scss"></style>
