<template>
  <div>
    <q-toggle
      :model-value="props.modelValue"
      @update:model-value="handleInput"
      :label="props.label"
    ></q-toggle>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean;
  label: string;
}
const props = defineProps<Props>();
const emit = defineEmits(["update:modelValue"]);
const handleInput = (val: boolean) => {
  emit("update:modelValue", val);
};
</script>

<style scoped lang="scss"></style>
