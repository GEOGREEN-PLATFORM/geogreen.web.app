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
        @update:model-value="updateValue"
        height="96px"
      >
      </KTInput>
    </div>
  </template>
  
  <script setup lang="ts">
import { mdiEyeOffOutline, mdiEyeOutline } from "@quasar/extras/mdi-v6";
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
  modelValue: "",
  rounded: true,
  outlined: true,
  required: false,
  rules: () => [],
  type: "text",
  placeholder: "Введите текст",
  hideErrorIcon: true,
  hideBottomSpace: true,
  autogrow: true,
});

const emits = defineEmits<{
  "update:modelValue": [string | number | null];
}>();

const inputValue = ref(props.modelValue);
const showPassword = ref(false);
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
  