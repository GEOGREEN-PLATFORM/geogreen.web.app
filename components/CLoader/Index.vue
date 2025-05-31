<template>
  <div class="c-loader" v-if="visible">
    <div class="c-loader__overlay"></div>
    <div class="c-loader__content">
      <q-spinner size="50px" color="green-100" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";

const props = defineProps<{ visible: boolean }>();
</script>

<style scoped>
.c-loader {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
}
.c-loader__overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}
.c-loader__content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: all;
}
.body--dark {
  .c-loader__overlay {
    background-color: rgba(255, 255, 255, 0.3);
  }
}
</style>
