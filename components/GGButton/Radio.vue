<template>
    <div class="gg-button-radio">
        <q-radio :keep-color="keepColor" :color="color" :model-value="modelValue" @update:model-value="updateValue" val="line" label="Line" />
    </div>
</template>

<script setup lang="ts">
interface Props {
    modelValue: boolean;
    color: string;
    keepColor: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
});
const emits = defineEmits<{
  "update:modelValue": [boolean];
}>();
function updateValue(value: boolean) {
    emits("update:modelValue", value);
}
</script>

<style scoped>

</style>