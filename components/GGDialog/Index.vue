<template>
    <div class="gg-dialog">
        <q-dialog :model-value="modelValue" @update:model-value="toggleOpenState">
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
  const emit = defineEmits<{
    "update:model-value": [boolean]
  }>();
  function toggleOpenState(newState: boolean) {
    emit("update:model-value", newState)
  }
  onMounted(() => {
  });
  </script>
  
  <style scoped lang="scss">

  </style>
  