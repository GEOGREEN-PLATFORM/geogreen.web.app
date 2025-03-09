<template>
    <div class="kt-input-select">
        <q-select 
        :model-value="modelValue" 
        @update:model-value="selectValue"
        :options="props.options" 
        :outlined="outlined" 
        :label="label" 
        ref="qInputRef"
        :rounded="rounded"
        lazy-rules
        :no-error-icon="hideErrorIcon"
        :hide-bottom-space="hideBottomSpace"
        :placeholder="placeholder"
        :name="name"
        :option-value="optionValue"
        :option-label="optionLabel"
        />
    </div>
</template>

<script setup lang="ts">
import type { ValidationRule } from "quasar";

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
  options: {
    name: string;
    value: string;
  }[];
  height?: string;
  optionValue?: string;
  optionLabel?: string;
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  rounded: true,
  outlined: true,
  required: true,
  rules: () => [],
  placeholder: "Введите текст",
  hideErrorIcon: true,
  hideBottomSpace: false,
  height: "56px",
  optionValue: "value",
  optionLabel: "name",
});
const emits = defineEmits<{
  "update:modelValue": [string];
}>();
function selectValue(value: string) {
  emits("update:modelValue", value);
}
</script>

<style lang="scss">
.kt-input-select {
  width: 100%;
  .q-field--outlined.q-field--rounded .q-field__control {
    border-radius: 16px;
  }
  .q-field--outlined .q-field__control:before {
    border: 1px solid var(--app-grey-300);
  }
  .q-field--outlined .q-field__control:after {
    border: 1px solid transparent;
  }
  .q-field--outlined .q-field__control:hover:after {
    border-color: var(--app-green-300);
    border-width: 1px;
  }
  .q-field--outlined.q-field--highlighted .q-field__control:after {
    border-color: var(--app-green-500);
    border-width: 1px;
  }
  .q-field--outlined.q-field--highlighted.q-field--error
    .q-field__control:after {
    border-color: var(--app-red-500);
  }
  .q-field--outlined.q-field--highlighted.q-field--error {
    .q-field__label {
      color: var(--input-label);
    }
  }
  .q-field--outlined.q-field--highlighted.q-field--focused {
    .q-field__label {
      color: var(--app-green-500);
    }
  }
  .q-field__label {
    top: 50%;
    transform: translateY(-48%);
    color: var(--input-label);
  }
  .q-field--highlighted .q-field__label {
    color: currentColor;
  }
  .q-field--float .q-field__label {
    transform: translateY(-96%) scale(0.85);
  }
  .q-field__native:-webkit-autofill + .q-field__label,
  .q-field__input:-webkit-autofill + .q-field__label {
    transform: translateY(-96%) scale(0.85);
  }
  .q-field__native,
  .q-field__input {
    color: var(--app-grey-500);
    caret-color: var(--app-green-500);
  }
  .q-field--labeled .q-field__native {
    line-height: 20px;
  }
  .q-field__control {
    height: v-bind(height);
  }
  .q-field__marginal {
    height: v-bind(height);
  }
  input[type="password"]:not(:placeholder-shown) {
    font-family: Verdana;
    letter-spacing: 0.1em;
    color: var(--input-label);
  }
  input {
    font-size: 16px;
  }
  &:not(:has(.q-field--labeled)) .q-textarea .q-field__native {
    padding: 16px 0px;
  }
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    background-clip: text !important;
    -webkit-text-fill-color: var(--app-grey-500);
    box-shadow: inset 0 0 20px 20px transparent;
  }
}
</style>