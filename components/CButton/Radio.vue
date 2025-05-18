<template>
  <div class="с-button-radio">
    <q-radio
      :keep-color="keepColor"
      :color="color"
      :model-value="modelValue"
      val="line"
      label="Line"
      @update:model-value="updateValue"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean;
  color?: string;
  keepColor?: boolean;
}
withDefaults(defineProps<Props>(), {
  modelValue: false,
});
const emits = defineEmits<{
  "update:modelValue": [boolean];
}>();
function updateValue(value: boolean) {
  emits("update:modelValue", value);
}
</script>

<style scoped></style>
