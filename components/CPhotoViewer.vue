<template>
  <CDialog v-model="isOpen" full-content close-icon-style="outlined" class="c-photo-dialog">
    <NuxtImg class="c-photo-dialog__image" :src="photoUrl" @click="closePhoto" />
  </CDialog>
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
