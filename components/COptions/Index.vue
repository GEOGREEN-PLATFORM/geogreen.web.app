<template>
  <div>
    <q-option-group
      :model-value="modelValue"
      :options="options"
      :color="color"
      :inline="inline"
      keep-color
      :dark="false"
      :type="type"
      @update:model-value="updateValue"
    />
  </div>
</template>

<script setup lang="ts" generic="T">
interface Props {
  modelValue: Group;
  options: Option[];
  color?: string;
  inline?: boolean;
  type?: "toggle" | "radio" | "checkbox" | undefined;
}
interface Option {
  label?: string;
  value: T;
}
type Group = T | T[];

withDefaults(defineProps<Props>(), {
  type: "radio",
});
const emits = defineEmits<{
  "update:modelValue": [Group];
}>();

function updateValue(group: Group) {
  emits("update:modelValue", group);
}
</script>

<style scoped lang="scss"></style>
