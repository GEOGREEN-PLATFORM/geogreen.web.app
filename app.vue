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
store.initDicts();
</script>
