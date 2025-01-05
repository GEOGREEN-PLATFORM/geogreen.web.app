<template>
    <div class="gg-dialog">
        <q-dialog :model-value="modelValue">
          <slot></slot>
        </q-dialog>
    </div>
  </template>
  
  <script setup lang="ts">
  interface Props {
    modelValue: boolean;
  }
  const props = withDefaults(defineProps<Props>(), {
  });

  
  onMounted(() => {
  });
  </script>
  
  <style scoped lang="scss">

  </style>
  