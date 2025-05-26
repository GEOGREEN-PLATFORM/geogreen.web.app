<template>
  <div class="c-textarea">
    <CInput
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
      :readonly="readonly"
      :name="name"
      @update:model-value="updateValue"
      @blur="emits('blur')"
      height="96px"
      :required="false"
      :maxLength="1000"
    >
    </CInput>
  </div>
</template>

<script setup lang="ts">
import type { ValidationRule } from "quasar";
import { CInput } from "#components";

interface Props {
  modelValue: string;
  rounded?: boolean;
  outlined?: boolean;
  label?: string;
  required?: boolean;
  rules?: ValidationRule[];
  hideBottomSpace?: boolean;
  hideErrorIcon?: boolean;
  placeholder?: string;
  name?: string;
  autogrow?: boolean;
  bgColor?: string;
  readonly?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  rounded: true,
  outlined: true,
  required: false,
  rules: () => [],
  type: "text",
  placeholder: "",
  hideErrorIcon: true,
  hideBottomSpace: true,
  autogrow: true,
  bgColor: "var(--app-green-050)",
});

const emits = defineEmits<{
  "update:modelValue": [string | number | null];
  blur: [];
}>();

const inputValue = ref(props.modelValue);
const showPassword = ref(false);
const inputRef = ref();

function updateValue(value: string | number | null) {
  nextTick(() => {
    inputRef.value.$refs.qInputRef?.validate();
    emits("update:modelValue", value);
  });
}
watch(
  () => props.modelValue,
  (newVal) => {
    inputValue.value = newVal;
  },
);
</script>

<style lang="scss">
.c-textarea {
  .c-input-main .q-field__control {
    height: auto;
    min-height: 96px;
    background-color: v-bind(bgColor);
  }
}
</style>
