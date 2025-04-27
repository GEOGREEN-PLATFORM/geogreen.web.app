<template>
  <div class="c-dialog-container">
    <q-dialog
      :model-value="modelValue"
      @update:model-value="toggleOpenState"
      @show="emits('show')"
      :auto-close="false"
      backdrop-filter="blur(4px)"
      class="c-dialog__content"
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
const emits = defineEmits<{
  "update:model-value": [boolean];
  show: [];
}>();
function toggleOpenState(newState: boolean) {
  emits("update:model-value", newState);
}
onMounted(() => {});
</script>

<style lang="scss"></style>
