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
const darkModeCookie = useCookie("dark-mode");
const $q = useQuasar();
if (darkModeCookie.value === "dark") {
  $q.dark.set(true);
} else if (darkModeCookie.value === "light") {
  $q.dark.set(false);
}
</script>
