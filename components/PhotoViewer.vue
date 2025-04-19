<template>
  <GGDialog v-model="isOpen" class="c-photo-dialog">
    <NuxtImg
      class="c-photo-dialog__image"
      style="max-width: 80vw; max-height: 80vh"
      :src="photoUrl"
      @click="closePhoto"
    />
  </GGDialog>
</template>

<script setup lang="ts">
const { photoUrl, isOpen, closePhoto } = usePhotoViewer();
</script>
<style scoped lang="scss">
.c-photo-dialog {
  &__image {
    border-radius: 8px;
  }
}
</style>
