<template>
  <div class="kt-input-main">
    <q-input
      ref="qInputRef"
      v-model="inputValue"
      :rounded="rounded"
      :outlined="outlined"
      :label="label"
      :type="currentType"
      :rules="rules"
      lazy-rules
      :no-error-icon="hideErrorIcon"
      :hide-bottom-space="hideBottomSpace"
      :placeholder="placeholder"
      :name="name"
      @update:model-value="updateValue"
    >
      <template #append>
        <q-icon
          v-if="type === 'password'"
          :name="showPassword ? mdiEyeOutline : mdiEyeOffOutline"
          class="cursor-pointer"
          @click="togglePassword"
        />
      </template>
    </q-input>
  </div>
</template>

<script setup lang="ts">
import { mdiEyeOffOutline, mdiEyeOutline } from "@quasar/extras/mdi-v6";
import type { ValidationRule } from "quasar";

interface Props {
  modelValue: string;
  rounded?: boolean;
  outlined?: boolean;
  label: string;
  type?:
    | "number"
    | "password"
    | "search"
    | "time"
    | "text"
    | "email"
    | "tel"
    | "file"
    | "url"
    | "date"
    | "datetime-local"
    | undefined;
  required?: boolean;
  rules?: ValidationRule[];
  hideBottomSpace?: boolean;
  hideErrorIcon?: boolean;
  placeholder?: string;
  name?: string;
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  rounded: true,
  outlined: true,
  required: true,
  rules: () => [
    (val) => (val && val.length > 0) || "Поле не может быть пустым",
  ],
  type: "text",
  label: "Метка",
  placeholder: "Введите текст",
  hideErrorIcon: true,
  hideBottomSpace: true,
});

const emits = defineEmits<{
  "update:modelValue": [string | number | null];
}>();

const inputValue = ref(props.modelValue);
const showPassword = ref(false);
const currentType = ref(props.type);
const qInputRef = ref();

function updateValue(value: string | number | null) {
  nextTick(() => {
    qInputRef.value?.validate();
    emits("update:modelValue", value);
  });
}
function togglePassword() {
  showPassword.value = !showPassword.value;
  currentType.value = showPassword.value ? "text" : "password";
}
</script>

<style lang="scss">
.kt-input-main {
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
    top: 18px;
    color: var(--input-label);
  }
  .q-field--highlighted .q-field__label {
    color: currentColor;
  }
  .q-field--float .q-field__label {
    transform: translateY(-48%) scale(0.85);
  }
  .q-field__native:-webkit-autofill + .q-field__label,
  .q-field__input:-webkit-autofill + .q-field__label {
    transform: translateY(-48%) scale(0.85);
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
    height: 56px;
  }
  .q-field__marginal {
    height: 56px;
  }
  input[type="password"]:not(:placeholder-shown) {
    font-family: Verdana;
    letter-spacing: 0.1em;
    color: var(--input-label);
  }
  input {
    font-size: 16px;
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
