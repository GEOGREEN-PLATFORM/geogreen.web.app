<template>
  <GGDialog v-model="isOpen">
    <img style="max-width: 80vw; max-height: 80vh" :src="photoUrl" @click="closePhoto" />
  </GGDialog>
</template>

<script setup lang="ts">
const { photoUrl, isOpen, closePhoto } = usePhotoViewer();
</script>
