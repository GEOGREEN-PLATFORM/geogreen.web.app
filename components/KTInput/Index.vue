<template>
  <div
    class="kt-input-main"
    :class="{
      required: required,
    }"
  >
    <q-input
      ref="qInputRef"
      v-model="inputValue"
      :rounded="rounded"
      :outlined="outlined"
      :label="label"
      :type="currentType"
      :rules="validationRules"
      lazy-rules
      :no-error-icon="hideErrorIcon"
      :hide-bottom-space="hideBottomSpace"
      :placeholder="placeholder"
      :name="name"
      @update:model-value="updateValue"
      :autogrow="autogrow"
      :autocomplete="autocomplete"
      :mask="maska"
      :hint="hint"
      :readonly="readonly"
    >
      <template #append>
        <slot name="append">
          <q-icon
            v-if="type === 'password'"
            :name="showPassword ? mdiEyeOutline : mdiEyeOffOutline"
            class="cursor-pointer"
            @click="togglePassword"
          />
        </slot>
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
  label?: string;
  type?:
    | "number"
    | "password"
    | "search"
    | "time"
    | "text"
    | "email"
    | "textarea"
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
  autogrow?: boolean;
  autocomplete?: string;
  maska?: string;
  height?: string;
  hint?: string;
  readonly?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  rounded: true,
  outlined: true,
  required: true,
  rules: () => [],
  type: "text",
  placeholder: "Введите текст",
  hideErrorIcon: true,
  hideBottomSpace: false,
  autogrow: false,
  height: "56px",
});

const emits = defineEmits<{
  "update:modelValue": [string | number];
}>();

const showPassword = ref(false);
const currentType = ref(props.type);
const inputValue = ref("");
const qInputRef = ref();
const validationRules = ref<ValidationRule[]>([]);

function updateValue(value: string | number | null) {
  nextTick(() => {
    qInputRef.value?.validate();
    emits("update:modelValue", value || "");
  });
}
function togglePassword() {
  showPassword.value = !showPassword.value;
  currentType.value = showPassword.value ? "text" : "password";
}
onMounted(() => {
  inputValue.value = props.modelValue;
  if (props.required) {
    validationRules.value = [
      (val) => (val && val.length > 0) || "Поле не может быть пустым",
    ];
  } else {
    validationRules.value = props.rules;
  }
});
watch(
  () => props.modelValue,
  (newVal) => {
    inputValue.value = newVal;
  },
);
</script>

<style lang="scss">
.kt-input-main {
  width: 100%;
  min-height: v-bind(height);
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
  .q-field--outlined .q-field__control:hover:before {
    border: 1px solid transparent;
  }
  .q-field--outlined.q-field--highlighted .q-field__control:after {
    border-color: var(--app-green-500);
    border-width: 1px;
  }
  .q-field--outlined.q-field--highlighted .q-field__control:before {
    border: 1px solid transparent;
  }
  .q-field--outlined.q-field--highlighted.q-field--error .q-field__control:after {
    border-color: var(--app-red-500);
  }
  .q-field--outlined.q-field--highlighted.q-field--error .q-field__control:before {
    border-color: transparent;
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
    transform: translateY(-50%) scale(1);
    color: var(--input-label);
    will-change: transform;
    transition:
      transform 0.36s cubic-bezier(0.4, 0, 0.2, 1),
      max-width 0.324s cubic-bezier(0.4, 0, 0.2, 1),
      color 0.3s ease;
  }
  .q-field--highlighted .q-field__label {
    color: currentColor;
  }
  .q-field--float .q-field__label {
    transform: translateY(-100%) scale(0.85);
  }
  .q-field__native:-webkit-autofill + .q-field__label,
  .q-field__input:-webkit-autofill + .q-field__label {
    transform: translateY(-100%) scale(0.85);
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
.kt-input-main.required {
  .q-field__label {
    &::after {
      content: "*";
      color: var(--app-red-500);
    }
  }
}
</style>
