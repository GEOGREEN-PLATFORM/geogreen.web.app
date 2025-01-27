<template>
    <div>
        <q-option-group
        :model-value="modelValue"
        @update:model-value="updateValue"
        :options="options"
        :color="color"
        :inline="inline"
    />
    </div>
</template>

<script setup lang="ts" generic="T">
interface Props {
  modelValue: Group;
  options: Option[];
  color?: string;
  inline?: boolean;
}
interface Option {
  label: string;
  value: T;
}
type Group = T | T[];

const props = withDefaults(defineProps<Props>(), {});
const emits = defineEmits<{
  "update:modelValue": [Group]
}>()

function updateValue(group: Group) {
  emits("update:modelValue", group)
}
</script>

<style scoped lang="scss">

</style>