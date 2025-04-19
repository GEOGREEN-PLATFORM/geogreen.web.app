<template>
  <div class="gg-dialog">
    <q-dialog
      :model-value="modelValue"
      @update:model-value="toggleOpenState"
      :auto-close="false"
      backdrop-filter="blur(4px)"
    >
      <slot />
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean;
}
withDefaults(defineProps<Props>(), {});
const emit = defineEmits<{
  "update:model-value": [boolean];
}>();
function toggleOpenState(newState: boolean) {
  emit("update:model-value", newState);
}
onMounted(() => {});
</script>

<style lang="scss">
.gg-dialog {
}
</style>
