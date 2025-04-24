<template>
  <NuxtLayout>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useMainStore } from "~/store/main";
definePageMeta({
  layout: false,
});
const store = useMainStore();
onMounted(async () => {
  if (!store.problemAreaTypes.length) {
    store.problemAreaTypes = await $fetch(
      `${store.apiGeospatial}/geo/dict/problem-area-types`,
    );
  }
  if (!store.landTypes.length) {
    store.landTypes = await $fetch(
      `${store.apiGeospatial}/geo/dict/land-types`,
    );
  }
});
</script>
