<template>
  <div class="main-text gg-h1">
    Добро пожаловать {{ store.user ? `, ${store.user.firstName} ${store.user.lastName}` : "" }}
    <br />
    Главная страница находится в разработке. <br />Для перемещения между страницами воспользуйтесь
    навигационной панелью.
  </div>
</template>

<script setup lang="ts">
import { useMainStore } from "~/store/main";

const store = useMainStore();
</script>

<style scoped lang="scss">
.main-text {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0px 128px;
  text-align: center;
}
</style>
