<template>
  <div class="c-textarea">
    <KTInput
      ref="inputRef"
      v-model="inputValue"
      :rounded="rounded"
      :outlined="outlined"
      :label="label"
      type="textarea"
      :autogrow="autogrow"
      :rules="rules"
      lazy-rules
      :no-error-icon="hideErrorIcon"
      :hide-bottom-space="hideBottomSpace"
      :placeholder="placeholder"
      :name="name"
      height="96px"
      @update:model-value="updateValue"
    />
  </div>
</template>

<script setup lang="ts">
import type { ValidationRule } from "quasar";
import { KTInput } from "#components";

interface Props {
  modelValue: string;
  rounded?: boolean;
  outlined?: boolean;
  label: string;
  required?: boolean;
  rules?: ValidationRule[];
  hideBottomSpace?: boolean;
  hideErrorIcon?: boolean;
  placeholder?: string;
  name?: string;
  autogrow?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  rounded: true,
  outlined: true,
  required: false,
  rules: () => [],
  type: "text",
  placeholder: "Введите текст",
  hideErrorIcon: true,
  hideBottomSpace: true,
  autogrow: true,
  name: "textarea"
});

const emits = defineEmits<{
  "update:modelValue": [string | number | null];
}>();

const inputValue = ref(props.modelValue);
const inputRef = ref();

function updateValue(value: string | number | null) {
  nextTick(() => {
    inputRef.value?.validate();
    emits("update:modelValue", value);
  });
}
</script>

<style lang="scss">
.c-textarea {
  .kt-input-main .q-field__control {
    height: auto;
    min-height: 96px;
    background-color: var(--app-green-050);
  }
}
</style>
